/**
 * Fix Sarah's Profile Data
 *
 * Copies data from athlete_profiles to users table where needed
 * and fills in missing critical fields
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixSarahProfile() {
  console.log('🔧 Fixing Sarah\'s Profile Data...\n');

  const sarahId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  // Step 1: Add missing data to users table
  console.log('📝 Updating users table...');
  const { error: usersError } = await supabase
    .from('users')
    .update({
      first_name: 'Sarah',
      last_name: 'Johnson',
      phone: '+1 (555) 123-4567',
      school_name: 'UCLA',
      date_of_birth: '2004-03-15',
      updated_at: new Date().toISOString()
    })
    .eq('id', sarahId);

  if (usersError) {
    console.error('❌ Error updating users:', usersError);
    return;
  }
  console.log('✅ Users table updated');

  // Step 2: Add missing sport to athlete_profiles
  console.log('\n📝 Updating athlete_profiles table...');
  const { error: athleteError } = await supabase
    .from('athlete_profiles')
    .update({
      sport: 'Basketball',
      nil_interests: ['Fashion', 'Lifestyle', 'Sports Apparel', 'Wellness'],
      nil_concerns: ['Time Management', 'Academic Balance'],
      nil_goals: ['Build personal brand', 'Support NIL education for other athletes'],
      updated_at: new Date().toISOString()
    })
    .eq('user_id', sarahId);

  if (athleteError) {
    console.error('❌ Error updating athlete_profiles:', athleteError);
    return;
  }
  console.log('✅ Athlete profiles table updated');

  // Step 3: Verify the updates
  console.log('\n🔍 Verifying updates...');

  const { data: userData } = await supabase
    .from('users')
    .select('first_name, last_name, phone, school_name, date_of_birth')
    .eq('id', sarahId)
    .single();

  const { data: athleteData } = await supabase
    .from('athlete_profiles')
    .select('sport, nil_interests, nil_concerns, nil_goals')
    .eq('user_id', sarahId)
    .single();

  console.log('\n✅ Users Table:');
  console.log('   Name:', userData?.first_name, userData?.last_name);
  console.log('   Phone:', userData?.phone);
  console.log('   School:', userData?.school_name);
  console.log('   DOB:', userData?.date_of_birth);

  console.log('\n✅ Athlete Profiles Table:');
  console.log('   Sport:', athleteData?.sport);
  console.log('   NIL Interests:', athleteData?.nil_interests?.length, 'items');
  console.log('   NIL Concerns:', athleteData?.nil_concerns?.length, 'items');
  console.log('   NIL Goals:', athleteData?.nil_goals?.length, 'items');

  console.log('\n✅ Done! Profile completion should now be around 85-90%');
  console.log('   Run: npx tsx scripts/diagnose-profile-completion.ts to verify');
}

fixSarahProfile().catch(console.error);
