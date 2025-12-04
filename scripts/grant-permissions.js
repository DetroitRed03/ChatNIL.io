const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 Supabase URL:', supabaseUrl);
console.log('🔐 Service role key configured:', !!supabaseServiceRoleKey);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function grantPermissions() {
  console.log('\n📝 Granting service_role permissions on chat tables...\n');

  const sql = `
    -- Grant ALL permissions on chat tables to service_role
    GRANT ALL ON chat_sessions TO service_role;
    GRANT ALL ON chat_messages TO service_role;

    -- Grant sequence permissions
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
  `;

  try {
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ Error executing SQL via RPC:', error.message);
      console.log('\n⚠️  RPC method failed. Trying direct table operations...\n');

      // Test if we can at least query the tables
      const { data: testData, error: testError } = await supabase
        .from('chat_sessions')
        .select('count');

      if (testError) {
        console.error('❌ Cannot access chat_sessions:', testError.message);
        console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
        console.log(sql);
      } else {
        console.log('✅ Can access chat_sessions table');
        console.log('\n⚠️  But GRANT statements need to be run in SQL Editor.');
        console.log('\n📋 SQL to run:');
        console.log(sql);
      }
    } else {
      console.log('✅ SQL executed successfully!');
      console.log('Result:', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log(sql);
  }
}

grantPermissions();
