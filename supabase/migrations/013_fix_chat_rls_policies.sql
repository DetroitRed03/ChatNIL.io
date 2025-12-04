-- Migration 013: Fix RLS policies for chat_sessions and chat_messages
-- Issue: Users getting "permission denied" even when authenticated
-- Root cause: RLS policies might not be properly configured or auth context not working

-- Step 1: Drop existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can create own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Service role can manage all chat sessions" ON chat_sessions;

DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can create own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Service role can manage all chat messages" ON chat_messages;

-- Step 2: Recreate RLS policies with better auth handling
-- For chat_sessions table

-- Allow authenticated users to view their own sessions
CREATE POLICY "Users can view own chat sessions"
ON chat_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own sessions
CREATE POLICY "Users can insert own chat sessions"
ON chat_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own sessions
CREATE POLICY "Users can update own chat sessions"
ON chat_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own sessions
CREATE POLICY "Users can delete own chat sessions"
ON chat_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- For chat_messages table

-- Allow authenticated users to view their own messages
CREATE POLICY "Users can view own chat messages"
ON chat_messages FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own messages
CREATE POLICY "Users can insert own chat messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own messages
CREATE POLICY "Users can update own chat messages"
ON chat_messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own messages
CREATE POLICY "Users can delete own chat messages"
ON chat_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 3: Grant necessary table permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO authenticated;

-- Grant usage on sequences if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 4: Verify RLS is still enabled
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON TABLE chat_sessions IS 'Chat sessions with RLS policies - users can only access their own sessions';
COMMENT ON TABLE chat_messages IS 'Chat messages with RLS policies - users can only access their own messages';
