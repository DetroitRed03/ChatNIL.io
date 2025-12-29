-- Migration: Document Analysis System
-- Description: Tables for storing user-uploaded documents, extracted text chunks, and analysis results

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- Table: documents
-- Stores document metadata and full extracted text
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File metadata
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type (application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, image/jpeg, etc.)
  file_size INTEGER NOT NULL, -- in bytes
  storage_path TEXT, -- path in Supabase Storage (null if not stored)

  -- Extraction results
  extracted_text TEXT, -- full extracted text
  extraction_status TEXT NOT NULL DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  extraction_method TEXT, -- 'pdf-parse', 'mammoth', 'tesseract', etc.
  extraction_error TEXT, -- error message if failed

  -- Document classification
  document_type TEXT DEFAULT 'other' CHECK (document_type IN ('contract', 'amendment', 'endorsement', 'agreement', 'letter', 'other')),
  source TEXT NOT NULL DEFAULT 'library' CHECK (source IN ('library', 'chat_attachment')),
  chat_id TEXT, -- if source is 'chat_attachment', reference to chat

  -- Statistics
  page_count INTEGER,
  word_count INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(extraction_status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);

-- ============================================
-- Table: document_chunks
-- Stores chunked text with embeddings for semantic search
-- ============================================
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  -- Chunk content
  chunk_index INTEGER NOT NULL, -- order within document
  chunk_text TEXT NOT NULL,
  token_count INTEGER,

  -- Position in original document
  start_char INTEGER,
  end_char INTEGER,
  page_number INTEGER, -- if available from PDF

  -- Vector embedding (OpenAI text-embedding-ada-002 = 1536 dimensions)
  embedding vector(1536),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for document_chunks
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_order ON document_chunks(document_id, chunk_index);

-- Vector similarity search index (IVFFlat for performance)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ============================================
-- Table: document_analysis_results
-- Caches AI analysis results for documents
-- ============================================
CREATE TABLE IF NOT EXISTS document_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

  -- Analysis details
  analysis_type TEXT NOT NULL, -- 'contract_review', 'red_flags', 'summary', 'key_terms', etc.
  analysis_result JSONB NOT NULL, -- structured analysis output
  model_used TEXT, -- 'gpt-4', 'gpt-4-turbo', etc.

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint to prevent duplicate analysis types per document
  UNIQUE(document_id, analysis_type)
);

-- Index for analysis lookups
CREATE INDEX IF NOT EXISTS idx_document_analysis_document_id ON document_analysis_results(document_id);

-- ============================================
-- Function: match_document_chunks
-- Semantic search over user's document chunks
-- ============================================
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  p_user_id UUID,
  match_count INT DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  file_name TEXT,
  document_type TEXT,
  chunk_text TEXT,
  chunk_index INT,
  page_number INT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id AS chunk_id,
    dc.document_id,
    d.file_name,
    d.document_type,
    dc.chunk_text,
    dc.chunk_index,
    dc.page_number,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE
    d.user_id = p_user_id
    AND d.extraction_status = 'completed'
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================
-- Function: Get user's recent documents
-- ============================================
CREATE OR REPLACE FUNCTION get_user_documents(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  file_name TEXT,
  file_type TEXT,
  file_size INT,
  document_type TEXT,
  extraction_status TEXT,
  source TEXT,
  page_count INT,
  word_count INT,
  created_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.file_name,
    d.file_type,
    d.file_size,
    d.document_type,
    d.extraction_status,
    d.source,
    d.page_count,
    d.word_count,
    d.created_at,
    d.processed_at
  FROM documents d
  WHERE d.user_id = p_user_id
  ORDER BY d.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- Row Level Security
-- ============================================

-- Enable RLS on all tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analysis_results ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass for documents
CREATE POLICY "Service role has full access to documents"
  ON documents FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Document chunks policies (access through document ownership)
CREATE POLICY "Users can view chunks of own documents"
  ON document_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_chunks.document_id
      AND d.user_id = auth.uid()
    )
  );

-- Service role bypass for chunks
CREATE POLICY "Service role has full access to document_chunks"
  ON document_chunks FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Analysis results policies
CREATE POLICY "Users can view analysis of own documents"
  ON document_analysis_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_analysis_results.document_id
      AND d.user_id = auth.uid()
    )
  );

-- Service role bypass for analysis results
CREATE POLICY "Service role has full access to document_analysis_results"
  ON document_analysis_results FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Trigger: Update updated_at on documents
-- ============================================
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_documents_updated_at ON documents;
CREATE TRIGGER trigger_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- ============================================
-- Create Storage bucket for user documents
-- Note: This should be run via Supabase dashboard or management API
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('user-documents', 'user-documents', false)
-- ON CONFLICT (id) DO NOTHING;
