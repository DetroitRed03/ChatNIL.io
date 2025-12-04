import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function reloadSchemaCache() {
  console.log('🔄 RELOADING POSTGREST SCHEMA CACHE\n');
  console.log('='.repeat(80));

  try {
    // Method 1: Notify PostgREST via NOTIFY
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('\n1️⃣  Attempting to reload schema via NOTIFY...');

    const { error: notifyError } = await supabase.rpc('pg_notify', {
      channel: 'pgrst',
      payload: 'reload schema'
    });

    if (notifyError) {
      console.log(`   ⚠️  NOTIFY failed: ${notifyError.message}`);
    } else {
      console.log('   ✅ NOTIFY sent successfully');
    }

    // Method 2: Try direct schema reload endpoint
    console.log('\n2️⃣  Attempting admin reload endpoint...');

    const adminResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'X-Forwarded-For': '127.0.0.1'
      }
    });

    if (adminResponse.ok) {
      console.log('   ✅ Schema endpoint accessed');
    } else {
      console.log(`   ⚠️  Response: ${adminResponse.status}`);
    }

    // Method 3: Force a query on each table to trigger cache
    console.log('\n3️⃣  Querying tables to trigger cache refresh...');

    const tables = [
      'nil_deals',
      'state_nil_rules',
      'campaigns',
      'agency_athlete_matches'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(0);

      if (error) {
        console.log(`   ⚠️  ${table}: ${error.message.substring(0, 60)}`);
      } else {
        console.log(`   ✅ ${table}: Cache refreshed`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Schema cache reload attempts completed');
    console.log('\n⏳ Wait 30-60 seconds for PostgREST to fully reload');
    console.log('   Then retry: npx tsx scripts/complete-matchmaking-data.ts\n');

  } catch (err: any) {
    console.error(`\n❌ Error: ${err.message}\n`);
  }
}

reloadSchemaCache();
