import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAPIProfile() {
  console.log('🧪 Testing Profile API Data Fetch\n');

  // Get the test student user
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Auth error:', authError);
    return;
  }

  const testStudent = authUsers.users.find(u => u.email?.includes('teststudent.athlete'));

  if (!testStudent) {
    console.error('❌ Test student not found');
    return;
  }

  console.log('✅ Found test student:', testStudent.email);
  console.log('   User ID:', testStudent.id);

  // Fetch profile data exactly like the API does
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', testStudent.id)
    .single();

  if (profileError) {
    console.error('❌ Profile fetch error:', profileError);
    return;
  }

  console.log('\n📊 Full Profile Data:');
  console.log(JSON.stringify(profile, null, 2));

  console.log('\n🏫 School-Related Fields:');
  console.log('   school_created:', profile.school_created);
  console.log('   profile_completion_tier:', profile.profile_completion_tier);
  console.log('   home_completion_required:', profile.home_completion_required);
  console.log('   school_id:', profile.school_id);
  console.log('   school_name:', profile.school_name);

  console.log('\n📋 Basic Fields:');
  console.log('   first_name:', profile.first_name);
  console.log('   last_name:', profile.last_name);
  console.log('   role:', profile.role);
  console.log('   onboarding_completed:', profile.onboarding_completed);
}

testAPIProfile()
  .then(() => {
    console.log('\n✅ Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
