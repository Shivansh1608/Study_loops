import io
import re
from typing import Tuple
import pymupdf  # PyMuPDF
import docx

def clean_extracted_text(text: str) -> str:
    """Normalize whitespace and strip out repetitive header/footer line patterns."""
    if not text:
        return ""
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Split into lines
    lines = text.splitlines()
    cleaned_lines = []
    
    for line in lines:
        stripped = line.strip()
        # Filter out standalone page numbers like "Page 1 of 12" or "- 3 -"
        if re.match(r'^(page\s+\d+(\s+of\s+\d+)?|-?\s*\d+\s*-?)$', stripped, re.IGNORECASE):
            continue
        cleaned_lines.append(stripped)
    
    # Reassemble and collapse multiple blank lines
    combined = "\n".join(cleaned_lines)
    combined = re.sub(r'\n{3,}', '\n\n', combined)
    return combined.strip()

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
    """Extract text from PDF using PyMuPDF."""
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    page_count = len(doc)
    text_parts = []
    
    for page in doc:
        page_text = page.get_text()
        if page_text:
            text_parts.append(page_text)
            
    doc.close()
    full_text = "\n\n".join(text_parts)
    cleaned = clean_extracted_text(full_text)
    return cleaned, page_count

def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, int]:
    """Extract text from DOCX using python-docx."""
    doc_io = io.BytesIO(file_bytes)
    doc = docx.Document(doc_io)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    full_text = "\n\n".join(paragraphs)
    # Estimate page count roughly (~400 words per page)
    words = len(full_text.split())
    page_count = max(1, (words + 399) // 400)
    cleaned = clean_extracted_text(full_text)
    return cleaned, page_count

def extract_text_from_txt(file_bytes: bytes) -> Tuple[str, int]:
    """Extract text from plain text or markdown."""
    try:
        text = file_bytes.decode('utf-8')
    except UnicodeDecodeError:
        text = file_bytes.decode('latin-1', errors='ignore')
        
    words = len(text.split())
    page_count = max(1, (words + 399) // 400)
    cleaned = clean_extracted_text(text)
    return cleaned, page_count

def extract_document_text(filename: str, file_bytes: bytes) -> Tuple[str, int, str]:
    """
    Main extraction dispatcher based on file extension.
    Returns (cleaned_text, page_count, detected_type).
    """
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    
    if ext == 'pdf':
        text, pages = extract_text_from_pdf(file_bytes)
        file_type = 'pdf'
    elif ext in ['docx', 'doc']:
        text, pages = extract_text_from_docx(file_bytes)
        file_type = 'docx'
    elif ext in ['txt', 'md']:
        text, pages = extract_text_from_txt(file_bytes)
        file_type = 'txt'
    else:
        raise ValueError(f"Unsupported file type .{ext}. Supported types: PDF, DOCX, TXT, MD")
        
    if not text or len(text.strip()) < 10:
        raise ValueError("Document contains no readable text or is empty.")
        
    return text, pages, file_type
