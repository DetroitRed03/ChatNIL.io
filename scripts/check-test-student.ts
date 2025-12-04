import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTestStudent() {
  console.log('🔍 Checking TestStudent profile...\n');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('first_name', 'TestStudent')
    .eq('last_name', 'Athlete')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('✅ Student found!\n');
  console.log('📋 Profile Data:');
  console.log('   ID:', data.id);
  console.log('   Email:', data.email);
  console.log('   Role:', data.role);
  console.log('   First Name:', data.first_name);
  console.log('   Last Name:', data.last_name);
  console.log('   Sport:', data.primary_sport);
  console.log('   Graduation Year:', data.graduation_year);
  console.log('   School Name:', data.school_name);
  console.log('\n🏫 School Fields:');
  console.log('   school_created:', data.school_created);
  console.log('   profile_completion_tier:', data.profile_completion_tier);
  console.log('   home_completion_required:', data.home_completion_required);
  console.log('   school_id:', data.school_id);
  console.log('   onboarding_completed:', data.onboarding_completed);

  process.exit(0);
}

checkTestStudent();
