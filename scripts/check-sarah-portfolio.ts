import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPortfolio() {
  console.log('🔍 Checking Sarah Johnson portfolio data...\n');

  // Find Sarah's athlete profile
  const { data: profile, error } = await supabase
    .from('athlete_profiles')
    .select('user_id, username, content_samples')
    .eq('username', 'sarah-johnson')
    .single();

  if (error || !profile) {
    console.log('❌ Sarah Johnson athlete profile not found');
    console.log('   Error:', error?.message);
    return;
  }

  console.log('✅ Found athlete profile:', profile.username);
  console.log('📋 User ID:', profile.user_id);
  console.log('\n📁 Portfolio Data (content_samples):');
  console.log(JSON.stringify(profile.content_samples, null, 2));

  if (!profile.content_samples || profile.content_samples.length === 0) {
    console.log('\n⚠️  No portfolio items found!');
    console.log('💡 Sarah needs to add portfolio items from /profile/edit');
  } else {
    console.log(`\n✅ Found ${profile.content_samples.length} portfolio items`);
  }
}

checkPortfolio();
