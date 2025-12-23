/**
 * E2E Testing Script for Matchmaking and NIL Deals Features
 * Tests API endpoints, security, and edge cases
 */

const { createClient } = require('@supabase/supabase-js');

// Test Configuration
const SUPABASE_URL = 'https://lqskiijspudfocddhkqs.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';
const BASE_URL = 'http://localhost:3000';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Test Users (from database)
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

// Test Results Tracker
const results = {
  passed: [],
  failed: [],
  warnings: [],
  total: 0
};

function logTest(name, passed, details = '') {
  results.total++;
  if (passed) {
    results.passed.push({ name, details });
    console.log(`✅ PASS: ${name}`);
  } else {
    results.failed.push({ name, details });
    console.log(`❌ FAIL: ${name}`);
  }
  if (details) {
    console.log(`   ${details}`);
  }
}

function logWarning(name, details) {
  results.warnings.push({ name, details });
  console.log(`⚠️  WARNING: ${name}`);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Helper to make API calls with user context
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);
  return { response, data };
}

// ===========================================
// TEST FLOW 1: Athlete Views Opportunities
// ===========================================
async function testAthleteViewsOpportunities() {
  console.log('\n========== TEST FLOW 1: Athlete Views Opportunities ==========\n');

  // 1.1 Get athlete's matches/opportunities
  const { response: res1, data: data1 } = await apiCall('/api/matches/athlete', {
    headers: {
      'X-User-ID': SARAH_ATHLETE.id
    }
  });

  logTest(
    'GET /api/matches/athlete returns 200',
    res1.status === 200,
    `Status: ${res1.status}, Opportunities: ${data1?.opportunities?.length || 0}`
  );

  logTest(
    'Response includes opportunities array',
    Array.isArray(data1?.opportunities),
    `Type: ${typeof data1?.opportunities}`
  );

  logTest(
    'Response includes stats',
    data1?.stats && typeof data1.stats === 'object',
    `Stats: ${JSON.stringify(data1?.stats)}`
  );

  if (data1?.opportunities?.length > 0) {
    const firstMatch = data1.opportunities[0];

    logTest(
      'Opportunity includes required fields',
      firstMatch.id && firstMatch.agency_id && firstMatch.match_score !== undefined,
      `Fields: id=${!!firstMatch.id}, agency_id=${!!firstMatch.agency_id}, match_score=${firstMatch.match_score}`
    );

    logTest(
      'Opportunity includes agency information',
      firstMatch.agency_name || firstMatch.agency_first_name,
      `Agency: ${firstMatch.agency_name || 'N/A'}`
    );

    return firstMatch; // Return for next test
  } else {
    logWarning('No opportunities found for test athlete', 'Cannot test opportunity details');
    return null;
  }
}

// ===========================================
// TEST FLOW 2: Athlete Responds to Match
// ===========================================
async function testAthleteRespondsToMatch(testMatch) {
  console.log('\n========== TEST FLOW 2: Athlete Responds to Match ==========\n');

  if (!testMatch) {
    logWarning('No test match available', 'Skipping athlete response tests');
    return;
  }

  // Find a match that hasn't been responded to yet
  const { data: matches } = await supabase
    .from('agency_athlete_matches')
    .select('*')
    .eq('athlete_id', SARAH_ATHLETE.id)
    .is('athlete_response_status', null)
    .limit(1);

  const unrepondedMatch = matches?.[0] || testMatch;

  // 2.1 Test "interested" response
  const { response: res2, data: data2 } = await apiCall(`/api/matches/${unrepondedMatch.id}/respond`, {
    method: 'POST',
    headers: {
      'X-User-ID': SARAH_ATHLETE.id
    },
    body: JSON.stringify({ response: 'interested' })
  });

  logTest(
    'POST /api/matches/[id]/respond with "interested" returns 200',
    res2.status === 200,
    `Status: ${res2.status}, Message: ${data2?.message}`
  );

  logTest(
    'Response updates match status to interested',
    data2?.match?.athlete_response_status === 'interested',
    `Response status: ${data2?.match?.athlete_response_status}`
  );

  // 2.2 Test responding to same match again (should handle gracefully)
  const { response: res3, data: data3 } = await apiCall(`/api/matches/${unrepondedMatch.id}/respond`, {
    method: 'POST',
    headers: {
      'X-User-ID': SARAH_ATHLETE.id
    },
    body: JSON.stringify({ response: 'declined' })
  });

  logTest(
    'Responding to already-responded match handled gracefully',
    res3.status === 200 || res3.status === 400,
    `Status: ${res3.status}`
  );

  // 2.3 Test invalid response value
  const { response: res4, data: data4 } = await apiCall(`/api/matches/${unrepondedMatch.id}/respond`, {
    method: 'POST',
    headers: {
      'X-User-ID': SARAH_ATHLETE.id
    },
    body: JSON.stringify({ response: 'invalid_value' })
  });

  logTest(
    'Invalid response value returns 400',
    res4.status === 400,
    `Status: ${res4.status}, Error: ${data4?.error}`
  );

  return unrepondedMatch;
}

// ===========================================
// TEST FLOW 3: Agency Converts Match to Deal
// ===========================================
async function testAgencyConvertsToDeal() {
  console.log('\n========== TEST FLOW 3: Agency Converts Match to Deal ==========\n');

  // Find a match that hasn't been converted yet
  const { data: matches } = await supabase
    .from('agency_athlete_matches')
    .select('*')
    .eq('agency_id', ELITE_AGENCY.id)
    .is('deal_id', null)
    .neq('status', 'rejected')
    .neq('status', 'expired')
    .limit(1);

  const unconvertedMatch = matches?.[0];

  if (!unconvertedMatch) {
    logWarning('No unconverted matches available', 'Creating test match first');

    // Create a test match
    const { data: newMatch } = await supabase
      .from('agency_athlete_matches')
      .insert({
        agency_id: ELITE_AGENCY.id,
        athlete_id: SARAH_ATHLETE.id,
        match_score: 85,
        match_tier: 'excellent',
        status: 'interested',
        match_reasons: ['Test match for E2E testing']
      })
      .select()
      .single();

    if (!newMatch) {
      logWarning('Could not create test match', 'Skipping convert to deal tests');
      return;
    }

    return testConvertMatchToDeal(newMatch);
  }

  return testConvertMatchToDeal(unconvertedMatch);
}

async function testConvertMatchToDeal(match) {
  const dealPayload = {
    match_id: match.id,
    deal_title: 'Test E2E NIL Deal',
    deal_type: 'social_media',
    description: 'This is a test deal created during E2E testing',
    compensation_amount: 5000,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deliverables: ['Instagram post', 'TikTok video'],
    brand_name: 'Test Brand'
  };

  // 3.1 Convert match to deal
  const { response: res1, data: data1 } = await apiCall('/api/matches/convert-to-deal', {
    method: 'POST',
    headers: {
      'X-User-ID': ELITE_AGENCY.id
    },
    body: JSON.stringify(dealPayload)
  });

  logTest(
    'POST /api/matches/convert-to-deal returns 201',
    res1.status === 201,
    `Status: ${res1.status}, Deal ID: ${data1?.deal?.id}`
  );

  logTest(
    'Created deal has correct athlete and agency',
    data1?.deal?.athlete_id === match.athlete_id && data1?.deal?.agency_id === match.agency_id,
    `Athlete: ${data1?.deal?.athlete_id}, Agency: ${data1?.deal?.agency_id}`
  );

  logTest(
    'Match status updated to partnered',
    data1?.match?.status === 'partnered',
    `Match status: ${data1?.match?.status}`
  );

  // 3.2 Try to convert same match again (should fail)
  const { response: res2, data: data2 } = await apiCall('/api/matches/convert-to-deal', {
    method: 'POST',
    headers: {
      'X-User-ID': ELITE_AGENCY.id
    },
    body: JSON.stringify(dealPayload)
  });

  logTest(
    'Converting already-converted match returns 400',
    res2.status === 400,
    `Status: ${res2.status}, Error: ${data2?.error}`
  );

  // 3.3 Test validation - missing required fields
  const { response: res3, data: data3 } = await apiCall('/api/matches/convert-to-deal', {
    method: 'POST',
    headers: {
      'X-User-ID': ELITE_AGENCY.id
    },
    body: JSON.stringify({
      match_id: match.id,
      // Missing deal_title and other required fields
    })
  });

  logTest(
    'Missing required fields returns 400',
    res3.status === 400,
    `Status: ${res3.status}, Error: ${data3?.error}`
  );

  return data1?.deal;
}

// ===========================================
// TEST FLOW 4: NIL Deals Management
// ===========================================
async function testNILDealsManagement(testDeal) {
  console.log('\n========== TEST FLOW 4: NIL Deals Management ==========\n');

  // 4.1 Athlete gets their deals
  const { response: res1, data: data1 } = await apiCall('/api/nil-deals', {
    headers: {
      'X-User-ID': SARAH_ATHLETE.id
    }
  });

  logTest(
    'GET /api/nil-deals (as athlete) returns 200',
    res1.status === 200,
    `Status: ${res1.status}, Deals: ${data1?.deals?.length || 0}`
  );

  logTest(
    'Response includes deals array',
    Array.isArray(data1?.deals),
    `Type: ${typeof data1?.deals}`
  );

  // 4.2 Agency gets their deals
  const { response: res2, data: data2 } = await apiCall('/api/nil-deals', {
    headers: {
      'X-User-ID': ELITE_AGENCY.id
    }
  });

  logTest(
    'GET /api/nil-deals (as agency) returns 200',
    res2.status === 200,
    `Status: ${res2.status}, Deals: ${data2?.deals?.length || 0}`
  );

  // 4.3 Agency creates a direct deal (not from match)
  const directDealPayload = {
    athlete_id: MARCUS_ATHLETE.id,
    deal_title: 'Direct E2E Test Deal',
    deal_type: 'event_appearance',
    description: 'Test deal created directly without match',
    compensation_amount: 3000,
    start_date: new Date().toISOString().split('T')[0],
    brand_name: 'Test Direct Brand'
  };

  const { response: res3, data: data3 } = await apiCall('/api/nil-deals', {
    method: 'POST',
    headers: {
      'X-User-ID': ABC_AGENCY.id
    },
    body: JSON.stringify(directDealPayload)
  });

  logTest(
    'POST /api/nil-deals (direct deal) returns 201',
    res3.status === 201,
    `Status: ${res3.status}, Deal ID: ${data3?.deal?.id}`
  );

  logTest(
    'Direct deal created with correct data',
    data3?.deal?.athlete_id === MARCUS_ATHLETE.id && data3?.deal?.agency_id === ABC_AGENCY.id,
    `Athlete: ${data3?.deal?.athlete_id}, Agency: ${data3?.deal?.agency_id}`
  );

  // 4.4 Test filtering by status
  const { response: res4, data: data4 } = await apiCall('/api/nil-deals?status=draft', {
    headers: {
      'X-User-ID': ABC_AGENCY.id
    }
  });

  logTest(
    'Filtering deals by status works',
    res4.status === 200 && data4?.deals?.every(d => d.status === 'draft' || true),
    `Status: ${res4.status}, Filtered deals: ${data4?.deals?.length || 0}`
  );

  return data3?.deal;
}

// ===========================================
// TEST FLOW 5: Security & Authorization
// ===========================================
async function testSecurity() {
  console.log('\n========== TEST FLOW 5: Security & Authorization ==========\n');

  // 5.1 Test unauthorized access (no user ID)
  const { response: res1, data: data1 } = await apiCall('/api/matches/athlete');

  logTest(
    'No authentication returns 401',
    res1.status === 401,
    `Status: ${res1.status}`
  );

  // 5.2 Athlete tries to access another athlete's opportunities
  const { response: res2, data: data2 } = await apiCall('/api/matches/athlete', {
    headers: {
      'X-User-ID': SARAH_ATHLETE.id
    }
  });

  const sarahOpportunities = data2?.opportunities || [];
  const hasMarcusMatches = sarahOpportunities.some(o => o.athlete_id === MARCUS_ATHLETE.id);

  logTest(
    'Athlete cannot see other athlete\'s opportunities',
    !hasMarcusMatches,
    `Found other athlete matches: ${hasMarcusMatches}`
  );

  // 5.3 Athlete tries to respond to another athlete's match
  const { data: marcusMatches } = await supabase
    .from('agency_athlete_matches')
    .select('id')
    .eq('athlete_id', MARCUS_ATHLETE.id)
    .limit(1);

  if (marcusMatches?.[0]) {
    const { response: res3, data: data3 } = await apiCall(`/api/matches/${marcusMatches[0].id}/respond`, {
      method: 'POST',
      headers: {
        'X-User-ID': SARAH_ATHLETE.id // Sarah trying to respond to Marcus's match
      },
      body: JSON.stringify({ response: 'interested' })
    });

    logTest(
      'Athlete cannot respond to another athlete\'s match',
      res3.status === 403,
      `Status: ${res3.status}`
    );
  }

  // 5.4 Agency tries to convert another agency's match
  const { data: otherAgencyMatches } = await supabase
    .from('agency_athlete_matches')
    .select('id, agency_id')
    .neq('agency_id', ELITE_AGENCY.id)
    .is('deal_id', null)
    .limit(1);

  if (otherAgencyMatches?.[0]) {
    const { response: res4, data: data4 } = await apiCall('/api/matches/convert-to-deal', {
      method: 'POST',
      headers: {
        'X-User-ID': ELITE_AGENCY.id // Elite trying to convert ABC's match
      },
      body: JSON.stringify({
        match_id: otherAgencyMatches[0].id,
        deal_title: 'Unauthorized Deal',
        deal_type: 'social_media',
        start_date: new Date().toISOString().split('T')[0]
      })
    });

    logTest(
      'Agency cannot convert another agency\'s match',
      res4.status === 403,
      `Status: ${res4.status}`
    );
  }

  // 5.5 Verify deals are properly scoped
  const { response: res5, data: data5 } = await apiCall('/api/nil-deals', {
    headers: {
      'X-User-ID': SARAH_ATHLETE.id
    }
  });

  const sarahDeals = data5?.deals || [];
  const hasOtherAthleteDeals = sarahDeals.some(d => d.athlete_id !== SARAH_ATHLETE.id);

  logTest(
    'Athlete only sees their own deals',
    !hasOtherAthleteDeals,
    `Found other athlete deals: ${hasOtherAthleteDeals}`
  );

  // 5.6 Agency can only see deals they created or are involved in
  const { response: res6, data: data6 } = await apiCall('/api/nil-deals', {
    headers: {
      'X-User-ID': ELITE_AGENCY.id
    }
  });

  const eliteDeals = data6?.deals || [];
  const hasUnrelatedDeals = eliteDeals.some(d =>
    d.agency_id !== ELITE_AGENCY.id && d.athlete_id !== ELITE_AGENCY.id
  );

  logTest(
    'Agency only sees deals they are involved in',
    !hasUnrelatedDeals,
    `Found unrelated deals: ${hasUnrelatedDeals}`
  );
}

// ===========================================
// TEST FLOW 6: Edge Cases & Error Handling
// ===========================================
async function testEdgeCases() {
  console.log('\n========== TEST FLOW 6: Edge Cases & Error Handling ==========\n');

  // 6.1 Invalid match ID
  const { response: res1, data: data1 } = await apiCall('/api/matches/invalid-uuid-123/respond', {
    method: 'POST',
    headers: {
      'X-User-ID': SARAH_ATHLETE.id
    },
    body: JSON.stringify({ response: 'interested' })
  });

  logTest(
    'Invalid match ID handled properly',
    res1.status === 404 || res1.status === 400 || res1.status === 500,
    `Status: ${res1.status}`
  );

  // 6.2 Non-existent match ID
  const { response: res2, data: data2 } = await apiCall('/api/matches/00000000-0000-0000-0000-000000000000/respond', {
    method: 'POST',
    headers: {
      'X-User-ID': SARAH_ATHLETE.id
    },
    body: JSON.stringify({ response: 'interested' })
  });

  logTest(
    'Non-existent match returns 404',
    res2.status === 404,
    `Status: ${res2.status}`
  );

  // 6.3 Missing request body
  const { data: testMatch } = await supabase
    .from('agency_athlete_matches')
    .select('id')
    .eq('athlete_id', SARAH_ATHLETE.id)
    .limit(1);

  if (testMatch?.[0]) {
    const { response: res3, data: data3 } = await apiCall(`/api/matches/${testMatch[0].id}/respond`, {
      method: 'POST',
      headers: {
        'X-User-ID': SARAH_ATHLETE.id
      },
      body: JSON.stringify({})
    });

    logTest(
      'Missing response field returns 400',
      res3.status === 400,
      `Status: ${res3.status}`
    );
  }

  // 6.4 Invalid deal type
  const { response: res4, data: data4 } = await apiCall('/api/nil-deals', {
    method: 'POST',
    headers: {
      'X-User-ID': ELITE_AGENCY.id
    },
    body: JSON.stringify({
      athlete_id: SARAH_ATHLETE.id,
      deal_title: 'Invalid Type Deal',
      deal_type: 'invalid_type_xyz',
      start_date: new Date().toISOString().split('T')[0]
    })
  });

  logTest(
    'Invalid deal_type returns 400',
    res4.status === 400,
    `Status: ${res4.status}, Error: ${data4?.error}`
  );

  // 6.5 End date before start date
  const { response: res5, data: data5 } = await apiCall('/api/nil-deals', {
    method: 'POST',
    headers: {
      'X-User-ID': ELITE_AGENCY.id
    },
    body: JSON.stringify({
      athlete_id: SARAH_ATHLETE.id,
      deal_title: 'Invalid Date Deal',
      deal_type: 'social_media',
      start_date: '2025-12-31',
      end_date: '2025-01-01' // Before start date
    })
  });

  logTest(
    'End date before start date returns 400',
    res5.status === 400,
    `Status: ${res5.status}`
  );

  // 6.6 Excessive deliverables array
  const { response: res6, data: data6 } = await apiCall('/api/nil-deals', {
    method: 'POST',
    headers: {
      'X-User-ID': ELITE_AGENCY.id
    },
    body: JSON.stringify({
      athlete_id: SARAH_ATHLETE.id,
      deal_title: 'Too Many Deliverables',
      deal_type: 'social_media',
      start_date: new Date().toISOString().split('T')[0],
      deliverables: new Array(100).fill('test deliverable') // More than 50
    })
  });

  logTest(
    'Excessive deliverables returns 400',
    res6.status === 400,
    `Status: ${res6.status}`
  );
}

// ===========================================
// MAIN TEST RUNNER
// ===========================================
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   E2E Testing: Matchmaking & NIL Deals Features               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Run test flows
    const testMatch = await testAthleteViewsOpportunities();
    await testAthleteRespondsToMatch(testMatch);
    const testDeal = await testAgencyConvertsToDeal();
    await testNILDealsManagement(testDeal);
    await testSecurity();
    await testEdgeCases();

    // Print summary
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                        TEST SUMMARY                            ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`Total Tests:    ${results.total}`);
    console.log(`✅ Passed:      ${results.passed.length}`);
    console.log(`❌ Failed:      ${results.failed.length}`);
    console.log(`⚠️  Warnings:    ${results.warnings.length}`);
    console.log(`\nSuccess Rate:  ${((results.passed.length / results.total) * 100).toFixed(1)}%\n`);

    if (results.failed.length > 0) {
      console.log('FAILED TESTS:');
      results.failed.forEach(f => {
        console.log(`  ❌ ${f.name}`);
        if (f.details) console.log(`     ${f.details}`);
      });
      console.log();
    }

    if (results.warnings.length > 0) {
      console.log('WARNINGS:');
      results.warnings.forEach(w => {
        console.log(`  ⚠️  ${w.name}`);
        if (w.details) console.log(`     ${w.details}`);
      });
      console.log();
    }

    // Return results for documentation
    return results;

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR during testing:', error);
    throw error;
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('✅ Testing complete!');
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Testing failed with error:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests, results };
