import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPublicProfiles() {
  console.log('🔍 Checking athlete_public_profiles table/view...\n');

  // Check if athlete_public_profiles exists
  const { count, error: countError } = await supabase
    .from('athlete_public_profiles')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Error accessing athlete_public_profiles:', countError);
    console.log('\n💡 This table/view may not exist yet. It needs to be created.');
    return;
  }

  console.log(`📊 Total records in athlete_public_profiles: ${count}\n`);

  // Get sample record to see structure
  const { data, error } = await supabase
    .from('athlete_public_profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error fetching sample:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('📋 Available columns:');
    console.log(Object.keys(data[0]).sort().join('\n'));
    console.log('\n📊 Sample record:');
    console.log(JSON.stringify(data[0], null, 2));

    // Check for username field specifically
    if (data[0].username) {
      console.log('\n✅ Username field exists with value:', data[0].username);
    } else {
      console.log('\n⚠️  Username field is missing or null');
    }
  } else {
    console.log('❌ No data found in athlete_public_profiles');
  }
}

checkPublicProfiles();
