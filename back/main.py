from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import os
import redis.asyncio as redis
import json
import random
import asyncio
import torch
from transformer_lens import HookedTransformer
from sae_lens import SAE
from mistral_common.protocol.instruct.messages import UserMessage, AssistantMessage
from mistral_common.protocol.instruct.request import ChatCompletionRequest

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis client
redis_client = redis.Redis.from_url(os.environ.get("REDIS_URL", "redis://localhost:6379"))

# Feature Data Model
class Feature(BaseModel):
    index: int
    title: str
    description: str
    usefulness: float
    confidence: float
    mean_activation: float
    emoji: str
    value: bool = False

# Load features from explanations.json
with open('act-cache/explanations.json', 'r') as f:
    explanations = json.load(f)
    features_list = [Feature(**feature) for feature in explanations]

# Load Models (Load once during server startup)
device = "cuda" if torch.cuda.is_available() else "cpu"
SAE_PATH = "tylercosgrove/mistral-7b-sparse-autoencoder-layer16"
STEERING_ON = True
coeff = 500
sampling_kwargs = dict(temperature=0.3, top_p=0.1, freq_penalty=1.0)
MISTRAL_MODEL_PATH = "mistral-7b-instruct"

print("Loading Model...")
model = HookedTransformer.from_pretrained(MISTRAL_MODEL_PATH, dtype=torch.float16, device=device)
sae, cfg_dict, sparsity = SAE.from_pretrained(
    release=SAE_PATH,
    sae_id=".",
    device=device
)
print("Model Loaded!\n")

model.eval()

# Function for generating responses with hooks
def hooked_generate(prompt_batch, fwd_hooks=[], seed=None, **kwargs):
    if seed is not None:
        torch.manual_seed(seed)

    with model.hooks(fwd_hooks=fwd_hooks):
        tokenized = model.to_tokens(prompt_batch)
        result = model.generate(
            stop_at_eos=True,
            input=tokenized,
            max_new_tokens=128,
            do_sample=True,
            **kwargs)
    return result

# Hook function to apply steering vector
def steering_hook(resid_pre, hook):
    if resid_pre.shape[1] == 1:
        return

    if STEERING_ON:
        resid_pre += coeff * steering_vector

# Endpoint to get features
@app.get("/api/get-features")
async def get_features():
    return {"features": [feature.dict() for feature in features_list]}

# Endpoint to get chat list
@app.get("/api/chat-list")
async def chat_list(uuid: str):
    # Retrieve chat history from Redis
    chat_data = await redis_client.json().get(f"chat:{uuid}")
    if not chat_data:
        # Initialize chat data if not present
        chat_data = {"left": [], "right": []}
        await redis_client.json().set(f"chat:{uuid}", '$', chat_data)
    return chat_data

# Endpoint for recommend-neuron
@app.get("/api/recommend-neuron")
async def recommend_neuron(uuid: str):
    # Simulate selecting 100 random features
    random_features = random.sample(features_list, min(len(features_list), 100))
    titles = [feature.title for feature in random_features]

    # Simulate sending request to Mistral and getting indices
    # For demonstration, we will randomly select 3 feature indices
    selected_features = random.sample(random_features, 3)
    indices = [feature.index for feature in selected_features]

    # Map indices to titles
    index_title_map = {feature.index: feature.title for feature in selected_features}

    return {"indices": indices, "index_title_map": index_title_map}

# Endpoint for Activation Engineered Chat (act-gen)
@app.post("/api/act-gen")
async def act_gen(request: Request):
    data = await request.json()
    uuid_param = request.query_params.get('uuid')
    uuid_value = uuid_param if uuid_param else str(uuid.uuid4())
    user_input = data.get('message', '')

    # Apply hook and generate response
    model.reset_hooks()
    # Here you need to set the FEATURE_INDEX based on the features selected
    # For simplicity, we'll use a fixed index
    FEATURE_INDEX = 79557  # Replace with actual feature index

    steering_vector = sae.W_dec[FEATURE_INDEX]

    editing_hooks = [(sae.cfg.hook_name, steering_hook)]
    response_tokens = hooked_generate([user_input], editing_hooks, seed=None, **sampling_kwargs)
    response_str = model.to_string(response_tokens[:, 1:])[0]

    # Save to Redis
    chat_data = await redis_client.json().get(f"chat:{uuid_value}")
    if not chat_data:
        chat_data = {"left": [], "right": []}
    chat_data["left"].append({"query": user_input, "response": response_str})
    await redis_client.json().set(f"chat:{uuid_value}", '$', chat_data)

    return JSONResponse(content={"response": response_str})

# Endpoint for Prompt Engineered Chat (prompt-gen)
@app.post("/api/prompt-gen")
async def prompt_gen(request: Request):
    data = await request.json()
    uuid_param = request.query_params.get('uuid')
    uuid_value = uuid_param if uuid_param else str(uuid.uuid4())
    user_input = data.get('message', '')

    # Generate response without hooks
    response_tokens = hooked_generate([user_input], seed=None, **sampling_kwargs)
    response_str = model.to_string(response_tokens[:, 1:])[0]

    # Save to Redis
    chat_data = await redis_client.json().get(f"chat:{uuid_value}")
    if not chat_data:
        chat_data = {"left": [], "right": []}
    chat_data["right"].append({"query": user_input, "response": response_str})
    await redis_client.json().set(f"chat:{uuid_value}", '$', chat_data)

    return JSONResponse(content={"response": response_str})

# Endpoint for chat-report
@app.get("/api/chat-report")
async def chat_report(uuid: str):
    # Retrieve chat data and generate report
    chat_data = await redis_client.json().get(f"chat:{uuid}")
    if not chat_data:
        return {"features": []}

    # For demonstration, return the features used
    # In a real scenario, you'd analyze the chat history to generate the report
    report_features = features_list[:3]  # Replace with actual report data
    return {"features": [feature.dict() for feature in report_features]}
