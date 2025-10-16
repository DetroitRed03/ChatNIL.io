-- Migration 010: Create chat_sessions table for persistent chat history
-- This table stores all chat sessions/conversations for each user

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

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 010 completed: chat_sessions table created successfully!';
    RAISE NOTICE 'Helper functions created: get_user_chat_sessions, auto_archive_old_sessions';
END $$;
