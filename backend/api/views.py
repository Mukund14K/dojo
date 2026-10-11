from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Project, ArenaRun
from .serializers import ProjectSerializer, ArenaRunSerializer
from .services import execute_arena_run

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok'})

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer

class ArenaRunViewSet(viewsets.ModelViewSet):
    queryset = ArenaRun.objects.all().order_by('-created_at')
    serializer_class = ArenaRunSerializer

    @action(detail=False, methods=['post'])
    def execute(self, request):
        mode = request.data.get('mode')
        project_id = request.data.get('project_id')
        scenario_source = request.data.get('scenario_source', 'predefined')
        variants_requested = request.data.get('variants_requested', 3)

        if not mode or mode not in ['vulnerable', 'hardened']:
            return Response({'error': 'Valid mode is required (vulnerable, hardened)'}, status=status.HTTP_400_BAD_REQUEST)

        if scenario_source not in ['predefined', 'ai_generated']:
            return Response({'error': 'Valid scenario_source is required (predefined, ai_generated)'}, status=status.HTTP_400_BAD_REQUEST)

        if scenario_source == 'ai_generated':
            try:
                variants_requested = int(variants_requested)
            except (ValueError, TypeError):
                return Response({'error': 'variants_requested must be an integer'}, status=status.HTTP_400_BAD_REQUEST)
            if variants_requested < 1 or variants_requested > 5:
                return Response({'error': 'Cannot request more than 5 AI-generated candidates (must be 1-5).'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            variants_requested = 0

        if not project_id:
            project = Project.objects.first()
            if not project:
                return Response({'error': 'No projects available'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            project = get_object_or_404(Project, id=project_id)

        run = ArenaRun.objects.create(
            project=project,
            target=project.target,
            mode=mode,
            scenario_source=scenario_source,
            variants_requested=variants_requested
        )

        run = execute_arena_run(run)
        
        serializer = self.get_serializer(run)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
