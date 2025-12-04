-- Migration 012: Enable pgvector and create knowledge_base table for RAG
-- This enables semantic search and AI-powered knowledge retrieval using OpenAI embeddings

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Create content_type enum
DO $$ BEGIN
    CREATE TYPE content_type AS ENUM (
      'nil_regulation',
      'compliance_guide',
      'contract_template',
      'educational_article',
      'faq',
      'state_law',
      'deal_example',
      'tax_guide',
      'branding_tip',
      'social_media_guide'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title text NOT NULL,
  content text NOT NULL,
  summary text,

  -- Vector embedding (OpenAI text-embedding-ada-002: 1536 dimensions)
  embedding vector(1536),

  -- Classification
  content_type content_type NOT NULL,
  category text, -- 'nil_basics', 'contracts', 'branding', etc.
  tags text[] DEFAULT '{}',

  -- Source & Attribution
  source_url text,
  author text,
  published_date date,

  -- Metadata
  metadata jsonb DEFAULT '{}', -- Store additional structured data

  -- Search & Discovery
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,

  -- Relevance
  target_roles text[] DEFAULT '{}', -- ['athlete', 'parent', 'agency', 'school']
  difficulty_level text, -- 'beginner', 'intermediate', 'advanced'

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Knowledge base is public read for authenticated users
CREATE POLICY "Authenticated users can view published content" ON knowledge_base
  FOR SELECT USING (is_published = true AND auth.role() = 'authenticated');

-- Service role can manage all content
CREATE POLICY "Service role can manage all knowledge base" ON knowledge_base
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance

-- B-tree indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_type ON knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_is_published ON knowledge_base(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON knowledge_base(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_is_featured ON knowledge_base(is_featured) WHERE is_featured = true;

-- GIN index for tags array search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING gin(tags);

-- GIN index for metadata JSONB search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata ON knowledge_base USING gin(metadata);

-- Full-text search index on title and content
CREATE INDEX IF NOT EXISTS idx_knowledge_base_fts ON knowledge_base
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

-- Vector similarity index (HNSW for fast approximate nearest neighbor search)
-- m=16: number of connections per layer (higher = better recall, more memory)
-- ef_construction=64: size of dynamic candidate list (higher = better index quality, slower build)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments for documentation
COMMENT ON TABLE knowledge_base IS 'Vector-enabled knowledge base for NIL education content and RAG (Retrieval Augmented Generation)';
COMMENT ON COLUMN knowledge_base.embedding IS 'Vector embedding using OpenAI text-embedding-ada-002 (1536 dimensions)';
COMMENT ON COLUMN knowledge_base.content_type IS 'Type of content for categorization and filtering';
COMMENT ON COLUMN knowledge_base.target_roles IS 'User roles this content is most relevant for';
COMMENT ON COLUMN knowledge_base.metadata IS 'Additional structured data (e.g., author info, related links, difficulty metrics)';

-- Create helper function for semantic search
CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_content_type content_type DEFAULT NULL,
  filter_category text DEFAULT NULL,
  filter_roles text[] DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  summary text,
  content_type content_type,
  category text,
  tags text[],
  source_url text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.summary,
    kb.content_type,
    kb.category,
    kb.tags,
    kb.source_url,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM knowledge_base kb
  WHERE
    kb.is_published = true
    AND kb.embedding IS NOT NULL
    AND (filter_content_type IS NULL OR kb.content_type = filter_content_type)
    AND (filter_category IS NULL OR kb.category = filter_category)
    AND (filter_roles IS NULL OR kb.target_roles && filter_roles)
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create helper function for hybrid search (vector + full-text)
CREATE OR REPLACE FUNCTION hybrid_search_knowledge_base(
  query_embedding vector(1536),
  search_query text,
  match_count int DEFAULT 10,
  vector_weight float DEFAULT 0.7,
  text_weight float DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  summary text,
  content_type content_type,
  category text,
  vector_similarity float,
  text_rank float,
  combined_score float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.summary,
    kb.content_type,
    kb.category,
    1 - (kb.embedding <=> query_embedding) as vector_similarity,
    ts_rank(to_tsvector('english', kb.title || ' ' || kb.content), plainto_tsquery('english', search_query)) as text_rank,
    -- Weighted combination: default 70% vector, 30% text
    (vector_weight * (1 - (kb.embedding <=> query_embedding)) +
     text_weight * ts_rank(to_tsvector('english', kb.title || ' ' || kb.content), plainto_tsquery('english', search_query))) as combined_score
  FROM knowledge_base kb
  WHERE
    kb.is_published = true
    AND kb.embedding IS NOT NULL
    AND (
      to_tsvector('english', kb.title || ' ' || kb.content) @@ plainto_tsquery('english', search_query)
      OR 1 - (kb.embedding <=> query_embedding) > 0.5
    )
  ORDER BY combined_score DESC
  LIMIT match_count;
$$;

-- Create helper function to increment view count
CREATE OR REPLACE FUNCTION increment_knowledge_base_views(p_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE knowledge_base
  SET view_count = view_count + 1
  WHERE id = p_id;
$$;

-- Create helper function to get featured content
CREATE OR REPLACE FUNCTION get_featured_content(
  p_content_type content_type DEFAULT NULL,
  p_limit int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  summary text,
  content_type content_type,
  category text,
  view_count integer,
  created_at timestamp with time zone
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb.id,
    kb.title,
    kb.summary,
    kb.content_type,
    kb.category,
    kb.view_count,
    kb.created_at
  FROM knowledge_base kb
  WHERE
    kb.is_published = true
    AND kb.is_featured = true
    AND (p_content_type IS NULL OR kb.content_type = p_content_type)
  ORDER BY kb.created_at DESC
  LIMIT p_limit;
$$;

-- Add comments for functions
COMMENT ON FUNCTION search_knowledge_base IS 'Semantic search using vector similarity (cosine distance) with optional filters';
COMMENT ON FUNCTION hybrid_search_knowledge_base IS 'Hybrid search combining vector similarity and full-text search with configurable weights';
COMMENT ON FUNCTION increment_knowledge_base_views IS 'Increment view count for a knowledge base entry';
COMMENT ON FUNCTION get_featured_content IS 'Get featured content with optional content type filter';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 012 completed successfully!';
    RAISE NOTICE '📦 pgvector extension enabled';
    RAISE NOTICE '🗄️ knowledge_base table created with vector(1536) for OpenAI embeddings';
    RAISE NOTICE '🔍 Indexes created: B-tree, GIN (tags, metadata, full-text), HNSW (vector)';
    RAISE NOTICE '⚡ Helper functions created:';
    RAISE NOTICE '   - search_knowledge_base (semantic search)';
    RAISE NOTICE '   - hybrid_search_knowledge_base (vector + full-text)';
    RAISE NOTICE '   - increment_knowledge_base_views';
    RAISE NOTICE '   - get_featured_content';
END $$;
