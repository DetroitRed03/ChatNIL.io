-- ============================================================================
-- Migration 023: State NIL Rules & Compliance
-- ============================================================================
-- Creates the state_nil_rules table for tracking state-by-state NIL regulations
-- Includes seed data for initial 10 states with active NIL programs
-- ============================================================================

-- Create state_nil_rules table
CREATE TABLE state_nil_rules (
  -- Primary identification
  state_code TEXT PRIMARY KEY CHECK (LENGTH(state_code) = 2), -- 'KY', 'CA', etc.
  state_name TEXT NOT NULL,

  -- General NIL permission flags
  allows_nil BOOLEAN NOT NULL DEFAULT true,
  high_school_allowed BOOLEAN NOT NULL DEFAULT false,
  college_allowed BOOLEAN NOT NULL DEFAULT true,
  school_approval_required BOOLEAN NOT NULL DEFAULT false,

  -- Prohibited categories
  prohibited_categories TEXT[] DEFAULT '{}', -- ['alcohol', 'gambling', 'cannabis', etc.]

  -- Additional requirements
  disclosure_required BOOLEAN NOT NULL DEFAULT false,
  agent_registration_required BOOLEAN NOT NULL DEFAULT false,
  financial_literacy_required BOOLEAN NOT NULL DEFAULT false,

  -- Documentation
  rules_summary TEXT,
  rules_url TEXT,
  effective_date DATE,

  -- Metadata
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_state_nil_allows ON state_nil_rules(allows_nil);
CREATE INDEX idx_state_nil_hs_allowed ON state_nil_rules(high_school_allowed);

-- ============================================================================
-- SEED DATA: Initial 10 States
-- ============================================================================

-- Kentucky - Progressive NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'KY', 'Kentucky', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis'], true,
  'Kentucky allows NIL deals for both high school and college athletes. Athletes must disclose deals to their school. Prohibited: alcohol, gambling, cannabis.',
  'https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=52521'
);

-- California - Most progressive NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'CA', 'California', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis', 'adult_content'], true,
  'California was the first state to pass NIL legislation (SB 206). Allows deals for HS and college athletes. Prohibited: alcohol, gambling, cannabis, adult content.',
  'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201920200SB206'
);

-- Texas - Large market state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'TX', 'Texas', true, false, true,
  true, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], true,
  'Texas allows NIL for college athletes only. High school athletes are prohibited. School approval required for deals. Prohibited: alcohol, gambling, cannabis, tobacco.',
  'https://capitol.texas.gov/tlodocs/87R/billtext/html/SB01385I.htm'
);

-- Florida - Progressive NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  financial_literacy_required,
  rules_summary, rules_url
) VALUES (
  'FL', 'Florida', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis'], true,
  true,
  'Florida allows NIL for HS and college athletes. Athletes must complete financial literacy course. Prohibited: alcohol, gambling, cannabis.',
  'http://laws.flrules.org/2020/240'
);

-- New York - Large market state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'NY', 'New York', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_content'], true,
  'New York allows NIL deals for both HS and college athletes. Broad prohibited categories including alcohol, gambling, cannabis, tobacco, and adult content.',
  'https://www.nysenate.gov/legislation/bills/2021/S5891'
);

-- Ohio - Midwest NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  agent_registration_required,
  rules_summary, rules_url
) VALUES (
  'OH', 'Ohio', true, false, true,
  true, ARRAY['alcohol', 'gambling', 'cannabis'], true,
  true,
  'Ohio allows NIL for college athletes only. School approval required. Agents must register with the state. Prohibited: alcohol, gambling, cannabis.',
  'https://codes.ohio.gov/ohio-revised-code/section-3345.68'
);

-- Indiana - Midwest NIL state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'IN', 'Indiana', true, false, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis'], false,
  'Indiana allows NIL for college athletes only. High school athletes prohibited. No school approval required. Prohibited: alcohol, gambling, cannabis.',
  'https://iga.in.gov/legislative/2021/bills/senate/4'
);

-- Tennessee - SEC state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'TN', 'Tennessee', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], true,
  'Tennessee allows NIL for HS and college athletes. Athletes must disclose deals. Prohibited: alcohol, gambling, cannabis, tobacco.',
  'https://wapp.capitol.tn.gov/apps/BillInfo/Default.aspx?BillNumber=SB1628'
);

-- Illinois - Large market state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'IL', 'Illinois', true, true, true,
  false, ARRAY['alcohol', 'gambling', 'cannabis', 'adult_content'], true,
  'Illinois allows NIL for HS and college athletes. Disclosure required. Prohibited: alcohol, gambling, cannabis, adult content.',
  'https://www.ilga.gov/legislation/ilcs/ilcs3.asp?ActID=4214'
);

-- Pennsylvania - Large market state
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, prohibited_categories, disclosure_required,
  rules_summary, rules_url
) VALUES (
  'PA', 'Pennsylvania', true, false, true,
  true, ARRAY['alcohol', 'gambling', 'cannabis'], true,
  'Pennsylvania allows NIL for college athletes only. School approval required. Prohibited: alcohol, gambling, cannabis.',
  'https://www.legis.state.pa.us/cfdocs/billinfo/billinfo.cfm?syear=2021&sind=0&body=S&type=B&bn=381'
);

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE state_nil_rules ENABLE ROW LEVEL SECURITY;

-- Policy 1: Everyone can read state NIL rules (public information)
CREATE POLICY "Anyone can view state NIL rules"
  ON state_nil_rules
  FOR SELECT
  USING (true);

-- Policy 2: Only service role can update state rules (admin only)
CREATE POLICY "Service role can manage state rules"
  ON state_nil_rules
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- ============================================================================
-- HELPER FUNCTION: Get state rules by state code
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
  rules_url TEXT
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
    s.rules_url
  FROM state_nil_rules s
  WHERE s.state_code = UPPER(p_state_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Check if deal category is allowed in state
-- ============================================================================
CREATE OR REPLACE FUNCTION is_deal_category_allowed(
  p_state_code TEXT,
  p_category TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prohibited TEXT[];
BEGIN
  -- Get prohibited categories for state
  SELECT prohibited_categories INTO v_prohibited
  FROM state_nil_rules
  WHERE state_code = UPPER(p_state_code);

  -- If state not found, default to allowed
  IF NOT FOUND THEN
    RETURN true;
  END IF;

  -- Check if category is in prohibited list
  RETURN NOT (p_category = ANY(v_prohibited));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON state_nil_rules TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_state_nil_rules(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_deal_category_allowed(TEXT, TEXT) TO authenticated, anon;

-- ============================================================================
-- TRIGGER: Update last_updated timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_state_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_state_rules_updated_at
  BEFORE UPDATE ON state_nil_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_state_rules_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE state_nil_rules IS 'Stores state-by-state NIL compliance rules and regulations';
COMMENT ON COLUMN state_nil_rules.prohibited_categories IS 'Array of deal categories prohibited in this state (e.g., alcohol, gambling, cannabis)';
COMMENT ON COLUMN state_nil_rules.high_school_allowed IS 'Whether high school athletes can participate in NIL deals in this state';
COMMENT ON COLUMN state_nil_rules.school_approval_required IS 'Whether athletes must get school approval before signing NIL deals';
