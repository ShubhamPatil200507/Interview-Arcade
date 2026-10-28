"""
Interview Arcade — Core Configuration Settings
Type-safe application configuration powered by Pydantic Settings.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Interview Arcade"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Security & JWT Token Configuration
    JWT_SECRET_KEY: str = "ia_super_secret_dev_key_change_in_production_99x"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database Configuration (SQLite with thread-safety for async/sync tests)
    DATABASE_URL: str = "sqlite:///./interview_arcade.db"
    
    # Allowed CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "null",  # for local file:// testing
    ]
    
    # Rate Limiting Defaults
    AUTH_RATE_LIMIT: str = "10/minute"
    SUBMIT_RATE_LIMIT: str = "30/minute"
    
    # AI Evaluation & LLM Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
