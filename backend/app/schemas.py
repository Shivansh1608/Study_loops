from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    password: str = Field(min_length=6)

class UserLogin(BaseModel):
    email: str = Field(..., pattern=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    created_at: datetime

# Chunk Schema
class ChunkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    index: int
    text: str

# Document Schemas
class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    page_count: int
    file_type: str
    created_at: datetime
    chunk_count: Optional[int] = 0

class DocumentDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    text: str
    page_count: int
    file_type: str
    created_at: datetime
    chunks: List[ChunkOut] = []

# Question & Quiz Schemas
class QuestionAI(BaseModel):
    question: str
    options: List[str] = Field(description="Plausible options (4 for MCQ, 2 for True/False)")
    correct_index: Optional[int] = Field(default=None, description="0-indexed position of correct answer")
    correct_answer: Optional[str] = Field(default=None, description="Text of correct answer")
    explanation: str = Field(description="Explanation grounded strictly in provided notes")
    difficulty: str = Field(default="medium", description="easy, medium, or hard")
    topic: str = Field(default="General", description="Subject or subtopic")
    type: str = Field(default="mcq", description="mcq, true_false, or short_answer")

class AIQuizGenerationResponse(BaseModel):
    questions: List[QuestionAI]

class QuestionClientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    question: str
    options: List[str]
    difficulty: str
    topic: str
    type: str = "mcq"

class QuestionReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    question: str
    options: List[str]
    correct_index: Optional[int] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    difficulty: str
    topic: str
    type: str = "mcq"

# Keep QuestionOut as an alias for backwards compatibility
QuestionOut = QuestionReviewOut

class CreateQuizRequest(BaseModel):
    num_questions: int = Field(default=5, ge=1, le=50)
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard|mixed)$")
    question_type: str = Field(default="mcq", pattern="^(mcq|true_false|mixed)$")
    topic_focus: Optional[str] = Field(default=None, max_length=200)
    topics: Optional[List[str]] = Field(default=None)
    time_limit_sec: Optional[int] = Field(default=None, ge=15, le=3600)

class QuizOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    document_id: int
    title: Optional[str] = None
    difficulty: str
    question_type: str
    time_limit_sec: Optional[int] = None
    num_questions: int
    created_at: datetime
    questions: List[QuestionClientOut] = []

class QuizListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    document_id: int
    title: Optional[str] = None
    difficulty: str
    question_type: str
    time_limit_sec: Optional[int] = None
    num_questions: int
    created_at: datetime
    attempts_count: int = 0
    best_score: Optional[int] = None
    best_score_pct: Optional[float] = None

# Attempt Schemas
class AnswerSubmission(BaseModel):
    question_id: int
    chosen_index: Optional[int] = None
    answer_text: Optional[str] = None
    time_spent_sec: int = Field(default=0, ge=0)

class SubmitAttemptRequest(BaseModel):
    duration_sec: int = Field(default=0, ge=0)
    answers: List[AnswerSubmission]

class AttemptAnswerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    question_id: int
    chosen_index: Optional[int] = None
    answer_text: Optional[str] = None
    is_correct: bool
    time_spent_sec: int = 0
    question: QuestionReviewOut

class AttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    quiz_id: int
    score: int
    total: int
    duration_sec: int
    created_at: datetime
    answers: List[AttemptAnswerOut] = []

# Flashcard Schemas
class FlashcardAI(BaseModel):
    front: str = Field(description="Front of card: concept, question, or term")
    back: str = Field(description="Back of card: concise definition or answer")
    topic: str = Field(default="General")

class AIFlashcardsResponse(BaseModel):
    flashcards: List[FlashcardAI]

class CreateFlashcardsRequest(BaseModel):
    count: int = Field(default=10, ge=1, le=50)

class FlashcardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    document_id: int
    front: str
    back: str
    topic: str
    ease: float
    interval: int
    repetitions: int
    due_date: datetime
    last_reviewed: Optional[datetime] = None

class ReviewFlashcardRequest(BaseModel):
    quality: int = Field(ge=0, le=5, description="SM-2 quality rating from 0 (complete blackout) to 5 (perfect recall)")

# Summary Schemas
class SummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    document_id: int
    content_markdown: str
    created_at: datetime

# Progress & Analytics Schemas
class ProgressOverview(BaseModel):
    total_quizzes_taken: int
    average_score_pct: float
    total_flashcards: int
    cards_due_today: int
    cards_mastered: int  # interval >= 21
    current_streak_days: int

class TopicScore(BaseModel):
    topic: str
    total_questions: int
    correct_count: int
    accuracy_pct: float

class ScoreOverTime(BaseModel):
    date: str
    score_pct: float
    quiz_id: int
    total: int

class WeakTopic(BaseModel):
    topic: str
    accuracy_pct: float
    missed_count: int
