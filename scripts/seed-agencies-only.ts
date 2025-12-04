import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function seedAgencies() {
  console.log('🏢 SEEDING AGENCIES\n');
  console.log('='.repeat(80));
  console.log('\n');

  const agencyIds: string[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const agency of agencies) {
    const { data, error } = await supabase
      .from('agencies')
      .insert(agency)
      .select('id')
      .single();

    if (error) {
      console.log(`   ❌ ${agency.company_name}`);
      console.log(`      Error: ${error.message}\n`);
      errorCount++;
    } else {
      console.log(`   ✅ ${agency.company_name}`);
      console.log(`      ID: ${data.id}`);
      console.log(`      Type: ${agency.agency_type}\n`);
      agencyIds.push(data.id);
      successCount++;
    }
  }

  console.log('='.repeat(80));
  console.log(`📊 RESULTS: ${successCount}/${agencies.length} agencies seeded`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log('\n');

  if (agencyIds.length > 0) {
    console.log('✅ NEXT STEPS:');
    console.log('   1. Create campaigns for these agencies');
    console.log('   2. Create NIL deals for Sarah Johnson');
    console.log('   3. Generate agency-athlete matches');
    console.log('   4. Test matchmaking system\n');
  }

  return agencyIds;
}

seedAgencies().catch(console.error);
