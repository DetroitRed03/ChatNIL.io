-- Migration 026: Parent Dashboard Full Integration
-- Adds activity_log, user_sessions, and triggers for automatic activity tracking

-- ============================================
-- STEP 1: Ensure full_name column exists
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Update users with full_name from various sources
UPDATE users u
SET full_name = COALESCE(
  NULLIF(u.full_name, ''),
  CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')),
  INITCAP(REPLACE(REPLACE(SPLIT_PART(u.email, '@', 1), '_', ' '), '.', ' '))
)
WHERE full_name IS NULL OR full_name = '' OR full_name LIKE '%_xdv%' OR full_name LIKE '%_xc0%';

-- ============================================
-- STEP 2: Create activity_log table
-- ============================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON activity_log(type);

-- ============================================
-- STEP 3: Create user_sessions table
-- ============================================

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(last_active DESC);

-- ============================================
-- STEP 4: Create triggers to log activity
-- ============================================

-- Function to log chapter progress
CREATE OR REPLACE FUNCTION log_chapter_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (OLD.questions_completed IS NULL OR OLD.questions_completed < NEW.questions_completed)) THEN
    INSERT INTO activity_log (user_id, type, title, description, metadata)
    VALUES (
      NEW.user_id,
      CASE
        WHEN NEW.completed THEN 'chapter_completed'
        WHEN NEW.questions_completed = 1 THEN 'chapter_started'
        ELSE 'question_answered'
      END,
      CASE
        WHEN NEW.completed THEN 'Completed ' || INITCAP(NEW.pillar) || ' chapter'
        WHEN NEW.questions_completed = 1 THEN 'Started ' || INITCAP(NEW.pillar) || ' chapter'
        ELSE 'Answered question in ' || INITCAP(NEW.pillar)
      END,
      CASE
        WHEN NEW.completed THEN 'Finished all questions in the ' || NEW.pillar || ' chapter!'
        ELSE 'Progress: ' || NEW.questions_completed || '/' || COALESCE(NEW.total_questions, 5)
      END,
      jsonb_build_object('pillar', NEW.pillar, 'progress', NEW.questions_completed, 'total', COALESCE(NEW.total_questions, 5))
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_chapter_activity ON chapter_progress;
CREATE TRIGGER trigger_log_chapter_activity
  AFTER INSERT OR UPDATE ON chapter_progress
  FOR EACH ROW
  EXECUTE FUNCTION log_chapter_activity();

-- Function to log daily challenge completion
CREATE OR REPLACE FUNCTION log_daily_challenge_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (user_id, type, title, description)
  VALUES (
    NEW.user_id,
    'daily_challenge',
    'Completed daily challenge',
    'Answered today''s question'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'daily_question_answers') THEN
    DROP TRIGGER IF EXISTS trigger_log_daily_challenge ON daily_question_answers;
    CREATE TRIGGER trigger_log_daily_challenge
      AFTER INSERT ON daily_question_answers
      FOR EACH ROW
      EXECUTE FUNCTION log_daily_challenge_activity();
  END IF;
END $$;

-- ============================================
-- STEP 5: Disable RLS for admin access
-- ============================================

ALTER TABLE activity_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Add comments
-- ============================================

COMMENT ON TABLE activity_log IS 'Tracks user activities for parent visibility';
COMMENT ON TABLE user_sessions IS 'Tracks user online status';

-- ============================================
-- STEP 7: Ensure parent_child_relationships exists
-- ============================================

CREATE TABLE IF NOT EXISTS parent_child_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL DEFAULT 'parent',
  status VARCHAR(20) DEFAULT 'active',
  permissions JSONB DEFAULT '{"view_progress": true, "approve_deals": true, "receive_notifications": true}',
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

ALTER TABLE parent_child_relationships DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 026 completed: Parent dashboard integration tables created successfully!';
END $$;
