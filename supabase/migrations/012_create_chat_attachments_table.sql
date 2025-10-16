-- Migration 012: Create chat_attachments table for file attachments
-- This table stores metadata for files attached to messages

-- Create chat_attachments table
CREATE TABLE IF NOT EXISTS chat_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  message_id uuid NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- File metadata
  file_name text NOT NULL,
  file_size bigint NOT NULL, -- in bytes
  file_type text NOT NULL, -- MIME type (e.g., 'application/pdf', 'image/png')

  -- Storage reference
  storage_path text NOT NULL, -- Path in Supabase Storage bucket
  storage_bucket text DEFAULT 'chat-attachments', -- Storage bucket name

  -- Optional metadata
  thumbnail_path text, -- For image/video thumbnails
  metadata jsonb DEFAULT '{}', -- Additional file metadata (dimensions, duration, etc.)

  -- Upload status
  upload_status text DEFAULT 'completed', -- pending, completed, failed
  upload_error text, -- Error message if upload failed

  -- Timestamps
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access attachments from their own messages
CREATE POLICY "Users can view own chat attachments" ON chat_attachments
  FOR SELECT USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cm.id = chat_attachments.message_id
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments in own messages" ON chat_attachments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cm.id = chat_attachments.message_id
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own chat attachments" ON chat_attachments
  FOR UPDATE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cm.id = chat_attachments.message_id
      AND cs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cm.id = chat_attachments.message_id
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own chat attachments" ON chat_attachments
  FOR DELETE USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cm.id = chat_attachments.message_id
      AND cs.user_id = auth.uid()
    )
  );

-- Service role can access all attachments
CREATE POLICY "Service role can manage all attachments" ON chat_attachments
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_attachments_message_id ON chat_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_user_id ON chat_attachments(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_created_at ON chat_attachments(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_file_type ON chat_attachments(file_type);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_storage_path ON chat_attachments(storage_path);
CREATE INDEX IF NOT EXISTS idx_chat_attachments_upload_status ON chat_attachments(upload_status);

-- Create GIN index for JSONB metadata search
CREATE INDEX IF NOT EXISTS idx_chat_attachments_metadata ON chat_attachments USING gin(metadata);

-- Add helpful comments for documentation
COMMENT ON TABLE chat_attachments IS 'File attachments for chat messages with storage references';
COMMENT ON COLUMN chat_attachments.storage_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN chat_attachments.storage_bucket IS 'Supabase Storage bucket name (default: chat-attachments)';
COMMENT ON COLUMN chat_attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN chat_attachments.file_type IS 'MIME type (e.g., image/png, application/pdf)';
COMMENT ON COLUMN chat_attachments.thumbnail_path IS 'Optional thumbnail path for images/videos';
COMMENT ON COLUMN chat_attachments.metadata IS 'Additional file metadata (dimensions, duration, etc.)';
COMMENT ON COLUMN chat_attachments.upload_status IS 'Upload status: pending, completed, failed';

-- Create helper function to get attachments for a message
CREATE OR REPLACE FUNCTION get_message_attachments(
  p_message_id uuid,
  p_user_id uuid
)
RETURNS TABLE(
  id uuid,
  file_name text,
  file_size bigint,
  file_type text,
  storage_path text,
  thumbnail_path text,
  metadata jsonb,
  created_at timestamp with time zone
) AS $$
BEGIN
  -- Verify user owns this message
  IF NOT EXISTS (
    SELECT 1 FROM chat_messages cm
    JOIN chat_sessions cs ON cm.session_id = cs.id
    WHERE cm.id = p_message_id AND cs.user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Message not found or access denied';
  END IF;

  RETURN QUERY
  SELECT
    ca.id,
    ca.file_name,
    ca.file_size,
    ca.file_type,
    ca.storage_path,
    ca.thumbnail_path,
    ca.metadata,
    ca.created_at
  FROM chat_attachments ca
  WHERE ca.message_id = p_message_id
  AND ca.upload_status = 'completed'
  ORDER BY ca.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get user's total storage usage
CREATE OR REPLACE FUNCTION get_user_storage_usage(p_user_id uuid)
RETURNS TABLE(
  total_files bigint,
  total_bytes bigint,
  total_images bigint,
  total_documents bigint,
  total_other bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_files,
    COALESCE(SUM(file_size), 0)::bigint as total_bytes,
    COUNT(CASE WHEN file_type LIKE 'image/%' THEN 1 END)::bigint as total_images,
    COUNT(CASE WHEN file_type LIKE 'application/pdf' OR file_type LIKE 'application/msword%' OR file_type LIKE 'application/vnd.openxmlformats-officedocument%' THEN 1 END)::bigint as total_documents,
    COUNT(CASE WHEN file_type NOT LIKE 'image/%' AND file_type NOT LIKE 'application/pdf' AND file_type NOT LIKE 'application/msword%' AND file_type NOT LIKE 'application/vnd.openxmlformats-officedocument%' THEN 1 END)::bigint as total_other
  FROM chat_attachments
  WHERE user_id = p_user_id
  AND upload_status = 'completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to clean up orphaned attachments in storage
CREATE OR REPLACE FUNCTION cleanup_orphaned_attachments(
  p_older_than_days integer DEFAULT 7
)
RETURNS TABLE(
  storage_path text,
  file_name text
) AS $$
BEGIN
  -- Return paths of attachments that failed to upload and are older than specified days
  RETURN QUERY
  SELECT
    ca.storage_path,
    ca.file_name
  FROM chat_attachments ca
  WHERE
    ca.upload_status = 'failed'
    AND ca.created_at < (now() - (p_older_than_days || ' days')::interval);

  -- Delete the records (actual storage cleanup should be done separately)
  DELETE FROM chat_attachments
  WHERE
    upload_status = 'failed'
    AND created_at < (now() - (p_older_than_days || ' days')::interval);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get session attachments (all attachments in a session)
CREATE OR REPLACE FUNCTION get_session_attachments(
  p_session_id uuid,
  p_user_id uuid
)
RETURNS TABLE(
  attachment_id uuid,
  message_id uuid,
  file_name text,
  file_size bigint,
  file_type text,
  storage_path text,
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
    ca.id as attachment_id,
    ca.message_id,
    ca.file_name,
    ca.file_size,
    ca.file_type,
    ca.storage_path,
    ca.created_at
  FROM chat_attachments ca
  JOIN chat_messages cm ON ca.message_id = cm.id
  WHERE
    cm.session_id = p_session_id
    AND ca.upload_status = 'completed'
  ORDER BY ca.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for functions
COMMENT ON FUNCTION get_message_attachments IS 'Returns all completed attachments for a message (with ownership verification)';
COMMENT ON FUNCTION get_user_storage_usage IS 'Returns user total storage usage statistics';
COMMENT ON FUNCTION cleanup_orphaned_attachments IS 'Cleans up failed attachment records older than specified days';
COMMENT ON FUNCTION get_session_attachments IS 'Returns all attachments in a chat session';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 012 completed: chat_attachments table created successfully!';
    RAISE NOTICE 'Helper functions created: get_message_attachments, get_user_storage_usage, cleanup_orphaned_attachments, get_session_attachments';
    RAISE NOTICE 'Storage bucket should be created: chat-attachments';
END $$;
