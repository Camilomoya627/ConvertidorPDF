from fastapi import HTTPException, status


class FileTooLargeError(HTTPException):
    def __init__(self, max_mb: int):
        super().__init__(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"El archivo supera el límite de {max_mb}MB.",
        )


class InvalidPDFError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El archivo no es un PDF válido o está corrupto.",
        )


class EmptyPDFError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No se pudo extraer texto del PDF. ¿Es un PDF escaneado?",
        )


class DocumentNotFoundError(HTTPException):
    def __init__(self, doc_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Documento '{doc_id}' no encontrado.",
        )


class EmbeddingError(HTTPException):
    def __init__(self, detail: str = "Error al generar embeddings."):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
        )
