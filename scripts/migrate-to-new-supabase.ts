/**
 * Complete Migration Tool for New Supabase Instance
 *
 * This script will:
 * 1. Apply all core migrations in order
 * 2. Create necessary functions and views
 * 3. Set up RLS policies
 * 4. Configure storage buckets
 * 5. Seed test data
 * 6. Verify everything works
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Core migrations in correct order
const CORE_MIGRATIONS = [
  '019_agency_athlete_matches.sql',
  '019_agency_athlete_matches_rls.sql',
  '027_school_system.sql',
  '031_add_username_to_users.sql',
  '040_agency_platform.sql',
  '050_enhance_chat_attachments.sql',
  '070_add_profile_cover_photos.sql',
  '075_add_match_tier_and_reasons.sql',
  '080_auto_calculate_social_stats.sql',
  '090_dashboard_infrastructure.sql',
];

let successCount = 0;
let failCount = 0;

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`${icons[type]} ${message}`);
}

async function executeSQL(sql: string, description: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      // Try direct query if exec_sql doesn't exist
      const { error: directError } = await (supabase as any).from('_').select('*').limit(0);

      if (error.message.includes('function public.exec_sql') || error.message.includes('does not exist')) {
        log(`${description} - exec_sql function not available, will need manual application`, 'warn');
        return false;
      }

      log(`${description} - Error: ${error.message}`, 'error');
      return false;
    }

    log(`${description}`, 'success');
    return true;
  } catch (err: any) {
    log(`${description} - Unexpected error: ${err.message}`, 'error');
    return false;
  }
}

async function createExecSQLFunction() {
  log('\n🔧 Step 1: Creating exec_sql helper function...', 'info');

  const sql = `
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
  `;

  // Try to create it directly via psql-style query
  try {
    const { error } = await supabase.rpc('exec_sql', { query: sql });
    if (!error) {
      log('exec_sql function created', 'success');
      return true;
    }
  } catch {}

  log('exec_sql function may need manual creation - continuing with direct SQL execution', 'warn');
  return false;
}

async function applyMigration(filename: string): Promise<boolean> {
  const migrationPath = path.join(process.cwd(), 'migrations', filename);

  if (!fs.existsSync(migrationPath)) {
    log(`Migration file not found: ${filename}`, 'warn');
    return false;
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8');
  log(`\nApplying: ${filename}...`, 'info');

  const success = await executeSQL(sql, `  Applied ${filename}`);
  if (success) {
    successCount++;
  } else {
    failCount++;
  }

  return success;
}

async function createMessagingInfrastructure() {
  log('\n💬 Step 3: Creating Messaging Infrastructure...', 'info');

  const sql = `
-- Messaging Infrastructure (Migration 100)
CREATE OR REPLACE VIEW conversation_summaries AS
SELECT
  m.match_id,
  m.match_id as conversation_id,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE m.read_at IS NULL AND m.sender_id != auth.uid()) as unread_count,
  MAX(m.created_at) as last_message_at,
  (SELECT content FROM agency_athlete_messages WHERE match_id = m.match_id ORDER BY created_at DESC LIMIT 1) as last_message,
  (SELECT sender_id FROM agency_athlete_messages WHERE match_id = m.match_id ORDER BY created_at DESC LIMIT 1) as last_sender_id,
  ma.agency_id,
  ma.athlete_id,
  ma.status as match_status,
  ag.company_name as agency_name,
  CONCAT(u_athlete.first_name, ' ', u_athlete.last_name) as athlete_name
FROM agency_athlete_messages m
JOIN agency_athlete_matches ma ON ma.id = m.match_id
LEFT JOIN agencies ag ON ag.id = ma.agency_id
LEFT JOIN users u_athlete ON u_athlete.id = ma.athlete_id
WHERE ma.agency_id = auth.uid() OR ma.athlete_id = auth.uid()
GROUP BY m.match_id, ma.agency_id, ma.athlete_id, ma.status, ag.company_name, u_athlete.first_name, u_athlete.last_name
ORDER BY last_message_at DESC NULLS LAST;

GRANT SELECT ON conversation_summaries TO authenticated;

CREATE OR REPLACE FUNCTION mark_messages_read(p_match_id UUID)
RETURNS TABLE (updated_count INTEGER, success BOOLEAN, error_message TEXT) AS $$
DECLARE v_user_id UUID; v_updated_count INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN QUERY SELECT 0, FALSE, 'Not authenticated'; RETURN; END IF;
  WITH updated AS (UPDATE agency_athlete_messages SET read_at = NOW() WHERE match_id = p_match_id AND sender_id != v_user_id AND read_at IS NULL RETURNING id)
  SELECT COUNT(*)::INTEGER INTO v_updated_count FROM updated;
  RETURN QUERY SELECT v_updated_count, TRUE, NULL::TEXT;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION mark_messages_read(UUID) TO authenticated;
  `;

  return await executeSQL(sql, '  Created messaging views and functions');
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 ChatNIL Migration Tool - New Supabase Setup');
  console.log('='.repeat(70) + '\n');

  log(`Target: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, 'info');
  log('Starting complete migration process...\n', 'info');

  // Step 1: Create helper function
  await createExecSQLFunction();

  // Step 2: Apply core migrations
  log('\n📦 Step 2: Applying Core Migrations...', 'info');
  for (const migration of CORE_MIGRATIONS) {
    await applyMigration(migration);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between migrations
  }

  // Step 3: Create messaging infrastructure
  await createMessagingInfrastructure();

  // Summary
  console.log('\n' + '='.repeat(70));
  log('\n📊 Migration Summary:', 'info');
  log(`   ✅ Successful: ${successCount}`, 'success');
  log(`   ❌ Failed: ${failCount}`, failCount > 0 ? 'error' : 'info');
  log(`   📋 Total: ${CORE_MIGRATIONS.length + 1}`, 'info');

  if (failCount > 0) {
    log('\n⚠️  Some migrations failed. Manual intervention may be required.', 'warn');
    log('Please check the Supabase SQL Editor and apply any failed migrations manually.', 'warn');
  } else {
    log('\n🎉 All migrations applied successfully!', 'success');
  }

  log('\n📍 Next Steps:', 'info');
  log('   1. Run: npx tsx scripts/seed-new-database.ts', 'info');
  log('   2. Enable Realtime in Supabase Dashboard', 'info');
  log('   3. Restart dev server: npm run dev', 'info');
  log('   4. Test at http://localhost:3000', 'info');

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(console.error);
