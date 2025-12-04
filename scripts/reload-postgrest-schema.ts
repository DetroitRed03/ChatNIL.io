#!/usr/bin/env tsx
/**
 * Reload PostgREST schema cache by sending a NOTIFY signal
 * This forces PostgREST to reload its schema cache
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqskiijspudfocddhkqs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';

console.log('🔄 RELOADING POSTGREST SCHEMA CACHE\n');
console.log('═'.repeat(80));
console.log(`Database: ${SUPABASE_URL}`);
console.log('═'.repeat(80));
console.log('');

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function reloadSchema() {
  console.log('📍 Method 1: Send NOTIFY signal to reload schema');

  try {
    // Send a NOTIFY signal to reload the schema
    const { data, error } = await supabaseAdmin.rpc('pgrst_watch');

    if (error) {
      console.log('⚠️  RPC method not available:', error.message);
      console.log('   This is expected - trying alternative methods...\n');
    } else {
      console.log('✅ NOTIFY signal sent successfully');
    }
  } catch (e: any) {
    console.log('⚠️  Could not send NOTIFY:', e.message);
  }

  console.log('\n📍 Method 2: Direct schema reload via SQL');

  try {
    // Try to execute NOTIFY pgrst via SQL
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: "NOTIFY pgrst, 'reload schema'"
    });

    if (error) {
      console.log('⚠️  exec_sql RPC not available:', error.message);
      console.log('   This is expected - trying next method...\n');
    } else {
      console.log('✅ Schema reload triggered via SQL');
    }
  } catch (e: any) {
    console.log('⚠️  Could not execute SQL:', e.message);
  }

  console.log('\n📍 Method 3: Verify table is accessible');

  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.log('❌ Table STILL not accessible');
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log('\n💡 The PostgREST schema cache needs to be reloaded manually.');
      console.log('   Options:');
      console.log('   1. Wait 10 minutes for automatic reload');
      console.log('   2. Restart the Supabase database (via Supabase Dashboard)');
      console.log('   3. Use the Supabase CLI: supabase db reload-schema');
      console.log('   4. Make a schema change (add/remove a column) to trigger reload');
      return false;
    } else {
      console.log('✅ Table IS accessible!');
      console.log(`   Found ${data?.length || 0} records`);
      console.log('\n🎉 Schema cache has been reloaded successfully!');
      return true;
    }
  } catch (e: any) {
    console.log('❌ Unexpected error:', e.message);
    return false;
  }
}

async function testTableAccess() {
  console.log('\n' + '─'.repeat(80));
  console.log('TESTING TABLE ACCESS BEFORE AND AFTER RELOAD');
  console.log('─'.repeat(80));

  console.log('\n📊 Before reload:');
  const { data: before, error: beforeError } = await supabaseAdmin
    .from('users')
    .select('id')
    .limit(1);

  if (beforeError) {
    console.log(`❌ Error: ${beforeError.message} (${beforeError.code})`);
  } else {
    console.log(`✅ Success - found ${before?.length || 0} records`);
  }

  console.log('\n🔄 Attempting reload...\n');
  const success = await reloadSchema();

  if (!success) {
    console.log('\n❌ Schema reload failed or table is still inaccessible');
    process.exit(1);
  }

  console.log('\n📊 After reload:');
  const { data: after, error: afterError } = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .limit(5);

  if (afterError) {
    console.log(`❌ Error: ${afterError.message} (${afterError.code})`);
    process.exit(1);
  } else {
    console.log(`✅ Success - found ${after?.length || 0} records`);
    if (after && after.length > 0) {
      console.log('\n👥 Sample users:');
      after.forEach((user: any) => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('SCHEMA RELOAD COMPLETE');
  console.log('═'.repeat(80));
}

testTableAccess().catch(console.error);
