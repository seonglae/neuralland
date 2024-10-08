import os
import json
import torch
import zstandard as zstd
import io
from transformers import AutoTokenizer
from mistral_sae.generate import get_input_activations_at_layer
from mistral_sae.model import SteerableTransformer
from mistralai import Mistral
from tqdm import tqdm  # For progress bars

# Configuration variables
batch_size = 4096  # Adjust as needed
data_path = 'pile-uncopyrighted/test/val.jsonl.zst'  # Replace with the actual data path
mistral_models_path = 'Mistral-7B-Instruct-v0.3'  # Replace with the actual model path
target_layer = 16  # Layer to get activations from
d_model = 4096  # Model's hidden size
api_key = os.environ["MISTRAL_API_KEY"]
model_name = "mistral-large-latest"
output_file = 'feature_descriptions.json'

# Initialize Mistral API client
client = Mistral(api_key=api_key)

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained('Mistral-7B-Instruct-v0.3')
model = SteerableTransformer.from_folder(mistral_models_path).cuda()
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
def get_feature_description(feature_idx, contexts):
    # contexts is a list of lists of tokens
    activations_str = ''
    for context in contexts:
        tokens_str = '\n'.join([f"{token}\tunknown" for token in context])
        activations_str += f"<start>\n{tokens_str}\n<end>\n"
    prompt = f"""We're studying neurons in a neural network.
Each neuron looks for some particular thing in a short document.
Look at the summary of what the neuron does, and try to predict how it will fire on each token.

The activation format is token<tab>activation, activations go from 0 to 10, "unknown" indicates an unknown activation. Most activations will be 0.

Neuron {feature_idx}
Explanation of neuron {feature_idx} behavior: The main thing this neuron does is [provide a description].
Activations:
{activations_str}
"""

    # Send prompt to Mistral API and get the description
    messages = [
        {
            "role": "user",
            "content": prompt,
        },
    ]
    try:
        chat_response = client.chat.complete(
            model=model_name,
            messages=messages,
        )
        response_content = chat_response.choices[0].message.content
        description = response_content.strip()
    except Exception as e:
        print(f"Error for feature {feature_idx}: {e}")
        description = f"Error: {e}"
    return description

# Main processing loop
data_loader = CompressedJSONLLoader(data_path, batch_size=batch_size)
feature_contexts = {}  # Dictionary to store contexts per feature

print("Starting to process data...")
max_contexts_per_feature = 50  # Limit the number of contexts per feature
window_size = 10  # Number of tokens before and after the high activation token

for batch_idx, batch in enumerate(tqdm(data_loader, desc="Processing batches", unit="batch")):
    for text_idx, text in enumerate(batch):
        # Tokenize text
        encoding = tokenizer(text, return_tensors='pt', truncation=True, max_length=512).to('cuda')
        input_ids = encoding['input_ids']  # Shape: [batch_size, sequence_length]

        # Get activations from the model
        with torch.no_grad():
            activations = get_input_activations_at_layer(
                input_ids.tolist(),
                model,
                target_layer=target_layer
            ).cpu()  # Shape: [sequence_length, d_model]

        # Map activations to tokens
        activations = activations.to(torch.float32).numpy()
        input_ids = input_ids.cpu().numpy()[0]  # Shape: [sequence_length]
        tokens = tokenizer.convert_ids_to_tokens(input_ids)

        num_features = activations.shape[1]
        for feature_idx in range(num_features):
            # Initialize contexts list for the feature if not already done
            if feature_idx not in feature_contexts:
                feature_contexts[feature_idx] = []

            # Skip if we already have enough contexts for this feature
            if len(feature_contexts[feature_idx]) >= max_contexts_per_feature:
                continue

            # Get activation values for each feature
            feature_activations = activations[:, feature_idx]  # Shape: [sequence_length]
            # Find tokens with high activation values
            top_k = 5  # Top 5 tokens
            high_activation_indices = feature_activations.argsort()[::-1][:top_k]

            for idx in high_activation_indices:
                # Get context around this token
                start = max(idx - window_size, 0)
                end = min(idx + window_size + 1, len(tokens))  # +1 because end index is exclusive
                context_tokens = tokens[start:end]

                # Store context for the feature
                if len(feature_contexts[feature_idx]) < max_contexts_per_feature:
                    feature_contexts[feature_idx].append(context_tokens)

    # Optional: Limit the number of batches to process for testing
    # if batch_idx + 1 >= 5:
    #     break

print("Finished processing data.")

# Get descriptions for each feature
results = []
print("Starting to get feature descriptions...")
for feature_idx, contexts in tqdm(feature_contexts.items(), desc="Processing features", unit="feature"):
    description = get_feature_description(feature_idx, contexts)
    results.append({'feature_idx': feature_idx, 'description': description})

print("Finished getting feature descriptions.")

# Save results to JSON
with open(output_file, 'w') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Results saved to '{output_file}'.")
