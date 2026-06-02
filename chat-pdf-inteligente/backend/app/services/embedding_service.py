import asyncio
import httpx
import os  # 👈 Importante para leer las variables de Render
from app.core.config import get_settings
from app.core.exceptions import EmbeddingError

settings = get_settings()

# API de Inferencia gratuita
HF_API_URL = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{settings.embedding_model}"
BATCH_SIZE = 32

# 👇 El sistema busca la variable "HF_TOKEN" que configuraste en Render (la que empieza por hf_...)
HF_TOKEN = os.getenv("HF_TOKEN", "")
headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}


async def generate_embedding(text: str) -> list[float]:
    """Genera un embedding gratuito para un texto individual."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                HF_API_URL,
                json={"inputs": [text], "options": {"wait_for_model": True}},
                headers=headers  # 👈 SE AGREGA EL TOKEN AQUÍ
            )
            if response.status_code != 200:
                raise EmbeddingError(f"HF API respondió con código {response.status_code}: {response.text}")
            
            result = response.json()
            return result[0]
    except Exception as e:
        raise EmbeddingError(f"Error al generar embedding gratuito: {str(e)}")


async def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Genera embeddings en bloques controlados sin costo."""
    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    HF_API_URL,
                    json={"inputs": batch, "options": {"wait_for_model": True}},
                    headers=headers  # 👈 SE AGREGA EL TOKEN AQUÍ TAMBIÉN
                )
                if response.status_code != 200:
                    raise EmbeddingError(f"HF Batch falló con código {response.status_code}: {response.text}")
                
                batch_embeddings = response.json()
                all_embeddings.extend(batch_embeddings)

            if i + BATCH_SIZE < len(texts):
                await asyncio.sleep(0.2)

        except Exception as e:
            raise EmbeddingError(f"Error en batch de embeddings: {str(e)}")

    return all_embeddings
