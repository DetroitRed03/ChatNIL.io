import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// STATE NIL RULES - 50 States
// ============================================================================
const stateNilRules = [
  // Progressive states (allows HS + college)
  {
    state_code: 'CA',
    state_name: 'California',
    allows_nil: true,
    high_school_allowed: true,
    college_allowed: true,
    school_approval_required: false,
    prohibited_categories: ['alcohol', 'gambling', 'cannabis', 'tobacco'],
    disclosure_required: true,
    agent_registration_required: false,
    financial_literacy_required: false,
    rules_summary: 'California allows NIL for both HS and college athletes with minimal restrictions. Disclosure required.',
    effective_date: '2021-09-01'
  },
  {
    state_code: 'KY',
    state_name: 'Kentucky',
    allows_nil: true,
    high_school_allowed: true,
    college_allowed: true,
    school_approval_required: false,
    prohibited_categories: ['alcohol', 'gambling', 'tobacco'],
    disclosure_required: true,
    agent_registration_required: true,
    financial_literacy_required: false,
    rules_summary: 'Kentucky progressive NIL law. Agent registration required.',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'FL',
    state_name: 'Florida',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    school_approval_required: false,
    prohibited_categories: ['alcohol', 'gambling', 'tobacco', 'cannabis'],
    disclosure_required: true,
    agent_registration_required: false,
    financial_literacy_required: false,
    rules_summary: 'Florida allows college NIL only. Disclosure required.',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'TX',
    state_name: 'Texas',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    school_approval_required: false,
    prohibited_categories: ['alcohol', 'gambling', 'tobacco'],
    disclosure_required: true,
    agent_registration_required: false,
    financial_literacy_required: false,
    rules_summary: 'Texas allows college NIL. Disclosure to institution required.',
    effective_date: '2021-07-01'
  },
  {
    state_code: 'NY',
    state_name: 'New York',
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    school_approval_required: true,
    prohibited_categories: ['alcohol', 'gambling', 'tobacco', 'cannabis'],
    disclosure_required: true,
    agent_registration_required: true,
    financial_literacy_required: false,
    rules_summary: 'NY requires school approval and agent registration.',
    effective_date: '2021-09-01'
  },
  // Add remaining 45 states with default moderate rules
  ...['AL', 'AK', 'AZ', 'AR', 'CO', 'CT', 'DE', 'GA', 'HI', 'ID',
     'IL', 'IN', 'IA', 'KS', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
     'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NC', 'ND',
     'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'UT', 'VT',
     'VA', 'WA', 'WV', 'WI', 'WY'].map(code => ({
    state_code: code,
    state_name: getStateName(code),
    allows_nil: true,
    high_school_allowed: false,
    college_allowed: true,
    school_approval_required: false,
    prohibited_categories: ['alcohol', 'gambling', 'tobacco'],
    disclosure_required: true,
    agent_registration_required: false,
    financial_literacy_required: false,
    rules_summary: `${getStateName(code)} allows college NIL with standard restrictions.`,
    effective_date: '2021-07-01'
  }))
];

function getStateName(code: string): string {
  const stateNames: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CO: 'Colorado',
    CT: 'Connecticut', DE: 'Delaware', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
    IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', LA: 'Louisiana',
    ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
    MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
    NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NC: 'North Carolina',
    ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
    RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee',
    UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
    WI: 'Wisconsin', WY: 'Wyoming'
  };
  return stateNames[code] || code;
}

// ============================================================================
// AGENCIES - Using actual database schema
// ============================================================================
const agencies = [
  {
    company_name: 'Elite Sports Management',
    agency_type: 'sports_marketing',
    industry: 'Sports & Entertainment',
    company_size: '50-200',
    website: 'https://elitesportsmanagement.com',
    logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    description: 'Leading NIL agency specializing in basketball and football athletes. Focus on brand partnerships and social media growth.'
  },
  {
    company_name: 'Athlete Brand Collective',
    agency_type: 'brand_management',
    industry: 'Marketing & Branding',
    company_size: '20-50',
    website: 'https://athletebrandcollective.com',
    logo_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200',
    description: 'Boutique agency focused on building authentic athlete brands. Expertise in content creation and influencer marketing.'
  },
  {
    company_name: 'Next Level NIL Partners',
    agency_type: 'nil_collective',
    industry: 'Sports Marketing',
    company_size: '10-20',
    website: 'https://nextlevelnil.com',
    logo_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200',
    description: 'NIL collective connecting athletes with local and national brands. Strong focus on compliance and education.'
  },
  {
    company_name: 'West Coast Athlete Agency',
    agency_type: 'talent_agency',
    industry: 'Sports & Entertainment',
    company_size: '100-500',
    website: 'https://westcoastathleteagency.com',
    logo_url: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=200',
    description: 'Full-service talent agency representing top athletes. Specializes in high-profile endorsements and media opportunities.'
  },
  {
    company_name: 'Social Impact Sports',
    agency_type: 'social_impact',
    industry: 'Sports & Social Good',
    company_size: '5-10',
    website: 'https://socialimpactsports.org',
    logo_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200',
    description: 'Mission-driven agency connecting athletes with cause-related campaigns. Focus on social justice and community engagement.'
  },
  {
    company_name: 'Premier NIL Group',
    agency_type: 'nil_collective',
    industry: 'Sports Marketing',
    company_size: '20-50',
    website: 'https://premiernilgroup.com',
    logo_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200',
    description: 'Premier NIL collective with exclusive partnerships. Focus on high-value deals for top-tier athletes.'
  },
  {
    company_name: 'Digital Athletes Network',
    agency_type: 'digital_marketing',
    industry: 'Digital Marketing',
    company_size: '10-20',
    website: 'https://digitalathletesnetwork.com',
    logo_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
    description: 'Digital-first agency specializing in social media growth and content monetization. TikTok and Instagram experts.'
  },
  {
    company_name: 'Hometown Heroes Collective',
    agency_type: 'nil_collective',
    industry: 'Community Sports',
    company_size: '5-10',
    website: 'https://hometownheroescollective.com',
    logo_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200',
    description: 'Local-focused NIL collective connecting athletes with hometown businesses. Strong community ties.'
  }
];

// ============================================================================
// CAMPAIGNS - Tied to agencies for matchmaking
// ============================================================================
async function getSeedData() {
  console.log('🌱 SEEDING PRIORITY DATA FOR MATCHMAKING\n');
  console.log('='.repeat(80));
  console.log('\n');

  let successCount = 0;
  let errorCount = 0;

  // 1. SEED STATE NIL RULES
  console.log('1️⃣  SEEDING STATE NIL RULES (50 states)\n');
  console.log('-'.repeat(80));

  for (const state of stateNilRules) {
    const { error } = await supabase
      .from('state_nil_rules')
      .upsert(state, { onConflict: 'state_code' });

    if (error) {
      console.log(`   ❌ ${state.state_code}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ ${state.state_code} - ${state.state_name}`);
      successCount++;
    }
  }

  console.log(`\n📊 State Rules: ${successCount}/50 seeded\n\n`);

  // 2. SEED AGENCIES
  console.log('2️⃣  SEEDING AGENCIES (8 agencies)\n');
  console.log('-'.repeat(80));

  const agencyIds: string[] = [];
  for (const agency of agencies) {
    const { data, error } = await supabase
      .from('agencies')
      .insert(agency)
      .select('id')
      .single();

    if (error) {
      console.log(`   ❌ ${agency.company_name}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`   ✅ ${agency.company_name}`);
      agencyIds.push(data.id);
      successCount++;
    }
  }

  console.log(`\n📊 Agencies: ${agencyIds.length}/8 seeded\n\n`);

  return { agencyIds };
}

async function main() {
  try {
    const { agencyIds } = await getSeedData();

    console.log('='.repeat(80));
    console.log('✅ PRIORITY DATA SEEDING COMPLETE\n');
    console.log(`📊 Summary:`);
    console.log(`   • 50 State NIL Rules`);
    console.log(`   • ${agencyIds.length} Agencies`);
    console.log('\n🔜 Next Steps:');
    console.log(`   1. Create campaigns for agencies`);
    console.log(`   2. Create NIL deals for Sarah`);
    console.log(`   3. Generate agency-athlete matches`);
    console.log(`   4. Test matchmaking system`);
    console.log('\n');
  } catch (error: any) {
    console.error('💥 Error:', error.message);
  }
}

main();
