import logging
from typing import List, Set, Optional
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
    Returns the quiz WITHOUT correct answers or explanations.
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
    total_requested = max(1, min(request.num_questions, 50))
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
            chunk_text=chunk.text,
            num_questions=needed,
            difficulty=request.difficulty,
            question_type=request.question_type,
            topic_focus=request.topic_focus,
            topics=request.topics,
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

            options = q_dict.get("options", [])
            c_idx = q_dict.get("correct_index")
            c_ans = q_dict.get("correct_answer")
            if c_ans is None and c_idx is not None and 0 <= c_idx < len(options):
                c_ans = options[c_idx]

            q_model = models.Question(
                document_id=document.id,
                chunk_id=chunk.id,
                type=q_dict.get("type", request.question_type if request.question_type != "mixed" else "mcq"),
                question=q_dict["question"],
                options=options,
                correct_index=c_idx,
                correct_answer=c_ans,
                explanation=q_dict.get("explanation", ""),
                difficulty=q_dict.get("difficulty", request.difficulty if request.difficulty != "mixed" else "medium"),
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

    title = f"{document.title} - Quiz"
    if request.difficulty:
        title += f" ({request.difficulty.capitalize()})"

    quiz = models.Quiz(
        user_id=current_user.id,
        document_id=document.id,
        title=title,
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

    # Return quiz WITHOUT correct answers
    client_questions = [
        schemas.QuestionClientOut(
            id=q.id,
            question=q.question,
            options=q.options,
            difficulty=q.difficulty,
            topic=q.topic,
            type=q.type or "mcq"
        )
        for q in collected_questions
    ]

    return schemas.QuizOut(
        id=quiz.id,
        document_id=quiz.document_id,
        title=quiz.title,
        difficulty=quiz.difficulty,
        question_type=quiz.question_type,
        time_limit_sec=quiz.time_limit_sec,
        num_questions=quiz.num_questions,
        created_at=quiz.created_at,
        questions=client_questions
    )

@router.get("/quizzes", response_model=List[schemas.QuizListItem])
def list_quizzes(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all quizzes created by the current user with best score and attempt count."""
    quizzes = db.query(models.Quiz).filter(
        models.Quiz.user_id == current_user.id
    ).order_by(models.Quiz.created_at.desc()).all()

    items: List[schemas.QuizListItem] = []
    for q in quizzes:
        attempts = q.attempts
        att_count = len(attempts)
        best_score = max((a.score for a in attempts), default=None)
        best_pct = None
        if best_score is not None and q.num_questions > 0:
            best_pct = round((best_score / q.num_questions) * 100, 1)

        items.append(schemas.QuizListItem(
            id=q.id,
            document_id=q.document_id,
            title=q.title or f"Quiz #{q.id}",
            difficulty=q.difficulty,
            question_type=q.question_type or "mcq",
            time_limit_sec=q.time_limit_sec,
            num_questions=q.num_questions,
            created_at=q.created_at,
            attempts_count=att_count,
            best_score=best_score,
            best_score_pct=best_pct
        ))

    return items

@router.get("/quizzes/{quiz_id}", response_model=schemas.QuizOut)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retrieve an existing quiz without correct answers or explanations."""
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    questions_out = []
    for qq in quiz.quiz_questions:
        q = qq.question
        questions_out.append(schemas.QuestionClientOut(
            id=q.id,
            question=q.question,
            options=q.options,
            difficulty=q.difficulty,
            topic=q.topic,
            type=q.type or "mcq"
        ))

    return schemas.QuizOut(
        id=quiz.id,
        document_id=quiz.document_id,
        title=quiz.title,
        difficulty=quiz.difficulty,
        question_type=quiz.question_type or "mcq",
        time_limit_sec=quiz.time_limit_sec,
        num_questions=quiz.num_questions,
        created_at=quiz.created_at,
        questions=questions_out
    )

@router.delete("/quizzes/{quiz_id}", status_code=status.HTTP_200_OK)
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a quiz owned by the current user."""
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully", "id": quiz_id}

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

    # Map question IDs to question models for this quiz
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

    # Map submission answers by question_id
    sub_map = {ans.question_id: ans for ans in submission.answers}

    for qq in quiz.quiz_questions:
        q_model = qq.question
        ans = sub_map.get(q_model.id)

        is_correct = False
        chosen_idx = None
        ans_text = None
        time_spent = 0

        if ans is not None:
            chosen_idx = ans.chosen_index
            ans_text = ans.answer_text
            time_spent = ans.time_spent_sec

            if chosen_idx is not None and q_model.correct_index is not None:
                is_correct = (chosen_idx == q_model.correct_index)
            elif ans_text and q_model.correct_answer:
                is_correct = (ans_text.strip().lower() == q_model.correct_answer.strip().lower())

        if is_correct:
            score += 1

        ans_model = models.AttemptAnswer(
            attempt_id=attempt.id,
            question_id=q_model.id,
            chosen_index=chosen_idx,
            answer_text=ans_text,
            is_correct=is_correct,
            time_spent_sec=time_spent
        )
        db.add(ans_model)

        # Build full review question for response
        q_out = schemas.QuestionReviewOut(
            id=q_model.id,
            question=q_model.question,
            options=q_model.options,
            correct_index=q_model.correct_index,
            correct_answer=q_model.correct_answer,
            explanation=q_model.explanation,
            difficulty=q_model.difficulty,
            topic=q_model.topic,
            type=q_model.type or "mcq"
        )
        attempt_answers_out.append(schemas.AttemptAnswerOut(
            question_id=q_model.id,
            chosen_index=chosen_idx,
            answer_text=ans_text,
            is_correct=is_correct,
            time_spent_sec=time_spent,
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
        q_out = schemas.QuestionReviewOut(
            id=q.id,
            question=q.question,
            options=q.options,
            correct_index=q.correct_index,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            difficulty=q.difficulty,
            topic=q.topic,
            type=q.type or "mcq"
        )
        answers_out.append(schemas.AttemptAnswerOut(
            question_id=ans.question_id,
            chosen_index=ans.chosen_index,
            answer_text=ans.answer_text,
            is_correct=ans.is_correct,
            time_spent_sec=ans.time_spent_sec,
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

@router.get("/quizzes/{quiz_id}/attempts", response_model=List[schemas.AttemptOut])
def list_quiz_attempts(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retrieve attempt history for a specific quiz."""
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    attempts = db.query(models.Attempt).filter(
        models.Attempt.quiz_id == quiz_id,
        models.Attempt.user_id == current_user.id
    ).order_by(models.Attempt.created_at.desc()).all()

    results: List[schemas.AttemptOut] = []
    for att in attempts:
        ans_out = []
        for ans in att.answers:
            q = ans.question
            q_out = schemas.QuestionReviewOut(
                id=q.id,
                question=q.question,
                options=q.options,
                correct_index=q.correct_index,
                correct_answer=q.correct_answer,
                explanation=q.explanation,
                difficulty=q.difficulty,
                topic=q.topic,
                type=q.type or "mcq"
            )
            ans_out.append(schemas.AttemptAnswerOut(
                question_id=ans.question_id,
                chosen_index=ans.chosen_index,
                answer_text=ans.answer_text,
                is_correct=ans.is_correct,
                time_spent_sec=ans.time_spent_sec,
                question=q_out
            ))
        results.append(schemas.AttemptOut(
            id=att.id,
            quiz_id=att.quiz_id,
            score=att.score,
            total=att.total,
            duration_sec=att.duration_sec,
            created_at=att.created_at,
            answers=ans_out
        ))

    return results

@router.post("/quizzes/{quiz_id}/retry-wrong", response_model=schemas.QuizOut, status_code=status.HTTP_201_CREATED)
def retry_wrong_answers(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a new quiz from the questions the user previously missed in this quiz."""
    quiz = db.query(models.Quiz).filter(
        models.Quiz.id == quiz_id,
        models.Quiz.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")

    # Find the latest attempt for this quiz
    latest_attempt = db.query(models.Attempt).filter(
        models.Attempt.quiz_id == quiz_id,
        models.Attempt.user_id == current_user.id
    ).order_by(models.Attempt.created_at.desc()).first()

    if not latest_attempt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No previous attempts found for this quiz."
        )

    wrong_q_ids = [
        ans.question_id
        for ans in latest_attempt.answers
        if not ans.is_correct
    ]

    if not wrong_q_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Congratulations! You had no wrong answers in your latest attempt to retry."
        )

    # Fetch unique question models in order
    questions = db.query(models.Question).filter(
        models.Question.id.in_(wrong_q_ids)
    ).all()

    new_quiz = models.Quiz(
        user_id=current_user.id,
        document_id=quiz.document_id,
        title=f"Retry: {quiz.title or 'Quiz'}",
        difficulty=quiz.difficulty,
        question_type=quiz.question_type,
        time_limit_sec=quiz.time_limit_sec,
        num_questions=len(questions)
    )
    db.add(new_quiz)
    db.flush()

    for pos, q in enumerate(questions):
        qq = models.QuizQuestion(
            quiz_id=new_quiz.id,
            question_id=q.id,
            position=pos
        )
        db.add(qq)

    db.commit()
    db.refresh(new_quiz)

    client_questions = [
        schemas.QuestionClientOut(
            id=q.id,
            question=q.question,
            options=q.options,
            difficulty=q.difficulty,
            topic=q.topic,
            type=q.type or "mcq"
        )
        for q in questions
    ]

    return schemas.QuizOut(
        id=new_quiz.id,
        document_id=new_quiz.document_id,
        title=new_quiz.title,
        difficulty=new_quiz.difficulty,
        question_type=new_quiz.question_type,
        time_limit_sec=new_quiz.time_limit_sec,
        num_questions=new_quiz.num_questions,
        created_at=new_quiz.created_at,
        questions=client_questions
    )
