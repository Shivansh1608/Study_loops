from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from app.services.pdf import extract_document_text
from app.services.chunking import chunk_text
from app.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

MAX_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

@router.post("", response_model=schemas.DocumentDetail, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Accept PDF, TXT, DOCX, or MD file (max 20 MB).
    Extract text, clean, chunk into ~1500 word sections, and store in DB.
    """
    filename = file.filename or "uploaded_document"
    contents = await file.read()
    
    if len(contents) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum upload size of {settings.MAX_UPLOAD_SIZE_MB} MB."
        )
        
    try:
        extracted_text, page_count, file_type = extract_document_text(filename, contents)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document: {str(e)}"
        )

    doc_title = title.strip() if title and title.strip() else filename.rsplit('.', 1)[0]

    # Create document
    doc = models.Document(
        user_id=current_user.id,
        title=doc_title,
        text=extracted_text,
        page_count=page_count,
        file_type=file_type,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Generate chunks
    chunks_text = chunk_text(extracted_text, target_word_count=1500, overlap_word_count=100)
    for idx, c_text in enumerate(chunks_text):
        chunk_model = models.Chunk(
            document_id=doc.id,
            index=idx,
            text=c_text
        )
        db.add(chunk_model)
    db.commit()
    db.refresh(doc)

    return doc

@router.get("", response_model=List[schemas.DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """List all documents owned by the current user."""
    docs = db.query(models.Document).filter(models.Document.user_id == current_user.id).order_by(models.Document.created_at.desc()).all()
    results = []
    for d in docs:
        results.append(schemas.DocumentOut(
            id=d.id,
            title=d.title,
            page_count=d.page_count,
            file_type=d.file_type,
            created_at=d.created_at,
            chunk_count=len(d.chunks)
        ))
    return results

@router.get("/{document_id}", response_model=schemas.DocumentDetail)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Retrieve full text and chunks for a document."""
    doc = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Delete a document and all related chunks, quizzes, questions, and flashcards."""
    doc = db.query(models.Document).filter(
        models.Document.id == document_id,
        models.Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    db.delete(doc)
    db.commit()
    return None
