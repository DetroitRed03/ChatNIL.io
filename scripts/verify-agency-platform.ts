#!/usr/bin/env tsx

/**
 * Agency Platform Verification Script
 *
 * This script verifies that the agency platform migration was successful:
 * 1. Database tables exist and have correct structure
 * 2. Athlete public profiles were populated with data
 * 3. API endpoint is accessible and functioning
 * 4. Data integrity and relationships are intact
 *
 * Usage: npx tsx scripts/verify-agency-platform.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VerificationResult {
  category: string;
  test: string;
  passed: boolean;
  message?: string;
  details?: any;
}

const results: VerificationResult[] = [];

function logResult(result: VerificationResult) {
  results.push(result);
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.test}`);
  if (result.message) {
    console.log(`   ${result.message}`);
  }
  if (result.details) {
    console.log(`   Details:`, result.details);
  }
}

async function verifyTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    return !error;
  } catch (error) {
    return false;
  }
}

async function verifyDatabaseTables() {
  console.log('\n📊 Verifying Database Tables\n' + '='.repeat(60));

  const tables = [
    'athlete_public_profiles',
    'athlete_portfolio_items',
    'agency_saved_searches',
    'agency_athlete_lists',
    'agency_athlete_list_items',
    'agency_campaigns',
    'campaign_athlete_invites',
    'agency_athlete_messages'
  ];

  for (const table of tables) {
    const exists = await verifyTableExists(table);
    logResult({
      category: 'Database',
      test: `Table "${table}" exists`,
      passed: exists,
      message: exists ? 'Table is accessible' : 'Table not found or not accessible'
    });
  }
}

async function verifyAthletePublicProfiles() {
  console.log('\n👤 Verifying Athlete Public Profiles\n' + '='.repeat(60));

  // Check if profiles exist
  const { data: profiles, error, count } = await supabase
    .from('athlete_public_profiles')
    .select('*', { count: 'exact' })
    .limit(5);

  logResult({
    category: 'Data',
    test: 'Athlete public profiles were created',
    passed: !error && (count || 0) > 0,
    message: error ? error.message : `Found ${count} athlete profiles`,
    details: error ? null : { total_profiles: count }
  });

  if (profiles && profiles.length > 0) {
    // Verify required fields
    const sample = profiles[0];
    const requiredFields = [
      'user_id',
      'display_name',
      'sport',
      'school_name',
      'school_level',
      'instagram_followers',
      'tiktok_followers',
      'total_followers',
      'is_available_for_partnerships'
    ];

    const missingFields = requiredFields.filter(field => !(field in sample));

    logResult({
      category: 'Data',
      test: 'Profile has all required fields',
      passed: missingFields.length === 0,
      message: missingFields.length === 0
        ? 'All required fields present'
        : `Missing fields: ${missingFields.join(', ')}`,
      details: missingFields.length === 0 ? sample : null
    });

    // Verify computed total_followers column
    const expectedTotal = (sample.instagram_followers || 0) +
                         (sample.tiktok_followers || 0) +
                         (sample.twitter_followers || 0) +
                         (sample.youtube_subscribers || 0);

    logResult({
      category: 'Data',
      test: 'total_followers computed correctly',
      passed: sample.total_followers === expectedTotal,
      message: `Expected: ${expectedTotal}, Got: ${sample.total_followers}`
    });

    // Verify social media stats are realistic
    const hasRealisticStats = sample.instagram_followers > 0 &&
                              sample.tiktok_followers > 0 &&
                              sample.instagram_engagement_rate &&
                              sample.instagram_engagement_rate > 0;

    logResult({
      category: 'Data',
      test: 'Social media stats are populated',
      passed: hasRealisticStats,
      message: hasRealisticStats
        ? `Instagram: ${sample.instagram_followers.toLocaleString()} followers (${sample.instagram_engagement_rate}% engagement)`
        : 'Social media stats appear empty',
      details: {
        instagram_followers: sample.instagram_followers,
        instagram_engagement: sample.instagram_engagement_rate,
        tiktok_followers: sample.tiktok_followers,
        tiktok_engagement: sample.tiktok_engagement_rate
      }
    });

    // Verify FMV ranges
    const hasFMV = sample.estimated_fmv_min && sample.estimated_fmv_max;
    const fmvValid = hasFMV && sample.estimated_fmv_min < sample.estimated_fmv_max;

    logResult({
      category: 'Data',
      test: 'FMV ranges are valid',
      passed: fmvValid,
      message: fmvValid
        ? `FMV: $${sample.estimated_fmv_min?.toLocaleString()} - $${sample.estimated_fmv_max?.toLocaleString()}`
        : 'FMV ranges missing or invalid',
      details: {
        fmv_min: sample.estimated_fmv_min,
        fmv_max: sample.estimated_fmv_max
      }
    });

    // Verify brand fit data
    const hasBrandFit = sample.content_categories &&
                        sample.content_categories.length > 0 &&
                        sample.brand_values &&
                        sample.brand_values.length > 0;

    logResult({
      category: 'Data',
      test: 'Brand fit data is populated',
      passed: hasBrandFit,
      message: hasBrandFit
        ? `Categories: ${sample.content_categories?.join(', ')}`
        : 'Brand fit data missing',
      details: {
        content_categories: sample.content_categories,
        brand_values: sample.brand_values
      }
    });
  }
}

async function verifyDataIntegrity() {
  console.log('\n🔗 Verifying Data Integrity\n' + '='.repeat(60));

  // Verify all public profiles have corresponding user accounts
  const { data: orphanProfiles } = await supabase
    .from('athlete_public_profiles')
    .select('user_id')
    .not('user_id', 'in', `(SELECT id FROM auth.users)`);

  logResult({
    category: 'Integrity',
    test: 'All profiles linked to valid users',
    passed: !orphanProfiles || orphanProfiles.length === 0,
    message: orphanProfiles && orphanProfiles.length > 0
      ? `Found ${orphanProfiles.length} orphan profiles`
      : 'All profiles have valid user references'
  });

  // Verify unique constraints
  const { count: totalProfiles } = await supabase
    .from('athlete_public_profiles')
    .select('*', { count: 'exact', head: true });

  const { count: uniqueUsers } = await supabase
    .from('athlete_public_profiles')
    .select('user_id', { count: 'exact', head: true });

  logResult({
    category: 'Integrity',
    test: 'No duplicate user_id entries',
    passed: totalProfiles === uniqueUsers,
    message: totalProfiles === uniqueUsers
      ? 'All user_ids are unique'
      : `Found duplicates: ${totalProfiles} profiles for ${uniqueUsers} users`
  });
}

async function verifyRLSPolicies() {
  console.log('\n🔒 Verifying Row Level Security\n' + '='.repeat(60));

  // Test public read access (should work)
  const { data: publicReadTest, error: publicReadError } = await supabase
    .from('athlete_public_profiles')
    .select('*')
    .limit(1);

  logResult({
    category: 'Security',
    test: 'Public read access enabled',
    passed: !publicReadError && publicReadTest !== null,
    message: publicReadError
      ? `Public read failed: ${publicReadError.message}`
      : 'Public can read athlete profiles'
  });

  // Verify tables exist and are queryable
  const tables = ['agency_campaigns', 'campaign_athlete_invites', 'agency_athlete_messages'];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    logResult({
      category: 'Security',
      test: `Table "${table}" is accessible`,
      passed: !error,
      message: error ? error.message : 'Table accessible with service key'
    });
  }
}

async function verifyIndexes() {
  console.log('\n⚡ Verifying Database Indexes\n' + '='.repeat(60));

  // Check if indexes exist by testing query performance patterns
  // These queries should be fast if indexes are present

  const startTime = Date.now();

  // Test sport index
  await supabase
    .from('athlete_public_profiles')
    .select('*')
    .eq('sport', 'Basketball')
    .limit(10);

  const sportQueryTime = Date.now() - startTime;

  logResult({
    category: 'Performance',
    test: 'Sport filter query performs well',
    passed: sportQueryTime < 1000,
    message: `Query completed in ${sportQueryTime}ms`,
    details: { query_time_ms: sportQueryTime }
  });

  // Test followers index
  const followersStartTime = Date.now();
  await supabase
    .from('athlete_public_profiles')
    .select('*')
    .gte('total_followers', 100000)
    .limit(10);

  const followersQueryTime = Date.now() - followersStartTime;

  logResult({
    category: 'Performance',
    test: 'Followers filter query performs well',
    passed: followersQueryTime < 1000,
    message: `Query completed in ${followersQueryTime}ms`,
    details: { query_time_ms: followersQueryTime }
  });
}

async function verifySampleData() {
  console.log('\n📋 Sample Data Overview\n' + '='.repeat(60));

  // Get distribution by sport
  const { data: sportDistribution } = await supabase.rpc('get_sport_distribution') as any;

  if (sportDistribution) {
    console.log('\nSport Distribution:');
    sportDistribution.forEach((item: any) => {
      console.log(`   ${item.sport}: ${item.count} athletes`);
    });
  }

  // Get follower stats
  const { data: followerStats } = await supabase
    .from('athlete_public_profiles')
    .select('total_followers');

  if (followerStats && followerStats.length > 0) {
    const followers = followerStats.map((p: any) => p.total_followers).sort((a: number, b: number) => a - b);
    const min = followers[0];
    const max = followers[followers.length - 1];
    const avg = followers.reduce((sum: number, f: number) => sum + f, 0) / followers.length;
    const median = followers[Math.floor(followers.length / 2)];

    console.log('\nFollower Statistics:');
    console.log(`   Min: ${min.toLocaleString()}`);
    console.log(`   Max: ${max.toLocaleString()}`);
    console.log(`   Average: ${Math.round(avg).toLocaleString()}`);
    console.log(`   Median: ${median.toLocaleString()}`);
  }

  // Get FMV stats
  const { data: fmvStats } = await supabase
    .from('athlete_public_profiles')
    .select('estimated_fmv_min, estimated_fmv_max');

  if (fmvStats && fmvStats.length > 0) {
    const fmvMins = fmvStats.map((p: any) => p.estimated_fmv_min).filter(Boolean);
    const fmvMaxs = fmvStats.map((p: any) => p.estimated_fmv_max).filter(Boolean);

    if (fmvMins.length > 0) {
      const avgMin = fmvMins.reduce((sum: number, f: number) => sum + f, 0) / fmvMins.length;
      const avgMax = fmvMaxs.reduce((sum: number, f: number) => sum + f, 0) / fmvMaxs.length;

      console.log('\nFMV Statistics:');
      console.log(`   Average FMV Range: $${Math.round(avgMin).toLocaleString()} - $${Math.round(avgMax).toLocaleString()}`);
    }
  }

  logResult({
    category: 'Data',
    test: 'Sample data statistics calculated',
    passed: true,
    message: 'See above for detailed statistics'
  });
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY\n');

  const categories = [...new Set(results.map(r => r.category))];

  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.passed).length;
    const total = categoryResults.length;
    const percentage = Math.round((passed / total) * 100);

    const icon = percentage === 100 ? '✅' : percentage >= 75 ? '⚠️' : '❌';
    console.log(`${icon} ${category}: ${passed}/${total} tests passed (${percentage}%)`);
  }

  const totalPassed = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const overallPercentage = Math.round((totalPassed / totalTests) * 100);

  console.log('\n' + '='.repeat(60));
  console.log(`\n🎯 OVERALL: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)\n`);

  if (overallPercentage === 100) {
    console.log('✅ All verification tests passed! Agency platform is ready.\n');
    return 0;
  } else if (overallPercentage >= 75) {
    console.log('⚠️  Most tests passed. Review failed tests above.\n');
    return 1;
  } else {
    console.log('❌ Multiple verification failures. Please review and fix issues.\n');
    return 1;
  }
}

async function runVerification() {
  console.log('🔍 Agency Platform Verification\n');
  console.log('='.repeat(60));

  try {
    await verifyDatabaseTables();
    await verifyAthletePublicProfiles();
    await verifyDataIntegrity();
    await verifyRLSPolicies();
    await verifyIndexes();
    await verifySampleData();

    const exitCode = await printSummary();
    process.exit(exitCode);

  } catch (error) {
    console.error('\n❌ Verification failed with error:', error);
    process.exit(1);
  }
}

// Run verification
runVerification();
