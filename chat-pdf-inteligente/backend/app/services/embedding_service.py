import asyncio
import httpx
from app.core.config import get_settings
from app.core.exceptions import EmbeddingError

settings = get_settings()
COHERE_URL = "https://api.cohere.com/v1/embed"

# Preparamos las cabeceras con la API key de Cohere
headers = {
    "Authorization": f"Bearer {settings.cohere_api_key}",
    "Content-Type": "application/json"
}

BATCH_SIZE = 96


async def generate_embedding(text: str) -> list[float]:
    """Genera un embedding gratuito usando Cohere."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {
                "model": settings.embedding_model,
                "texts": [text],
                "input_type": "search_query"
            }
            response = await client.post(COHERE_URL, json=payload, headers=headers)
            if response.status_code != 200:
                raise EmbeddingError(f"Cohere respondió con error {response.status_code}: {response.text}")
            
            return response.json()["embeddings"][0]
    except Exception as e:
        raise EmbeddingError(f"Error al generar embedding en Cohere: {str(e)}")


async def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Genera embeddings por lotes usando Cohere."""
    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                payload = {
                    "model": settings.embedding_model,
                    "texts": batch,
                    "input_type": "search_document"
                }
                response = await client.post(COHERE_URL, json=payload, headers=headers)
                if response.status_code != 200:
                    raise EmbeddingError(f"Cohere Batch falló con error {response.status_code}: {response.text}")
                
                all_embeddings.extend(response.json()["embeddings"])

            if i + BATCH_SIZE < len(texts):
                await asyncio.sleep(0.2)

        except Exception as e:
            raise EmbeddingError(f"Error en batch de embeddings Cohere: {str(e)}")

    return all_embeddings
