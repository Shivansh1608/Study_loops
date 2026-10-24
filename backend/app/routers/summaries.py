import logging
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from app.services.ai import generate_json
from app.services.prompts import SUMMARY_SYSTEM_PROMPT, get_summary_prompt

logger = logging.getLogger("notes-quiz.summaries")

router = APIRouter(tags=["Summaries"])

class AISummaryResponse(BaseModel):
    markdown_content: str = Field(description="Comprehensive revision summary in Markdown")

@router.post("/documents/{document_id}/summary", response_model=schemas.SummaryOut, status_code=status.HTTP_201_CREATED)
def generate_document_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Generate or regenerate a structured Markdown revision summary for a document.
    Bullet key concepts, definitions, and formulas across notes into one coherent summary.
    """
    document = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # If an existing summary exists, we can return or overwrite
    existing = db.query(models.Summary).filter(models.Summary.document_id == document.id).first()

    # Use chunks or full document text
    text_content = document.text[:12000]  # Respect token envelope
    prompt = get_summary_prompt(text_content, document.title)

    try:
        ai_data = generate_json(
            prompt=prompt,
            schema=AISummaryResponse,
            system_prompt=SUMMARY_SYSTEM_PROMPT,
            max_retries=2
        )
        markdown_text = ai_data.get("markdown_content", "")
    except Exception as e:
        logger.warning(f"AI summary failed, using structured template fallback: {e}")
        # Build clean markdown summary fallback directly from chunks
        sections = []
        sections.append(f"# {document.title} - Study & Revision Summary\n")
        sections.append("## Overview\nSynthesized revision guide extracted from lecture notes.\n")
        sections.append("## Key Concepts\n")
        for c in document.chunks[:5]:
            words = c.text.split()
            first_sentence = " ".join(words[:25])
            sections.append(f"- **Key Point**: {first_sentence}...")
        sections.append("\n## Essential Formulas & Takeaways\n- Review all definitions and flashcard cues regularly using spaced repetition.")
        markdown_text = "\n".join(sections)

    if existing:
        existing.content_markdown = markdown_text
        db.commit()
        db.refresh(existing)
        return existing

    summary = models.Summary(
        document_id=document.id,
        content_markdown=markdown_text
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary

@router.get("/documents/{document_id}/summary", response_model=schemas.SummaryOut)
def get_document_summary(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retrieve the generated markdown revision summary for a document."""
    document = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == current_user.id
    ).first()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    summary = db.query(models.Summary).filter(models.Summary.document_id == document.id).first()
    if not summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No summary generated yet for this document.")

    return summary
