import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkColumns() {
  console.log('🔍 Checking athlete_profiles columns...\n');

  // Get one record to see actual structure
  const { data, error } = await supabase
    .from('athlete_profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('📋 Available columns:');
    console.log(Object.keys(data[0]).sort().join('\n'));
    console.log('\n📊 Sample record:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('❌ No data found');
  }
}

checkColumns();
