import os
import json
import torch
import zstandard as zstd
import io

from transformers import AutoTokenizer
from mistralai import Mistral
from mistral_sae.sae import SparseAutoencoder


D_MODEL = 4096
D_HIDDEN = 131072

# Load the SAE model
sae = SparseAutoencoder(D_MODEL, D_HIDDEN)
sae_model_path = 'sae.pth'
sae = sae.load_state_dict(torch.load(sae_model_path))
sae = sae.eval()

# Initialize Mistral API client
api_key = os.environ["MISTRAL_API_KEY"]
model_name = "mistral-large-latest"

# Load the tokenizer
tokenizer = AutoTokenizer.from_pretrained('Mistral-7B-Instruct-v0.3')
client = Mistral(api_key=api_key)

# Data loader class to read from compressed .jsonl.zst files
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

# Function to create the interpretability prompt
def create_interpretability_prompt(explanation, tokens):
    prompt = """We're studying neurons in a neural network.
Each neuron looks for some particular thing in a short document.
Look at summary of what the neuron does, and try to predict how it will fire on each token.

The activation format is token<tab>activation, activations go from 0 to 10, "unknown" indicates an unknown activation. Most activations will be 0.


Neuron 1
Explanation of neuron 1 behavior: the main thing this neuron does is find vowels
Activations: 
<start>
a\t10
b\t0
c\t0
<end>
<start>
d\tunknown
e\t10
f\t0
<end>


Neuron 2
Explanation of neuron 2 behavior: the main thing this neuron does is {}
Activations: 
<start>
""".format(explanation)

    # Add tokens with 'unknown' activation
    for token in tokens:
        prompt += f"{token}\tunknown\n"
    prompt += "<end>\n"

    return prompt

# Main loop
data_path = 'pile-uncopyrighted/test/val.jsonl.zst'  # Replace with your actual data path
batch_size = 1  # Adjust the batch size as needed
data_loader = CompressedJSONLLoader(data_path, batch_size=batch_size)

for batch in data_loader:
    for text in batch:
        # Tokenize the text
        tokens = tokenizer.tokenize(text)
        # Convert tokens to IDs
        token_ids = tokenizer.convert_tokens_to_ids(tokens)
        input_ids = torch.tensor(token_ids).unsqueeze(0).to('cuda')  # Batch size 1

        # Get activations from SAE model
        with torch.no_grad():
            activations = sae(input_ids)
            activations = activations.squeeze(0)  # [num_features, sequence_length]

        num_features = activations.shape[0]
        for feature_idx in range(num_features):
            feature_activations = activations[feature_idx, :].cpu().numpy()
            explanation = f"find feature {feature_idx}"
            prompt = create_interpretability_prompt(explanation, tokens)
            messages = [
                {
                    "role": "user",
                    "content": prompt,
                },
            ]

            # Send the prompt to the Mistral API
            try:
                chat_response = client.chat.complete(
                    model=model_name,
                    messages=messages,
                )
                response_content = chat_response.choices[0].message.content
                # Process the response content
                print(f"Feature {feature_idx} response:")
                print(response_content)
            except Exception as e:
                print(f"Error for feature {feature_idx}: {e}")
