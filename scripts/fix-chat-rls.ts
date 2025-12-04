/**
 * Fix RLS Policies for Chat Tables
 * This script fixes the permission denied errors on chat_sessions and chat_messages
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixChatRLS() {
  console.log('🔧 Fixing Chat RLS Policies\n');
  console.log('=' .repeat(80));

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/013_fix_chat_rls_policies.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('\n📄 Migration file: 013_fix_chat_rls_policies.sql');
    console.log(`📏 Size: ${sql.length} characters`);
    console.log('\n🚀 Executing migration...\n');

    // Execute the migration using exec_sql
    const { data, error } = await supabase.rpc('exec_sql', {
      query: sql
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      console.error('\nError details:');
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      console.error('  Details:', error.details);
      console.error('  Hint:', error.hint);
      process.exit(1);
    }

    if (data && data.success === false) {
      console.error('❌ Migration returned error:', data.error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!\n');

    // Verify the fix by checking policies
    console.log('🔍 Verifying RLS policies...\n');

    const { data: policiesData, error: policiesError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          tablename,
          policyname,
          cmd,
          roles,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename IN ('chat_sessions', 'chat_messages')
        ORDER BY tablename, policyname;
      `
    });

    if (policiesError) {
      console.error('⚠️  Could not verify policies:', policiesError.message);
    } else {
      console.log('✅ RLS policies verified\n');
    }

    // Check table permissions
    console.log('🔍 Verifying table permissions...\n');

    const { data: permsData, error: permsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          table_name,
          grantee,
          string_agg(privilege_type, ', ') as privileges
        FROM information_schema.table_privileges
        WHERE table_name IN ('chat_sessions', 'chat_messages')
          AND grantee = 'authenticated'
        GROUP BY table_name, grantee
        ORDER BY table_name;
      `
    });

    if (permsError) {
      console.error('⚠️  Could not verify permissions:', permsError.message);
    } else {
      console.log('✅ Table permissions verified\n');
    }

    console.log('=' .repeat(80));
    console.log('\n✅ RLS Fix Complete!\n');
    console.log('Next steps:');
    console.log('  1. Refresh the debug page: http://localhost:3000/debug-chat-persistence.html');
    console.log('  2. Click "Test RLS Policies" - should now pass');
    console.log('  3. Click "Create Test Chat" - should successfully create a chat');
    console.log('  4. Refresh the page - chat should persist!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

fixChatRLS();
