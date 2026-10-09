from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ArenaRunViewSet, health_check

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'arena-runs', ArenaRunViewSet, basename='arenarun')

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('', include(router.urls)),
]
