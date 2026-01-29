-- ============================================================================
-- ChatNIL Compliance Engine - Reference Data Seed
-- Created: 2025-01-23
-- Description: Seed data for 6-Dimensional Compliance Scoring Engine
-- ============================================================================

-- ============================================================================
-- SECTION 1: State NIL Laws (jurisdictions table)
-- ============================================================================

INSERT INTO public.jurisdictions (
    state_code, state_name, hs_nil_allowed, hs_parental_consent_required,
    hs_school_approval_required, college_nil_allowed, college_disclosure_required,
    college_disclosure_deadline_days, requires_contract, requires_disclosure,
    requires_tax_reporting_threshold, prohibited_activities, rules_summary,
    effective_date, last_updated_date
) VALUES
-- CALIFORNIA - Most permissive
('CA', 'California', true, true, false, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'California was first to pass NIL legislation. HS athletes allowed with parental consent. No school approval required.',
 '2019-09-30', '2024-01-01'),

-- TEXAS - Moderate
('TX', 'Texas', true, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis', 'firearms'],
 'Texas allows HS NIL with parental consent and school notification. No deals conflicting with school sponsors.',
 '2021-07-01', '2024-01-01'),

-- FLORIDA - Permissive
('FL', 'Florida', true, true, false, true, true, 3, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Florida has strong NIL protections. Athletes can use professional representation. 3-day disclosure requirement.',
 '2021-07-01', '2024-01-01'),

-- GEORGIA - Moderate
('GA', 'Georgia', true, true, false, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Georgia allows NIL for HS and college athletes. Strong agent regulation requirements.',
 '2021-07-01', '2024-01-01'),

-- NEW YORK - Restrictive for HS
('NY', 'New York', false, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis', 'adult_entertainment'],
 'New York does NOT allow HS NIL. College athletes have full NIL rights with disclosure requirements.',
 '2021-08-01', '2024-01-01'),

-- OHIO - Moderate
('OH', 'Ohio', true, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Ohio allows HS NIL with school approval. Financial literacy education recommended.',
 '2021-06-28', '2024-01-01'),

-- NORTH CAROLINA - Moderate
('NC', 'North Carolina', true, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'NC requires school notification for HS athletes. Strong athlete protections in place.',
 '2021-07-01', '2024-01-01'),

-- MICHIGAN - Permissive
('MI', 'Michigan', true, true, false, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Michigan has permissive NIL laws. HS athletes can participate with parental consent.',
 '2021-12-31', '2024-01-01'),

-- PENNSYLVANIA - Moderate
('PA', 'Pennsylvania', true, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Pennsylvania requires school approval for HS NIL. Strong compliance requirements.',
 '2022-01-01', '2024-01-01'),

-- ARIZONA - Permissive
('AZ', 'Arizona', true, true, false, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Arizona allows HS and college NIL with standard requirements.',
 '2021-07-01', '2024-01-01'),

-- TENNESSEE - Moderate
('TN', 'Tennessee', true, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Tennessee has moderate NIL rules. School approval required for HS athletes.',
 '2021-07-01', '2024-01-01'),

-- ILLINOIS - Moderate
('IL', 'Illinois', true, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Illinois requires school notification. Strong agent regulation.',
 '2021-07-01', '2024-01-01'),

-- MASSACHUSETTS - Restrictive for HS
('MA', 'Massachusetts', false, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis', 'adult_entertainment'],
 'Massachusetts does NOT allow HS NIL currently. College athletes have NIL rights.',
 '2021-07-01', '2024-01-01'),

-- WASHINGTON - Restrictive for HS
('WA', 'Washington', false, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Washington restricts HS NIL. College athletes have full NIL rights.',
 '2021-06-14', '2024-01-01'),

-- KENTUCKY - Moderate
('KY', 'Kentucky', true, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Kentucky allows NIL with school approval for HS athletes.',
 '2021-07-01', '2024-01-01'),

-- INDIANA - Moderate
('IN', 'Indiana', true, true, true, true, true, 7, true, true, 600.00,
 ARRAY['gambling', 'tobacco', 'alcohol', 'cannabis'],
 'Indiana has moderate NIL rules with school approval requirements.',
 '2021-07-01', '2024-01-01')

ON CONFLICT (state_code) DO UPDATE SET
    state_name = EXCLUDED.state_name,
    hs_nil_allowed = EXCLUDED.hs_nil_allowed,
    hs_parental_consent_required = EXCLUDED.hs_parental_consent_required,
    hs_school_approval_required = EXCLUDED.hs_school_approval_required,
    college_nil_allowed = EXCLUDED.college_nil_allowed,
    college_disclosure_required = EXCLUDED.college_disclosure_required,
    college_disclosure_deadline_days = EXCLUDED.college_disclosure_deadline_days,
    requires_contract = EXCLUDED.requires_contract,
    requires_disclosure = EXCLUDED.requires_disclosure,
    requires_tax_reporting_threshold = EXCLUDED.requires_tax_reporting_threshold,
    prohibited_activities = EXCLUDED.prohibited_activities,
    rules_summary = EXCLUDED.rules_summary,
    effective_date = EXCLUDED.effective_date,
    last_updated_date = EXCLUDED.last_updated_date,
    updated_at = NOW();

-- ============================================================================
-- SECTION 2: Prohibited Contract Terms
-- ============================================================================

INSERT INTO public.prohibited_terms (
    term, term_variations, category, severity, auto_reject,
    description, why_prohibited, applies_to_hs, applies_to_college
) VALUES
-- Pay-for-Play Terms (Critical)
('payment for enrollment',
 ARRAY['enrollment bonus', 'signing bonus tied to enrollment', 'commitment payment'],
 'pay_for_play', 'red', true,
 'Payment contingent on enrollment decision',
 'Direct pay-for-play violates NCAA rules and federal guidelines. Athletes cannot be compensated for choosing a school.',
 true, true),

('performance bonus tied to wins',
 ARRAY['win bonus', 'championship bonus', 'playoff bonus', 'bowl game bonus'],
 'pay_for_play', 'red', true,
 'Compensation tied to team performance',
 'Payments tied to athletic performance outcomes blur the line between NIL and pay-for-play.',
 true, true),

('booster direct payment',
 ARRAY['booster payment', 'donor payment', 'alumni payment'],
 'pay_for_play', 'red', true,
 'Direct payment from school boosters or donors',
 'Payments directly from boosters without legitimate NIL activity are considered inducements.',
 true, true),

-- Exploitative Terms (Critical/Warning)
('perpetual rights',
 ARRAY['in perpetuity', 'forever', 'indefinitely', 'lifetime rights'],
 'exploitative', 'red', true,
 'Rights granted forever without expiration',
 'Athletes should never sign away NIL rights permanently. All agreements should have defined terms.',
 true, true),

('exclusive worldwide rights',
 ARRAY['exclusive global rights', 'all media exclusive', 'total exclusivity'],
 'exploitative', 'orange', false,
 'Broad exclusivity that limits future opportunities',
 'Overly broad exclusivity prevents athletes from pursuing other legitimate NIL opportunities.',
 true, true),

('transfer of all intellectual property',
 ARRAY['IP assignment', 'assignment of all rights', 'full IP transfer'],
 'exploitative', 'orange', false,
 'Complete transfer of intellectual property ownership',
 'Athletes should retain ownership of their NIL and license rights, not transfer them.',
 true, true),

-- NCAA Violation Terms
('quid pro quo for roster spot',
 ARRAY['guaranteed roster spot', 'playing time guarantee', 'starting position guarantee'],
 'ncaa_violation', 'red', true,
 'NIL tied to playing time or roster decisions',
 'Coaches cannot use NIL to influence playing time decisions. This violates NCAA rules.',
 true, true),

('recruiting inducement',
 ARRAY['recruiting bonus', 'transfer incentive', 'portal payment'],
 'ncaa_violation', 'red', true,
 'Payment to influence recruiting decisions',
 'NIL cannot be used as an inducement in the recruiting process.',
 true, true),

-- Brand Safety Terms
('alcohol promotion',
 ARRAY['beer sponsor', 'liquor endorsement', 'alcohol brand'],
 'brand_safety', 'red', false,
 'Promotion of alcoholic beverages',
 'Student-athletes should not promote alcohol products regardless of age.',
 true, true),

('gambling endorsement',
 ARRAY['sports betting', 'casino promotion', 'gambling sponsor'],
 'brand_safety', 'red', true,
 'Promotion of gambling or sports betting',
 'NCAA prohibits student-athletes from promoting gambling or sports betting.',
 true, true),

('tobacco/vaping promotion',
 ARRAY['cigarette', 'vape', 'e-cigarette', 'nicotine'],
 'brand_safety', 'red', true,
 'Promotion of tobacco or vaping products',
 'Student-athletes cannot promote tobacco or vaping products.',
 true, true),

-- Contract Red Flags (Warnings)
('automatic renewal without notice',
 ARRAY['auto-renew', 'automatic extension', 'perpetual renewal'],
 'exploitative', 'yellow', false,
 'Contract auto-renews without athlete notification',
 'Athletes should have clear notice and opt-out periods for renewals.',
 true, true),

('one-sided termination',
 ARRAY['termination at will by company', 'brand can terminate anytime'],
 'exploitative', 'yellow', false,
 'Only one party can terminate the agreement',
 'Termination rights should be mutual and clearly defined.',
 true, true),

('excessive liquidated damages',
 ARRAY['penalty clause', 'damage clause exceeding contract value'],
 'exploitative', 'yellow', false,
 'Unreasonable penalties for breach',
 'Liquidated damages should be proportional to actual potential harm.',
 true, true),

('broad morality clause',
 ARRAY['subjective morality standard', 'sole discretion termination'],
 'exploitative', 'yellow', false,
 'Vague moral standards that allow easy termination',
 'Morality clauses should have clear, objective standards.',
 true, true)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 3: FMV Benchmarks
-- ============================================================================

-- Note: These would typically come from market data analysis
-- Using representative values for common deal types

CREATE TABLE IF NOT EXISTS public.fmv_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport VARCHAR(100) NOT NULL,
    deal_type VARCHAR(100) NOT NULL,
    follower_range_min INT NOT NULL,
    follower_range_max INT NOT NULL,
    value_low DECIMAL(10,2) NOT NULL,
    value_mid DECIMAL(10,2) NOT NULL,
    value_high DECIMAL(10,2) NOT NULL,
    last_updated DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.fmv_benchmarks (
    sport, deal_type, follower_range_min, follower_range_max,
    value_low, value_mid, value_high
) VALUES
-- Football
('football', 'sponsored_post', 0, 5000, 50, 150, 300),
('football', 'sponsored_post', 5000, 25000, 150, 500, 1000),
('football', 'sponsored_post', 25000, 100000, 500, 1500, 3500),
('football', 'sponsored_post', 100000, 500000, 2000, 5000, 15000),
('football', 'brand_ambassador', 0, 5000, 1000, 3000, 7500),
('football', 'brand_ambassador', 5000, 25000, 3000, 10000, 25000),
('football', 'brand_ambassador', 25000, 100000, 10000, 30000, 75000),
('football', 'event_appearance', 0, 25000, 250, 750, 1500),
('football', 'event_appearance', 25000, 100000, 1000, 2500, 5000),

-- Basketball
('basketball', 'sponsored_post', 0, 5000, 50, 150, 300),
('basketball', 'sponsored_post', 5000, 25000, 150, 500, 1000),
('basketball', 'sponsored_post', 25000, 100000, 500, 1500, 3500),
('basketball', 'brand_ambassador', 0, 5000, 1000, 3000, 7500),
('basketball', 'brand_ambassador', 5000, 25000, 3000, 10000, 25000),
('basketball', 'brand_ambassador', 25000, 100000, 10000, 30000, 75000),

-- Other Sports (baseline)
('other', 'sponsored_post', 0, 5000, 25, 100, 200),
('other', 'sponsored_post', 5000, 25000, 100, 350, 750),
('other', 'sponsored_post', 25000, 100000, 350, 1000, 2500),
('other', 'brand_ambassador', 0, 5000, 500, 2000, 5000),
('other', 'brand_ambassador', 5000, 25000, 2000, 7500, 15000),
('other', 'brand_ambassador', 25000, 100000, 7500, 20000, 50000)

ON CONFLICT DO NOTHING;

-- ============================================================================
-- SECTION 4: Create indexes for reference data
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_fmv_benchmarks_sport ON public.fmv_benchmarks(sport);
CREATE INDEX IF NOT EXISTS idx_fmv_benchmarks_deal_type ON public.fmv_benchmarks(deal_type);
CREATE INDEX IF NOT EXISTS idx_fmv_benchmarks_followers ON public.fmv_benchmarks(follower_range_min, follower_range_max);

-- ============================================================================
-- Migration Complete
-- ============================================================================

COMMENT ON TABLE public.fmv_benchmarks IS 'Fair Market Value benchmarks for NIL deal valuation';
