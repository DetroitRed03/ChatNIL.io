-- ============================================================================
-- MIGRATION 100: Agency Dashboard Infrastructure
-- ============================================================================
-- Creates tables, views, and functions for the agency dashboard system
-- ============================================================================

-- ============================================================================
-- TABLE: campaigns
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'completed', 'cancelled')),
  campaign_type TEXT,

  -- Budget and financials
  total_budget NUMERIC NOT NULL DEFAULT 0,
  spent_budget NUMERIC NOT NULL DEFAULT 0,

  -- Campaign dates
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Denormalized metrics for fast dashboard queries
  total_athletes INTEGER DEFAULT 0,
  total_impressions BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,

  -- Metadata
  goals JSONB DEFAULT '{}',
  target_audience JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_agency_id ON public.campaigns(agency_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON public.campaigns(start_date, end_date);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies can view own campaigns" ON public.campaigns;
CREATE POLICY "Agencies can view own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = agency_id);

DROP POLICY IF EXISTS "Agencies can create own campaigns" ON public.campaigns;
CREATE POLICY "Agencies can create own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = agency_id);

DROP POLICY IF EXISTS "Agencies can update own campaigns" ON public.campaigns;
CREATE POLICY "Agencies can update own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = agency_id);

DROP POLICY IF EXISTS "Agencies can delete own campaigns" ON public.campaigns;
CREATE POLICY "Agencies can delete own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = agency_id);

-- ============================================================================
-- TABLE: campaign_athletes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Athlete-specific campaign details
  compensation NUMERIC,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'active', 'completed')),

  -- Performance metrics
  impressions BIGINT DEFAULT 0,
  engagement BIGINT DEFAULT 0,
  engagement_rate NUMERIC DEFAULT 0,
  conversions INTEGER DEFAULT 0,

  -- Deliverables tracking
  deliverables JSONB DEFAULT '[]',
  completed_deliverables INTEGER DEFAULT 0,
  total_deliverables INTEGER DEFAULT 0,

  -- Dates
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(campaign_id, athlete_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_athletes_campaign ON public.campaign_athletes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_athletes_athlete ON public.campaign_athletes(athlete_id);
CREATE INDEX IF NOT EXISTS idx_campaign_athletes_status ON public.campaign_athletes(status);

ALTER TABLE public.campaign_athletes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies can view campaign athletes" ON public.campaign_athletes;
CREATE POLICY "Agencies can view campaign athletes" ON public.campaign_athletes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_id AND campaigns.agency_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Athletes can view their campaign assignments" ON public.campaign_athletes;
CREATE POLICY "Athletes can view their campaign assignments" ON public.campaign_athletes
  FOR SELECT USING (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Agencies can manage campaign athletes" ON public.campaign_athletes;
CREATE POLICY "Agencies can manage campaign athletes" ON public.campaign_athletes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_id AND campaigns.agency_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLE: campaign_metrics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Time-series data
  metric_date DATE NOT NULL,

  -- Performance metrics
  impressions BIGINT DEFAULT 0,
  engagement BIGINT DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend NUMERIC DEFAULT 0,

  -- Calculated metrics
  cpm NUMERIC,
  cpc NUMERIC,
  conversion_rate NUMERIC,
  roi NUMERIC,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(campaign_id, athlete_id, metric_date)
);

CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign ON public.campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON public.campaign_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_date ON public.campaign_metrics(campaign_id, metric_date DESC);

ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies can view campaign metrics" ON public.campaign_metrics;
CREATE POLICY "Agencies can view campaign metrics" ON public.campaign_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_id AND campaigns.agency_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLE: agency_budget_allocations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agency_budget_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Budget period
  period_name TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Budget categories
  total_budget NUMERIC NOT NULL,
  allocated_budget NUMERIC DEFAULT 0,
  spent_budget NUMERIC DEFAULT 0,

  -- Category breakdown
  categories JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(agency_id, period_start, period_end)
);

CREATE INDEX IF NOT EXISTS idx_budget_allocations_agency ON public.agency_budget_allocations(agency_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_period ON public.agency_budget_allocations(period_start, period_end);

ALTER TABLE public.agency_budget_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies can manage own budget" ON public.agency_budget_allocations;
CREATE POLICY "Agencies can manage own budget" ON public.agency_budget_allocations
  FOR ALL USING (auth.uid() = agency_id);

-- ============================================================================
-- TABLE: agency_activity_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agency_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Activity details
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Related entities
  related_type TEXT,
  related_id UUID,

  -- User who triggered the activity
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_agency ON public.agency_activity_log(agency_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON public.agency_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON public.agency_activity_log(activity_type);

ALTER TABLE public.agency_activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies can view own activity" ON public.agency_activity_log;
CREATE POLICY "Agencies can view own activity" ON public.agency_activity_log
  FOR SELECT USING (auth.uid() = agency_id);

-- ============================================================================
-- TABLE: agency_pending_actions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.agency_pending_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Action details
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Related entities
  related_type TEXT,
  related_id UUID,

  -- Action state
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Scheduling
  due_date TIMESTAMPTZ,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_actions_agency ON public.agency_pending_actions(agency_id);
CREATE INDEX IF NOT EXISTS idx_pending_actions_status ON public.agency_pending_actions(status);
CREATE INDEX IF NOT EXISTS idx_pending_actions_priority ON public.agency_pending_actions(priority);
CREATE INDEX IF NOT EXISTS idx_pending_actions_due ON public.agency_pending_actions(due_date);

ALTER TABLE public.agency_pending_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies can manage own actions" ON public.agency_pending_actions;
CREATE POLICY "Agencies can manage own actions" ON public.agency_pending_actions
  FOR ALL USING (auth.uid() = agency_id);

-- ============================================================================
-- VIEW: agency_dashboard_stats
-- ============================================================================
CREATE OR REPLACE VIEW public.agency_dashboard_stats AS
SELECT
  c.agency_id,

  -- Campaign stats
  COUNT(DISTINCT c.id) as total_campaigns,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') as active_campaigns,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'pending') as pending_campaigns,

  -- Athlete stats
  COUNT(DISTINCT ca.athlete_id) as total_athletes,
  COUNT(DISTINCT ca.athlete_id) FILTER (WHERE ca.status = 'active') as active_athletes,

  -- Budget stats
  COALESCE(SUM(c.total_budget), 0) as total_budget,
  COALESCE(SUM(c.spent_budget), 0) as spent_budget,
  COALESCE(SUM(c.total_budget) - SUM(c.spent_budget), 0) as remaining_budget,

  -- Performance stats
  COALESCE(SUM(c.total_impressions), 0) as total_impressions,
  COALESCE(SUM(c.total_engagement), 0) as total_engagement,
  CASE
    WHEN SUM(c.total_impressions) > 0
    THEN (SUM(c.total_engagement)::NUMERIC / SUM(c.total_impressions)::NUMERIC * 100)
    ELSE 0
  END as avg_engagement_rate,

  -- ROI calculation
  CASE
    WHEN SUM(c.spent_budget) > 0
    THEN ((SUM(c.total_engagement)::NUMERIC / SUM(c.spent_budget)::NUMERIC) * 100)
    ELSE 0
  END as roi_percentage

FROM public.campaigns c
LEFT JOIN public.campaign_athletes ca ON ca.campaign_id = c.id
WHERE c.agency_id = auth.uid()
GROUP BY c.agency_id;

GRANT SELECT ON public.agency_dashboard_stats TO authenticated;

-- ============================================================================
-- VIEW: campaign_performance_detail
-- ============================================================================
CREATE OR REPLACE VIEW public.campaign_performance_detail AS
SELECT
  c.id,
  c.agency_id,
  c.name,
  c.status,
  c.total_budget,
  c.spent_budget,
  c.start_date,
  c.end_date,

  -- Athlete count
  COUNT(DISTINCT ca.athlete_id) as athletes_count,

  -- Performance metrics
  COALESCE(SUM(ca.impressions), 0) as total_impressions,
  COALESCE(SUM(ca.engagement), 0) as total_engagement,
  CASE
    WHEN SUM(ca.impressions) > 0
    THEN (SUM(ca.engagement)::NUMERIC / SUM(ca.impressions)::NUMERIC * 100)
    ELSE 0
  END as engagement_rate,

  -- Deliverables progress
  COALESCE(SUM(ca.completed_deliverables), 0) as completed_deliverables,
  COALESCE(SUM(ca.total_deliverables), 0) as total_deliverables,
  CASE
    WHEN SUM(ca.total_deliverables) > 0
    THEN (SUM(ca.completed_deliverables)::NUMERIC / SUM(ca.total_deliverables)::NUMERIC * 100)
    ELSE 0
  END as deliverables_progress,

  c.created_at,
  c.updated_at

FROM public.campaigns c
LEFT JOIN public.campaign_athletes ca ON ca.campaign_id = c.id
GROUP BY c.id, c.agency_id, c.name, c.status, c.total_budget, c.spent_budget,
         c.start_date, c.end_date, c.created_at, c.updated_at;

GRANT SELECT ON public.campaign_performance_detail TO authenticated;

-- ============================================================================
-- VIEW: agency_athlete_roster
-- ============================================================================
CREATE OR REPLACE VIEW public.agency_athlete_roster AS
SELECT
  c.agency_id,
  ca.athlete_id,
  u.email,

  -- Campaign participation
  COUNT(DISTINCT ca.campaign_id) as total_campaigns,
  COUNT(DISTINCT ca.campaign_id) FILTER (WHERE ca.status = 'active') as active_campaigns,

  -- Performance metrics
  COALESCE(SUM(ca.impressions), 0) as total_impressions,
  COALESCE(SUM(ca.engagement), 0) as total_engagement,
  CASE
    WHEN SUM(ca.impressions) > 0
    THEN (SUM(ca.engagement)::NUMERIC / SUM(ca.impressions)::NUMERIC * 100)
    ELSE 0
  END as engagement_rate,

  -- FMV data
  MAX(fmv.fmv_score) as fmv_score,
  MAX(fmv.fmv_tier) as fmv_tier,

  -- Most recent activity
  MAX(ca.updated_at) as last_activity

FROM public.campaigns c
JOIN public.campaign_athletes ca ON ca.campaign_id = c.id
JOIN auth.users u ON u.id = ca.athlete_id
LEFT JOIN public.athlete_fmv_data fmv ON fmv.athlete_id = ca.athlete_id

GROUP BY c.agency_id, ca.athlete_id, u.email;

GRANT SELECT ON public.agency_athlete_roster TO authenticated;

-- ============================================================================
-- FUNCTION: update_campaign_metrics
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_campaign_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update denormalized metrics on campaigns table
  UPDATE public.campaigns
  SET
    total_athletes = (
      SELECT COUNT(DISTINCT athlete_id)
      FROM public.campaign_athletes
      WHERE campaign_id = NEW.campaign_id
    ),
    total_impressions = (
      SELECT COALESCE(SUM(impressions), 0)
      FROM public.campaign_athletes
      WHERE campaign_id = NEW.campaign_id
    ),
    total_engagement = (
      SELECT COALESCE(SUM(engagement), 0)
      FROM public.campaign_athletes
      WHERE campaign_id = NEW.campaign_id
    ),
    engagement_rate = CASE
      WHEN (
        SELECT SUM(impressions)
        FROM public.campaign_athletes
        WHERE campaign_id = NEW.campaign_id
      ) > 0 THEN (
        SELECT (SUM(engagement)::NUMERIC / SUM(impressions)::NUMERIC * 100)
        FROM public.campaign_athletes
        WHERE campaign_id = NEW.campaign_id
      )
      ELSE 0
    END,
    updated_at = NOW()
  WHERE id = NEW.campaign_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update campaign metrics when campaign_athletes changes
DROP TRIGGER IF EXISTS trigger_update_campaign_metrics ON public.campaign_athletes;
CREATE TRIGGER trigger_update_campaign_metrics
  AFTER INSERT OR UPDATE OF impressions, engagement ON public.campaign_athletes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_metrics();

-- ============================================================================
-- FUNCTION: log_agency_activity
-- ============================================================================
CREATE OR REPLACE FUNCTION public.log_agency_activity(
  p_agency_id UUID,
  p_activity_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_related_type TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.agency_activity_log (
    agency_id,
    activity_type,
    title,
    description,
    related_type,
    related_id,
    user_id,
    metadata
  ) VALUES (
    p_agency_id,
    p_activity_type,
    p_title,
    p_description,
    p_related_type,
    p_related_id,
    auth.uid(),
    p_metadata
  )
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.log_agency_activity(UUID, TEXT, TEXT, TEXT, TEXT, UUID, JSONB) TO authenticated;

-- ============================================================================
-- FUNCTION: get_agency_dashboard_stats
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_agency_dashboard_stats(p_agency_id UUID)
RETURNS TABLE (
  total_campaigns BIGINT,
  active_campaigns BIGINT,
  pending_campaigns BIGINT,
  total_athletes BIGINT,
  active_athletes BIGINT,
  total_budget NUMERIC,
  spent_budget NUMERIC,
  remaining_budget NUMERIC,
  total_impressions BIGINT,
  total_engagement BIGINT,
  avg_engagement_rate NUMERIC,
  roi_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.agency_dashboard_stats
  WHERE agency_id = p_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_agency_dashboard_stats(UUID) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Created:
--   - 6 tables (campaigns, campaign_athletes, campaign_metrics,
--               agency_budget_allocations, agency_activity_log,
--               agency_pending_actions)
--   - 3 views (agency_dashboard_stats, campaign_performance_detail,
--              agency_athlete_roster)
--   - 3 functions (update_campaign_metrics, log_agency_activity,
--                  get_agency_dashboard_stats)
--   - All RLS policies
--   - All indexes
-- ============================================================================
