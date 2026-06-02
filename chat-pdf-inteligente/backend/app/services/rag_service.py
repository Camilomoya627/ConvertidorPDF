from groq import AsyncGroq
from app.core.config import get_settings
from app.models.schemas import ChatResponse, SourceChunk
from app.services.embedding_service import generate_embedding
from app.services.supabase_service import semantic_search, get_document
from app.core.exceptions import DocumentNotFoundError

settings = get_settings()
# Inicializamos el cliente oficial asíncrono de Groq
client = AsyncGroq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """Eres un asistente experto en análisis de documentos.
Responde las preguntas del usuario ÚNICAMENTE basándote en el contexto proporcionado.
Si la respuesta no está en el contexto, di claramente: "No encontré información sobre eso en el documento."
Sé preciso, claro y cita la información relevante cuando sea útil.
Responde siempre en el mismo idioma que la pregunta."""


async def answer_question(
    document_id: str,
    question: str,
    history: list[dict],
) -> ChatResponse:
    """Pipeline RAG completo usando Groq."""
    doc = await get_document(document_id)
    if not doc:
        raise DocumentNotFoundError(document_id)

    query_embedding = await generate_embedding(question)

    relevant_chunks: list[SourceChunk] = await semantic_search(
        document_id=document_id,
        query_embedding=query_embedding,
        match_count=5,
        similarity_threshold=0.20, # Reducido levemente para ajustarse a la escala de bge-small
    )

    if relevant_chunks:
        context_parts = []
        for i, chunk in enumerate(relevant_chunks, 1):
            context_parts.append(f"[Fragmento {i} - Página {chunk.page}]\n{chunk.content}")
        context = "\n\n---\n\n".join(context_parts)
    else:
        context = "No se encontraron fragmentos relevantes para esta pregunta."

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"Documento: {doc['filename']}\n\nContexto del documento:\n{context}",
        },
        {"role": "assistant", "content": "Entendido. Estoy listo para responder preguntas sobre este documento."},
    ]

    for msg in history[-6:]:
        if msg.get("role") in ("user", "assistant") and msg.get("content"):
            messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": question})

    # Llamada nativa a la red de Groq
    response = await client.chat.completions.create(
        model=settings.chat_model,
        messages=messages,
        temperature=0.1,
        max_tokens=1500,
    )

    answer = response.choices[0].message.content.strip()

    return ChatResponse(
        answer=answer,
        sources=relevant_chunks,
        model=settings.chat_model,
    )
