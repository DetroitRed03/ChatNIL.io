-- ============================================================================
-- Quick NIL Deals Table Creation (Simplified for New Database)
-- ============================================================================
-- This is a simplified version that works with the current database schema
-- ============================================================================

-- Create nil_deals table (simplified schema)
CREATE TABLE IF NOT EXISTS nil_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Deal basics
  brand_name TEXT,
  deal_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  description TEXT,

  -- Financial
  compensation_amount DECIMAL(12, 2),

  -- Timeline
  deal_date DATE,
  start_date DATE,
  end_date DATE,

  -- Deliverables
  deliverables JSONB DEFAULT '[]'::jsonb,

  -- Privacy
  is_public BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nil_deals_athlete ON nil_deals(athlete_id);
CREATE INDEX IF NOT EXISTS idx_nil_deals_agency ON nil_deals(agency_id);
CREATE INDEX IF NOT EXISTS idx_nil_deals_status ON nil_deals(status);
CREATE INDEX IF NOT EXISTS idx_nil_deals_public ON nil_deals(is_public) WHERE is_public = true;

-- Enable RLS
ALTER TABLE nil_deals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Athletes can view own deals" ON nil_deals;
DROP POLICY IF EXISTS "Agencies can view their deals" ON nil_deals;
DROP POLICY IF EXISTS "Public can view public deals" ON nil_deals;
DROP POLICY IF EXISTS "Service role can manage all deals" ON nil_deals;

-- Create policies
CREATE POLICY "Athletes can view own deals" ON nil_deals
  FOR SELECT USING (auth.uid() = athlete_id);

CREATE POLICY "Agencies can view their deals" ON nil_deals
  FOR SELECT USING (auth.uid() = agency_id);

CREATE POLICY "Public can view public deals" ON nil_deals
  FOR SELECT USING (is_public = true);

CREATE POLICY "Service role can manage all deals" ON nil_deals
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON nil_deals TO authenticated;
GRANT SELECT ON nil_deals TO anon;

-- Comments
COMMENT ON TABLE nil_deals IS 'Tracks NIL deals between athletes and agencies/brands';
COMMENT ON COLUMN nil_deals.athlete_id IS 'The athlete receiving the NIL deal';
COMMENT ON COLUMN nil_deals.agency_id IS 'The agency facilitating the deal (optional)';
COMMENT ON COLUMN nil_deals.is_public IS 'Whether to show this deal on the athlete''s public profile';
