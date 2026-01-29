-- Migration: Add conditions completion tracking to nil_deals
-- Supports the "Approved with Conditions" → athlete acknowledges → CO final approval flow

ALTER TABLE nil_deals
ADD COLUMN IF NOT EXISTS conditions_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS conditions_completion_notes TEXT,
ADD COLUMN IF NOT EXISTS conditions_completion_files JSONB DEFAULT '[]'::jsonb;

-- Add index for quick lookup of deals awaiting condition completion verification
CREATE INDEX IF NOT EXISTS idx_nil_deals_conditions_completed
ON nil_deals (compliance_decision)
WHERE compliance_decision = 'conditions_completed';
