import httpx
import os
import time
from django.utils import timezone
from .models import ArenaRun, ArenaResult
from .generator import generate_attack_scenarios, NemotronError

def execute_arena_run(arena_run: ArenaRun):
    target_url = arena_run.target or os.environ.get("TARGET_SUPPORT_BOT_URL", "http://127.0.0.1:8001")
    
    arena_run.status = "Running"
    arena_run.started_at = timezone.now()
    arena_run.save()

    try:
        scenarios_response = httpx.get(f"{target_url}/api/scenarios", timeout=10.0)
        scenarios_response.raise_for_status()
        base_scenarios = scenarios_response.json()
    except Exception as e:
        arena_run.status = "Failed"
        arena_run.error_summary = f"Failed to fetch base scenarios: {str(e)}"
        arena_run.completed_at = timezone.now()
        arena_run.save()
        return arena_run

    # Determine scenarios based on source
    if arena_run.scenario_source == "ai_generated":
        try:
            gen_res = generate_attack_scenarios(
                policy=arena_run.project.policy,
                base_scenarios=base_scenarios,
                count=arena_run.variants_requested or 3
            )
            arena_run.generator_model = gen_res["generator_model"]
            arena_run.generation_status = gen_res["generation_status"]
            arena_run.variants_accepted = gen_res["variants_accepted"]
            arena_run.variants_rejected = gen_res["variants_rejected"]

            scenarios = gen_res["accepted_candidates"]
            if not scenarios:
                arena_run.status = "Failed"
                arena_run.error_summary = "AI generation produced no valid scenario candidates."
                arena_run.completed_at = timezone.now()
                arena_run.save()
                return arena_run
        except NemotronError as e:
            arena_run.status = "Failed"
            arena_run.generation_status = "failed"
            arena_run.error_summary = str(e)
            arena_run.completed_at = timezone.now()
            arena_run.save()
            return arena_run
        except Exception as e:
            arena_run.status = "Failed"
            arena_run.generation_status = "failed"
            arena_run.error_summary = f"Unexpected generation error: {str(e)}"
            arena_run.completed_at = timezone.now()
            arena_run.save()
            return arena_run
    else:
        scenarios = base_scenarios
        arena_run.generation_status = "not_applicable"
        arena_run.variants_accepted = len(base_scenarios)

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
            error_details=error_details,
            scenario_source=arena_run.scenario_source,
            parent_scenario_id=scenario.get("parent_scenario_id"),
            generator_model=scenario.get("generator_model") or (arena_run.generator_model if arena_run.scenario_source == "ai_generated" else None),
            generation_status="success",
            validation_status="valid"
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
