import asyncio
from groq import AsyncGroq
from app.core.config import get_settings
from app.core.exceptions import EmbeddingError

settings = get_settings()
# Usamos el cliente de Groq que ya funciona perfectamente en tu red de Render
client = AsyncGroq(api_key=settings.groq_api_key)

BATCH_SIZE = 32


async def generate_embedding(text: str) -> list[float]:
    """Genera un embedding gratuito utilizando la API de Groq."""
    try:
        response = await client.embeddings.create(
            model=settings.embedding_model,
            input=[text]
        )
        return response.data[0].embedding
    except Exception as e:
        raise EmbeddingError(f"Error al generar embedding en Groq: {str(e)}")


async def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Genera embeddings en bloques controlados usando Groq."""
    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        try:
            response = await client.embeddings.create(
                model=settings.embedding_model,
                input=batch
            )
            # Extraer vectores preservando el orden
            batch_embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(batch_embeddings)

            if i + BATCH_SIZE < len(texts):
                await asyncio.sleep(0.2)

        except Exception as e:
            raise EmbeddingError(f"Error en batch de embeddings Groq: {str(e)}")

    return all_embeddings
