-- Migration 027: School System and Two-Tier Onboarding
-- Creates schools table for distribution channels and adds school-related fields to users

BEGIN;

-- ============================================================================
-- SCHOOLS TABLE (Distribution channels, NOT user accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  school_name TEXT NOT NULL,
  school_district TEXT,
  state TEXT NOT NULL,
  school_type TEXT CHECK (school_type IN ('high_school', 'college', 'university', 'community_college')),

  -- URL Configuration
  custom_slug TEXT UNIQUE NOT NULL,
  signup_url TEXT GENERATED ALWAYS AS (
    'https://chatnil.io/school/' || custom_slug || '/signup'
  ) STORED,

  -- QR Code & Branding
  qr_code_url TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',

  -- Statistics
  students_registered INTEGER DEFAULT 0,
  students_completed INTEGER DEFAULT 0,

  -- Contact Information
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- Status
  active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- ============================================================================
-- ADD SCHOOL-RELATED FIELDS TO USERS TABLE
-- ============================================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS school_created BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_completion_tier TEXT DEFAULT 'full'
    CHECK (profile_completion_tier IN ('basic', 'full')),
  ADD COLUMN IF NOT EXISTS home_completion_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id),
  ADD COLUMN IF NOT EXISTS home_completed_at TIMESTAMPTZ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(custom_slug);
CREATE INDEX IF NOT EXISTS idx_schools_state ON schools(state);
CREATE INDEX IF NOT EXISTS idx_schools_active ON schools(active);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_completion_tier ON users(profile_completion_tier);
CREATE INDEX IF NOT EXISTS idx_users_school_created ON users(school_created);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Anyone can view active schools (for signup page lookup)
CREATE POLICY "Anyone can view active schools"
  ON schools FOR SELECT
  USING (active = true);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access to schools"
  ON schools FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================
-- Reuse existing update_updated_at_column function
CREATE TRIGGER trigger_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE schools IS 'Schools as distribution channels for student athlete signups, not user accounts';
COMMENT ON COLUMN schools.custom_slug IS 'URL-friendly identifier for school signup pages (e.g., "test-hs")';
COMMENT ON COLUMN schools.signup_url IS 'Auto-generated signup URL for this school';
COMMENT ON COLUMN schools.students_registered IS 'Total number of students who created accounts via this school';
COMMENT ON COLUMN schools.students_completed IS 'Number of students who completed home onboarding';

COMMENT ON COLUMN users.school_created IS 'True if account was created via school signup (FERPA-compliant minimal data)';
COMMENT ON COLUMN users.profile_completion_tier IS 'basic = school signup only, full = completed home onboarding';
COMMENT ON COLUMN users.home_completion_required IS 'True if user needs to complete profile at home';
COMMENT ON COLUMN users.school_id IS 'Reference to school if account was created via school signup';
COMMENT ON COLUMN users.home_completed_at IS 'Timestamp when user completed home onboarding (upgraded from basic to full)';

COMMIT;
