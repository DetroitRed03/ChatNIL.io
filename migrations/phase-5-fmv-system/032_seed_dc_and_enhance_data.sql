-- ============================================================================
-- Migration 032: Seed DC, Full Kentucky Data, All-State Summaries & Associations
-- ============================================================================
-- 1. INSERT District of Columbia (DC)
-- 2. Full Kentucky (KY) update as reference implementation
-- 3. INSERT all 51 athletic associations
-- 4. UPDATE all states with summary_can_do/cannot_do/must_do/warnings
-- 5. Backfill boolean restriction fields from existing restrictions[]
-- ============================================================================

-- ============================================================================
-- 1. INSERT District of Columbia
-- ============================================================================
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, agent_registration_required, disclosure_required,
  financial_literacy_required, prohibited_categories, restrictions,
  rules_summary, effective_date,
  athletic_association_name, athletic_association_url,
  short_summary
) VALUES (
  'DC', 'District of Columbia', true, true, true,
  true, false, true, false,
  ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'],
  ARRAY['Must maintain academic eligibility', 'School approval required'],
  'DC allows NIL for high school and college athletes with school approval and disclosure requirements.',
  '2022-07-01',
  'DC State Athletic Association', 'https://www.dcsaasports.org',
  'DC allows high school NIL with school approval and disclosure requirements.'
) ON CONFLICT (state_code) DO NOTHING;

-- ============================================================================
-- 2. Full Kentucky (KY) Update — Reference Implementation
-- ============================================================================
UPDATE state_nil_rules SET
  -- Athletic association
  athletic_association_name = 'Kentucky High School Athletic Association',
  athletic_association_url = 'https://khsaa.org',

  -- HS effective date
  hs_nil_effective_date = '2024-07-01',

  -- Permission flags
  can_earn_money = true,
  can_use_agent = true,
  can_sign_contracts = true,
  can_use_school_marks = false,
  can_mention_school = true,
  can_wear_uniform_in_content = false,

  -- Parental requirements
  requires_parental_consent = true,
  min_age_without_consent = 18,
  parent_must_sign_contracts = true,

  -- School involvement
  school_can_facilitate_deals = false,
  must_notify_school = true,
  must_notify_athletic_association = false,
  disclosure_deadline_days = 30,
  requires_pre_approval = false,

  -- Restriction booleans
  cannot_conflict_with_school_sponsors = true,
  cannot_use_during_school_hours = false,
  cannot_interfere_with_academics = true,
  cannot_promote_during_games = true,

  -- Compensation limits
  has_compensation_cap = false,
  compensation_cap_amount = NULL,
  compensation_cap_period = NULL,

  -- Summaries for dashboard
  summary_can_do = '["Earn money from social media posts and brand deals", "Partner with local and national brands", "Use your name, image, and likeness for paid promotions", "Hire an agent or attorney to represent you", "Sign NIL contracts (with parent co-signature if under 18)"]'::jsonb,
  summary_cannot_do = '["Use school logos, mascots, or trademarks without permission", "Wear your school uniform in paid content", "Have your school arrange or facilitate deals", "Promote products during games or school events", "Sign deals that conflict with school sponsor agreements"]'::jsonb,
  summary_must_do = '["Get parent/guardian consent for all NIL deals", "Disclose NIL deals to your school within 30 days", "Maintain academic eligibility", "Have a parent co-sign all contracts if under 18"]'::jsonb,
  summary_warnings = '["No alcohol, gambling, or cannabis brand deals", "Deals cannot interfere with your academics or team obligations", "Keep records of all NIL income for tax purposes", "Consult with your school''s athletic department before signing"]'::jsonb,

  -- Source/verification
  primary_source_url = 'https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=52521',
  last_verified_date = '2025-01-15',
  verified_by = 'ChatNIL Research Team',

  -- Legal
  relevant_legislation = 'KRS 164.6943 - Student Athlete Name, Image, and Likeness',
  legislation_url = 'https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=52521',

  -- Summaries
  short_summary = 'Kentucky allows high school athletes to earn from NIL deals with parental consent and school disclosure. No school facilitation of deals.',
  detailed_summary = 'Kentucky enacted NIL legislation allowing both high school and college athletes to monetize their name, image, and likeness. High school athletes must obtain parental consent for all deals and disclose agreements to their school within 30 days. Schools cannot arrange or facilitate deals, and athletes cannot use school trademarks without permission. Prohibited categories include alcohol, gambling, and cannabis. Athletes must maintain academic eligibility and deals cannot interfere with team obligations. Kentucky is considered a progressive NIL state with relatively few restrictions compared to neighboring states.'

WHERE state_code = 'KY';

-- ============================================================================
-- 3. INSERT Athletic Associations for All 51 States/Territories
-- ============================================================================
INSERT INTO state_athletic_associations (state_code, association_name, association_acronym, website_url) VALUES
  ('AL', 'Alabama High School Athletic Association', 'AHSAA', 'https://www.ahsaa.com'),
  ('AK', 'Alaska School Activities Association', 'ASAA', 'https://asaa.org'),
  ('AZ', 'Arizona Interscholastic Association', 'AIA', 'https://aiaonline.org'),
  ('AR', 'Arkansas Activities Association', 'AAA', 'https://ahsaa.org'),
  ('CA', 'California Interscholastic Federation', 'CIF', 'https://cifstate.org'),
  ('CO', 'Colorado High School Activities Association', 'CHSAA', 'https://chsaa.org'),
  ('CT', 'Connecticut Interscholastic Athletic Conference', 'CIAC', 'https://casciac.org/ciac'),
  ('DE', 'Delaware Interscholastic Athletic Association', 'DIAA', 'https://diaa.doe.k12.de.us'),
  ('DC', 'DC State Athletic Association', 'DCSAA', 'https://www.dcsaasports.org'),
  ('FL', 'Florida High School Athletic Association', 'FHSAA', 'https://fhsaa.com'),
  ('GA', 'Georgia High School Association', 'GHSA', 'https://ghsa.net'),
  ('HI', 'Hawaii High School Athletic Association', 'HHSAA', 'https://sportshigh.com'),
  ('ID', 'Idaho High School Activities Association', 'IHSAA', 'https://idhsaa.org'),
  ('IL', 'Illinois High School Association', 'IHSA', 'https://ihsa.org'),
  ('IN', 'Indiana High School Athletic Association', 'IHSAA', 'https://ihsaa.org'),
  ('IA', 'Iowa High School Athletic Association', 'IHSAA', 'https://iahsaa.org'),
  ('KS', 'Kansas State High School Activities Association', 'KSHSAA', 'https://kshsaa.org'),
  ('KY', 'Kentucky High School Athletic Association', 'KHSAA', 'https://khsaa.org'),
  ('LA', 'Louisiana High School Athletic Association', 'LHSAA', 'https://lhsaa.org'),
  ('ME', 'Maine Principals Association', 'MPA', 'https://mpa.cc'),
  ('MD', 'Maryland Public Secondary Schools Athletic Association', 'MPSSAA', 'https://mpssaa.org'),
  ('MA', 'Massachusetts Interscholastic Athletic Association', 'MIAA', 'https://miaa.net'),
  ('MI', 'Michigan High School Athletic Association', 'MHSAA', 'https://mhsaa.com'),
  ('MN', 'Minnesota State High School League', 'MSHSL', 'https://mshsl.org'),
  ('MS', 'Mississippi High School Activities Association', 'MHSAA', 'https://misshsaa.com'),
  ('MO', 'Missouri State High School Activities Association', 'MSHSAA', 'https://mshsaa.org'),
  ('MT', 'Montana High School Association', 'MHSA', 'https://mhsa.org'),
  ('NE', 'Nebraska School Activities Association', 'NSAA', 'https://nsaahome.org'),
  ('NV', 'Nevada Interscholastic Activities Association', 'NIAA', 'https://niaa.com'),
  ('NH', 'New Hampshire Interscholastic Athletic Association', 'NHIAA', 'https://nhiaa.org'),
  ('NJ', 'New Jersey State Interscholastic Athletic Association', 'NJSIAA', 'https://njsiaa.org'),
  ('NM', 'New Mexico Activities Association', 'NMAA', 'https://nmact.org'),
  ('NY', 'New York State Public High School Athletic Association', 'NYSPHSAA', 'https://nysphsaa.org'),
  ('NC', 'North Carolina High School Athletic Association', 'NCHSAA', 'https://nchsaa.org'),
  ('ND', 'North Dakota High School Activities Association', 'NDHSAA', 'https://ndhsaa.com'),
  ('OH', 'Ohio High School Athletic Association', 'OHSAA', 'https://ohsaa.org'),
  ('OK', 'Oklahoma Secondary School Activities Association', 'OSSAA', 'https://ossaa.com'),
  ('OR', 'Oregon School Activities Association', 'OSAA', 'https://osaa.org'),
  ('PA', 'Pennsylvania Interscholastic Athletic Association', 'PIAA', 'https://piaa.org'),
  ('RI', 'Rhode Island Interscholastic League', 'RIIL', 'https://riil.org'),
  ('SC', 'South Carolina High School League', 'SCHSL', 'https://schsl.org'),
  ('SD', 'South Dakota High School Activities Association', 'SDHSAA', 'https://sdhsaa.com'),
  ('TN', 'Tennessee Secondary School Athletic Association', 'TSSAA', 'https://tssaa.org'),
  ('TX', 'University Interscholastic League', 'UIL', 'https://uiltexas.org'),
  ('UT', 'Utah High School Activities Association', 'UHSAA', 'https://uhsaa.org'),
  ('VT', 'Vermont Principals Association', 'VPA', 'https://vpaonline.org'),
  ('VA', 'Virginia High School League', 'VHSL', 'https://vhsl.org'),
  ('WA', 'Washington Interscholastic Activities Association', 'WIAA', 'https://wiaa.com'),
  ('WV', 'West Virginia Secondary School Activities Commission', 'WVSSAC', 'https://wvssac.org'),
  ('WI', 'Wisconsin Interscholastic Athletic Association', 'WIAA', 'https://wiaawi.org'),
  ('WY', 'Wyoming High School Activities Association', 'WHSAA', 'https://whsaa.org')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. UPDATE All States with Dashboard Summaries
-- ============================================================================
-- States where HS NIL IS allowed
-- KY already done above. Update the rest that have high_school_allowed = true.

UPDATE state_nil_rules SET
  summary_can_do = '["Earn money from NIL deals and brand partnerships", "Use social media for paid promotions", "Partner with local and national brands"]'::jsonb,
  summary_cannot_do = '["Use school logos or trademarks without permission", "Have your school arrange deals for you"]'::jsonb,
  summary_must_do = '["Get parent/guardian consent if under 18", "Disclose NIL deals to your school"]'::jsonb,
  summary_warnings = '["No alcohol, gambling, or cannabis brand deals", "Deals cannot interfere with academics or team obligations"]'::jsonb,
  short_summary = state_name || ' allows high school athletes to earn from NIL deals with standard disclosure and parental consent requirements.'
WHERE high_school_allowed = true AND state_code != 'KY'
  AND (summary_can_do IS NULL OR summary_can_do = '[]'::jsonb);

-- States where HS NIL is NOT allowed (college only)
UPDATE state_nil_rules SET
  summary_can_do = '["Build your personal brand on social media (unpaid)", "Learn about NIL rules before college"]'::jsonb,
  summary_cannot_do = '["Earn money from NIL deals as a high school athlete", "Sign paid sponsorship contracts", "Accept compensation for your name, image, or likeness"]'::jsonb,
  summary_must_do = '["Wait until college to monetize your NIL", "Focus on academics and athletic development"]'::jsonb,
  summary_warnings = '["Accepting NIL compensation could jeopardize your eligibility", "Rules may change — check with your athletic association regularly"]'::jsonb,
  short_summary = state_name || ' does not currently allow NIL deals for high school athletes. NIL is available for college athletes.'
WHERE high_school_allowed = false
  AND (summary_can_do IS NULL OR summary_can_do = '[]'::jsonb);

-- ============================================================================
-- 5. Backfill Athletic Association Names onto state_nil_rules
-- ============================================================================
UPDATE state_nil_rules s SET
  athletic_association_name = a.association_name,
  athletic_association_url = a.website_url
FROM state_athletic_associations a
WHERE s.state_code = a.state_code
  AND s.athletic_association_name IS NULL;

-- ============================================================================
-- 6. Backfill Boolean Restrictions from Existing restrictions[] Data
-- ============================================================================

-- Set must_notify_school for states with disclosure/reporting restrictions
UPDATE state_nil_rules SET must_notify_school = true
WHERE disclosure_required = true AND must_notify_school = false;

-- Set cannot_conflict_with_school_sponsors from restrictions text
UPDATE state_nil_rules SET cannot_conflict_with_school_sponsors = true
WHERE restrictions @> ARRAY['Cannot use school marks without permission']
   OR restrictions @> ARRAY['Cannot conflict with team obligations']
   OR restrictions @> ARRAY['Cannot conflict with school sponsors'];

-- Set cannot_interfere_with_academics from restrictions text
UPDATE state_nil_rules SET cannot_interfere_with_academics = true
WHERE restrictions @> ARRAY['Must maintain academic eligibility']
   OR restrictions @> ARRAY['Cannot interfere with academic or athletic obligations'];

-- Set requires_pre_approval for states with school approval
UPDATE state_nil_rules SET requires_pre_approval = true
WHERE school_approval_required = true AND requires_pre_approval = false;

-- Georgia: Set compensation cap ($500 per deal for HS)
UPDATE state_nil_rules SET
  has_compensation_cap = true,
  compensation_cap_amount = 500.00,
  compensation_cap_period = 'per_deal'
WHERE state_code = 'GA' AND high_school_allowed = true;

-- ============================================================================
-- 7. Verify
-- ============================================================================
DO $$
DECLARE
  total_count INTEGER;
  dc_exists BOOLEAN;
  ky_has_summaries BOOLEAN;
BEGIN
  SELECT COUNT(*) INTO total_count FROM state_nil_rules;
  SELECT EXISTS(SELECT 1 FROM state_nil_rules WHERE state_code = 'DC') INTO dc_exists;
  SELECT (summary_can_do IS NOT NULL AND summary_can_do != '[]'::jsonb)
    INTO ky_has_summaries FROM state_nil_rules WHERE state_code = 'KY';

  IF total_count >= 51 AND dc_exists AND ky_has_summaries THEN
    RAISE NOTICE '✅ Migration 032 complete: % states, DC=%, KY summaries=%', total_count, dc_exists, ky_has_summaries;
  ELSE
    RAISE WARNING '⚠️ Migration 032 issues: count=%, DC=%, KY summaries=%', total_count, dc_exists, ky_has_summaries;
  END IF;
END $$;
