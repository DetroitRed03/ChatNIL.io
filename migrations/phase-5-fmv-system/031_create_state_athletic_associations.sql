-- ============================================================================
-- Migration 031: State Athletic Associations Reference Table
-- ============================================================================
-- Stores athletic association details for each state (KHSAA, UIL, CIF, etc.)
-- One state may have multiple associations (e.g., Iowa has IGHSAU + IHSAA)
-- ============================================================================

CREATE TABLE IF NOT EXISTS state_athletic_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL REFERENCES state_nil_rules(state_code),
  association_name TEXT NOT NULL,
  association_acronym TEXT,
  website_url TEXT,
  nil_policy_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_athletic_assoc_state ON state_athletic_associations(state_code);

-- RLS: public read, service_role write
ALTER TABLE state_athletic_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view athletic associations"
  ON state_athletic_associations
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage athletic associations"
  ON state_athletic_associations
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  )
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Grant permissions
GRANT SELECT ON state_athletic_associations TO authenticated, anon;

-- Trigger: reuse existing updated_at function
CREATE TRIGGER trigger_update_athletic_assoc_updated_at
  BEFORE UPDATE ON state_athletic_associations
  FOR EACH ROW
  EXECUTE FUNCTION update_state_rules_updated_at();

-- Comments
COMMENT ON TABLE state_athletic_associations IS 'State high school athletic association details — governs HS NIL policies per state';
COMMENT ON COLUMN state_athletic_associations.nil_policy_url IS 'Direct URL to the association NIL policy page if available';
