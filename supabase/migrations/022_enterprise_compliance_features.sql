-- ============================================================================
-- ChatNIL Enterprise Compliance Features Migration
-- Created: 2025-01-24
-- Description: Adds support for team workload management, saved filters,
--              and enterprise-scale compliance dashboard features
-- ============================================================================

-- ============================================================================
-- SECTION 1: COMPLIANCE ASSIGNMENTS TABLE
-- ============================================================================

-- Tracks assignment of action items to team members
CREATE TABLE IF NOT EXISTS public.compliance_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.nil_deals(id) ON DELETE CASCADE,
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'reassigned')),
    notes TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deal_id, assigned_to)
);

CREATE INDEX IF NOT EXISTS idx_compliance_assignments_deal ON public.compliance_assignments(deal_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assignments_assignee ON public.compliance_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_compliance_assignments_assigner ON public.compliance_assignments(assigned_by);
CREATE INDEX IF NOT EXISTS idx_compliance_assignments_institution ON public.compliance_assignments(institution_id);
CREATE INDEX IF NOT EXISTS idx_compliance_assignments_status ON public.compliance_assignments(status);

-- ============================================================================
-- SECTION 2: COMPLIANCE SAVED FILTERS TABLE
-- ============================================================================

-- Saved filter presets for quick access
CREATE TABLE IF NOT EXISTS public.compliance_saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    filter_config JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    usage_count INT DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_compliance_filters_user ON public.compliance_saved_filters(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_filters_institution ON public.compliance_saved_filters(institution_id);
CREATE INDEX IF NOT EXISTS idx_compliance_filters_shared ON public.compliance_saved_filters(is_shared);

-- ============================================================================
-- SECTION 3: COMPLIANCE ACTIVITY LOG TABLE
-- ============================================================================

-- Detailed activity logging for audit trail
CREATE TABLE IF NOT EXISTS public.compliance_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'deal_submitted', 'deal_approved', 'deal_rejected', 'deal_flagged',
        'override_applied', 'assignment_created', 'assignment_completed',
        'bulk_approve', 'bulk_reject', 'filter_saved', 'export_generated',
        'deadline_warning', 'deadline_missed', 'score_updated', 'note_added'
    )),
    target_type VARCHAR(50) CHECK (target_type IN ('deal', 'athlete', 'assignment', 'filter', 'export')),
    target_id UUID,
    target_ids UUID[],
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_activity_institution ON public.compliance_activity_log(institution_id);
CREATE INDEX IF NOT EXISTS idx_compliance_activity_actor ON public.compliance_activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_compliance_activity_type ON public.compliance_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_compliance_activity_created ON public.compliance_activity_log(created_at DESC);

-- ============================================================================
-- SECTION 4: TEAM MEMBER STATS VIEW
-- ============================================================================

-- View for team workload statistics
CREATE OR REPLACE VIEW public.compliance_team_stats AS
SELECT
    staff.user_id,
    staff.institution_id,
    u.email,
    ap.username as name,
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.status IN ('assigned', 'in_progress')) as open_items,
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.status = 'completed' AND ca.completed_at >= NOW() - INTERVAL '7 days') as completed_this_week,
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.status = 'completed' AND ca.completed_at >= NOW() - INTERVAL '30 days') as completed_this_month,
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.due_date < NOW() AND ca.status != 'completed') as overdue_items,
    AVG(EXTRACT(EPOCH FROM (ca.completed_at - ca.assigned_at)) / 3600) FILTER (WHERE ca.status = 'completed') as avg_resolution_hours
FROM public.institution_staff staff
JOIN auth.users u ON u.id = staff.user_id
LEFT JOIN public.athlete_profiles ap ON ap.user_id = staff.user_id
LEFT JOIN public.compliance_assignments ca ON ca.assigned_to = staff.user_id
WHERE staff.role = 'compliance_officer'
GROUP BY staff.user_id, staff.institution_id, u.email, ap.username;

-- ============================================================================
-- SECTION 5: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.compliance_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_activity_log ENABLE ROW LEVEL SECURITY;

-- Assignments: Team members at same institution can view and manage
DROP POLICY IF EXISTS "Staff view institution assignments" ON public.compliance_assignments;
CREATE POLICY "Staff view institution assignments" ON public.compliance_assignments FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.institution_staff
        WHERE user_id = auth.uid()
        AND institution_id = compliance_assignments.institution_id
        AND role = 'compliance_officer'
    )
);

DROP POLICY IF EXISTS "Staff manage institution assignments" ON public.compliance_assignments;
CREATE POLICY "Staff manage institution assignments" ON public.compliance_assignments FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.institution_staff
        WHERE user_id = auth.uid()
        AND institution_id = compliance_assignments.institution_id
        AND role = 'compliance_officer'
    )
);

-- Saved Filters: Users manage their own, can view shared filters
DROP POLICY IF EXISTS "Users manage own filters" ON public.compliance_saved_filters;
CREATE POLICY "Users manage own filters" ON public.compliance_saved_filters FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users view shared filters" ON public.compliance_saved_filters;
CREATE POLICY "Users view shared filters" ON public.compliance_saved_filters FOR SELECT TO authenticated
USING (
    is_shared = true AND EXISTS (
        SELECT 1 FROM public.institution_staff
        WHERE user_id = auth.uid()
        AND institution_id = compliance_saved_filters.institution_id
    )
);

-- Activity Log: Staff can view their institution's activity
DROP POLICY IF EXISTS "Staff view institution activity" ON public.compliance_activity_log;
CREATE POLICY "Staff view institution activity" ON public.compliance_activity_log FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.institution_staff
        WHERE user_id = auth.uid()
        AND institution_id = compliance_activity_log.institution_id
    )
);

DROP POLICY IF EXISTS "Staff insert activity" ON public.compliance_activity_log;
CREATE POLICY "Staff insert activity" ON public.compliance_activity_log FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.institution_staff
        WHERE user_id = auth.uid()
        AND institution_id = compliance_activity_log.institution_id
    )
);

-- ============================================================================
-- SECTION 6: HELPER FUNCTIONS
-- ============================================================================

-- Function to get team workload distribution
CREATE OR REPLACE FUNCTION public.get_team_workload(inst_id UUID)
RETURNS TABLE (
    user_id UUID,
    name TEXT,
    email TEXT,
    open_items BIGINT,
    completed_this_week BIGINT,
    overdue_items BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cts.user_id,
        cts.name::TEXT,
        cts.email::TEXT,
        cts.open_items,
        cts.completed_this_week,
        cts.overdue_items
    FROM public.compliance_team_stats cts
    WHERE cts.institution_id = inst_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to log compliance activity
CREATE OR REPLACE FUNCTION public.log_compliance_activity(
    p_institution_id UUID,
    p_action_type VARCHAR(50),
    p_target_type VARCHAR(50) DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_target_ids UUID[] DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO public.compliance_activity_log (
        institution_id, actor_id, action_type, target_type, target_id, target_ids, metadata
    ) VALUES (
        p_institution_id, auth.uid(), p_action_type, p_target_type, p_target_id, p_target_ids, p_metadata
    ) RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 7: TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_at ON public.compliance_assignments;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.compliance_assignments
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.compliance_saved_filters;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.compliance_saved_filters
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SECTION 8: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_saved_filters TO authenticated;
GRANT SELECT, INSERT ON public.compliance_activity_log TO authenticated;
GRANT SELECT ON public.compliance_team_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_workload TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_compliance_activity TO authenticated;

-- ============================================================================
-- SECTION 9: DEFAULT SAVED FILTERS
-- ============================================================================

-- Note: These will be created per-institution when first compliance officer logs in
-- The filter_config structure:
-- {
--   "severity": ["critical", "warning"],
--   "sport": ["Football", "Basketball"],
--   "status": ["pending_review", "flagged"],
--   "assignee": "unassigned" | UUID | null,
--   "dateRange": { "from": "2024-01-01", "to": "2024-12-31" },
--   "sortBy": "severity" | "date" | "amount" | "athlete",
--   "sortOrder": "asc" | "desc"
-- }

-- ============================================================================
-- Migration Complete
-- ============================================================================
