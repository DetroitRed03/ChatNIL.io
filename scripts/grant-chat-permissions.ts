import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('🔐 Supabase URL:', supabaseUrl);
console.log('🔐 Service role key configured:', !!supabaseServiceRoleKey);
console.log('🔐 Service role key length:', supabaseServiceRoleKey?.length);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function grantChatPermissions() {
  console.log('\n📝 Granting service_role permissions on chat tables...\n');

  // Grant permissions on chat_sessions
  const { error: error1 } = await supabaseAdmin.rpc('exec_sql', {
    sql: 'GRANT ALL ON chat_sessions TO service_role;'
  });

  if (error1) {
    console.error('❌ Error granting permissions on chat_sessions:', error1);
    // Try direct SQL approach
    console.log('\n⚠️ RPC failed, trying direct SQL execution...\n');

    const sqlStatements = [
      'GRANT ALL ON chat_sessions TO service_role;',
      'GRANT ALL ON chat_messages TO service_role;',
      'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;'
    ];

    for (const sql of sqlStatements) {
      console.log(`Executing: ${sql}`);
      const { error } = await supabaseAdmin.rpc('exec_sql', { sql });
      if (error) {
        console.error(`❌ Error: ${error.message}`);
      } else {
        console.log(`✅ Success`);
      }
    }
  } else {
    console.log('✅ Granted permissions on chat_sessions');

    // Grant permissions on chat_messages
    const { error: error2 } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'GRANT ALL ON chat_messages TO service_role;'
    });

    if (error2) {
      console.error('❌ Error granting permissions on chat_messages:', error2);
    } else {
      console.log('✅ Granted permissions on chat_messages');
    }

    // Grant sequence permissions
    const { error: error3 } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;'
    });

    if (error3) {
      console.error('❌ Error granting sequence permissions:', error3);
    } else {
      console.log('✅ Granted sequence permissions');
    }
  }

  // Verify the grants
  console.log('\n🔍 Verifying grants...\n');
  const { data, error } = await supabaseAdmin.rpc('exec_sql', {
    sql: `
      SELECT grantee, table_name, privilege_type
      FROM information_schema.role_table_grants
      WHERE table_name IN ('chat_sessions', 'chat_messages')
      AND grantee = 'service_role';
    `
  });

  if (error) {
    console.error('❌ Error verifying grants:', error);
    console.log('\n📋 Manual verification needed - run this in Supabase SQL Editor:');
    console.log(`
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('chat_sessions', 'chat_messages')
AND grantee = 'service_role';
    `);
  } else {
    console.log('✅ Grants verified:', data);
  }

  console.log('\n✅ Done!');
}

grantChatPermissions().catch(console.error);
