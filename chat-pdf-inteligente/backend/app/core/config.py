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
        env_file = ".env"
        case_sensitive = False

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    return Settings()
