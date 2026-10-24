import pytest
from app.services.chunking import chunk_text, get_overlap_words

def test_chunk_short_text():
    text = "Artificial intelligence is transforming education and technology."
    chunks = chunk_text(text, target_word_count=100)
    assert len(chunks) == 1
    assert chunks[0] == text

def test_chunk_long_text_splits_properly():
    # Generate 50 paragraphs each with 50 words -> 2500 words
    paragraph = "Machine learning algorithms build mathematical models based on sample training data to make predictions or decisions without being explicitly programmed to do so. " * 3
    paragraphs = [f"Section {i}\n\n{paragraph}" for i in range(1, 20)]
    full_text = "\n\n".join(paragraphs)
    
    chunks = chunk_text(full_text, target_word_count=500, overlap_word_count=50)
    assert len(chunks) > 1
    for chunk in chunks:
        assert len(chunk.split()) > 0

def test_chunk_overlap():
    p1 = "First block of notes covering fundamental calculus concepts including limits and derivatives."
    p2 = "Second block of notes covering integrals, antiderivatives, and the fundamental theorem of calculus."
    p3 = "Third block of notes applying differential equations to physics problems."
    text = f"{p1}\n\n{p2}\n\n{p3}"
    
    chunks = chunk_text(text, target_word_count=15, overlap_word_count=5)
    assert len(chunks) >= 2
    # Check that overlap words helper works
    overlap = get_overlap_words("alpha beta gamma delta epsilon", 3)
    assert overlap == "gamma delta epsilon"
