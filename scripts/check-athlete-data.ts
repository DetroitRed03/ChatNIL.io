import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkData() {
  // Check total athletes
  const { data: allAthletes, error: allError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, onboarding_completed, total_followers')
    .eq('role', 'athlete')
    .limit(10);

  console.log('📊 All athletes (up to 10):');
  console.log(JSON.stringify(allAthletes, null, 2));
  console.log(`\n✅ Total athletes found: ${allAthletes?.length || 0}`);

  // Check onboarding status
  const onboardingTrue = allAthletes?.filter(a => a.onboarding_completed === true).length || 0;
  const onboardingFalse = allAthletes?.filter(a => a.onboarding_completed === false).length || 0;
  const onboardingNull = allAthletes?.filter(a => a.onboarding_completed === null).length || 0;

  console.log(`\n📋 Onboarding status:`);
  console.log(`   Completed: ${onboardingTrue}`);
  console.log(`   Not completed: ${onboardingFalse}`);
  console.log(`   Null: ${onboardingNull}`);

  // Check followers
  const withFollowers = allAthletes?.filter(a => a.total_followers != null && a.total_followers > 0).length || 0;
  console.log(`\n👥 Athletes with followers: ${withFollowers}`);
}

checkData();
