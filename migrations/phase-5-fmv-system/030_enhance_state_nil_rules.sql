-- ============================================================================
-- Migration 030: Enhance State NIL Rules with Granular Fields
-- ============================================================================
-- Adds ~35 new columns to state_nil_rules for comprehensive HS NIL tracking.
-- All columns use sensible defaults so existing 50-state data is unaffected.
-- ============================================================================

-- Athletic association fields
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS athletic_association_name TEXT;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS athletic_association_url TEXT;

-- HS effective date
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS hs_nil_effective_date DATE;

-- Permission flags (what HS athletes CAN do)
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS can_earn_money BOOLEAN DEFAULT true;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS can_use_agent BOOLEAN DEFAULT false;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS can_sign_contracts BOOLEAN DEFAULT false;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS can_use_school_marks BOOLEAN DEFAULT false;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS can_mention_school BOOLEAN DEFAULT true;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS can_wear_uniform_in_content BOOLEAN DEFAULT false;

-- Parental/guardian requirements
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS requires_parental_consent BOOLEAN DEFAULT true;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS min_age_without_consent INTEGER DEFAULT 18;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS parent_must_sign_contracts BOOLEAN DEFAULT true;

-- School/athletic association involvement
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS school_can_facilitate_deals BOOLEAN DEFAULT false;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS must_notify_school BOOLEAN DEFAULT false;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS must_notify_athletic_association BOOLEAN DEFAULT false;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS disclosure_deadline_days INTEGER;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS requires_pre_approval BOOLEAN DEFAULT false;

-- Restriction booleans (structured form of existing restrictions TEXT[])
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS cannot_conflict_with_school_sponsors BOOLEAN DEFAULT false;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS cannot_use_during_school_hours BOOLEAN DEFAULT false;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS cannot_interfere_with_academics BOOLEAN DEFAULT true;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS cannot_promote_during_games BOOLEAN DEFAULT false;

-- Compensation limits
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS has_compensation_cap BOOLEAN DEFAULT false;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS compensation_cap_amount DECIMAL(12,2);
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS compensation_cap_period TEXT;

-- User-friendly JSONB summaries (for dashboard display)
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS summary_can_do JSONB DEFAULT '[]'::jsonb;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS summary_cannot_do JSONB DEFAULT '[]'::jsonb;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS summary_must_do JSONB DEFAULT '[]'::jsonb;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS summary_warnings JSONB DEFAULT '[]'::jsonb;

-- Source and verification
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS primary_source_url TEXT;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS secondary_sources JSONB DEFAULT '[]'::jsonb;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS last_verified_date DATE;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS verified_by TEXT;

-- Legal references
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS relevant_legislation TEXT;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS legislation_url TEXT;

-- Enhanced summaries
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS short_summary TEXT;
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS detailed_summary TEXT;

-- Disclaimer
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS disclaimer TEXT
  DEFAULT 'This information is for educational purposes only and does not constitute legal advice. NIL rules change frequently. Always consult your school''s compliance office and/or a qualified attorney before entering any NIL agreement.';

-- Ensure restrictions column exists (was added ad-hoc outside original migration 023)
ALTER TABLE state_nil_rules ADD COLUMN IF NOT EXISTS restrictions TEXT[] DEFAULT '{}';

-- Indexes for new fields
CREATE INDEX IF NOT EXISTS idx_state_nil_hs_effective ON state_nil_rules(hs_nil_effective_date);
CREATE INDEX IF NOT EXISTS idx_state_nil_verified ON state_nil_rules(last_verified_date);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN state_nil_rules.summary_can_do IS 'JSONB array of user-friendly strings: what HS athletes CAN do';
COMMENT ON COLUMN state_nil_rules.summary_cannot_do IS 'JSONB array of user-friendly strings: what HS athletes CANNOT do';
COMMENT ON COLUMN state_nil_rules.summary_must_do IS 'JSONB array of user-friendly strings: what HS athletes MUST do';
COMMENT ON COLUMN state_nil_rules.summary_warnings IS 'JSONB array of user-friendly warnings for HS athletes';
COMMENT ON COLUMN state_nil_rules.has_compensation_cap IS 'Whether HS athletes have a per-deal or annual compensation cap';
COMMENT ON COLUMN state_nil_rules.disclosure_deadline_days IS 'Days after signing a deal by which athlete must disclose to school/association';
