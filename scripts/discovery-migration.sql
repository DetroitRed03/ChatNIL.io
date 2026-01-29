-- ChatNIL Discovery System Migration
-- Run this in Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/lqskiijspudfocddkhqs/sql/new

-- ============================================
-- 1. Add columns to athlete_profiles
-- ============================================
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50);
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS learning_path VARCHAR(50);
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS consent_status VARCHAR(50);
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS school_name VARCHAR(255);
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS primary_state VARCHAR(2);

-- ============================================
-- 2. Create conversation_flows table
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversation_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_pillar VARCHAR(50) DEFAULT 'identity',
  current_day INT DEFAULT 1,
  current_question_number INT DEFAULT 1,
  answers_given JSONB DEFAULT '{}',
  messages_history JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT conversation_flows_user_id_key UNIQUE (user_id)
);

-- ============================================
-- 3. Create chapter_unlocks table
-- ============================================
CREATE TABLE IF NOT EXISTS public.chapter_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id VARCHAR(50) NOT NULL,
  chapter_name VARCHAR(255),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chapter_unlocks_user_chapter UNIQUE (user_id, chapter_id)
);

-- ============================================
-- 4. Create student_discovery_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_discovery_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT student_discovery_profiles_user_id_key UNIQUE (user_id)
);

-- ============================================
-- 5. Enable RLS
-- ============================================
ALTER TABLE public.conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_discovery_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS Policies for conversation_flows
-- ============================================
DROP POLICY IF EXISTS "Users can view own conversation flow" ON public.conversation_flows;
CREATE POLICY "Users can view own conversation flow" ON public.conversation_flows
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own conversation flow" ON public.conversation_flows;
CREATE POLICY "Users can insert own conversation flow" ON public.conversation_flows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own conversation flow" ON public.conversation_flows;
CREATE POLICY "Users can update own conversation flow" ON public.conversation_flows
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 7. RLS Policies for chapter_unlocks
-- ============================================
DROP POLICY IF EXISTS "Users can view own chapter unlocks" ON public.chapter_unlocks;
CREATE POLICY "Users can view own chapter unlocks" ON public.chapter_unlocks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chapter unlocks" ON public.chapter_unlocks;
CREATE POLICY "Users can insert own chapter unlocks" ON public.chapter_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. RLS Policies for student_discovery_profiles
-- ============================================
DROP POLICY IF EXISTS "Users can view own discovery profile" ON public.student_discovery_profiles;
CREATE POLICY "Users can view own discovery profile" ON public.student_discovery_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own discovery profile" ON public.student_discovery_profiles;
CREATE POLICY "Users can insert own discovery profile" ON public.student_discovery_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own discovery profile" ON public.student_discovery_profiles;
CREATE POLICY "Users can update own discovery profile" ON public.student_discovery_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 9. Service role bypass policies
-- ============================================
DROP POLICY IF EXISTS "Service role full access to conversation_flows" ON public.conversation_flows;
CREATE POLICY "Service role full access to conversation_flows" ON public.conversation_flows
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access to chapter_unlocks" ON public.chapter_unlocks;
CREATE POLICY "Service role full access to chapter_unlocks" ON public.chapter_unlocks
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role full access to student_discovery_profiles" ON public.student_discovery_profiles;
CREATE POLICY "Service role full access to student_discovery_profiles" ON public.student_discovery_profiles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Done! Now run the test user script
-- ============================================
SELECT 'Migration complete! Run: npx tsx scripts/create-test-hs-student.ts' as message;
