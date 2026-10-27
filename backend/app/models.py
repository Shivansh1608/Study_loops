import datetime
from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, DateTime, 
    Float, JSON, Boolean, Index
)
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="user", cascade="all, delete-orphan")
    attempts = relationship("Attempt", back_populates="user", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    text = Column(Text, nullable=False)
    page_count = Column(Integer, default=1)
    file_type = Column(String(50), default="pdf")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="document", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="document", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="document", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="document", cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)

    document = relationship("Document", back_populates="chunks")
    questions = relationship("Question", back_populates="chunk", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_id = Column(Integer, ForeignKey("chunks.id", ondelete="CASCADE"), nullable=True, index=True)
    type = Column(String(30), default="mcq", index=True)  # mcq | true_false | short_answer
    question = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of strings
    correct_index = Column(Integer, nullable=True)
    correct_answer = Column(Text, nullable=True)
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(20), default="medium", index=True)  # easy, medium, hard
    topic = Column(String(100), default="General", index=True)
    created_at = Column(DateTime, default=utc_now)

    document = relationship("Document", back_populates="questions")
    chunk = relationship("Chunk", back_populates="questions")
    quiz_associations = relationship("QuizQuestion", back_populates="question", cascade="all, delete-orphan")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    difficulty = Column(String(20), default="medium")
    question_type = Column(String(20), default="mcq")        # mcq | true_false | mixed
    time_limit_sec = Column(Integer, nullable=True)           # per-question or overall quiz seconds
    num_questions = Column(Integer, default=5)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="quizzes")
    document = relationship("Document", back_populates="quizzes")
    quiz_questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan", order_by="QuizQuestion.position")
    attempts = relationship("Attempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), primary_key=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), primary_key=True)
    position = Column(Integer, default=0)

    quiz = relationship("Quiz", back_populates="quiz_questions")
    question = relationship("Question", back_populates="quiz_associations")

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    duration_sec = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("AttemptAnswer", back_populates="attempt", cascade="all, delete-orphan")

class AttemptAnswer(Base):
    __tablename__ = "attempt_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("attempts.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    chosen_index = Column(Integer, nullable=True)
    answer_text = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=False, default=False)
    time_spent_sec = Column(Integer, default=0)

    attempt = relationship("Attempt", back_populates="answers")
    question = relationship("Question")

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    topic = Column(String(100), default="General", index=True)
    ease = Column(Float, default=2.5)
    interval = Column(Integer, default=0)
    repetitions = Column(Integer, default=0)
    due_date = Column(DateTime, default=utc_now, index=True)
    last_reviewed = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="flashcards")
    document = relationship("Document", back_populates="flashcards")

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    content_markdown = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now)

    document = relationship("Document", back_populates="summaries")

# Indexes
Index("idx_flashcards_user_due", Flashcard.user_id, Flashcard.due_date)
Index("idx_quizzes_user_doc", Quiz.user_id, Quiz.document_id)
Index("idx_quizzes_user_id", Quiz.user_id)
Index("idx_quizzes_doc_id", Quiz.document_id)
Index("idx_questions_doc_id", Question.document_id)
Index("idx_attempts_user_id", Attempt.user_id)
Index("idx_attempts_quiz_id", Attempt.quiz_id)
Index("idx_attempt_answers_attempt_id", AttemptAnswer.attempt_id)
Index("idx_attempt_answers_question_id", AttemptAnswer.question_id)
