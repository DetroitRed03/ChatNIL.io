import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchemas() {
  console.log('🔍 CHECKING ACTUAL TABLE SCHEMAS\n');
  console.log('='.repeat(80));

  // Check nil_deals columns
  console.log('\n1️⃣  nil_deals table columns:');
  const { data: nilDealsSchema, error: nilError } = await supabase
    .rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'nil_deals'
        ORDER BY ordinal_position;
      `
    });

  if (nilError) {
    console.log('   Using fallback query...');
    // Try a simple insert to see what columns are expected
    const { error: testError } = await supabase
      .from('nil_deals')
      .insert({
        athlete_id: '00000000-0000-0000-0000-000000000000',
        brand_name: 'Test',
        deal_type: 'sponsorship'
      })
      .select()
      .limit(0);

    if (testError) {
      console.log(`   Error: ${testError.message}`);
    }
  } else {
    console.log(nilDealsSchema);
  }

  // Check agency_campaigns columns
  console.log('\n2️⃣  agency_campaigns / campaigns table:');
  const { data: campaignsSchema, error: campError } = await supabase
    .rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name IN ('campaigns', 'agency_campaigns')
        ORDER BY table_name, ordinal_position;
      `
    });

  if (campError) {
    console.log(`   Error: ${campError.message}`);
  } else {
    console.log(campaignsSchema);
  }

  // Check agency_athlete_matches columns
  console.log('\n3️⃣  agency_athlete_matches table columns:');
  const { data: matchesSchema, error: matchError } = await supabase
    .rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'agency_athlete_matches'
        ORDER BY ordinal_position;
      `
    });

  if (matchError) {
    console.log(`   Error: ${matchError.message}`);
  } else {
    console.log(matchesSchema);
  }

  console.log('\n' + '='.repeat(80));
}

checkSchemas();
