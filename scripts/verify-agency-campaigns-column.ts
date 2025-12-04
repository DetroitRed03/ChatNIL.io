import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkColumn() {
  console.log('Checking agency_campaigns table structure...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'agency_campaigns'
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  console.log('✅ Columns found:');
  console.log(JSON.stringify(data, null, 2));

  const hasAgencyId = data?.some((col: any) => col.column_name === 'agency_id');
  console.log(`\n${hasAgencyId ? '✅' : '❌'} agency_id column ${hasAgencyId ? 'EXISTS' : 'DOES NOT EXIST'}`);
}

checkColumn();
