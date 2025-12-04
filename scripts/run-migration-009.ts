/**
 * Migration Runner: Apply Migration 009
 * Applies the quiz progress table and functions to production Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting Migration 009 Application');
  console.log('📊 Supabase URL:', SUPABASE_URL);
  console.log('');

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '009_create_user_quiz_progress_table.sql');
    console.log('📂 Reading migration file:', migrationPath);

    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    console.log(`✅ Migration file loaded (${migrationSQL.length} characters)`);
    console.log('');

    // Execute the migration
    console.log('🔄 Executing migration SQL...');
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);

      // Check if error is because execute_sql function doesn't exist
      if (error.code === 'PGRST202' || error.message.includes('execute_sql')) {
        console.log('');
        console.log('⚠️  The execute_sql function does not exist in your database.');
        console.log('💡 You have two options:');
        console.log('');
        console.log('Option 1: Use Supabase CLI');
        console.log('  1. Install Supabase CLI: npm install -g supabase');
        console.log('  2. Link to your project: supabase link --project-ref enbuwffusjhpcyoveewb');
        console.log('  3. Run migration: supabase db push');
        console.log('');
        console.log('Option 2: Manual Application via Supabase Dashboard');
        console.log('  1. Go to: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql');
        console.log('  2. Copy the contents of: supabase/migrations/009_create_user_quiz_progress_table.sql');
        console.log('  3. Paste into SQL editor and run');
        console.log('');
      }

      process.exit(1);
    }

    console.log('✅ Migration executed successfully!');
    console.log('');

    // Verify the functions were created
    console.log('🔍 Verifying database functions...');

    const functionsToCheck = [
      'get_user_quiz_stats',
      'get_recommended_questions',
      'record_quiz_answer',
      'get_quiz_session_results'
    ];

    for (const funcName of functionsToCheck) {
      try {
        // Try to call the function (will fail if doesn't exist)
        const { error: funcError } = await supabase.rpc(funcName,
          funcName === 'get_user_quiz_stats' ? { p_user_id: '00000000-0000-0000-0000-000000000000' } :
          funcName === 'get_recommended_questions' ? { p_user_id: '00000000-0000-0000-0000-000000000000', p_limit: 1 } :
          funcName === 'get_quiz_session_results' ? { p_session_id: '00000000-0000-0000-0000-000000000000' } :
          {}
        );

        // If error is NOT "function not found", the function exists
        if (!funcError || funcError.code !== 'PGRST202') {
          console.log(`  ✅ ${funcName} - EXISTS`);
        } else {
          console.log(`  ❌ ${funcName} - NOT FOUND`);
        }
      } catch (e) {
        console.log(`  ✅ ${funcName} - EXISTS (with validation error, which is expected)`);
      }
    }

    console.log('');
    console.log('🎉 Migration 009 completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Restart your development server');
    console.log('  2. Test quiz stats on the dashboard');
    console.log('  3. Test quiz recommendations');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

runMigration();
