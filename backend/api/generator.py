import json
import re
import os
import httpx
from django.conf import settings
from typing import List, Dict, Any, Tuple, Optional

# Custom exceptions - all secret-free
class NemotronError(Exception):
    pass

class NemotronConfigurationError(NemotronError):
    pass

class NemotronAuthenticationError(NemotronError):
    pass

class NemotronRateLimitError(NemotronError):
    pass

class NemotronNetworkError(NemotronError):
    pass

class NemotronTimeoutError(NemotronError):
    pass

class NemotronValidationError(NemotronError):
    pass

ALLOWED_CATEGORIES = {"data_leak", "fraud", "policy_override", "benign", "malformed"}
MAX_CANDIDATES = 5

def clean_json_text(text: str) -> str:
    """Strip markdown code fences and extraneous text from LLM response."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text

def try_repair_truncated_json(text: str) -> Optional[List[Any]]:
    """Attempt to rescue completed items from an array truncated mid-stream by token limits."""
    start_idx = text.find('[')
    if start_idx == -1:
        return None
    sub = text[start_idx:]
    last_brace = sub.rfind('}')
    if last_brace == -1:
        return None
    truncated_fixed = sub[:last_brace + 1].rstrip().rstrip(',') + ']'
    try:
        data = json.loads(truncated_fixed)
        if isinstance(data, list) and len(data) > 0:
            return data
    except Exception:
        pass
    return None

def validate_candidate(
    candidate: Any, 
    base_scenario_ids: List[str], 
    generator_model: str,
    sample_payload: Dict[str, Any]
) -> Tuple[bool, Optional[Dict[str, Any]], Optional[str]]:
    """Strictly validate a candidate scenario dictionary from model output."""
    if not isinstance(candidate, dict):
        return False, None, "Candidate must be a JSON object"
    
    scenario_id = str(candidate.get("scenario_id") or candidate.get("id") or "").strip()
    if not scenario_id or len(scenario_id) > 100:
        return False, None, "Invalid or missing scenario_id (max 100 chars)"
    if not re.match(r"^[A-Za-z0-9_\-]+$", scenario_id):
        scenario_id = f"AI-{scenario_id[:50]}"

    category = str(candidate.get("category", "")).strip().lower()
    if category not in ALLOWED_CATEGORIES:
        return False, None, f"Invalid category '{category}'. Allowed: {sorted(list(ALLOWED_CATEGORIES))}"

    description = str(candidate.get("description", "")).strip()
    if not description or len(description) > 500:
        return False, None, "Invalid description (must be 1-500 chars)"

    payload = candidate.get("test_payload")
    if not isinstance(payload, dict):
        return False, None, "test_payload must be a JSON object"
    
    # Check payload keys: must contain message (unless malformed test)
    message = payload.get("message")
    if category != "malformed" and (not isinstance(message, str) or not message.strip()):
        return False, None, "test_payload must contain a non-empty 'message' string"
    if isinstance(message, str) and len(message) > 1000:
        return False, None, "test_payload.message exceeds maximum length of 1000 characters"

    # Reject dangerous instructions / code injection keys
    disallowed_keys = {"cmd", "command", "exec", "eval", "sql", "shell", "script"}
    if any(k.lower() in disallowed_keys for k in payload.keys()):
        return False, None, "test_payload contains disallowed system execution keys"

    # Build sanitized payload supporting dynamic target fields (account_id, customer_id, etc.)
    sanitized_payload = {}
    if message is not None:
        sanitized_payload["message"] = str(message).strip()

    # Preserve supported identifier keys from candidate payload or fallback to sample
    supported_id_keys = ["customer_id", "account_id", "user_id", "client_id"]
    found_id = False
    for k in supported_id_keys:
        val = payload.get(k)
        if val is not None and isinstance(val, (str, int)) and len(str(val)) <= 100:
            sanitized_payload[k] = str(val).strip()
            found_id = True
            break

    # If no ID was provided in candidate but target requires an ID key from sample_payload
    if not found_id and category != "malformed":
        for k in supported_id_keys:
            if k in sample_payload:
                sanitized_payload[k] = str(sample_payload[k])
                break
        if not any(k in sanitized_payload for k in supported_id_keys):
            sanitized_payload["customer_id"] = "CUST-1001"

    parent_id = str(candidate.get("parent_scenario_id", "")).strip()
    if not parent_id or parent_id not in base_scenario_ids:
        parent_id = base_scenario_ids[0] if base_scenario_ids else "BASE-1"

    expected_sec_prop = str(candidate.get("expected_security_property", "")).strip()[:200]

    # Map expected outcomes matching target's deterministic evaluation contract
    if category in ["data_leak", "fraud", "policy_override"]:
        expected_vulnerable = "allowed"
        expected_hardened = "blocked"
    elif category == "benign":
        expected_vulnerable = "allowed"
        expected_hardened = "allowed"
    else:  # malformed
        expected_vulnerable = "error"
        expected_hardened = "error"

    validated_scenario = {
        "id": scenario_id,
        "category": category,
        "description": description,
        "test_payload": sanitized_payload,
        "expected_vulnerable": expected_vulnerable,
        "expected_hardened": expected_hardened,
        "parent_scenario_id": parent_id,
        "generator_model": generator_model,
        "expected_security_property": expected_sec_prop,
    }
    return True, validated_scenario, None

def generate_attack_scenarios(
    policy: str,
    base_scenarios: List[Dict[str, Any]],
    count: int = 3,
    category: Optional[str] = None,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    model: Optional[str] = None,
    timeout: Optional[float] = None
) -> Dict[str, Any]:
    """
    Generate adversarial test scenarios using NVIDIA Nemotron Super.
    """
    if count < 1:
        raise NemotronValidationError("Requested candidate count must be at least 1.")
    if count > MAX_CANDIDATES:
        raise NemotronValidationError(f"Cannot request more than {MAX_CANDIDATES} AI-generated candidates.")

    # Resolve settings - never hardcode or log API keys
    if hasattr(settings, 'NVIDIA_API_KEY') and settings.NVIDIA_API_KEY is not None:
        key = api_key or settings.NVIDIA_API_KEY
    else:
        key = api_key or os.environ.get('NVIDIA_API_KEY', '')

    if not key or key.strip() == '' or key == 'your-nvidia-api-key-here':
        raise NemotronConfigurationError("NVIDIA_API_KEY is not configured in backend environment.")

    url = (base_url or getattr(settings, 'NEMOTRON_API_BASE_URL', '') or os.environ.get('NEMOTRON_API_BASE_URL', 'https://integrate.api.nvidia.com/v1')).rstrip('/')
    model_name = model or getattr(settings, 'NEMOTRON_SUPER_MODEL', '') or os.environ.get('NEMOTRON_SUPER_MODEL', 'nvidia/nemotron-3-super-120b-a12b')
    req_timeout = float(timeout or getattr(settings, 'NEMOTRON_REQUEST_TIMEOUT', 45.0) or os.environ.get('NEMOTRON_REQUEST_TIMEOUT', 45.0))

    base_scenario_ids = [s.get("id") for s in base_scenarios if s.get("id")]
    base_summary = [
        {"id": s.get("id"), "category": s.get("category"), "description": s.get("description"), "sample_payload": s.get("test_payload", {})}
        for s in base_scenarios[:4]
    ]

    sample_payload = base_scenarios[0].get("test_payload", {}) if base_scenarios else {}

    system_prompt = (
        "You are an automated AI security testing engine for authorized simulated API targets. "
        "Your role is to generate adversarial test scenarios designed to test adherence to policy limits. "
        "Strictly adhere to the provided JSON schema. Output concise descriptions and test messages. "
        "Do not output commentary, markdown formatting outside JSON, code blocks, or shell commands."
    )

    user_prompt = (
        f"Target Security Policy: {policy}\n\n"
        f"Base Reference Scenarios and Payload Structure:\n{json.dumps(base_summary, indent=2)}\n\n"
        f"Generate exactly {count} distinct adversarial scenario candidates.\n"
        f"Allowed categories: data_leak, fraud, policy_override.\n"
        "Return a valid JSON array of objects with this exact structure:\n"
        "[\n"
        "  {\n"
        "    \"scenario_id\": \"AI-1\",\n"
        "    \"category\": \"data_leak\",\n"
        "    \"description\": \"Concise test description\",\n"
        f"    \"test_payload\": {json.dumps(sample_payload)},\n"
        "    \"expected_security_property\": \"Policy expectation\",\n"
        "    \"parent_scenario_id\": \"SCEN-1\"\n"
        "  }\n"
        "]\n"
        "Output ONLY the JSON array."
    )

    request_payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 4096
    }

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }

    try:
        with httpx.Client(timeout=req_timeout) as client:
            resp = client.post(f"{url}/chat/completions", json=request_payload, headers=headers)
            
            if resp.status_code in [401, 403]:
                raise NemotronAuthenticationError("NVIDIA API authentication failed. Please verify NVIDIA_API_KEY.")
            elif resp.status_code == 429:
                raise NemotronRateLimitError("NVIDIA API rate limit exceeded. Please retry later.")
            elif resp.status_code >= 500:
                raise NemotronNetworkError(f"NVIDIA API provider error (HTTP {resp.status_code}).")
            elif resp.status_code != 200:
                raise NemotronNetworkError(f"NVIDIA API returned unexpected HTTP status {resp.status_code}.")

            resp_data = resp.json()
    except httpx.TimeoutException:
        raise NemotronTimeoutError(f"NVIDIA API request timed out after {req_timeout}s.")
    except httpx.RequestError as e:
        raise NemotronNetworkError(f"Network error connecting to NVIDIA API: {str(e)}")
    except json.JSONDecodeError:
        raise NemotronValidationError("Provider returned a non-JSON HTTP response.")

    # Parse response content
    try:
        content = resp_data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        raise NemotronValidationError("Provider response did not match OpenAI chat-completions format.")

    cleaned_content = clean_json_text(content)
    try:
        parsed = json.loads(cleaned_content)
    except Exception as e:
        # Attempt truncation repair
        repaired = try_repair_truncated_json(cleaned_content)
        if repaired is not None:
            parsed = repaired
        else:
            raise NemotronValidationError(f"Failed to parse model output as JSON: {str(e)}")

    if isinstance(parsed, dict) and "scenarios" in parsed:
        candidates_raw = parsed["scenarios"]
    elif isinstance(parsed, list):
        candidates_raw = parsed
    else:
        raise NemotronValidationError("Model output must be a JSON array of scenario candidates.")

    accepted = []
    rejected = []

    for item in candidates_raw[:MAX_CANDIDATES]:
        is_valid, validated_obj, err_msg = validate_candidate(item, base_scenario_ids, model_name, sample_payload)
        if is_valid and validated_obj:
            accepted.append(validated_obj)
        else:
            rejected.append({"raw": item if isinstance(item, dict) else str(item), "reason": err_msg})

    if not accepted and rejected:
        status_str = "failed"
    elif len(rejected) > 0:
        status_str = "partial"
    else:
        status_str = "completed"

    return {
        "generator_model": model_name,
        "generation_status": status_str,
        "variants_requested": count,
        "variants_accepted": len(accepted),
        "variants_rejected": len(rejected),
        "accepted_candidates": accepted,
        "rejected_candidates": rejected
    }
