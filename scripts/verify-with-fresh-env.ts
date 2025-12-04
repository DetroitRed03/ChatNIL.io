/**
 * Verify Supabase Connection with Fresh Environment Load
 *
 * This script explicitly loads .env.local to avoid shell caching issues
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

const EXPECTED_URL = 'https://lqskiijspudfocddkhqs.supabase.co';

function log(message: string, emoji: string = '📋') {
  console.log(`${emoji} ${message}`);
}

async function main() {
  console.log('\n' + '='.repeat(70));
  log('🔍 Verifying New Supabase Connection (Fresh Load)', '🔍');
  console.log('='.repeat(70) + '\n');

  // Load fresh environment
  log('Loading .env.local directly...', '📁');
  const env = loadEnvFile();

  log(`\n✓ Loaded NEXT_PUBLIC_SUPABASE_URL: ${env.NEXT_PUBLIC_SUPABASE_URL}`, '📍');
  log(`✓ Expected URL: ${EXPECTED_URL}`, '📍');

  const urlMatch = env.NEXT_PUBLIC_SUPABASE_URL === EXPECTED_URL;
  if (urlMatch) {
    log('✓ URLs MATCH! ✅', '✅');
  } else {
    log('✗ URLs DO NOT MATCH ❌', '❌');
    process.exit(1);
  }

  // Create client with fresh values
  log('\nCreating Supabase client with fresh credentials...', '🔧');
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Test connection
  log('\nTesting connection to NEW database...', '🔌');
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    log(`❌ Connection FAILED: ${error.message}`, '❌');
    process.exit(1);
  }

  log(`✅ Connection SUCCESS!`, '✅');
  log(`Found ${users.length} users in NEW database`, '📊');

  // Check for our seeded data
  log('\nLooking for test accounts we just created...', '🔍');
  const { data: recentUsers } = await supabase
    .from('users')
    .select('email, created_at')
    .or('email.ilike.sarah.johnson%@test.com,email.ilike.nike%@test.com')
    .order('created_at', { ascending: false });

  if (recentUsers && recentUsers.length > 0) {
    log(`✅ Found ${recentUsers.length} test accounts:`, '✅');
    recentUsers.forEach(user => {
      const timeAgo = Math.round((Date.now() - new Date(user.created_at).getTime()) / 1000 / 60);
      log(`  - ${user.email} (created ${timeAgo} minutes ago)`, '👤');
    });
  } else {
    log('⚠️  No test accounts found - need to run seed script', '⚠️');
  }

  // Check messaging view
  log('\nChecking messaging infrastructure...', '💬');
  const { error: viewError } = await supabase
    .from('conversation_summaries')
    .select('*')
    .limit(1);

  if (viewError) {
    log('❌ conversation_summaries view is MISSING', '❌');
    log('Need to apply Migration 100', '⚠️');
  } else {
    log('✅ conversation_summaries view exists', '✅');
  }

  console.log('\n' + '='.repeat(70));
  log('\n🎉 NEW DATABASE IS CONNECTED!', '🎉');
  log('Server is ready to use the new Supabase instance', '✅');
  log('\nAccess at: http://localhost:3001', '🌐');
  console.log('='.repeat(70) + '\n');
}

main().catch(console.error);
