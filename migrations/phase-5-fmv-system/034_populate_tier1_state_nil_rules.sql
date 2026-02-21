-- ============================================================================
-- Migration 034: Populate Tier 1 States with Researched NIL Rules
-- ============================================================================
-- Populates TX, CA, FL, GA, TN with real, researched NIL rules data.
-- Kentucky was already fully populated in migration 032.
--
-- KEY CORRECTIONS from prior migrations:
--   1. Texas: Flip high_school_allowed to TRUE (limited but technically allowed)
--   2. Georgia: Remove $500 compensation cap (not in current 2024 GHSA policy)
--   3. Florida: Updated effective date to July 2024 (FHSAA Bylaw 9.9)
--
-- SCHEMA NOTES:
--   - prohibited_categories is TEXT[] (not JSONB) — use ARRAY['...']
--   - summary_* columns are JSONB — use '["..."]'::jsonb
--   - No hs_nil_status column exists — use short_summary to convey "limited"
-- ============================================================================


-- ============================================================================
-- 1. TEXAS (TX) — LIMITED
-- ============================================================================
-- Texas technically allows HS NIL but with severe restrictions:
--   - Only athletes 17+ can sign
--   - Only with colleges/universities (not brands)
--   - Payment deferred until college enrollment
-- Source: UIL, HB 126 (signed June 2025)
-- ============================================================================

UPDATE state_nil_rules SET
  -- Flip to true: HS NIL is technically allowed (with severe restrictions)
  high_school_allowed = true,

  -- Athletic association
  athletic_association_name = 'University Interscholastic League',
  athletic_association_url = 'https://uiltexas.org',

  -- Effective date (HB 126 signed June 2025)
  hs_nil_effective_date = '2025-06-15',

  -- Permission flags (very limited)
  can_earn_money = true,
  can_use_agent = true,
  can_sign_contracts = true,   -- Only if 17+, only with colleges
  can_use_school_marks = false,
  can_mention_school = false,
  can_wear_uniform_in_content = false,

  -- Parental requirements
  requires_parental_consent = true,
  min_age_without_consent = 17, -- Key restriction: must be 17+
  parent_must_sign_contracts = true,

  -- School involvement
  school_can_facilitate_deals = false,
  must_notify_school = true,
  must_notify_athletic_association = false,
  disclosure_deadline_days = NULL,
  requires_pre_approval = false,

  -- Restriction booleans
  cannot_conflict_with_school_sponsors = true,
  cannot_use_during_school_hours = true,
  cannot_interfere_with_academics = true,
  cannot_promote_during_games = true,

  -- Compensation limits
  has_compensation_cap = false,
  compensation_cap_amount = NULL,
  compensation_cap_period = NULL,

  -- Prohibited categories (TEXT[])
  prohibited_categories = ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis', 'adult_content', 'vaping'],

  -- Restrictions (TEXT[])
  restrictions = ARRAY[
    'Only athletes 17 or older may sign NIL agreements',
    'NIL agreements may only be with colleges/universities',
    'Payment cannot be received until enrolled in college',
    'Family members may not sign NIL agreements until athlete exhausts UIL eligibility',
    'Cannot promote products related to UIL sports or contests',
    'All contracts must be disclosed to institution before signing'
  ],

  -- Dashboard summaries (JSONB)
  summary_can_do = '["Athletes 17+ can sign NIL agreements with colleges/universities", "Can hire a licensed agent or representative", "Can earn money from personal brand outside of school"]'::jsonb,

  summary_cannot_do = '["Athletes under 17 cannot sign any NIL contracts", "Cannot sign deals with brands or businesses (colleges only)", "Cannot use school name, logos, mascot, or uniform", "Cannot do NIL activities during school hours or at games", "Family members cannot sign NIL agreements on your behalf"]'::jsonb,

  summary_must_do = '["Must be 17 or older to sign any NIL contract", "Must have parental consent", "Must disclose all contracts to your school before signing"]'::jsonb,

  summary_warnings = '["Most high school athletes CANNOT participate due to the 17+ age requirement and college-only restriction", "UIL rules are very different from college NIL rules — do not assume the same rules apply", "Violations can result in loss of UIL eligibility", "Payment is deferred until you officially enroll in college"]'::jsonb,

  -- Source/verification
  primary_source_url = 'https://www.uiltexas.org/policy/2024-25-policy-info/nil-information',
  secondary_sources = '["https://capitol.texas.gov/tlodocs/87R/billtext/html/SB01385I.htm"]'::jsonb,
  last_verified_date = '2025-02-18',
  verified_by = 'ChatNIL Research Team',

  -- Legal
  relevant_legislation = 'HB 126 - Texas High School NIL (signed June 2025)',
  legislation_url = 'https://capitol.texas.gov/',

  -- Summaries
  short_summary = 'Texas has VERY LIMITED high school NIL. Only athletes 17+ can sign agreements, and only with colleges — not brands or businesses. Most HS athletes effectively cannot participate.',
  detailed_summary = 'The UIL (University Interscholastic League) permits Texas high school athletes to participate in NIL activities, but with significant restrictions. Key limitations: (1) Athletes must be 17 or older to sign any contract. (2) NIL agreements can only be with colleges/universities, not with brands, businesses, or other third parties. (3) Payment cannot be received until the athlete officially enrolls in college. (4) Athletes cannot use school names, logos, mascots, or wear uniforms in NIL content. (5) Family members cannot sign NIL agreements until the athlete exhausts UIL eligibility. (6) Athletes can hire licensed agents. These restrictions mean that most Texas high school athletes — particularly those under 17 or seeking brand deals — cannot realistically participate in NIL.',

  -- Update rules_summary too (legacy field)
  rules_summary = 'Texas allows limited NIL for HS athletes 17+ (college agreements only). School approval required. Prohibited: alcohol, gambling, cannabis, tobacco, vaping.',

  updated_at = NOW()
WHERE state_code = 'TX';


-- ============================================================================
-- 2. CALIFORNIA (CA) — ALLOWED
-- ============================================================================
-- California was the first state to pass NIL legislation (SB 206, 2019).
-- HS athletes can earn from NIL with parental consent.
-- CIF rules: no school logos/uniforms, disclose to athletic director.
-- Source: CIF, SB 206 (Fair Pay to Play Act)
-- ============================================================================

UPDATE state_nil_rules SET
  -- Athletic association
  athletic_association_name = 'California Interscholastic Federation',
  athletic_association_url = 'https://cifstate.org',

  -- Effective date (SB 26 accelerated to Sept 2021)
  hs_nil_effective_date = '2021-09-01',

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

  -- Prohibited categories (TEXT[]) — no state-level mandate; schools set own
  prohibited_categories = ARRAY['alcohol', 'gambling', 'cannabis', 'adult_content', 'tobacco', 'vaping'],

  -- Restrictions (TEXT[])
  restrictions = ARRAY[
    'Cannot use school logos, uniforms, team names, or identifiers in NIL content',
    'Athletic performance awards limited to $250 regular season / $500 postseason',
    'Cannot accept payment for coaching CIF teams',
    'Nonprofit appearances require Board of Trustees approval',
    'Must disclose all NIL activities to athletic director'
  ],

  -- Dashboard summaries (JSONB)
  summary_can_do = '["Earn money from endorsements, sponsorships, and social media", "Sign deals with brands and businesses", "Hire an agent or representative", "Appear in local and national advertisements", "Monetize autograph signings and personal appearances"]'::jsonb,

  summary_cannot_do = '["Use school logos, mascots, uniforms, or team names in NIL content", "Wear your school uniform in paid content or advertisements", "Have your school arrange or facilitate deals for you", "Accept payment for coaching CIF teams"]'::jsonb,

  summary_must_do = '["Get parent/guardian consent for all NIL deals (if under 18)", "Disclose all NIL activities to your school athletic director", "Maintain academic eligibility", "Keep records of all NIL income for tax purposes"]'::jsonb,

  summary_warnings = '["Individual schools may have additional restrictions beyond state rules", "Deals cannot conflict with existing school sponsorship agreements", "Athletic performance awards are capped ($250 regular / $500 postseason) — this is separate from NIL earnings", "Must maintain CIF amateur eligibility"]'::jsonb,

  -- Source/verification
  primary_source_url = 'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201920200SB206',
  secondary_sources = '["https://www.cifstate.org/governance/constitution/index", "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202120220SB26"]'::jsonb,
  last_verified_date = '2025-02-18',
  verified_by = 'ChatNIL Research Team',

  -- Legal
  relevant_legislation = 'SB 206 - Fair Pay to Play Act (2019), SB 26 (2021 accelerator)',
  legislation_url = 'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201920200SB206',

  -- Summaries
  short_summary = 'California was the first state to allow high school NIL. Athletes can earn from endorsements, social media, and appearances with parental consent. Cannot use school logos or uniforms.',
  detailed_summary = 'California pioneered high school NIL with the Fair Pay to Play Act (SB 206, 2019), the first state NIL law in the nation. Under CIF rules, student-athletes can sign endorsement deals, appear in advertisements, monetize social media, and participate in autograph signings. Key requirements: parental consent for minors, disclosure to the school athletic director, and strict separation between NIL activities and school athletics. Athletes cannot use school intellectual property (logos, mascots, uniforms, team names) in any NIL content. California does not mandate specific prohibited categories at the state level, but individual schools may restrict deals involving alcohol, tobacco, gambling, and other categories. There is no cap on NIL earnings, though athletic performance awards are separately capped at $250 (regular season) and $500 (postseason).',

  -- Update legacy field
  rules_summary = 'California allows NIL for HS and college athletes. First state to pass NIL legislation (SB 206). No school logos in NIL content. Parental consent required.',

  updated_at = NOW()
WHERE state_code = 'CA';


-- ============================================================================
-- 3. FLORIDA (FL) — ALLOWED
-- ============================================================================
-- Florida approved HS NIL in July 2024 (FHSAA Bylaw 9.9).
-- Key: 7-day disclosure deadline, parents negotiate independently.
-- Source: FHSAA, State Board of Education ratification
-- ============================================================================

UPDATE state_nil_rules SET
  -- Athletic association
  athletic_association_name = 'Florida High School Athletic Association',
  athletic_association_url = 'https://fhsaa.com',

  -- Effective date (ratified July 24, 2024)
  hs_nil_effective_date = '2024-07-24',

  -- Permission flags
  can_earn_money = true,
  can_use_agent = true,
  can_sign_contracts = true,
  can_use_school_marks = false, -- Unless written school authorization
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
  disclosure_deadline_days = 7, -- Florida has a strict 7-day requirement
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

  -- Prohibited categories (TEXT[])
  prohibited_categories = ARRAY['alcohol', 'tobacco', 'cannabis', 'gambling', 'firearms', 'adult_content', 'mlm'],

  -- Restrictions (TEXT[])
  restrictions = ARRAY[
    'Athletes and parents must negotiate NIL independently (no school involvement)',
    'Cannot use school uniforms, equipment, logos without written school authorization',
    'NIL cannot be used to recruit players or induce transfers',
    'In-season transfers cannot secure NIL agreements that same season',
    'No multi-level marketing schemes'
  ],

  -- Dashboard summaries (JSONB)
  summary_can_do = '["Earn money from endorsements, sponsorships, and social media", "Sign brand deals and appear in advertisements", "Monetize personal appearances and autograph signings", "Hire an agent or representative", "Create sponsored content on social media"]'::jsonb,

  summary_cannot_do = '["Use school uniforms, equipment, or logos without written school permission", "Have your school arrange, facilitate, or negotiate deals", "Accept NIL deals from firearms, alcohol, tobacco, cannabis, or gambling companies", "Use NIL as a recruiting incentive to transfer schools", "Participate in multi-level marketing schemes"]'::jsonb,

  summary_must_do = '["Get parent/guardian consent for all NIL deals", "Notify your school within 7 days of signing any deal", "Negotiate all deals independently with your family (not through school)", "Maintain academic and athletic eligibility"]'::jsonb,

  summary_warnings = '["The 7-day disclosure deadline to your school is strictly enforced", "Deals cannot conflict with existing school sponsorship agreements", "In-season transfers cannot sign NIL deals until the following season", "Florida has one of the broadest prohibited category lists — check before signing"]'::jsonb,

  -- Source/verification
  primary_source_url = 'https://fhsaa.com/sports/2024/8/12/ABOUT_NILResources.aspx',
  secondary_sources = '["https://fhsaa.com/news/2024/6/4/about-us-fhsaa-approves-nil-pending-state-board-of-education-ratification-on-july-24th.aspx", "https://www.flsenate.gov/Session/Bill/2021/1086"]'::jsonb,
  last_verified_date = '2025-02-18',
  verified_by = 'ChatNIL Research Team',

  -- Legal
  relevant_legislation = 'FHSAA Bylaw 9.9 (Amateurism and NIL), SB 1086',
  legislation_url = 'https://www.flsenate.gov/Session/Bill/2021/1086',

  -- Summaries
  short_summary = 'Florida allows high school athletes to earn NIL income. Athletes must notify their school within 7 days of signing any deal. Parents must negotiate independently.',
  detailed_summary = 'Florida approved high school NIL in July 2024 when the State Board of Education ratified FHSAA Bylaw 9.9. Athletes can sign endorsement deals, work with agents, and monetize their personal brand. A critical requirement is the 7-day notification period — athletes must inform their school within 7 days of signing any NIL agreement. Parents must negotiate deals independently, without school involvement. Athletes cannot use school intellectual property without written authorization. Florida has one of the broader lists of prohibited categories, including alcohol, tobacco, cannabis, gambling, firearms, adult content, and MLM schemes. There is no cap on NIL earnings.',

  -- Update legacy field
  rules_summary = 'Florida allows NIL for HS and college athletes. 7-day school notification required. Parents negotiate independently. Prohibited: alcohol, gambling, cannabis, tobacco, firearms, adult content, MLM.',

  updated_at = NOW()
WHERE state_code = 'FL';


-- ============================================================================
-- 4. GEORGIA (GA) — ALLOWED
-- ============================================================================
-- GHSA updated NIL policy in July 2024 (Board of Trustees, 14-0 vote).
-- KEY CORRECTION: Removing $500/deal compensation cap (not in current policy).
-- No agents allowed. 7-day disclosure to school AND GHSA.
-- No NIL collectives or NIL clubs.
-- Source: GHSA Constitution Appendix N
-- ============================================================================

UPDATE state_nil_rules SET
  -- Athletic association
  athletic_association_name = 'Georgia High School Association',
  athletic_association_url = 'https://ghsa.net',

  -- Effective date (Board of Trustees vote July 2024)
  hs_nil_effective_date = '2024-07-01',

  -- Permission flags
  can_earn_money = true,
  can_use_agent = false,   -- GHSA prohibits agent use
  can_sign_contracts = true,
  can_use_school_marks = false,
  can_mention_school = false,  -- Cannot use school colors either
  can_wear_uniform_in_content = false,

  -- Parental requirements
  requires_parental_consent = true,
  min_age_without_consent = 18,
  parent_must_sign_contracts = true,

  -- School involvement
  school_can_facilitate_deals = false,
  must_notify_school = true,
  must_notify_athletic_association = true, -- Must notify GHSA too
  disclosure_deadline_days = 7, -- 7 calendar days
  requires_pre_approval = false,

  -- Restriction booleans
  cannot_conflict_with_school_sponsors = true,
  cannot_use_during_school_hours = true,
  cannot_interfere_with_academics = true,
  cannot_promote_during_games = true,

  -- CORRECTION: Remove the $500 compensation cap (not in 2024 GHSA policy)
  has_compensation_cap = false,
  compensation_cap_amount = NULL,
  compensation_cap_period = NULL,

  -- Prohibited categories (TEXT[])
  prohibited_categories = ARRAY['alcohol', 'tobacco', 'cannabis', 'gambling', 'adult_content', 'controlled_substances'],

  -- Restrictions (TEXT[]) — Replaces old array that had outdated $500 cap
  restrictions = ARRAY[
    'Cannot use agents or representatives — must negotiate directly or with parents',
    'No membership in or compensation from NIL Collectives or NIL Clubs',
    'Cannot use school logos, names, uniforms, mascots, or school colors',
    'Cannot use school facilities for NIL activities',
    'Cannot wear school apparel or equipment during NIL activities',
    'Compensation cannot be contingent on specific athletic performance',
    'NIL cannot be offered as an incentive to enroll at or transfer to a school',
    'Must notify school Principal or Athletic Director within 7 calendar days'
  ],

  -- Dashboard summaries (JSONB)
  summary_can_do = '["Earn money from endorsements, social media, and personal appearances", "Sign individual NIL deals with brands and businesses", "Monetize your personal brand and social media presence", "Create sponsored content and appear in advertisements"]'::jsonb,

  summary_cannot_do = '["Use an agent or representative (must handle deals yourself or with parents)", "Join or receive money from NIL Collectives or NIL Clubs", "Use school logos, names, mascots, uniforms, or school colors in NIL content", "Use school facilities or wear school apparel for NIL activities", "Accept deals contingent on athletic performance or as an enrollment incentive"]'::jsonb,

  summary_must_do = '["Get parent/guardian consent for all NIL deals", "Notify your school Principal or Athletic Director within 7 days of signing", "Also notify GHSA of all NIL agreements", "Maintain academic and athletic eligibility"]'::jsonb,

  summary_warnings = '["You CANNOT use an agent — this is a key Georgia restriction", "Must notify BOTH your school AND GHSA within 7 days", "NIL Collectives and organized NIL clubs are completely prohibited", "Violations can result in fines, forfeiture of contests, probation, or postseason ineligibility", "Rules were updated in July 2024 — verify current GHSA policy before signing"]'::jsonb,

  -- Source/verification
  primary_source_url = 'https://www.ghsa.net/nil-law-it-pertains-high-school-athletes',
  secondary_sources = '["https://www.ghsa.net/constitution-section-2024-2025-appendix-n-guidelines-regarding-name-image-and-likeness"]'::jsonb,
  last_verified_date = '2025-02-18',
  verified_by = 'ChatNIL Research Team',

  -- Legal
  relevant_legislation = 'GHSA Constitution Appendix N - Guidelines Regarding Name, Image and Likeness',
  legislation_url = 'https://www.ghsa.net/constitution-section-2024-2025-appendix-n-guidelines-regarding-name-image-and-likeness',

  -- Summaries
  short_summary = 'Georgia allows high school NIL but prohibits using agents and NIL collectives. Athletes must notify both their school and GHSA within 7 days of signing any deal.',
  detailed_summary = 'The Georgia High School Association (GHSA) updated their NIL policy in July 2024 with a unanimous Board of Trustees vote. Athletes can earn from endorsements, social media, and personal appearances. Key restrictions that set Georgia apart: (1) Athletes CANNOT use agents or representatives — all deals must be negotiated by the athlete or their parents. (2) NIL Collectives and organized NIL Clubs are completely prohibited. (3) Athletes must notify both their school and GHSA within 7 calendar days of entering any agreement. (4) Athletes cannot use any school identifiers including logos, mascots, uniforms, school colors, or school facilities. (5) Compensation cannot be tied to athletic performance or used as an enrollment incentive. Enforcement is strict — violations can result in fines, forfeiture of contests, probation, or loss of postseason eligibility.',

  -- Update legacy field
  rules_summary = 'Georgia allows HS NIL with no agents, no collectives. 7-day notification to school and GHSA. Cannot use school marks. Prohibited: alcohol, tobacco, cannabis, gambling.',

  updated_at = NOW()
WHERE state_code = 'GA';


-- ============================================================================
-- 5. TENNESSEE (TN) — ALLOWED
-- ============================================================================
-- TSSAA approved HS NIL in December 2022 (unanimous vote).
-- Key: Cannot use school marks or reference TSSAA accolades.
-- Enforcement: 1st = warning; 2nd = 12-month ineligibility.
-- Source: TSSAA NIL page
-- ============================================================================

UPDATE state_nil_rules SET
  -- Athletic association
  athletic_association_name = 'Tennessee Secondary School Athletic Association',
  athletic_association_url = 'https://tssaa.org',

  -- Effective date (December 2022 approval)
  hs_nil_effective_date = '2023-01-01',

  -- Permission flags
  can_earn_money = true,
  can_use_agent = true,
  can_sign_contracts = true,
  can_use_school_marks = false,
  can_mention_school = false,  -- Cannot reference school in paid content
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
  cannot_use_during_school_hours = true,
  cannot_interfere_with_academics = true,
  cannot_promote_during_games = true,

  -- Compensation limits
  has_compensation_cap = false,
  compensation_cap_amount = NULL,
  compensation_cap_period = NULL,

  -- Prohibited categories (TEXT[])
  prohibited_categories = ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis', 'adult_content'],

  -- Restrictions (TEXT[])
  restrictions = ARRAY[
    'Cannot use school uniforms, logos, team names, or school colors in compensated content',
    'Cannot reference TSSAA accolades, championships, or records in paid activities',
    'Content cannot suggest school endorsement or sponsorship',
    'Booster clubs cannot make NIL payments to students',
    'Schools and coaches cannot facilitate, coordinate, promote, or negotiate NIL agreements',
    'Schools can only provide generic educational materials about NIL considerations'
  ],

  -- Dashboard summaries (JSONB)
  summary_can_do = '["Earn money from endorsements, social media, and personal appearances", "Sign brand deals and sponsorship agreements", "Hire an agent or representative", "Get paid for instructional services (tutoring, coaching lessons)", "Monetize non-school-related content on social media"]'::jsonb,

  summary_cannot_do = '["Use school uniforms, logos, team names, or school colors in paid content", "Reference TSSAA accolades, championships, or records in NIL activities", "Create content that suggests school endorsement or sponsorship", "Accept NIL payments from booster clubs", "Have coaches or school staff help arrange deals"]'::jsonb,

  summary_must_do = '["Get parent/guardian consent for all NIL deals", "Notify your school of NIL activities", "Maintain academic and athletic eligibility", "Keep NIL activities completely separate from school athletics"]'::jsonb,

  summary_warnings = '["1st violation: formal warning + must return compensation", "2nd violation: 12-month athletic ineligibility", "3rd violation: Executive Director determines additional penalties", "Schools can ONLY provide generic educational materials — they cannot help with deals", "Booster club NIL payments are prohibited"]'::jsonb,

  -- Source/verification
  primary_source_url = 'https://tssaa.org/name-image-likeness',
  secondary_sources = '["https://wapp.capitol.tn.gov/apps/BillInfo/Default.aspx?BillNumber=SB1628"]'::jsonb,
  last_verified_date = '2025-02-18',
  verified_by = 'ChatNIL Research Team',

  -- Legal
  relevant_legislation = 'Tennessee NIL Act (SB 1628), TSSAA By-Law Amendments (December 2022)',
  legislation_url = 'https://wapp.capitol.tn.gov/apps/BillInfo/Default.aspx?BillNumber=SB1628',

  -- Summaries
  short_summary = 'Tennessee allows high school athletes to earn NIL income. Cannot use school marks or reference TSSAA accolades. Violations have escalating penalties up to 12-month ineligibility.',
  detailed_summary = 'The TSSAA approved NIL rights for high school athletes in December 2022 with a unanimous Legislative Council vote. Athletes can sign endorsement deals, work with agents, get paid for instructional services, and monetize personal social media. Key restrictions: athletes cannot use school uniforms, logos, team names, or school colors in any paid content, and cannot reference TSSAA accolades or championships. Booster clubs are explicitly prohibited from making NIL payments. Schools and coaches cannot facilitate, coordinate, or negotiate deals — they can only provide generic educational materials. Tennessee has a tiered enforcement system: first violation results in a warning and return of compensation; second violation triggers 12-month athletic ineligibility; third violation is determined by the TSSAA Executive Director.',

  -- Update legacy field
  rules_summary = 'Tennessee allows NIL for HS and college athletes. No school marks or TSSAA accolades in paid content. Escalating penalties for violations.',

  updated_at = NOW()
WHERE state_code = 'TN';


-- ============================================================================
-- 6. VERIFICATION
-- ============================================================================
DO $$
DECLARE
  updated_count INTEGER;
  tx_hs BOOLEAN;
  ga_cap BOOLEAN;
BEGIN
  -- Count Tier 1 states with detailed summaries
  SELECT COUNT(*) INTO updated_count
  FROM state_nil_rules
  WHERE state_code IN ('TX', 'CA', 'FL', 'GA', 'TN')
    AND detailed_summary IS NOT NULL
    AND detailed_summary != '';

  -- Verify Texas is now high_school_allowed = true
  SELECT high_school_allowed INTO tx_hs
  FROM state_nil_rules WHERE state_code = 'TX';

  -- Verify Georgia has NO compensation cap
  SELECT has_compensation_cap INTO ga_cap
  FROM state_nil_rules WHERE state_code = 'GA';

  IF updated_count = 5 AND tx_hs = true AND ga_cap = false THEN
    RAISE NOTICE '✅ Migration 034 complete: % Tier 1 states updated, TX HS=%, GA cap=%',
      updated_count, tx_hs, ga_cap;
  ELSE
    RAISE WARNING '⚠️ Migration 034 issues: updated=%, TX HS=%, GA cap=%',
      updated_count, tx_hs, ga_cap;
  END IF;
END $$;
