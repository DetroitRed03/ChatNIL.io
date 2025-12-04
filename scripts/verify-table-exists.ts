#!/usr/bin/env tsx
/**
 * Verify that the public.users table actually exists in the database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lqskiijspudfocddhkqs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';

console.log('🔍 VERIFYING TABLE EXISTENCE\n');
console.log('═'.repeat(80));
console.log(`Database: ${SUPABASE_URL}`);
console.log('═'.repeat(80));
console.log('');

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyTable() {
  console.log('📍 Checking if public.users table exists via SQL query...\n');

  try {
    // Query the information_schema to check if table exists
    const { data, error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT table_name, table_schema
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users';
      `
    });

    if (error) {
      console.log('⚠️  exec_sql RPC not available, trying alternative method...\n');
    } else if (data) {
      console.log('✅ Query successful');
      console.log('Result:', data);
      return;
    }
  } catch (e: any) {
    console.log('⚠️  Could not use exec_sql:', e.message);
  }

  console.log('📍 Listing all tables in public schema...\n');

  try {
    // Try using PostgREST introspection
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });

    const data = await response.json();
    console.log('📊 PostgREST introspection response:');
    console.log(JSON.stringify(data, null, 2));

  } catch (e: any) {
    console.log('❌ Could not introspect:', e.message);
  }

  console.log('\n📍 Checking auth.users (should always be accessible)...\n');

  try {
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.log('❌ Could not list auth users:', authError.message);
    } else {
      console.log(`✅ Found ${authUsers.users.length} users in auth.users`);
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    }
  } catch (e: any) {
    console.log('❌ Error listing users:', e.message);
  }

  console.log('\n📍 Trying direct query to public.users table...\n');

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Direct query failed');
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details:`, error);
    } else {
      console.log('✅ Direct query successful');
      console.log('Data:', data);
    }
  } catch (e: any) {
    console.log('❌ Unexpected error:', e.message);
  }

  console.log('\n' + '═'.repeat(80));
  console.log('VERIFICATION COMPLETE');
  console.log('═'.repeat(80));
}

verifyTable().catch(console.error);
