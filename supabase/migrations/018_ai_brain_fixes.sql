-- Migration 018: AI Brain Fixes
-- Adds missing functions, user profile columns, and source attribution

-- ============================================================
-- FIX 1: Create alias functions for standardized naming
-- The codebase uses both match_* and search_* naming conventions
-- ============================================================

-- match_knowledge: Alias for search_knowledge_base with simplified signature
CREATE OR REPLACE FUNCTION match_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  summary text,
  content_type text,
  category text,
  tags text[],
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.summary,
    kb.content_type::text,
    kb.category,
    kb.tags,
    kb.metadata,
    1 - (kb.embedding <=> query_embedding) as similarity
  FROM knowledge_base kb
  WHERE
    kb.is_published = true
    AND kb.embedding IS NOT NULL
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
$$;

COMMENT ON FUNCTION match_knowledge IS 'Simplified semantic search alias for search_knowledge_base';

-- match_memories: Alias for search_conversation_memory
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  memory_type text,
  content text,
  importance_score float,
  similarity float,
  source_session_id uuid
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cm.id,
    cm.memory_type,
    cm.content,
    cm.importance_score,
    1 - (cm.embedding <=> query_embedding) as similarity,
    cm.source_session_id
  FROM conversation_memory cm
  WHERE
    (p_user_id IS NULL OR cm.user_id = p_user_id)
    AND cm.is_active = true
    AND cm.embedding IS NOT NULL
    AND (cm.expires_at IS NULL OR cm.expires_at > now())
    AND 1 - (cm.embedding <=> query_embedding) > match_threshold
  ORDER BY
    cm.importance_score DESC,
    cm.embedding <=> query_embedding
  LIMIT match_count;
$$;

COMMENT ON FUNCTION match_memories IS 'Simplified semantic search alias for search_conversation_memory';

-- match_document_chunks: For document analysis feature
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_index int,
  chunk_text text,
  token_count int,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.chunk_text,
    dc.token_count,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE
    (p_user_id IS NULL OR d.user_id = p_user_id)
    AND dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;

COMMENT ON FUNCTION match_document_chunks IS 'Search document chunks by semantic similarity';

-- ============================================================
-- FIX 2: Add conversation context retrieval function
-- ============================================================

CREATE OR REPLACE FUNCTION get_conversation_context(
  p_session_id uuid,
  p_limit int DEFAULT 5
)
RETURNS TABLE (
  role text,
  content text,
  created_at timestamptz
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cm.role,
    cm.content,
    cm.created_at
  FROM chat_messages cm
  WHERE cm.session_id = p_session_id
  ORDER BY cm.created_at DESC
  LIMIT p_limit;
$$;

COMMENT ON FUNCTION get_conversation_context IS 'Get recent messages from a conversation session';

-- ============================================================
-- FIX 3: Add missing profile columns to users table
-- ============================================================

-- Add sport column
ALTER TABLE users ADD COLUMN IF NOT EXISTS sport text;

-- Add school_level column (high_school, college, pro)
ALTER TABLE users ADD COLUMN IF NOT EXISTS school_level text
  CHECK (school_level IN ('high_school', 'college', 'professional', 'other') OR school_level IS NULL);

-- Add state column for location-specific advice
ALTER TABLE users ADD COLUMN IF NOT EXISTS state text;

-- Add age column
ALTER TABLE users ADD COLUMN IF NOT EXISTS age int
  CHECK (age IS NULL OR (age >= 13 AND age <= 100));

-- Add social follower counts for NIL valuation
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram_followers int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tiktok_followers int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_followers int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS youtube_subscribers int DEFAULT 0;

-- Add NIL-specific profile fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_nil_deal boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nil_interests text[] DEFAULT '{}';

-- Create index on sport for filtering
CREATE INDEX IF NOT EXISTS idx_users_sport ON users(sport) WHERE sport IS NOT NULL;

-- Create index on state for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state) WHERE state IS NOT NULL;

-- ============================================================
-- FIX 4: Add source attribution to knowledge_base
-- ============================================================

-- Add source column if not exists
ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS source text;

-- Update existing entries with source attribution based on content_type
UPDATE knowledge_base
SET source = 'ChatNIL Knowledge Base'
WHERE source IS NULL;

UPDATE knowledge_base
SET source = 'State Legislature Official Records'
WHERE content_type = 'state_law' AND (source IS NULL OR source = 'ChatNIL Knowledge Base');

UPDATE knowledge_base
SET source = 'NCAA Official Guidelines'
WHERE (title ILIKE '%NCAA%' OR content ILIKE '%NCAA%')
  AND content_type IN ('compliance_guide', 'nil_regulation')
  AND source = 'ChatNIL Knowledge Base';

UPDATE knowledge_base
SET source = 'ChatNIL Educational Content'
WHERE content_type = 'educational_article' AND source = 'ChatNIL Knowledge Base';

UPDATE knowledge_base
SET source = 'NIL Industry Examples'
WHERE content_type = 'deal_example' AND source = 'ChatNIL Knowledge Base';

-- ============================================================
-- FIX 5: Create view for conversation_memories (alias for table)
-- Some code references conversation_memories (plural)
-- ============================================================

CREATE OR REPLACE VIEW conversation_memories AS
SELECT * FROM conversation_memory;

-- Grant access to the view
GRANT SELECT ON conversation_memories TO authenticated;
GRANT ALL ON conversation_memories TO service_role;

-- ============================================================
-- VERIFICATION: Create test function
-- ============================================================

CREATE OR REPLACE FUNCTION verify_ai_brain_functions()
RETURNS TABLE (
  function_name text,
  status text
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Test match_knowledge
  BEGIN
    PERFORM match_knowledge(
      array_fill(0.01::float, ARRAY[1536])::vector(1536),
      0.5,
      1
    );
    function_name := 'match_knowledge';
    status := 'OK';
    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    function_name := 'match_knowledge';
    status := 'ERROR: ' || SQLERRM;
    RETURN NEXT;
  END;

  -- Test match_memories
  BEGIN
    PERFORM match_memories(
      array_fill(0.01::float, ARRAY[1536])::vector(1536),
      0.5,
      1,
      NULL
    );
    function_name := 'match_memories';
    status := 'OK';
    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    function_name := 'match_memories';
    status := 'ERROR: ' || SQLERRM;
    RETURN NEXT;
  END;

  -- Test match_document_chunks
  BEGIN
    PERFORM match_document_chunks(
      array_fill(0.01::float, ARRAY[1536])::vector(1536),
      0.5,
      1,
      NULL
    );
    function_name := 'match_document_chunks';
    status := 'OK';
    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    function_name := 'match_document_chunks';
    status := 'ERROR: ' || SQLERRM;
    RETURN NEXT;
  END;

  -- Test get_conversation_context
  BEGIN
    PERFORM get_conversation_context(
      gen_random_uuid(),
      1
    );
    function_name := 'get_conversation_context';
    status := 'OK';
    RETURN NEXT;
  EXCEPTION WHEN OTHERS THEN
    function_name := 'get_conversation_context';
    status := 'ERROR: ' || SQLERRM;
    RETURN NEXT;
  END;

  RETURN;
END;
$$;

-- ============================================================
-- Success message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 018: AI Brain Fixes completed!';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Created alias functions:';
    RAISE NOTICE '   - match_knowledge (alias for search_knowledge_base)';
    RAISE NOTICE '   - match_memories (alias for search_conversation_memory)';
    RAISE NOTICE '   - match_document_chunks (for document analysis)';
    RAISE NOTICE '   - get_conversation_context (get recent messages)';
    RAISE NOTICE '';
    RAISE NOTICE '👤 Added user profile columns:';
    RAISE NOTICE '   - sport, school_level, state, age';
    RAISE NOTICE '   - instagram_followers, tiktok_followers, twitter_followers, youtube_subscribers';
    RAISE NOTICE '   - has_nil_deal, nil_interests';
    RAISE NOTICE '';
    RAISE NOTICE '📚 Added source attribution to knowledge_base';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Created conversation_memories view (alias for conversation_memory table)';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Run SELECT * FROM verify_ai_brain_functions() to verify';
END $$;
