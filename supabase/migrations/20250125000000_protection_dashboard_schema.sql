-- ============================================================================
-- Protection Dashboard Schema Migration
-- Created: 2025-01-25
-- Description: Adds tables for deal submission tracking, dimension issues,
--              tax payment schedule, and athlete todos for the protection-focused
--              college athlete dashboard redesign.
-- ============================================================================

-- ============================================================================
-- SECTION 1: DEAL SUBMISSION TRACKING
-- ============================================================================

-- Track deal submission status to compliance office (California 7-day rule, etc.)
CREATE TABLE IF NOT EXISTS public.deal_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.nil_deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Submission tracking
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submission_method TEXT NOT NULL CHECK (submission_method IN ('platform', 'manual', 'auto')),

    -- State compliance tracking
    state_code VARCHAR(2) NOT NULL,
    state_deadline_days INTEGER NOT NULL DEFAULT 7,
    deadline_at TIMESTAMPTZ NOT NULL,

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'submitted', 'approved', 'flagged', 'expired'
    )),
    compliance_officer_id UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(deal_id)
);

CREATE INDEX IF NOT EXISTS idx_deal_submissions_user ON public.deal_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_submissions_status ON public.deal_submissions(status);
CREATE INDEX IF NOT EXISTS idx_deal_submissions_deadline ON public.deal_submissions(deadline_at);

-- ============================================================================
-- SECTION 2: DIMENSION ISSUES TRACKING
-- ============================================================================

-- Track dimension-level issues for deals (denormalized for fast queries)
CREATE TABLE IF NOT EXISTS public.deal_dimension_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.nil_deals(id) ON DELETE CASCADE,

    -- Which dimension has the issue
    dimension TEXT NOT NULL CHECK (dimension IN (
        'policy_fit',
        'document_hygiene',
        'fmv_verification',
        'tax_readiness',
        'brand_safety',
        'guardian_consent'
    )),

    -- Issue details
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),

    -- Human-readable issue and fix
    issue_title TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    fix_action TEXT NOT NULL,
    fix_url TEXT,

    -- Auto-resolution tracking
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by TEXT CHECK (resolved_by IN ('user', 'system', 'compliance_officer')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deal_dimension_issues_deal ON public.deal_dimension_issues(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_dimension_issues_severity ON public.deal_dimension_issues(severity);
CREATE INDEX IF NOT EXISTS idx_deal_dimension_issues_resolved ON public.deal_dimension_issues(is_resolved);

-- ============================================================================
-- SECTION 3: TAX PAYMENT SCHEDULE
-- ============================================================================

-- Tax payment schedule (quarterly estimates)
CREATE TABLE IF NOT EXISTS public.tax_payment_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,

    -- Quarter info
    quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
    quarter_name TEXT NOT NULL,

    -- Dates
    due_date DATE NOT NULL,

    -- Amounts (calculated from deals)
    estimated_income DECIMAL(12,2) NOT NULL DEFAULT 0,
    estimated_tax DECIMAL(12,2) NOT NULL DEFAULT 0,

    -- Payment tracking
    payment_status TEXT NOT NULL DEFAULT 'upcoming' CHECK (payment_status IN (
        'upcoming', 'due_soon', 'overdue', 'paid', 'partial'
    )),
    amount_paid DECIMAL(12,2) DEFAULT 0,
    paid_at TIMESTAMPTZ,

    -- Reminders
    reminder_sent_30_days BOOLEAN DEFAULT FALSE,
    reminder_sent_7_days BOOLEAN DEFAULT FALSE,
    reminder_sent_1_day BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, tax_year, quarter)
);

CREATE INDEX IF NOT EXISTS idx_tax_payment_schedule_user ON public.tax_payment_schedule(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_payment_schedule_status ON public.tax_payment_schedule(payment_status);
CREATE INDEX IF NOT EXISTS idx_tax_payment_schedule_due ON public.tax_payment_schedule(due_date);

-- ============================================================================
-- SECTION 4: ATHLETE TO-DOS
-- ============================================================================

-- To-do items for athletes (unified action list)
CREATE TABLE IF NOT EXISTS public.athlete_todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- What this todo relates to
    related_type TEXT NOT NULL CHECK (related_type IN (
        'deal', 'tax', 'compliance', 'document', 'deadline', 'general'
    )),
    related_id UUID,

    -- Display
    priority INTEGER NOT NULL DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
    title TEXT NOT NULL,
    description TEXT,

    -- Action
    action_label TEXT NOT NULL,
    action_url TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'link', 'modal', 'upload', 'confirm', 'external'
    )),

    -- Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'dismissed', 'expired'
    )),

    -- Urgency
    is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
    due_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,

    -- Tracking
    completed_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_athlete_todos_user_status ON public.athlete_todos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_athlete_todos_priority ON public.athlete_todos(priority DESC);
CREATE INDEX IF NOT EXISTS idx_athlete_todos_urgent ON public.athlete_todos(is_urgent, due_at);

-- ============================================================================
-- SECTION 5: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.deal_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_dimension_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_payment_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_todos ENABLE ROW LEVEL SECURITY;

-- Deal Submissions: Athletes see their own, compliance officers see institution's
DROP POLICY IF EXISTS "Athletes view own submissions" ON public.deal_submissions;
CREATE POLICY "Athletes view own submissions" ON public.deal_submissions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes insert own submissions" ON public.deal_submissions;
CREATE POLICY "Athletes insert own submissions" ON public.deal_submissions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes update own submissions" ON public.deal_submissions;
CREATE POLICY "Athletes update own submissions" ON public.deal_submissions
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- Dimension Issues: Read-only for athletes (system manages)
DROP POLICY IF EXISTS "Athletes view deal issues" ON public.deal_dimension_issues;
CREATE POLICY "Athletes view deal issues" ON public.deal_dimension_issues
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.nil_deals d
        WHERE d.id = deal_id AND d.athlete_id = auth.uid()
    ));

-- Tax Schedule: Athletes manage their own
DROP POLICY IF EXISTS "Athletes view own tax schedule" ON public.tax_payment_schedule;
CREATE POLICY "Athletes view own tax schedule" ON public.tax_payment_schedule
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes update own tax schedule" ON public.tax_payment_schedule;
CREATE POLICY "Athletes update own tax schedule" ON public.tax_payment_schedule
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- Todos: Athletes manage their own
DROP POLICY IF EXISTS "Athletes view own todos" ON public.athlete_todos;
CREATE POLICY "Athletes view own todos" ON public.athlete_todos
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes insert own todos" ON public.athlete_todos;
CREATE POLICY "Athletes insert own todos" ON public.athlete_todos
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes update own todos" ON public.athlete_todos;
CREATE POLICY "Athletes update own todos" ON public.athlete_todos
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Athletes delete own todos" ON public.athlete_todos;
CREATE POLICY "Athletes delete own todos" ON public.athlete_todos
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 6: TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS set_updated_at ON public.deal_submissions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.deal_submissions
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.deal_dimension_issues;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.deal_dimension_issues
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.tax_payment_schedule;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tax_payment_schedule
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.athlete_todos;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.athlete_todos
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- SECTION 7: HELPER FUNCTIONS
-- ============================================================================

-- Calculate deadline based on state rules
CREATE OR REPLACE FUNCTION public.calculate_submission_deadline(
    p_state_code VARCHAR(2),
    p_deal_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
    deadline_days INTEGER;
BEGIN
    -- Get state-specific deadline
    SELECT COALESCE(college_disclosure_deadline_days, 7)
    INTO deadline_days
    FROM public.jurisdictions
    WHERE state_code = p_state_code;

    -- Default to 7 days if state not found
    IF deadline_days IS NULL THEN
        deadline_days := 7;
    END IF;

    RETURN p_deal_date + (deadline_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get next quarterly tax due date
CREATE OR REPLACE FUNCTION public.get_next_quarterly_due()
RETURNS TABLE (
    due_date DATE,
    quarter_name TEXT,
    quarter_number INTEGER
) AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
    current_year INTEGER := EXTRACT(YEAR FROM current_date);
BEGIN
    -- Q1: Apr 15, Q2: Jun 15, Q3: Sep 15, Q4: Jan 15 (next year)
    IF current_date < make_date(current_year, 4, 15) THEN
        RETURN QUERY SELECT make_date(current_year, 4, 15), 'Q1 ' || current_year::TEXT, 1;
    ELSIF current_date < make_date(current_year, 6, 15) THEN
        RETURN QUERY SELECT make_date(current_year, 6, 15), 'Q2 ' || current_year::TEXT, 2;
    ELSIF current_date < make_date(current_year, 9, 15) THEN
        RETURN QUERY SELECT make_date(current_year, 9, 15), 'Q3 ' || current_year::TEXT, 3;
    ELSE
        RETURN QUERY SELECT make_date(current_year + 1, 1, 15), 'Q4 ' || current_year::TEXT, 4;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SECTION 8: GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deal_submissions TO authenticated;
GRANT SELECT ON public.deal_dimension_issues TO authenticated;
GRANT SELECT, UPDATE ON public.tax_payment_schedule TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.athlete_todos TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_submission_deadline TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_next_quarterly_due TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================
