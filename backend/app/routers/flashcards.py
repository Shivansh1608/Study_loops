import datetime
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from app.services.ai import generate_json
from app.services.prompts import FLASHCARD_SYSTEM_PROMPT, get_flashcards_prompt
from app.services.srs import calculate_sm2

logger = logging.getLogger("notes-quiz.flashcards")

router = APIRouter(tags=["Flashcards"])

def normalize_text(text: str) -> str:
    return "".join(c.lower() for c in text if c.isalnum())

@router.post("/documents/{document_id}/flashcards", response_model=List[schemas.FlashcardOut], status_code=status.HTTP_201_CREATED)
def create_flashcards_for_document(
    document_id: int,
    request: schemas.CreateFlashcardsRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate spaced repetition flashcards from document notes with deduplication."""
    document = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    chunks = document.chunks
    if not chunks:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document has no text chunks.")

    num_chunks = len(chunks)
    total_requested = request.count
    per_chunk = max(1, total_requested // num_chunks)

    created_cards: List[models.Flashcard] = []
    seen_fronts = set()

    # Pre-populate existing fronts for deduplication
    existing = db.query(models.Flashcard.front).filter(
        models.Flashcard.document_id == document.id,
        models.Flashcard.user_id == current_user.id
    ).all()
    for row in existing:
        seen_fronts.add(normalize_text(row[0]))

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

    for idx, chunk in enumerate(chunks):
        if len(created_cards) >= total_requested:
            break

        needed = min(per_chunk, total_requested - len(created_cards))
        if idx == num_chunks - 1:
            needed = total_requested - len(created_cards)

        if needed <= 0:
            break

        prompt = get_flashcards_prompt(chunk.text, needed)
        try:
            ai_data = generate_json(
                prompt=prompt,
                schema=schemas.AIFlashcardsResponse,
                system_prompt=FLASHCARD_SYSTEM_PROMPT,
                max_retries=2
            )
        except Exception as e:
            logger.error(f"Flashcard generation failed on chunk {chunk.id}: {e}")
            continue

        raw_cards = ai_data.get("flashcards", [])
        for c in raw_cards:
            if len(created_cards) >= total_requested:
                break

            front_text = c.get("front", "").strip()
            norm = normalize_text(front_text)
            if not front_text or norm in seen_fronts:
                continue

            seen_fronts.add(norm)
            fc = models.Flashcard(
                document_id=document.id,
                user_id=current_user.id,
                front=front_text,
                back=c.get("back", "").strip(),
                topic=c.get("topic", "General"),
                ease=2.5,
                interval=0,
                repetitions=0,
                due_date=now
            )
            db.add(fc)
            created_cards.append(fc)

    db.commit()
    for card in created_cards:
        db.refresh(card)

    return created_cards

@router.get("/flashcards/due", response_model=List[schemas.FlashcardOut])
def get_due_flashcards(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retrieve flashcards due for review today or earlier."""
    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    cards = db.query(models.Flashcard).filter(
        models.Flashcard.user_id == current_user.id,
        models.Flashcard.due_date <= now
    ).order_by(models.Flashcard.due_date.asc()).all()
    return cards

@router.get("/flashcards", response_model=List[schemas.FlashcardOut])
def get_all_flashcards(
    document_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all flashcards for user, optionally filtered by document."""
    query = db.query(models.Flashcard).filter(models.Flashcard.user_id == current_user.id)
    if document_id:
        query = query.filter(models.Flashcard.document_id == document_id)
    return query.order_by(models.Flashcard.id.asc()).all()

@router.post("/flashcards/{flashcard_id}/review", response_model=schemas.FlashcardOut)
def review_flashcard(
    flashcard_id: int,
    review_req: schemas.ReviewFlashcardRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Process SM-2 review rating (0-5) and update interval, ease, and next due date."""
    card = db.query(models.Flashcard).filter(
        models.Flashcard.id == flashcard_id,
        models.Flashcard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found")

    now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    new_ease, new_interval, new_reps, new_due_date = calculate_sm2(
        quality=review_req.quality,
        repetitions=card.repetitions,
        interval=card.interval,
        ease=card.ease,
        now=now
    )

    card.ease = new_ease
    card.interval = new_interval
    card.repetitions = new_reps
    card.due_date = new_due_date
    card.last_reviewed = now

    db.commit()
    db.refresh(card)
    return card
