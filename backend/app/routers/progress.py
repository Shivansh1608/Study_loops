import datetime
from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas

router = APIRouter(prefix="/progress", tags=["Progress & Analytics"])

def calculate_study_streak(dates: List[datetime.date]) -> int:
    """Calculate consecutive days of study activity ending today or yesterday."""
    if not dates:
        return 0

    unique_dates = sorted(set(dates), reverse=True)
    today = datetime.datetime.now(datetime.timezone.utc).date()
    yesterday = today - datetime.timedelta(days=1)

    if unique_dates[0] not in (today, yesterday):
        return 0

    streak = 1
    current = unique_dates[0]

    for next_date in unique_dates[1:]:
        if next_date == current - datetime.timedelta(days=1):
            streak += 1
            current = next_date
        elif next_date == current:
            continue
        else:
            break

    return streak

def to_naive_utc(dt):
    if dt is None:
        return None
    if getattr(dt, "tzinfo", None) is not None:
        return dt.astimezone(datetime.timezone.utc).replace(tzinfo=None)
    return dt

@router.get("/overview", response_model=schemas.ProgressOverview)
def get_progress_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Aggregate high-level study metrics for the dashboard."""
    # Quizzes and attempts
    attempts = db.query(models.Attempt).filter(models.Attempt.user_id == current_user.id).all()
    total_quizzes = len(attempts)

    if total_quizzes > 0:
        total_pts = sum(a.score for a in attempts)
        total_possible = sum(a.total for a in attempts)
        avg_score = round((total_pts / total_possible * 100), 1) if total_possible > 0 else 0.0
    else:
        avg_score = 0.0

    # Flashcards
    now = to_naive_utc(datetime.datetime.now(datetime.timezone.utc))
    all_cards = db.query(models.Flashcard).filter(models.Flashcard.user_id == current_user.id).all()
    total_flashcards = len(all_cards)
    cards_due_today = sum(
        1 for c in all_cards 
        if to_naive_utc(c.due_date) is not None and to_naive_utc(c.due_date) <= now
    )
    cards_mastered = sum(1 for c in all_cards if c.interval >= 21)

    # Activity streak
    activity_dates = [a.created_at.date() for a in attempts]
    for c in all_cards:
        if c.last_reviewed:
            activity_dates.append(c.last_reviewed.date())

    streak = calculate_study_streak(activity_dates)

    return schemas.ProgressOverview(
        total_quizzes_taken=total_quizzes,
        average_score_pct=avg_score,
        total_flashcards=total_flashcards,
        cards_due_today=cards_due_today,
        cards_mastered=cards_mastered,
        current_streak_days=streak
    )

@router.get("/scores-over-time", response_model=List[schemas.ScoreOverTime])
def get_scores_over_time(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return chronological history of quiz scores for Recharts trend line."""
    attempts = db.query(models.Attempt).filter(
        models.Attempt.user_id == current_user.id
    ).order_by(models.Attempt.created_at.asc()).all()

    results = []
    for a in attempts:
        pct = round((a.score / a.total * 100), 1) if a.total > 0 else 0.0
        results.append(schemas.ScoreOverTime(
            date=a.created_at.strftime("%b %d %H:%M"),
            score_pct=pct,
            quiz_id=a.quiz_id,
            total=a.total
        ))
    return results

@router.get("/topics", response_model=List[schemas.TopicScore])
def get_topic_scores(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return breakdown of accuracy per question topic for Recharts bar charts."""
    # Query all attempt answers by current user
    answers = db.query(models.AttemptAnswer).join(models.Attempt).filter(
        models.Attempt.user_id == current_user.id
    ).all()

    topic_stats: Dict[str, Dict[str, int]] = {}

    for ans in answers:
        topic = ans.question.topic if ans.question and ans.question.topic else "General"
        if topic not in topic_stats:
            topic_stats[topic] = {"total": 0, "correct": 0}
        topic_stats[topic]["total"] += 1
        if ans.is_correct:
            topic_stats[topic]["correct"] += 1

    results = []
    for topic, stats in topic_stats.items():
        total = stats["total"]
        correct = stats["correct"]
        acc = round((correct / total * 100), 1) if total > 0 else 0.0
        results.append(schemas.TopicScore(
            topic=topic,
            total_questions=total,
            correct_count=correct,
            accuracy_pct=acc
        ))

    results.sort(key=lambda x: x.accuracy_pct, reverse=True)
    return results

@router.get("/streak")
def get_streak(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return study streak count."""
    attempts = db.query(models.Attempt).filter(models.Attempt.user_id == current_user.id).all()
    cards = db.query(models.Flashcard).filter(models.Flashcard.user_id == current_user.id).all()
    dates = [a.created_at.date() for a in attempts]
    for c in cards:
        if c.last_reviewed:
            dates.append(c.last_reviewed.date())
    streak = calculate_study_streak(dates)
    return {"streak_days": streak}

@router.get("/weak-topics", response_model=List[schemas.WeakTopic])
def get_weak_topics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List weak topics (< 70% accuracy) where student missed questions, for targeted drills."""
    answers = db.query(models.AttemptAnswer).join(models.Attempt).filter(
        models.Attempt.user_id == current_user.id
    ).all()

    stats: Dict[str, Dict[str, int]] = {}
    for ans in answers:
        topic = ans.question.topic if ans.question and ans.question.topic else "General"
        if topic not in stats:
            stats[topic] = {"total": 0, "correct": 0}
        stats[topic]["total"] += 1
        if ans.is_correct:
            stats[topic]["correct"] += 1

    weak = []
    for topic, s in stats.items():
        total = s["total"]
        correct = s["correct"]
        acc = round((correct / total * 100), 1) if total > 0 else 0.0
        missed = total - correct
        if acc < 70.0 and missed > 0:
            weak.append(schemas.WeakTopic(
                topic=topic,
                accuracy_pct=acc,
                missed_count=missed
            ))

    weak.sort(key=lambda x: (x.accuracy_pct, -x.missed_count))
    return weak
