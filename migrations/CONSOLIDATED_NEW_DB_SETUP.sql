-- ============================================================================
-- CONSOLIDATED SETUP FOR NEW SUPABASE DATABASE
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: agencies
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  agency_type TEXT,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all agencies" ON public.agencies;
CREATE POLICY "Users can view all agencies" ON public.agencies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Agencies can update own profile" ON public.agencies;
CREATE POLICY "Agencies can update own profile" ON public.agencies FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- TABLE: athlete_fmv_data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.athlete_fmv_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fmv_score INTEGER,
  fmv_tier TEXT,
  percentile_rank INTEGER,
  deal_value_min NUMERIC,
  deal_value_max NUMERIC,
  is_public_score BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(athlete_id)
);

ALTER TABLE public.athlete_fmv_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Athletes can view own FMV" ON public.athlete_fmv_data;
CREATE POLICY "Athletes can view own FMV" ON public.athlete_fmv_data FOR SELECT
  USING (auth.uid() = athlete_id OR is_public_score = true);

-- ============================================================================
-- TABLE: agency_athlete_matches
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agency_athlete_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL,
  tier TEXT,
  status TEXT DEFAULT 'active',
  match_reasons TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agency_id, athlete_id)
);

ALTER TABLE public.agency_athlete_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own matches" ON public.agency_athlete_matches;
CREATE POLICY "Users can view own matches" ON public.agency_athlete_matches FOR SELECT
  USING (auth.uid() = agency_id OR auth.uid() = athlete_id);

-- ============================================================================
-- TABLE: agency_athlete_messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agency_athlete_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.agency_athlete_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agency_athlete_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.agency_athlete_messages;
CREATE POLICY "Users can view messages in their matches" ON public.agency_athlete_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.agency_athlete_matches
    WHERE id = match_id AND (agency_id = auth.uid() OR athlete_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can send messages in their matches" ON public.agency_athlete_messages;
CREATE POLICY "Users can send messages in their matches" ON public.agency_athlete_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.agency_athlete_matches
    WHERE id = match_id AND (agency_id = auth.uid() OR athlete_id = auth.uid())
  ) AND sender_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.agency_athlete_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.agency_athlete_messages(created_at DESC);

-- ============================================================================
-- TABLE: quiz_questions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view quiz questions" ON public.quiz_questions;
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);

-- ============================================================================
-- VIEW: conversation_summaries
-- ============================================================================
CREATE OR REPLACE VIEW public.conversation_summaries AS
SELECT
  m.match_id,
  m.match_id as conversation_id,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE m.read_at IS NULL AND m.sender_id != auth.uid()) as unread_count,
  MAX(m.created_at) as last_message_at,
  (SELECT content FROM public.agency_athlete_messages WHERE match_id = m.match_id ORDER BY created_at DESC LIMIT 1) as last_message,
  (SELECT sender_id FROM public.agency_athlete_messages WHERE match_id = m.match_id ORDER BY created_at DESC LIMIT 1) as last_sender_id,
  ma.agency_id,
  ma.athlete_id,
  ma.status as match_status,
  ma.match_score,
  ma.tier,
  ag.company_name as agency_name,
  ag.logo_url as agency_logo
FROM public.agency_athlete_messages m
JOIN public.agency_athlete_matches ma ON ma.id = m.match_id
LEFT JOIN public.agencies ag ON ag.id = ma.agency_id
WHERE ma.agency_id = auth.uid() OR ma.athlete_id = auth.uid()
GROUP BY m.match_id, ma.agency_id, ma.athlete_id, ma.status, ma.match_score, ma.tier, ag.company_name, ag.logo_url
ORDER BY last_message_at DESC NULLS LAST;

GRANT SELECT ON public.conversation_summaries TO authenticated;

-- ============================================================================
-- FUNCTION: mark_messages_read
-- ============================================================================
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_match_id UUID)
RETURNS TABLE (updated_count INTEGER, success BOOLEAN, error_message TEXT) AS $$
DECLARE
  v_user_id UUID;
  v_is_participant BOOLEAN;
  v_updated_count INTEGER;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 0, FALSE, 'Not authenticated'::TEXT;
    RETURN;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.agency_athlete_matches
    WHERE id = p_match_id AND (agency_id = v_user_id OR athlete_id = v_user_id)
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RETURN QUERY SELECT 0, FALSE, 'Not authorized'::TEXT;
    RETURN;
  END IF;

  WITH updated AS (
    UPDATE public.agency_athlete_messages
    SET read_at = NOW()
    WHERE match_id = p_match_id
      AND sender_id != v_user_id
      AND read_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*)::INTEGER INTO v_updated_count FROM updated;

  RETURN QUERY SELECT v_updated_count, TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.mark_messages_read(UUID) TO authenticated;

-- ============================================================================
-- FUNCTION: get_unread_count
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_unread_count()
RETURNS TABLE (total_unread INTEGER, conversations_with_unread INTEGER) AS $$
DECLARE
  v_user_id UUID;
  v_total_unread INTEGER;
  v_conversations_with_unread INTEGER;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;

  SELECT COUNT(*)::INTEGER INTO v_total_unread
  FROM public.agency_athlete_messages m
  JOIN public.agency_athlete_matches ma ON ma.id = m.match_id
  WHERE (ma.agency_id = v_user_id OR ma.athlete_id = v_user_id)
    AND m.sender_id != v_user_id
    AND m.read_at IS NULL;

  SELECT COUNT(DISTINCT m.match_id)::INTEGER INTO v_conversations_with_unread
  FROM public.agency_athlete_messages m
  JOIN public.agency_athlete_matches ma ON ma.id = m.match_id
  WHERE (ma.agency_id = v_user_id OR ma.athlete_id = v_user_id)
    AND m.sender_id != v_user_id
    AND m.read_at IS NULL;

  RETURN QUERY SELECT v_total_unread, v_conversations_with_unread;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_unread_count() TO authenticated;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- Next steps:
-- 1. Run the seeding script: npx tsx scripts/seed-new-database.ts
-- 2. Enable Realtime in Dashboard > Database > Replication for:
--    - agency_athlete_messages
-- 3. Test at http://localhost:3001
-- ============================================================================
