#!/usr/bin/env tsx
/**
 * Check what accounts exist in the database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkAccounts() {
  console.log('🔍 Checking available accounts...\n');

  // Check users table
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role, username')
    .order('created_at', { ascending: false })
    .limit(20);

  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return;
  }

  console.log('👥 USERS:');
  console.log('═'.repeat(80));

  const roleGroups = users.reduce((acc: any, user) => {
    if (!acc[user.role]) acc[user.role] = [];
    acc[user.role].push(user);
    return acc;
  }, {});

  for (const [role, roleUsers] of Object.entries(roleGroups) as any) {
    console.log(`\n${role.toUpperCase()} (${roleUsers.length}):`);
    for (const user of roleUsers) {
      console.log(`  • ${user.email || user.username || 'No email'}`);
      console.log(`    ID: ${user.id}`);
      if (user.username) console.log(`    Username: @${user.username}`);
    }
  }

  // Check for agencies
  console.log('\n\n🏢 AGENCIES:');
  console.log('═'.repeat(80));

  const { data: agencies, error: agenciesError } = await supabase
    .from('agencies')
    .select('*')
    .limit(20);

  if (agenciesError) {
    console.log('  No agencies table or no data');
  } else if (agencies.length === 0) {
    console.log('  No agencies found');
  } else {
    for (const agency of agencies) {
      console.log(`\n  • ${agency.name}`);
      console.log(`    ID: ${agency.id}`);
      if (agency.user_id) console.log(`    User ID: ${agency.user_id}`);
    }
  }

  // Check for businesses
  console.log('\n\n🏪 BUSINESSES:');
  console.log('═'.repeat(80));

  const { data: businesses, error: businessError } = await supabase
    .from('business_profiles')
    .select('*')
    .limit(20);

  if (businessError) {
    console.log('  No business_profiles table or no data');
  } else if (businesses.length === 0) {
    console.log('  No businesses found');
  } else {
    for (const business of businesses) {
      console.log(`\n  • ${business.business_name}`);
      console.log(`    ID: ${business.id}`);
      console.log(`    Type: ${business.business_type}`);
      if (business.user_id) console.log(`    User ID: ${business.user_id}`);
    }
  }

  console.log('\n');
}

checkAccounts();
