/**
 * Apply Immediate Migrations: Chat, Quiz, and Vector Extension
 * Uses existing exec_sql function with correct parameter name: 'query'
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

const migrations = [
  { file: 'supabase/migrations/008_create_quiz_questions_table.sql', name: 'Quiz Questions Table' },
  { file: 'supabase/migrations/009_create_user_quiz_progress_table.sql', name: 'User Quiz Progress Table' },
  { file: 'supabase/migrations/010_create_chat_sessions_table.sql', name: 'Chat Sessions Table' },
  { file: 'supabase/migrations/011_create_chat_messages_table.sql', name: 'Chat Messages Table' },
  { file: 'supabase/migrations/012_enable_vector_and_knowledge_base.sql', name: 'Vector Extension & Knowledge Base' },
];

async function executeSQLFile(filePath: string, migrationName: string): Promise<boolean> {
  try {
    console.log(`📂 Reading: ${filePath}`);
    const sql = readFileSync(filePath, 'utf-8');

    console.log(`🔄 Executing ${migrationName}...\n`);

    // Use correct parameter name: 'query' not 'sql_query'
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql  // Changed from sql_query to query
    });

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
      console.error('Full error:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log(`   ✅ ${migrationName} executed successfully!\n`);
    return true;

  } catch (error) {
    console.error('❌ Failed to read or execute migration:', error);
    return false;
  }
}

async function checkExecSqlFunction(): Promise<boolean> {
  const { error } = await supabase.rpc('exec_sql', {
    query: 'SELECT 1;'  // Changed from sql_query to query
  });

  if (error) {
    if (error.code === 'PGRST202' || error.message.includes('exec_sql')) {
      console.error('❌ The exec_sql function does not exist in your database.\n');
      return false;
    }
  }

  return true;
}

async function runMigrations() {
  console.log('🚀 Applying Immediate Migrations');
  console.log('📊 Supabase URL:', SUPABASE_URL);
  console.log('');

  // Check if exec_sql function exists
  console.log('🔍 Checking for exec_sql function...');
  const hasExecSql = await checkExecSqlFunction();

  if (!hasExecSql) {
    console.error('exec_sql function not found. Cannot proceed.');
    process.exit(1);
  }

  console.log('✅ exec_sql function found!\n');

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

      const success = await executeSQLFile(filePath, migration.name);

      if (success) {
        successCount++;
      } else {
        failCount++;
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
      console.log('✅ Chat system ready (persistent storage)');
      console.log('✅ Quiz system ready (questions & progress tracking)');
      console.log('✅ Vector extension enabled (knowledge base for AI)');
      console.log('');
      console.log('Database tables created:');
      console.log('  • chat_sessions - stores chat conversations');
      console.log('  • chat_messages - stores individual messages');
      console.log('  • quiz_questions - NIL education quiz questions');
      console.log('  • user_quiz_progress - tracks user quiz attempts');
      console.log('  • knowledge_base - vector-enabled content storage (OpenAI embeddings)');
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
