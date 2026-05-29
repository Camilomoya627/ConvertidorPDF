-- ============================================================
-- Chat PDF Inteligente — Schema Supabase + pgvector
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 2. Tabla de documentos
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename    TEXT NOT NULL,
    pages       INTEGER NOT NULL DEFAULT 0,
    chunks_count INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Tabla de chunks con embeddings
-- text-embedding-3-small → 1536 dimensiones
-- ============================================================
CREATE TABLE IF NOT EXISTS document_chunks (
    id          BIGSERIAL PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    page        INTEGER NOT NULL,
    chunk_index INTEGER NOT NULL,
    embedding   VECTOR(1536),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. Índices para búsqueda eficiente
-- ============================================================

-- Índice IVFFlat para similitud coseno (recomendado para >10k vectores)
-- lists = sqrt(número de filas esperadas); para MVP usar 100
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
    ON document_chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Índice en document_id para filtrar por documento
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx
    ON document_chunks (document_id);

-- Índice en documents.created_at para ordenar
CREATE INDEX IF NOT EXISTS documents_created_at_idx
    ON documents (created_at DESC);

-- ============================================================
-- 5. Función RPC para búsqueda semántica
-- Esta función es llamada desde el backend con supabase.rpc()
-- ============================================================
CREATE OR REPLACE FUNCTION match_chunks(
    query_embedding     VECTOR(1536),
    filter_document_id  UUID,
    match_count         INTEGER DEFAULT 5,
    similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
    id          BIGINT,
    content     TEXT,
    page        INTEGER,
    chunk_index INTEGER,
    similarity  FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.content,
        dc.page,
        dc.chunk_index,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM document_chunks dc
    WHERE
        dc.document_id = filter_document_id
        AND 1 - (dc.embedding <=> query_embedding) > similarity_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================
-- 6. Row Level Security (RLS)
-- El backend usa service_key → tiene acceso total
-- Si quieres anon access, ajusta las políticas
-- ============================================================
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Política: service_role tiene acceso total (para el backend)
CREATE POLICY "service_role_all_documents"
    ON documents FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_role_all_chunks"
    ON document_chunks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- 7. Verificar instalación
-- ============================================================
SELECT
    'pgvector version' AS check_name,
    extversion AS value
FROM pg_extension
WHERE extname = 'vector'

UNION ALL

SELECT
    'documents table',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'documents'
    ) THEN 'OK' ELSE 'MISSING' END

UNION ALL

SELECT
    'document_chunks table',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'document_chunks'
    ) THEN 'OK' ELSE 'MISSING' END

UNION ALL

SELECT
    'match_chunks function',
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'match_chunks'
    ) THEN 'OK' ELSE 'MISSING' END;
