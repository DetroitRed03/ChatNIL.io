-- ============================================================================
-- Migration 033: Update SQL Helper Functions for Enhanced State NIL Rules
-- ============================================================================
-- Updates get_state_nil_rules() to return the new columns added in migration 030
-- ============================================================================

CREATE OR REPLACE FUNCTION get_state_nil_rules(p_state_code TEXT)
RETURNS TABLE (
  state_name TEXT,
  allows_nil BOOLEAN,
  high_school_allowed BOOLEAN,
  college_allowed BOOLEAN,
  school_approval_required BOOLEAN,
  prohibited_categories TEXT[],
  disclosure_required BOOLEAN,
  agent_registration_required BOOLEAN,
  financial_literacy_required BOOLEAN,
  rules_summary TEXT,
  rules_url TEXT,
  -- New fields (migration 030)
  athletic_association_name TEXT,
  athletic_association_url TEXT,
  requires_parental_consent BOOLEAN,
  must_notify_school BOOLEAN,
  disclosure_deadline_days INTEGER,
  has_compensation_cap BOOLEAN,
  compensation_cap_amount DECIMAL(12,2),
  summary_can_do JSONB,
  summary_cannot_do JSONB,
  summary_must_do JSONB,
  summary_warnings JSONB,
  short_summary TEXT,
  detailed_summary TEXT,
  disclaimer TEXT,
  last_verified_date DATE,
  relevant_legislation TEXT,
  legislation_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.state_name,
    s.allows_nil,
    s.high_school_allowed,
    s.college_allowed,
    s.school_approval_required,
    s.prohibited_categories,
    s.disclosure_required,
    s.agent_registration_required,
    s.financial_literacy_required,
    s.rules_summary,
    s.rules_url,
    s.athletic_association_name,
    s.athletic_association_url,
    s.requires_parental_consent,
    s.must_notify_school,
    s.disclosure_deadline_days,
    s.has_compensation_cap,
    s.compensation_cap_amount,
    s.summary_can_do,
    s.summary_cannot_do,
    s.summary_must_do,
    s.summary_warnings,
    s.short_summary,
    s.detailed_summary,
    s.disclaimer,
    s.last_verified_date,
    s.relevant_legislation,
    s.legislation_url
  FROM state_nil_rules s
  WHERE s.state_code = UPPER(p_state_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-grant execute permission
GRANT EXECUTE ON FUNCTION get_state_nil_rules(TEXT) TO authenticated, anon;
