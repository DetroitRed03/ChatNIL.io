import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://enbuwffusjhpcyoveewb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYnV3ZmZ1c2pocGN5b3ZlZXdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjcwOSwiZXhwIjoyMDc0MjYyNzA5fQ.fXvyvHrUoNLdAr1expbRsguM8fkmurrNQi3-7xk8-TM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyAndFix() {
  console.log('🔍 Verifying Dashboard Views');
  console.log('============================\n');

  try {
    // Check if views exist
    const { data: views, error: viewError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'VIEW'
        AND table_name IN ('athlete_dashboard_metrics', 'agency_dashboard_metrics', 'activity_feed');
      `
    });

    if (viewError) {
      console.error('❌ Error checking views:', viewError);
      return;
    }

    console.log('📊 Found views:', views);

    // Grant permissions
    console.log('\n🔐 Granting permissions...');
    const { error: permError } = await supabase.rpc('exec_sql', {
      query: `
        GRANT SELECT ON athlete_dashboard_metrics TO anon, authenticated, service_role;
        GRANT SELECT ON agency_dashboard_metrics TO anon, authenticated, service_role;
        GRANT SELECT ON activity_feed TO anon, authenticated, service_role;
      `
    });

    if (permError) {
      console.error('❌ Error granting permissions:', permError);
    } else {
      console.log('✅ Permissions granted successfully');
    }

    // Try to query the views directly
    console.log('\n🧪 Testing direct query...');
    const { data: testData, error: testError } = await supabase
      .from('athlete_dashboard_metrics')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Direct query failed:', testError);
    } else {
      console.log('✅ Direct query successful! Found', testData?.length || 0, 'rows');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

verifyAndFix();
