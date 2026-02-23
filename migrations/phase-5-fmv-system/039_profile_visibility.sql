-- =============================================
-- Migration 039: Profile Visibility Columns
-- =============================================
-- Adds is_public and parent consent columns to
-- athlete_profiles for profile visibility control.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'is_public') THEN
    ALTER TABLE athlete_profiles ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'parent_consent_given') THEN
    ALTER TABLE athlete_profiles ADD COLUMN parent_consent_given BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'parent_consent_date') THEN
    ALTER TABLE athlete_profiles ADD COLUMN parent_consent_date TIMESTAMPTZ;
  END IF;
END $$;

-- Index for public profile queries
CREATE INDEX IF NOT EXISTS idx_athlete_profiles_public
ON athlete_profiles(is_public) WHERE is_public = true;

-- Verification
SELECT 'profile visibility columns added' AS status;
