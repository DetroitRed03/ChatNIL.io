-- Migration 015: Conversation Memory for AI Brain
-- Enables cross-session memory and conversation summarization

-- Add summary columns to chat_sessions
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS summary_embedding vector(1536),
ADD COLUMN IF NOT EXISTS last_summarized_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS message_count_at_summary integer DEFAULT 0;

-- Create conversation_memory table for cross-session context
CREATE TABLE IF NOT EXISTS conversation_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Memory content
  memory_type text NOT NULL CHECK (memory_type IN ('preference', 'context', 'fact', 'goal')),
  content text NOT NULL,
  embedding vector(1536),

  -- Source tracking
  source_session_id uuid REFERENCES chat_sessions(id) ON DELETE SET NULL,
  source_message_ids uuid[] DEFAULT '{}',

  -- Relevance and usage
  importance_score float DEFAULT 0.5 CHECK (importance_score >= 0 AND importance_score <= 1),
  usage_count integer DEFAULT 0,
  last_used_at timestamp with time zone,

  -- Lifecycle
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone, -- Optional expiration for temporary context

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversation_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own memories" ON conversation_memory
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories" ON conversation_memory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" ON conversation_memory
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" ON conversation_memory
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all memories" ON conversation_memory
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Indexes for conversation_memory
CREATE INDEX IF NOT EXISTS idx_conversation_memory_user_id ON conversation_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_type ON conversation_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_active ON conversation_memory(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_conversation_memory_importance ON conversation_memory(user_id, importance_score DESC);

-- Vector index for memory embeddings (HNSW for fast similarity search)
CREATE INDEX IF NOT EXISTS idx_conversation_memory_embedding ON conversation_memory
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Vector index for session summary embeddings
CREATE INDEX IF NOT EXISTS idx_chat_sessions_summary_embedding ON chat_sessions
  USING hnsw (summary_embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Function to search conversation memory by semantic similarity
CREATE OR REPLACE FUNCTION search_conversation_memory(
  p_user_id uuid,
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  memory_types text[] DEFAULT NULL
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
    cm.user_id = p_user_id
    AND cm.is_active = true
    AND cm.embedding IS NOT NULL
    AND (cm.expires_at IS NULL OR cm.expires_at > now())
    AND (memory_types IS NULL OR cm.memory_type = ANY(memory_types))
    AND 1 - (cm.embedding <=> query_embedding) > match_threshold
  ORDER BY
    cm.importance_score DESC,
    cm.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to search past session summaries by similarity
CREATE OR REPLACE FUNCTION search_session_summaries(
  p_user_id uuid,
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  session_id uuid,
  title text,
  summary text,
  role_context text,
  similarity float,
  created_at timestamp with time zone
)
LANGUAGE sql STABLE
AS $$
  SELECT
    cs.id as session_id,
    cs.title,
    cs.summary,
    cs.role_context,
    1 - (cs.summary_embedding <=> query_embedding) as similarity,
    cs.created_at
  FROM chat_sessions cs
  WHERE
    cs.user_id = p_user_id
    AND cs.summary IS NOT NULL
    AND cs.summary_embedding IS NOT NULL
    AND cs.is_archived = false
    AND 1 - (cs.summary_embedding <=> query_embedding) > match_threshold
  ORDER BY cs.summary_embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Function to increment memory usage
CREATE OR REPLACE FUNCTION increment_memory_usage(memory_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE conversation_memory
  SET
    usage_count = usage_count + 1,
    last_used_at = now()
  WHERE id = memory_id;
$$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_conversation_memory_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_memory_timestamp
  BEFORE UPDATE ON conversation_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_memory_updated_at();

-- Comments for documentation
COMMENT ON TABLE conversation_memory IS 'Stores persistent user memories extracted from conversations for cross-session context';
COMMENT ON COLUMN conversation_memory.memory_type IS 'Type of memory: preference (user likes/dislikes), context (situation), fact (stated information), goal (user objectives)';
COMMENT ON COLUMN conversation_memory.importance_score IS 'Relevance score 0-1, higher = more important to include in context';
COMMENT ON COLUMN conversation_memory.embedding IS 'Vector embedding for semantic similarity search';
COMMENT ON COLUMN chat_sessions.summary IS 'AI-generated summary of the conversation';
COMMENT ON COLUMN chat_sessions.summary_embedding IS 'Vector embedding of the summary for semantic search';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 015 completed successfully!';
    RAISE NOTICE '📝 Added summary columns to chat_sessions';
    RAISE NOTICE '🧠 Created conversation_memory table';
    RAISE NOTICE '🔍 Created semantic search functions for memories and session summaries';
END $$;
