import asyncio
from openai import AsyncOpenAI
from app.core.config import get_settings
from app.core.exceptions import EmbeddingError

settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)

# OpenAI permite hasta 2048 inputs por request, usamos batches de 100
BATCH_SIZE = 100


async def generate_embedding(text: str) -> list[float]:
    """Genera un embedding para un texto individual."""
    try:
        response = await client.embeddings.create(
            model=settings.embedding_model,
            input=text,
        )
        return response.data[0].embedding
    except Exception as e:
        raise EmbeddingError(f"Error al generar embedding: {str(e)}")


async def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """
    Genera embeddings en batches para evitar límites de la API.
    Returns: lista de vectores en el mismo orden que texts.
    """
    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        try:
            response = await client.embeddings.create(
                model=settings.embedding_model,
                input=batch,
            )
            # Los resultados vienen ordenados por índice
            batch_embeddings = [item.embedding for item in sorted(response.data, key=lambda x: x.index)]
            all_embeddings.extend(batch_embeddings)

            # Pequeña pausa entre batches para no saturar la API
            if i + BATCH_SIZE < len(texts):
                await asyncio.sleep(0.1)

        except Exception as e:
            raise EmbeddingError(f"Error en batch de embeddings: {str(e)}")

    return all_embeddings
