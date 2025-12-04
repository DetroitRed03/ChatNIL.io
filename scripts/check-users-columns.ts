/**
 * Check what columns actually exist in the users table
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkUsersColumns() {
  console.log('🔍 Checking users table columns...\n');

  // Query the information schema to see what columns exist
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'users'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    console.error('❌ Error querying schema:', error);
    console.log('\nTrying direct query...');

    // Try getting a single user to see what fields come back
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
    } else {
      console.log('✅ Sample user data:');
      console.log('   Available fields:', Object.keys(user || {}));
    }
  } else {
    console.log('✅ Users table columns:');
    console.table(data);
  }
}

checkUsersColumns().catch(console.error);
