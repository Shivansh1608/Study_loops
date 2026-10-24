"""Prompt templates for AI-generated quizzes, flashcards, and revision summaries."""

QUIZ_GENERATION_SYSTEM_PROMPT = """You are an expert educational assessment creator.
Your task is to generate high-quality multiple choice questions (MCQs) based EXCLUSIVELY on the provided lecture notes text.
CRITICAL RULES:
1. Use ONLY the provided text. Do NOT bring in outside facts or external knowledge.
2. Every question must have exactly 4 plausible options.
3. Only ONE option must be correct.
4. The correct_index must be the 0-based index (0, 1, 2, or 3) of the correct option.
5. Provide a clear, educational explanation citing facts directly from the text.
6. Follow the requested difficulty strictly:
   - 'easy': Direct recall of stated definitions, key terms, dates, and explicit facts.
   - 'medium': Understanding, concept synthesis, and practical application of principles described in the text.
   - 'hard': Multi-step analytical reasoning, "which statement is FALSE according to the notes", scenario evaluation, or comparing subtle nuances.
7. Assign an accurate 'topic' (e.g., 'Photosynthesis', 'Thermodynamics', 'Linear Algebra') derived from the text section.
8. Output MUST strictly match the requested JSON schema.
"""

def get_quiz_prompt(chunk_text: str, num_questions: int, difficulty: str,
                    question_type: str = "mcq", topic_focus: str | None = None) -> str:
    # Build question-type instruction
    if question_type == "true_false":
        type_instruction = (
            "Generate TRUE/FALSE questions only. "
            "Each question must be a statement that is either True or False. "
            "options must be exactly ['True', 'False']. "
            "correct_index is 0 for True and 1 for False."
        )
    elif question_type == "mixed":
        type_instruction = (
            f"Mix question types: approximately half should be standard MCQ (4 options) "
            f"and half should be True/False (options=['True','False'], correct_index 0 or 1). "
            f"The 'question_type' field in each question should be 'mcq' or 'true_false'."
        )
    else:  # default mcq
        type_instruction = (
            "Generate standard multiple-choice questions with exactly 4 plausible options each."
        )

    topic_line = f"\n- Topic Focus: Concentrate questions on the topic/concept: '{topic_focus}'." if topic_focus else ""

    return f"""Generate exactly {num_questions} question(s) with difficulty '{difficulty}' from the following notes text.

Question Type Instructions: {type_instruction}{topic_line}

--- BEGIN NOTES TEXT ---
{chunk_text}
--- END NOTES TEXT ---

Remember:
- Difficulty: {difficulty}
- Use ONLY the provided notes text.
- 4 options per MCQ question, exactly one correct option (0-indexed correct_index).
- True/False questions have options=['True','False'], correct_index 0 or 1.
- Clear explanation grounded strictly in the notes text.
"""


FLASHCARD_SYSTEM_PROMPT = """You are a cognitive science learning assistant creating spaced repetition flashcards.
Your goal is to extract the most critical concepts, terms, definitions, and relationships from the provided lecture text into high-impact flashcards.
CRITICAL RULES:
1. Ground every flashcard strictly in the provided text.
2. Front: A concise question, term, or prompt that stimulates active recall (e.g., "What is the primary function of ATP synthase?").
3. Back: A clear, concise, self-contained answer or definition. Avoid long paragraphs.
4. Assign an appropriate 'topic' tag based on the subject matter.
5. Output MUST strictly match the requested JSON schema.
"""

def get_flashcards_prompt(chunk_text: str, count: int) -> str:
    return f"""Create {count} high-quality flashcards for active recall from the following notes:

--- BEGIN NOTES TEXT ---
{chunk_text}
--- END NOTES TEXT ---

Provide concise, high-yield front-and-back flashcards.
"""

SUMMARY_SYSTEM_PROMPT = """You are an expert academic tutor and note summarizer.
Synthesize the provided notes into an exceptionally well-structured, clear revision guide in Markdown format.
Include:
- An Executive Overview of main themes
- Key Concepts & Core Principles (with concise bullet points)
- Essential Definitions & Terminology
- Important Formulas, Theorems, or Key Takeaways
Use clean GitHub-flavored markdown with headers, bold terms, and lists.
Ground all points strictly in the provided text.
"""

def get_summary_prompt(full_text: str, title: str) -> str:
    return f"""Synthesize and summarize the following study notes titled '{title}' into a comprehensive revision summary:

--- BEGIN NOTES TEXT ---
{full_text}
--- END NOTES TEXT ---

Format the output in clean, structured Markdown.
"""
