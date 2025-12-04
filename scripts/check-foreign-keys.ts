import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkForeignKeys() {
  console.log('🔍 Checking foreign key relationships on athlete_profiles...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        conname AS constraint_name,
        conrelid::regclass AS table_name,
        a.attname AS column_name,
        confrelid::regclass AS foreign_table_name,
        af.attname AS foreign_column_name
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = ANY(c.confkey)
      WHERE c.contype = 'f'
        AND c.conrelid = 'athlete_profiles'::regclass;
    `
  });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No foreign keys found on athlete_profiles table');
    console.log('\n💡 This explains why the join failed - there is no FK relationship with users table');
  } else {
    console.log('✅ Foreign keys on athlete_profiles:');
    console.log(JSON.stringify(data, null, 2));
  }

  // Also check if we can manually join the data
  console.log('\n🧪 Testing manual join query...');
  const { data: joinData, error: joinError } = await supabase
    .from('athlete_profiles')
    .select(`
      *,
      users!athlete_profiles_user_id_fkey(
        id,
        username,
        email,
        full_name,
        profile_photo_url
      )
    `)
    .limit(1);

  if (joinError) {
    console.error('❌ Join error:', joinError);
    console.log('\n💡 Trying alternative join syntax...');

    const { data: altJoinData, error: altJoinError } = await supabase
      .from('athlete_profiles')
      .select(`
        *,
        users(
          id,
          username,
          email,
          full_name,
          profile_photo_url
        )
      `)
      .limit(1);

    if (altJoinError) {
      console.error('❌ Alternative join also failed:', altJoinError);
    } else {
      console.log('✅ Alternative join successful!');
      console.log(JSON.stringify(altJoinData, null, 2));
    }
  } else {
    console.log('✅ Join successful with FK syntax!');
    console.log(JSON.stringify(joinData, null, 2));
  }
}

checkForeignKeys();
