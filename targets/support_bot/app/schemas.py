from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class ChatRequest(BaseModel):
    customer_id: str = Field(..., description="The ID of the customer making the request")
    message: str = Field(..., description="The chat message from the user")
    request_id: Optional[str] = Field(None, description="Optional tracking ID")

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
