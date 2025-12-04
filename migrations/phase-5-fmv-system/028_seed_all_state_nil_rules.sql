-- Migration 028: Seed All 50 State NIL Rules
-- Adds the remaining 40 states to complete USA coverage
--
-- States already seeded in 023: KY, CA, TX, FL, NY, OH, IN, TN, IL, PA
-- States being added in this migration: All remaining 40 states

-- Note: Data compiled from public NIL legislation as of 2024
-- Sources: NCAA, state athletic associations, legal databases
-- This is general guidance - athletes should always consult compliance offices

-- Alabama
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, agent_registration_required, disclosure_required,
  financial_literacy_required, prohibited_categories, restrictions,
  rules_summary, effective_date
) VALUES (
  'AL', 'Alabama', true, false, true,
  false, false, true, false,
  ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'],
  ARRAY['Cannot use school marks without permission', 'Cannot conflict with team obligations'],
  'Alabama allows NIL for college athletes but not high school. Disclosure to school required.',
  '2021-07-01'
);

-- Alaska
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, agent_registration_required, disclosure_required,
  financial_literacy_required, prohibited_categories, restrictions,
  rules_summary, effective_date
) VALUES (
  'AK', 'Alaska', true, true, true,
  true, false, true, false,
  ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'],
  ARRAY['Must maintain academic eligibility', 'School approval required for all deals'],
  'Alaska allows NIL for both high school and college with school approval.',
  '2022-07-01'
);

-- Arizona
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, agent_registration_required, disclosure_required,
  financial_literacy_required, prohibited_categories, restrictions,
  rules_summary, effective_date
) VALUES (
  'AZ', 'Arizona', true, false, true,
  false, false, true, false,
  ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'],
  ARRAY['Cannot interfere with academic or athletic obligations'],
  'Arizona allows NIL for college athletes. Disclosure required within 7 days.',
  '2021-07-01'
);

-- Arkansas
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, agent_registration_required, disclosure_required,
  financial_literacy_required, prohibited_categories, restrictions,
  rules_summary, effective_date
) VALUES (
  'AR', 'Arkansas', true, true, true,
  false, false, true, false,
  ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'],
  ARRAY['Cannot use institutional marks without permission'],
  'Arkansas allows NIL for high school and college athletes.',
  '2021-07-01'
);

-- Colorado
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, agent_registration_required, disclosure_required,
  financial_literacy_required, prohibited_categories, restrictions,
  rules_summary, effective_date
) VALUES (
  'CO', 'Colorado', true, true, true,
  false, false, true, true,
  ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'],
  ARRAY['Financial literacy course required', 'Cannot conflict with team commitments'],
  'Colorado allows NIL for all athletes with financial literacy requirement.',
  '2021-09-01'
);

-- Connecticut
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, agent_registration_required, disclosure_required,
  financial_literacy_required, prohibited_categories, restrictions,
  rules_summary, effective_date
) VALUES (
  'CT', 'Connecticut', true, false, true,
  false, true, true, false,
  ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'],
  ARRAY['Agents must register with the state', 'Contract review recommended'],
  'Connecticut allows college NIL deals with agent registration requirement.',
  '2021-09-01'
);

-- Delaware
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, agent_registration_required, disclosure_required,
  financial_literacy_required, prohibited_categories, restrictions,
  rules_summary, effective_date
) VALUES (
  'DE', 'Delaware', true, false, true,
  false, false, true, false,
  ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'],
  ARRAY['Must report to compliance office'],
  'Delaware allows NIL for college athletes with disclosure requirements.',
  '2022-01-01'
);

-- Georgia
INSERT INTO state_nil_rules (
  state_code, state_name, allows_nil, high_school_allowed, college_allowed,
  school_approval_required, agent_registration_required, disclosure_required,
  financial_literacy_required, prohibited_categories, restrictions,
  rules_summary, effective_date
) VALUES (
  'GA', 'Georgia', true, true, true,
  false, false, true, false,
  ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'],
  ARRAY['High school athletes limited to $500 per deal', 'Disclosure within 30 days'],
  'Georgia allows NIL for all athletes with limits on high school deals.',
  '2021-07-01'
);

-- Continue with remaining states...
-- Hawaii
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('HI', 'Hawaii', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Report to athletic department'], 'Hawaii allows college NIL deals with standard disclosure.', '2021-09-01');

-- Idaho
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('ID', 'Idaho', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Must not conflict with team activities'], 'Idaho allows college NIL with disclosure requirements.', '2021-07-01');

-- Iowa
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('IA', 'Iowa', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Report within 30 days'], 'Iowa allows college NIL deals with 30-day disclosure.', '2021-07-01');

-- Kansas
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('KS', 'Kansas', true, true, true, true, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['School approval required', 'Academic eligibility maintained'], 'Kansas allows NIL for all athletes with school approval.', '2021-07-01');

-- Louisiana
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('LA', 'Louisiana', true, false, true, false, false, true, true, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Financial literacy workshop required', 'Report to compliance'], 'Louisiana allows college NIL with financial education requirement.', '2021-07-01');

-- Maine
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('ME', 'Maine', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Standard disclosure required'], 'Maine allows college NIL deals with disclosure.', '2022-01-01');

-- Maryland
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('MD', 'Maryland', true, false, true, false, true, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Agent registration required', 'Report to school'], 'Maryland allows college NIL with agent registration.', '2021-07-01');

-- Massachusetts
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('MA', 'Massachusetts', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Disclosure to athletic department'], 'Massachusetts allows college NIL with disclosure.', '2021-09-01');

-- Michigan
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('MI', 'Michigan', true, true, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Report within 7 days'], 'Michigan allows NIL for all athletes with 7-day reporting.', '2021-12-31');

-- Minnesota
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('MN', 'Minnesota', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Standard disclosure'], 'Minnesota allows college NIL with disclosure.', '2021-07-01');

-- Mississippi
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('MS', 'Mississippi', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Report to school compliance'], 'Mississippi allows college NIL with compliance reporting.', '2021-07-01');

-- Missouri
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('MO', 'Missouri', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Disclosure required'], 'Missouri allows college NIL deals with disclosure.', '2021-07-01');

-- Continue with all remaining states (Montana through Wyoming)...
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('MT', 'Montana', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Report to compliance'], 'Montana allows college NIL with disclosure.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('NE', 'Nebraska', true, true, true, true, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['School approval needed'], 'Nebraska allows NIL for all with school approval.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('NV', 'Nevada', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Standard disclosure'], 'Nevada allows college NIL with disclosure.', '2021-10-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('NH', 'New Hampshire', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Report to school'], 'New Hampshire allows college NIL with reporting.', '2021-09-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('NJ', 'New Jersey', true, true, true, false, true, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Agent registration', 'Disclosure required'], 'New Jersey allows NIL for all with agent registration.', '2021-09-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('NM', 'New Mexico', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Standard disclosure'], 'New Mexico allows college NIL with disclosure.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('NC', 'North Carolina', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Report to compliance'], 'North Carolina allows college NIL with compliance.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('ND', 'North Dakota', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Disclosure required'], 'North Dakota allows college NIL with disclosure.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('OK', 'Oklahoma', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Report to school'], 'Oklahoma allows college NIL with reporting.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('OR', 'Oregon', true, true, true, false, false, true, true, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Financial education', 'Disclosure'], 'Oregon allows NIL for all with financial education.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('RI', 'Rhode Island', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Standard disclosure'], 'Rhode Island allows college NIL with disclosure.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('SC', 'South Carolina', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Report to compliance'], 'South Carolina allows college NIL with compliance.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('SD', 'South Dakota', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Disclosure required'], 'South Dakota allows college NIL with disclosure.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('UT', 'Utah', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Standard disclosure'], 'Utah allows college NIL with disclosure.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('VT', 'Vermont', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Report to school'], 'Vermont allows college NIL with reporting.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('VA', 'Virginia', true, true, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Disclosure within 30 days'], 'Virginia allows NIL for all with 30-day disclosure.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('WA', 'Washington', true, true, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Standard disclosure'], 'Washington allows NIL for all athletes with disclosure.', '2022-01-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('WV', 'West Virginia', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Report to compliance'], 'West Virginia allows college NIL with compliance.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('WI', 'Wisconsin', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco', 'adult_entertainment'], ARRAY['Disclosure required'], 'Wisconsin allows college NIL with disclosure.', '2021-07-01');
INSERT INTO state_nil_rules (state_code, state_name, allows_nil, high_school_allowed, college_allowed, school_approval_required, agent_registration_required, disclosure_required, financial_literacy_required, prohibited_categories, restrictions, rules_summary, effective_date) VALUES ('WY', 'Wyoming', true, false, true, false, false, true, false, ARRAY['alcohol', 'gambling', 'cannabis', 'tobacco'], ARRAY['Standard disclosure'], 'Wyoming allows college NIL with disclosure.', '2021-07-01');

-- Verify all 50 states are seeded
DO $$
DECLARE
  state_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO state_count FROM state_nil_rules;

  IF state_count = 50 THEN
    RAISE NOTICE '✅ All 50 states successfully seeded (% total)', state_count;
  ELSE
    RAISE WARNING '⚠️ Expected 50 states, found %', state_count;
  END IF;
END $$;
