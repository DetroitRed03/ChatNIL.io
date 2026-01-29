-- Migration 024: Minor Consent Gate for COPPA Compliance
-- High school student athletes (minors under 18) should NOT have full dashboard access
-- until a parent/guardian approves their account.

-- Add minor-related fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_minor BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS minor_status TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_approved_by UUID REFERENCES users(id);

-- Add comments
COMMENT ON COLUMN users.is_minor IS 'Whether user is under 18 (determined during onboarding)';
COMMENT ON COLUMN users.minor_status IS 'Minor account status: pending_parent_approval, approved, declined';
COMMENT ON COLUMN users.date_of_birth IS 'User date of birth for age verification';
COMMENT ON COLUMN users.parent_approved_at IS 'Timestamp when parent/guardian approved the account';
COMMENT ON COLUMN users.parent_approved_by IS 'User ID of the parent who approved the account';

-- Create parent consent invites table
CREATE TABLE IF NOT EXISTS parent_consent_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The minor (HS student) who is requesting parent consent
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Parent information
  parent_email VARCHAR(255) NOT NULL,
  parent_name VARCHAR(255),
  relationship_type VARCHAR(50) DEFAULT 'parent', -- 'parent', 'guardian', 'step_parent'

  -- Invite token for the approval link
  invite_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'viewed', 'approved', 'declined', 'expired'

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),

  -- Response data
  response_notes TEXT,

  -- Parent user ID if they create an account
  parent_user_id UUID REFERENCES users(id)
);

-- Create indexes for parent_consent_invites
CREATE INDEX IF NOT EXISTS idx_parent_consent_invites_student ON parent_consent_invites(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_consent_invites_token ON parent_consent_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_parent_consent_invites_parent_email ON parent_consent_invites(parent_email);
CREATE INDEX IF NOT EXISTS idx_parent_consent_invites_status ON parent_consent_invites(status);
CREATE INDEX IF NOT EXISTS idx_parent_consent_invites_expires ON parent_consent_invites(expires_at);

-- Disable RLS for simplicity (table only accessed via authenticated API routes)
ALTER TABLE parent_consent_invites DISABLE ROW LEVEL SECURITY;

-- Add index for minor status queries
CREATE INDEX IF NOT EXISTS idx_users_minor_status ON users(minor_status) WHERE is_minor = true;
CREATE INDEX IF NOT EXISTS idx_users_is_minor ON users(is_minor);

-- Update trigger for parent_consent_invites
CREATE OR REPLACE FUNCTION update_parent_consent_invites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- No updated_at column, but we can track status changes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments
COMMENT ON TABLE parent_consent_invites IS 'Tracks parent consent invitations for minor students (COPPA compliance)';
COMMENT ON COLUMN parent_consent_invites.student_id IS 'The HS student requesting parental consent';
COMMENT ON COLUMN parent_consent_invites.invite_token IS 'Unique token used in the approval URL';
COMMENT ON COLUMN parent_consent_invites.status IS 'Status: pending, viewed, approved, declined, expired';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 024 completed: Minor consent gate tables created successfully!';
END $$;
