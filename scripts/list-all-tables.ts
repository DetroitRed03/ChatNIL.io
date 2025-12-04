import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('📋 LISTING ALL TABLES IN PUBLIC SCHEMA\n');
  console.log('='.repeat(80));

  // Query information_schema to get actual table list
  const { data, error } = await supabase
    .from('information_schema.tables' as any)
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');

  if (error) {
    console.log('\n⚠️  Cannot query information_schema directly');
    console.log('   Trying alternative method...\n');

    // Alternative: Try to query known tables and see which exist
    const possibleTables = [
      'users',
      'athlete_profiles',
      'agencies',
      'agency_campaigns',
      'campaigns',
      'nil_deals',
      'state_nil_rules',
      'agency_athlete_matches',
      'athlete_fmv_data',
      'social_media_stats',
      'chat_sessions',
      'chat_messages'
    ];

    console.log('Testing common tables:\n');

    for (const table of possibleTables) {
      const { error: testError } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!testError || !testError.message.includes('does not exist')) {
        console.log(`✅ ${table}`);
      } else {
        console.log(`❌ ${table} - DOES NOT EXIST`);
      }
    }

  } else {
    console.log('\nTables found:');
    data.forEach((row: any) => {
      console.log(`  • ${row.table_name}`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

listTables();
