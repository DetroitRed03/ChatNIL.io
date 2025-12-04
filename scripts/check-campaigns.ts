import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkCampaigns() {
  console.log('🔍 Checking for campaigns in the database...\n');

  // Check campaigns table
  const { data: campaigns, error: campaignsError, count } = await supabase
    .from('agency_campaigns')
    .select('*', { count: 'exact' });

  if (campaignsError) {
    console.error('❌ Error fetching campaigns:', campaignsError);
    return;
  }

  console.log(`📊 Total campaigns found: ${count}`);

  if (campaigns && campaigns.length > 0) {
    console.log('\n✅ Campaign details:');
    campaigns.forEach((campaign, index) => {
      console.log(`\n${index + 1}. ${campaign.campaign_name} (${campaign.brand_name})`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Budget: $${(campaign.budget_per_athlete / 100).toLocaleString()}`);
      console.log(`   Target Sports: ${campaign.target_sports?.join(', ') || 'None'}`);
    });
  } else {
    console.log('\n❌ No campaigns found in database!');
    console.log('\n💡 You need to seed campaigns. Run:');
    console.log('   npx tsx scripts/seed-demo-campaigns.ts');
  }

  // Also check if there are any athletes
  const { data: athletes, count: athleteCount } = await supabase
    .from('users')
    .select('id, first_name, last_name, primary_sport', { count: 'exact' })
    .eq('role', 'athlete')
    .limit(5);

  console.log(`\n\n👥 Total athletes in database: ${athleteCount}`);
  if (athletes && athletes.length > 0) {
    console.log('Sample athletes:');
    athletes.forEach((athlete) => {
      console.log(`   - ${athlete.first_name} ${athlete.last_name} (${athlete.primary_sport}) - ID: ${athlete.id}`);
    });
  }
}

checkCampaigns().catch(console.error);
