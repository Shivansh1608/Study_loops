import json
import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.ai import BaseAIAdapter, generate_json
from app import schemas

client = TestClient(app)

class MockQuizAIAdapter(BaseAIAdapter):
    def generate(self, prompt: str, schema, system_prompt=None) -> str:
        data = {
            "questions": [
                {
                    "question": "What is the primary product of photosynthesis?",
                    "options": ["Glucose", "Methane", "Nitrogen", "Argon"],
                    "correct_index": 0,
                    "explanation": "Photosynthesis converts carbon dioxide and water into glucose and oxygen.",
                    "difficulty": "medium",
                    "topic": "Biology"
                }
            ]
        }
        return json.dumps(data)

def test_generate_json_with_mock_adapter():
    adapter = MockQuizAIAdapter()
    result = generate_json(
        prompt="Test prompt",
        schema=schemas.AIQuizGenerationResponse,
        adapter=adapter
    )
    assert "questions" in result
    assert len(result["questions"]) == 1
    assert result["questions"][0]["correct_index"] == 0

def test_quiz_flow_end_to_end(monkeypatch):
    # Mock AI generation to return deterministic quiz questions
    def mock_gen(*args, **kwargs):
        return {
            "questions": [
                {
                    "question": "What organelle produces ATP?",
                    "options": ["Mitochondria", "Ribosome", "Nucleus", "Vacuole"],
                    "correct_index": 0,
                    "explanation": "Mitochondria are the powerhouses of the cell.",
                    "difficulty": "medium",
                    "topic": "Cell Biology"
                }
            ]
        }
    monkeypatch.setattr("app.routers.quizzes.generate_json", mock_gen)

    # 1. Upload a test document
    files = {"file": ("biology.txt", b"Mitochondria generate cellular energy in the form of ATP.", "text/plain")}
    doc_resp = client.post("/documents", files=files, data={"title": "Cell Biology Notes"})
    assert doc_resp.status_code == 201
    doc_id = doc_resp.json()["id"]

    # 2. Create quiz for the document
    quiz_resp = client.post(f"/documents/{doc_id}/quizzes", json={"num_questions": 1, "difficulty": "medium"})
    assert quiz_resp.status_code == 201
    quiz_data = quiz_resp.json()
    assert quiz_data["document_id"] == doc_id
    assert len(quiz_data["questions"]) >= 1
    question_id = quiz_data["questions"][0]["id"]

    # 3. Retrieve quiz
    get_q_resp = client.get(f"/quizzes/{quiz_data['id']}")
    assert get_q_resp.status_code == 200

    # 4. Submit an attempt with the correct answer
    attempt_resp = client.post(f"/quizzes/{quiz_data['id']}/attempts", json={
        "duration_sec": 45,
        "answers": [{"question_id": question_id, "chosen_index": 0}]
    })
    assert attempt_resp.status_code == 201
    attempt_data = attempt_resp.json()
    assert attempt_data["score"] == 1
    assert attempt_data["total"] == 1
    assert attempt_data["answers"][0]["is_correct"] is True

    # 5. Check progress overview updates
    progress_resp = client.get("/progress/overview")
    assert progress_resp.status_code == 200
    pdata = progress_resp.json()
    assert pdata["total_quizzes_taken"] >= 1
