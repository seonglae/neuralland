from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import redis.asyncio as redis

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
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Feature Data Model
class Feature(BaseModel):
    index: int
    title: str
    description: str
    value: bool
    emoji: str

# In-memory feature list (replace with your data source)
features_list = [
    Feature(index=0, title="Feature 1", description="Description of Feature 1", value=False, emoji="🔥"),
    Feature(index=1, title="Feature 2", description="Description of Feature 2", value=False, emoji="🌊"),
    # Add more features as needed
]

@app.get("/api/get-features")
async def get_features():
    return {"features": [feature.dict() for feature in features_list]}

@app.get("/api/chat-list")
async def chat_list(uuid: str):
    # Retrieve chat history from Redis
    left_messages = await redis_client.lrange(f"chat:{uuid}:left", 0, -1)
    right_messages = await redis_client.lrange(f"chat:{uuid}:right", 0, -1)
    return {
        "left": [msg.decode('utf-8') for msg in left_messages],
        "right": [msg.decode('utf-8') for msg in right_messages],
    }

@app.get("/api/recommend-neuron")
async def recommend_neuron(uuid: str):
    # For simplicity, return the first few features
    return {"features": [feature.dict() for feature in features_list[:3]]}

@app.get("/api/chat-report")
async def chat_report(uuid: str):
    # Return some dummy report data
    report_features = features_list[:3]  # Replace with actual report data
    return {"features": [feature.dict() for feature in report_features]}

# Endpoint for act-gen (Activation Engineered Chat)
@app.websocket("/api/act-gen")
async def websocket_endpoint_act_gen(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Simulate processing and generate a response
            response_text = f"Activation Engineered Response to: {data}"
            # Save to Redis
            uuid = websocket.query_params.get('uuid')
            await redis_client.rpush(f"chat:{uuid}:left", response_text)
            # Send response
            await websocket.send_text(response_text)
    except WebSocketDisconnect:
        pass

# Endpoint for prompt-gen (Prompt Engineered Chat)
@app.websocket("/api/prompt-gen")
async def websocket_endpoint_prompt_gen(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Simulate processing and generate a response
            response_text = f"Prompt Engineered Response to: {data}"
            # Save to Redis
            uuid = websocket.query_params.get('uuid')
            await redis_client.rpush(f"chat:{uuid}:right", response_text)
            # Send response
            await websocket.send_text(response_text)
    except WebSocketDisconnect:
        pass