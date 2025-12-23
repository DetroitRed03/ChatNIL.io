-- ============================================================================
-- Migration 302: Fix E2E Schema Issues
-- ============================================================================
-- Addresses issues found in comprehensive E2E testing:
-- 1. Missing quiz_sessions table
-- 2. Missing badges table
-- 3. Missing user_badges table
-- 4. Missing portfolio_items table
-- 5. Missing columns in users table
-- 6. Missing state column in athlete_profiles
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add avatar_url to users (using profile_photo as alias or adding new column)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add state to athlete_profiles
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- Add fmv_score to athlete_profiles (using estimated_fmv as source if exists)
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS fmv_score NUMERIC DEFAULT 0;

-- Sync fmv_score with estimated_fmv if estimated_fmv exists
UPDATE athlete_profiles
SET fmv_score = estimated_fmv
WHERE estimated_fmv IS NOT NULL AND (fmv_score IS NULL OR fmv_score = 0);

-- ============================================================================
-- PART 2: CREATE QUIZ_SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score INTEGER,
  total_questions INTEGER,
  correct_answers INTEGER,
  current_question_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT DEFAULT 'beginner',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_difficulty ON quiz_sessions(difficulty);

-- Enable RLS
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON quiz_sessions TO service_role;
GRANT SELECT, INSERT, UPDATE ON quiz_sessions TO authenticated;
GRANT SELECT ON quiz_sessions TO anon;

-- RLS Policies
DROP POLICY IF EXISTS "service_role_full_access_quiz_sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "users_view_own_quiz_sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "users_create_own_quiz_sessions" ON quiz_sessions;
DROP POLICY IF EXISTS "users_update_own_quiz_sessions" ON quiz_sessions;

CREATE POLICY "service_role_full_access_quiz_sessions" ON quiz_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "users_view_own_quiz_sessions" ON quiz_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_create_own_quiz_sessions" ON quiz_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_quiz_sessions" ON quiz_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 3: CREATE BADGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  icon_url TEXT,
  icon_name TEXT,
  points INTEGER DEFAULT 10,
  requirements JSONB DEFAULT '{}'::jsonb,
  unlock_criteria TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_tier ON badges(tier);
CREATE INDEX IF NOT EXISTS idx_badges_is_active ON badges(is_active);

-- Enable RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON badges TO service_role;
GRANT SELECT ON badges TO authenticated;
GRANT SELECT ON badges TO anon;

-- RLS Policies
DROP POLICY IF EXISTS "service_role_full_access_badges" ON badges;
DROP POLICY IF EXISTS "everyone_view_badges" ON badges;

CREATE POLICY "service_role_full_access_badges" ON badges
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "everyone_view_badges" ON badges
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "anon_view_badges" ON badges
  FOR SELECT TO anon USING (is_active = true);

-- ============================================================================
-- PART 4: CREATE USER_BADGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 100,
  is_featured BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- Enable RLS
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON user_badges TO service_role;
GRANT SELECT, INSERT ON user_badges TO authenticated;
GRANT SELECT ON user_badges TO anon;

-- RLS Policies
DROP POLICY IF EXISTS "service_role_full_access_user_badges" ON user_badges;
DROP POLICY IF EXISTS "users_view_own_badges" ON user_badges;
DROP POLICY IF EXISTS "users_view_others_featured_badges" ON user_badges;
DROP POLICY IF EXISTS "users_earn_badges" ON user_badges;

CREATE POLICY "service_role_full_access_user_badges" ON user_badges
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "users_view_own_badges" ON user_badges
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_view_others_featured_badges" ON user_badges
  FOR SELECT TO authenticated USING (is_featured = true);

CREATE POLICY "users_earn_badges" ON user_badges
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 5: CREATE PORTFOLIO_ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'other',
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'link', 'document')),
  media_url TEXT,
  thumbnail_url TEXT,
  external_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_is_public ON portfolio_items(is_public);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_is_featured ON portfolio_items(is_featured);

-- Enable RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON portfolio_items TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON portfolio_items TO authenticated;
GRANT SELECT ON portfolio_items TO anon;

-- RLS Policies
DROP POLICY IF EXISTS "service_role_full_access_portfolio" ON portfolio_items;
DROP POLICY IF EXISTS "users_manage_own_portfolio" ON portfolio_items;
DROP POLICY IF EXISTS "public_view_portfolio" ON portfolio_items;

CREATE POLICY "service_role_full_access_portfolio" ON portfolio_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "users_manage_own_portfolio" ON portfolio_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "public_view_portfolio" ON portfolio_items
  FOR SELECT TO anon USING (is_public = true);

CREATE POLICY "authenticated_view_public_portfolio" ON portfolio_items
  FOR SELECT TO authenticated USING (is_public = true OR auth.uid() = user_id);

-- ============================================================================
-- PART 6: CREATE QUIZ_ANSWERS TABLE (for tracking individual answers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  selected_answer TEXT,
  is_correct BOOLEAN,
  time_taken_seconds INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON quiz_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_user_id ON quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);

-- Enable RLS
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON quiz_answers TO service_role;
GRANT SELECT, INSERT ON quiz_answers TO authenticated;

-- RLS Policies
DROP POLICY IF EXISTS "service_role_full_access_quiz_answers" ON quiz_answers;
DROP POLICY IF EXISTS "users_view_own_answers" ON quiz_answers;
DROP POLICY IF EXISTS "users_submit_answers" ON quiz_answers;

CREATE POLICY "service_role_full_access_quiz_answers" ON quiz_answers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "users_view_own_answers" ON quiz_answers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_submit_answers" ON quiz_answers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PART 7: SEED DEFAULT BADGES
-- ============================================================================

INSERT INTO badges (name, description, category, tier, icon_name, points, unlock_criteria)
VALUES
  ('Welcome', 'Welcome to ChatNIL! Complete your profile to earn this badge.', 'onboarding', 'bronze', 'star', 10, 'Complete profile setup'),
  ('Profile Pro', 'Completed your profile with all required information.', 'profile', 'silver', 'user-check', 25, 'Fill out all profile fields'),
  ('Quiz Starter', 'Completed your first NIL education quiz.', 'education', 'bronze', 'book-open', 15, 'Complete 1 quiz'),
  ('Quiz Master', 'Completed 10 NIL education quizzes.', 'education', 'gold', 'award', 50, 'Complete 10 quizzes'),
  ('Social Butterfly', 'Connected all your social media accounts.', 'social', 'silver', 'share-2', 30, 'Connect 3+ social accounts'),
  ('Rising Star', 'Reached 1,000 total social media followers.', 'social', 'gold', 'trending-up', 40, 'Reach 1000 followers'),
  ('Deal Maker', 'Successfully completed your first NIL deal.', 'deals', 'gold', 'handshake', 100, 'Complete 1 NIL deal'),
  ('Engaged Learner', 'Spent 30 minutes learning about NIL.', 'education', 'bronze', 'clock', 20, 'Study for 30 minutes'),
  ('Portfolio Builder', 'Added 5 items to your portfolio.', 'portfolio', 'silver', 'folder-plus', 35, 'Add 5 portfolio items'),
  ('Knowledge Seeker', 'Answered 50 quiz questions correctly.', 'education', 'platinum', 'brain', 75, 'Answer 50 questions correctly')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PART 8: REFRESH POSTGREST SCHEMA CACHE
-- ============================================================================

-- This notifies PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Migration 302 completed!' as status;

-- Verify all tables exist
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('quiz_sessions', 'badges', 'user_badges', 'portfolio_items', 'quiz_answers')
ORDER BY table_name;
