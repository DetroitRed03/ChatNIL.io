import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function getColumns() {
  console.log('🔍 Fetching athlete_profiles table columns...\n');

  const { data, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'athlete_profiles'
        ORDER BY ordinal_position;
      `
    });

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('✅ Columns in athlete_profiles table:\n');
  console.table(data);
}

getColumns();
