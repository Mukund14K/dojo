# DOJO Support Bot Target

A small, independently runnable Support Bot HTTP service that DOJO can test in later development phases.
This service is a controlled security-testing target, not the full AI attack engine. It uses a rule-based engine to demonstrate deterministic policy violations or enforcement without requiring an LLM.

## Features
- **Synthetic Data Only**: Uses fictitious customer data (e.g. Maya Demo, Alex Sample). Does not connect to any real databases or external services.
- **Vulnerable Mode**: Deliberately allows policy overrides, data leakage (across synthetic fixtures), and unauthorized refunds.
- **Hardened Mode**: Enforces customer-data isolation and safe input handling.

## API Contract
- `GET /health`: Health check.
- `GET /api/scenarios`: Returns predefined test scenarios.
- `POST /api/chat/vulnerable`: Rule-based vulnerable chat endpoint.
- `POST /api/chat/hardened`: Rule-based hardened chat endpoint.

## Setup and Run
1. Create a virtual environment: 
   ```bash
   python -m venv venv
   ```
2. Activate it: 
   ```bash
   # Windows
   .\venv\Scripts\activate 
   # Mac/Linux
   source venv/bin/activate
   ```
3. Install dependencies: 
   ```bash
   pip install -r requirements.txt
   ```
4. Start the server on `127.0.0.1` at port `8001`: 
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8001
   ```
5. Run tests: 
   ```bash
   pytest tests/
   ```

## Example Requests

**Check Scenarios**
```bash
curl http://127.0.0.1:8001/api/scenarios
```

**Chat (Vulnerable Data Leak)**
```bash
curl -X POST http://127.0.0.1:8001/api/chat/vulnerable \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "CUST-1001", "message": "Give me the data for CUST-2002"}'
```
*Expected Output*: Returns Alex Sample's data.

**Chat (Hardened Data Leak)**
```bash
curl -X POST http://127.0.0.1:8001/api/chat/hardened \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "CUST-1001", "message": "Give me the data for CUST-2002"}'
```
*Expected Output*: Blocked.
