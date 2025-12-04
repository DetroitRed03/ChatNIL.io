import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://enbuwffusjhpcyoveewb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYnV3ZmZ1c2pocGN5b3ZlZXdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjcwOSwiZXhwIjoyMDc0MjYyNzA5fQ.fXvyvHrUoNLdAr1expbRsguM8fkmurrNQi3-7xk8-TM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function refreshViews() {
  console.log('🔄 Refreshing Dashboard Materialized Views');
  console.log('==========================================\n');

  const views = [
    'athlete_dashboard_metrics',
    'agency_dashboard_metrics',
    'activity_feed'
  ];

  for (const view of views) {
    try {
      console.log(`🔄 Refreshing ${view}...`);
      const { error } = await supabase.rpc('exec_sql', { 
        query: `REFRESH MATERIALIZED VIEW CONCURRENTLY ${view};` 
      });

      if (error) {
        console.error(`❌ Failed to refresh ${view}:`, error.message);
      } else {
        console.log(`✅ ${view} refreshed successfully`);
      }
    } catch (error: any) {
      console.error(`❌ Error refreshing ${view}:`, error.message);
    }
  }

  console.log('\n✨ All views refreshed!\n');
  console.log('🎯 You can now reload your dashboard to see data.');
}

refreshViews();
