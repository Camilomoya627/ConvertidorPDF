from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_service import answer_question

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Responde una pregunta sobre un documento usando RAG.
    """
    return await answer_question(
        document_id=request.document_id,
        question=request.question,
        history=request.history,
    )
