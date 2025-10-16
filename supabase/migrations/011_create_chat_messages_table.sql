-- Migration 011: Create chat_messages table for storing individual messages
-- This table stores all messages within chat sessions

-- Create message_role enum (if not already exists from backup schema)
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
  is_streaming boolean DEFAULT false, -- For UI streaming state
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access messages from their own chat sessions
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

-- Create GIN index for JSONB attachments search
CREATE INDEX IF NOT EXISTS idx_chat_messages_attachments ON chat_messages USING gin(attachments);

-- Add helpful comments for documentation
COMMENT ON TABLE chat_messages IS 'Individual messages within chat sessions';
COMMENT ON COLUMN chat_messages.role IS 'Message role: user (human) or assistant (AI)';
COMMENT ON COLUMN chat_messages.attachments IS 'JSONB array of file attachments with metadata';
COMMENT ON COLUMN chat_messages.is_streaming IS 'Indicates if message is currently being streamed (UI state)';
COMMENT ON COLUMN chat_messages.is_edited IS 'Whether message has been edited after creation';

-- Create trigger to update session's updated_at when new message is added
CREATE OR REPLACE FUNCTION update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the session's updated_at timestamp
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

-- Create helper function to get messages for a session
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
  -- Verify user owns this session
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

-- Create helper function to count messages in a session
CREATE OR REPLACE FUNCTION get_session_message_count(
  p_session_id uuid,
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  v_count integer;
BEGIN
  -- Verify user owns this session
  IF NOT EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE id = p_session_id AND user_id = p_user_id
  ) THEN
    RETURN 0;
  END IF;

  SELECT COUNT(*)
  INTO v_count
  FROM chat_messages
  WHERE session_id = p_session_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to search messages
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

-- Add comments for functions
COMMENT ON FUNCTION update_session_on_message IS 'Automatically updates session updated_at when message is added';
COMMENT ON FUNCTION get_session_messages IS 'Returns paginated messages for a session (with ownership verification)';
COMMENT ON FUNCTION get_session_message_count IS 'Returns message count for a session';
COMMENT ON FUNCTION search_user_messages IS 'Full-text search across user messages with ranking';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 011 completed: chat_messages table created successfully!';
    RAISE NOTICE 'Helper functions created: get_session_messages, get_session_message_count, search_user_messages';
    RAISE NOTICE 'Trigger created: auto-update session timestamp on new message';
END $$;
