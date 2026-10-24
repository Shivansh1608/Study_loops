import os
import json
import re
import logging
from typing import Type, TypeVar, Optional, Dict, Any
from pydantic import BaseModel, ValidationError
from app.config import settings

logger = logging.getLogger("notes-quiz.ai")

T = TypeVar("T", bound=BaseModel)

def extract_json_block(text: str) -> str:
    """Extract raw JSON substring from model responses that might contain markdown formatting."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    # Try finding the first '{' and last '}'
    start_brace = text.find("{")
    end_brace = text.rfind("}")
    if start_brace != -1 and end_brace != -1 and end_brace > start_brace:
        return text[start_brace:end_brace + 1]
    return text

class BaseAIAdapter:
    def generate(self, prompt: str, schema: Type[T], system_prompt: Optional[str] = None) -> str:
        raise NotImplementedError

class GeminiAdapter(BaseAIAdapter):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if not self.api_key:
            logger.warning("Gemini API key is empty.")

    def generate(self, prompt: str, schema: Type[T], system_prompt: Optional[str] = None) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not configured.")

        # Attempt to use google-genai SDK
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=self.api_key)
            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                temperature=0.2,
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=config,
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API generation error: {e}")
            raise

class ClaudeAdapter(BaseAIAdapter):
    def __init__(self, api_key: str):
        self.api_key = api_key
        if not self.api_key:
            logger.warning("Anthropic API key is empty.")

    def generate(self, prompt: str, schema: Type[T], system_prompt: Optional[str] = None) -> str:
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not configured.")

        try:
            import anthropic

            client = anthropic.Anthropic(api_key=self.api_key)
            schema_json = json.dumps(schema.model_json_schema(), indent=2)
            combined_prompt = (
                f"{prompt}\n\nYou MUST respond with valid JSON strictly conforming to this JSON schema:\n{schema_json}"
            )

            kwargs: Dict[str, Any] = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 4096,
                "messages": [{"role": "user", "content": combined_prompt}],
                "temperature": 0.2,
            }
            if system_prompt:
                kwargs["system"] = system_prompt

            response = client.messages.create(**kwargs)
            # Anthropic returns content blocks
            return response.content[0].text
        except Exception as e:
            logger.error(f"Claude API generation error: {e}")
            raise

class FallbackMockAdapter(BaseAIAdapter):
    """
    Intelligent local heuristic generator used when no external API key is configured.
    Ensures that development and local testing can generate realistic quizzes and cards.
    """
    def generate(self, prompt: str, schema: Type[T], system_prompt: Optional[str] = None) -> str:
        schema_name = schema.__name__
        logger.info(f"Using FallbackMockAdapter for schema {schema_name}")

        # Extract text snippets from prompt
        match = re.search(r"--- BEGIN NOTES TEXT ---\s*([\s\S]*?)\s*--- END NOTES TEXT ---", prompt)
        notes = match.group(1).strip() if match else prompt
        sentences = [s.strip() for s in re.split(r"[.!?]\s+", notes) if len(s.strip()) > 15]
        if not sentences:
            sentences = ["The study material covers fundamental concepts and key principles."]

        if "Quiz" in schema_name:
            questions = []
            for i, sent in enumerate(sentences[:5]):
                words = sent.split()
                key_word = words[0] if words else "Concept"
                questions.append({
                    "question": f"Based on the notes, what is the core significance of: '{sent[:80]}...'?",
                    "options": [
                        f"It describes {sent[:40]} accurately according to the notes.",
                        f"It contradicts the established observation of {key_word}.",
                        "It is an unrelated hypothesis not verified in the study notes.",
                        "It applies exclusively to outside unrelated mechanisms."
                    ],
                    "correct_index": 0,
                    "explanation": f"Grounded directly in the provided text statement: '{sent[:120]}'.",
                    "difficulty": "medium",
                    "topic": "Key Concepts"
                })
            return json.dumps({"questions": questions})

        elif "Flashcard" in schema_name:
            cards = []
            for i, sent in enumerate(sentences[:6]):
                words = sent.split()
                term = " ".join(words[:3]) if len(words) >= 3 else "Key Term"
                cards.append({
                    "front": f"Define or state the role of: {term}?",
                    "back": sent,
                    "topic": "Core Notes"
                })
            return json.dumps({"flashcards": cards})

        elif "Summary" in schema_name:
            bullet_points = [f"- **{s[:30]}**: {s}" for s in sentences[:4]]
            bullets_str = "\n".join(bullet_points)
            md = f"# Revision Summary\n\n## Key Concepts\n{bullets_str}\n\n## Summary\nAll concepts synthesized from uploaded notes."
            return json.dumps({"markdown_content": md})

        return json.dumps({})

def get_ai_adapter() -> BaseAIAdapter:
    provider = settings.AI_PROVIDER.lower().strip()
    if provider == "gemini" and settings.GEMINI_API_KEY:
        return GeminiAdapter(api_key=settings.GEMINI_API_KEY)
    elif provider in ["claude", "anthropic"] and settings.ANTHROPIC_API_KEY:
        return ClaudeAdapter(api_key=settings.ANTHROPIC_API_KEY)
    else:
        logger.info(f"AI Provider '{provider}' has no valid API key configured; using FallbackMockAdapter for safe local operation.")
        return FallbackMockAdapter()

def generate_json(
    prompt: str,
    schema: Type[T],
    system_prompt: Optional[str] = None,
    max_retries: int = 2,
    adapter: Optional[BaseAIAdapter] = None
) -> dict:
    """
    Provider-agnostic interface with strict Pydantic validation and retry policy.
    Retries up to max_retries (default 2) if parsing or validation fails.
    """
    active_adapter = adapter or get_ai_adapter()
    last_error: Optional[Exception] = None

    for attempt in range(max_retries + 1):
        try:
            logger.info(f"Generating AI JSON response (attempt {attempt + 1}/{max_retries + 1})")
            raw_text = active_adapter.generate(prompt, schema=schema, system_prompt=system_prompt)
            clean_text = extract_json_block(raw_text)
            parsed_data = json.loads(clean_text)
            
            # Validate with Pydantic
            validated_obj = schema.model_validate(parsed_data)
            return validated_obj.model_dump()
        except (json.JSONDecodeError, ValidationError, Exception) as err:
            last_error = err
            logger.warning(f"AI JSON generation failed on attempt {attempt + 1}: {err}")
            if attempt < max_retries:
                # Add corrective guidance to prompt for retry
                prompt = (
                    f"{prompt}\n\nATTENTION: Your previous response was invalid. "
                    f"Error: {str(err)}. Please ensure your output is strictly valid JSON matching the schema."
                )

    raise RuntimeError(f"Failed to generate valid JSON adhering to schema {schema.__name__} after {max_retries + 1} attempts: {last_error}")
