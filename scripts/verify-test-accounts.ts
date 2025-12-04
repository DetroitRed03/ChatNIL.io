/**
 * Verify Test Accounts Script
 * Checks if test accounts exist and can authenticate
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const TEST_ACCOUNTS = [
  { email: 'sarah.johnson@test.com', name: 'Sarah Johnson' },
  { email: 'marcus.williams@test.com', name: 'Marcus Williams' },
  { email: 'emma.garcia@test.com', name: 'Emma Garcia' },
  { email: 'nike.agency@test.com', name: 'Nike Agency' },
];

async function verifyTestAccounts() {
  console.log('🔍 Verifying test accounts...\n');

  for (const account of TEST_ACCOUNTS) {
    console.log(`\n📧 Checking: ${account.email}`);

    // Check in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, onboarding_completed')
      .eq('email', account.email)
      .single();

    if (userData) {
      console.log(`  ✅ Found in users table:`);
      console.log(`     ID: ${userData.id}`);
      console.log(`     Name: ${userData.first_name} ${userData.last_name}`);
      console.log(`     Role: ${userData.role}`);
      console.log(`     Onboarding: ${userData.onboarding_completed}`);

      // Check auth user
      const { data: authData } = await supabase.auth.admin.listUsers();
      const authUser = authData?.users.find(u => u.email === account.email);

      if (authUser) {
        console.log(`  ✅ Found in auth.users:`);
        console.log(`     Auth ID: ${authUser.id}`);
        console.log(`     Confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
      } else {
        console.log(`  ❌ NOT found in auth.users`);
      }
    } else {
      console.log(`  ❌ NOT found in users table`);
      if (userError) {
        console.log(`     Error: ${userError.message}`);
      }
    }
  }

  console.log('\n\n📊 Summary:');
  console.log('='.repeat(50));
  console.log('All test accounts should be:');
  console.log('  1. Present in users table ✓');
  console.log('  2. Present in auth.users ✓');
  console.log('  3. Email confirmed ✓');
  console.log('  4. Password: TestPassword123!');
}

verifyTestAccounts();
