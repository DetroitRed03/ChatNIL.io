-- Migration 080: Auto-calculate total_followers and avg_engagement_rate
-- Purpose: Add triggers to automatically update calculated social media stats

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_social_stats ON users;
DROP FUNCTION IF EXISTS update_social_stats();

-- Create function to calculate and update social stats
CREATE OR REPLACE FUNCTION update_social_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_total_followers INTEGER;
  v_avg_engagement NUMERIC;
  v_instagram_followers INTEGER := 0;
  v_tiktok_followers INTEGER := 0;
  v_twitter_followers INTEGER := 0;
  v_youtube_subscribers INTEGER := 0;
  v_instagram_engagement NUMERIC := 0;
  v_tiktok_engagement NUMERIC := 0;
  v_twitter_engagement NUMERIC := 0;
  v_engagement_count INTEGER := 0;
BEGIN
  -- Extract follower counts from social_media_stats JSONB
  IF NEW.social_media_stats IS NOT NULL THEN
    -- Instagram
    IF (NEW.social_media_stats->'instagram') IS NOT NULL THEN
      v_instagram_followers := COALESCE((NEW.social_media_stats->'instagram'->>'followers')::INTEGER, 0);
      IF (NEW.social_media_stats->'instagram'->>'engagement_rate') IS NOT NULL THEN
        v_instagram_engagement := COALESCE((NEW.social_media_stats->'instagram'->>'engagement_rate')::NUMERIC, 0);
        IF v_instagram_engagement > 0 THEN
          v_engagement_count := v_engagement_count + 1;
        END IF;
      END IF;
    END IF;

    -- TikTok
    IF (NEW.social_media_stats->'tiktok') IS NOT NULL THEN
      v_tiktok_followers := COALESCE((NEW.social_media_stats->'tiktok'->>'followers')::INTEGER, 0);
      IF (NEW.social_media_stats->'tiktok'->>'engagement_rate') IS NOT NULL THEN
        v_tiktok_engagement := COALESCE((NEW.social_media_stats->'tiktok'->>'engagement_rate')::NUMERIC, 0);
        IF v_tiktok_engagement > 0 THEN
          v_engagement_count := v_engagement_count + 1;
        END IF;
      END IF;
    END IF;

    -- Twitter
    IF (NEW.social_media_stats->'twitter') IS NOT NULL THEN
      v_twitter_followers := COALESCE((NEW.social_media_stats->'twitter'->>'followers')::INTEGER, 0);
      IF (NEW.social_media_stats->'twitter'->>'engagement_rate') IS NOT NULL THEN
        v_twitter_engagement := COALESCE((NEW.social_media_stats->'twitter'->>'engagement_rate')::NUMERIC, 0);
        IF v_twitter_engagement > 0 THEN
          v_engagement_count := v_engagement_count + 1;
        END IF;
      END IF;
    END IF;

    -- YouTube (subscribers, not followers)
    IF (NEW.social_media_stats->'youtube') IS NOT NULL THEN
      v_youtube_subscribers := COALESCE((NEW.social_media_stats->'youtube'->>'subscribers')::INTEGER, 0);
    END IF;
  END IF;

  -- Calculate total followers
  v_total_followers := v_instagram_followers + v_tiktok_followers + v_twitter_followers + v_youtube_subscribers;

  -- Calculate average engagement rate (only from platforms that have engagement)
  IF v_engagement_count > 0 THEN
    v_avg_engagement := (v_instagram_engagement + v_tiktok_engagement + v_twitter_engagement) / v_engagement_count;
  ELSE
    v_avg_engagement := 0;
  END IF;

  -- Update the calculated fields
  NEW.total_followers := v_total_followers;
  NEW.avg_engagement_rate := v_avg_engagement;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert or update
CREATE TRIGGER trigger_update_social_stats
  BEFORE INSERT OR UPDATE OF social_media_stats
  ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_social_stats();

-- Backfill existing data
UPDATE users
SET social_media_stats = social_media_stats
WHERE social_media_stats IS NOT NULL;

COMMENT ON FUNCTION update_social_stats() IS 'Automatically calculates total_followers and avg_engagement_rate from social_media_stats JSONB field';
COMMENT ON TRIGGER trigger_update_social_stats ON users IS 'Triggers recalculation of social stats whenever social_media_stats is updated';
