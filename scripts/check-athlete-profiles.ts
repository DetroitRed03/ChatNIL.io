import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAthleteProfiles() {
  console.log('🔍 Checking athlete_profiles table...\n');

  // Check if table exists and count
  const { count, error: countError } = await supabase
    .from('athlete_profiles')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error counting athlete profiles:', countError);
    return;
  }

  console.log(`📊 Total athlete profiles: ${count}`);

  // Get sample records
  const { data: samples, error: samplesError } = await supabase
    .from('athlete_profiles')
    .select(`
      user_id,
      primary_sport,
      school_name,
      total_followers,
      engagement_rate,
      fmv,
      accepting_opportunities
    `)
    .limit(5);

  if (samplesError) {
    console.error('❌ Error fetching samples:', samplesError);
    return;
  }

  console.log('\n📝 Sample records:');
  console.log(JSON.stringify(samples, null, 2));

  // Check if users join will work
  const { data: withUsers, error: joinError } = await supabase
    .from('athlete_profiles')
    .select(`
      *,
      users!inner(id, email, full_name, username, profile_photo_url)
    `)
    .limit(1);

  if (joinError) {
    console.error('\n❌ Error with users join:', joinError);
  } else {
    console.log('\n✅ Users join works!');
    console.log(JSON.stringify(withUsers, null, 2));
  }
}

checkAthleteProfiles();
