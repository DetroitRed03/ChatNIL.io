import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSarahLogin() {
  console.log('🔍 Checking Sarah Johnson account...\n');

  // Check in public.users table
  const { data: publicUser, error: publicError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (publicError) {
    console.error('❌ Error checking public.users:', publicError);
  } else if (publicUser) {
    console.log('✅ Found in public.users:');
    console.log(JSON.stringify(publicUser, null, 2));
  } else {
    console.log('❌ NOT found in public.users');
  }

  console.log('\n---\n');

  // Check auth.users via admin API
  try {
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error listing auth users:', authError);
    } else {
      const sarahAuth = users?.find(u => u.email === 'sarah.johnson@test.com');

      if (sarahAuth) {
        console.log('✅ Found in auth.users:');
        console.log('ID:', sarahAuth.id);
        console.log('Email:', sarahAuth.email);
        console.log('Email confirmed:', sarahAuth.email_confirmed_at ? 'Yes' : 'No');
        console.log('Last sign in:', sarahAuth.last_sign_in_at || 'Never');
        console.log('Created:', sarahAuth.created_at);
        console.log('Banned:', sarahAuth.banned_until ? 'Yes' : 'No');
        console.log('\nFull auth data:');
        console.log(JSON.stringify(sarahAuth, null, 2));
      } else {
        console.log('❌ NOT found in auth.users');
        console.log('\n📋 Available test accounts:');
        const testAccounts = users?.filter(u => u.email?.includes('@test.com'));
        testAccounts?.forEach(u => {
          console.log(`  - ${u.email} (${u.id})`);
        });
      }
    }
  } catch (err) {
    console.error('❌ Error with auth admin API:', err);
  }

  console.log('\n---\n');

  // Check athlete_profiles
  const { data: athleteProfile, error: athleteError } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', publicUser?.id || 'unknown')
    .single();

  if (!athleteError && athleteProfile) {
    console.log('✅ Has athlete profile:');
    console.log(JSON.stringify(athleteProfile, null, 2));
  } else if (publicUser) {
    console.log('❌ No athlete profile found');
  }
}

checkSarahLogin();
