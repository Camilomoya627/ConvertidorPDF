import sys
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import get_settings
from app.api.routes import documents, chat

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

settings = get_settings()

app = FastAPI(
    title="Chat PDF Inteligente API",
    description="Sistema RAG para conversar con documentos PDF usando Cohere, Groq y Supabase.",
    version="1.0.0",
    docs_url="/docs" if settings.app_env == "development" else None,
    redoc_url="/redoc" if settings.app_env == "development" else None,
)

# ── CONFIGURACIÓN DE CORS DE MANERA EXPLÍCITA ─────────────────────────────────
# Definimos los orígenes permitidos de forma directa y segura
origins = [
    "http://localhost:5173",
    "https://convertidorpdf-web.vercel.app"  # 👈 Tu frontend de Vercel autorizado explícitamente
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Usamos la lista explícita para evitar fallos de CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(documents.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error interno: {str(exc)}"},
    )


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/", tags=["health"])
async def root():
    return {"message": "Chat PDF Inteligente API"}
