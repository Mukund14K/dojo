from pydantic import BaseModel
from typing import Optional, Dict, Any

class ChatRequest(BaseModel):
    account_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    scenario_label: Optional[str]
    allowed: bool
    outcome: Dict[str, Any]

class Scenario(BaseModel):
    id: str
    category: str
    description: str
    expected_vulnerable: str
    expected_hardened: str
    test_payload: Dict[str, Any]
