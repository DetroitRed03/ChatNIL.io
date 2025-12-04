#!/usr/bin/env tsx
/**
 * Initialize Migration System
 *
 * This creates the exec_sql function by copying it to your clipboard.
 * You just need to paste it into Supabase SQL Editor once.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const EXEC_SQL_FUNCTION = `-- ChatNIL Migration System Setup
-- Run this once in Supabase SQL Editor to enable programmatic migrations

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

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS migrations (
  id varchar(50) PRIMARY KEY,
  name varchar(255) NOT NULL,
  executed_at timestamp with time zone DEFAULT now(),
  success boolean NOT NULL DEFAULT true,
  error_message text
);

-- Grant permissions on migrations table
GRANT ALL ON migrations TO service_role, postgres, authenticated;

-- Verify it works
SELECT exec_sql('SELECT 1 as test') as verification;`;

async function initMigrations() {
  console.log('🚀 ChatNIL Migration System Initializer');
  console.log('═'.repeat(80));
  console.log('');
  console.log('This will set up the migration system in 2 easy steps:');
  console.log('');
  console.log('1️⃣  Copy SQL to clipboard (done automatically)');
  console.log('2️⃣  Paste into Supabase SQL Editor and run');
  console.log('');
  console.log('═'.repeat(80));
  console.log('');

  try {
    // Copy to clipboard using a temp file to avoid shell escaping issues
    console.log('📋 Copying SQL to clipboard...');
    const { writeFileSync, unlinkSync } = await import('fs');
    const tmpFile = '/tmp/chatnil-migration-setup.sql';
    writeFileSync(tmpFile, EXEC_SQL_FUNCTION);
    await execAsync(`cat "${tmpFile}" | pbcopy`);
    unlinkSync(tmpFile);
    console.log('   ✅ SQL copied to clipboard!');
    console.log('');

    console.log('═'.repeat(80));
    console.log('📝 NEXT STEP - Run in Supabase');
    console.log('═'.repeat(80));
    console.log('');
    console.log('1. Open: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql');
    console.log('2. Click "New Query"');
    console.log('3. Paste (Cmd+V) - SQL is already in your clipboard');
    console.log('4. Click "Run"');
    console.log('');
    console.log('You should see: {"success": true} at the bottom');
    console.log('');
    console.log('═'.repeat(80));
    console.log('After that, you can run migrations with:');
    console.log('');
    console.log('  ./migrate.sh migrations/your-migration.sql');
    console.log('  OR');
    console.log('  npx tsx scripts/run-migration.ts migrations/your-migration.sql');
    console.log('');

  } catch (error: any) {
    console.log('');
    console.log('❌ Could not copy to clipboard automatically.');
    console.log('');
    console.log('No problem! Just copy this SQL manually:');
    console.log('');
    console.log('─'.repeat(80));
    console.log(EXEC_SQL_FUNCTION);
    console.log('─'.repeat(80));
    console.log('');
  }
}

initMigrations();
