import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 CHECKING ATHLETE_FMV_DATA TABLE SCHEMA\n');

  // Try to query with minimal columns
  const { data, error } = await supabase
    .from('athlete_fmv_data')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error querying table:', error.message);
    console.log('Code:', error.code);
    console.log('\nThis table might not exist yet. Let me check if we need to create it.');

    // Check if table exists by trying to describe it via RPC
    console.log('\nAttempting to check table existence...');
  } else if (data) {
    console.log('✅ Table exists and is queryable');
    console.log('Sample row structure:', JSON.stringify(data[0] || {}, null, 2));
  } else {
    console.log('⚠️  Table exists but is empty');
    console.log('We can try inserting a minimal record to see what columns are accepted.');
  }
}

checkSchema().catch(console.error);
