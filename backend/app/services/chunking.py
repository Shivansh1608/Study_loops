from typing import List
import re

def chunk_text(text: str, target_word_count: int = 1500, overlap_word_count: int = 100) -> List[str]:
    """
    Split text into chunks of ~target_word_count words, preserving headings and paragraphs.
    Adds a small overlap between adjacent chunks to maintain context continuity.
    """
    if not text:
        return []

    # First split by double newlines or markdown section boundaries
    raw_sections = re.split(r'\n{2,}', text)
    paragraphs = [p.strip() for p in raw_sections if p.strip()]

    if not paragraphs:
        paragraphs = [text.strip()]

    chunks: List[str] = []
    current_paragraphs: List[str] = []
    current_word_count = 0

    for p in paragraphs:
        p_words = len(p.split())
        
        # If a single paragraph is larger than the target, break it by sentences
        if p_words > target_word_count:
            # If we already have accumulated paragraphs, flush them first
            if current_paragraphs:
                chunk_str = "\n\n".join(current_paragraphs)
                chunks.append(chunk_str)
                # Compute overlap for the next chunk
                overlap_text = get_overlap_words(chunk_str, overlap_word_count)
                current_paragraphs = [overlap_text] if overlap_text else []
                current_word_count = len(overlap_text.split()) if overlap_text else 0

            # Break large paragraph by sentences
            sentences = re.split(r'(?<=[.!?])\s+', p)
            temp_sentence_block: List[str] = []
            temp_count = 0
            
            for s in sentences:
                s_words = len(s.split())
                if temp_count + s_words > target_word_count and temp_sentence_block:
                    block_text = " ".join(temp_sentence_block)
                    chunks.append(block_text)
                    overlap = get_overlap_words(block_text, overlap_word_count)
                    temp_sentence_block = [overlap] if overlap else []
                    temp_count = len(overlap.split()) if overlap else 0
                temp_sentence_block.append(s)
                temp_count += s_words
                
            if temp_sentence_block:
                current_paragraphs.append(" ".join(temp_sentence_block))
                current_word_count += temp_count
            continue

        # Normal accumulation
        if current_word_count + p_words > target_word_count and current_paragraphs:
            chunk_str = "\n\n".join(current_paragraphs)
            chunks.append(chunk_str)
            overlap_text = get_overlap_words(chunk_str, overlap_word_count)
            current_paragraphs = [overlap_text] if overlap_text else []
            current_word_count = len(overlap_text.split()) if overlap_text else 0

        current_paragraphs.append(p)
        current_word_count += p_words

    if current_paragraphs:
        final_chunk = "\n\n".join(current_paragraphs).strip()
        if final_chunk:
            chunks.append(final_chunk)

    return chunks if chunks else [text]

def get_overlap_words(text: str, num_words: int) -> str:
    """Extract the last num_words from text to use as overlap for the subsequent chunk."""
    words = text.split()
    if len(words) <= num_words:
        return text
    return " ".join(words[-num_words:])
