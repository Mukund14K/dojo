from django.db import models
import uuid

class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    target = models.CharField(max_length=512)
    policy = models.TextField()
    
    # We do not populate mock data for security metrics, we'll leave them as null or defaults until an Arena runs
    last_arena = models.CharField(max_length=100, blank=True, null=True)
    break_rate = models.FloatField(blank=True, null=True)
    status = models.CharField(max_length=100, default='Monitoring')
    last_tested = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ArenaRun(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='arena_runs')
    target = models.CharField(max_length=512)
    mode = models.CharField(max_length=50) # vulnerable or hardened
    status = models.CharField(max_length=50, default='Pending') # Pending, Running, Completed, Failed
    total_scenarios = models.IntegerField(default=0)
    completed_scenarios = models.IntegerField(default=0)
    confirmed_violations = models.IntegerField(default=0)
    break_rate = models.FloatField(blank=True, null=True)
    error_summary = models.TextField(blank=True, null=True)
    
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Run {self.id} for {self.project.name}"

class ArenaResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    arena_run = models.ForeignKey(ArenaRun, on_delete=models.CASCADE, related_name='results')
    scenario_id = models.CharField(max_length=100)
    scenario_category = models.CharField(max_length=100)
    scenario_description = models.TextField()
    
    test_request = models.JSONField(blank=True, null=True)
    target_response = models.JSONField(blank=True, null=True)
    
    expected_outcome = models.CharField(max_length=255)
    observed_outcome = models.CharField(max_length=255)
    is_violation = models.BooleanField(default=False)
    is_vulnerability = models.BooleanField(default=False)
    
    duration_ms = models.IntegerField(default=0)
    error_details = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result {self.scenario_id} for Run {self.arena_run.id}"
