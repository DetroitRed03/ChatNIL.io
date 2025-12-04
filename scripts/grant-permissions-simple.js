const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 Supabase URL:', supabaseUrl);
console.log('🔐 Service role key configured:', !!supabaseServiceRoleKey);
console.log('🔐 Service role key length:', supabaseServiceRoleKey?.length);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function grantPermissions() {
  console.log('\n📝 Testing table access first...\n');

  // Test if we can access the table
  const { data: testData, error: testError } = await supabase
    .from('chat_sessions')
    .select('id')
    .limit(1);

  if (testError) {
    console.error('❌ Cannot access chat_sessions:', testError.message);
    console.error('Error code:', testError.code);

    if (testError.code === '42501') {
      console.log('\n✅ Confirmed: Permission denied error');
      console.log('\n📋 You need to run this SQL in Supabase SQL Editor:\n');
      console.log('GRANT ALL ON chat_sessions TO service_role;');
      console.log('GRANT ALL ON chat_messages TO service_role;\n');
      console.log('🔗 Open: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql/new');
    }
  } else {
    console.log('✅ Can access chat_sessions table!');
    console.log('✅ Permissions are already granted!');
  }
}

grantPermissions();
