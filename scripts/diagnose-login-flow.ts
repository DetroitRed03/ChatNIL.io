#!/usr/bin/env tsx
/**
 * Diagnose the complete login flow to identify where it fails
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqskiijspudfocddhkqs.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1OTMzNTQsImV4cCI6MjA3NzE2OTM1NH0.z8mqmrIOMHHvTxFEjUIqcLOUlQk-__UXjQYypCVfIFQ';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';

console.log('🔍 DIAGNOSING COMPLETE LOGIN FLOW\n');
console.log('═'.repeat(80));
console.log(`Database: ${SUPABASE_URL}`);
console.log('═'.repeat(80));
console.log('');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function diagnoseLoginFlow() {
  const testAccounts = [
    { email: 'nike.agency@test.com', password: 'TestPassword123!', name: 'Nike' },
    { email: 'gatorade.agency@test.com', password: 'TestPassword123!', name: 'Gatorade' },
    { email: 'local.agency@test.com', password: 'TestPassword123!', name: 'Local Business' },
  ];

  for (const account of testAccounts) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Testing: ${account.name} (${account.email})`);
    console.log('─'.repeat(80));

    // Step 1: Authentication
    console.log('\n📍 Step 1: Authentication');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });

    if (authError) {
      console.log('❌ Authentication FAILED');
      console.log(`   Error: ${authError.message}`);
      console.log(`   Code: ${authError.status}`);
      continue;
    }

    console.log('✅ Authentication SUCCESSFUL');
    console.log(`   User ID: ${authData.user?.id}`);
    console.log(`   Email: ${authData.user?.email}`);

    const userId = authData.user?.id;
    if (!userId) {
      console.log('❌ No user ID returned');
      continue;
    }

    // Step 2: Verify user in auth.users
    console.log('\n📍 Step 2: Verify user in auth.users');
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authUserError || !authUser?.user) {
      console.log('❌ User verification FAILED');
      console.log(`   Error: ${authUserError?.message}`);
    } else {
      console.log('✅ User verified in auth system');
    }

    // Step 3: Fetch profile from public.users (WITH ANON KEY - what the browser does)
    console.log('\n📍 Step 3: Fetch profile from public.users (anon key)');
    const { data: profileAnon, error: profileAnonError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileAnonError) {
      console.log('❌ Profile fetch with anon key FAILED');
      console.log(`   Error: ${profileAnonError.message}`);
      console.log(`   Code: ${profileAnonError.code}`);
      console.log(`   Details: ${JSON.stringify(profileAnonError, null, 2)}`);
    } else if (!profileAnon) {
      console.log('❌ No profile found (but no error)');
    } else {
      console.log('✅ Profile fetched successfully with anon key');
      console.log(`   ID: ${profileAnon.id}`);
      console.log(`   Email: ${profileAnon.email}`);
      console.log(`   Role: ${profileAnon.role}`);
    }

    // Step 4: Fetch profile from public.users (WITH SERVICE ROLE - what the API does)
    console.log('\n📍 Step 4: Fetch profile from public.users (service role key)');
    const { data: profileAdmin, error: profileAdminError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileAdminError) {
      console.log('❌ Profile fetch with service role FAILED');
      console.log(`   Error: ${profileAdminError.message}`);
      console.log(`   Code: ${profileAdminError.code}`);
      console.log(`   Details: ${JSON.stringify(profileAdminError, null, 2)}`);
    } else if (!profileAdmin) {
      console.log('❌ No profile found (but no error)');
    } else {
      console.log('✅ Profile fetched successfully with service role');
      console.log(`   ID: ${profileAdmin.id}`);
      console.log(`   Email: ${profileAdmin.email}`);
      console.log(`   Role: ${profileAdmin.role}`);
    }

    // Step 5: Test direct table access
    console.log('\n📍 Step 5: Check if table exists (service role)');
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.log('❌ Table access FAILED');
      console.log(`   Error: ${tablesError.message}`);
      console.log(`   Code: ${tablesError.code}`);
      console.log(`   This is the PostgREST schema cache issue!`);
    } else {
      console.log('✅ Table accessible');
      console.log(`   Found ${tables?.length || 0} records`);
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('DIAGNOSIS COMPLETE');
  console.log('═'.repeat(80));
}

diagnoseLoginFlow().catch(console.error);
