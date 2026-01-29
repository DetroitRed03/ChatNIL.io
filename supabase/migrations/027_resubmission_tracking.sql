-- Add resubmission tracking columns to nil_deals
ALTER TABLE nil_deals
ADD COLUMN IF NOT EXISTS resubmitted_from_deal_id UUID REFERENCES nil_deals(id),
ADD COLUMN IF NOT EXISTS superseded_by_deal_id UUID REFERENCES nil_deals(id),
ADD COLUMN IF NOT EXISTS resubmission_count INTEGER DEFAULT 0;

-- Index for quickly finding resubmission chains
CREATE INDEX IF NOT EXISTS idx_nil_deals_resubmitted_from ON nil_deals(resubmitted_from_deal_id) WHERE resubmitted_from_deal_id IS NOT NULL;
