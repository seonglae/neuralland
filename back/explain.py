import os
import json
import torch
import concurrent.futures
import zstandard as zstd
import io
import pickle  # For caching
from transformers import AutoTokenizer
from transformer_lens import HookedTransformer, ActivationCache
from sae_lens import SAE
from mistralai import Mistral
from tqdm import tqdm  # For progress bars

# Configuration variables
batch_size = 1  # Adjust as needed
data_path = 'pile-uncopyrighted/test/val.jsonl.zst'  # Replace with the actual data path
mistral_models_path = 'Mistral-7B-Instruct-v0.3'  # Replace with the actual model path
target_layer = "blocks.16.hook_resid_pre"  # Layer to get activations from
d_model = 4096  # Model's hidden size
api_key = os.environ["MISTRAL_API_KEY"]
model_name = "mistral-large-latest"
cache_dir = 'act-cache'  # Directory to store cached activations and tokens
output_file = os.path.join(cache_dir, 'explanations.json')

# Ensure the cache directory exists
os.makedirs(cache_dir, exist_ok=True)

# Initialize Mistral API client
client = Mistral(api_key=api_key)

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained('Mistral-7B-Instruct-v0.3')
model = HookedTransformer.from_pretrained("mistral-7b-instruct", dtype="float16", device="cuda")
sae, cfg_dict, sparsity = SAE.from_pretrained(
    release="tylercosgrove/mistral-7b-sparse-autoencoder-layer16",
    sae_id=".",
    device="cuda"
)

model.eval()

# Class to read data from compressed .jsonl.zst files
class CompressedJSONLLoader:
    def __init__(self, file_path, batch_size=1):
        self.file_path = file_path
        self.batch_size = batch_size
        self.file = None
        self.dctx = None
        self.stream_reader = None
        self.text_stream = None
        self._open_file()

    def _open_file(self):
        self.file = open(self.file_path, "rb")
        self.dctx = zstd.ZstdDecompressor()
        self.stream_reader = self.dctx.stream_reader(self.file)
        self.text_stream = io.TextIOWrapper(self.stream_reader, encoding="utf-8")

    def __iter__(self):
        return self

    def __next__(self):
        batch = []
        for _ in range(self.batch_size):
            try:
                line = next(self.text_stream)
                obj = json.loads(line.strip())
                text = obj["text"]
                batch.append(text)
            except StopIteration:
                self.close()
                if batch:
                    return batch
                else:
                    raise StopIteration
        return batch

    def close(self):
        if self.file:
            self.file.close()

# Function to create the interpretability prompt and send the request
def get_feature_description(feature_idx, contexts, mean_activation):
    # contexts is a list of tuples: (tokens, activations)
    activations_str = ''
    prompt_str = ''
    for tokens, activations in contexts:
        tokens = [token.replace('▁', ' ') for token in tokens]
        activations = [int((activation + 1) * 5) for activation in activations]
        prompt_str += ''.join([f"{token}" for token in tokens])
        tokens_str = '\n'.join([f"{token}\t{activation_value:.4f}" for token, activation_value in zip(tokens, activations)])
        activations_str += f"<start>\n{tokens_str}\n<end>\n"

    # Adjusted prompt to request a short description
    prompt = f"""We're studying neurons in a neural network.
Each neuron looks for some particular thing in a short document.
Look at summary of what the neuron does, and try to predict how it will fire on each token.
Please provide a brief description of what neuron {feature_idx} is detecting.
The activation format is token<tab>activation, activations go from 0 to 10, "unknown" indicates an unknown activation. Most activations will be 0.
Return your answer as a short JSON object with keys "description", "title" (short noun description of neuron), "mean_activation" of neuron {feature_idx}, "useful" (0-1), single "emoji" represents features well, and "confidence" (0-1).

Activations:
{activations_str}

Prompts:
{prompt_str}
"""

    # Send prompt to Mistral API and get the description
    messages = [
        {
            "role": "user",
            "content": prompt,
        },
    ]
    print(f"Prompt: {prompt}")
    try:
        chat_response = client.chat.complete(
            model=model_name,
            messages=messages,
            response_format={
                "type": "json_object",
            }
        )
        response = json.loads(chat_response.choices[0].message.content.strip())
        print(f"Description: {response['description']}")
    except Exception as e:
        print(f"Error for feature {feature_idx}: {e}")
        response = {'description': 'Error', 'title': 'Error', 'mean_activation': mean_activation}
    return {'index': feature_idx, 'emoji': response['emoji'], 'description': response['description'], 'title': response['title'], 'mean_activation': mean_activation, 'useful': response['useful'], 'confidence': response['confidence'], 'contexts': contexts }


# Function wrapper for asynchronous execution
def get_feature_description_wrapper(args):
    feature_idx, contexts, mean_activation, useful, confidence = args
    return get_feature_description(feature_idx, contexts, mean_activation)


# Main processing loop
data_loader = CompressedJSONLLoader(data_path, batch_size=batch_size)
feature_contexts = {}  # Dictionary to store contexts per feature
all_high_activations = []  # List to keep track of top activations across batches

print("Starting to process data...")
max_contexts_per_feature = 50  # Limit the number of contexts per feature
window_size = 10  # Number of tokens before and after the high activation token

# Get feature indices from the SAE model
num_features = cfg_dict['d_sae']  # Get the number of features from the SAE configuration
feature_indices = range(cfg_dict['d_sae'])  # Use range of d_sae as feature indices

for batch_idx, batch in enumerate(tqdm(data_loader, desc="Processing batches", unit="batch")):
    cache_file = os.path.join(cache_dir, f'{os.path.basename(data_path)}_{batch_idx}.pkl')

    if os.path.exists(cache_file):
        # Load tokens_list and activations_list from the cache
        with open(cache_file, 'rb') as f:
            tokens_list, activations_list = pickle.load(f)
        print(f"Loaded batch {batch_idx} from cache.")
    else:
        tokens_list = []
        activations_list = []
        for text_idx, text in enumerate(batch):
            # Tokenize text
            encoding = tokenizer(text, return_tensors='pt', truncation=True, max_length=512).to('cuda')
            input_ids = encoding['input_ids']  # Shape: [batch_size, sequence_length]

            # Get activations from the model
            with torch.no_grad():
                _, cache = model.run_with_cache(input_ids)
                activations = cache[target_layer]  # Extract activations at the target layer
                activations = activations.squeeze(0).cpu()  # Shape: [sequence_length, d_model]

            # Convert activations and tokens to lists for saving
            activations = sae.encode_standard(activations)  # Use SAE to encode activations into sparse features
            activations = activations.to(torch.float32).numpy()
            input_ids = input_ids.cpu().numpy()[0]  # Shape: [sequence_length]
            tokens = tokenizer.convert_ids_to_tokens(input_ids)

            tokens_list.append(tokens)
            activations_list.append(activations)

        # Save tokens_list and activations_list to the cache
        with open(cache_file, 'wb') as f:
            pickle.dump((tokens_list, activations_list), f)
        print(f"Saved batch {batch_idx} to cache.")

    # Now process the tokens and activations
    batch_high_activations = []
    for tokens, activations in zip(tokens_list, activations_list):
        for feature_idx in feature_indices:
            # Initialize contexts list for the feature if not already done
            if feature_idx not in feature_contexts:
                feature_contexts[feature_idx] = []

            # Get activation values for each feature
            feature_activations = activations[:, feature_idx]  # Shape: [sequence_length]
            mean_activation = feature_activations.mean()  # Calculate mean activation

            # Find tokens with high activation values (top 5 per batch)
            top_k = 5  # Top 5 tokens per batch
            high_activation_indices = feature_activations.argsort()[::-1][:top_k]

            for idx in high_activation_indices:
                # Get context around this token
                start = max(idx - window_size, 0)
                end = min(idx + window_size + 1, len(tokens))  # +1 because end index is exclusive
                context_tokens = tokens[start:end]
                context_activations = feature_activations[start:end]

                # Store context for the feature
                if len(feature_contexts[feature_idx]) < max_contexts_per_feature:
                    feature_contexts[feature_idx].append((context_tokens, context_activations, mean_activation))

                # Add to batch high activations list
                batch_high_activations.append((feature_idx, context_tokens, context_activations, feature_activations[idx]))

    for feature_idx, context_tokens, context_activations, activation_value in batch_high_activations:
        all_high_activations[feature_idx].append((feature_idx, context_tokens, context_activations, activation_value))
        all_high_activations[feature_idx] = sorted(all_high_activations[feature_idx], key=lambda x: x[3], reverse=True)[:10]

    # Optional: Limit the number of batches to process for testing
    # if batch_idx + 1 >= 5:
    #     break
    break  # Remove this 'break' if you want to process all batches

print("Finished processing data.")

# Prepare arguments for asynchronous execution
feature_args = []
for feature_idx, activations in enumerate(all_high_activations):
    for feature in activations:
        feature_idx, context_tokens, context_activations, activation_value = feature
    mean_activation = sum(context_activations) / len(context_activations) if len([a for a in context_activations if a > 0]) > 0 else 0.0
    
    feature_args.append((feature_idx, [(context_tokens, context_activations)], mean_activation))

# Get descriptions for each feature
results = []
print("Starting to get feature descriptions...")
max_workers = 10  # Number of parallel requests
with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
    futures = {executor.submit(get_feature_description_wrapper, args): args[0] for args in feature_args}
    for future in tqdm(concurrent.futures.as_completed(futures), total=len(futures), desc="Processing features", unit="feature"):
        feature_idx = futures[future]
        try:
            result = future.result()
            results.append(result)
        except Exception as e:
            print(f"Error processing feature {feature_idx}: {e}")
        
print("Finished getting feature descriptions.")

# Save results to JSON
with open(output_file, 'w') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Results saved to '{output_file}'.")