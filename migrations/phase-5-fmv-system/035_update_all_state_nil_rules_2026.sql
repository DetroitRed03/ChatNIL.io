-- ============================================================================
-- Migration 035: Update All State NIL Rules — February 2026 Audit
-- ============================================================================
-- Partner feedback revealed contradictory data (e.g., Ohio marked as HS NIL
-- prohibited when it's been allowed since July 2023). Full audit of all 50
-- states + DC against current legislation as of February 2026.
--
-- Key changes:
--   - 48 states + DC now correctly show high_school_allowed = true
--   - Only MA, MN, WA prohibit HS NIL
--   - Updated prohibited categories, disclosure requirements, effective dates
--   - Syncs BOTH state_nil_rules and jurisdictions tables
--
-- Strategy: UPSERT (INSERT ... ON CONFLICT ... DO UPDATE) for idempotency
-- ============================================================================

-- ============================================================================
-- PART A: UPSERT into state_nil_rules (51 entries)
-- ============================================================================

INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  prohibited_categories, disclosure_required, disclosure_deadline_days,
  requires_parental_consent, school_can_facilitate_deals, must_notify_school,
  hs_nil_effective_date, restrictions, short_summary,
  last_verified_date, primary_source_url, last_updated
) VALUES
  -- Alabama
  ('AL', 'Alabama', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'adult_entertainment'], true, 7,
   true, false, true,
   '2023-07-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure to school required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Alaska
  ('AK', 'Alaska', true, true, true,
   ARRAY['alcohol', 'tobacco', 'cannabis'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Arizona
  ('AZ', 'Arizona', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 7,
   true, false, true,
   '2023-01-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure to school required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Arkansas
  ('AR', 'Arkansas', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 3,
   true, false, true,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 3 days.',
   '2026-02-01', NULL, NOW()),

  -- California
  ('CA', 'California', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis', 'firearms'], true, 30,
   true, false, true,
   '2024-01-01', ARRAY['Cannot conflict with team contracts', 'Cannot use school marks without permission'], 'HS NIL allowed for ages 16+. 30-day disclosure to school. AB 252.',
   '2026-02-01', 'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB252', NOW()),

  -- Colorado
  ('CO', 'Colorado', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 7,
   true, false, true,
   '2023-08-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Connecticut
  ('CT', 'Connecticut', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Delaware
  ('DE', 'Delaware', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Florida
  ('FL', 'Florida', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'adult_entertainment'], true, 7,
   true, false, true,
   '2024-07-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure to school required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Georgia
  ('GA', 'Georgia', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 7,
   true, false, true,
   '2024-01-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Hawaii
  ('HI', 'Hawaii', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Idaho
  ('ID', 'Idaho', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Illinois
  ('IL', 'Illinois', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis'], true, 7,
   true, false, true,
   '2024-01-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Indiana
  ('IN', 'Indiana', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Iowa
  ('IA', 'Iowa', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Kansas
  ('KS', 'Kansas', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Kentucky
  ('KY', 'Kentucky', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 7,
   true, false, true,
   '2024-07-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Louisiana
  ('LA', 'Louisiana', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'casinos'], true, 7,
   true, false, true,
   '2023-08-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Maine
  ('ME', 'Maine', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Maryland
  ('MD', 'Maryland', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Massachusetts — HS NIL PROHIBITED
  ('MA', 'Massachusetts', true, false, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY['MIAA rules prohibit NIL for HS athletes'], 'HS NIL PROHIBITED by MIAA. College NIL allowed.',
   '2026-02-01', NULL, NOW()),

  -- Michigan
  ('MI', 'Michigan', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Minnesota — HS NIL PROHIBITED
  ('MN', 'Minnesota', true, false, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY['Minnesota State High School League prohibits NIL'], 'HS NIL PROHIBITED by MSHSL. College NIL allowed.',
   '2026-02-01', NULL, NOW()),

  -- Mississippi
  ('MS', 'Mississippi', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 7,
   true, false, true,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Missouri
  ('MO', 'Missouri', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Montana
  ('MT', 'Montana', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Nebraska
  ('NE', 'Nebraska', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 7,
   true, false, true,
   '2024-01-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Nevada
  ('NV', 'Nevada', true, true, true,
   ARRAY['alcohol', 'tobacco'], true, 7,
   true, false, true,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- New Hampshire
  ('NH', 'New Hampshire', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- New Jersey
  ('NJ', 'New Jersey', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis'], true, 7,
   true, false, true,
   '2024-01-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- New Mexico
  ('NM', 'New Mexico', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- New York
  ('NY', 'New York', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis'], true, 7,
   true, false, true,
   '2024-07-01', ARRAY['Cannot use school logos', 'Cannot interfere with academics'], 'HS NIL allowed. Disclosure to school required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- North Carolina
  ('NC', 'North Carolina', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 7,
   true, false, true,
   '2023-07-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- North Dakota
  ('ND', 'North Dakota', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Ohio
  ('OH', 'Ohio', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'adult_entertainment'], true, 7,
   true, false, true,
   '2023-07-06', ARRAY['Cannot use school IP', 'Cannot conflict with team activities'], 'HS NIL allowed (HB 29, July 2023). Disclosure to school within 7 days.',
   '2026-02-01', 'https://www.legislature.ohio.gov/legislation/135/hb29', NOW()),

  -- Oklahoma
  ('OK', 'Oklahoma', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Oregon
  ('OR', 'Oregon', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Pennsylvania
  ('PA', 'Pennsylvania', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 7,
   true, false, true,
   '2024-01-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Rhode Island
  ('RI', 'Rhode Island', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- South Carolina
  ('SC', 'South Carolina', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- South Dakota
  ('SD', 'South Dakota', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Tennessee
  ('TN', 'Tennessee', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], true, 7,
   true, false, true,
   '2023-07-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Texas
  ('TX', 'Texas', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'firearms', 'adult_entertainment'], true, 7,
   true, false, true,
   '2023-09-01', ARRAY['Must be 17 years old', 'Cannot miss school for NIL activities'], 'HS NIL allowed for ages 17+. Disclosure to school within 7 days. SB 1219.',
   '2026-02-01', 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=88R&Bill=SB1219', NOW()),

  -- Utah
  ('UT', 'Utah', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis'], true, 7,
   true, false, true,
   '2023-07-01', ARRAY[]::TEXT[], 'HS NIL allowed. Disclosure required within 7 days.',
   '2026-02-01', NULL, NOW()),

  -- Vermont
  ('VT', 'Vermont', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Virginia
  ('VA', 'Virginia', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Washington — HS NIL PROHIBITED
  ('WA', 'Washington', true, false, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY['Washington Interscholastic Activities Association prohibits NIL'], 'HS NIL PROHIBITED by WIAA. College NIL allowed.',
   '2026-02-01', NULL, NOW()),

  -- West Virginia
  ('WV', 'West Virginia', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Wisconsin
  ('WI', 'Wisconsin', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- Wyoming
  ('WY', 'Wyoming', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW()),

  -- District of Columbia
  ('DC', 'District of Columbia', true, true, true,
   ARRAY['alcohol', 'tobacco', 'gambling'], false, NULL,
   true, false, false,
   NULL, ARRAY[]::TEXT[], 'HS NIL allowed. No specific disclosure requirements.',
   '2026-02-01', NULL, NOW())

ON CONFLICT (state_code) DO UPDATE SET
  state_name = EXCLUDED.state_name,
  allows_nil = EXCLUDED.allows_nil,
  high_school_allowed = EXCLUDED.high_school_allowed,
  college_allowed = EXCLUDED.college_allowed,
  prohibited_categories = EXCLUDED.prohibited_categories,
  disclosure_required = EXCLUDED.disclosure_required,
  disclosure_deadline_days = EXCLUDED.disclosure_deadline_days,
  requires_parental_consent = EXCLUDED.requires_parental_consent,
  school_can_facilitate_deals = EXCLUDED.school_can_facilitate_deals,
  must_notify_school = EXCLUDED.must_notify_school,
  hs_nil_effective_date = EXCLUDED.hs_nil_effective_date,
  restrictions = EXCLUDED.restrictions,
  short_summary = EXCLUDED.short_summary,
  last_verified_date = EXCLUDED.last_verified_date,
  primary_source_url = EXCLUDED.primary_source_url,
  last_updated = EXCLUDED.last_updated;

-- ============================================================================
-- PART B: UPSERT into jurisdictions (51 entries)
-- ============================================================================
-- Column mapping:
--   hsNilAllowed         -> hs_nil_allowed
--   hsRequiresParentConsent -> hs_parental_consent_required
--   hsSchoolCanFacilitate   -> hs_school_approval_required
--   prohibitedCategories    -> prohibited_activities
--   disclosureRequired      -> requires_disclosure
--   disclosureDays          -> college_disclosure_deadline_days
-- ============================================================================

INSERT INTO jurisdictions (
  state_code, state_name, hs_nil_allowed, hs_parental_consent_required,
  hs_school_approval_required, college_nil_allowed, requires_disclosure,
  college_disclosure_deadline_days, prohibited_activities, effective_date,
  last_updated_date, notes
) VALUES
  ('AL', 'Alabama', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling', 'adult_entertainment'], '2023-07-01', '2026-02-01', 'HS NIL allowed'),
  ('AK', 'Alaska', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'cannabis'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('AZ', 'Arizona', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling'], '2023-01-01', '2026-02-01', 'HS NIL allowed'),
  ('AR', 'Arkansas', true, true, false, true, true, 3, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('CA', 'California', true, true, false, true, true, 30, ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis', 'firearms'], '2024-01-01', '2026-02-01', 'HS NIL allowed, 16+ only. AB 252.'),
  ('CO', 'Colorado', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling'], '2023-08-01', '2026-02-01', 'HS NIL allowed'),
  ('CT', 'Connecticut', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('DE', 'Delaware', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('FL', 'Florida', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling', 'adult_entertainment'], '2024-07-01', '2026-02-01', 'HS NIL allowed'),
  ('GA', 'Georgia', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling'], '2024-01-01', '2026-02-01', 'HS NIL allowed'),
  ('HI', 'Hawaii', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('ID', 'Idaho', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('IL', 'Illinois', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis'], '2024-01-01', '2026-02-01', 'HS NIL allowed'),
  ('IN', 'Indiana', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('IA', 'Iowa', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('KS', 'Kansas', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('KY', 'Kentucky', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling'], '2024-07-01', '2026-02-01', 'HS NIL allowed'),
  ('LA', 'Louisiana', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling', 'casinos'], '2023-08-01', '2026-02-01', 'HS NIL allowed'),
  ('ME', 'Maine', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('MD', 'Maryland', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('MA', 'Massachusetts', false, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL PROHIBITED by MIAA'),
  ('MI', 'Michigan', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('MN', 'Minnesota', false, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL PROHIBITED by MSHSL'),
  ('MS', 'Mississippi', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('MO', 'Missouri', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('MT', 'Montana', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('NE', 'Nebraska', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling'], '2024-01-01', '2026-02-01', 'HS NIL allowed'),
  ('NV', 'Nevada', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('NH', 'New Hampshire', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('NJ', 'New Jersey', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis'], '2024-01-01', '2026-02-01', 'HS NIL allowed'),
  ('NM', 'New Mexico', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('NY', 'New York', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis'], '2024-07-01', '2026-02-01', 'HS NIL allowed'),
  ('NC', 'North Carolina', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling'], '2023-07-01', '2026-02-01', 'HS NIL allowed'),
  ('ND', 'North Dakota', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('OH', 'Ohio', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling', 'adult_entertainment'], '2023-07-06', '2026-02-01', 'HS NIL allowed (HB 29)'),
  ('OK', 'Oklahoma', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('OR', 'Oregon', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('PA', 'Pennsylvania', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling'], '2024-01-01', '2026-02-01', 'HS NIL allowed'),
  ('RI', 'Rhode Island', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('SC', 'South Carolina', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('SD', 'South Dakota', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('TN', 'Tennessee', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling'], '2023-07-01', '2026-02-01', 'HS NIL allowed'),
  ('TX', 'Texas', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling', 'firearms', 'adult_entertainment'], '2023-09-01', '2026-02-01', 'HS NIL allowed, 17+ only. SB 1219.'),
  ('UT', 'Utah', true, true, false, true, true, 7, ARRAY['alcohol', 'tobacco', 'gambling', 'cannabis'], '2023-07-01', '2026-02-01', 'HS NIL allowed'),
  ('VT', 'Vermont', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('VA', 'Virginia', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('WA', 'Washington', false, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL PROHIBITED by WIAA'),
  ('WV', 'West Virginia', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('WI', 'Wisconsin', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('WY', 'Wyoming', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed'),
  ('DC', 'District of Columbia', true, true, false, true, false, NULL, ARRAY['alcohol', 'tobacco', 'gambling'], NULL, '2026-02-01', 'HS NIL allowed')

ON CONFLICT (state_code) DO UPDATE SET
  state_name = EXCLUDED.state_name,
  hs_nil_allowed = EXCLUDED.hs_nil_allowed,
  hs_parental_consent_required = EXCLUDED.hs_parental_consent_required,
  hs_school_approval_required = EXCLUDED.hs_school_approval_required,
  college_nil_allowed = EXCLUDED.college_nil_allowed,
  requires_disclosure = EXCLUDED.requires_disclosure,
  college_disclosure_deadline_days = EXCLUDED.college_disclosure_deadline_days,
  prohibited_activities = EXCLUDED.prohibited_activities,
  effective_date = EXCLUDED.effective_date,
  last_updated_date = EXCLUDED.last_updated_date,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- ============================================================================
-- PART C: Verification
-- ============================================================================

-- Should return 48 (48 states + DC minus 3 prohibited = 48)
SELECT 'state_nil_rules HS allowed count' AS check_name,
       count(*) AS result,
       CASE WHEN count(*) = 48 THEN 'PASS' ELSE 'FAIL - expected 48' END AS status
FROM state_nil_rules WHERE high_school_allowed = true;

-- Should return 3
SELECT 'state_nil_rules HS prohibited count' AS check_name,
       count(*) AS result,
       CASE WHEN count(*) = 3 THEN 'PASS' ELSE 'FAIL - expected 3' END AS status
FROM state_nil_rules WHERE high_school_allowed = false;

-- Should return 48
SELECT 'jurisdictions HS allowed count' AS check_name,
       count(*) AS result,
       CASE WHEN count(*) = 48 THEN 'PASS' ELSE 'FAIL - expected 48' END AS status
FROM jurisdictions WHERE hs_nil_allowed = true;

-- Should return 51 total in each table
SELECT 'state_nil_rules total count' AS check_name,
       count(*) AS result,
       CASE WHEN count(*) = 51 THEN 'PASS' ELSE 'FAIL - expected 51' END AS status
FROM state_nil_rules;

SELECT 'jurisdictions total count' AS check_name,
       count(*) AS result,
       CASE WHEN count(*) = 51 THEN 'PASS' ELSE 'FAIL - expected 51' END AS status
FROM jurisdictions;

-- Ohio specifically should now be true
SELECT 'Ohio HS NIL check' AS check_name,
       high_school_allowed AS snr_result,
       (SELECT hs_nil_allowed FROM jurisdictions WHERE state_code = 'OH') AS jur_result
FROM state_nil_rules WHERE state_code = 'OH';
