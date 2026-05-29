import uuid
from supabase import create_client, Client
from app.core.config import get_settings
from app.models.schemas import SourceChunk

settings = get_settings()

# Cliente Supabase con service key (acceso completo, solo backend)
supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_key,
)


async def save_document(filename: str, pages: int, chunks_count: int) -> str:
    """Crea el registro del documento y retorna su ID."""
    doc_id = str(uuid.uuid4())
    data = {
        "id": doc_id,
        "filename": filename,
        "pages": pages,
        "chunks_count": chunks_count,
    }
    supabase.table("documents").insert(data).execute()
    return doc_id


async def save_chunks(
    document_id: str,
    chunks: list[dict],  # [{content, page, chunk_index, embedding}]
) -> None:
    """Inserta todos los chunks con sus embeddings en la base de datos."""
    rows = [
        {
            "document_id": document_id,
            "content": c["content"],
            "page": c["page"],
            "chunk_index": c["chunk_index"],
            "embedding": c["embedding"],
        }
        for c in chunks
    ]

    # Inserta en batches de 50 para no saturar Supabase
    batch_size = 50
    for i in range(0, len(rows), batch_size):
        supabase.table("document_chunks").insert(rows[i : i + batch_size]).execute()


async def semantic_search(
    document_id: str,
    query_embedding: list[float],
    match_count: int = 5,
    similarity_threshold: float = 0.3,
) -> list[SourceChunk]:
    """
    Búsqueda semántica usando la función RPC de pgvector.
    Retorna los chunks más similares a la query.
    """
    result = supabase.rpc(
        "match_chunks",
        {
            "query_embedding": query_embedding,
            "filter_document_id": document_id,
            "match_count": match_count,
            "similarity_threshold": similarity_threshold,
        },
    ).execute()

    return [
        SourceChunk(
            content=row["content"],
            page=row["page"],
            similarity=round(row["similarity"], 4),
        )
        for row in (result.data or [])
    ]


async def get_document(document_id: str) -> dict | None:
    """Obtiene metadata de un documento por ID."""
    result = (
        supabase.table("documents")
        .select("*")
        .eq("id", document_id)
        .single()
        .execute()
    )
    return result.data


async def list_documents() -> list[dict]:
    """Lista todos los documentos ordenados por fecha."""
    result = (
        supabase.table("documents")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def delete_document(document_id: str) -> None:
    """Elimina un documento y sus chunks (CASCADE en DB)."""
    supabase.table("documents").delete().eq("id", document_id).execute()
