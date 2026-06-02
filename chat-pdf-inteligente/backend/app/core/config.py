import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Claves de IA
    groq_api_key: str
    cohere_api_key: str = "" # Se leerá de las variables de entorno

    # Supabase
    supabase_url: str
    supabase_service_key: str

    # App
    app_env: str = "development"
    max_file_size_mb: int = 10
    allowed_origins: str = "http://localhost:5173"

    # Modelos combinados gratis
    embedding_model: str = "embed-multilingual-v3.0"
    chat_model: str = "llama-3.3-70b-versatile"

    # Chunking
    chunk_size: int = 500
    chunk_overlap: int = 50

    class Config:
        env_file = ".env" if os.getenv("APP_ENV") != "production" else None
        case_sensitive = False

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    if os.getenv("APP_ENV") == "production" or os.getenv("SUPABASE_URL"):
        return Settings(
            groq_api_key=os.getenv("GROQ_API_KEY", "").strip(),
            cohere_api_key=os.getenv("COHERE_API_KEY", "").strip(),
            supabase_url=os.getenv("SUPABASE_URL", "").strip(),
            supabase_service_key=os.getenv("SUPABASE_SERVICE_KEY", "").strip(),
            app_env=os.getenv("APP_ENV", "production").strip(),
            allowed_origins=os.getenv("ALLOWED_ORIGINS", "*").strip()
        )
    return Settings()
