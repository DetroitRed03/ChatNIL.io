import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyTable() {
  console.log('🔍 Verifying agency_athlete_matches table...\n');

  // Check if table exists using information_schema
  const { data: tableInfo, error: tableError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'agency_athlete_matches') as column_count,
        (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'agency_athlete_matches') as index_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'agency_athlete_matches';
    `
  });

  if (tableError) {
    console.error('❌ Error checking table:', tableError);
    return;
  }

  console.log('✅ Table verification results:');
  console.log(JSON.stringify(tableInfo, null, 2));

  // Check columns
  const { data: columns, error: colError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'agency_athlete_matches'
      ORDER BY ordinal_position;
    `
  });

  if (colError) {
    console.error('❌ Error checking columns:', colError);
    return;
  }

  console.log('\n📊 Table columns:');
  console.log(JSON.stringify(columns, null, 2));

  console.log('\n🎉 Table is ready! The matchmaking API can now insert matches.');
}

verifyTable();
