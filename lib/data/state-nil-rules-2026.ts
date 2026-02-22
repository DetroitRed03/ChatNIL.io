/**
 * State NIL Rules — All 50 States + DC (February 2026)
 *
 * Canonical source of truth for state-by-state NIL regulations.
 * Used as:
 *   1. Static fallback when DB queries fail
 *   2. Source data for SQL migrations
 *   3. Quick reference for prohibited states
 *
 * Sources: State legislation, athletic association policies, legal databases
 * Last audited: February 2026
 *
 * DISCLAIMER: This information is for educational purposes only and does not
 * constitute legal advice. NIL rules change frequently. Always consult your
 * school's compliance office and/or a qualified attorney.
 */

export interface StateNILRule {
  stateCode: string;
  stateName: string;

  // High School NIL
  hsNilAllowed: boolean;
  hsMinimumAge?: number;
  hsRequiresParentConsent: boolean;
  hsSchoolCanFacilitate: boolean;
  hsRestrictions?: string[];
  hsEffectiveDate?: string;

  // College NIL
  collegeNilAllowed: boolean;
  collegeRestrictions?: string[];

  // Disclosure requirements
  disclosureRequired: boolean;
  disclosureDays?: number;
  disclosureTo?: string;

  // Prohibited categories
  prohibitedCategories: string[];

  // Metadata
  lastUpdated: string;
  sourceUrl?: string;
}

export const STATE_NIL_RULES_2026: StateNILRule[] = [
  // ALABAMA
  {
    stateCode: 'AL',
    stateName: 'Alabama',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2023-07-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    disclosureTo: 'school',
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'adult_entertainment'],
    lastUpdated: '2026-02-01',
  },

  // ALASKA
  {
    stateCode: 'AK',
    stateName: 'Alaska',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'cannabis'],
    lastUpdated: '2026-02-01',
  },

  // ARIZONA
  {
    stateCode: 'AZ',
    stateName: 'Arizona',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2023-01-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    disclosureTo: 'school',
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // ARKANSAS
  {
    stateCode: 'AR',
    stateName: 'Arkansas',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 3,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // CALIFORNIA
  {
    stateCode: 'CA',
    stateName: 'California',
    hsNilAllowed: true,
    hsMinimumAge: 16,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2024-01-01',
    hsRestrictions: ['Cannot conflict with team contracts', 'Cannot use school marks without permission'],
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 30,
    disclosureTo: 'school',
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'cannabis', 'firearms'],
    lastUpdated: '2026-02-01',
    sourceUrl: 'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB252',
  },

  // COLORADO
  {
    stateCode: 'CO',
    stateName: 'Colorado',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2023-08-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // CONNECTICUT
  {
    stateCode: 'CT',
    stateName: 'Connecticut',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // DELAWARE
  {
    stateCode: 'DE',
    stateName: 'Delaware',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // FLORIDA
  {
    stateCode: 'FL',
    stateName: 'Florida',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2024-07-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    disclosureTo: 'school',
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'adult_entertainment'],
    lastUpdated: '2026-02-01',
  },

  // GEORGIA
  {
    stateCode: 'GA',
    stateName: 'Georgia',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2024-01-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // HAWAII
  {
    stateCode: 'HI',
    stateName: 'Hawaii',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // IDAHO
  {
    stateCode: 'ID',
    stateName: 'Idaho',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // ILLINOIS
  {
    stateCode: 'IL',
    stateName: 'Illinois',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2024-01-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'cannabis'],
    lastUpdated: '2026-02-01',
  },

  // INDIANA
  {
    stateCode: 'IN',
    stateName: 'Indiana',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // IOWA
  {
    stateCode: 'IA',
    stateName: 'Iowa',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // KANSAS
  {
    stateCode: 'KS',
    stateName: 'Kansas',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // KENTUCKY
  {
    stateCode: 'KY',
    stateName: 'Kentucky',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2024-07-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // LOUISIANA
  {
    stateCode: 'LA',
    stateName: 'Louisiana',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2023-08-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'casinos'],
    lastUpdated: '2026-02-01',
  },

  // MAINE
  {
    stateCode: 'ME',
    stateName: 'Maine',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // MARYLAND
  {
    stateCode: 'MD',
    stateName: 'Maryland',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // MASSACHUSETTS — HS NIL PROHIBITED
  {
    stateCode: 'MA',
    stateName: 'Massachusetts',
    hsNilAllowed: false,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsRestrictions: ['MIAA rules prohibit NIL for HS athletes'],
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // MICHIGAN
  {
    stateCode: 'MI',
    stateName: 'Michigan',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // MINNESOTA — HS NIL PROHIBITED
  {
    stateCode: 'MN',
    stateName: 'Minnesota',
    hsNilAllowed: false,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsRestrictions: ['Minnesota State High School League prohibits NIL'],
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // MISSISSIPPI
  {
    stateCode: 'MS',
    stateName: 'Mississippi',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // MISSOURI
  {
    stateCode: 'MO',
    stateName: 'Missouri',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // MONTANA
  {
    stateCode: 'MT',
    stateName: 'Montana',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // NEBRASKA
  {
    stateCode: 'NE',
    stateName: 'Nebraska',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2024-01-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // NEVADA
  {
    stateCode: 'NV',
    stateName: 'Nevada',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco'],
    lastUpdated: '2026-02-01',
  },

  // NEW HAMPSHIRE
  {
    stateCode: 'NH',
    stateName: 'New Hampshire',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // NEW JERSEY
  {
    stateCode: 'NJ',
    stateName: 'New Jersey',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2024-01-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'cannabis'],
    lastUpdated: '2026-02-01',
  },

  // NEW MEXICO
  {
    stateCode: 'NM',
    stateName: 'New Mexico',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // NEW YORK
  {
    stateCode: 'NY',
    stateName: 'New York',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2024-07-01',
    hsRestrictions: ['Cannot use school logos', 'Cannot interfere with academics'],
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    disclosureTo: 'school',
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'cannabis'],
    lastUpdated: '2026-02-01',
  },

  // NORTH CAROLINA
  {
    stateCode: 'NC',
    stateName: 'North Carolina',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2023-07-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // NORTH DAKOTA
  {
    stateCode: 'ND',
    stateName: 'North Dakota',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // OHIO
  {
    stateCode: 'OH',
    stateName: 'Ohio',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2023-07-06',
    hsRestrictions: ['Cannot use school IP', 'Cannot conflict with team activities'],
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    disclosureTo: 'school',
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'adult_entertainment'],
    lastUpdated: '2026-02-01',
    sourceUrl: 'https://www.legislature.ohio.gov/legislation/135/hb29',
  },

  // OKLAHOMA
  {
    stateCode: 'OK',
    stateName: 'Oklahoma',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // OREGON
  {
    stateCode: 'OR',
    stateName: 'Oregon',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // PENNSYLVANIA
  {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2024-01-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // RHODE ISLAND
  {
    stateCode: 'RI',
    stateName: 'Rhode Island',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // SOUTH CAROLINA
  {
    stateCode: 'SC',
    stateName: 'South Carolina',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // SOUTH DAKOTA
  {
    stateCode: 'SD',
    stateName: 'South Dakota',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // TENNESSEE
  {
    stateCode: 'TN',
    stateName: 'Tennessee',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2023-07-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // TEXAS
  {
    stateCode: 'TX',
    stateName: 'Texas',
    hsNilAllowed: true,
    hsMinimumAge: 17,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2023-09-01',
    hsRestrictions: ['Must be 17 years old', 'Cannot miss school for NIL activities'],
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    disclosureTo: 'school',
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'firearms', 'adult_entertainment'],
    lastUpdated: '2026-02-01',
    sourceUrl: 'https://capitol.texas.gov/BillLookup/History.aspx?LegSess=88R&Bill=SB1219',
  },

  // UTAH
  {
    stateCode: 'UT',
    stateName: 'Utah',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsEffectiveDate: '2023-07-01',
    collegeNilAllowed: true,
    disclosureRequired: true,
    disclosureDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'cannabis'],
    lastUpdated: '2026-02-01',
  },

  // VERMONT
  {
    stateCode: 'VT',
    stateName: 'Vermont',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // VIRGINIA
  {
    stateCode: 'VA',
    stateName: 'Virginia',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // WASHINGTON — HS NIL PROHIBITED
  {
    stateCode: 'WA',
    stateName: 'Washington',
    hsNilAllowed: false,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    hsRestrictions: ['Washington Interscholastic Activities Association prohibits NIL'],
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // WEST VIRGINIA
  {
    stateCode: 'WV',
    stateName: 'West Virginia',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // WISCONSIN
  {
    stateCode: 'WI',
    stateName: 'Wisconsin',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // WYOMING
  {
    stateCode: 'WY',
    stateName: 'Wyoming',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },

  // DISTRICT OF COLUMBIA
  {
    stateCode: 'DC',
    stateName: 'District of Columbia',
    hsNilAllowed: true,
    hsRequiresParentConsent: true,
    hsSchoolCanFacilitate: false,
    collegeNilAllowed: true,
    disclosureRequired: false,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
    lastUpdated: '2026-02-01',
  },
];

// Quick-lookup map by state code
export const STATE_NIL_RULES_MAP: Record<string, StateNILRule> = Object.fromEntries(
  STATE_NIL_RULES_2026.map(rule => [rule.stateCode, rule])
);

// States where HS NIL is prohibited
export const HS_NIL_PROHIBITED_STATES = STATE_NIL_RULES_2026
  .filter(s => !s.hsNilAllowed)
  .map(s => s.stateCode); // ['MA', 'MN', 'WA']

// States where HS NIL is allowed
export const HS_NIL_ALLOWED_STATES = STATE_NIL_RULES_2026
  .filter(s => s.hsNilAllowed)
  .map(s => s.stateCode);
