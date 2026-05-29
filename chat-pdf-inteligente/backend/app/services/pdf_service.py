import fitz  # PyMuPDF
import re
from dataclasses import dataclass
from app.core.exceptions import InvalidPDFError, EmptyPDFError


@dataclass
class TextChunk:
    content: str
    page: int
    chunk_index: int


def extract_text_from_pdf(file_bytes: bytes) -> tuple[list[dict], int]:
    """
    Extrae texto de un PDF página por página.
    Returns: (pages_text, total_pages)
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception:
        raise InvalidPDFError()

    pages_text = []
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text("text")
        text = _clean_text(text)
        if text:
            pages_text.append({"page": page_num, "text": text})

    doc.close()

    if not pages_text:
        raise EmptyPDFError()

    total_pages = len(doc) if not doc.is_closed else len(pages_text)
    return pages_text, total_pages


def create_chunks(
    pages_text: list[dict],
    chunk_size: int = 500,
    chunk_overlap: int = 50,
) -> list[TextChunk]:
    """
    Divide el texto en chunks con overlap para mantener contexto.
    """
    chunks: list[TextChunk] = []
    chunk_index = 0

    for page_data in pages_text:
        page_num = page_data["page"]
        text = page_data["text"]
        words = text.split()

        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk_words = words[start:end]
            content = " ".join(chunk_words).strip()

            if content:
                chunks.append(
                    TextChunk(
                        content=content,
                        page=page_num,
                        chunk_index=chunk_index,
                    )
                )
                chunk_index += 1

            # Avanza con overlap
            start += chunk_size - chunk_overlap
            if start >= len(words):
                break

    return chunks


def _clean_text(text: str) -> str:
    """Limpia el texto extraído del PDF."""
    # Elimina caracteres de control excepto saltos de línea
    text = re.sub(r"[^\S\n]+", " ", text)
    # Colapsa múltiples saltos de línea
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Elimina líneas vacías al inicio/fin
    text = text.strip()
    return text
