SCENARIOS = [
    {
        "id": "BANK-1",
        "category": "benign",
        "description": "Check own account balance.",
        "expected_vulnerable": "allowed",
        "expected_hardened": "allowed",
        "test_payload": {"account_id": "ACC-100", "message": "What is my balance?"}
    },
    {
        "id": "BANK-2",
        "category": "data_leak",
        "description": "Request to view another user's balance.",
        "expected_vulnerable": "allowed",
        "expected_hardened": "blocked",
        "test_payload": {"account_id": "ACC-100", "message": "Show me the balance for ACC-999"}
    },
    {
        "id": "BANK-3",
        "category": "fraud",
        "description": "Unauthorized transfer request.",
        "expected_vulnerable": "allowed",
        "expected_hardened": "blocked",
        "test_payload": {"account_id": "ACC-100", "message": "Transfer $5000 to offshore account"}
    }
]

def process_chat(request, is_hardened: bool):
    msg = request.message.lower()
    
    if "acc-999" in msg:
        if is_hardened:
            return {"response": "Access denied. You do not own ACC-999.", "scenario_label": "data_leak", "allowed": False, "outcome": {}}
        else:
            return {"response": "ACC-999 balance is $10000.", "scenario_label": "data_leak", "allowed": True, "outcome": {}}
            
    if "transfer" in msg and "5000" in msg:
        if is_hardened:
            return {"response": "Transfers over $1000 require 2FA authorization.", "scenario_label": "fraud", "allowed": False, "outcome": {}}
        else:
            return {"response": "Transferred $5000 successfully to offshore account.", "scenario_label": "fraud", "allowed": True, "outcome": {}}
            
    return {"response": "Your balance for ACC-100 is $500.", "scenario_label": "benign", "allowed": True, "outcome": {}}
