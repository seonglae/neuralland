from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import os
import redis.asyncio as redis
import json
from mistralai import Mistral
import random
import torch
from transformer_lens import HookedTransformer
from sae_lens import SAE

# Feature Data Model
class Feature(BaseModel):
    index: int
    title: str
    description: str
    useful: float
    confidence: float
    mean_activation: float
    emoji: str

# Chat Data Model
class ChatHistoryItem(BaseModel):
    query: str
    prompt_res: str
    act_res: str

class Chat(BaseModel):
    id: str
    title: str
    history: list[ChatHistoryItem] = []


# Load features from explanations.json
model_name = "mistral-large-latest"
api_key = os.environ["MISTRAL_API_KEY"]
client = Mistral(api_key=api_key)

device = "cuda" if torch.cuda.is_available() else "cpu"
SAE_PATH = "tylercosgrove/mistral-7b-sparse-autoencoder-layer16"
STEERING_ON = True
coeff = 500
sampling_kwargs = dict(temperature=0.3, top_p=0.1, freq_penalty=1.0)
MISTRAL_MODEL_PATH = "mistral-7b-instruct"

# Initialize Redis client
redis_client = redis.Redis.from_url(os.environ.get("REDIS_URL"))
app = FastAPI()
with open('act-cache/explanations.json', 'r') as f:
    explanations = json.load(f)
    features_list = [Feature(**feature) for feature in explanations]

# Load Models (Load once during server startup)
print("Loading Model...")
model = HookedTransformer.from_pretrained(MISTRAL_MODEL_PATH, dtype=torch.float16, device=device)
sae, cfg_dict, sparsity = SAE.from_pretrained(
    release=SAE_PATH,
    sae_id=".",
    device=device
)
model.eval()
print("Model Loaded!\n")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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

# Endpoint to get features
@app.get("/api/get-features")
async def get_features():
    return {"features": [feature.dict() for feature in features_list]}

@app.get("/api/chat-list")
async def chat_list(uuid: str):
    # Retrieve chat history from Redis
    chat_data = await redis_client.json().get(f"chat:{uuid}")
    if not chat_data:
        return []
    return chat_data

@app.get("/api/recommend-neuron")
async def recommend_neuron(uuid: str):
    # Get the chat history or context for the user (you can customize how the context is used)
    chat_data = await redis_client.json().get(f"chat:{uuid}")
    if not chat_data:
        return {"error": "No chat history found"}

    # Use the last user message or a summary of the context to send to the AI model
    context = chat_data["history"][-1]["query"] if chat_data["history"] else "No context"

    # Randomly sample 100 features from the features_list
    random_features = random.sample(features_list, min(len(features_list), 100))

    # Create a formatted string with "index: title" for each random feature
    features_prompt = "\n".join([f"{feature.index}: {feature.title}" for feature in random_features])

    # Create a prompt to ask the model which neurons/features are relevant
    prompt = (
        f"Based on the following context, recommend up to 5 neuron features for activation tuning:\n\n"
        f"Context: {context}\n\n"
        f"Here are 100 features (index: title):\n{features_prompt}\n\n"
        f"nRespond with the top 5 relevant int index list with key 'indices'."
    )

    # Send prompt to the AI model
    messages = [
        {
            "role": "user",
            "content": prompt,
        },
    ]

    try:
        # Replace with your Mistral or other model call
        chat_response = client.chat.complete(
            model=model_name,  # The model you're using for this task
            messages=messages,
            response_format={"type": "json_object"},  # Expecting a JSON array
        )

        # Parse the response to get the list of recommended features
        res_object = json.loads(chat_response.choices[0].message.content.strip())

        # Return the recommended features (assuming response contains index and title)
        return {"indices": res_object["indices"]}

    except Exception as e:
        print(f"Error getting neuron recommendations: {e}")
        return {"error": "Failed to get neuron recommendations"}

# Hook function to apply steering vector dynamically passed as an argument
def steering_hook(resid_pre, hook, steering_vector, coeff=500):
    if resid_pre.shape[1] == 1:
        return  # Don't apply steering if it's a single token (e.g., EOS)

    if STEERING_ON and steering_vector is not None:
        resid_pre += coeff * steering_vector

        
# /api/act-gen endpoint for activation-engineered chat
@app.post("/api/act-gen")
async def act_gen(request: Request):
    data = await request.json()
    uuid_param = request.query_params.get('uuid')
    uuid_value = uuid_param if uuid_param else str(uuid.uuid4())
    user_input = data.get('message', '')
    
    # Get the feature index from the request (passed in body)
    selected_feature_index = data.get('feature_index', 79557)  # Default feature index if none is provided

    # Retrieve the steering vector for the selected feature
    steering_vector = sae.W_dec[selected_feature_index]

    # Apply the steering vector using the hook, passing it as an argument
    model.reset_hooks()
    editing_hooks = [(sae.cfg.hook_name, lambda resid_pre, hook: steering_hook(resid_pre, hook, steering_vector=steering_vector, coeff=coeff))]
    
    # Generate the response with the modified steering vector
    response_tokens = hooked_generate([user_input], editing_hooks, seed=None, **sampling_kwargs)
    act_res = model.to_string(response_tokens[:, 1:])[0]
    

    return JSONResponse(content={"response": act_res})

# /api/prompt-gen endpoint for prompt-engineered chat
@app.post("/api/prompt-gen")
async def prompt_gen(request: Request):
    data = await request.json()
    uuid_param = request.query_params.get('uuid')
    uuid_value = uuid_param if uuid_param else str(uuid.uuid4())
    user_input = data.get('message', '')

    # Generate response without hooks
    response_tokens = hooked_generate([user_input], seed=None, **sampling_kwargs)
    prompt_res = model.to_string(response_tokens[:, 1:])[0]


    return JSONResponse(content={"response": prompt_res})


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
