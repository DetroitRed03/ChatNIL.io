import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...\n');

  // Get a sample user to see all columns
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  if (users && users.length > 0) {
    console.log('📋 Available columns in users table:\n');
    const columns = Object.keys(users[0]).sort();
    columns.forEach(col => {
      console.log(`   • ${col}`);
    });
  }

  // Check for test accounts
  console.log('\n\n🔍 Checking for test accounts...\n');
  const testEmails = ['sarah.johnson@test.com', 'james.martinez@test.com'];

  for (const email of testEmails) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('email', email)
      .single();

    if (error) {
      console.log(`   ❌ ${email} - NOT FOUND`);
    } else {
      console.log(`   ✅ ${email} - ${data.first_name} ${data.last_name} (${data.role})`);
    }
  }
}

checkUsersTable();
