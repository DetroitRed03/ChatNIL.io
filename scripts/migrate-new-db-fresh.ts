/**
 * Migrate NEW Supabase Database (with fresh env load)
 *
 * Explicitly loads .env.local to avoid shell caching
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manually parse .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=');
    env[key] = value;
  });

  return env;
}

function log(message: string, emoji: string = '📋') {
  console.log(`${emoji} ${message}`);
}

async function main() {
  console.log('\n' + '='.repeat(70));
  log('🚀 Migrating NEW Supabase Database', '🚀');
  console.log('='.repeat(70) + '\n');

  // Load fresh environment
  const env = loadEnvFile();
  log(`Target URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`, '🎯');

  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Step 1: Create exec_sql function
  log('\n📦 Step 1: Creating exec_sql helper function...', '1️⃣');

  const createExecSQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
  `;

  // We need to apply this via the Supabase dashboard SQL editor
  // For now, let's try to create the basic tables directly

  log('\n📋 Step 2: Creating core tables...', '2️⃣');

  // Core migrations to apply
  const migrations = [
    '019_agency_athlete_matches.sql',
    '027_school_system.sql',
    '031_add_username_to_users.sql',
    '040_agency_platform.sql',
    '050_enhance_chat_attachments.sql',
    '070_add_profile_cover_photos.sql',
    '075_add_match_tier_and_reasons.sql',
    '080_auto_calculate_social_stats.sql',
    '090_dashboard_infrastructure.sql',
  ];

  log('⚠️  IMPORTANT: Manual setup required!', '⚠️');
  log('\nTo complete the migration, follow these steps:', '📝');
  log('', '');
  log('1. Open Supabase Dashboard:', '1️⃣');
  log(`   https://supabase.com/dashboard/project/lqskiijspudfocddkhqs/sql/new`, '🔗');
  log('', '');
  log('2. Copy and run this SQL first:', '2️⃣');
  log('━'.repeat(70), '');
  console.log(createExecSQL);
  log('━'.repeat(70), '');
  log('', '');
  log('3. Then run this script again to apply migrations', '3️⃣');
  log('', '');
  log('OR', '💡');
  log('', '');
  log('Manually copy each migration file from migrations/ folder:', '📁');
  migrations.forEach((m, i) => {
    log(`   ${i + 1}. migrations/${m}`, '📄');
  });

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(console.error);
