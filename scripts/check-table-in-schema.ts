import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lqskiijspudfocddhkqs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I'
);

async function checkSchema() {
  console.log('🔍 Checking database schema for quiz-related tables...\n');

  // Query information_schema to see what tables actually exist
  const { data, error } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name LIKE '%quiz%'
        ORDER BY table_name;
      `
    });

  if (error) {
    console.log('❌ Error querying schema:', error.message);
    console.log('\n💡 Trying direct SQL approach...\n');

    // Fallback: try to select from pg_tables
    const { data: pgData, error: pgError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .like('tablename', '%quiz%');

    if (pgError) {
      console.log('❌ Fallback also failed:', pgError.message);
    } else {
      console.log('✅ Found quiz tables:', pgData?.map(t => t.tablename).join(', '));
    }
  } else {
    console.log('✅ Found quiz tables in database:');
    data?.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });

    if (data?.find((row: any) => row.table_name === 'quiz_sessions')) {
      console.log('\n✅ quiz_sessions table EXISTS in the database!');
      console.log('   This means PostgREST schema cache is out of sync.');
    } else {
      console.log('\n❌ quiz_sessions table DOES NOT EXIST in the database!');
      console.log('   The table needs to be created via a migration.');
    }
  }
}

checkSchema();
