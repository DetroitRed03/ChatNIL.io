-- Migration: Complete Compliance Decision Workflow
-- Adds tables and columns for notifications, appeals, and info requests

-- 1. Add notification and appeal tracking columns to nil_deals
ALTER TABLE nil_deals
ADD COLUMN IF NOT EXISTS athlete_notified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS athlete_viewed_decision_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS has_active_appeal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS appeal_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_appeal_at TIMESTAMPTZ;

-- Index for filtering deals with active appeals
CREATE INDEX IF NOT EXISTS idx_nil_deals_active_appeal
ON nil_deals(has_active_appeal) WHERE has_active_appeal = true;

-- Index for filtering deals pending notification view
CREATE INDEX IF NOT EXISTS idx_nil_deals_notified
ON nil_deals(athlete_notified_at) WHERE athlete_notified_at IS NOT NULL;

COMMENT ON COLUMN nil_deals.athlete_notified_at IS 'When athlete was notified of compliance decision';
COMMENT ON COLUMN nil_deals.athlete_viewed_decision_at IS 'When athlete viewed the decision details';
COMMENT ON COLUMN nil_deals.has_active_appeal IS 'Whether deal has an unresolved appeal';
COMMENT ON COLUMN nil_deals.appeal_count IS 'Total number of appeals submitted for this deal';
COMMENT ON COLUMN nil_deals.last_appeal_at IS 'When the most recent appeal was submitted';

-- 2. Create appeals table
CREATE TABLE IF NOT EXISTS public.nil_deal_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.nil_deals(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES auth.users(id),
  institution_id UUID REFERENCES public.institutions(id),

  -- Appeal content
  appeal_reason TEXT NOT NULL,
  appeal_documents JSONB DEFAULT '[]',
  additional_context TEXT,

  -- Original decision being appealed
  original_decision VARCHAR(50) NOT NULL,
  original_decision_at TIMESTAMPTZ NOT NULL,
  original_decision_by UUID REFERENCES auth.users(id),
  original_notes TEXT,

  -- Appeal status
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'resolved')),

  -- Resolution
  resolution VARCHAR(50) CHECK (resolution IN ('upheld', 'modified', 'reversed')),
  resolution_notes TEXT,
  resolution_internal_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  new_decision VARCHAR(50),
  new_compliance_status VARCHAR(20),

  -- Timestamps
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  review_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for appeals
CREATE INDEX IF NOT EXISTS idx_appeals_deal ON nil_deal_appeals(deal_id);
CREATE INDEX IF NOT EXISTS idx_appeals_athlete ON nil_deal_appeals(athlete_id);
CREATE INDEX IF NOT EXISTS idx_appeals_institution ON nil_deal_appeals(institution_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON nil_deal_appeals(status);
CREATE INDEX IF NOT EXISTS idx_appeals_submitted ON nil_deal_appeals(submitted_at DESC);

-- RLS for appeals
ALTER TABLE nil_deal_appeals ENABLE ROW LEVEL SECURITY;

-- Athletes can view and create appeals for their own deals
CREATE POLICY "Athletes view own appeals"
ON nil_deal_appeals FOR SELECT TO authenticated
USING (athlete_id = auth.uid());

CREATE POLICY "Athletes create appeals"
ON nil_deal_appeals FOR INSERT TO authenticated
WITH CHECK (athlete_id = auth.uid());

-- Compliance officers can view and manage appeals at their institution
CREATE POLICY "Compliance officers view appeals"
ON nil_deal_appeals FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM athlete_profiles
    WHERE user_id = auth.uid() AND role = 'compliance_officer'
  )
);

CREATE POLICY "Compliance officers update appeals"
ON nil_deal_appeals FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM athlete_profiles
    WHERE user_id = auth.uid() AND role = 'compliance_officer'
  )
);

COMMENT ON TABLE nil_deal_appeals IS 'Appeals submitted by athletes for compliance decisions on their NIL deals';

-- 3. Create info requests table
CREATE TABLE IF NOT EXISTS public.compliance_info_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.nil_deals(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id),
  request_type VARCHAR(50) DEFAULT 'clarification' CHECK (request_type IN ('document', 'clarification', 'modification')),
  description TEXT NOT NULL,
  response_text TEXT,
  response_documents JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'resolved')),
  responded_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for info requests
CREATE INDEX IF NOT EXISTS idx_info_requests_deal ON compliance_info_requests(deal_id);
CREATE INDEX IF NOT EXISTS idx_info_requests_status ON compliance_info_requests(status);

-- RLS for info requests
ALTER TABLE compliance_info_requests ENABLE ROW LEVEL SECURITY;

-- Athletes can view info requests for their deals
CREATE POLICY "Athletes view own info requests"
ON compliance_info_requests FOR SELECT TO authenticated
USING (
  deal_id IN (
    SELECT id FROM nil_deals WHERE athlete_id = auth.uid()
  )
);

-- Athletes can respond to (update) info requests for their deals
CREATE POLICY "Athletes respond to info requests"
ON compliance_info_requests FOR UPDATE TO authenticated
USING (
  deal_id IN (
    SELECT id FROM nil_deals WHERE athlete_id = auth.uid()
  )
);

-- Compliance officers can manage info requests
CREATE POLICY "Compliance officers manage info requests"
ON compliance_info_requests FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM athlete_profiles
    WHERE user_id = auth.uid() AND role = 'compliance_officer'
  )
);

COMMENT ON TABLE compliance_info_requests IS 'Information requests from compliance officers to athletes for deal review';

-- 4. Function to update appeal tracking on nil_deals
CREATE OR REPLACE FUNCTION update_deal_appeal_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE nil_deals
    SET has_active_appeal = true,
        appeal_count = appeal_count + 1,
        last_appeal_at = NEW.submitted_at
    WHERE id = NEW.deal_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    -- Check if there are other unresolved appeals
    UPDATE nil_deals
    SET has_active_appeal = EXISTS (
      SELECT 1 FROM nil_deal_appeals
      WHERE deal_id = NEW.deal_id AND status != 'resolved' AND id != NEW.id
    )
    WHERE id = NEW.deal_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update deal appeal tracking
DROP TRIGGER IF EXISTS trigger_update_deal_appeal_tracking ON nil_deal_appeals;
CREATE TRIGGER trigger_update_deal_appeal_tracking
AFTER INSERT OR UPDATE ON nil_deal_appeals
FOR EACH ROW
EXECUTE FUNCTION update_deal_appeal_tracking();
