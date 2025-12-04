-- ============================================================================
-- CONSOLIDATED IMMEDIATE MIGRATIONS
-- ============================================================================
-- This file combines all immediate migrations for quick application
-- Includes: Chat System, Quiz System, and Vector Extension
--
-- Apply this entire file in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql
-- ============================================================================

-- ============================================================================
-- PREREQUISITE: Create update_updated_at_column function if not exists
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates updated_at timestamp on row update';

-- ============================================================================
-- MIGRATION 010: Chat Sessions Table
-- ============================================================================

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User relationship
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session metadata
  title text NOT NULL DEFAULT 'New Chat',
  role_context text DEFAULT 'athlete', -- athlete, parent, or coach context

  -- UI state
  is_pinned boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  draft text DEFAULT '', -- User's draft message for this session

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own chat sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Service role can access all sessions
CREATE POLICY "Service role can manage all chat sessions" ON chat_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated ON chat_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_pinned ON chat_sessions(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_chat_sessions_archived ON chat_sessions(user_id, is_archived) WHERE is_archived = false;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments for documentation
COMMENT ON TABLE chat_sessions IS 'Chat sessions/conversations for each user with persistent storage';
COMMENT ON COLUMN chat_sessions.title IS 'Chat title, auto-generated from first message or user-renamed';
COMMENT ON COLUMN chat_sessions.role_context IS 'User role context when chat was created (athlete, parent, coach)';
COMMENT ON COLUMN chat_sessions.is_pinned IS 'Whether chat is pinned to top of sidebar';
COMMENT ON COLUMN chat_sessions.is_archived IS 'Whether chat is archived (hidden from main view)';
COMMENT ON COLUMN chat_sessions.draft IS 'User draft message for this chat (persisted across sessions)';

-- Create helper function to get user's active chat sessions
CREATE OR REPLACE FUNCTION get_user_chat_sessions(
  p_user_id uuid,
  p_include_archived boolean DEFAULT false,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  title text,
  role_context text,
  is_pinned boolean,
  is_archived boolean,
  message_count bigint,
  last_message_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.title,
    cs.role_context,
    cs.is_pinned,
    cs.is_archived,
    COUNT(cm.id) as message_count,
    MAX(cm.created_at) as last_message_at,
    cs.created_at,
    cs.updated_at
  FROM chat_sessions cs
  LEFT JOIN chat_messages cm ON cs.id = cm.session_id
  WHERE
    cs.user_id = p_user_id
    AND (p_include_archived = true OR cs.is_archived = false)
  GROUP BY cs.id
  ORDER BY
    cs.is_pinned DESC,
    cs.updated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to archive old chat sessions automatically
CREATE OR REPLACE FUNCTION auto_archive_old_sessions(
  p_user_id uuid,
  p_keep_active_count integer DEFAULT 50
)
RETURNS integer AS $$
DECLARE
  v_archived_count integer;
BEGIN
  -- Archive sessions beyond the keep count, excluding pinned ones
  WITH sessions_to_archive AS (
    SELECT id
    FROM chat_sessions
    WHERE
      user_id = p_user_id
      AND is_archived = false
      AND is_pinned = false
    ORDER BY updated_at DESC
    OFFSET p_keep_active_count
  )
  UPDATE chat_sessions
  SET is_archived = true, updated_at = now()
  WHERE id IN (SELECT id FROM sessions_to_archive);

  GET DIAGNOSTICS v_archived_count = ROW_COUNT;
  RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for functions
COMMENT ON FUNCTION get_user_chat_sessions IS 'Returns user chat sessions with message counts and sorting';
COMMENT ON FUNCTION auto_archive_old_sessions IS 'Automatically archives old chat sessions beyond specified limit';

-- ============================================================================
-- MIGRATION 011: Chat Messages Table
-- ============================================================================

-- Create message_role enum
DO $$ BEGIN
    CREATE TYPE message_role AS ENUM ('user', 'assistant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Message content
  content text NOT NULL,
  role message_role NOT NULL,

  -- Attachments (file metadata stored as JSONB)
  attachments jsonb DEFAULT NULL,

  -- Message metadata
  is_streaming boolean DEFAULT false,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chat messages" ON chat_messages
  FOR SELECT USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own chat messages" ON chat_messages
  FOR UPDATE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own chat messages" ON chat_messages
  FOR DELETE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Service role can access all messages
CREATE POLICY "Service role can manage all messages" ON chat_messages
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_attachments ON chat_messages USING gin(attachments);

COMMENT ON TABLE chat_messages IS 'Individual messages within chat sessions';
COMMENT ON COLUMN chat_messages.role IS 'Message role: user (human) or assistant (AI)';
COMMENT ON COLUMN chat_messages.attachments IS 'JSONB array of file attachments with metadata';

-- Create trigger to update session's updated_at when new message is added
CREATE OR REPLACE FUNCTION update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET updated_at = NEW.created_at
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_timestamp_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_session_on_message();

-- Create helper functions
CREATE OR REPLACE FUNCTION get_session_messages(
  p_session_id uuid,
  p_user_id uuid,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  content text,
  role message_role,
  attachments jsonb,
  is_edited boolean,
  created_at timestamp with time zone
) AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE id = p_session_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Session not found or access denied';
  END IF;

  RETURN QUERY
  SELECT
    cm.id,
    cm.content,
    cm.role,
    cm.attachments,
    cm.is_edited,
    cm.created_at
  FROM chat_messages cm
  WHERE cm.session_id = p_session_id
  ORDER BY cm.created_at ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION search_user_messages(
  p_user_id uuid,
  p_search_query text,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  message_id uuid,
  session_id uuid,
  session_title text,
  content text,
  role message_role,
  created_at timestamp with time zone,
  match_rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.id as message_id,
    cm.session_id,
    cs.title as session_title,
    cm.content,
    cm.role,
    cm.created_at,
    ts_rank(to_tsvector('english', cm.content), plainto_tsquery('english', p_search_query)) as match_rank
  FROM chat_messages cm
  JOIN chat_sessions cs ON cm.session_id = cs.id
  WHERE
    cm.user_id = p_user_id
    AND to_tsvector('english', cm.content) @@ plainto_tsquery('english', p_search_query)
  ORDER BY match_rank DESC, cm.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_session_messages IS 'Returns paginated messages for a session';
COMMENT ON FUNCTION search_user_messages IS 'Full-text search across user messages';

-- ============================================================================
-- MIGRATION 008: Quiz Questions Table
-- ============================================================================

-- Create quiz difficulty enum
DO $$ BEGIN
    CREATE TYPE quiz_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create quiz category enum
DO $$ BEGIN
    CREATE TYPE quiz_category AS ENUM (
      'nil_basics',
      'contracts',
      'branding',
      'social_media',
      'compliance',
      'tax_finance',
      'negotiation',
      'legal',
      'marketing',
      'athlete_rights'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create quiz_questions table (reading from migration file for full schema)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  question_type varchar(50) DEFAULT 'multiple_choice',
  options jsonb NOT NULL DEFAULT '[]',
  correct_answer jsonb NOT NULL,
  correct_answer_index integer,
  explanation text,
  learning_resources jsonb DEFAULT '[]',
  category quiz_category NOT NULL,
  topic varchar(100),
  difficulty quiz_difficulty NOT NULL,
  tags text[] DEFAULT '{}',
  points integer DEFAULT 10,
  time_limit_seconds integer DEFAULT 60,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  times_answered integer DEFAULT 0,
  times_correct integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quiz questions are viewable by authenticated users" ON quiz_questions
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

CREATE POLICY "Service role can manage quiz questions" ON quiz_questions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_is_active ON quiz_questions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quiz_questions_tags ON quiz_questions USING gin(tags);

CREATE TRIGGER update_quiz_questions_updated_at
    BEFORE UPDATE ON quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE quiz_questions IS 'Quiz questions for NIL education system';

-- ============================================================================
-- MIGRATION 009: User Quiz Progress Table
-- ============================================================================

-- Create quiz status enum
DO $$ BEGIN
    CREATE TYPE quiz_status AS ENUM ('in_progress', 'completed', 'abandoned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_quiz_progress table
CREATE TABLE IF NOT EXISTS user_quiz_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  attempt_number integer DEFAULT 1,
  status quiz_status DEFAULT 'in_progress',
  user_answer jsonb,
  user_answer_index integer,
  is_correct boolean,
  time_taken_seconds integer,
  points_earned integer DEFAULT 0,
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 5),
  hints_used integer DEFAULT 0,
  resources_viewed text[] DEFAULT '{}',
  quiz_session_id uuid,
  session_score integer,
  session_total_questions integer,
  user_feedback text,
  flagged_for_review boolean DEFAULT false,
  notes text,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE user_quiz_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz progress" ON user_quiz_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz progress" ON user_quiz_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz progress" ON user_quiz_progress
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all quiz progress" ON user_quiz_progress
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user_id ON user_quiz_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_question_id ON user_quiz_progress(question_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_status ON user_quiz_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_session_id ON user_quiz_progress(quiz_session_id);

CREATE TRIGGER update_user_quiz_progress_updated_at
    BEFORE UPDATE ON user_quiz_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create helper function
CREATE OR REPLACE FUNCTION get_user_quiz_stats(p_user_id uuid)
RETURNS TABLE(
  total_questions_attempted integer,
  total_questions_correct integer,
  total_points_earned integer,
  average_score_percentage numeric,
  total_time_spent_seconds integer,
  quizzes_completed integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT question_id)::integer as total_questions_attempted,
    COUNT(CASE WHEN is_correct THEN 1 END)::integer as total_questions_correct,
    COALESCE(SUM(points_earned), 0)::integer as total_points_earned,
    CASE
      WHEN COUNT(DISTINCT question_id) > 0
      THEN ROUND((COUNT(CASE WHEN is_correct THEN 1 END)::numeric / COUNT(DISTINCT question_id)::numeric * 100), 2)
      ELSE 0
    END as average_score_percentage,
    COALESCE(SUM(time_taken_seconds), 0)::integer as total_time_spent_seconds,
    COUNT(DISTINCT quiz_session_id)::integer as quizzes_completed
  FROM user_quiz_progress
  WHERE user_id = p_user_id AND status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_quiz_stats IS 'Returns comprehensive quiz statistics for a user';

-- ============================================================================
-- MIGRATION 012: pgvector Extension and Knowledge Base
-- ============================================================================

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
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  embedding vector(1536),
  content_type content_type NOT NULL,
  category text,
  tags text[] DEFAULT '{}',
  source_url text,
  author text,
  published_date date,
  metadata jsonb DEFAULT '{}',
  is_published boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  target_roles text[] DEFAULT '{}',
  difficulty_level text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view published content" ON knowledge_base
  FOR SELECT USING (is_published = true AND auth.role() = 'authenticated');

CREATE POLICY "Service role can manage all knowledge base" ON knowledge_base
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_type ON knowledge_base(content_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_is_published ON knowledge_base(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_metadata ON knowledge_base USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_fts ON knowledge_base
  USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE TRIGGER update_knowledge_base_updated_at
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE knowledge_base IS 'Vector-enabled knowledge base for NIL education content and RAG';
COMMENT ON COLUMN knowledge_base.embedding IS 'Vector embedding using OpenAI text-embedding-ada-002 (1536 dimensions)';

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

COMMENT ON FUNCTION search_knowledge_base IS 'Semantic search using vector similarity';

-- ============================================================================
-- SUCCESS MESSAGES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Migration 010: chat_sessions table created';
    RAISE NOTICE '📦 Migration 011: chat_messages table created';
    RAISE NOTICE '📦 Migration 008: quiz_questions table created';
    RAISE NOTICE '📦 Migration 009: user_quiz_progress table created';
    RAISE NOTICE '📦 Migration 012: pgvector enabled, knowledge_base table created';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 RLS policies enabled on all tables';
    RAISE NOTICE '📊 Indexes created for optimal performance';
    RAISE NOTICE '⚡ Helper functions ready for use';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update lib/dashboard-data.ts to query real chat_sessions';
    RAISE NOTICE '2. Test chat persistence on dashboard';
    RAISE NOTICE '3. Verify quiz stats display without errors';
    RAISE NOTICE '4. Implement embedding generation for knowledge_base';
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
END $$;
