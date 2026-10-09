import httpx
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from unittest.mock import patch
from .models import Project, ArenaRun, ArenaResult

class ArenaTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.project = Project.objects.create(
            name="Test Project",
            target="http://127.0.0.1:8001"
        )
        
    @patch('api.services.httpx.get')
    @patch('api.services.httpx.post')
    def test_execute_vulnerable_mode(self, mock_post, mock_get):
        # Mock GET scenarios
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": "S1", "category": "benign", "description": "Benign", "expected_vulnerable": "allowed", "test_payload": {}},
            {"id": "S2", "category": "data_leak", "description": "Leak", "expected_vulnerable": "allowed", "test_payload": {}},
        ]
        
        # Mock POST chat
        # Since it's vulnerable, it allows the leak.
        class MockResponse:
            def __init__(self, json_data, status_code=200):
                self._json_data = json_data
                self.status_code = status_code
            def json(self): return self._json_data

        mock_post.side_effect = [
            MockResponse({"allowed": True, "response": "Benign response"}),
            MockResponse({"allowed": True, "response": "Leaked data"}),
        ]
        
        url = reverse('arenarun-execute')
        res = self.client.post(url, {'mode': 'vulnerable', 'project_id': str(self.project.id)})
        
        self.assertEqual(res.status_code, 201)
        data = res.json()
        
        # 2 total scenarios, 1 security scenario (S2). Since it's vulnerable and allowed, it's a violation.
        self.assertEqual(data['total_scenarios'], 2)
        self.assertEqual(data['completed_scenarios'], 2)
        self.assertEqual(data['confirmed_violations'], 1)
        self.assertEqual(data['break_rate'], 100.0)
        
        results = data['results']
        self.assertEqual(len(results), 2)
        self.assertFalse(results[0]['is_violation'])
        self.assertTrue(results[1]['is_violation'])
        self.assertTrue(results[1]['is_vulnerability'])

    @patch('api.services.httpx.get')
    @patch('api.services.httpx.post')
    def test_execute_hardened_mode(self, mock_post, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": "S1", "category": "benign", "description": "Benign", "expected_hardened": "allowed", "test_payload": {}},
            {"id": "S2", "category": "data_leak", "description": "Leak", "expected_hardened": "blocked", "test_payload": {}},
        ]
        
        class MockResponse:
            def __init__(self, json_data, status_code=200):
                self._json_data = json_data
                self.status_code = status_code
            def json(self): return self._json_data

        mock_post.side_effect = [
            MockResponse({"allowed": True, "response": "Benign response"}),
            MockResponse({"allowed": False, "response": "Blocked data leak"}), # Blocked!
        ]
        
        url = reverse('arenarun-execute')
        res = self.client.post(url, {'mode': 'hardened', 'project_id': str(self.project.id)})
        
        self.assertEqual(res.status_code, 201)
        data = res.json()
        
        self.assertEqual(data['total_scenarios'], 2)
        self.assertEqual(data['confirmed_violations'], 0)
        self.assertEqual(data['break_rate'], 0.0) # Correctly blocked

    def test_validation_missing_mode(self):
        url = reverse('arenarun-execute')
        res = self.client.post(url, {'project_id': str(self.project.id)})
        self.assertEqual(res.status_code, 400)
        
    @patch('api.services.httpx.get')
    def test_target_unavailable(self, mock_get):
        mock_get.side_effect = httpx.RequestError("Connection refused")
        
        url = reverse('arenarun-execute')
        res = self.client.post(url, {'mode': 'vulnerable', 'project_id': str(self.project.id)})
        
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['status'], 'Failed')
        self.assertIn("Failed to fetch scenarios", data['error_summary'])
