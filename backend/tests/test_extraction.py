import io
import pytest
import pymupdf
import docx
from app.services.pdf import (
    extract_document_text,
    extract_text_from_pdf,
    extract_text_from_txt,
    extract_text_from_docx,
    clean_extracted_text
)

def create_sample_pdf(text: str) -> bytes:
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 50), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes

def create_sample_docx(text: str) -> bytes:
    doc = docx.Document()
    doc.add_paragraph(text)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()

def test_clean_extracted_text():
    raw = "Page 1 of 5\n\nIntroduction to Machine Learning\n\n- 2 -\n\nNeural networks learn patterns."
    cleaned = clean_extracted_text(raw)
    assert "Page 1 of 5" not in cleaned
    assert "- 2 -" not in cleaned
    assert "Introduction to Machine Learning" in cleaned
    assert "Neural networks learn patterns." in cleaned

def test_extract_pdf():
    content = "Photosynthesis is the process used by plants to convert light energy into chemical energy."
    pdf_bytes = create_sample_pdf(content)
    text, pages = extract_text_from_pdf(pdf_bytes)
    assert "Photosynthesis" in text
    assert pages >= 1

def test_extract_docx():
    content = "Mitochondria are membrane-bound cell organelles that generate chemical energy."
    docx_bytes = create_sample_docx(content)
    text, pages = extract_text_from_docx(docx_bytes)
    assert "Mitochondria" in text
    assert pages >= 1

def test_extract_txt():
    content = "Cellular respiration produces ATP through glycolysis and the citric acid cycle."
    txt_bytes = content.encode("utf-8")
    text, pages = extract_text_from_txt(txt_bytes)
    assert "Cellular respiration" in text
    assert pages >= 1

def test_extract_document_dispatcher():
    content = "Quantum mechanics describes the physical properties of nature at the scale of atoms."
    pdf_bytes = create_sample_pdf(content)
    text, pages, ftype = extract_document_text("physics_lecture.pdf", pdf_bytes)
    assert ftype == "pdf"
    assert "Quantum mechanics" in text

def test_extract_unsupported_file_type():
    with pytest.raises(ValueError, match="Unsupported file type"):
        extract_document_text("archive.zip", b"PK12345")

def test_extract_empty_file():
    with pytest.raises(ValueError, match="contains no readable text"):
        extract_document_text("empty.txt", b"")
