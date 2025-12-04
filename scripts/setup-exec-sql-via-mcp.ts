#!/usr/bin/env tsx
/**
 * Setup exec_sql function using Postgres MCP
 *
 * This script uses the postgres MCP connection to create the exec_sql function
 */

import { Client } from 'pg';

// Parse the connection string from .env.local
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  // Try to construct from Supabase credentials
  const projectRef = 'enbuwffusjhpcyoveewb';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error('❌ Missing DATABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log('⚠️  DATABASE_URL not found, using Supabase pooler URL');
  console.log('');
}

const connectionString = POSTGRES_URL ||
  `postgresql://postgres.enbuwffusjhpcyoveewb:${process.env.SUPABASE_SERVICE_ROLE_KEY}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

const EXEC_SQL_FUNCTION = `
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS exec_sql(text);

-- Create the exec_sql function (parameter name: query)
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$func$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated, service_role, anon, postgres;
`;

async function setupExecSQL() {
  console.log('🚀 Setting up exec_sql function via direct Postgres connection');
  console.log('═'.repeat(80));
  console.log('');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('   ✅ Connected');
    console.log('');

    console.log('⚡ Creating exec_sql function...');
    await client.query(EXEC_SQL_FUNCTION);
    console.log('   ✅ exec_sql function created successfully!');
    console.log('');

    // Test the function
    console.log('🧪 Testing exec_sql function...');
    const testResult = await client.query("SELECT exec_sql('SELECT 1 as test;')");
    console.log('   ✅ exec_sql function works!');
    console.log('');
    console.log('═'.repeat(80));
    console.log('✅ SETUP COMPLETE');
    console.log('═'.repeat(80));
    console.log('');
    console.log('You can now run migrations using:');
    console.log('  npx tsx scripts/run-migration.ts <migration-file>');
    console.log('  OR');
    console.log('  ./migrate.sh <migration-file>');
    console.log('');

  } catch (error: any) {
    console.log('');
    console.log('═'.repeat(80));
    console.log('❌ SETUP FAILED');
    console.log('═'.repeat(80));
    console.log('');
    console.error('Error:', error.message || error);
    console.log('');
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupExecSQL();
