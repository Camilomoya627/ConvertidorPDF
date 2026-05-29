from fastapi import APIRouter, UploadFile, File, Depends
from app.core.config import get_settings, Settings
from app.core.exceptions import FileTooLargeError, InvalidPDFError
from app.models.schemas import UploadResponse, DocumentListResponse, DocumentInfo
from app.services.pdf_service import extract_text_from_pdf, create_chunks
from app.services.embedding_service import generate_embeddings_batch
from app.services.supabase_service import save_document, save_chunks, list_documents, delete_document, get_document
from app.core.exceptions import DocumentNotFoundError
from datetime import datetime

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
):
    """
    Sube un PDF, extrae texto, genera embeddings y guarda en Supabase.
    """
    # Validar tipo de archivo
    if not file.filename.lower().endswith(".pdf"):
        raise InvalidPDFError()

    # Leer y validar tamaño
    file_bytes = await file.read()
    if len(file_bytes) > settings.max_file_size_bytes:
        raise FileTooLargeError(settings.max_file_size_mb)

    # Extraer texto del PDF
    pages_text, total_pages = extract_text_from_pdf(file_bytes)

    # Crear chunks
    chunks = create_chunks(
        pages_text,
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
    )

    # Generar embeddings en batch
    texts = [c.content for c in chunks]
    embeddings = await generate_embeddings_batch(texts)

    # Guardar documento en Supabase
    document_id = await save_document(
        filename=file.filename,
        pages=total_pages,
        chunks_count=len(chunks),
    )

    # Preparar y guardar chunks con embeddings
    chunks_data = [
        {
            "content": chunk.content,
            "page": chunk.page,
            "chunk_index": chunk.chunk_index,
            "embedding": embedding,
        }
        for chunk, embedding in zip(chunks, embeddings)
    ]
    await save_chunks(document_id, chunks_data)

    return UploadResponse(
        document_id=document_id,
        filename=file.filename,
        pages=total_pages,
        chunks=len(chunks),
        message=f"PDF procesado exitosamente. {len(chunks)} fragmentos indexados.",
    )


@router.get("/", response_model=DocumentListResponse)
async def get_documents():
    """Lista todos los documentos procesados."""
    docs = await list_documents()
    return DocumentListResponse(
        documents=[
            DocumentInfo(
                id=d["id"],
                filename=d["filename"],
                pages=d["pages"],
                chunks=d["chunks_count"],
                created_at=d["created_at"],
            )
            for d in docs
        ],
        total=len(docs),
    )


@router.delete("/{document_id}")
async def remove_document(document_id: str):
    """Elimina un documento y todos sus chunks."""
    doc = await get_document(document_id)
    if not doc:
        raise DocumentNotFoundError(document_id)
    await delete_document(document_id)
    return {"message": f"Documento '{doc['filename']}' eliminado correctamente."}
