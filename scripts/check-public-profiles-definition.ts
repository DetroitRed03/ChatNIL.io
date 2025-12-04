import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPublicProfilesDefinition() {
  console.log('🔍 Checking athlete_public_profiles definition...\n');

  // Check if it's a table or view
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = 'athlete_public_profiles';
    `
  });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 Table/View info:');
  console.log(data);

  // If it's a view, get the view definition
  const { data: viewDef, error: viewError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT definition
      FROM pg_views
      WHERE schemaname = 'public'
        AND viewname = 'athlete_public_profiles';
    `
  });

  if (viewError) {
    console.error('❌ Error getting view definition:', viewError);
  } else if (viewDef && viewDef.length > 0) {
    console.log('\n📝 View definition:');
    console.log(viewDef);
  }

  // Check user_id column in athlete_profiles
  console.log('\n🔍 Checking user_id values in athlete_profiles...');
  const { data: userIds, error: userError } = await supabase
    .from('athlete_profiles')
    .select('user_id')
    .limit(5);

  if (userError) {
    console.error('❌ Error:', userError);
  } else {
    console.log('Sample user_ids from athlete_profiles:');
    console.log(userIds);

    // Check if these users exist in users table
    if (userIds && userIds.length > 0) {
      const ids = userIds.map(row => row.user_id);
      console.log('\n🔍 Checking if these users exist in users table...');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, email, full_name')
        .in('id', ids);

      if (usersError) {
        console.error('❌ Error:', usersError);
      } else {
        console.log('✅ Matching users found:');
        console.log(users);
      }
    }
  }
}

checkPublicProfilesDefinition();
