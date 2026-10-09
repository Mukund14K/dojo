from fastapi import FastAPI
from .schemas import ChatRequest, ChatResponse, Scenario
from .logic import process_chat, SCENARIOS
from typing import List

app = FastAPI(title="Banking API Target", description="A simulated banking API for DOJO tests.")

@app.get("/api/scenarios", response_model=List[Scenario])
def get_scenarios():
    return SCENARIOS

@app.post("/api/chat/vulnerable", response_model=ChatResponse)
def chat_vulnerable(request: ChatRequest):
    return ChatResponse(**process_chat(request, False))

@app.post("/api/chat/hardened", response_model=ChatResponse)
def chat_hardened(request: ChatRequest):
    return ChatResponse(**process_chat(request, True))
