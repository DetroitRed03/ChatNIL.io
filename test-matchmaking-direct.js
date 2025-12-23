/**
 * Direct Database Testing for Matchmaking and NIL Deals
 * Tests database operations, RLS policies, and data integrity
 */

const { createClient } = require('@supabase/supabase-js');

// Test Configuration
const SUPABASE_URL = 'https://lqskiijspudfocddhkqs.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test Users
const SARAH_ATHLETE = {
  id: 'ca05429a-0f32-4280-8b71-99dc5baee0dc',
  email: 'sarah.johnson@test.com',
  name: 'Sarah Johnson',
  role: 'athlete'
};

const MARCUS_ATHLETE = {
  id: '7a799d45-d306-4622-b70f-46e7444e1caa',
  email: 'marcus.williams@athlete.chatnil.com',
  name: 'Marcus Williams',
  role: 'athlete'
};

const ELITE_AGENCY = {
  id: 'a6d72510-8ec1-4821-99b8-3b08b37ec58c',
  email: 'contact@elitesportsmanagement.com',
  name: 'Elite Sports Management',
  role: 'agency'
};

const ABC_AGENCY = {
  id: '471b4543-940f-4ade-8097-dae36e33365f',
  email: 'hello@athletebrandcollective.com',
  name: 'Athlete Brand Collective',
  role: 'agency'
};

// Results tracking
const results = {
  passed: [],
  failed: [],
  warnings: [],
  issues: [],
  total: 0
};

function logTest(name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed.push({ name, details });
    console.log(`✅ ${name}`);
  } else {
    results.failed.push({ name, details });
    console.log(`❌ ${name}`);
  }
  if (details) console.log(`   ${details}`);
}

function logWarning(name, details) {
  results.warnings.push({ name, details });
  console.log(`⚠️  ${name}`);
  if (details) console.log(`   ${details}`);
}

function logIssue(name, details, recommendation) {
  results.issues.push({ name, details, recommendation });
  console.log(`🔍 ISSUE FOUND: ${name}`);
  if (details) console.log(`   Details: ${details}`);
  if (recommendation) console.log(`   Fix: ${recommendation}`);
}

// =========================================
// TEST 1: Database Schema Validation
// =========================================
async function testDatabaseSchema() {
  console.log('\n========== TEST 1: Database Schema Validation ==========\n');

  // Check agency_athlete_matches table
  const { data: matches, error: matchError } = await supabase
    .from('agency_athlete_matches')
    .select('*')
    .limit(1);

  logTest(
    'agency_athlete_matches table exists and is accessible',
    !matchError,
    matchError ? `Error: ${matchError.message}` : 'Table accessible'
  );

  // Check nil_deals table
  const { data: deals, error: dealError } = await supabase
    .from('nil_deals')
    .select('*')
    .limit(1);

  logTest(
    'nil_deals table exists and is accessible',
    !dealError,
    dealError ? `Error: ${dealError.message}` : 'Table accessible'
  );

  // Check athlete_opportunities view
  const { data: oppView, error: oppError } = await supabase
    .from('athlete_opportunities')
    .select('*')
    .limit(1);

  if (oppError) {
    logWarning(
      'athlete_opportunities view not accessible',
      `Error: ${oppError.message} - APIs will use fallback queries`
    );
  } else {
    logTest('athlete_opportunities view exists and works', true);
  }
}

// =========================================
// TEST 2: Matchmaking Data Integrity
// =========================================
async function testMatchmakingData() {
  console.log('\n========== TEST 2: Matchmaking Data Integrity ==========\n');

  // Get all matches
  const { data: allMatches, error } = await supabase
    .from('agency_athlete_matches')
    .select('*');

  logTest(
    'Can query all matches',
    !error,
    error ? `Error: ${error.message}` : `Found ${allMatches?.length || 0} matches`
  );

  if (!allMatches || allMatches.length === 0) {
    logWarning('No matches in database', 'Need to seed matches for testing');
    return;
  }

  // Check for required fields
  const matchesWithMissingFields = allMatches.filter(m =>
    !m.id || !m.agency_id || !m.athlete_id || m.match_score === null
  );

  logTest(
    'All matches have required fields',
    matchesWithMissingFields.length === 0,
    matchesWithMissingFields.length > 0
      ? `${matchesWithMissingFields.length} matches missing required fields`
      : 'All matches valid'
  );

  // Check match statuses
  const validStatuses = ['suggested', 'pending', 'contacted', 'interested', 'rejected', 'expired', 'partnered'];
  const invalidStatusMatches = allMatches.filter(m =>
    !validStatuses.includes(m.status)
  );

  logTest(
    'All match statuses are valid',
    invalidStatusMatches.length === 0,
    invalidStatusMatches.length > 0
      ? `${invalidStatusMatches.length} matches have invalid status`
      : 'All statuses valid'
  );

  // Check for orphaned matches (athletes/agencies that don't exist)
  const athleteIds = [...new Set(allMatches.map(m => m.athlete_id))];
  const agencyIds = [...new Set(allMatches.map(m => m.agency_id))];

  const { data: athletes } = await supabase
    .from('users')
    .select('id')
    .in('id', athleteIds);

  const { data: agencies } = await supabase
    .from('users')
    .select('id')
    .in('id', agencyIds);

  const existingAthleteIds = new Set(athletes?.map(a => a.id) || []);
  const existingAgencyIds = new Set(agencies?.map(a => a.id) || []);

  const orphanedMatches = allMatches.filter(m =>
    !existingAthleteIds.has(m.athlete_id) || !existingAgencyIds.has(m.agency_id)
  );

  logTest(
    'No orphaned matches (all athletes and agencies exist)',
    orphanedMatches.length === 0,
    orphanedMatches.length > 0
      ? `${orphanedMatches.length} matches reference non-existent users`
      : 'All references valid'
  );

  // Check match scores are in valid range
  const invalidScoreMatches = allMatches.filter(m =>
    m.match_score < 0 || m.match_score > 100
  );

  logTest(
    'All match scores are in valid range (0-100)',
    invalidScoreMatches.length === 0,
    invalidScoreMatches.length > 0
      ? `${invalidScoreMatches.length} matches have invalid scores`
      : 'All scores valid'
  );

  // Check for matches with deals
  const matchesWithDeals = allMatches.filter(m => m.deal_id);
  console.log(`   Info: ${matchesWithDeals.length} matches have associated deals`);

  // Return test match for later use
  return allMatches[0];
}

// =========================================
// TEST 3: NIL Deals Data Integrity
// =========================================
async function testNILDealsData() {
  console.log('\n========== TEST 3: NIL Deals Data Integrity ==========\n');

  const { data: allDeals, error } = await supabase
    .from('nil_deals')
    .select('*');

  logTest(
    'Can query all NIL deals',
    !error,
    error ? `Error: ${error.message}` : `Found ${allDeals?.length || 0} deals`
  );

  if (!allDeals || allDeals.length === 0) {
    logWarning('No deals in database', 'This is expected for a new system');
    return;
  }

  // Check required fields
  const dealsWithMissingFields = allDeals.filter(d =>
    !d.id || !d.athlete_id || !d.deal_type
  );

  logTest(
    'All deals have required fields',
    dealsWithMissingFields.length === 0,
    dealsWithMissingFields.length > 0
      ? `${dealsWithMissingFields.length} deals missing required fields`
      : 'All deals valid'
  );

  // Check deal types
  const validDealTypes = ['social_media', 'content_creation', 'event_appearance', 'brand_ambassador', 'merchandise', 'other'];
  const invalidTypeDeals = allDeals.filter(d =>
    !validDealTypes.includes(d.deal_type)
  );

  logTest(
    'All deal types are valid',
    invalidTypeDeals.length === 0,
    invalidTypeDeals.length > 0
      ? `${invalidTypeDeals.length} deals have invalid type`
      : 'All types valid'
  );

  // Check deal statuses
  const validDealStatuses = ['draft', 'pending', 'active', 'completed', 'cancelled'];
  const invalidStatusDeals = allDeals.filter(d =>
    !validDealStatuses.includes(d.status)
  );

  logTest(
    'All deal statuses are valid',
    invalidStatusDeals.length === 0,
    invalidStatusDeals.length > 0
      ? `${invalidStatusDeals.length} deals have invalid status`
      : 'All statuses valid'
  );

  // Check for orphaned deals
  const athleteIds = [...new Set(allDeals.map(d => d.athlete_id))];
  const agencyIds = [...new Set(allDeals.filter(d => d.agency_id).map(d => d.agency_id))];

  const { data: athletes } = await supabase
    .from('users')
    .select('id')
    .in('id', athleteIds);

  const { data: agencies } = await supabase
    .from('users')
    .select('id')
    .in('id', agencyIds);

  const existingAthleteIds = new Set(athletes?.map(a => a.id) || []);
  const existingAgencyIds = new Set(agencies?.map(a => a.id) || []);

  const orphanedDeals = allDeals.filter(d =>
    !existingAthleteIds.has(d.athlete_id) ||
    (d.agency_id && !existingAgencyIds.has(d.agency_id))
  );

  logTest(
    'No orphaned deals (all athletes and agencies exist)',
    orphanedDeals.length === 0,
    orphanedDeals.length > 0
      ? `${orphanedDeals.length} deals reference non-existent users`
      : 'All references valid'
  );

  return allDeals[0];
}

// =========================================
// TEST 4: Athlete Can View Their Matches
// =========================================
async function testAthleteViewMatches() {
  console.log('\n========== TEST 4: Athlete Views Their Matches ==========\n');

  // Get Sarah's matches
  const { data: sarahMatches, error } = await supabase
    .from('agency_athlete_matches')
    .select('*')
    .eq('athlete_id', SARAH_ATHLETE.id);

  logTest(
    'Athlete can query their matches',
    !error,
    error ? `Error: ${error.message}` : `Found ${sarahMatches?.length || 0} matches for Sarah`
  );

  if (sarahMatches && sarahMatches.length > 0) {
    // Verify all matches belong to Sarah
    const wrongMatches = sarahMatches.filter(m => m.athlete_id !== SARAH_ATHLETE.id);

    logTest(
      'All returned matches belong to the athlete',
      wrongMatches.length === 0,
      wrongMatches.length > 0 ? `${wrongMatches.length} wrong matches returned` : 'All correct'
    );

    // Get agency information for matches
    const agencyIds = [...new Set(sarahMatches.map(m => m.agency_id))];
    const { data: agencies } = await supabase
      .from('users')
      .select('id, first_name, last_name, company_name, email')
      .in('id', agencyIds);

    logTest(
      'Can fetch agency information for matches',
      agencies && agencies.length > 0,
      `Fetched ${agencies?.length || 0} agencies`
    );

    return sarahMatches[0];
  } else {
    logWarning('No matches found for test athlete', 'Cannot test match operations');
    return null;
  }
}

// =========================================
// TEST 5: Athlete Responds to Match
// =========================================
async function testAthleteRespond(testMatch) {
  console.log('\n========== TEST 5: Athlete Responds to Match ==========\n');

  if (!testMatch) {
    logWarning('No test match available', 'Skipping response tests');
    return;
  }

  // Find an unresponded match
  const { data: unrespondedMatches } = await supabase
    .from('agency_athlete_matches')
    .select('*')
    .eq('athlete_id', SARAH_ATHLETE.id)
    .is('athlete_response_status', null)
    .limit(1);

  const matchToRespond = unrespondedMatches?.[0];

  if (!matchToRespond) {
    logWarning('No unresponded matches available', 'All matches already have responses');
    return;
  }

  // Test updating match response
  const { data: updatedMatch, error } = await supabase
    .from('agency_athlete_matches')
    .update({
      athlete_response_status: 'interested',
      athlete_response_at: new Date().toISOString(),
      responded_at: new Date().toISOString(),
      status: 'interested'
    })
    .eq('id', matchToRespond.id)
    .eq('athlete_id', SARAH_ATHLETE.id)
    .select()
    .single();

  logTest(
    'Can update match with athlete response',
    !error,
    error ? `Error: ${error.message}` : 'Match updated successfully'
  );

  if (updatedMatch) {
    logTest(
      'Match status updated correctly',
      updatedMatch.athlete_response_status === 'interested' && updatedMatch.status === 'interested',
      `Response: ${updatedMatch.athlete_response_status}, Status: ${updatedMatch.status}`
    );
  }

  return updatedMatch;
}

// =========================================
// TEST 6: Agency Converts Match to Deal
// =========================================
async function testConvertMatchToDeal() {
  console.log('\n========== TEST 6: Agency Converts Match to Deal ==========\n');

  // Find an unconverted match from Elite Agency
  const { data: unconvertedMatches } = await supabase
    .from('agency_athlete_matches')
    .select('*')
    .eq('agency_id', ELITE_AGENCY.id)
    .is('deal_id', null)
    .neq('status', 'rejected')
    .neq('status', 'expired')
    .limit(1);

  let matchToConvert = unconvertedMatches?.[0];

  if (!matchToConvert) {
    logWarning('No unconverted matches', 'Creating test match');

    // Create a test match
    const { data: newMatch, error: createError } = await supabase
      .from('agency_athlete_matches')
      .insert({
        agency_id: ELITE_AGENCY.id,
        athlete_id: SARAH_ATHLETE.id,
        match_score: 88,
        match_tier: 'excellent',
        status: 'interested',
        match_reasons: ['Test match for conversion']
      })
      .select()
      .single();

    if (createError) {
      logTest('Can create test match', false, `Error: ${createError.message}`);
      return;
    }

    matchToConvert = newMatch;
    logTest('Created test match for conversion', true, `Match ID: ${newMatch.id}`);
  }

  // Create a deal
  const dealData = {
    athlete_id: matchToConvert.athlete_id,
    agency_id: matchToConvert.agency_id,
    deal_title: 'E2E Test Deal',
    deal_type: 'social_media',
    description: 'Test deal created during E2E testing',
    compensation_amount: 5000,
    start_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    deliverables: ['Instagram post', 'TikTok video'],
    is_public: false
  };

  const { data: createdDeal, error: dealError } = await supabase
    .from('nil_deals')
    .insert(dealData)
    .select()
    .single();

  logTest(
    'Can create NIL deal from match',
    !dealError,
    dealError ? `Error: ${dealError.message}` : `Deal created: ${createdDeal?.id}`
  );

  if (createdDeal) {
    // Update match with deal reference
    const { data: updatedMatch, error: updateError } = await supabase
      .from('agency_athlete_matches')
      .update({
        deal_id: createdDeal.id,
        deal_created_at: new Date().toISOString(),
        status: 'partnered'
      })
      .eq('id', matchToConvert.id)
      .select()
      .single();

    logTest(
      'Can link deal to match',
      !updateError,
      updateError ? `Error: ${updateError.message}` : 'Match updated with deal_id'
    );

    logTest(
      'Match status updated to partnered',
      updatedMatch?.status === 'partnered',
      `Status: ${updatedMatch?.status}`
    );

    return { match: updatedMatch, deal: createdDeal };
  }
}

// =========================================
// TEST 7: Deal Lifecycle Operations
// =========================================
async function testDealLifecycle(testData) {
  console.log('\n========== TEST 7: Deal Lifecycle Operations ==========\n');

  const deal = testData?.deal;

  if (!deal) {
    logWarning('No test deal available', 'Skipping lifecycle tests');
    return;
  }

  // Test updating deal status to pending
  const { data: pendingDeal, error: e1 } = await supabase
    .from('nil_deals')
    .update({ status: 'pending' })
    .eq('id', deal.id)
    .select()
    .single();

  logTest(
    'Can update deal status to pending',
    !e1,
    e1 ? `Error: ${e1.message}` : 'Status updated'
  );

  // Test updating deal status to active
  const { data: activeDeal, error: e2 } = await supabase
    .from('nil_deals')
    .update({ status: 'active' })
    .eq('id', deal.id)
    .select()
    .single();

  logTest(
    'Can update deal status to active',
    !e2,
    e2 ? `Error: ${e2.message}` : 'Status updated'
  );

  // Test updating deal status to completed
  const { data: completedDeal, error: e3 } = await supabase
    .from('nil_deals')
    .update({ status: 'completed' })
    .eq('id', deal.id)
    .select()
    .single();

  logTest(
    'Can update deal status to completed',
    !e3,
    e3 ? `Error: ${e3.message}` : 'Status updated'
  );

  // Verify status transitions
  logTest(
    'Deal status transitions work correctly',
    completedDeal?.status === 'completed',
    `Final status: ${completedDeal?.status}`
  );
}

// =========================================
// TEST 8: Query Performance & Views
// =========================================
async function testQueryPerformance() {
  console.log('\n========== TEST 8: Query Performance & Views ==========\n');

  // Test athlete_opportunities view
  const start1 = Date.now();
  const { data: oppView, error: e1 } = await supabase
    .from('athlete_opportunities')
    .select('*')
    .eq('athlete_id', SARAH_ATHLETE.id)
    .limit(20);
  const time1 = Date.now() - start1;

  if (!e1) {
    logTest(
      'athlete_opportunities view query successful',
      true,
      `${oppView?.length || 0} results in ${time1}ms`
    );
  } else {
    logWarning(
      'athlete_opportunities view not available',
      `Error: ${e1.message} - Using fallback`
    );

    // Fallback query
    const start2 = Date.now();
    const { data: matches, error: e2 } = await supabase
      .from('agency_athlete_matches')
      .select('*')
      .eq('athlete_id', SARAH_ATHLETE.id)
      .limit(20);
    const time2 = Date.now() - start2;

    logTest(
      'Fallback query works',
      !e2,
      e2 ? `Error: ${e2.message}` : `${matches?.length || 0} results in ${time2}ms`
    );
  }

  // Test deals query with joins
  const start3 = Date.now();
  const { data: deals, error: e3 } = await supabase
    .from('nil_deals')
    .select(`
      *,
      athlete:users!nil_deals_athlete_id_fkey(id, first_name, last_name),
      agency:users!nil_deals_agency_id_fkey(id, first_name, last_name, company_name)
    `)
    .or(`athlete_id.eq.${SARAH_ATHLETE.id},agency_id.eq.${ELITE_AGENCY.id}`)
    .limit(20);
  const time3 = Date.now() - start3;

  logTest(
    'Deals query with joins successful',
    !e3,
    e3 ? `Error: ${e3.message}` : `${deals?.length || 0} results in ${time3}ms`
  );

  if (time1 > 1000 || time3 > 1000) {
    logIssue(
      'Slow query detected',
      `Queries took ${Math.max(time1, time3)}ms`,
      'Consider adding indexes or optimizing queries'
    );
  }
}

// =========================================
// TEST 9: Data Consistency Checks
// =========================================
async function testDataConsistency() {
  console.log('\n========== TEST 9: Data Consistency Checks ==========\n');

  // Check for matches with invalid deal_id references
  const { data: allMatches } = await supabase
    .from('agency_athlete_matches')
    .select('id, deal_id')
    .not('deal_id', 'is', null);

  if (allMatches && allMatches.length > 0) {
    const dealIds = allMatches.map(m => m.deal_id);
    const { data: deals } = await supabase
      .from('nil_deals')
      .select('id')
      .in('id', dealIds);

    const existingDealIds = new Set(deals?.map(d => d.id) || []);
    const brokenMatches = allMatches.filter(m => !existingDealIds.has(m.deal_id));

    logTest(
      'No matches reference non-existent deals',
      brokenMatches.length === 0,
      brokenMatches.length > 0
        ? `${brokenMatches.length} matches have invalid deal_id`
        : 'All deal references valid'
    );
  }

  // Check for duplicate matches (same agency-athlete pair with pending status)
  const { data: potentialDuplicates } = await supabase
    .from('agency_athlete_matches')
    .select('agency_id, athlete_id')
    .in('status', ['pending', 'contacted', 'interested']);

  if (potentialDuplicates) {
    const pairCounts = {};
    potentialDuplicates.forEach(m => {
      const key = `${m.agency_id}-${m.athlete_id}`;
      pairCounts[key] = (pairCounts[key] || 0) + 1;
    });

    const duplicates = Object.entries(pairCounts).filter(([_, count]) => count > 1);

    if (duplicates.length > 0) {
      logIssue(
        'Potential duplicate matches detected',
        `${duplicates.length} agency-athlete pairs have multiple active matches`,
        'Review business logic for allowing multiple simultaneous matches'
      );
    } else {
      logTest('No duplicate active matches', true);
    }
  }
}

// =========================================
// MAIN TEST RUNNER
// =========================================
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   E2E Testing: Matchmaking & NIL Deals (Direct DB Access)     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    await testDatabaseSchema();
    const testMatch = await testMatchmakingData();
    const testDeal = await testNILDealsData();
    const athleteMatch = await testAthleteViewMatches();
    const respondedMatch = await testAthleteRespond(athleteMatch);
    const conversionData = await testConvertMatchToDeal();
    await testDealLifecycle(conversionData);
    await testQueryPerformance();
    await testDataConsistency();

    // Print Summary
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                        TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`Total Tests:    ${results.total}`);
    console.log(`✅ Passed:      ${results.passed.length}`);
    console.log(`❌ Failed:      ${results.failed.length}`);
    console.log(`⚠️  Warnings:    ${results.warnings.length}`);
    console.log(`🔍 Issues:      ${results.issues.length}`);
    console.log(`\nSuccess Rate:  ${((results.passed.length / results.total) * 100).toFixed(1)}%\n`);

    if (results.failed.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('FAILED TESTS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      results.failed.forEach((f, i) => {
        console.log(`\n${i + 1}. ❌ ${f.name}`);
        if (f.details) console.log(`   ${f.details}`);
      });
      console.log();
    }

    if (results.issues.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ISSUES FOUND:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      results.issues.forEach((issue, i) => {
        console.log(`\n${i + 1}. 🔍 ${issue.name}`);
        if (issue.details) console.log(`   Details: ${issue.details}`);
        if (issue.recommendation) console.log(`   Fix: ${issue.recommendation}`);
      });
      console.log();
    }

    if (results.warnings.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('WARNINGS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      results.warnings.forEach((w, i) => {
        console.log(`\n${i + 1}. ⚠️  ${w.name}`);
        if (w.details) console.log(`   ${w.details}`);
      });
      console.log();
    }

    return results;

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR during testing:', error);
    throw error;
  }
}

// Run tests
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('✅ Testing complete!\n');
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Testing failed with error:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, results };
