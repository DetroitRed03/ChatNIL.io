-- ============================================================================
-- Migration 016: Athlete Profile Enhancements (FIXED VERSION)
-- ============================================================================
-- Uses correct column names: first_name, last_name (not full_name)
-- ============================================================================

-- 1. Add hobby and interest fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS content_creation_interests TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_affinity TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS lifestyle_interests TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS causes_care_about TEXT[] DEFAULT '{}';

-- 2. Add social media statistics
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_media_stats JSONB DEFAULT '[]'::jsonb;

-- 3. Add NIL preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS nil_preferences JSONB DEFAULT '{}'::jsonb;

-- 4. Profile enrichment
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_video_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS content_samples JSONB DEFAULT '[]'::jsonb;

-- 5. Calculated fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_followers INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avg_engagement_rate DECIMAL(5,2) DEFAULT 0.0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_hobbies ON users USING GIN (hobbies);
CREATE INDEX IF NOT EXISTS idx_users_content_creation_interests ON users USING GIN (content_creation_interests);
CREATE INDEX IF NOT EXISTS idx_users_brand_affinity ON users USING GIN (brand_affinity);
CREATE INDEX IF NOT EXISTS idx_users_lifestyle_interests ON users USING GIN (lifestyle_interests);
CREATE INDEX IF NOT EXISTS idx_users_causes_care_about ON users USING GIN (causes_care_about);
CREATE INDEX IF NOT EXISTS idx_users_social_media_stats ON users USING GIN (social_media_stats);
CREATE INDEX IF NOT EXISTS idx_users_nil_preferences ON users USING GIN (nil_preferences);
CREATE INDEX IF NOT EXISTS idx_users_content_samples ON users USING GIN (content_samples);
CREATE INDEX IF NOT EXISTS idx_users_total_followers ON users (total_followers) WHERE role = 'athlete';
CREATE INDEX IF NOT EXISTS idx_users_avg_engagement_rate ON users (avg_engagement_rate) WHERE role = 'athlete';
CREATE INDEX IF NOT EXISTS idx_users_profile_completion_score ON users (profile_completion_score) WHERE role = 'athlete';
CREATE INDEX IF NOT EXISTS idx_users_athlete_matchmaking ON users (role, total_followers, avg_engagement_rate, profile_completion_score) WHERE role = 'athlete' AND onboarding_completed = true;

-- 7. Create functions
CREATE OR REPLACE FUNCTION calculate_total_followers(stats JSONB)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  stat JSONB;
BEGIN
  IF stats IS NULL OR jsonb_array_length(stats) = 0 THEN
    RETURN 0;
  END IF;
  FOR stat IN SELECT * FROM jsonb_array_elements(stats)
  LOOP
    total := total + COALESCE((stat->>'followers')::INTEGER, 0);
  END LOOP;
  RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_avg_engagement_rate(stats JSONB)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  total_rate DECIMAL := 0;
  count INTEGER := 0;
  stat JSONB;
BEGIN
  IF stats IS NULL OR jsonb_array_length(stats) = 0 THEN
    RETURN 0.0;
  END IF;
  FOR stat IN SELECT * FROM jsonb_array_elements(stats)
  LOOP
    IF stat ? 'engagement_rate' THEN
      total_rate := total_rate + COALESCE((stat->>'engagement_rate')::DECIMAL, 0);
      count := count + 1;
    END IF;
  END LOOP;
  IF count > 0 THEN
    RETURN ROUND(total_rate / count, 2);
  ELSE
    RETURN 0.0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_profile_completion_score(user_row users)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Core profile fields (10 points total, 2 points each) - FIXED to use first_name/last_name
  IF user_row.first_name IS NOT NULL AND user_row.first_name != '' THEN score := score + 2; END IF;
  IF user_row.last_name IS NOT NULL AND user_row.last_name != '' THEN score := score + 2; END IF;
  IF user_row.email IS NOT NULL AND user_row.email != '' THEN score := score + 2; END IF;
  IF user_row.bio IS NOT NULL AND user_row.bio != '' THEN score := score + 2; END IF;
  IF user_row.profile_video_url IS NOT NULL AND user_row.profile_video_url != '' THEN score := score + 2; END IF;

  -- Athlete-specific fields (30 points total, 3 points each)
  IF user_row.school_name IS NOT NULL AND user_row.school_name != '' THEN score := score + 3; END IF;
  IF user_row.primary_sport IS NOT NULL AND user_row.primary_sport != '' THEN score := score + 3; END IF;
  IF user_row.position IS NOT NULL AND user_row.position != '' THEN score := score + 3; END IF;
  IF user_row.graduation_year IS NOT NULL THEN score := score + 3; END IF;
  IF user_row.achievements IS NOT NULL AND jsonb_array_length(user_row.achievements) > 0 THEN score := score + 3; END IF;

  -- Interest fields (15 points total, 3 points each)
  IF user_row.hobbies IS NOT NULL AND array_length(user_row.hobbies, 1) > 0 THEN score := score + 3; END IF;
  IF user_row.lifestyle_interests IS NOT NULL AND array_length(user_row.lifestyle_interests, 1) > 0 THEN score := score + 3; END IF;
  IF user_row.brand_affinity IS NOT NULL AND array_length(user_row.brand_affinity, 1) > 0 THEN score := score + 3; END IF;
  IF user_row.causes_care_about IS NOT NULL AND array_length(user_row.causes_care_about, 1) > 0 THEN score := score + 3; END IF;
  IF user_row.content_creation_interests IS NOT NULL AND array_length(user_row.content_creation_interests, 1) > 0 THEN score := score + 3; END IF;

  -- Social media fields (10 points total, 5 points each)
  IF user_row.social_media_stats IS NOT NULL AND jsonb_array_length(user_row.social_media_stats) > 0 THEN score := score + 5; END IF;
  IF user_row.content_samples IS NOT NULL AND jsonb_array_length(user_row.content_samples) > 0 THEN score := score + 5; END IF;

  -- NIL preferences (5 points)
  IF user_row.nil_preferences IS NOT NULL AND user_row.nil_preferences != '{}'::jsonb THEN score := score + 5; END IF;

  -- Convert to percentage (0-100)
  RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_calculated_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_followers := calculate_total_followers(NEW.social_media_stats);
  NEW.avg_engagement_rate := calculate_avg_engagement_rate(NEW.social_media_stats);
  NEW.profile_completion_score := calculate_profile_completion_score(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger
DROP TRIGGER IF EXISTS trigger_update_calculated_fields ON users;
CREATE TRIGGER trigger_update_calculated_fields
  BEFORE INSERT OR UPDATE OF
    social_media_stats, bio, profile_video_url, content_samples, hobbies,
    lifestyle_interests, brand_affinity, causes_care_about, content_creation_interests,
    nil_preferences, first_name, last_name, email, school_name,
    primary_sport, position, graduation_year, achievements
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_calculated_fields();

-- 9. Verification
SELECT 'Migration 016 completed successfully!' as status;
