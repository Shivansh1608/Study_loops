from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Notes-to-Quiz Generator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./notes_quiz.db", validation_alias="DATABASE_URL")
    
    # Auth
    SECRET_KEY: str = Field(default="development_secret_key_change_in_production_32bytes", validation_alias="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # AI Providers
    AI_PROVIDER: str = Field(default="gemini", validation_alias="AI_PROVIDER")  # "gemini" or "claude"
    GEMINI_API_KEY: str = Field(default="", validation_alias="GEMINI_API_KEY")
    ANTHROPIC_API_KEY: str = Field(default="", validation_alias="ANTHROPIC_API_KEY")
    
    # Storage & Uploads
    MAX_UPLOAD_SIZE_MB: int = 20
    UPLOAD_DIR: str = "uploads"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
