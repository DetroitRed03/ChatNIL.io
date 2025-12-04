/**
 * Apply ALL Migrations: Including exec_sql function + immediate migrations
 * This script applies migration 001 first, then 008, 009, 010, 011, 012
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// First create exec_sql function, then apply other migrations
const migrations = [
  { file: 'migrations/001_create_sql_executor.sql', name: 'SQL Executor Function', useRpc: false },
  { file: 'supabase/migrations/008_create_quiz_questions_table.sql', name: 'Quiz Questions Table', useRpc: true },
  { file: 'supabase/migrations/009_create_user_quiz_progress_table.sql', name: 'User Quiz Progress Table', useRpc: true },
  { file: 'supabase/migrations/010_create_chat_sessions_table.sql', name: 'Chat Sessions Table', useRpc: true },
  { file: 'supabase/migrations/011_create_chat_messages_table.sql', name: 'Chat Messages Table', useRpc: true },
  { file: 'supabase/migrations/012_enable_vector_and_knowledge_base.sql', name: 'Vector Extension & Knowledge Base', useRpc: true },
];

async function executeDirectSQL(sql: string): Promise<{ success: boolean; error?: any }> {
  try {
    // For the first migration (creating exec_sql), we need to use direct SQL execution
    // via the Postgres REST API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // Try alternative method using the Supabase client directly
      // This won't work for DDL but let's try
      const { error } = await (supabase as any).rpc('query', { query: sql });

      if (error) {
        return { success: false, error };
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

async function executeSQLFile(filePath: string, migrationName: string, useRpc: boolean): Promise<boolean> {
  try {
    console.log(`📂 Reading: ${filePath}`);
    const sql = readFileSync(filePath, 'utf-8');

    console.log(`🔄 Executing ${migrationName}...\n`);

    let error;

    if (useRpc) {
      // Use exec_sql function
      const result = await supabase.rpc('exec_sql', {
        sql_query: sql
      });
      error = result.error;
    } else {
      // Direct SQL execution for migration 001
      const result = await executeDirectSQL(sql);
      if (!result.success) {
        error = result.error;
      }
    }

    if (error) {
      // Check if it's a "already exists" error - these are safe to ignore
      if (
        error.message?.includes('already exists') ||
        error.message?.includes('duplicate key') ||
        error.code === '42P07' || // duplicate table
        error.code === '42710' || // duplicate object
        error.code === '42723'    // duplicate function
      ) {
        console.log(`   ⚠️  ${migrationName}: Already exists (skipping)\n`);
        return true;
      }

      console.error(`   ❌ ${migrationName} failed:`, error);
      console.error('\nFull error details:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log(`   ✅ ${migrationName} executed successfully!\n`);
    return true;

  } catch (error) {
    console.error('❌ Failed to read or execute migration:', error);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Applying All Required Migrations');
  console.log('📊 Supabase URL:', SUPABASE_URL);
  console.log('');

  try {
    let successCount = 0;
    let failCount = 0;

    for (const migration of migrations) {
      const filePath = join(process.cwd(), migration.file);

      console.log(`${'='.repeat(80)}`);
      console.log(`📋 Migration: ${migration.name}`);
      console.log(`📄 File: ${migration.file}`);
      console.log('='.repeat(80));
      console.log('');

      const success = await executeSQLFile(filePath, migration.name, migration.useRpc);

      if (success) {
        successCount++;
      } else {
        failCount++;

        // Special handling for migration 001 failure
        if (migration.file.includes('001_create_sql_executor')) {
          console.log('\n⚠️  Could not create exec_sql function programmatically.');
          console.log('This is expected - you need to run Migration 001 manually in Supabase Dashboard.\n');
          console.log('Please do the following:');
          console.log('1. Go to: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql');
          console.log('2. Copy the contents of: migrations/001_create_sql_executor.sql');
          console.log('3. Paste into SQL Editor and click "Run"');
          console.log('4. Then run this script again\n');
          process.exit(1);
        }

        console.log('⚠️  Migration failed. Stopping here.\n');
        break;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successful: ${successCount}/${migrations.length}`);
    console.log(`❌ Failed: ${failCount}/${migrations.length}`);
    console.log('');

    if (failCount === 0) {
      console.log('🎉 All migrations completed successfully!\n');
      console.log('✅ SQL Executor function created');
      console.log('✅ Chat system ready (persistent storage)');
      console.log('✅ Quiz system ready (questions & progress tracking)');
      console.log('✅ Vector extension enabled (knowledge base for AI)');
      console.log('');
      console.log('Next steps:');
      console.log('  1. Update lib/dashboard-data.ts to query real chat_sessions');
      console.log('  2. Test chat persistence on dashboard');
      console.log('  3. Verify quiz stats display without errors\n');
    } else {
      console.log('⚠️  Some migrations failed. Please review errors above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Unexpected error during migration:', error);
    process.exit(1);
  }
}

runMigrations();
