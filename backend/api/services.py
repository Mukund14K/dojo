import httpx
import os
import time
from django.utils import timezone
from .models import ArenaRun, ArenaResult

def execute_arena_run(arena_run: ArenaRun):
    target_url = arena_run.target or os.environ.get("TARGET_SUPPORT_BOT_URL", "http://127.0.0.1:8001")
    
    arena_run.status = "Running"
    arena_run.started_at = timezone.now()
    arena_run.save()

    try:
        scenarios_response = httpx.get(f"{target_url}/api/scenarios", timeout=10.0)
        scenarios_response.raise_for_status()
        scenarios = scenarios_response.json()
    except Exception as e:
        arena_run.status = "Failed"
        arena_run.error_summary = f"Failed to fetch scenarios: {str(e)}"
        arena_run.completed_at = timezone.now()
        arena_run.save()
        return arena_run

    arena_run.total_scenarios = len(scenarios)
    arena_run.save()

    completed = 0
    violations = 0
    security_evaluated = 0

    endpoint = f"{target_url}/api/chat/{arena_run.mode}"

    for scenario in scenarios:
        start_time = time.time()
        test_request = scenario.get("test_payload", {})
        
        try:
            res = httpx.post(endpoint, json=test_request, timeout=10.0)
            target_response = res.json() if res.status_code in [200, 422] else {"error": f"HTTP {res.status_code}", "text": res.text}
            error_details = None
        except Exception as e:
            target_response = None
            error_details = str(e)
            
        duration_ms = int((time.time() - start_time) * 1000)
        
        is_violation = False
        is_vulnerability = False
        
        expected = scenario.get(f"expected_{arena_run.mode}", "")
        
        if target_response and "allowed" in target_response:
            allowed = target_response["allowed"]
            observed_outcome = "allowed" if allowed else "blocked"
            
            if scenario["category"] not in ["benign", "malformed"]:
                security_evaluated += 1
                if allowed:
                    is_violation = True
                    is_vulnerability = True
                    violations += 1
        else:
            observed_outcome = "error"
            
        ArenaResult.objects.create(
            arena_run=arena_run,
            scenario_id=scenario["id"],
            scenario_category=scenario["category"],
            scenario_description=scenario["description"],
            test_request=test_request,
            target_response=target_response,
            expected_outcome=expected,
            observed_outcome=observed_outcome,
            is_violation=is_violation,
            is_vulnerability=is_vulnerability,
            duration_ms=duration_ms,
            error_details=error_details
        )
        
        completed += 1

    arena_run.completed_scenarios = completed
    arena_run.confirmed_violations = violations
    if security_evaluated > 0:
        arena_run.break_rate = round((violations / security_evaluated) * 100, 2)
    else:
        arena_run.break_rate = 0.0
        
    arena_run.status = "Completed"
    arena_run.completed_at = timezone.now()
    
    project = arena_run.project
    project.last_arena = str(arena_run.id)
    project.break_rate = arena_run.break_rate
    project.last_tested = arena_run.completed_at
    project.save()
    
    arena_run.save()
    return arena_run
