-- ============================================================================
-- Migration 025: Institution Profiles (Schools/Universities)
-- ============================================================================
-- Creates institution_profiles table for schools and universities
-- Supports custom branding, QR codes, and FERPA-compliant athlete management
-- ============================================================================

-- Create ENUM for institution types
CREATE TYPE institution_type AS ENUM (
  'high_school',
  'community_college',
  'junior_college',
  'college',
  'university',
  'prep_school',
  'academy'
);

-- Create institution_profiles table
CREATE TABLE institution_profiles (
  -- Primary identification (references users table)
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Basic institution information
  institution_name TEXT NOT NULL,
  institution_type institution_type NOT NULL,

  -- Official identifiers
  nces_id TEXT UNIQUE, -- National Center for Education Statistics ID
  state_code TEXT, -- 'KY', 'CA', etc.
  county TEXT,
  district TEXT,

  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'USA',

  -- Contact information
  phone TEXT,
  website_url TEXT,
  athletic_department_email TEXT,
  athletic_director_name TEXT,
  compliance_officer_email TEXT,

  -- Branding and customization
  custom_url_slug TEXT UNIQUE, -- e.g., 'kentucky-central-hs'
  logo_url TEXT,
  primary_color TEXT, -- Hex color code
  secondary_color TEXT,
  custom_splash_page JSONB DEFAULT '{}'::jsonb, -- {logo_url, primary_color, welcome_message, background_image}

  -- QR code for athlete recruitment
  qr_code_url TEXT, -- Link to downloadable QR code
  athlete_signup_url TEXT, -- Custom signup URL with institution pre-filled

  -- Compliance and settings
  ferpa_compliant BOOLEAN NOT NULL DEFAULT true, -- Always true for school-created accounts
  requires_approval_for_nil_deals BOOLEAN NOT NULL DEFAULT false,
  automatic_athlete_association BOOLEAN NOT NULL DEFAULT true, -- Auto-link athletes who sign up with school email domain

  -- Email domains (for automatic athlete association)
  email_domains TEXT[] DEFAULT '{}', -- ['@school.edu', '@students.school.edu']

  -- Statistics
  total_athletes INTEGER NOT NULL DEFAULT 0,
  total_active_nil_deals INTEGER NOT NULL DEFAULT 0,
  total_nil_value DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

  -- Features and permissions
  can_create_bulk_accounts BOOLEAN NOT NULL DEFAULT true,
  can_view_athlete_analytics BOOLEAN NOT NULL DEFAULT true,
  can_approve_nil_deals BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  verified BOOLEAN NOT NULL DEFAULT false, -- Email/identity verified
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_institution_profiles_name ON institution_profiles(institution_name);
CREATE INDEX idx_institution_profiles_type ON institution_profiles(institution_type);
CREATE INDEX idx_institution_profiles_state ON institution_profiles(state_code);
CREATE INDEX idx_institution_profiles_nces ON institution_profiles(nces_id);
CREATE INDEX idx_institution_profiles_slug ON institution_profiles(custom_url_slug);
CREATE INDEX idx_institution_profiles_verified ON institution_profiles(verified);

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Institutions can read and update their own profile
CREATE POLICY "Institutions can manage own profile"
  ON institution_profiles
  FOR ALL
  USING (
    id = auth.uid()
  )
  WITH CHECK (
    id = auth.uid()
  );

-- Policy 2: Public can read basic institution information
CREATE POLICY "Public can view institution profiles"
  ON institution_profiles
  FOR SELECT
  USING (true);

-- Policy 3: Service role can manage all institutions
CREATE POLICY "Service role can manage all institutions"
  ON institution_profiles
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ============================================================================
-- TRIGGER: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_institution_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_institution_profiles_updated_at
  BEFORE UPDATE ON institution_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_institution_profiles_updated_at();

-- ============================================================================
-- TRIGGER: Generate custom URL slug if not provided
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_institution_slug()
RETURNS TRIGGER AS $$
DECLARE
  v_slug TEXT;
  v_counter INTEGER := 0;
BEGIN
  -- If slug not provided, generate one
  IF NEW.custom_url_slug IS NULL OR NEW.custom_url_slug = '' THEN
    -- Create base slug from institution name
    v_slug := LOWER(REGEXP_REPLACE(NEW.institution_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := TRIM(BOTH '-' FROM v_slug);

    -- Check if slug exists and append number if needed
    WHILE EXISTS (SELECT 1 FROM institution_profiles WHERE custom_url_slug = v_slug) LOOP
      v_counter := v_counter + 1;
      v_slug := v_slug || '-' || v_counter::TEXT;
    END LOOP;

    NEW.custom_url_slug := v_slug;
  END IF;

  -- Generate athlete signup URL
  IF NEW.athlete_signup_url IS NULL OR NEW.athlete_signup_url = '' THEN
    NEW.athlete_signup_url := 'https://chatnil.io/signup/institution/' || NEW.custom_url_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_institution_slug
  BEFORE INSERT OR UPDATE OF institution_name, custom_url_slug ON institution_profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_institution_slug();

-- ============================================================================
-- HELPER FUNCTION: Get institution by slug
-- ============================================================================
CREATE OR REPLACE FUNCTION get_institution_by_slug(p_slug TEXT)
RETURNS TABLE (
  id UUID,
  institution_name TEXT,
  institution_type TEXT,
  state_code TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  website_url TEXT,
  athlete_signup_url TEXT,
  total_athletes INTEGER,
  verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.institution_name,
    i.institution_type::TEXT,
    i.state_code,
    i.logo_url,
    i.primary_color,
    i.secondary_color,
    i.website_url,
    i.athlete_signup_url,
    i.total_athletes,
    i.verified
  FROM institution_profiles i
  WHERE i.custom_url_slug = p_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Get athletes associated with institution
-- ============================================================================
CREATE OR REPLACE FUNCTION get_institution_athletes(p_institution_id UUID)
RETURNS TABLE (
  athlete_id UUID,
  athlete_name TEXT,
  sport TEXT,
  graduation_year INTEGER,
  total_followers INTEGER,
  active_nil_deals INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    CONCAT(u.first_name, ' ', u.last_name) AS athlete_name,
    u.primary_sport,
    u.graduation_year,
    u.total_followers,
    (SELECT COUNT(*)::INTEGER FROM nil_deals WHERE athlete_id = u.id AND status = 'active') AS active_nil_deals
  FROM users u
  WHERE
    u.role = 'athlete'
    AND u.school_name = (SELECT institution_name FROM institution_profiles WHERE id = p_institution_id)
  ORDER BY u.last_name, u.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if email belongs to institution
-- ============================================================================
CREATE OR REPLACE FUNCTION check_email_belongs_to_institution(
  p_email TEXT,
  p_institution_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_domains TEXT[];
  v_domain TEXT;
BEGIN
  -- Get institution email domains
  SELECT email_domains INTO v_domains
  FROM institution_profiles
  WHERE id = p_institution_id;

  -- If no domains configured, return false
  IF v_domains IS NULL OR array_length(v_domains, 1) IS NULL THEN
    RETURN false;
  END IF;

  -- Extract domain from email
  v_domain := '@' || split_part(p_email, '@', 2);

  -- Check if domain is in institution's list
  RETURN v_domain = ANY(v_domains);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON institution_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_institution_by_slug(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_institution_athletes(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_belongs_to_institution(TEXT, UUID) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE institution_profiles IS 'Stores profile information for schools and universities on the platform';
COMMENT ON COLUMN institution_profiles.nces_id IS 'National Center for Education Statistics ID - official school identifier';
COMMENT ON COLUMN institution_profiles.custom_url_slug IS 'Unique URL slug for institution (e.g., kentucky-central-hs)';
COMMENT ON COLUMN institution_profiles.custom_splash_page IS 'JSON configuration for custom branded landing page';
COMMENT ON COLUMN institution_profiles.qr_code_url IS 'URL to downloadable QR code for athlete recruitment';
COMMENT ON COLUMN institution_profiles.ferpa_compliant IS 'Whether institution follows FERPA regulations for student data';
COMMENT ON COLUMN institution_profiles.email_domains IS 'Array of email domains belonging to this institution for auto-association';
COMMENT ON COLUMN institution_profiles.automatic_athlete_association IS 'Whether to automatically link athletes who sign up with institution email domain';
