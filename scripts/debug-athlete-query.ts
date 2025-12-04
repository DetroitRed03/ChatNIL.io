import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debug() {
  console.log('🔍 Debugging athlete query...\n');

  const { data: athletes, error: athletesError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, total_followers, avg_engagement_rate, sport, interests')
    .eq('role', 'athlete')
    .eq('onboarding_completed', true)
    .limit(5);

  console.log('Error:', athletesError);
  console.log('\nData:', JSON.stringify(athletes, null, 2));
  console.log('\nCount:', athletes?.length || 0);
}

debug();
