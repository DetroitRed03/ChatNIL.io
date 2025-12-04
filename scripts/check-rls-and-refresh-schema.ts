import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function checkAndRefresh() {
  console.log('=== Checking RLS Status ===\n');

  // Check if RLS is enabled on the tables
  const { data: rlsStatus, error: rlsError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT
        tablename,
        CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE schemaname = 'public'
        AND tablename IN ('agency_campaigns', 'agency_athlete_lists')
      ORDER BY tablename;
    `
  });

  if (rlsError) {
    console.error('Error checking RLS:', rlsError);
  } else {
    console.log('RLS Status:');
    console.log(JSON.stringify(rlsStatus, null, 2));
  }

  console.log('\n=== Refreshing PostgREST Schema ===\n');

  // Send NOTIFY to refresh schema
  const { error: notifyError } = await supabase.rpc('exec_sql', {
    query: "NOTIFY pgrst, 'reload schema';"
  });

  if (notifyError) {
    console.error('Error sending NOTIFY:', notifyError);
  } else {
    console.log('✅ NOTIFY pgrst sent successfully');
    console.log('⏳ Wait 5-10 seconds for PostgREST to reload...');
  }

  console.log('\n=== Testing Direct Table Access ===\n');

  // Try to fetch from agency_campaigns without filters
  const { data: campaigns, error: campaignsError } = await supabase
    .from('agency_campaigns')
    .select('id, name, agency_id')
    .limit(3);

  if (campaignsError) {
    console.error('❌ Error fetching campaigns:', campaignsError);
  } else {
    console.log('✅ Campaigns fetched successfully:');
    console.log(JSON.stringify(campaigns, null, 2));
  }

  // Try to fetch from agency_athlete_lists
  const { data: athletes, error: athletesError } = await supabase
    .from('agency_athlete_lists')
    .select('*')
    .limit(3);

  if (athletesError) {
    console.error('❌ Error fetching athlete lists:', athletesError);
  } else {
    console.log('\n✅ Athlete lists fetched successfully:');
    console.log(JSON.stringify(athletes, null, 2));
  }
}

checkAndRefresh();
