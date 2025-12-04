import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkTableStructure() {
  console.log('🔍 Checking table structure...\n');

  // Try to select from social_media_stats with different column names
  console.log('Testing social_media_stats table:');

  // Try with user_id
  const { data: test1, error: error1 } = await supabase
    .from('social_media_stats')
    .select('*')
    .limit(1);

  if (error1) {
    console.log(`❌ Error: ${error1.message}`);
  } else if (test1 && test1.length > 0) {
    console.log('✅ Table exists! Sample record:');
    console.log(JSON.stringify(test1[0], null, 2));
  } else {
    console.log('⚠️  Table exists but has no records');
  }

  // Check if table exists at all
  const { data: tables, error: tablesError } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'social_media_stats'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

  if (tablesError) {
    console.log(`\n❌ Can't query information_schema: ${tablesError.message}`);
  } else {
    console.log('\n📋 Column structure:');
    console.log(tables);
  }
}

checkTableStructure().catch(console.error);
