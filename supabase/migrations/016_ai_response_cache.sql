-- AI Response Cache Table
-- Stores cached AI responses to reduce API costs and improve response time

CREATE TABLE IF NOT EXISTS ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash VARCHAR(32) NOT NULL,
  query_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  user_role VARCHAR(50) NOT NULL DEFAULT 'athlete',
  hit_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',

  -- Unique constraint on hash + role combination
  CONSTRAINT unique_query_role UNIQUE (query_hash, user_role)
);

-- Index for fast lookups by hash
CREATE INDEX IF NOT EXISTS idx_cache_query_hash ON ai_response_cache(query_hash);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON ai_response_cache(expires_at);

-- Index for analytics (most popular queries)
CREATE INDEX IF NOT EXISTS idx_cache_hit_count ON ai_response_cache(hit_count DESC);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cache_updated_at ON ai_response_cache;
CREATE TRIGGER trigger_cache_updated_at
  BEFORE UPDATE ON ai_response_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_cache_updated_at();

-- Function to clean up expired cache entries (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_response_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ai_response_cache TO authenticated;
GRANT ALL ON ai_response_cache TO service_role;

-- Add RLS policies
ALTER TABLE ai_response_cache ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access"
  ON ai_response_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read cache
CREATE POLICY "Authenticated users can read cache"
  ON ai_response_cache
  FOR SELECT
  TO authenticated
  USING (true);

COMMENT ON TABLE ai_response_cache IS 'Caches AI responses for common queries to reduce API costs';
COMMENT ON COLUMN ai_response_cache.query_hash IS 'SHA256 hash of normalized query + user role';
COMMENT ON COLUMN ai_response_cache.hit_count IS 'Number of times this cached response was used';
COMMENT ON COLUMN ai_response_cache.expires_at IS 'Cache entry expiration time (TTL-based)';
