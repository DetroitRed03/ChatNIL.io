import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSarahData() {
  console.log('🔍 Checking Sarah Johnson\'s secondary sports data...\n');

  const { data, error } = await supabase
    .from('users')
    .select('first_name, last_name, primary_sport, position, secondary_sports, social_media_stats, total_followers, avg_engagement_rate')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('👤 User:', data.first_name, data.last_name);
  console.log('🏈 Primary Sport:', data.primary_sport, '-', data.position);
  console.log('\n📊 Secondary Sports:');
  console.log('Type:', typeof data.secondary_sports);
  console.log('Is Array:', Array.isArray(data.secondary_sports));
  console.log('Value:', JSON.stringify(data.secondary_sports, null, 2));

  if (data.secondary_sports && data.secondary_sports.length > 0) {
    console.log('\n✅ Secondary sports found:', data.secondary_sports.length);
    data.secondary_sports.forEach((sport: any, idx: number) => {
      console.log(`  ${idx + 1}. ${JSON.stringify(sport)}`);
    });
  } else {
    console.log('\n⚠️  No secondary sports found!');
  }

  console.log('\n📱 Social Media Stats:');
  console.log('Total Followers:', data.total_followers);
  console.log('Avg Engagement:', data.avg_engagement_rate + '%');
}

checkSarahData();
