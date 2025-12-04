import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lqskiijspudfocddhkqs.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I'
);

async function checkTable() {
  console.log('🔍 Checking if quiz_sessions table exists...\n');

  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('id')
    .limit(1);

  if (error) {
    console.log('❌ Error accessing quiz_sessions table:');
    console.log('   Code:', error.code);
    console.log('   Message:', error.message);
  } else {
    console.log('✅ quiz_sessions table exists!');
    console.log('   Sample data count:', data?.length || 0);
  }
}

checkTable();
