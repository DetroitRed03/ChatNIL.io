-- =============================================
-- Migration 038: Compliance Audit Log Enhancements
-- =============================================
-- Adds missing columns to compliance_audit_log for
-- full audit trail: user info, status transitions,
-- notes, institution/academic year, and metadata.

-- Add columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'user_name') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN user_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'user_email') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN user_email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'user_role') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN user_role TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'previous_status') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN previous_status TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'new_status') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN new_status TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'decision') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN decision TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'internal_note') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN internal_note TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'athlete_note') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN athlete_note TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'metadata') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'institution_id') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN institution_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'compliance_audit_log' AND column_name = 'academic_year') THEN
    ALTER TABLE compliance_audit_log ADD COLUMN academic_year TEXT;
  END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_audit_log_institution ON compliance_audit_log(institution_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_academic_year ON compliance_audit_log(academic_year);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON compliance_audit_log(action);

-- Verification
SELECT 'compliance_audit_log enhanced' AS status;
