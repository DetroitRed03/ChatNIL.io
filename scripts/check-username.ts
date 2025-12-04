import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsername() {
  const { data, error } = await supabase
    .from('users')
    .select('username, first_name, last_name, email')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sarah Johnson Profile:');
  console.log('Name:', data.first_name, data.last_name);
  console.log('Email:', data.email);
  console.log('Username:', data.username || 'NOT SET');

  if (data.username) {
    console.log('\n🔗 Profile URL: http://localhost:3000/athletes/' + data.username);
  } else {
    console.log('\n⚠️ Username not set. Need to add username to test profile page.');
  }
}

checkUsername();
