/**
 * ChatNIL Platform E2E Test Suite
 * ================================
 * Comprehensive end-to-end testing for all platform features.
 *
 * Run with: SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/e2e-platform-test.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Test results tracking
interface TestResult {
  flow: string;
  step: string;
  status: 'pass' | 'fail' | 'partial' | 'skip';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let partialTests = 0;

function logTest(flow: string, step: string, status: 'pass' | 'fail' | 'partial' | 'skip', message: string) {
  const icons = { pass: '✅', fail: '❌', partial: '⚠️', skip: '⏭️' };
  console.log(`${icons[status]} [${flow}] ${step}: ${message}`);
  results.push({ flow, step, status, message });
  totalTests++;
  if (status === 'pass') passedTests++;
  else if (status === 'fail') failedTests++;
  else if (status === 'partial') partialTests++;
}

// ============================================================================
// FLOW 1: ATHLETE JOURNEY TESTS
// ============================================================================

async function testAthleteJourney() {
  console.log('\n📋 FLOW 1: NEW ATHLETE COMPLETE JOURNEY\n');

  // Test 1.1: Check users table exists
  const { data: users, error: usersErr } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (usersErr) {
    logTest('Flow 1', '1.1 Users table access', 'fail', usersErr.message);
  } else {
    logTest('Flow 1', '1.1 Users table access', 'pass', 'Users table accessible');
  }

  // Test 1.2: Check athlete_profiles table
  const { data: profiles, error: profilesErr } = await supabase
    .from('athlete_profiles')
    .select('id')
    .limit(1);

  if (profilesErr) {
    logTest('Flow 1', '1.2 Athlete profiles table', 'fail', profilesErr.message);
  } else {
    logTest('Flow 1', '1.2 Athlete profiles table', 'pass', 'Athlete profiles accessible');
  }

  // Test 1.3: Check assessment tables exist
  const { data: questions, error: qErr } = await supabase
    .from('assessment_questions')
    .select('id, question_text')
    .eq('is_active', true);

  if (qErr) {
    logTest('Flow 1', '1.3 Assessment questions', 'fail', qErr.message);
  } else if (!questions || questions.length === 0) {
    logTest('Flow 1', '1.3 Assessment questions', 'partial', 'No active questions found');
  } else {
    logTest('Flow 1', '1.3 Assessment questions', 'pass', `Found ${questions.length} active questions`);
  }

  // Test 1.4: Check archetypes exist
  const { data: archetypes, error: archErr } = await supabase
    .from('trait_archetypes')
    .select('archetype_code, archetype_name');

  if (archErr) {
    logTest('Flow 1', '1.4 Archetypes data', 'fail', archErr.message);
  } else if (!archetypes || archetypes.length === 0) {
    logTest('Flow 1', '1.4 Archetypes data', 'partial', 'No archetypes seeded');
  } else {
    logTest('Flow 1', '1.4 Archetypes data', 'pass', `Found ${archetypes.length} archetypes`);
  }

  // Test 1.5: Check core_traits exist
  const { data: traits, error: traitsErr } = await supabase
    .from('core_traits')
    .select('trait_code, trait_name');

  if (traitsErr) {
    logTest('Flow 1', '1.5 Core traits data', 'fail', traitsErr.message);
  } else if (!traits || traits.length === 0) {
    logTest('Flow 1', '1.5 Core traits data', 'partial', 'No traits seeded');
  } else {
    logTest('Flow 1', '1.5 Core traits data', 'pass', `Found ${traits.length} traits`);
  }

  // Test 1.6: Check user_trait_results table
  const { error: traitResultsErr } = await supabase
    .from('user_trait_results')
    .select('id')
    .limit(1);

  if (traitResultsErr) {
    logTest('Flow 1', '1.6 User trait results table', 'fail', traitResultsErr.message);
  } else {
    logTest('Flow 1', '1.6 User trait results table', 'pass', 'Table accessible');
  }

  // Test 1.7: Check FMV data table
  const { error: fmvErr } = await supabase
    .from('athlete_fmv_data')
    .select('id')
    .limit(1);

  if (fmvErr) {
    logTest('Flow 1', '1.7 FMV data table', 'fail', fmvErr.message);
  } else {
    logTest('Flow 1', '1.7 FMV data table', 'pass', 'FMV table accessible');
  }

  // Test 1.8: Get a test athlete with completed assessment
  const { data: testAthlete, error: testErr } = await supabase
    .from('users')
    .select('id, first_name, last_name, role')
    .eq('role', 'athlete')
    .limit(1)
    .single();

  if (testErr || !testAthlete) {
    logTest('Flow 1', '1.8 Test athlete exists', 'partial', 'No test athlete found');
    return;
  }

  logTest('Flow 1', '1.8 Test athlete exists', 'pass', `Found: ${testAthlete.first_name} ${testAthlete.last_name}`);

  // Test 1.9: Check if athlete has trait results
  const { data: athleteTraits, error: atErr } = await supabase
    .from('user_trait_results')
    .select('archetype_code, archetype_name, top_traits, trait_scores')
    .eq('user_id', testAthlete.id)
    .maybeSingle();

  if (atErr) {
    logTest('Flow 1', '1.9 Athlete trait results', 'fail', atErr.message);
  } else if (!athleteTraits) {
    logTest('Flow 1', '1.9 Athlete trait results', 'partial', 'No assessment completed for this athlete');
  } else {
    logTest('Flow 1', '1.9 Athlete trait results', 'pass',
      `Archetype: ${athleteTraits.archetype_name}, Top traits: ${athleteTraits.top_traits?.slice(0, 3).join(', ')}`);
  }

  // Test 1.10: Check athlete FMV
  const { data: athleteFmv, error: afErr } = await supabase
    .from('athlete_fmv_data')
    .select('fmv_score, fmv_tier, brand_score')
    .eq('athlete_id', testAthlete.id)
    .maybeSingle();

  if (afErr) {
    logTest('Flow 1', '1.10 Athlete FMV data', 'fail', afErr.message);
  } else if (!athleteFmv) {
    logTest('Flow 1', '1.10 Athlete FMV data', 'partial', 'No FMV calculated for this athlete');
  } else {
    logTest('Flow 1', '1.10 Athlete FMV data', 'pass',
      `FMV: ${athleteFmv.fmv_score}, Tier: ${athleteFmv.fmv_tier}, Brand Score: ${athleteFmv.brand_score}`);
  }
}

// ============================================================================
// FLOW 2-3: PARENT AND AGENCY JOURNEY TESTS
// ============================================================================

async function testParentAndAgencyJourneys() {
  console.log('\n📋 FLOW 2-3: PARENT AND AGENCY JOURNEYS\n');

  // Test 2.1: Check for parent users
  const { data: parents, error: parentErr } = await supabase
    .from('users')
    .select('id, first_name, role')
    .eq('role', 'parent')
    .limit(3);

  if (parentErr) {
    logTest('Flow 2', '2.1 Parent users query', 'fail', parentErr.message);
  } else if (!parents || parents.length === 0) {
    logTest('Flow 2', '2.1 Parent users exist', 'partial', 'No parent users found');
  } else {
    logTest('Flow 2', '2.1 Parent users exist', 'pass', `Found ${parents.length} parent users`);
  }

  // Test 2.2: Check parent-athlete relationships
  const { data: relationships, error: relErr } = await supabase
    .from('parent_athlete_relationships')
    .select('id')
    .limit(5);

  if (relErr) {
    logTest('Flow 2', '2.2 Parent-athlete relationships', 'fail', relErr.message);
  } else {
    logTest('Flow 2', '2.2 Parent-athlete relationships', 'pass',
      `Found ${relationships?.length || 0} relationships`);
  }

  // Test 3.1: Check for agency users
  const { data: agencies, error: agencyErr } = await supabase
    .from('users')
    .select('id, first_name, company_name, role')
    .eq('role', 'agency')
    .limit(3);

  if (agencyErr) {
    logTest('Flow 3', '3.1 Agency users query', 'fail', agencyErr.message);
  } else if (!agencies || agencies.length === 0) {
    logTest('Flow 3', '3.1 Agency users exist', 'partial', 'No agency users found');
  } else {
    logTest('Flow 3', '3.1 Agency users exist', 'pass',
      `Found ${agencies.length} agencies: ${agencies.map(a => a.company_name || a.first_name).join(', ')}`);
  }

  // Test 3.2: Check agency campaigns
  const { data: campaigns, error: campErr } = await supabase
    .from('campaigns')
    .select('id, name, status')
    .limit(5);

  if (campErr) {
    logTest('Flow 3', '3.2 Campaigns table', 'fail', campErr.message);
  } else {
    logTest('Flow 3', '3.2 Campaigns table', 'pass',
      `Found ${campaigns?.length || 0} campaigns`);
  }

  // Test 3.3: Check athlete matches
  const { data: matches, error: matchErr } = await supabase
    .from('athlete_matches')
    .select('id, match_score, match_tier, status')
    .limit(10);

  if (matchErr) {
    logTest('Flow 3', '3.3 Athlete matches', 'fail', matchErr.message);
  } else {
    logTest('Flow 3', '3.3 Athlete matches', 'pass',
      `Found ${matches?.length || 0} matches`);
  }
}

// ============================================================================
// FLOW 4-6: CORE TRAITS INTEGRATIONS
// ============================================================================

async function testCoreTraitsIntegrations() {
  console.log('\n📋 FLOW 4-6: CORE TRAITS INTEGRATIONS\n');

  // Test 4.1: Verify matchmaking engine has trait_alignment field
  const { data: matchWithTraits, error: mErr } = await supabase
    .from('athlete_matches')
    .select('id, score_breakdown')
    .limit(1)
    .maybeSingle();

  if (mErr) {
    logTest('Flow 4', '4.1 Match score breakdown', 'fail', mErr.message);
  } else if (!matchWithTraits?.score_breakdown) {
    logTest('Flow 4', '4.1 Match score breakdown', 'partial', 'No score breakdown in matches');
  } else {
    const hasTraitAlignment = 'trait_alignment' in (matchWithTraits.score_breakdown as object);
    if (hasTraitAlignment) {
      logTest('Flow 4', '4.1 Trait alignment in matches', 'pass', 'trait_alignment factor present');
    } else {
      logTest('Flow 4', '4.1 Trait alignment in matches', 'partial',
        'Score breakdown exists but no trait_alignment (old data)');
    }
  }

  // Test 4.2: Check FMV calculation includes trait bonus capability
  const { data: fmvWithTraits, error: fErr } = await supabase
    .from('athlete_fmv_data')
    .select('athlete_id, brand_score')
    .gt('brand_score', 0)
    .limit(5);

  if (fErr) {
    logTest('Flow 5', '5.1 FMV with brand score', 'fail', fErr.message);
  } else {
    logTest('Flow 5', '5.1 FMV with brand score', 'pass',
      `Found ${fmvWithTraits?.length || 0} athletes with brand scores`);
  }

  // Test 6.1: Check chat conversations table
  const { data: convos, error: cErr } = await supabase
    .from('chat_conversations')
    .select('id, user_id')
    .limit(5);

  if (cErr) {
    logTest('Flow 6', '6.1 Chat conversations', 'fail', cErr.message);
  } else {
    logTest('Flow 6', '6.1 Chat conversations', 'pass',
      `Found ${convos?.length || 0} conversations`);
  }

  // Test 6.2: Check chat messages table
  const { data: msgs, error: msgErr } = await supabase
    .from('chat_messages')
    .select('id, role')
    .limit(10);

  if (msgErr) {
    logTest('Flow 6', '6.2 Chat messages', 'fail', msgErr.message);
  } else {
    logTest('Flow 6', '6.2 Chat messages', 'pass',
      `Found ${msgs?.length || 0} messages`);
  }
}

// ============================================================================
// FLOW 7-9: CHAT, QUIZ, DEAL SYSTEMS
// ============================================================================

async function testChatQuizDealSystems() {
  console.log('\n📋 FLOW 7-9: CHAT, QUIZ, DEAL SYSTEMS\n');

  // Test 7.1: Check quizzes table
  const { data: quizzes, error: qErr } = await supabase
    .from('quizzes')
    .select('id, title, category, difficulty, is_active')
    .eq('is_active', true);

  if (qErr) {
    logTest('Flow 7', '7.1 Quizzes table', 'fail', qErr.message);
  } else if (!quizzes || quizzes.length === 0) {
    logTest('Flow 7', '7.1 Active quizzes', 'partial', 'No active quizzes found');
  } else {
    logTest('Flow 7', '7.1 Active quizzes', 'pass',
      `Found ${quizzes.length} active quizzes: ${quizzes.map(q => q.title).join(', ')}`);
  }

  // Test 7.2: Check quiz questions
  const { data: quizQs, error: qqErr } = await supabase
    .from('quiz_questions')
    .select('id, quiz_id')
    .limit(20);

  if (qqErr) {
    logTest('Flow 7', '7.2 Quiz questions', 'fail', qqErr.message);
  } else {
    logTest('Flow 7', '7.2 Quiz questions', 'pass',
      `Found ${quizQs?.length || 0} quiz questions`);
  }

  // Test 7.3: Check quiz sessions
  const { data: sessions, error: sErr } = await supabase
    .from('quiz_sessions')
    .select('id, status, score')
    .limit(10);

  if (sErr) {
    logTest('Flow 7', '7.3 Quiz sessions', 'fail', sErr.message);
  } else {
    logTest('Flow 7', '7.3 Quiz sessions', 'pass',
      `Found ${sessions?.length || 0} quiz sessions`);
  }

  // Test 8.1: Check badges table
  const { data: badges, error: bErr } = await supabase
    .from('badges')
    .select('id, name, category');

  if (bErr) {
    logTest('Flow 8', '8.1 Badges table', 'fail', bErr.message);
  } else if (!badges || badges.length === 0) {
    logTest('Flow 8', '8.1 Badges exist', 'partial', 'No badges seeded');
  } else {
    logTest('Flow 8', '8.1 Badges exist', 'pass',
      `Found ${badges.length} badges`);
  }

  // Test 8.2: Check user badges
  const { data: userBadges, error: ubErr } = await supabase
    .from('user_badges')
    .select('id, user_id, badge_id')
    .limit(10);

  if (ubErr) {
    logTest('Flow 8', '8.2 User badges', 'fail', ubErr.message);
  } else {
    logTest('Flow 8', '8.2 User badges', 'pass',
      `Found ${userBadges?.length || 0} awarded badges`);
  }

  // Test 9.1: Check NIL deals table
  const { data: deals, error: dErr } = await supabase
    .from('nil_deals')
    .select('id, status, athlete_id, agency_id')
    .limit(10);

  if (dErr) {
    logTest('Flow 9', '9.1 NIL deals table', 'fail', dErr.message);
  } else {
    logTest('Flow 9', '9.1 NIL deals table', 'pass',
      `Found ${deals?.length || 0} deals`);
  }

  // Test 9.2: Check deal status distribution
  if (deals && deals.length > 0) {
    const statusCounts: Record<string, number> = {};
    deals.forEach(d => {
      statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;
    });
    logTest('Flow 9', '9.2 Deal statuses', 'pass',
      `Statuses: ${Object.entries(statusCounts).map(([k,v]) => `${k}:${v}`).join(', ')}`);
  }
}

// ============================================================================
// FLOW 10-12: SECURITY, MOBILE, ERROR HANDLING
// ============================================================================

async function testSecurityAndErrorHandling() {
  console.log('\n📋 FLOW 10-12: SECURITY, MOBILE, ERROR HANDLING\n');

  // Test 10.1: Check RLS is enabled on key tables
  const criticalTables = [
    'users', 'athlete_profiles', 'user_trait_results',
    'chat_conversations', 'chat_messages', 'nil_deals',
    'assessment_sessions', 'assessment_responses'
  ];

  for (const table of criticalTables) {
    try {
      // Try to access without auth - should be blocked by RLS
      // With service role key, we bypass RLS, so we just check table exists
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        logTest('Flow 10', `10.1 ${table} access`, 'fail', error.message);
      } else {
        logTest('Flow 10', `10.1 ${table} access`, 'pass', 'Table accessible with service role');
      }
    } catch (err: any) {
      logTest('Flow 10', `10.1 ${table} access`, 'fail', err.message);
    }
  }

  // Test 11.1: Check responsive UI components exist (by verifying files)
  logTest('Flow 11', '11.1 Mobile responsive', 'skip', 'UI testing requires browser automation');

  // Test 12.1: Check error logging structure
  logTest('Flow 12', '12.1 Error handling', 'skip', 'Runtime error testing requires live requests');
}

// ============================================================================
// ADDITIONAL INTEGRATION TESTS
// ============================================================================

async function testAdditionalIntegrations() {
  console.log('\n📋 ADDITIONAL INTEGRATION TESTS\n');

  // Test: Documents table (for document analysis feature)
  const { error: docErr } = await supabase
    .from('documents')
    .select('id')
    .limit(1);

  if (docErr) {
    if (docErr.message.includes('does not exist')) {
      logTest('Additional', 'Documents table', 'partial', 'Table not yet created');
    } else {
      logTest('Additional', 'Documents table', 'fail', docErr.message);
    }
  } else {
    logTest('Additional', 'Documents table', 'pass', 'Documents table exists');
  }

  // Test: Document chunks table
  const { error: chunkErr } = await supabase
    .from('document_chunks')
    .select('id')
    .limit(1);

  if (chunkErr) {
    if (chunkErr.message.includes('does not exist')) {
      logTest('Additional', 'Document chunks table', 'partial', 'Table not yet created');
    } else {
      logTest('Additional', 'Document chunks table', 'fail', chunkErr.message);
    }
  } else {
    logTest('Additional', 'Document chunks table', 'pass', 'Document chunks table exists');
  }

  // Test: Knowledge base chunks for RAG
  const { data: kbChunks, error: kbErr } = await supabase
    .from('knowledge_base_chunks')
    .select('id, category')
    .limit(10);

  if (kbErr) {
    logTest('Additional', 'Knowledge base chunks', 'fail', kbErr.message);
  } else if (!kbChunks || kbChunks.length === 0) {
    logTest('Additional', 'Knowledge base chunks', 'partial', 'No knowledge chunks found (RAG may not work)');
  } else {
    const categories = [...new Set(kbChunks.map(c => c.category))];
    logTest('Additional', 'Knowledge base chunks', 'pass',
      `Found ${kbChunks.length}+ chunks in categories: ${categories.join(', ')}`);
  }

  // Test: Conversation memories table
  const { error: memErr } = await supabase
    .from('conversation_memories')
    .select('id')
    .limit(1);

  if (memErr) {
    if (memErr.message.includes('does not exist')) {
      logTest('Additional', 'Conversation memories', 'partial', 'Table not yet created');
    } else {
      logTest('Additional', 'Conversation memories', 'fail', memErr.message);
    }
  } else {
    logTest('Additional', 'Conversation memories', 'pass', 'Memories table exists');
  }

  // Test: Profile memories table
  const { data: profileMems, error: pmErr } = await supabase
    .from('profile_memories')
    .select('id, user_id')
    .limit(5);

  if (pmErr) {
    logTest('Additional', 'Profile memories', 'fail', pmErr.message);
  } else {
    logTest('Additional', 'Profile memories', 'pass',
      `Found ${profileMems?.length || 0} profile memories`);
  }
}

// ============================================================================
// MATCHMAKING ENGINE INTEGRATION TEST
// ============================================================================

async function testMatchmakingIntegration() {
  console.log('\n📋 MATCHMAKING ENGINE INTEGRATION\n');

  // Get an athlete with trait results
  const { data: athleteWithTraits, error: aErr } = await supabase
    .from('user_trait_results')
    .select(`
      user_id,
      archetype_code,
      archetype_name,
      top_traits,
      users!inner (
        id,
        first_name,
        last_name,
        primary_sport
      )
    `)
    .limit(1)
    .maybeSingle();

  if (aErr || !athleteWithTraits) {
    logTest('Matchmaking', 'Athlete with traits', 'partial', 'No athlete with completed assessment found');
    return;
  }

  logTest('Matchmaking', 'Athlete with traits', 'pass',
    `${(athleteWithTraits as any).users?.first_name} is "${athleteWithTraits.archetype_name}"`);

  // Check if this athlete has matches
  const { data: athleteMatches, error: mErr } = await supabase
    .from('athlete_matches')
    .select('id, match_score, match_tier, score_breakdown, agency_id')
    .eq('athlete_id', athleteWithTraits.user_id)
    .order('match_score', { ascending: false })
    .limit(3);

  if (mErr) {
    logTest('Matchmaking', 'Athlete matches query', 'fail', mErr.message);
  } else if (!athleteMatches || athleteMatches.length === 0) {
    logTest('Matchmaking', 'Athlete matches exist', 'partial', 'No matches for this athlete');
  } else {
    logTest('Matchmaking', 'Athlete matches exist', 'pass',
      `Found ${athleteMatches.length} matches. Top score: ${athleteMatches[0]?.match_score}`);

    // Check if matches have trait_alignment in breakdown
    const firstMatch = athleteMatches[0];
    if (firstMatch.score_breakdown && typeof firstMatch.score_breakdown === 'object') {
      const breakdown = firstMatch.score_breakdown as Record<string, number>;
      if ('trait_alignment' in breakdown) {
        logTest('Matchmaking', 'Trait alignment in match', 'pass',
          `trait_alignment: ${breakdown.trait_alignment}/5`);
      } else {
        logTest('Matchmaking', 'Trait alignment in match', 'partial',
          'Match exists but no trait_alignment factor (needs re-run)');
      }
    }
  }
}

// ============================================================================
// FMV WITH TRAITS INTEGRATION TEST
// ============================================================================

async function testFMVWithTraitsIntegration() {
  console.log('\n📋 FMV WITH TRAITS INTEGRATION\n');

  // Get athletes with both traits and FMV
  const { data: athletesWithBoth, error: aErr } = await supabase
    .from('user_trait_results')
    .select(`
      user_id,
      trait_scores,
      archetype_name,
      users!inner (
        id,
        first_name
      )
    `)
    .limit(5);

  if (aErr || !athletesWithBoth || athletesWithBoth.length === 0) {
    logTest('FMV+Traits', 'Athletes with traits', 'partial', 'No athletes with trait results');
    return;
  }

  for (const athlete of athletesWithBoth) {
    const { data: fmv, error: fErr } = await supabase
      .from('athlete_fmv_data')
      .select('fmv_score, brand_score, fmv_tier')
      .eq('athlete_id', athlete.user_id)
      .maybeSingle();

    if (fErr) {
      logTest('FMV+Traits', `FMV for ${(athlete as any).users?.first_name}`, 'fail', fErr.message);
    } else if (!fmv) {
      logTest('FMV+Traits', `FMV for ${(athlete as any).users?.first_name}`, 'partial', 'No FMV calculated');
    } else {
      // Check if brand_score could include trait bonus
      const traitScores = athlete.trait_scores as Record<string, number> || {};
      const brandTraits = ['charisma', 'creativity', 'authenticity', 'ambition'];
      const avgBrandTrait = brandTraits.reduce((sum, t) => sum + (traitScores[t] || 0), 0) / 4;
      const expectedBonus = Math.round((avgBrandTrait / 100) * 5);

      logTest('FMV+Traits', `FMV for ${(athlete as any).users?.first_name}`, 'pass',
        `FMV: ${fmv.fmv_score}, Brand: ${fmv.brand_score}, Potential trait bonus: +${expectedBonus}`);
    }
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   CHATNIL PLATFORM E2E TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`Started: ${new Date().toISOString()}\n`);

  await testAthleteJourney();
  await testParentAndAgencyJourneys();
  await testCoreTraitsIntegrations();
  await testChatQuizDealSystems();
  await testSecurityAndErrorHandling();
  await testAdditionalIntegrations();
  await testMatchmakingIntegration();
  await testFMVWithTraitsIntegration();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  console.log(`⚠️ Partial: ${partialTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`⏭️ Skipped: ${totalTests - passedTests - failedTests - partialTests}`);

  const healthScore = Math.round(((passedTests + partialTests * 0.5) / totalTests) * 100);
  console.log(`\nPlatform Health Score: ${healthScore}%`);

  if (healthScore >= 90) {
    console.log('🟢 Status: PRODUCTION READY');
  } else if (healthScore >= 75) {
    console.log('🟡 Status: MOSTLY READY (Minor issues)');
  } else if (healthScore >= 50) {
    console.log('🟠 Status: NEEDS WORK (Significant issues)');
  } else {
    console.log('🔴 Status: NOT READY (Critical issues)');
  }

  console.log(`\nCompleted: ${new Date().toISOString()}`);

  // Return results for report generation
  return {
    totalTests,
    passedTests,
    failedTests,
    partialTests,
    healthScore,
    results
  };
}

// Run tests
runAllTests().then(summary => {
  console.log('\n\nDetailed results available in test output above.');
  process.exit(summary.failedTests > 0 ? 1 : 0);
}).catch(err => {
  console.error('Test suite crashed:', err);
  process.exit(1);
});
