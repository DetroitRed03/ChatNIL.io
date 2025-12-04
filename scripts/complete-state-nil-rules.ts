import { supabaseAdmin } from '../lib/supabase';

const ALL_STATE_RULES = [
  // Existing 10 states are already in the database (CA, FL, TX, NY, GA, IL, MI, NC, OH, PA)
  // Adding remaining 40 states
  {
    state_code: 'AK',
    state_name: 'Alaska',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Must not conflict with school policy',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'AL',
    state_name: 'Alabama',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Strong disclosure requirements',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'AR',
    state_name: 'Arkansas',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'cannabis', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Must report deals to institution',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'AZ',
    state_name: 'Arizona',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: false,
    notes: 'Cannot conflict with team obligations',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'CO',
    state_name: 'Colorado',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'cannabis', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Progressive NIL policies with cannabis exception',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'CT',
    state_name: 'Connecticut',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Must report to institution',
    effective_date: '2021-09-01'
  },
  {
    state_code: 'DC',
    state_name: 'District of Columbia',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Follows NCAA guidelines',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'DE',
    state_name: 'Delaware',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Minimal state restrictions',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'HI',
    state_name: 'Hawaii',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot conflict with team schedule',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'IA',
    state_name: 'Iowa',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot conflict with scholarships',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'ID',
    state_name: 'Idaho',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Follows NCAA guidelines',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'IN',
    state_name: 'Indiana',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot use school trademarks',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'KS',
    state_name: 'Kansas',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Must report deals over $600',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'KY',
    state_name: 'Kentucky',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Strong basketball state with active NIL market',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'LA',
    state_name: 'Louisiana',
    allows_nil: true,
    high_school_allowed: true,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Allows NIL in recruiting discussions',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'MA',
    state_name: 'Massachusetts',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot conflict with team obligations',
    effective_date: '2021-09-01'
  },
  {
    state_code: 'MD',
    state_name: 'Maryland',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot use school IP',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'ME',
    state_name: 'Maine',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Minimal restrictions',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'MN',
    state_name: 'Minnesota',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot use school marks',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'MO',
    state_name: 'Missouri',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot use institutional trademarks',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'MS',
    state_name: 'Mississippi',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot conflict with scholarship',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'MT',
    state_name: 'Montana',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Follows NCAA rules',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'NC',
    state_name: 'North Carolina',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Strong ACC presence',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'ND',
    state_name: 'North Dakota',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Follows NCAA rules',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'NE',
    state_name: 'Nebraska',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Strong football market',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'NH',
    state_name: 'New Hampshire',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Minimal state oversight',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'NJ',
    state_name: 'New Jersey',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Proximity to major markets',
    effective_date: '2021-09-01'
  },
  {
    state_code: 'NM',
    state_name: 'New Mexico',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot use school marks',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'NV',
    state_name: 'Nevada',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Gambling advertising allowed with restrictions',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'OK',
    state_name: 'Oklahoma',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Strong football tradition',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'OR',
    state_name: 'Oregon',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot conflict with scholarship',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'RI',
    state_name: 'Rhode Island',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Follows NCAA guidelines',
    effective_date: '2021-09-01'
  },
  {
    state_code: 'SC',
    state_name: 'South Carolina',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Strong football and basketball markets',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'SD',
    state_name: 'South Dakota',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Minimal restrictions',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'TN',
    state_name: 'Tennessee',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'SEC state with active NIL market',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'UT',
    state_name: 'Utah',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot use institutional trademarks',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'VA',
    state_name: 'Virginia',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot use school IP',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'VT',
    state_name: 'Vermont',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Minimal state oversight',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'WA',
    state_name: 'Washington',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'cannabis', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Progressive state with cannabis restrictions',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'WI',
    state_name: 'Wisconsin',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Cannot conflict with scholarship',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'WV',
    state_name: 'West Virginia',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: true,
    school_notification_required: true,
    notes: 'Must disclose all deals',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'WY',
    state_name: 'Wyoming',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    prohibited_categories: ['alcohol', 'tobacco', 'gambling'],
    disclosure_required: false,
    school_notification_required: false,
    notes: 'Minimal restrictions',
    effective_date: '2021-07-01'
  }
];

async function seedStateRules() {
  console.log('🏛️ Seeding State NIL Rules...\n');

  // Check existing states
  const { data: existing } = await supabaseAdmin
    .from('state_nil_rules')
    .select('state_code');

  const existingCodes = new Set(existing?.map(r => r.state_code) || []);
  console.log(`Found ${existingCodes.size} existing states`);

  // Filter out already existing states
  const newRules = ALL_STATE_RULES.filter(rule => !existingCodes.has(rule.state_code));
  console.log(`Adding ${newRules.length} new states\n`);

  if (newRules.length === 0) {
    console.log('✅ All states already seeded!');
    return;
  }

  // Insert in batches
  const { data, error } = await supabaseAdmin
    .from('state_nil_rules')
    .insert(newRules)
    .select();

  if (error) {
    console.error('❌ Error inserting state rules:', error);
    return;
  }

  console.log(`✅ Successfully added ${data?.length || 0} state NIL rules`);

  // Verify total count
  const { count } = await supabaseAdmin
    .from('state_nil_rules')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total states in database: ${count}/50`);
}

seedStateRules();
