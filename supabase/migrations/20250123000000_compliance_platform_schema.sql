-- ============================================================================
-- ChatNIL 4-Role Compliance Platform Migration
-- Created: 2025-01-23
-- Description: Comprehensive schema for HS Students, College Athletes,
--              Parents, and Compliance Officers with full RLS policies
-- ============================================================================

-- ============================================================================
-- SECTION 1: NEW TABLES
-- ============================================================================

-- 1.1 institutions - Schools and universities
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('high_school', 'college', 'university')),
    state VARCHAR(2) NOT NULL,
    conference VARCHAR(100),
    logo_url TEXT,
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_institutions_state ON public.institutions(state);
CREATE INDEX IF NOT EXISTS idx_institutions_type ON public.institutions(type);

-- 1.2 institution_staff - Links staff to institutions
CREATE TABLE IF NOT EXISTS public.institution_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('compliance_officer', 'admin', 'coach', 'athletic_director')),
    permissions JSONB DEFAULT '{"can_view_athletes": true, "can_review_deals": false, "can_approve_deals": false}',
    department VARCHAR(100),
    title VARCHAR(255),
    is_primary_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, institution_id)
);

CREATE INDEX IF NOT EXISTS idx_institution_staff_user ON public.institution_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_institution_staff_institution ON public.institution_staff(institution_id);

-- 1.3 parent_child_relationships - Links parents to children
CREATE TABLE IF NOT EXISTS public.parent_child_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) DEFAULT 'parent' CHECK (relationship_type IN ('parent', 'guardian', 'legal_representative')),
    consent_status VARCHAR(50) DEFAULT 'pending' CHECK (consent_status IN ('pending', 'approved', 'denied', 'revoked', 'expired')),
    consent_given_at TIMESTAMPTZ,
    consent_expires_at TIMESTAMPTZ,
    consent_document_url TEXT,
    verification_method VARCHAR(50) CHECK (verification_method IN ('email', 'document', 'in_person', 'notarized')),
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, child_id),
    CONSTRAINT different_users CHECK (parent_id != child_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_child_parent ON public.parent_child_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_child ON public.parent_child_relationships(child_id);

-- 1.4 student_discovery_profiles - Data from Discovery Through Conversation
CREATE TABLE IF NOT EXISTS public.student_discovery_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    sport VARCHAR(100),
    position VARCHAR(100),
    team_name VARCHAR(255),
    jersey_number VARCHAR(10),
    years_playing INT,
    state_code VARCHAR(2),
    city VARCHAR(100),
    school_year VARCHAR(50) CHECK (school_year IN ('freshman', 'sophomore', 'junior', 'senior', 'grad_student', 'other')),
    leadership_style VARCHAR(100),
    communication_style VARCHAR(100),
    personality_traits TEXT[],
    social_platforms JSONB DEFAULT '[]',
    follower_count_total INT DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    content_type VARCHAR(100),
    posting_frequency VARCHAR(50),
    personal_brand_keywords TEXT[],
    brand_values TEXT[],
    unique_story TEXT,
    target_audience TEXT,
    nil_interest_level VARCHAR(50) CHECK (nil_interest_level IN ('exploring', 'interested', 'ready', 'active')),
    nil_experience_level VARCHAR(50) CHECK (nil_experience_level IN ('none', 'beginner', 'some', 'experienced')),
    deal_types_interested TEXT[],
    minimum_deal_value DECIMAL(10,2),
    compliance_knowledge_score INT CHECK (compliance_knowledge_score >= 0 AND compliance_knowledge_score <= 100),
    compliance_quiz_completed BOOLEAN DEFAULT false,
    understands_disclosure_rules BOOLEAN DEFAULT false,
    understands_tax_obligations BOOLEAN DEFAULT false,
    financial_independence_level VARCHAR(50) CHECK (financial_independence_level IN ('dependent', 'partial', 'independent')),
    has_bank_account BOOLEAN,
    financial_goals TEXT[],
    athletic_aspirations TEXT,
    career_aspirations TEXT,
    causes_passionate_about TEXT[],
    community_involvement TEXT,
    current_pillar VARCHAR(50) CHECK (current_pillar IN ('identity', 'business', 'money', 'legacy')),
    pillars_completed JSONB DEFAULT '[]',
    discovery_completed_at TIMESTAMPTZ,
    last_conversation_at TIMESTAMPTZ,
    profile_completeness INT DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovery_profile_user ON public.student_discovery_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_profile_sport ON public.student_discovery_profiles(sport);
CREATE INDEX IF NOT EXISTS idx_discovery_profile_state ON public.student_discovery_profiles(state_code);

-- 1.5 conversation_flows - Track Discovery conversation state
CREATE TABLE IF NOT EXISTS public.conversation_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flow_type VARCHAR(50) DEFAULT 'discovery' CHECK (flow_type IN ('discovery', 'onboarding', 'deal_review', 'learning')),
    current_pillar VARCHAR(50) CHECK (current_pillar IN ('identity', 'business', 'money', 'legacy')),
    current_day INT DEFAULT 1 CHECK (current_day >= 1 AND current_day <= 30),
    current_step INT DEFAULT 1,
    questions_asked JSONB DEFAULT '[]',
    answers_given JSONB DEFAULT '[]',
    extracted_data JSONB DEFAULT '{}',
    conversation_summary TEXT,
    next_prompt TEXT,
    ai_recommendations JSONB DEFAULT '[]',
    total_questions INT DEFAULT 0,
    questions_answered INT DEFAULT 0,
    flow_started_at TIMESTAMPTZ DEFAULT NOW(),
    flow_completed_at TIMESTAMPTZ,
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_flow_user ON public.conversation_flows(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_flow_status ON public.conversation_flows(status);

-- 1.6 chapter_unlocks - Track which chapters user has unlocked
CREATE TABLE IF NOT EXISTS public.chapter_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chapter_name VARCHAR(100) NOT NULL,
    chapter_category VARCHAR(50) CHECK (chapter_category IN ('identity', 'business', 'money', 'legacy', 'compliance', 'general')),
    unlocked_via VARCHAR(50) NOT NULL CHECK (unlocked_via IN ('conversation', 'quiz', 'manual', 'progression', 'achievement', 'purchase')),
    prerequisite_chapter VARCHAR(100),
    quiz_score INT CHECK (quiz_score >= 0 AND quiz_score <= 100),
    quiz_attempts INT DEFAULT 0,
    quiz_passed BOOLEAN DEFAULT false,
    content_progress INT DEFAULT 0 CHECK (content_progress >= 0 AND content_progress <= 100),
    completed_at TIMESTAMPTZ,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ,
    time_spent_seconds INT DEFAULT 0,
    UNIQUE(user_id, chapter_name)
);

CREATE INDEX IF NOT EXISTS idx_chapter_unlock_user ON public.chapter_unlocks(user_id);

-- 1.7 jurisdictions - State NIL rules
CREATE TABLE IF NOT EXISTS public.jurisdictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_code VARCHAR(2) NOT NULL UNIQUE,
    state_name VARCHAR(100) NOT NULL,
    hs_nil_allowed BOOLEAN DEFAULT false,
    hs_nil_restrictions TEXT,
    hs_parental_consent_required BOOLEAN DEFAULT true,
    hs_school_approval_required BOOLEAN DEFAULT false,
    hs_max_deal_value DECIMAL(10,2),
    college_nil_allowed BOOLEAN DEFAULT true,
    college_restrictions TEXT,
    college_disclosure_required BOOLEAN DEFAULT true,
    college_disclosure_deadline_days INT DEFAULT 7,
    requires_contract BOOLEAN DEFAULT true,
    requires_disclosure BOOLEAN DEFAULT true,
    requires_tax_reporting_threshold DECIMAL(10,2) DEFAULT 600.00,
    rules_summary TEXT,
    prohibited_activities TEXT[],
    effective_date DATE,
    last_updated_date DATE,
    source_url TEXT,
    official_statute_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jurisdiction_state ON public.jurisdictions(state_code);
CREATE INDEX IF NOT EXISTS idx_jurisdiction_hs_nil ON public.jurisdictions(hs_nil_allowed);

-- 1.8 compliance_scores - 6-dimension scoring for deals
CREATE TABLE IF NOT EXISTS public.compliance_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.nil_deals(id) ON DELETE CASCADE UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_fit_score INT CHECK (policy_fit_score >= 0 AND policy_fit_score <= 100),
    policy_fit_weight DECIMAL(3,2) DEFAULT 0.30,
    policy_fit_notes TEXT,
    fmv_score INT CHECK (fmv_score >= 0 AND fmv_score <= 100),
    fmv_weight DECIMAL(3,2) DEFAULT 0.15,
    fmv_estimated DECIMAL(10,2),
    fmv_comparable_deals JSONB DEFAULT '[]',
    fmv_notes TEXT,
    document_score INT CHECK (document_score >= 0 AND document_score <= 100),
    document_weight DECIMAL(3,2) DEFAULT 0.20,
    missing_documents TEXT[],
    document_notes TEXT,
    tax_score INT CHECK (tax_score >= 0 AND tax_score <= 100),
    tax_weight DECIMAL(3,2) DEFAULT 0.15,
    tax_implications TEXT,
    w9_required BOOLEAN DEFAULT false,
    w9_submitted BOOLEAN DEFAULT false,
    tax_notes TEXT,
    brand_safety_score INT CHECK (brand_safety_score >= 0 AND brand_safety_score <= 100),
    brand_safety_weight DECIMAL(3,2) DEFAULT 0.10,
    brand_concerns TEXT[],
    brand_safety_notes TEXT,
    guardian_consent_score INT CHECK (guardian_consent_score >= 0 AND guardian_consent_score <= 100),
    guardian_consent_weight DECIMAL(3,2) DEFAULT 0.10,
    consent_required BOOLEAN DEFAULT false,
    consent_obtained BOOLEAN DEFAULT false,
    guardian_consent_notes TEXT,
    total_score INT CHECK (total_score >= 0 AND total_score <= 100),
    weighted_score DECIMAL(5,2),
    status VARCHAR(20) CHECK (status IN ('green', 'yellow', 'red', 'pending')),
    reason_codes TEXT[],
    critical_issues TEXT[],
    warnings TEXT[],
    fix_recommendations TEXT[],
    scored_at TIMESTAMPTZ DEFAULT NOW(),
    scored_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    review_notes TEXT,
    score_version INT DEFAULT 1,
    previous_score_id UUID REFERENCES public.compliance_scores(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_score_deal ON public.compliance_scores(deal_id);
CREATE INDEX IF NOT EXISTS idx_compliance_score_user ON public.compliance_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_score_status ON public.compliance_scores(status);

-- 1.9 prohibited_terms - Banned contract language
CREATE TABLE IF NOT EXISTS public.prohibited_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term VARCHAR(255) NOT NULL,
    term_variations TEXT[],
    category VARCHAR(50) NOT NULL CHECK (category IN ('pay_for_play', 'illegal', 'brand_safety', 'exploitative', 'ncaa_violation', 'state_violation', 'tax_evasion')),
    subcategory VARCHAR(100),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('red', 'orange', 'yellow')),
    auto_reject BOOLEAN DEFAULT false,
    description TEXT,
    why_prohibited TEXT,
    legal_reference TEXT,
    example_context TEXT,
    applies_to_hs BOOLEAN DEFAULT true,
    applies_to_college BOOLEAN DEFAULT true,
    state_specific VARCHAR(2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prohibited_term_category ON public.prohibited_terms(category);
CREATE INDEX IF NOT EXISTS idx_prohibited_term_severity ON public.prohibited_terms(severity);
CREATE INDEX IF NOT EXISTS idx_prohibited_term_active ON public.prohibited_terms(is_active);

-- 1.10 contract_documents - Uploaded contracts
CREATE TABLE IF NOT EXISTS public.contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES public.nil_deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes BIGINT,
    file_hash VARCHAR(64),
    document_type VARCHAR(50) DEFAULT 'contract' CHECK (document_type IN ('contract', 'amendment', 'addendum', 'disclosure', 'consent', 'w9', 'other')),
    analysis_status VARCHAR(50) DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
    analysis_result JSONB,
    ai_summary TEXT,
    flagged_terms JSONB DEFAULT '[]',
    flagged_clauses JSONB DEFAULT '[]',
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    extracted_parties JSONB DEFAULT '[]',
    extracted_compensation JSONB,
    extracted_dates JSONB,
    extracted_deliverables JSONB DEFAULT '[]',
    verified_authentic BOOLEAN,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contract_doc_deal ON public.contract_documents(deal_id);
CREATE INDEX IF NOT EXISTS idx_contract_doc_user ON public.contract_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_doc_analysis ON public.contract_documents(analysis_status);

-- ============================================================================
-- SECTION 2: MODIFY EXISTING TABLES
-- ============================================================================

-- 2.1 profiles table modifications
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role VARCHAR(50) DEFAULT 'hs_student' CHECK (role IN ('hs_student', 'college_athlete', 'parent', 'compliance_officer'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE public.profiles ADD COLUMN date_of_birth DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'primary_state') THEN
        ALTER TABLE public.profiles ADD COLUMN primary_state VARCHAR(2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'parent_user_id') THEN
        ALTER TABLE public.profiles ADD COLUMN parent_user_id UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'institution_id') THEN
        ALTER TABLE public.profiles ADD COLUMN institution_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'consent_status') THEN
        ALTER TABLE public.profiles ADD COLUMN consent_status VARCHAR(50) DEFAULT 'not_required' CHECK (consent_status IN ('not_required', 'pending', 'approved', 'denied'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'learning_path') THEN
        ALTER TABLE public.profiles ADD COLUMN learning_path VARCHAR(50) CHECK (learning_path IN ('foundation', 'transition', 'activation'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(primary_state);

-- 2.2 quiz_questions modifications (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quiz_questions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quiz_questions' AND column_name = 'pillar') THEN
            ALTER TABLE public.quiz_questions ADD COLUMN pillar VARCHAR(50) CHECK (pillar IN ('identity', 'business', 'money', 'legacy'));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quiz_questions' AND column_name = 'phase') THEN
            ALTER TABLE public.quiz_questions ADD COLUMN phase VARCHAR(50) CHECK (phase IN ('foundation', 'transition', 'activation'));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'quiz_questions' AND column_name = 'target_role') THEN
            ALTER TABLE public.quiz_questions ADD COLUMN target_role VARCHAR(50) DEFAULT 'all' CHECK (target_role IN ('hs_student', 'college_athlete', 'all'));
        END IF;
    END IF;
END $$;

-- 2.3 badges modifications (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'badges') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'badges' AND column_name = 'badge_type') THEN
            ALTER TABLE public.badges ADD COLUMN badge_type VARCHAR(50) DEFAULT 'educational' CHECK (badge_type IN ('educational', 'compliance', 'achievement', 'milestone'));
        END IF;
    END IF;
END $$;

-- 2.4 nil_deals modifications
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nil_deals' AND column_name = 'compliance_status') THEN
        ALTER TABLE public.nil_deals ADD COLUMN compliance_status VARCHAR(20) DEFAULT 'pending_review' CHECK (compliance_status IN ('pending_review', 'green', 'yellow', 'red'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nil_deals' AND column_name = 'is_third_party_verified') THEN
        ALTER TABLE public.nil_deals ADD COLUMN is_third_party_verified BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nil_deals' AND column_name = 'third_party_name') THEN
        ALTER TABLE public.nil_deals ADD COLUMN third_party_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nil_deals' AND column_name = 'institution_id') THEN
        ALTER TABLE public.nil_deals ADD COLUMN institution_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nil_deals' AND column_name = 'reviewed_by') THEN
        ALTER TABLE public.nil_deals ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nil_deals' AND column_name = 'reviewed_at') THEN
        ALTER TABLE public.nil_deals ADD COLUMN reviewed_at TIMESTAMPTZ;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_nil_deals_compliance ON public.nil_deals(compliance_status);

-- ============================================================================
-- SECTION 3: HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    user_role VARCHAR(50);
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = user_uuid;
    RETURN COALESCE(user_role, 'hs_student');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_parent_of(parent_uuid UUID, child_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.parent_child_relationships
        WHERE parent_id = parent_uuid
        AND child_id = child_uuid
        AND consent_status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.compliance_officer_has_access(officer_uuid UUID, athlete_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.institution_staff staff
        JOIN public.profiles athlete ON athlete.institution_id = staff.institution_id
        WHERE staff.user_id = officer_uuid
        AND staff.role = 'compliance_officer'
        AND athlete.id = athlete_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.calculate_compliance_status(score INT)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF score >= 80 THEN RETURN 'green';
    ELSIF score >= 50 THEN RETURN 'yellow';
    ELSE RETURN 'red';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.get_parent_children(parent_uuid UUID)
RETURNS TABLE(child_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT pcr.child_id
    FROM public.parent_child_relationships pcr
    WHERE pcr.parent_id = parent_uuid
    AND pcr.consent_status = 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- SECTION 4: ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_discovery_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapter_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prohibited_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_documents ENABLE ROW LEVEL SECURITY;

-- Institutions: Everyone can read
DROP POLICY IF EXISTS "Institutions viewable by all" ON public.institutions;
CREATE POLICY "Institutions viewable by all" ON public.institutions FOR SELECT TO authenticated USING (true);

-- Institution Staff: Own records + institution peers
DROP POLICY IF EXISTS "Staff view own records" ON public.institution_staff;
CREATE POLICY "Staff view own records" ON public.institution_staff FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Parent-Child: Parents and children can view their relationships
DROP POLICY IF EXISTS "View own parent relationships" ON public.parent_child_relationships;
CREATE POLICY "View own parent relationships" ON public.parent_child_relationships FOR SELECT TO authenticated
USING (parent_id = auth.uid() OR child_id = auth.uid());

DROP POLICY IF EXISTS "Parents manage relationships" ON public.parent_child_relationships;
CREATE POLICY "Parents manage relationships" ON public.parent_child_relationships FOR ALL TO authenticated
USING (parent_id = auth.uid()) WITH CHECK (parent_id = auth.uid());

-- Discovery Profiles: Own data + parents can view children
DROP POLICY IF EXISTS "Users manage own discovery profile" ON public.student_discovery_profiles;
CREATE POLICY "Users manage own discovery profile" ON public.student_discovery_profiles FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Parents view children discovery" ON public.student_discovery_profiles;
CREATE POLICY "Parents view children discovery" ON public.student_discovery_profiles FOR SELECT TO authenticated
USING (user_id IN (SELECT child_id FROM public.get_parent_children(auth.uid())));

-- Conversation Flows: Own data only
DROP POLICY IF EXISTS "Users manage own flows" ON public.conversation_flows;
CREATE POLICY "Users manage own flows" ON public.conversation_flows FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Chapter Unlocks: Own data + parents view children
DROP POLICY IF EXISTS "Users manage own unlocks" ON public.chapter_unlocks;
CREATE POLICY "Users manage own unlocks" ON public.chapter_unlocks FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Jurisdictions: Everyone can read
DROP POLICY IF EXISTS "Jurisdictions viewable by all" ON public.jurisdictions;
CREATE POLICY "Jurisdictions viewable by all" ON public.jurisdictions FOR SELECT TO authenticated USING (true);

-- Compliance Scores: Own scores + compliance officers for their institution
DROP POLICY IF EXISTS "Users view own compliance" ON public.compliance_scores;
CREATE POLICY "Users view own compliance" ON public.compliance_scores FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Compliance officers manage scores" ON public.compliance_scores;
CREATE POLICY "Compliance officers manage scores" ON public.compliance_scores FOR ALL TO authenticated
USING (public.compliance_officer_has_access(auth.uid(), user_id));

-- Prohibited Terms: Everyone can read active terms
DROP POLICY IF EXISTS "Prohibited terms viewable" ON public.prohibited_terms;
CREATE POLICY "Prohibited terms viewable" ON public.prohibited_terms FOR SELECT TO authenticated USING (is_active = true);

-- Contract Documents: Own documents + compliance officers
DROP POLICY IF EXISTS "Users manage own documents" ON public.contract_documents;
CREATE POLICY "Users manage own documents" ON public.contract_documents FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.institutions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.institutions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.institution_staff;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.institution_staff FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.parent_child_relationships;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.parent_child_relationships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.student_discovery_profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.student_discovery_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.conversation_flows;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.conversation_flows FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.jurisdictions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.jurisdictions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.compliance_scores;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.compliance_scores FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.contract_documents;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.contract_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-calculate compliance score
CREATE OR REPLACE FUNCTION public.calculate_compliance_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.weighted_score := (
        COALESCE(NEW.policy_fit_score, 0) * COALESCE(NEW.policy_fit_weight, 0.30) +
        COALESCE(NEW.fmv_score, 0) * COALESCE(NEW.fmv_weight, 0.15) +
        COALESCE(NEW.document_score, 0) * COALESCE(NEW.document_weight, 0.20) +
        COALESCE(NEW.tax_score, 0) * COALESCE(NEW.tax_weight, 0.15) +
        COALESCE(NEW.brand_safety_score, 0) * COALESCE(NEW.brand_safety_weight, 0.10) +
        COALESCE(NEW.guardian_consent_score, 0) * COALESCE(NEW.guardian_consent_weight, 0.10)
    );
    NEW.total_score := ROUND(NEW.weighted_score)::INT;
    NEW.status := public.calculate_compliance_status(NEW.total_score);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calc_compliance_trigger ON public.compliance_scores;
CREATE TRIGGER calc_compliance_trigger BEFORE INSERT OR UPDATE ON public.compliance_scores
FOR EACH ROW EXECUTE FUNCTION public.calculate_compliance_total();

-- ============================================================================
-- SECTION 6: GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institutions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.institution_staff TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_child_relationships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_discovery_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_flows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chapter_unlocks TO authenticated;
GRANT SELECT ON public.jurisdictions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.compliance_scores TO authenticated;
GRANT SELECT ON public.prohibited_terms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_documents TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_parent_of TO authenticated;
GRANT EXECUTE ON FUNCTION public.compliance_officer_has_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_compliance_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_parent_children TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================
