-- =====================================================
-- Migration 301: Database-Driven Rate Limiting
-- Purpose: Add rate limiting without external dependencies
-- Pattern: Same approach as FMV rate limiting
-- =====================================================

-- =====================================================
-- SECTION 1: Create rate limit tracking table
-- =====================================================

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_endpoint
  ON api_rate_limits(user_id, endpoint);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON api_rate_limits(window_start);

-- =====================================================
-- SECTION 2: Rate limit check function
-- Returns TRUE if request is allowed, FALSE if rate limited
-- =====================================================

CREATE OR REPLACE FUNCTION check_api_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
  v_window_expired BOOLEAN;
BEGIN
  -- Upsert rate limit record and check count
  INSERT INTO api_rate_limits (user_id, endpoint, request_count, window_start)
  VALUES (p_user_id, p_endpoint, 1, NOW())
  ON CONFLICT (user_id, endpoint) DO UPDATE
  SET
    -- Reset window if expired, otherwise increment
    request_count = CASE
      WHEN api_rate_limits.window_start < NOW() - (p_window_minutes || ' minutes')::interval
      THEN 1
      ELSE api_rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN api_rate_limits.window_start < NOW() - (p_window_minutes || ' minutes')::interval
      THEN NOW()
      ELSE api_rate_limits.window_start
    END
  RETURNING request_count INTO v_current_count;

  -- Return true if under limit
  RETURN v_current_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 3: Get remaining rate limit info
-- Returns number of requests remaining in current window
-- =====================================================

CREATE OR REPLACE FUNCTION get_rate_limit_remaining(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
) RETURNS JSON AS $$
DECLARE
  v_record RECORD;
  v_remaining INTEGER;
  v_reset_time TIMESTAMPTZ;
BEGIN
  -- Get current rate limit record
  SELECT request_count, window_start
  INTO v_record
  FROM api_rate_limits
  WHERE user_id = p_user_id AND endpoint = p_endpoint;

  IF NOT FOUND THEN
    -- No record means full limit available
    RETURN json_build_object(
      'remaining', p_max_requests,
      'limit', p_max_requests,
      'reset_at', NOW() + (p_window_minutes || ' minutes')::interval
    );
  END IF;

  -- Check if window expired
  IF v_record.window_start < NOW() - (p_window_minutes || ' minutes')::interval THEN
    RETURN json_build_object(
      'remaining', p_max_requests,
      'limit', p_max_requests,
      'reset_at', NOW() + (p_window_minutes || ' minutes')::interval
    );
  END IF;

  -- Calculate remaining
  v_remaining := GREATEST(0, p_max_requests - v_record.request_count);
  v_reset_time := v_record.window_start + (p_window_minutes || ' minutes')::interval;

  RETURN json_build_object(
    'remaining', v_remaining,
    'limit', p_max_requests,
    'reset_at', v_reset_time,
    'used', v_record.request_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 4: Anonymous rate limiting (by IP hash)
-- For unauthenticated endpoints like auth
-- =====================================================

CREATE TABLE IF NOT EXISTS anon_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,  -- IP hash or fingerprint
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(identifier, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_anon_rate_limits_identifier
  ON anon_rate_limits(identifier, endpoint);

-- Anonymous rate limit check function
CREATE OR REPLACE FUNCTION check_anon_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_count INTEGER;
BEGIN
  INSERT INTO anon_rate_limits (identifier, endpoint, request_count, window_start)
  VALUES (p_identifier, p_endpoint, 1, NOW())
  ON CONFLICT (identifier, endpoint) DO UPDATE
  SET
    request_count = CASE
      WHEN anon_rate_limits.window_start < NOW() - (p_window_minutes || ' minutes')::interval
      THEN 1
      ELSE anon_rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN anon_rate_limits.window_start < NOW() - (p_window_minutes || ' minutes')::interval
      THEN NOW()
      ELSE anon_rate_limits.window_start
    END
  RETURNING request_count INTO v_current_count;

  RETURN v_current_count <= p_max_requests;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 5: Cleanup old rate limit records (run periodically)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS void AS $$
BEGIN
  -- Delete records older than 24 hours
  DELETE FROM api_rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';

  DELETE FROM anon_rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SECTION 6: Enable RLS on rate limit tables
-- =====================================================

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE anon_rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role can manage all rate limits
CREATE POLICY "Service role can manage rate limits" ON api_rate_limits
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage anon rate limits" ON anon_rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own rate limits (for transparency)
CREATE POLICY "Users can view own rate limits" ON api_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- SECTION 7: Grant necessary permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION check_api_rate_limit TO service_role;
GRANT EXECUTE ON FUNCTION check_anon_rate_limit TO service_role;
GRANT EXECUTE ON FUNCTION get_rate_limit_remaining TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_rate_limits TO service_role;

-- =====================================================
-- Rate Limiting Setup Complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Rate Limiting Migration Complete';
  RAISE NOTICE '';
  RAISE NOTICE 'Available functions:';
  RAISE NOTICE '  - check_api_rate_limit(user_id, endpoint, max_requests, window_minutes)';
  RAISE NOTICE '  - check_anon_rate_limit(identifier, endpoint, max_requests, window_minutes)';
  RAISE NOTICE '  - get_rate_limit_remaining(user_id, endpoint, max_requests, window_minutes)';
  RAISE NOTICE '  - cleanup_old_rate_limits()';
  RAISE NOTICE '';
  RAISE NOTICE 'Example usage in API:';
  RAISE NOTICE '  SELECT check_api_rate_limit(user_uuid, ''chat_ai'', 20, 1);';
  RAISE NOTICE '  -- Returns TRUE if allowed, FALSE if rate limited';
  RAISE NOTICE '=====================================================';
END $$;
