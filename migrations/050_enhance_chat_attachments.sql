-- Migration 050: Enhance chat_attachments table for Documents Library
-- Add session_id for direct chat session association and improve organization

-- Add session_id column to chat_attachments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_attachments' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE chat_attachments
    ADD COLUMN session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_attachments_session_id ON chat_attachments(session_id);

-- Add public URL column for easier access (optional, can be constructed from storage_path)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_attachments' AND column_name = 'public_url'
  ) THEN
    ALTER TABLE chat_attachments
    ADD COLUMN public_url TEXT;
  END IF;
END $$;

-- Update existing attachments to link to sessions via message_id -> session_id
UPDATE chat_attachments ca
SET session_id = cm.session_id
FROM chat_messages cm
WHERE ca.message_id = cm.id
AND ca.session_id IS NULL;

-- Create or replace function to auto-set session_id when inserting via message
CREATE OR REPLACE FUNCTION set_attachment_session_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.message_id IS NOT NULL AND NEW.session_id IS NULL THEN
    SELECT session_id INTO NEW.session_id
    FROM chat_messages
    WHERE id = NEW.message_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set session_id
DROP TRIGGER IF EXISTS trg_set_attachment_session_id ON chat_attachments;
CREATE TRIGGER trg_set_attachment_session_id
  BEFORE INSERT ON chat_attachments
  FOR EACH ROW
  EXECUTE FUNCTION set_attachment_session_id();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_attachments TO authenticated;
GRANT USAGE ON SEQUENCE chat_attachments_id_seq TO authenticated;

-- Create RLS policies for chat_attachments
ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own attachments
DROP POLICY IF EXISTS "Users can view own attachments" ON chat_attachments;
CREATE POLICY "Users can view own attachments"
  ON chat_attachments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own attachments
DROP POLICY IF EXISTS "Users can insert own attachments" ON chat_attachments;
CREATE POLICY "Users can insert own attachments"
  ON chat_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own attachments
DROP POLICY IF EXISTS "Users can update own attachments" ON chat_attachments;
CREATE POLICY "Users can update own attachments"
  ON chat_attachments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own attachments
DROP POLICY IF EXISTS "Users can delete own attachments" ON chat_attachments;
CREATE POLICY "Users can delete own attachments"
  ON chat_attachments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a view for easy document querying with session info
CREATE OR REPLACE VIEW user_documents AS
SELECT
  ca.id,
  ca.file_name,
  ca.file_size,
  ca.file_type,
  ca.storage_path,
  ca.public_url,
  ca.created_at,
  ca.user_id,
  ca.session_id,
  ca.message_id,
  cs.title as session_title,
  cs.updated_at as session_updated_at
FROM chat_attachments ca
LEFT JOIN chat_sessions cs ON ca.session_id = cs.id
ORDER BY ca.created_at DESC;

-- Grant access to view
GRANT SELECT ON user_documents TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE chat_attachments IS 'Stores file attachments from chat messages with links to sessions';
COMMENT ON COLUMN chat_attachments.session_id IS 'Direct reference to chat session for organization';
COMMENT ON VIEW user_documents IS 'Convenient view combining attachments with session metadata';
