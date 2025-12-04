-- ============================================================================
-- Migration 030 FIX: Grant Service Role Access to social_media_stats
-- ============================================================================
-- The service role needs full access for seeding and automated operations
-- ============================================================================

-- Grant all permissions to service_role
GRANT ALL ON social_media_stats TO service_role;

-- Also grant to anon for public read access (if needed)
GRANT SELECT ON social_media_stats TO anon;

-- Verify service role policy exists (it should from migration 030)
-- If not, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'social_media_stats'
    AND policyname = 'Service role full access'
  ) THEN
    CREATE POLICY "Service role full access"
      ON social_media_stats
      FOR ALL
      USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role')
      WITH CHECK (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');
  END IF;
END $$;

SELECT 'Permissions fixed for social_media_stats' as status;
