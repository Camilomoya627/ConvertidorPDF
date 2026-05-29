from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ── Upload ────────────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    document_id: str
    filename: str
    pages: int
    chunks: int
    message: str


# ── Chat ──────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    document_id: str = Field(..., description="ID del documento en Supabase")
    question: str = Field(..., min_length=1, max_length=1000, description="Pregunta del usuario")
    history: list[dict] = Field(default=[], description="Historial de conversación [{role, content}]")


class SourceChunk(BaseModel):
    content: str
    page: int
    similarity: float


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]
    model: str


# ── Documents ─────────────────────────────────────────────────────────────────

class DocumentInfo(BaseModel):
    id: str
    filename: str
    pages: int
    chunks: int
    created_at: datetime


class DocumentListResponse(BaseModel):
    documents: list[DocumentInfo]
    total: int
