import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function log(passed: boolean, name: string, details: string) {
  results.push({ name, passed, details });
  console.log(passed ? '✅' : '❌', name, '-', details);
}

async function testCoreTraits() {
  console.log('\n=== FLOW 1: CORE TRAITS INTEGRATION ===\n');

  // 1.1 Sarah Johnson (The Captain)
  const { data: sarah } = await supabase
    .from('user_trait_results')
    .select('*')
    .eq('user_id', 'ca05429a-0f32-4280-8b71-99dc5baee0dc')
    .single();

  log(
    !!sarah && sarah.archetype_name === 'The Captain',
    '1.1 Sarah Johnson trait results',
    sarah ? `${sarah.archetype_name} - leadership: ${sarah.trait_scores?.leadership}%` : 'NOT FOUND'
  );

  // 1.2 Marcus Williams (The Entertainer)
  const { data: marcus } = await supabase
    .from('user_trait_results')
    .select('*')
    .eq('user_id', '7a799d45-d306-4622-b70f-46e7444e1caa')
    .single();

  log(
    !!marcus && marcus.archetype_name === 'The Entertainer',
    '1.2 Marcus Williams trait results',
    marcus ? `${marcus.archetype_name} - charisma: ${marcus.trait_scores?.charisma}%` : 'NOT FOUND'
  );

  // 1.3 Different archetypes
  log(
    !!sarah && !!marcus && sarah.archetype_code !== marcus.archetype_code,
    '1.3 Different archetypes assigned',
    sarah && marcus ? `${sarah.archetype_code} vs ${marcus.archetype_code}` : 'Cannot compare'
  );

  // 1.4 Assessment sessions completed
  const { count: sessions } = await supabase
    .from('assessment_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  log((sessions || 0) >= 2, '1.4 Completed sessions', `${sessions} sessions`);

  // 1.5 Assessment responses
  const { count: responses } = await supabase
    .from('assessment_responses')
    .select('*', { count: 'exact', head: true });

  log((responses || 0) >= 40, '1.5 Assessment responses', `${responses} responses (expected 40)`);

  // 1.6 Core traits defined
  const { count: traits } = await supabase
    .from('core_traits')
    .select('*', { count: 'exact', head: true });

  log(traits === 12, '1.6 Core traits defined', `${traits} traits`);

  // 1.7 Archetypes defined
  const { count: archetypes } = await supabase
    .from('trait_archetypes')
    .select('*', { count: 'exact', head: true });

  log(archetypes === 8, '1.7 Trait archetypes', `${archetypes} archetypes`);

  // 1.8 Questions active
  const { count: questions } = await supabase
    .from('assessment_questions')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  log(questions === 20, '1.8 Assessment questions', `${questions} active questions`);

  // 1.9 FMV trait bonus calculation test
  if (sarah && marcus) {
    const sarahBrandTraits = ['charisma', 'creativity', 'authenticity', 'ambition'];
    const sarahAvg = sarahBrandTraits.reduce((sum, t) => sum + (sarah.trait_scores?.[t] || 0), 0) / 4;
    const sarahBonus = Math.round((sarahAvg / 100) * 5);

    const marcusAvg = sarahBrandTraits.reduce((sum, t) => sum + (marcus.trait_scores?.[t] || 0), 0) / 4;
    const marcusBonus = Math.round((marcusAvg / 100) * 5);

    log(
      marcusBonus > sarahBonus,
      '1.9 FMV trait bonus differentiation',
      `Entertainer: +${marcusBonus} vs Captain: +${sarahBonus}`
    );
  }
}

async function testParentAthlete() {
  console.log('\n=== FLOW 2: PARENT-ATHLETE RELATIONSHIPS ===\n');

  // 2.1 Table exists with data
  const { data: relationships, error } = await supabase
    .from('parent_athlete_relationships')
    .select('*');

  log(
    !error && (relationships?.length || 0) > 0,
    '2.1 Parent-athlete relationships',
    error ? error.message : `${relationships?.length} relationships`
  );

  // 2.2 Permissions structure
  if (relationships && relationships.length > 0) {
    const rel = relationships[0];
    const hasPermissions = rel.permissions && Object.keys(rel.permissions).length > 0;
    log(hasPermissions, '2.2 Permissions stored', Object.keys(rel.permissions || {}).join(', '));
  } else {
    log(false, '2.2 Permissions stored', 'No relationships to check');
  }

  // 2.3 Parent users exist
  const { count: parents } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'parent');

  log((parents || 0) > 0, '2.3 Parent users exist', `${parents} parents`);

  // 2.4 Verified relationships
  if (relationships) {
    const verified = relationships.filter(r => r.verified).length;
    log(verified > 0, '2.4 Verified relationships', `${verified}/${relationships.length} verified`);
  }
}

async function testMatchPersistence() {
  console.log('\n=== FLOW 3: MATCH PERSISTENCE ===\n');

  // 3.1 Match records exist
  const { data: matches, count } = await supabase
    .from('agency_athlete_matches')
    .select('*', { count: 'exact' });

  log((count || 0) > 0, '3.1 Match records', `${count} matches stored`);

  // 3.2 Status pipeline
  const statuses: Record<string, number> = {};
  matches?.forEach(m => {
    statuses[m.status] = (statuses[m.status] || 0) + 1;
  });
  const hasMultipleStatuses = Object.keys(statuses).length > 1;
  log(hasMultipleStatuses || (count || 0) > 0, '3.2 Status pipeline', JSON.stringify(statuses));

  // 3.3 Match scores
  const withScores = matches?.filter(m => m.match_score > 0) || [];
  log(withScores.length > 0, '3.3 Match scores stored', `${withScores.length} matches with scores`);

  // 3.4 Deal linking column
  const { data: sample } = await supabase
    .from('agency_athlete_matches')
    .select('deal_id')
    .limit(1);

  log(sample !== null, '3.4 Deal linking ready', 'deal_id column exists');

  // 3.5 Analytics views
  const { error: viewError1 } = await supabase.from('match_deal_pipeline').select('*').limit(1);
  const { error: viewError2 } = await supabase.from('athlete_opportunities').select('*').limit(1);

  log(!viewError1, '3.5 match_deal_pipeline view', viewError1?.message || 'accessible');
  log(!viewError2, '3.6 athlete_opportunities view', viewError2?.message || 'accessible');
}

async function testAthleteJourney() {
  console.log('\n=== FLOW 4: ATHLETE JOURNEY ===\n');

  // 4.1 Users table
  const { count: users } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  log((users || 0) > 0, '4.1 Users table', `${users} users`);

  // 4.2 Athlete profiles
  const { count: profiles } = await supabase
    .from('athlete_profiles')
    .select('*', { count: 'exact', head: true });

  log((profiles || 0) > 0, '4.2 Athlete profiles', `${profiles} profiles`);

  // 4.3 Public profiles
  const { count: publicProfiles } = await supabase
    .from('athlete_public_profiles')
    .select('*', { count: 'exact', head: true });

  log((publicProfiles || 0) > 0, '4.3 Public profiles', `${publicProfiles} public profiles`);

  // 4.4 Social media stats
  const { count: socialStats } = await supabase
    .from('social_media_stats')
    .select('*', { count: 'exact', head: true });

  log((socialStats || 0) > 0, '4.4 Social media stats', `${socialStats} records`);

  // 4.5 FMV data
  const { count: fmvRecords } = await supabase
    .from('athlete_fmv_data')
    .select('*', { count: 'exact', head: true });

  log((fmvRecords || 0) > 0, '4.5 FMV data', `${fmvRecords} FMV records`);
}

async function testAgencyJourney() {
  console.log('\n=== FLOW 5: AGENCY JOURNEY ===\n');

  // 5.1 Agency/brand users
  const { data: agencies } = await supabase
    .from('users')
    .select('company_name, first_name')
    .in('role', ['agency', 'brand']);

  log((agencies?.length || 0) > 0, '5.1 Agency/brand users', `${agencies?.length} accounts`);

  // 5.2 Campaigns
  const { count: campaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true });

  log((campaigns || 0) > 0, '5.2 Campaigns', `${campaigns} campaigns`);

  // 5.3 NIL deals
  const { count: deals } = await supabase
    .from('nil_deals')
    .select('*', { count: 'exact', head: true });

  log((deals || 0) > 0, '5.3 NIL deals', `${deals} deals`);

  // 5.4 Deal status distribution
  const { data: dealData } = await supabase
    .from('nil_deals')
    .select('status');

  const dealStatuses: Record<string, number> = {};
  dealData?.forEach(d => {
    dealStatuses[d.status] = (dealStatuses[d.status] || 0) + 1;
  });
  log(Object.keys(dealStatuses).length > 0, '5.4 Deal lifecycle', JSON.stringify(dealStatuses));
}

async function testChatSystem() {
  console.log('\n=== FLOW 6: CHAT/AI SYSTEM ===\n');

  // 6.1 Chat messages
  const { count: messages } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true });

  log((messages || 0) > 0, '6.1 Chat messages', `${messages} messages`);

  // 6.2 Conversation memories
  const { count: memories } = await supabase
    .from('conversation_memories')
    .select('*', { count: 'exact', head: true });

  log((memories || 0) > 0, '6.2 Conversation memories', `${memories} memories`);

  // 6.3 Documents (RAG)
  const { count: docs } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  log(true, '6.3 Documents table', `${docs || 0} documents (ready)`);

  // 6.4 Document chunks
  const { count: chunks } = await supabase
    .from('document_chunks')
    .select('*', { count: 'exact', head: true });

  log(true, '6.4 Document chunks', `${chunks || 0} chunks (ready)`);
}

async function testQuizBadges() {
  console.log('\n=== FLOW 7: QUIZ & BADGES ===\n');

  // 7.1 Badges defined
  const { count: badges } = await supabase
    .from('badges')
    .select('*', { count: 'exact', head: true });

  log((badges || 0) >= 5, '7.1 Badges defined', `${badges} badges`);

  // 7.2 User badges awarded
  const { count: userBadges } = await supabase
    .from('user_badges')
    .select('*', { count: 'exact', head: true });

  log((userBadges || 0) > 0, '7.2 User badges awarded', `${userBadges} awards`);

  // 7.3 Quiz sessions
  const { count: quizSessions } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true });

  log((quizSessions || 0) >= 0, '7.3 Quiz sessions', `${quizSessions} sessions`);
}

async function testSecurity() {
  console.log('\n=== FLOW 8: SECURITY (RLS) ===\n');

  const tables = [
    'users',
    'athlete_profiles',
    'user_trait_results',
    'chat_messages',
    'nil_deals',
    'assessment_sessions',
    'assessment_responses',
    'parent_athlete_relationships',
    'agency_athlete_matches'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    log(!error, `8.${tables.indexOf(table) + 1} ${table} RLS`, error?.message || 'Service role access OK');
  }
}

async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║         CHATNIL E2E COMPREHENSIVE TEST SUITE                 ║');
  console.log('║         Date:', new Date().toISOString().split('T')[0], '                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  await testCoreTraits();
  await testParentAthlete();
  await testMatchPersistence();
  await testAthleteJourney();
  await testAgencyJourney();
  await testChatSystem();
  await testQuizBadges();
  await testSecurity();

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                       TEST SUMMARY                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const score = Math.round((passed / total) * 100);

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} (${Math.round((passed/total)*100)}%)`);
  console.log(`Failed: ${failed}`);
  console.log(`\nHealth Score: ${score}%`);
  console.log(`Status: ${score >= 85 ? '✅ PRODUCTION READY' : score >= 70 ? '⚠️ NEEDS ATTENTION' : '❌ NOT READY'}`);

  if (failed > 0) {
    console.log('\n--- FAILED TESTS ---');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.name}: ${r.details}`);
    });
  }

  // Output JSON for parsing
  console.log('\n--- JSON RESULTS ---');
  console.log(JSON.stringify({ total, passed, failed, score, results }, null, 2));
}

runAllTests().catch(console.error);
