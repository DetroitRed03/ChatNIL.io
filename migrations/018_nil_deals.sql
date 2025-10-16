-- ============================================================================
-- Migration 018: NIL Deals Table
-- ============================================================================
-- Creates the nil_deals table to track deals between athletes and agencies/brands
-- Includes indexes for performance and search optimization
-- ============================================================================

-- Create ENUM for deal types
CREATE TYPE deal_type AS ENUM (
  'sponsorship',
  'endorsement',
  'appearance',
  'content_creation',
  'social_media',
  'merchandise',
  'licensing',
  'event',
  'other'
);

-- Create ENUM for deal status
CREATE TYPE deal_status AS ENUM (
  'draft',           -- Being created
  'pending',         -- Awaiting approval
  'active',          -- Currently active
  'completed',       -- Successfully completed
  'cancelled',       -- Cancelled by either party
  'expired',         -- Past end date
  'on_hold'          -- Temporarily paused
);

-- Create ENUM for payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'partial',
  'paid',
  'overdue',
  'disputed'
);

-- Create nil_deals table
CREATE TABLE nil_deals (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationship fields
  athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Deal basics
  deal_title TEXT NOT NULL,
  description TEXT,
  deal_type deal_type NOT NULL,
  status deal_status DEFAULT 'draft' NOT NULL,

  -- Financial terms
  compensation_amount DECIMAL(12, 2),  -- Total deal value
  currency TEXT DEFAULT 'USD',
  payment_terms TEXT,
  payment_status payment_status DEFAULT 'pending',

  -- Timeline
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT FALSE,

  -- Deliverables and requirements
  deliverables JSONB DEFAULT '[]'::jsonb,
  -- Example: [
  --   {
  --     "type": "social_post",
  --     "description": "3 Instagram posts",
  --     "deadline": "2025-11-01",
  --     "status": "pending"
  --   }
  -- ]

  -- Contract and legal
  contract_file_url TEXT,
  contract_signed_at TIMESTAMPTZ,
  contract_signed_by_athlete BOOLEAN DEFAULT FALSE,
  contract_signed_by_agency BOOLEAN DEFAULT FALSE,

  -- Payment schedule
  payment_schedule JSONB DEFAULT '[]'::jsonb,
  -- Example: [
  --   {
  --     "amount": 500,
  --     "due_date": "2025-10-15",
  --     "status": "pending",
  --     "paid_at": null
  --   }
  -- ]

  -- Compliance and approval
  requires_school_approval BOOLEAN DEFAULT FALSE,
  school_approved BOOLEAN DEFAULT FALSE,
  school_approved_at TIMESTAMPTZ,
  school_approved_by UUID REFERENCES users(id),

  requires_parent_approval BOOLEAN DEFAULT FALSE,
  parent_approved BOOLEAN DEFAULT FALSE,
  parent_approved_at TIMESTAMPTZ,
  parent_approved_by UUID REFERENCES users(id),

  compliance_checked BOOLEAN DEFAULT FALSE,
  compliance_notes TEXT,

  -- Performance tracking
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "impressions": 50000,
  --   "engagement_rate": 4.5,
  --   "clicks": 2500
  -- }

  -- Additional metadata
  tags TEXT[],
  notes TEXT,
  internal_notes TEXT,  -- Private notes for athlete only

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT positive_compensation CHECK (compensation_amount IS NULL OR compensation_amount >= 0),
  CONSTRAINT athlete_not_agency CHECK (athlete_id != agency_id)
);

-- Create indexes for performance
CREATE INDEX idx_nil_deals_athlete_id ON nil_deals(athlete_id);
CREATE INDEX idx_nil_deals_agency_id ON nil_deals(agency_id);
CREATE INDEX idx_nil_deals_status ON nil_deals(status);
CREATE INDEX idx_nil_deals_start_date ON nil_deals(start_date) WHERE start_date IS NOT NULL;
CREATE INDEX idx_nil_deals_end_date ON nil_deals(end_date) WHERE end_date IS NOT NULL;
CREATE INDEX idx_nil_deals_created_at ON nil_deals(created_at DESC);
CREATE INDEX idx_nil_deals_deal_type ON nil_deals(deal_type);
CREATE INDEX idx_nil_deals_payment_status ON nil_deals(payment_status);

-- Create GIN index for JSONB fields
CREATE INDEX idx_nil_deals_deliverables ON nil_deals USING gin(deliverables);
CREATE INDEX idx_nil_deals_tags ON nil_deals USING gin(tags);

-- Create composite indexes for common queries
CREATE INDEX idx_nil_deals_athlete_status ON nil_deals(athlete_id, status);
CREATE INDEX idx_nil_deals_agency_status ON nil_deals(agency_id, status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nil_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER nil_deals_updated_at
  BEFORE UPDATE ON nil_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_nil_deals_updated_at();

-- Create function to auto-update payment_status based on payment_schedule
CREATE OR REPLACE FUNCTION calculate_deal_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  schedule_item JSONB;
  total_amount DECIMAL;
  paid_amount DECIMAL;
  pending_count INTEGER;
  overdue_count INTEGER;
BEGIN
  -- Initialize counters
  total_amount := 0;
  paid_amount := 0;
  pending_count := 0;
  overdue_count := 0;

  -- Loop through payment schedule
  FOR schedule_item IN SELECT jsonb_array_elements(NEW.payment_schedule)
  LOOP
    total_amount := total_amount + (schedule_item->>'amount')::DECIMAL;

    IF schedule_item->>'status' = 'paid' THEN
      paid_amount := paid_amount + (schedule_item->>'amount')::DECIMAL;
    ELSIF schedule_item->>'status' = 'overdue' THEN
      overdue_count := overdue_count + 1;
    ELSIF schedule_item->>'status' = 'pending' THEN
      pending_count := pending_count + 1;
    END IF;
  END LOOP;

  -- Determine payment status
  IF overdue_count > 0 THEN
    NEW.payment_status := 'overdue';
  ELSIF paid_amount = 0 AND total_amount > 0 THEN
    NEW.payment_status := 'pending';
  ELSIF paid_amount = total_amount AND total_amount > 0 THEN
    NEW.payment_status := 'paid';
  ELSIF paid_amount > 0 AND paid_amount < total_amount THEN
    NEW.payment_status := 'partial';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment status calculation
CREATE TRIGGER nil_deals_payment_status
  BEFORE INSERT OR UPDATE OF payment_schedule ON nil_deals
  FOR EACH ROW
  EXECUTE FUNCTION calculate_deal_payment_status();

-- Add comments for documentation
COMMENT ON TABLE nil_deals IS 'Stores NIL deals between athletes and agencies/brands';
COMMENT ON COLUMN nil_deals.deliverables IS 'JSONB array of deliverable items with deadlines and status';
COMMENT ON COLUMN nil_deals.payment_schedule IS 'JSONB array of scheduled payments with amounts and due dates';
COMMENT ON COLUMN nil_deals.performance_metrics IS 'JSONB object storing deal performance data (impressions, engagement, etc.)';

-- Verification
SELECT 'Migration 018 completed successfully!' as status,
       'Created nil_deals table with ' || COUNT(*) || ' indexes' as detail
FROM pg_indexes
WHERE tablename = 'nil_deals';
