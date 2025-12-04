/**
 * Verify New Supabase Connection
 *
 * This script confirms:
 * 1. Which Supabase URL we're connecting to
 * 2. Whether the test data exists in the new database
 * 3. That environment variables are correctly loaded
 */

import { createClient } from '@supabase/supabase-js';

// Expected new URL
const EXPECTED_URL = 'https://lqskiijspudfocddkhqs.supabase.co';

function log(message: string, emoji: string = '📋') {
  console.log(`${emoji} ${message}`);
}

async function main() {
  console.log('\n' + '='.repeat(70));
  log('🔍 Verifying New Supabase Connection', '🔍');
  console.log('='.repeat(70) + '\n');

  // Step 1: Check environment variables
  log('Step 1: Checking environment variables...', '1️⃣');
  log(`  NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, '📍');
  log(`  Expected URL: ${EXPECTED_URL}`, '📍');

  const urlMatch = process.env.NEXT_PUBLIC_SUPABASE_URL === EXPECTED_URL;
  if (urlMatch) {
    log('  Environment variable is CORRECT ✅', '✅');
  } else {
    log('  Environment variable is WRONG ❌', '❌');
    log('  The server may be using cached values', '⚠️');
  }

  // Step 2: Create Supabase client
  log('\nStep 2: Creating Supabase client...', '2️⃣');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  log('  Client created ✅', '✅');

  // Step 3: Test connection by querying users table
  log('\nStep 3: Testing database connection...', '3️⃣');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (usersError) {
    log(`  Error querying users: ${usersError.message}`, '❌');
    log('  Database connection FAILED ❌', '❌');
  } else {
    log(`  Successfully queried users table ✅`, '✅');
    log(`  Found ${users?.length || 0} users`, '📊');

    if (users && users.length > 0) {
      log('\n  Recent users:', '👥');
      users.forEach((user, index) => {
        log(`    ${index + 1}. ${user.email} (${user.role}) - ${user.first_name || 'No name'}`, '👤');
      });
    }
  }

  // Step 4: Check for our seeded test accounts
  log('\nStep 4: Checking for seeded test accounts...', '4️⃣');

  // Look for recent sarah.johnson accounts
  const { data: athletes, error: athleteError } = await supabase
    .from('users')
    .select('*')
    .ilike('email', 'sarah.johnson%@test.com')
    .order('created_at', { ascending: false })
    .limit(3);

  if (athleteError) {
    log(`  Error querying athletes: ${athleteError.message}`, '❌');
  } else if (athletes && athletes.length > 0) {
    log(`  Found ${athletes.length} Sarah Johnson test account(s) ✅`, '✅');
    athletes.forEach((athlete, index) => {
      log(`    ${index + 1}. ${athlete.email} - Created: ${new Date(athlete.created_at).toLocaleString()}`, '👤');
    });
  } else {
    log('  No Sarah Johnson test accounts found ⚠️', '⚠️');
    log('  This means the seed script may not have run successfully', '⚠️');
  }

  // Look for Nike agency accounts
  const { data: agencies, error: agencyError } = await supabase
    .from('users')
    .select('*')
    .ilike('email', 'nike%@test.com')
    .order('created_at', { ascending: false })
    .limit(3);

  if (!agencyError && agencies && agencies.length > 0) {
    log(`  Found ${agencies.length} Nike test account(s) ✅`, '✅');
    agencies.forEach((agency, index) => {
      log(`    ${index + 1}. ${agency.email} - Created: ${new Date(agency.created_at).toLocaleString()}`, '🏢');
    });
  } else {
    log('  No Nike test accounts found ⚠️', '⚠️');
  }

  // Step 5: Check for matches
  log('\nStep 5: Checking for athlete-agency matches...', '5️⃣');
  const { data: matches, error: matchError } = await supabase
    .from('agency_athlete_matches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (matchError) {
    log(`  Error querying matches: ${matchError.message}`, '❌');
  } else if (matches && matches.length > 0) {
    log(`  Found ${matches.length} match(es) ✅`, '✅');
  } else {
    log('  No matches found ⚠️', '⚠️');
  }

  // Step 6: Check messaging infrastructure
  log('\nStep 6: Checking messaging infrastructure...', '6️⃣');

  // Check if conversation_summaries view exists
  const { data: viewCheck, error: viewError } = await supabase
    .from('conversation_summaries')
    .select('*')
    .limit(1);

  if (viewError) {
    if (viewError.message.includes('does not exist')) {
      log('  conversation_summaries view does NOT exist ❌', '❌');
      log('  Migration 100 needs to be applied', '⚠️');
    } else {
      log(`  Error checking view: ${viewError.message}`, '❌');
    }
  } else {
    log('  conversation_summaries view exists ✅', '✅');
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  log('\n📊 Connection Verification Summary:', '📊');
  console.log('='.repeat(70));

  log(`\n✓ Environment URL: ${urlMatch ? 'CORRECT' : 'WRONG'}`, urlMatch ? '✅' : '❌');
  log(`✓ Database Connection: ${usersError ? 'FAILED' : 'SUCCESS'}`, usersError ? '❌' : '✅');
  log(`✓ Test Users: ${(athletes?.length || 0) + (agencies?.length || 0)} found`, (athletes?.length || 0) > 0 ? '✅' : '⚠️');
  log(`✓ Matches: ${matches?.length || 0} found`, (matches?.length || 0) > 0 ? '✅' : '⚠️');
  log(`✓ Messaging View: ${viewError ? 'MISSING' : 'EXISTS'}`, viewError ? '❌' : '✅');

  if (!urlMatch) {
    log('\n⚠️  WARNING: Environment variable mismatch detected!', '⚠️');
    log('   The server may be using cached environment variables.', '⚠️');
    log('   Try these fixes:', '🔧');
    log('   1. Delete .next folder: rm -rf .next', '💡');
    log('   2. Restart your terminal/IDE completely', '💡');
    log('   3. Clear node_modules and reinstall: rm -rf node_modules && npm install', '💡');
  }

  if (usersError) {
    log('\n❌ Database connection failed!', '❌');
    log('   Check that your SUPABASE_SERVICE_ROLE_KEY is correct in .env.local', '🔧');
  }

  if ((athletes?.length || 0) === 0) {
    log('\n⚠️  Test data not found. Run: npx tsx scripts/seed-new-database.ts', '⚠️');
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(console.error);
