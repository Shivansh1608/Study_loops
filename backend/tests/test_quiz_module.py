import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app import models, schemas
from app.auth import create_access_token, get_password_hash
from app.services.ai import BaseAIAdapter, generate_json
from app.services.prompts import get_quiz_prompt

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    # Tables are already migrated, yield session
    db = SessionLocal()
    yield db
    db.close()

def create_test_user(db, email: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            email=email,
            password_hash=get_password_hash("testpass123")
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token({"sub": user.email})
    return user, {"Authorization": f"Bearer {token}"}

def test_prompt_difficulty_distribution():
    # Verify difficulty instructions in prompts
    easy_prompt = get_quiz_prompt("Test notes", 5, "easy")
    assert "easy" in easy_prompt
    assert "definitions" in easy_prompt

    hard_prompt = get_quiz_prompt("Test notes", 5, "hard")
    assert "hard" in hard_prompt
    assert "multi-step reasoning" in hard_prompt

    mixed_prompt = get_quiz_prompt("Test notes", 10, "mixed")
    assert "30% easy" in mixed_prompt
    assert "50% medium" in mixed_prompt
    assert "20% hard" in mixed_prompt

def test_json_retry_behavior_on_parse_error():
    """Test that generate_json retries when invalid JSON is returned first."""
    class FlakyAdapter(BaseAIAdapter):
        def __init__(self):
            self.attempts = 0

        def generate(self, prompt: str, schema, system_prompt=None) -> str:
            self.attempts += 1
            if self.attempts == 1:
                return "Not valid json {"
            return json.dumps({
                "questions": [
                    {
                        "question": "What is Python?",
                        "options": ["A programming language", "A snake only", "A mineral", "A car"],
                        "correct_index": 0,
                        "correct_answer": "A programming language",
                        "explanation": "Python is a high-level language.",
                        "difficulty": "easy",
                        "topic": "Programming",
                        "type": "mcq"
                    }
                ]
            })

    adapter = FlakyAdapter()
    result = generate_json(
        prompt="Sample prompt",
        schema=schemas.AIQuizGenerationResponse,
        adapter=adapter,
        max_retries=2
    )
    assert adapter.attempts == 2
    assert len(result["questions"]) == 1
    assert result["questions"][0]["question"] == "What is Python?"

def test_json_retry_fails_after_max_retries():
    """Test that generate_json raises RuntimeError after exhausting retries."""
    class AlwaysBrokenAdapter(BaseAIAdapter):
        def generate(self, prompt: str, schema, system_prompt=None) -> str:
            return "totally invalid json"

    with pytest.raises(RuntimeError):
        generate_json(
            prompt="Sample prompt",
            schema=schemas.AIQuizGenerationResponse,
            adapter=AlwaysBrokenAdapter(),
            max_retries=2
        )

def test_deduplication_and_no_answers_exposed_before_submission(monkeypatch, clean_db):
    """Test deduplication across chunks and answers are hidden before submission."""
    user, headers = create_test_user(clean_db, "user_dedupe@example.com")

    # Document with 2 chunks
    doc = models.Document(
        user_id=user.id,
        title="Dedupe Test Doc",
        text="Sample text content for chunking",
        page_count=1
    )
    clean_db.add(doc)
    clean_db.flush()

    chunk1 = models.Chunk(document_id=doc.id, index=0, text="First chunk content")
    chunk2 = models.Chunk(document_id=doc.id, index=1, text="Second chunk content")
    clean_db.add_all([chunk1, chunk2])
    clean_db.commit()

    # Mock generator returning near-duplicate question across both chunks
    def mock_gen(*args, **kwargs):
        return {
            "questions": [
                {
                    "question": "What is the capital of France?",
                    "options": ["Paris", "London", "Berlin", "Madrid"],
                    "correct_index": 0,
                    "correct_answer": "Paris",
                    "explanation": "Paris is the capital.",
                    "difficulty": "easy",
                    "topic": "Geography",
                    "type": "mcq"
                },
                {
                    "question": "what is the capital of france???",  # Near duplicate
                    "options": ["Paris", "London", "Berlin", "Madrid"],
                    "correct_index": 0,
                    "correct_answer": "Paris",
                    "explanation": "Paris is the capital.",
                    "difficulty": "easy",
                    "topic": "Geography",
                    "type": "mcq"
                },
                {
                    "question": "What is the largest ocean?",
                    "options": ["Pacific", "Atlantic", "Indian", "Arctic"],
                    "correct_index": 0,
                    "correct_answer": "Pacific",
                    "explanation": "The Pacific is the largest.",
                    "difficulty": "easy",
                    "topic": "Geography",
                    "type": "mcq"
                }
            ]
        }

    monkeypatch.setattr("app.routers.quizzes.generate_json", mock_gen)

    resp = client.post(
        f"/documents/{doc.id}/quizzes",
        json={"num_questions": 4, "difficulty": "easy"},
        headers=headers
    )
    assert resp.status_code == 201
    quiz_data = resp.json()

    # Verify answers are NOT exposed
    for q in quiz_data["questions"]:
        assert "correct_index" not in q
        assert "correct_answer" not in q
        assert "explanation" not in q

    # Verify deduplication reduced duplicate question
    questions_text = [q["question"].lower() for q in quiz_data["questions"]]
    france_q_count = sum(1 for q in questions_text if "france" in q)
    assert france_q_count == 1

def test_grading_logic_correct_wrong_unanswered_and_retry_wrong(monkeypatch, clean_db):
    """Test full grading flow: correct, wrong, unanswered questions and retry-wrong."""
    user, headers = create_test_user(clean_db, "user_grading@example.com")

    doc = models.Document(
        user_id=user.id,
        title="Grading Test Doc",
        text="Sample text for grading",
        page_count=1
    )
    clean_db.add(doc)
    clean_db.flush()

    chunk = models.Chunk(document_id=doc.id, index=0, text="Grading text")
    clean_db.add(chunk)
    clean_db.commit()

    def mock_gen(*args, **kwargs):
        return {
            "questions": [
                {
                    "question": "Q1: 2 + 2?",
                    "options": ["3", "4", "5", "6"],
                    "correct_index": 1,
                    "correct_answer": "4",
                    "explanation": "2 + 2 = 4",
                    "difficulty": "easy",
                    "topic": "Math",
                    "type": "mcq"
                },
                {
                    "question": "Q2: Sky is green?",
                    "options": ["True", "False"],
                    "correct_index": 1,
                    "correct_answer": "False",
                    "explanation": "Sky is blue",
                    "difficulty": "easy",
                    "topic": "Science",
                    "type": "true_false"
                },
                {
                    "question": "Q3: 5 * 5?",
                    "options": ["20", "25", "30", "35"],
                    "correct_index": 1,
                    "correct_answer": "25",
                    "explanation": "5 * 5 = 25",
                    "difficulty": "medium",
                    "topic": "Math",
                    "type": "mcq"
                }
            ]
        }

    monkeypatch.setattr("app.routers.quizzes.generate_json", mock_gen)

    # 1. Create quiz
    q_resp = client.post(
        f"/documents/{doc.id}/quizzes",
        json={"num_questions": 3, "difficulty": "mixed"},
        headers=headers
    )
    assert q_resp.status_code == 201
    quiz = q_resp.json()
    quiz_id = quiz["id"]
    q_items = quiz["questions"]
    assert len(q_items) == 3

    # 2. Submit attempt:
    # Q1: Correct (chosen_index = 1)
    # Q2: Wrong (chosen_index = 0, correct is 1)
    # Q3: Unanswered (not passed in answers list)
    attempt_payload = {
        "duration_sec": 30,
        "answers": [
            {"question_id": q_items[0]["id"], "chosen_index": 1, "time_spent_sec": 10},
            {"question_id": q_items[1]["id"], "chosen_index": 0, "time_spent_sec": 15},
        ]
    }
    att_resp = client.post(f"/quizzes/{quiz_id}/attempts", json=attempt_payload, headers=headers)
    assert att_resp.status_code == 201
    att_data = att_resp.json()

    # Total score should be 1 out of 3
    assert att_data["score"] == 1
    assert att_data["total"] == 3
    assert len(att_data["answers"]) == 3

    # Now verify answers and explanations ARE revealed after attempt submission
    ans_by_qid = {a["question_id"]: a for a in att_data["answers"]}
    assert ans_by_qid[q_items[0]["id"]]["is_correct"] is True
    assert ans_by_qid[q_items[0]["id"]]["question"]["correct_index"] == 1
    assert ans_by_qid[q_items[0]["id"]]["question"]["explanation"] == "2 + 2 = 4"

    assert ans_by_qid[q_items[1]["id"]]["is_correct"] is False
    assert ans_by_qid[q_items[1]["id"]]["question"]["correct_index"] == 1

    # Unanswered question Q3
    assert ans_by_qid[q_items[2]["id"]]["is_correct"] is False
    assert ans_by_qid[q_items[2]["id"]]["chosen_index"] is None

    # 3. Test retry-wrong endpoint
    retry_resp = client.post(f"/quizzes/{quiz_id}/retry-wrong", headers=headers)
    assert retry_resp.status_code == 201
    new_quiz = retry_resp.json()
    # Missed Q2 and Q3 -> new quiz must contain exactly these 2 questions
    assert len(new_quiz["questions"]) == 2
    retry_q_ids = {q["id"] for q in new_quiz["questions"]}
    assert retry_q_ids == {q_items[1]["id"], q_items[2]["id"]}

def test_user_isolation(monkeypatch, clean_db):
    """Test that a user cannot view, attempt, or delete another user's quiz or attempt."""
    user_a, headers_a = create_test_user(clean_db, "user_a@example.com")
    user_b, headers_b = create_test_user(clean_db, "user_b@example.com")

    doc_a = models.Document(
        user_id=user_a.id,
        title="Doc A",
        text="Text for user A",
        page_count=1
    )
    clean_db.add(doc_a)
    clean_db.flush()

    chunk_a = models.Chunk(document_id=doc_a.id, index=0, text="Chunk A")
    clean_db.add(chunk_a)
    clean_db.commit()

    def mock_gen(*args, **kwargs):
        return {
            "questions": [
                {
                    "question": "Private Question for User A?",
                    "options": ["A", "B", "C", "D"],
                    "correct_index": 0,
                    "correct_answer": "A",
                    "explanation": "Because A",
                    "difficulty": "medium",
                    "topic": "Private",
                    "type": "mcq"
                }
            ]
        }
    monkeypatch.setattr("app.routers.quizzes.generate_json", mock_gen)

    # User A creates a quiz
    q_resp = client.post(
        f"/documents/{doc_a.id}/quizzes",
        json={"num_questions": 1, "difficulty": "medium"},
        headers=headers_a
    )
    assert q_resp.status_code == 201
    quiz_id = q_resp.json()["id"]

    # User A submits attempt
    att_resp = client.post(
        f"/quizzes/{quiz_id}/attempts",
        json={"duration_sec": 10, "answers": []},
        headers=headers_a
    )
    assert att_resp.status_code == 201
    attempt_id = att_resp.json()["id"]

    # User B attempts to access User A's document quiz creation -> 404
    bad_doc_quiz = client.post(
        f"/documents/{doc_a.id}/quizzes",
        json={"num_questions": 1, "difficulty": "medium"},
        headers=headers_b
    )
    assert bad_doc_quiz.status_code == 404

    # User B attempts to get User A's quiz -> 404
    bad_get_quiz = client.get(f"/quizzes/{quiz_id}", headers=headers_b)
    assert bad_get_quiz.status_code == 404

    # User B attempts to submit attempt for User A's quiz -> 404
    bad_submit = client.post(
        f"/quizzes/{quiz_id}/attempts",
        json={"duration_sec": 5, "answers": []},
        headers=headers_b
    )
    assert bad_submit.status_code == 404

    # User B attempts to view User A's attempt -> 404
    bad_get_att = client.get(f"/attempts/{attempt_id}", headers=headers_b)
    assert bad_get_att.status_code == 404

    # User B attempts to retry wrong for User A's quiz -> 404
    bad_retry = client.post(f"/quizzes/{quiz_id}/retry-wrong", headers=headers_b)
    assert bad_retry.status_code == 404

    # User B attempts to delete User A's quiz -> 404
    bad_del = client.delete(f"/quizzes/{quiz_id}", headers=headers_b)
    assert bad_del.status_code == 404

    # User A can successfully delete their own quiz
    del_resp = client.delete(f"/quizzes/{quiz_id}", headers=headers_a)
    assert del_resp.status_code == 200
