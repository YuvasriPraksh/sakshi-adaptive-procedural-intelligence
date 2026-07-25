"""
Application configuration using Pydantic v2 BaseSettings.
All values are loaded from environment variables or .env file.
"""

from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────────
    APP_NAME: str = "SAKSHI Backend"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "SAKSHI AI-Powered Legal Intelligence Platform"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # ── Server ────────────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1
    RELOAD: bool = True

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/sakshi"

    # ── JWT / Security ────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-this-secret-key-in-production"
    JWT_SECRET: str = "change-this-jwt-secret-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Supabase ──────────────────────────────────────────────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # ── Gemini AI ─────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""

    # ── CORS ──────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v):
        if isinstance(v, str):
            v = v.strip()
            # Handle JSON array string: ["url1","url2"]
            if v.startswith("["):
                import json
                return json.loads(v)
            # Handle comma-separated string: url1,url2
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # ── Logging ───────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/sakshi.log"

    # ── API Prefix ────────────────────────────────────────────────────────────
    API_V1_PREFIX: str = "/api/v1"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance."""
    return Settings()


# Module-level singleton for convenience
settings = get_settings()
