"""Application configuration using Pydantic Settings."""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Firebase
    firebase_credentials_path: str = "firebase-credentials.json"
    
    # JWT (for custom token generation)
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # App
    debug: bool = True
    app_name: str = "FastAPI + Firebase Boilerplate"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
