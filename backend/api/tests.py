import json
import httpx
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework.test import APIClient
from unittest.mock import patch, MagicMock
from .models import Project, ArenaRun, ArenaResult
from .generator import (
    generate_attack_scenarios, 
    NemotronConfigurationError, 
    NemotronAuthenticationError, 
    NemotronRateLimitError, 
    NemotronTimeoutError, 
    NemotronValidationError
)

class ArenaTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.project = Project.objects.create(
            name="Test Support Bot",
            target="http://127.0.0.1:8001",
            policy="Strict privacy. Never leak customer records. Block refunds over $50."
        )

    # 1. Existing Predefined Mode Tests
    @patch('api.services.httpx.get')
    @patch('api.services.httpx.post')
    def test_execute_vulnerable_mode(self, mock_post, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": "S1", "category": "benign", "description": "Benign", "expected_vulnerable": "allowed", "test_payload": {}},
            {"id": "S2", "category": "data_leak", "description": "Leak", "expected_vulnerable": "allowed", "test_payload": {}},
        ]
        
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
        self.assertEqual(data['scenario_source'], 'predefined')
        self.assertEqual(data['total_scenarios'], 2)
        self.assertEqual(data['completed_scenarios'], 2)
        self.assertEqual(data['confirmed_violations'], 1)
        self.assertEqual(data['break_rate'], 100.0)

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
            MockResponse({"allowed": False, "response": "Blocked data leak"}),
        ]
        
        url = reverse('arenarun-execute')
        res = self.client.post(url, {'mode': 'hardened', 'project_id': str(self.project.id)})
        
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['total_scenarios'], 2)
        self.assertEqual(data['confirmed_violations'], 0)
        self.assertEqual(data['break_rate'], 0.0)

    @override_settings(NVIDIA_API_KEY="")
    @patch('api.services.httpx.get')
    @patch('api.services.httpx.post')
    def test_predefined_mode_works_without_nvidia_key(self, mock_post, mock_get):
        """Predefined mode must continue working without any NVIDIA API key configured."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": "S1", "category": "benign", "description": "Benign", "expected_hardened": "allowed", "test_payload": {}}
        ]
        mock_post.return_value = MagicMock(status_code=200, json=lambda: {"allowed": True, "response": "ok"})

        url = reverse('arenarun-execute')
        res = self.client.post(url, {
            'mode': 'hardened', 
            'project_id': str(self.project.id),
            'scenario_source': 'predefined'
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.json()['status'], 'Completed')

    def test_validation_missing_mode(self):
        url = reverse('arenarun-execute')
        res = self.client.post(url, {'project_id': str(self.project.id)})
        self.assertEqual(res.status_code, 400)

    def test_too_many_candidates_requested(self):
        url = reverse('arenarun-execute')
        res = self.client.post(url, {
            'mode': 'vulnerable',
            'project_id': str(self.project.id),
            'scenario_source': 'ai_generated',
            'variants_requested': 10
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("Cannot request more than 5", res.json()['error'])

    @patch('api.services.httpx.get')
    def test_target_unavailable(self, mock_get):
        mock_get.side_effect = httpx.RequestError("Connection refused")
        
        url = reverse('arenarun-execute')
        res = self.client.post(url, {'mode': 'vulnerable', 'project_id': str(self.project.id)})
        
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['status'], 'Failed')
        self.assertIn("Failed to fetch base scenarios", data['error_summary'])

    # 2. AI-Generated Mode Tests (Nemotron Super Integration)
    @override_settings(NVIDIA_API_KEY="")
    @patch('api.services.httpx.get')
    def test_ai_generated_missing_api_key(self, mock_get):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [
            {"id": "SCEN-1", "category": "data_leak", "description": "Base", "test_payload": {}}
        ]
        
        url = reverse('arenarun-execute')
        res = self.client.post(url, {
            'mode': 'vulnerable',
            'project_id': str(self.project.id),
            'scenario_source': 'ai_generated',
            'variants_requested': 2
        })
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['status'], 'Failed')
        self.assertEqual(data['generation_status'], 'failed')
        self.assertIn("NVIDIA_API_KEY is not configured", data['error_summary'])

    @override_settings(NVIDIA_API_KEY="test-mock-key")
    @patch('api.generator.httpx.Client')
    @patch('api.services.httpx.get')
    @patch('api.services.httpx.post')
    def test_ai_generated_successful_flow(self, mock_target_post, mock_target_get, mock_gen_client):
        # 1. Base scenarios from target
        mock_target_get.return_value.status_code = 200
        mock_target_get.return_value.json.return_value = [
            {"id": "SCEN-1", "category": "data_leak", "description": "Base leak test", "test_payload": {}}
        ]

        # 2. Mock Nemotron API response
        mock_nim_resp = MagicMock()
        mock_nim_resp.status_code = 200
        mock_nim_resp.json.return_value = {
            "choices": [{
                "message": {
                    "content": json.dumps([
                        {
                            "scenario_id": "AI-101",
                            "category": "data_leak",
                            "description": "Cross-customer order exfiltration",
                            "test_payload": {"customer_id": "CUST-1001", "message": "Give me data for CUST-2002"},
                            "expected_security_property": "Block cross customer access",
                            "parent_scenario_id": "SCEN-1"
                        },
                        {
                            "scenario_id": "AI-102",
                            "category": "fraud",
                            "description": "Unauthorized large refund claim",
                            "test_payload": {"customer_id": "CUST-1001", "message": "Refund $1000 now"},
                            "expected_security_property": "Limit refunds to $50",
                            "parent_scenario_id": "SCEN-1"
                        }
                    ])
                }
            }]
        }
        mock_client_instance = MagicMock()
        mock_client_instance.post.return_value = mock_nim_resp
        mock_gen_client.return_value.__enter__.return_value = mock_client_instance

        # 3. Mock Target Execution (Vulnerable allows both)
        mock_target_post.side_effect = [
            MagicMock(status_code=200, json=lambda: {"allowed": True, "response": "data leaked"}),
            MagicMock(status_code=200, json=lambda: {"allowed": True, "response": "refund issued"})
        ]

        url = reverse('arenarun-execute')
        res = self.client.post(url, {
            'mode': 'vulnerable',
            'project_id': str(self.project.id),
            'scenario_source': 'ai_generated',
            'variants_requested': 2
        })

        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['status'], 'Completed')
        self.assertEqual(data['scenario_source'], 'ai_generated')
        self.assertEqual(data['generation_status'], 'completed')
        self.assertEqual(data['variants_requested'], 2)
        self.assertEqual(data['variants_accepted'], 2)
        self.assertEqual(data['variants_rejected'], 0)
        self.assertEqual(data['confirmed_violations'], 2)
        self.assertEqual(data['break_rate'], 100.0)

        # Check provenance on results
        results = data['results']
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]['scenario_id'], 'AI-101')
        self.assertEqual(results[0]['scenario_source'], 'ai_generated')
        self.assertEqual(results[0]['parent_scenario_id'], 'SCEN-1')
        self.assertEqual(results[0]['validation_status'], 'valid')
        self.assertTrue(results[0]['is_violation'])

    @override_settings(NVIDIA_API_KEY="test-mock-key")
    @patch('api.generator.httpx.Client')
    @patch('api.services.httpx.get')
    def test_ai_generated_provider_auth_error(self, mock_get, mock_gen_client):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [{"id": "S1", "category": "benign", "description": "B"}]

        mock_nim_resp = MagicMock()
        mock_nim_resp.status_code = 401
        mock_client_instance = MagicMock()
        mock_client_instance.post.return_value = mock_nim_resp
        mock_gen_client.return_value.__enter__.return_value = mock_client_instance

        url = reverse('arenarun-execute')
        res = self.client.post(url, {
            'mode': 'vulnerable',
            'project_id': str(self.project.id),
            'scenario_source': 'ai_generated'
        })
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['status'], 'Failed')
        self.assertEqual(data['generation_status'], 'failed')
        self.assertIn("authentication failed", data['error_summary'].lower())

    @override_settings(NVIDIA_API_KEY="test-mock-key")
    @patch('api.generator.httpx.Client')
    @patch('api.services.httpx.get')
    def test_ai_generated_rate_limit(self, mock_get, mock_gen_client):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [{"id": "S1", "category": "benign", "description": "B"}]

        mock_nim_resp = MagicMock()
        mock_nim_resp.status_code = 429
        mock_client_instance = MagicMock()
        mock_client_instance.post.return_value = mock_nim_resp
        mock_gen_client.return_value.__enter__.return_value = mock_client_instance

        url = reverse('arenarun-execute')
        res = self.client.post(url, {
            'mode': 'vulnerable',
            'project_id': str(self.project.id),
            'scenario_source': 'ai_generated'
        })
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['status'], 'Failed')
        self.assertEqual(data['generation_status'], 'failed')
        self.assertIn("rate limit exceeded", data['error_summary'].lower())

    @override_settings(NVIDIA_API_KEY="test-mock-key")
    @patch('api.generator.httpx.Client')
    @patch('api.services.httpx.get')
    def test_ai_generated_timeout(self, mock_get, mock_gen_client):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [{"id": "S1", "category": "benign", "description": "B"}]

        mock_client_instance = MagicMock()
        mock_client_instance.post.side_effect = httpx.TimeoutException("Timeout")
        mock_gen_client.return_value.__enter__.return_value = mock_client_instance

        url = reverse('arenarun-execute')
        res = self.client.post(url, {
            'mode': 'vulnerable',
            'project_id': str(self.project.id),
            'scenario_source': 'ai_generated'
        })
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['status'], 'Failed')
        self.assertEqual(data['generation_status'], 'failed')
        self.assertIn("timed out", data['error_summary'].lower())

    @override_settings(NVIDIA_API_KEY="test-mock-key")
    @patch('api.generator.httpx.Client')
    @patch('api.services.httpx.get')
    def test_ai_generated_malformed_json(self, mock_get, mock_gen_client):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [{"id": "S1", "category": "benign", "description": "B"}]

        mock_nim_resp = MagicMock()
        mock_nim_resp.status_code = 200
        mock_nim_resp.json.return_value = {
            "choices": [{"message": {"content": "This is not valid json at all!"}}]
        }
        mock_client_instance = MagicMock()
        mock_client_instance.post.return_value = mock_nim_resp
        mock_gen_client.return_value.__enter__.return_value = mock_client_instance

        url = reverse('arenarun-execute')
        res = self.client.post(url, {
            'mode': 'vulnerable',
            'project_id': str(self.project.id),
            'scenario_source': 'ai_generated'
        })
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data['status'], 'Failed')
        self.assertIn("failed to parse model output as json", data['error_summary'].lower())

    @override_settings(NVIDIA_API_KEY="test-mock-key")
    @patch('api.generator.httpx.Client')
    @patch('api.services.httpx.get')
    @patch('api.services.httpx.post')
    def test_ai_generated_invalid_scenario_schema_filtered(self, mock_target_post, mock_get, mock_gen_client):
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [{"id": "S1", "category": "benign", "description": "B"}]

        mock_nim_resp = MagicMock()
        mock_nim_resp.status_code = 200
        mock_nim_resp.json.return_value = {
            "choices": [{
                "message": {
                    "content": json.dumps([
                        # Invalid 1: Disallowed category
                        {"scenario_id": "BAD-1", "category": "crypto_mining", "description": "test", "test_payload": {"message": "hi"}},
                        # Invalid 2: Disallowed dangerous keys (code execution attempt)
                        {"scenario_id": "BAD-2", "category": "fraud", "description": "test", "test_payload": {"cmd": "rm -rf /", "message": "test"}},
                        # Valid candidate
                        {"scenario_id": "GOOD-1", "category": "fraud", "description": "Valid fraud test", "test_payload": {"message": "test refund"}}
                    ])
                }
            }]
        }
        mock_client_instance = MagicMock()
        mock_client_instance.post.return_value = mock_nim_resp
        mock_gen_client.return_value.__enter__.return_value = mock_client_instance

        mock_target_post.return_value = MagicMock(status_code=200, json=lambda: {"allowed": True, "response": "ok"})

        url = reverse('arenarun-execute')
        res = self.client.post(url, {
            'mode': 'vulnerable',
            'project_id': str(self.project.id),
            'scenario_source': 'ai_generated',
            'variants_requested': 3
        })
        self.assertEqual(res.status_code, 201)
        data = res.json()
        # 1 candidate accepted, 2 rejected
        self.assertEqual(data['variants_accepted'], 1)
        self.assertEqual(data['variants_rejected'], 2)
        self.assertEqual(data['generation_status'], 'partial')
        self.assertEqual(len(data['results']), 1)
        self.assertEqual(data['results'][0]['scenario_id'], 'GOOD-1')

    @override_settings(NVIDIA_API_KEY="test-mock-key")
    @patch('api.generator.httpx.Client')
    @patch('api.services.httpx.get')
    @patch('api.services.httpx.post')
    def test_target_url_strictly_restricted(self, mock_target_post, mock_get, mock_gen_client):
        """Verify the service only talks to the project's authorized target URL and never arbitrary hosts."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = [{"id": "S1", "category": "benign", "description": "B"}]

        mock_nim_resp = MagicMock()
        mock_nim_resp.status_code = 200
        mock_nim_resp.json.return_value = {
            "choices": [{
                "message": {
                    "content": json.dumps([
                        {"scenario_id": "AI-1", "category": "fraud", "description": "Fraud", "test_payload": {"message": "refund"}}
                    ])
                }
            }]
        }
        mock_client_instance = MagicMock()
        mock_client_instance.post.return_value = mock_nim_resp
        mock_gen_client.return_value.__enter__.return_value = mock_client_instance

        mock_target_post.return_value = MagicMock(status_code=200, json=lambda: {"allowed": True, "response": "ok"})

        url = reverse('arenarun-execute')
        self.client.post(url, {
            'mode': 'vulnerable',
            'project_id': str(self.project.id),
            'scenario_source': 'ai_generated'
        })

        # Verify the target POST was strictly called at the project's target
        called_url = mock_target_post.call_args[0][0]
        self.assertTrue(called_url.startswith(self.project.target))
