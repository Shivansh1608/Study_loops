import logging
from typing import List, Set
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from app.services.ai import generate_json
from app.services.prompts import QUIZ_GENERATION_SYSTEM_PROMPT, get_quiz_prompt

logger = logging.getLogger("notes-quiz.quizzes")

router = APIRouter(tags=["Quizzes"])

def normalize_text(text: str) -> str:
    """Normalize text for deduplication."""
    return "".join(c.lower() for c in text if c.isalnum())

@router.post("/documents/{document_id}/quizzes", response_model=schemas.QuizOut, status_code=status.HTTP_201_CREATED)
def create_quiz_for_document(
    document_id: int,
    request: schemas.CreateQuizRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Generate an AI quiz for a document, distributing questions across chunks,
    validating output, deduplicating questions, and persisting in the database.
    """
    document = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    chunks = document.chunks
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document has no text chunks to generate a quiz from."
        )

    num_chunks = len(chunks)
    total_requested = request.num_questions
    base_per_chunk = max(1, total_requested // num_chunks)

    collected_questions: List[models.Question] = []
    seen_question_signatures: Set[str] = set()

    for idx, chunk in enumerate(chunks):
        if len(collected_questions) >= total_requested:
            break

        needed = min(base_per_chunk, total_requested - len(collected_questions))
        if idx == num_chunks - 1:
            needed = total_requested - len(collected_questions)

        if needed <= 0:
            break

        prompt = get_quiz_prompt(
            chunk.text, needed, request.difficulty,
            question_type=request.question_type,
            topic_focus=request.topic_focus
        )
        
        try:
            ai_data = generate_json(
                prompt=prompt,
                schema=schemas.AIQuizGenerationResponse,
                system_prompt=QUIZ_GENERATION_SYSTEM_PROMPT,
                max_retries=2
            )
        except Exception as e:
            logger.error(f"Quiz generation failed on chunk {chunk.id}: {e}")
            continue

        raw_questions = ai_data.get("questions", [])
        for q_dict in raw_questions:
            if len(collected_questions) >= total_requested:
                break

            norm_q = normalize_text(q_dict.get("question", ""))
            if norm_q in seen_question_signatures:
                continue
            seen_question_signatures.add(norm_q)

            # Create and persist Question
            q_model = models.Question(
                document_id=document.id,
                chunk_id=chunk.id,
                question=q_dict["question"],
                options=q_dict["options"],
                correct_index=q_dict["correct_index"],
                explanation=q_dict["explanation"],
                difficulty=q_dict.get("difficulty", request.difficulty),
                topic=q_dict.get("topic", "General")
            )
            db.add(q_model)
            db.flush()
            collected_questions.append(q_model)

    if not collected_questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate questions from document notes. Please try again."
        )

    # Create Quiz container
    quiz = models.Quiz(
        user_id=current_user.id,
        document_id=document.id,
        difficulty=request.difficulty,
        question_type=request.question_type,
        time_limit_sec=request.time_limit_sec,
        num_questions=len(collected_questions)
    )
    db.add(quiz)
    db.flush()

    for pos, q in enumerate(collected_questions):
        qq = models.QuizQuestion(
            quiz_id=quiz.id,
            question_id=q.id,
            position=pos
        )
        db.add(qq)

    db.commit()
    db.refresh(quiz)

    # Construct response
    quiz_out_questions = [
        schemas.QuestionOut(
            id=q.id,
            question=q.question,
            options=q.options,
            correct_index=q.correct_index,
            explanation=q.explanation,
            difficulty=q.difficulty,
            topic=q.topic
        )
        for q in collected_questions
    ]

    return schemas.QuizOut(
        id=quiz.id,
        document_id=quiz.document_id,
        difficulty=quiz.difficulty,
        question_type=quiz.question_type,
        time_limit_sec=quiz.time_limit_sec,
        num_questions=quiz.num_questions,
        created_at=quiz.created_at,
        questions=quiz_out_questions
    )

@router.get("/quizzes/{quiz_id}", response_model=schemas.QuizOut)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retrieve an existing quiz with its questions."""
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    questions_out = []
    for qq in quiz.quiz_questions:
        q = qq.question
        questions_out.append(schemas.QuestionOut(
            id=q.id,
            question=q.question,
            options=q.options,
            correct_index=q.correct_index,
            explanation=q.explanation,
            difficulty=q.difficulty,
            topic=q.topic
        ))

    return schemas.QuizOut(
        id=quiz.id,
        document_id=quiz.document_id,
        difficulty=quiz.difficulty,
        question_type=getattr(quiz, 'question_type', 'mcq'),
        time_limit_sec=getattr(quiz, 'time_limit_sec', None),
        num_questions=quiz.num_questions,
        created_at=quiz.created_at,
        questions=questions_out
    )

@router.post("/quizzes/{quiz_id}/attempts", response_model=schemas.AttemptOut, status_code=status.HTTP_201_CREATED)
def submit_quiz_attempt(
    quiz_id: int,
    submission: schemas.SubmitAttemptRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Score answers server-side, record attempt, and return full results with explanations."""
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    # Map question IDs to question models
    questions_map = {qq.question_id: qq.question for qq in quiz.quiz_questions}

    score = 0
    total = len(quiz.quiz_questions)

    attempt = models.Attempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=0,
        total=total,
        duration_sec=submission.duration_sec
    )
    db.add(attempt)
    db.flush()

    attempt_answers_out: List[schemas.AttemptAnswerOut] = []

    for ans in submission.answers:
        q_model = questions_map.get(ans.question_id)
        if not q_model:
            continue

        is_correct = (ans.chosen_index == q_model.correct_index)
        if is_correct:
            score += 1

        ans_model = models.AttemptAnswer(
            attempt_id=attempt.id,
            question_id=q_model.id,
            chosen_index=ans.chosen_index,
            is_correct=is_correct
        )
        db.add(ans_model)

        q_out = schemas.QuestionOut(
            id=q_model.id,
            question=q_model.question,
            options=q_model.options,
            correct_index=q_model.correct_index,
            explanation=q_model.explanation,
            difficulty=q_model.difficulty,
            topic=q_model.topic
        )
        attempt_answers_out.append(schemas.AttemptAnswerOut(
            question_id=q_model.id,
            chosen_index=ans.chosen_index,
            is_correct=is_correct,
            question=q_out
        ))

    attempt.score = score
    db.commit()
    db.refresh(attempt)

    return schemas.AttemptOut(
        id=attempt.id,
        quiz_id=attempt.quiz_id,
        score=score,
        total=total,
        duration_sec=attempt.duration_sec,
        created_at=attempt.created_at,
        answers=attempt_answers_out
    )

@router.get("/attempts/{attempt_id}", response_model=schemas.AttemptOut)
def get_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retrieve full details of a past quiz attempt."""
    attempt = db.query(models.Attempt).filter(
        models.Attempt.id == attempt_id,
        models.Attempt.user_id == current_user.id
    ).first()

    if not attempt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attempt not found")

    answers_out = []
    for ans in attempt.answers:
        q = ans.question
        q_out = schemas.QuestionOut(
            id=q.id,
            question=q.question,
            options=q.options,
            correct_index=q.correct_index,
            explanation=q.explanation,
            difficulty=q.difficulty,
            topic=q.topic
        )
        answers_out.append(schemas.AttemptAnswerOut(
            question_id=ans.question_id,
            chosen_index=ans.chosen_index,
            is_correct=ans.is_correct,
            question=q_out
        ))

    return schemas.AttemptOut(
        id=attempt.id,
        quiz_id=attempt.quiz_id,
        score=attempt.score,
        total=attempt.total,
        duration_sec=attempt.duration_sec,
        created_at=attempt.created_at,
        answers=answers_out
    )
