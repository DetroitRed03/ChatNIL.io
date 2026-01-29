-- Migration: Add compliance review decision columns
-- This migration adds columns needed for the compliance officer deal review workflow

-- Add decision tracking columns to nil_deals table
ALTER TABLE nil_deals
ADD COLUMN IF NOT EXISTS compliance_decision VARCHAR(50),
ADD COLUMN IF NOT EXISTS compliance_decision_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS compliance_decision_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS athlete_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add index for faster lookups by decision status
CREATE INDEX IF NOT EXISTS idx_nil_deals_compliance_decision
ON nil_deals(compliance_decision) WHERE compliance_decision IS NOT NULL;

-- Add override tracking columns to compliance_scores table
ALTER TABLE compliance_scores
ADD COLUMN IF NOT EXISTS override_score INTEGER,
ADD COLUMN IF NOT EXISTS override_justification TEXT,
ADD COLUMN IF NOT EXISTS override_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS override_at TIMESTAMPTZ;

-- Create compliance_audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES nil_deals(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for audit log
CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_deal_id
ON compliance_audit_log(deal_id);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_athlete_id
ON compliance_audit_log(athlete_id);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_log_created_at
ON compliance_audit_log(created_at DESC);

-- Enable RLS on audit log table
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Compliance officers can view audit logs for their institution
CREATE POLICY "Compliance officers can view audit logs"
ON compliance_audit_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM athlete_profiles ap
    WHERE ap.user_id = auth.uid()
    AND ap.role = 'compliance_officer'
    AND ap.institution_id = (
      SELECT institution_id FROM athlete_profiles
      WHERE id = compliance_audit_log.athlete_id
    )
  )
);

-- Policy: Compliance officers can insert audit logs for their institution
CREATE POLICY "Compliance officers can insert audit logs"
ON compliance_audit_log
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM athlete_profiles ap
    WHERE ap.user_id = auth.uid()
    AND ap.role = 'compliance_officer'
  )
);

-- Add comment for documentation
COMMENT ON TABLE compliance_audit_log IS 'Audit trail for compliance review actions on NIL deals';
COMMENT ON COLUMN nil_deals.compliance_decision IS 'Compliance officer decision: approved, approved_with_conditions, rejected, info_requested';
COMMENT ON COLUMN nil_deals.athlete_notes IS 'Notes visible to the athlete explaining the decision';
COMMENT ON COLUMN nil_deals.internal_notes IS 'Internal notes only visible to compliance team';
COMMENT ON COLUMN compliance_scores.override_score IS 'Manually overridden score by compliance officer';
COMMENT ON COLUMN compliance_scores.override_justification IS 'Justification for score override';
