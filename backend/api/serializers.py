from rest_framework import serializers
from .models import Project, ArenaRun, ArenaResult

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_arena', 'break_rate', 'last_tested', 'status']

class ArenaResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArenaResult
        fields = '__all__'

class ArenaRunSerializer(serializers.ModelSerializer):
    results = ArenaResultSerializer(many=True, read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = ArenaRun
        fields = '__all__'
        read_only_fields = ['id', 'status', 'total_scenarios', 'completed_scenarios', 'confirmed_violations', 'break_rate', 'error_summary', 'started_at', 'completed_at', 'created_at']
