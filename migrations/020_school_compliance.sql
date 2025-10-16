-- ============================================================================
-- Migration 020: School Compliance Tables
-- ============================================================================
-- Creates tables for school administrators, bulk account creation, and compliance consents
-- Enables schools to manage athletes and NIL compliance at scale
-- ============================================================================

-- Create ENUM for administrator roles
CREATE TYPE admin_role AS ENUM (
  'compliance_officer',
  'athletic_director',
  'assistant_ad',
  'coach_coordinator',
  'nil_coordinator',
  'super_admin'
);

-- Create ENUM for batch status
CREATE TYPE batch_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

-- Create ENUM for consent types
CREATE TYPE consent_type AS ENUM (
  'athlete_consent',
  'parent_consent',
  'school_approval',
  'state_compliance',
  'ncaa_compliance'
);

-- ============================================================================
-- Table 1: school_administrators
-- ============================================================================

CREATE TABLE school_administrators (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User relationship
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- School information
  school_id UUID,  -- Can reference a schools table if created later
  school_name TEXT NOT NULL,
  school_division TEXT,  -- NCAA D1, D2, D3, NAIA, etc.

  -- Administrator details
  admin_role admin_role NOT NULL,
  title TEXT,  -- Official job title
  department TEXT,

  -- Permissions (JSONB for flexibility)
  permissions JSONB DEFAULT '{
    "can_view_athletes": true,
    "can_approve_deals": false,
    "can_manage_admins": false,
    "can_bulk_create": false,
    "can_view_analytics": true
  }'::jsonb,

  -- Contact information
  office_phone TEXT,
  office_email TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT unique_user_school UNIQUE(user_id, school_name)
);

-- Indexes for school_administrators
CREATE INDEX idx_school_admins_user_id ON school_administrators(user_id);
CREATE INDEX idx_school_admins_school_name ON school_administrators(school_name);
CREATE INDEX idx_school_admins_school_id ON school_administrators(school_id) WHERE school_id IS NOT NULL;
CREATE INDEX idx_school_admins_role ON school_administrators(admin_role);
CREATE INDEX idx_school_admins_active ON school_administrators(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_school_admins_permissions ON school_administrators USING gin(permissions);

-- ============================================================================
-- Table 2: school_account_batches
-- ============================================================================

CREATE TABLE school_account_batches (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- School and admin relationship
  school_id UUID,  -- Reference to school
  school_name TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Batch details
  batch_name TEXT NOT NULL,
  description TEXT,

  -- File upload
  csv_file_url TEXT,  -- URL to uploaded CSV in storage
  csv_file_name TEXT,

  -- Processing status
  status batch_status DEFAULT 'pending' NOT NULL,

  -- Athlete counts
  total_athletes INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,

  -- Processing results
  created_user_ids UUID[],  -- Array of successfully created user IDs
  error_log JSONB DEFAULT '[]'::jsonb,
  -- Example: [
  --   {
  --     "row": 5,
  --     "email": "john@email.com",
  --     "error": "Email already exists",
  --     "timestamp": "2025-10-16T10:00:00Z"
  --   }
  -- ]

  -- CSV column mapping (for flexibility)
  column_mapping JSONB,
  -- Example: {
  --   "first_name": "firstName",
  --   "last_name": "lastName",
  --   "email": "email",
  --   "sport": "primary_sport"
  -- }

  -- Batch configuration
  send_welcome_emails BOOLEAN DEFAULT TRUE,
  auto_assign_coach BOOLEAN DEFAULT FALSE,
  default_permissions JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES users(id)
);

-- Indexes for school_account_batches
CREATE INDEX idx_batches_school_name ON school_account_batches(school_name);
CREATE INDEX idx_batches_school_id ON school_account_batches(school_id) WHERE school_id IS NOT NULL;
CREATE INDEX idx_batches_admin_id ON school_account_batches(admin_id);
CREATE INDEX idx_batches_status ON school_account_batches(status);
CREATE INDEX idx_batches_created_at ON school_account_batches(created_at DESC);
CREATE INDEX idx_batches_error_log ON school_account_batches USING gin(error_log);

-- ============================================================================
-- Table 3: compliance_consents
-- ============================================================================

CREATE TABLE compliance_consents (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship fields
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES nil_deals(id) ON DELETE CASCADE,

  -- Consent details
  consent_type consent_type NOT NULL,

  -- Consenting party
  consented_by_user_id UUID REFERENCES users(id),  -- User who gave consent
  consented_by_name TEXT,  -- Name if not a user (e.g., school official)
  consented_by_title TEXT,  -- Title/role of consenting party

  -- Consent documentation
  consent_document_url TEXT,  -- URL to signed consent form
  consent_method TEXT,  -- 'digital_signature', 'uploaded_form', 'in_person', etc.

  -- IP and metadata for legal compliance
  ip_address INET,
  user_agent TEXT,
  consent_language TEXT,  -- Which version of consent text was shown

  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,

  -- Validity period
  consented_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id),
  revocation_reason TEXT,

  -- Additional context
  notes TEXT,
  school_name TEXT,  -- If school consent
  state TEXT,  -- If state-level compliance

  -- Compliance requirements met
  requirements_met JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "ncaa_cleared": true,
  --   "state_cleared": true,
  --   "school_cleared": true,
  --   "age_verified": true
  -- }

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > consented_at),
  CONSTRAINT revoked_after_consent CHECK (revoked_at IS NULL OR revoked_at >= consented_at)
);

-- Indexes for compliance_consents
CREATE INDEX idx_consents_athlete_id ON compliance_consents(athlete_id);
CREATE INDEX idx_consents_deal_id ON compliance_consents(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_consents_type ON compliance_consents(consent_type);
CREATE INDEX idx_consents_consented_by ON compliance_consents(consented_by_user_id) WHERE consented_by_user_id IS NOT NULL;
CREATE INDEX idx_consents_verified ON compliance_consents(verified) WHERE verified = TRUE;
CREATE INDEX idx_consents_active ON compliance_consents(athlete_id, consent_type)
WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW());

-- Composite index for deal consent checks
CREATE INDEX idx_consents_deal_type ON compliance_consents(deal_id, consent_type) WHERE deal_id IS NOT NULL;

-- ============================================================================
-- Triggers and Functions
-- ============================================================================

-- Function to update updated_at timestamp for school_administrators
CREATE OR REPLACE FUNCTION update_school_admins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER school_admins_updated_at
  BEFORE UPDATE ON school_administrators
  FOR EACH ROW
  EXECUTE FUNCTION update_school_admins_updated_at();

-- Function to update batch statistics
CREATE OR REPLACE FUNCTION update_batch_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate counts from arrays and error log
  NEW.success_count := COALESCE(array_length(NEW.created_user_ids, 1), 0);
  NEW.failed_count := jsonb_array_length(NEW.error_log);
  NEW.processed_count := NEW.success_count + NEW.failed_count;

  -- Auto-complete batch when all processed
  IF NEW.processed_count >= NEW.total_athletes AND NEW.status = 'processing' THEN
    NEW.status := 'completed';
    NEW.completed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_batch_stats
  BEFORE UPDATE OF created_user_ids, error_log ON school_account_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_counts();

-- Function to update updated_at timestamp for compliance_consents
CREATE OR REPLACE FUNCTION update_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consents_updated_at
  BEFORE UPDATE ON compliance_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_consents_updated_at();

-- Function to auto-verify certain consent types
CREATE OR REPLACE FUNCTION auto_verify_athlete_consent()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-verify athlete's own consent
  IF NEW.consent_type = 'athlete_consent' AND NEW.consented_by_user_id = NEW.athlete_id THEN
    NEW.verified := TRUE;
    NEW.verified_at := NOW();
    NEW.verified_by := NEW.athlete_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_verify_consent
  BEFORE INSERT ON compliance_consents
  FOR EACH ROW
  EXECUTE FUNCTION auto_verify_athlete_consent();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE school_administrators IS 'Stores school compliance officers and administrators who manage athlete accounts';
COMMENT ON TABLE school_account_batches IS 'Tracks bulk account creation batches for schools';
COMMENT ON TABLE compliance_consents IS 'Stores consent records for NIL deals and compliance requirements';

COMMENT ON COLUMN school_administrators.permissions IS 'JSONB object defining what actions this admin can perform';
COMMENT ON COLUMN school_account_batches.error_log IS 'JSONB array of errors encountered during batch processing';
COMMENT ON COLUMN compliance_consents.requirements_met IS 'JSONB object tracking which compliance requirements have been satisfied';

-- Verification
SELECT 'Migration 020 completed successfully!' as status,
       '3 tables created: ' || string_agg(tablename, ', ') as tables
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('school_administrators', 'school_account_batches', 'compliance_consents');
