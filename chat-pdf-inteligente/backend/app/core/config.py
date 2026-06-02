import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str

    # Supabase
    supabase_url: str
    supabase_service_key: str

    # App
    app_env: str = "development"
    max_file_size_mb: int = 10
    allowed_origins: str = "http://localhost:5173"

    # OpenAI models
    embedding_model: str = "text-embedding-3-small"
    chat_model: str = "gpt-4o-mini"

    # Chunking
    chunk_size: int = 500
    chunk_overlap: int = 50

    class Config:
        # 👇 CAMBIO AQUÍ: Ignora el archivo .env si ya estamos en producción en Render
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
    # Si estamos en producción o si las variables esenciales de Supabase existen en el entorno
    if os.getenv("APP_ENV") == "production" or os.getenv("SUPABASE_URL"):
        return Settings(
            openai_api_key=os.getenv("OPENAI_API_KEY", "").strip(),
            supabase_url=os.getenv("SUPABASE_URL", "").strip(),
            supabase_service_key=os.getenv("SUPABASE_SERVICE_KEY", "").strip(),
            app_env=os.getenv("APP_ENV", "production").strip(),
            allowed_origins=os.getenv("ALLOWED_ORIGINS", "*").strip()
        )
    return Settings()