-- Migration 150: Add missing onboarding columns to athlete_profiles
-- These columns are needed for the complete athlete onboarding flow

-- School level (high-school, college, university)
ALTER TABLE public.athlete_profiles
ADD COLUMN IF NOT EXISTS school_level TEXT;

-- Coach information
ALTER TABLE public.athlete_profiles
ADD COLUMN IF NOT EXISTS coach_name TEXT;

ALTER TABLE public.athlete_profiles
ADD COLUMN IF NOT EXISTS coach_email TEXT;

-- Agent information
ALTER TABLE public.athlete_profiles
ADD COLUMN IF NOT EXISTS has_agent BOOLEAN DEFAULT false;

ALTER TABLE public.athlete_profiles
ADD COLUMN IF NOT EXISTS agent_info JSONB;

-- Add comments for documentation
COMMENT ON COLUMN public.athlete_profiles.school_level IS 'Academic level: high-school, college, or university';
COMMENT ON COLUMN public.athlete_profiles.coach_name IS 'Name of the athlete''s primary coach';
COMMENT ON COLUMN public.athlete_profiles.coach_email IS 'Email address of the athlete''s primary coach';
COMMENT ON COLUMN public.athlete_profiles.has_agent IS 'Whether the athlete has representation';
COMMENT ON COLUMN public.athlete_profiles.agent_info IS 'JSON object containing agent details (name, email, agency)';

-- Grant permissions to authenticated users
GRANT SELECT ON public.athlete_profiles TO authenticated;
GRANT UPDATE (school_level, coach_name, coach_email, has_agent, agent_info) ON public.athlete_profiles TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
