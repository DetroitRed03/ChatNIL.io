#!/usr/bin/env tsx
/**
 * Setup exec_sql function in Supabase
 *
 * This function is required to run migrations programmatically.
 * It creates a SQL executor function with proper security context.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const EXEC_SQL_FUNCTION = `
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS exec_sql(text);

-- Create the exec_sql function (parameter name: query)
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated, service_role, anon, postgres;
`;

async function setupExecSQL() {
  console.log('🚀 Setting up exec_sql function');
  console.log('═'.repeat(80));
  console.log(`🌐 Database: ${SUPABASE_URL}`);
  console.log('═'.repeat(80));
  console.log('');

  try {
    console.log('⚡ Creating exec_sql function...');

    // Try to use existing exec_sql first (chicken and egg problem)
    let { data, error } = await supabase.rpc('exec_sql', {
      sql_query: EXEC_SQL_FUNCTION
    });

    // If exec_sql doesn't exist, we need to use the REST API directly
    if (error && error.message?.includes('exec_sql')) {
      console.log('   ℹ️  exec_sql does not exist yet, using direct SQL...');

      // Use Postgres REST API to execute DDL
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ sql_query: EXEC_SQL_FUNCTION })
      });

      if (!response.ok) {
        // Last resort: tell user to do it manually
        console.log('');
        console.log('═'.repeat(80));
        console.log('⚠️  MANUAL SETUP REQUIRED');
        console.log('═'.repeat(80));
        console.log('');
        console.log('The exec_sql function needs to be created manually.');
        console.log('');
        console.log('Steps:');
        console.log('1. Go to: https://supabase.com/dashboard');
        console.log('2. Select your project');
        console.log('3. Go to SQL Editor');
        console.log('4. Run the following SQL:');
        console.log('');
        console.log('─'.repeat(80));
        console.log(EXEC_SQL_FUNCTION);
        console.log('─'.repeat(80));
        console.log('');
        console.log('After running the SQL, you can use the migration scripts.');
        console.log('');
        process.exit(1);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
    }

    console.log('   ✅ exec_sql function created successfully!');
    console.log('');

    // Test the function
    console.log('🧪 Testing exec_sql function...');
    const { data: testData, error: testError } = await supabase.rpc('exec_sql', {
      query: 'SELECT 1 as test;'
    });

    if (testError) {
      throw testError;
    }

    console.log('   ✅ exec_sql function works!');
    console.log('');
    console.log('═'.repeat(80));
    console.log('✅ SETUP COMPLETE');
    console.log('═'.repeat(80));
    console.log('');
    console.log('You can now run migrations using:');
    console.log('  npx tsx scripts/run-migration.ts <migration-file>');
    console.log('');

  } catch (error: any) {
    console.log('');
    console.log('═'.repeat(80));
    console.log('❌ SETUP FAILED');
    console.log('═'.repeat(80));
    console.log('');
    console.error('Error:', error.message || error);
    console.log('');
    console.log('You may need to create the exec_sql function manually.');
    console.log('See instructions above.');
    console.log('');
    process.exit(1);
  }
}

setupExecSQL();
