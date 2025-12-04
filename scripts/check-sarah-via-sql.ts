import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkViaSql() {
  console.log('🔍 Checking Sarah via direct SQL...\n');

  const userId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  // Check via direct SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT * FROM athlete_public_profiles
      WHERE user_id = '${userId}';
    `
  });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 SQL Query Result:');
  console.log(JSON.stringify(data, null, 2));

  // Also check if ANY profiles exist
  const { data: countData, error: countError } = await supabase.rpc('exec_sql', {
    query: 'SELECT COUNT(*) FROM athlete_public_profiles;'
  });

  console.log('\n📊 Total profiles in table:');
  console.log(JSON.stringify(countData, null, 2));
}

checkViaSql();
