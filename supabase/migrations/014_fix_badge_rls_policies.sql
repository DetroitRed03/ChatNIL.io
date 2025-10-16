-- Migration: Fix Badge RLS Policies
-- Description: Allow authenticated users to read badges, keep writes restricted to service_role
-- Created: 2025-10-02

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Everyone can read active badges" ON badges;
DROP POLICY IF EXISTS "Service role can manage badges" ON badges;

-- Create new policies: Allow authenticated users to read active badges
CREATE POLICY "Authenticated users can read active badges" ON badges
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Service role can do everything
CREATE POLICY "Service role has full access to badges" ON badges
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 014 completed: Badge RLS policies fixed!';
    RAISE NOTICE 'Authenticated users can now read active badges';
    RAISE NOTICE 'Service role maintains full access';
END $$;
