import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import engine, Base
from app.routers import auth, documents, quizzes, flashcards, summaries, progress

# Create database tables automatically
Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notes-quiz")

# Setup SlowAPI rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Notes-to-Quiz Generator API: AI quizzes, flashcards, SM-2 spaced repetition, and revision summaries",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers at root (matching exact prompt specifications: /auth, /documents, /quizzes, etc.)
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(quizzes.router)
app.include_router(flashcards.router)
app.include_router(summaries.router)
app.include_router(progress.router)

# Also mount under /api prefix for compatibility
app.include_router(auth.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(quizzes.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(summaries.router, prefix="/api")
app.include_router(progress.router, prefix="/api")

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "ok",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_provider": settings.AI_PROVIDER
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Notes-to-Quiz Generator API",
        "docs": "/docs",
        "health": "/health"
    }
