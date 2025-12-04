-- =====================================================
-- Migration 300: RLS Policy Verification & Fixes
-- Purpose: Verify and fix any missing RLS policies
-- =====================================================

-- =====================================================
-- SECTION 1: Verify RLS is enabled on all critical tables
-- =====================================================

-- 1.1 Users table - should already have RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'users' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on users table';
  ELSE
    RAISE NOTICE 'users table already has RLS enabled';
  END IF;
END $$;

-- 1.2 Chat sessions - should already have RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'chat_sessions' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on chat_sessions table';
  ELSE
    RAISE NOTICE 'chat_sessions table already has RLS enabled';
  END IF;
END $$;

-- 1.3 Chat messages - should already have RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'chat_messages' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on chat_messages table';
  ELSE
    RAISE NOTICE 'chat_messages table already has RLS enabled';
  END IF;
END $$;

-- 1.4 User badges
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'user_badges' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on user_badges table';
  ELSE
    RAISE NOTICE 'user_badges table already has RLS enabled';
  END IF;
END $$;

-- 1.5 User quiz progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'user_quiz_progress' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE user_quiz_progress ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on user_quiz_progress table';
  ELSE
    RAISE NOTICE 'user_quiz_progress table already has RLS enabled';
  END IF;
END $$;

-- =====================================================
-- SECTION 2: Add missing policies for quiz_questions
-- (Should be public read for educational content)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_questions') THEN
    -- Enable RLS if not enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'quiz_questions' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE 'Enabled RLS on quiz_questions table';
    END IF;

    -- Add public read policy if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'quiz_questions'
      AND policyname = 'Anyone can read quiz questions'
    ) THEN
      CREATE POLICY "Anyone can read quiz questions" ON quiz_questions
        FOR SELECT USING (true);
      RAISE NOTICE 'Created public read policy on quiz_questions';
    END IF;

    -- Add service role full access if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'quiz_questions'
      AND policyname = 'Service role can manage quiz questions'
    ) THEN
      CREATE POLICY "Service role can manage quiz questions" ON quiz_questions
        FOR ALL USING (auth.role() = 'service_role');
      RAISE NOTICE 'Created service role policy on quiz_questions';
    END IF;
  END IF;
END $$;

-- =====================================================
-- SECTION 3: Add missing policies for knowledge_base
-- (Should be public read for published content only)
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'knowledge_base') THEN
    -- Enable RLS if not enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'knowledge_base' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE 'Enabled RLS on knowledge_base table';
    END IF;

    -- Add public read policy for published content if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'knowledge_base'
      AND policyname = 'Anyone can read published knowledge'
    ) THEN
      -- Check if is_published column exists
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'knowledge_base' AND column_name = 'is_published'
      ) THEN
        CREATE POLICY "Anyone can read published knowledge" ON knowledge_base
          FOR SELECT USING (is_published = true);
      ELSE
        -- Fallback: allow all reads (assume all content is public)
        CREATE POLICY "Anyone can read published knowledge" ON knowledge_base
          FOR SELECT USING (true);
      END IF;
      RAISE NOTICE 'Created public read policy on knowledge_base';
    END IF;

    -- Add service role full access if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'knowledge_base'
      AND policyname = 'Service role can manage knowledge base'
    ) THEN
      CREATE POLICY "Service role can manage knowledge base" ON knowledge_base
        FOR ALL USING (auth.role() = 'service_role');
      RAISE NOTICE 'Created service role policy on knowledge_base';
    END IF;
  END IF;
END $$;

-- =====================================================
-- SECTION 4: Verify chat_attachments RLS
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_attachments') THEN
    -- Enable RLS if not enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'chat_attachments' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE chat_attachments ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE 'Enabled RLS on chat_attachments table';
    ELSE
      RAISE NOTICE 'chat_attachments table already has RLS enabled';
    END IF;
  END IF;
END $$;

-- =====================================================
-- SECTION 5: Ensure quiz_sessions has proper RLS
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quiz_sessions') THEN
    -- Enable RLS if not enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'quiz_sessions' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE 'Enabled RLS on quiz_sessions table';
    END IF;

    -- Add user select policy if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'quiz_sessions'
      AND policyname = 'Users can view own quiz sessions'
    ) THEN
      CREATE POLICY "Users can view own quiz sessions" ON quiz_sessions
        FOR SELECT USING (auth.uid() = user_id);
      RAISE NOTICE 'Created user select policy on quiz_sessions';
    END IF;

    -- Add user insert policy if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'quiz_sessions'
      AND policyname = 'Users can create own quiz sessions'
    ) THEN
      CREATE POLICY "Users can create own quiz sessions" ON quiz_sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      RAISE NOTICE 'Created user insert policy on quiz_sessions';
    END IF;

    -- Add user update policy if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'quiz_sessions'
      AND policyname = 'Users can update own quiz sessions'
    ) THEN
      CREATE POLICY "Users can update own quiz sessions" ON quiz_sessions
        FOR UPDATE USING (auth.uid() = user_id);
      RAISE NOTICE 'Created user update policy on quiz_sessions';
    END IF;

    -- Add service role full access if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'quiz_sessions'
      AND policyname = 'Service role can manage quiz sessions'
    ) THEN
      CREATE POLICY "Service role can manage quiz sessions" ON quiz_sessions
        FOR ALL USING (auth.role() = 'service_role');
      RAISE NOTICE 'Created service role policy on quiz_sessions';
    END IF;
  END IF;
END $$;

-- =====================================================
-- SECTION 6: Ensure badges table has public read
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'badges') THEN
    -- Enable RLS if not enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'badges' AND c.relrowsecurity = true
    ) THEN
      ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
      RAISE NOTICE 'Enabled RLS on badges table';
    END IF;

    -- Add public read policy for active badges if not exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'badges'
      AND policyname = 'Anyone can read active badges'
    ) THEN
      -- Check if is_active column exists
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'badges' AND column_name = 'is_active'
      ) THEN
        CREATE POLICY "Anyone can read active badges" ON badges
          FOR SELECT USING (is_active = true);
      ELSE
        CREATE POLICY "Anyone can read active badges" ON badges
          FOR SELECT USING (true);
      END IF;
      RAISE NOTICE 'Created public read policy on badges';
    END IF;
  END IF;
END $$;

-- =====================================================
-- SECTION 7: Grant necessary permissions
-- =====================================================

-- Grant authenticated users access to public tables
GRANT SELECT ON quiz_questions TO authenticated;
GRANT SELECT ON badges TO authenticated;
GRANT SELECT ON knowledge_base TO authenticated;

-- Grant anon users read access to public educational content
GRANT SELECT ON quiz_questions TO anon;
GRANT SELECT ON badges TO anon;
GRANT SELECT ON knowledge_base TO anon;

-- =====================================================
-- Verification complete
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'RLS Policy Verification Complete';
  RAISE NOTICE '=====================================================';
END $$;
