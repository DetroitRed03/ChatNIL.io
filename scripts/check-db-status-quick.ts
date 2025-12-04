import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickCheck() {
  console.log('🔍 Quick Database Status Check\n');
  console.log('='.repeat(60));

  // Check critical tables
  const tables = [
    'nil_deals',
    'state_nil_rules',
    'campaigns',
    'agency_athlete_matches',
    'agencies',
    'athlete_fmv_data'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.message.includes('does not exist') || error.code === 'PGRST204') {
          console.log(`❌ ${table.padEnd(30)} - DOES NOT EXIST`);
        } else {
          console.log(`⚠️  ${table.padEnd(30)} - Error: ${error.message.substring(0, 40)}`);
        }
      } else {
        console.log(`✅ ${table.padEnd(30)} - ${count || 0} records`);
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(30)} - Table missing or inaccessible`);
    }
  }

  console.log('='.repeat(60));
}

quickCheck();
