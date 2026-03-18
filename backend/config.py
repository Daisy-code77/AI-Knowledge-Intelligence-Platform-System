import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Knowledge Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    UPLOAD_DIR: str = "uploads"
    VECTOR_STORE_DIR: str = "vector_store"
    
    # AI Config
    OPENAI_API_KEY: str | None = None
    GOOGLE_API_KEY: str | None = None
    PRIMARY_AI_MODEL: str = "gemini-1.5-flash"
    SECONDARY_AI_MODEL: str = "gemini-1.5-pro"
    
    # Model Config (Defaulting to open source sentence-transformers for local execution)
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    class Config:
        env_file = ".env"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.VECTOR_STORE_DIR, exist_ok=True)
