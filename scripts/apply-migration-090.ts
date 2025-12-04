/**
 * Apply Migration 090: Dashboard Infrastructure
 *
 * Creates:
 * - 3 materialized views for dashboard performance
 * - 4 new tables for messages, notifications, analytics, audit logs
 * - 10+ performance indexes
 * - 3 trigger functions for auto-updates
 * - pg_cron schedules for materialized view auto-refresh
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log('🚀 Starting Migration 090: Dashboard Infrastructure\n');
  console.log('━'.repeat(60) + '\n');

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '090_dashboard_infrastructure.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log(`📋 Loaded migration file (${migrationSQL.length} characters)\n`);
    console.log('Executing entire migration as a single transaction...\n');

    // Execute the entire migration as one statement
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      if (error.details) console.error('   Details:', error.details);
      if (error.hint) console.error('   Hint:', error.hint);
      throw error;
    }

    console.log('✅ Migration SQL executed successfully\n');
    console.log('━'.repeat(60) + '\n');

    // Wait a moment for everything to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Verify materialized views
    console.log('🔍 Verifying materialized views...\n');

    try {
      const { data: athleteMetrics, error: athleteError } = await supabase
        .from('athlete_dashboard_metrics')
        .select('athlete_id')
        .limit(1);

      if (athleteError) {
        console.error('❌ athlete_dashboard_metrics:', athleteError.message);
      } else {
        console.log('✅ athlete_dashboard_metrics created and accessible');
      }
    } catch (err: any) {
      console.error('❌ athlete_dashboard_metrics:', err.message);
    }

    try {
      const { data: agencyMetrics, error: agencyError } = await supabase
        .from('agency_dashboard_metrics')
        .select('agency_id')
        .limit(1);

      if (agencyError) {
        console.error('❌ agency_dashboard_metrics:', agencyError.message);
      } else {
        console.log('✅ agency_dashboard_metrics created and accessible');
      }
    } catch (err: any) {
      console.error('❌ agency_dashboard_metrics:', err.message);
    }

    try {
      const { data: activityFeed, error: activityError } = await supabase
        .from('activity_feed')
        .select('activity_id')
        .limit(1);

      if (activityError) {
        console.error('❌ activity_feed:', activityError.message);
      } else {
        console.log('✅ activity_feed created and accessible');
      }
    } catch (err: any) {
      console.error('❌ activity_feed:', err.message);
    }

    // Verify new tables
    console.log('\n🔍 Verifying new tables...\n');

    try {
      const { data: threads, error: threadsError } = await supabase
        .from('message_threads')
        .select('id')
        .limit(1);

      if (threadsError) {
        console.error('❌ message_threads:', threadsError.message);
      } else {
        console.log('✅ message_threads created and accessible');
      }
    } catch (err: any) {
      console.error('❌ message_threads:', err.message);
    }

    try {
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

      if (notificationsError) {
        console.error('❌ notifications:', notificationsError.message);
      } else {
        console.log('✅ notifications created and accessible');
      }
    } catch (err: any) {
      console.error('❌ notifications:', err.message);
    }

    console.log('\n' + '━'.repeat(60));
    console.log('✨ Migration 090 Complete!\n');
    console.log('Dashboard infrastructure is ready for use.');
    console.log('━'.repeat(60) + '\n');

    console.log('Next steps:');
    console.log('1. Build API endpoints to query materialized views');
    console.log('2. Create dashboard UI components');
    console.log('3. Set up real-time subscriptions for notifications\n');

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
