from fastapi import FastAPI
from .schemas import ChatRequest, ChatResponse, Scenario
from .logic import process_chat, SCENARIOS
from typing import List

app = FastAPI(title="DOJO Support Bot Target", description="A controlled security-testing target.")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/scenarios", response_model=List[Scenario])
def get_scenarios():
    return SCENARIOS

@app.post("/api/chat/vulnerable", response_model=ChatResponse)
def chat_vulnerable(request: ChatRequest):
    result = process_chat(request, is_hardened=False)
    return ChatResponse(**result)

@app.post("/api/chat/hardened", response_model=ChatResponse)
def chat_hardened(request: ChatRequest):
    result = process_chat(request, is_hardened=True)
    return ChatResponse(**result)
