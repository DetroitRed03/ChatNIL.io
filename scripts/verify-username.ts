import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUsername() {
  console.log('🔍 Checking Sarah Johnson username...\n');

  // Check with service role
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, username, role')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Found Sarah:');
  console.log('   Name:', data.first_name, data.last_name);
  console.log('   Email:', data.email);
  console.log('   Role:', data.role);
  console.log('   Username:', data.username || 'NOT SET');
  console.log('   ID:', data.id);

  // Try to query by username
  console.log('\n🔍 Trying to query by username...\n');

  const { data: byUsername, error: usernameError } = await supabase
    .from('users')
    .select('id, first_name, last_name, username, role')
    .eq('username', 'sarah-johnson')
    .single();

  if (usernameError) {
    console.error('❌ Error querying by username:', usernameError);
  } else {
    console.log('✅ Found by username:', byUsername);
  }
}

verifyUsername();
