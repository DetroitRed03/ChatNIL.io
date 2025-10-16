-- Migration 015: Add Agency Role and Fields
-- Description: Extends user system to support agency/company accounts for brands seeking athlete partnerships
-- Date: 2025-10-15
-- Author: ChatNIL Development Team

BEGIN;

-- =====================================================
-- Step 1: Extend role enum to include 'agency'
-- =====================================================

-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with agency role
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('athlete', 'parent', 'coach', 'agency'));

COMMENT ON CONSTRAINT users_role_check ON users IS 'Allowed user roles: athlete, parent, coach, agency';

-- =====================================================
-- Step 2: Add agency-specific fields to users table
-- =====================================================

-- Company Information
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_size TEXT
  CHECK (company_size IS NULL OR company_size IN ('1-10', '11-50', '51-200', '201-500', '500+'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Targeting and Campaign Information
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_demographics JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS campaign_interests TEXT[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS budget_range TEXT
  CHECK (budget_range IS NULL OR budget_range IN ('under_5k', '5k_25k', '25k_100k', '100k_500k', '500k_plus'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS geographic_focus TEXT[] DEFAULT '{}';

-- Brand Identity
ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_values TEXT[] DEFAULT '{}';

-- Verification System
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending'
  CHECK (verification_status IN ('pending', 'verified', 'rejected'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- =====================================================
-- Step 3: Create indexes for performance
-- =====================================================

-- Index on role (for filtering by role)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index on verification status for agencies
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status)
  WHERE role = 'agency';

-- Index on industry for agency searches
CREATE INDEX IF NOT EXISTS idx_users_industry ON users(industry)
  WHERE role = 'agency';

-- GIN index for target_demographics JSONB queries
CREATE INDEX IF NOT EXISTS idx_users_target_demographics ON users USING GIN(target_demographics)
  WHERE role = 'agency';

-- GIN index for array columns (campaign_interests, geographic_focus, brand_values)
CREATE INDEX IF NOT EXISTS idx_users_campaign_interests ON users USING GIN(campaign_interests)
  WHERE role = 'agency';
CREATE INDEX IF NOT EXISTS idx_users_geographic_focus ON users USING GIN(geographic_focus)
  WHERE role = 'agency';
CREATE INDEX IF NOT EXISTS idx_users_brand_values ON users USING GIN(brand_values)
  WHERE role = 'agency';

-- =====================================================
-- Step 4: Add helpful column comments
-- =====================================================

COMMENT ON COLUMN users.company_name IS 'Brand or company name for agency users';
COMMENT ON COLUMN users.industry IS 'Business sector/industry (e.g., Sports Apparel, Technology, Food & Beverage)';
COMMENT ON COLUMN users.company_size IS 'Number of employees: 1-10, 11-50, 51-200, 201-500, 500+';
COMMENT ON COLUMN users.website_url IS 'Company website URL';
COMMENT ON COLUMN users.target_demographics IS 'JSON object: {age_range: {min: 18, max: 25}, gender: ["male", "female"], interests: ["basketball", "fitness"]}';
COMMENT ON COLUMN users.campaign_interests IS 'Array of campaign types: social_media, endorsement, appearance, content_creation, etc.';
COMMENT ON COLUMN users.budget_range IS 'Budget tier: under_5k, 5k_25k, 25k_100k, 100k_500k, 500k_plus';
COMMENT ON COLUMN users.geographic_focus IS 'Array of geographic regions/states where agency operates or targets';
COMMENT ON COLUMN users.brand_values IS 'Array of brand values: sustainability, diversity, innovation, performance, etc.';
COMMENT ON COLUMN users.verification_status IS 'Agency verification status (pending/verified/rejected) - verified agencies have completed business verification';
COMMENT ON COLUMN users.verified_at IS 'Timestamp when agency was verified';

-- =====================================================
-- Step 5: Verify migration
-- =====================================================

-- Check that all new columns exist
DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  SELECT ARRAY_AGG(column_name)
  INTO missing_columns
  FROM (
    VALUES
      ('company_name'),
      ('industry'),
      ('company_size'),
      ('website_url'),
      ('target_demographics'),
      ('campaign_interests'),
      ('budget_range'),
      ('geographic_focus'),
      ('brand_values'),
      ('verification_status'),
      ('verified_at')
  ) AS expected(column_name)
  WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
      AND table_schema = 'public'
      AND columns.column_name = expected.column_name
  );

  IF missing_columns IS NOT NULL AND array_length(missing_columns, 1) > 0 THEN
    RAISE EXCEPTION 'Migration incomplete. Missing columns: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE '✅ Migration 015 complete: All agency fields added successfully';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- Rollback Instructions (if needed)
-- =====================================================

-- To rollback this migration:
/*
BEGIN;

-- Remove indexes
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_verification_status;
DROP INDEX IF EXISTS idx_users_industry;
DROP INDEX IF EXISTS idx_users_target_demographics;
DROP INDEX IF EXISTS idx_users_campaign_interests;
DROP INDEX IF EXISTS idx_users_geographic_focus;
DROP INDEX IF EXISTS idx_users_brand_values;

-- Remove columns
ALTER TABLE users DROP COLUMN IF EXISTS company_name;
ALTER TABLE users DROP COLUMN IF EXISTS industry;
ALTER TABLE users DROP COLUMN IF EXISTS company_size;
ALTER TABLE users DROP COLUMN IF EXISTS website_url;
ALTER TABLE users DROP COLUMN IF EXISTS target_demographics;
ALTER TABLE users DROP COLUMN IF EXISTS campaign_interests;
ALTER TABLE users DROP COLUMN IF EXISTS budget_range;
ALTER TABLE users DROP COLUMN IF EXISTS geographic_focus;
ALTER TABLE users DROP COLUMN IF EXISTS brand_values;
ALTER TABLE users DROP COLUMN IF EXISTS verification_status;
ALTER TABLE users DROP COLUMN IF EXISTS verified_at;

-- Restore original role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('athlete', 'parent', 'coach'));

COMMIT;
*/
