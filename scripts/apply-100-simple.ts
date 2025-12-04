import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SQL = readFileSync('migrations/100_agency_dashboard_infrastructure.sql', 'utf-8');

const supabase = createClient(
  'https://lqskiijspudfocddkhqs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRraHFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I'
);

console.log('🔄 Applying Migration 100...\n');

supabase.rpc('exec_sql', { query: SQL })
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
    console.log('✅ Migration 100 applied successfully!');
    console.log('\n📦 Created:');
    console.log('  - 6 tables (campaigns, campaign_athletes, campaign_metrics, etc.)');
    console.log('  - 3 views (agency_dashboard_stats, campaign_performance_detail, agency_athlete_roster)');
    console.log('  - 3 functions (update_campaign_metrics, log_agency_activity, get_agency_dashboard_stats)');
    console.log('  - All RLS policies and indexes');
  });
