-- ============================================================================
-- Migration 030: Create Social Media Stats Table (Missing Dependency)
-- ============================================================================
-- This table is required by the FMV calculator but was never created
-- ============================================================================

CREATE TABLE IF NOT EXISTS social_media_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Platform details
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'twitter', 'youtube', 'facebook')),
  handle TEXT NOT NULL,

  -- Metrics
  followers INTEGER NOT NULL DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0.0, -- Percentage (e.g., 6.5 for 6.5%)
  verified BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one entry per user per platform
  UNIQUE(user_id, platform)
);

-- Create indexes
CREATE INDEX idx_social_media_user ON social_media_stats(user_id);
CREATE INDEX idx_social_media_platform ON social_media_stats(platform);
CREATE INDEX idx_social_media_followers ON social_media_stats(followers DESC);

-- Enable RLS
ALTER TABLE social_media_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own social stats"
  ON social_media_stats
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social stats"
  ON social_media_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social stats"
  ON social_media_stats
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social stats"
  ON social_media_stats
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON social_media_stats
  FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON social_media_stats TO authenticated;

-- Comments
COMMENT ON TABLE social_media_stats IS 'Stores social media platform statistics for athletes (followers, engagement, verification status)';
COMMENT ON COLUMN social_media_stats.engagement_rate IS 'Engagement rate as percentage (likes+comments / followers * 100)';
