/**
 * Test Dashboard and Profile Data
 * Verifies all data sources are working correctly
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function testDashboardData() {
  console.log('=== DASHBOARD & PROFILE DATA VERIFICATION ===\n');

  // Get Sarah's user ID for testing
  const { data: sarah, error: userErr } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, avatar_url')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (userErr || !sarah) {
    console.log('ERROR: Test user not found -', userErr?.message || 'No user');
    return;
  }

  console.log('Test User:', sarah.email);
  console.log('Name:', sarah.first_name, sarah.last_name);
  console.log('Role:', sarah.role);
  console.log('Avatar URL:', sarah.avatar_url || 'NOT SET');

  let passed = 0;
  let failed = 0;

  // ==================== DASHBOARD TESTS ====================
  console.log('\n' + '='.repeat(50));
  console.log('DASHBOARD DATA TESTS');
  console.log('='.repeat(50));

  // 1. Athlete Profile
  console.log('\n1. ATHLETE PROFILE:');
  const { data: profile, error: profErr } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', sarah.id)
    .single();

  if (profErr) {
    console.log('   ❌ FAIL:', profErr.message);
    failed++;
  } else if (!profile) {
    console.log('   ❌ FAIL: No profile found');
    failed++;
  } else {
    console.log('   ✅ Profile exists');
    console.log('   - Sport:', profile.sport || 'MISSING');
    console.log('   - State:', profile.state || 'MISSING');
    console.log('   - School:', profile.school || 'MISSING');
    console.log('   - FMV Score:', profile.fmv_score || profile.estimated_fmv || 'MISSING');
    console.log('   - FMV Tier:', profile.fmv_tier || 'MISSING');
    passed++;
  }

  // 2. Social Media Stats
  console.log('\n2. SOCIAL MEDIA STATS:');
  const { data: social, error: socialErr } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('user_id', sarah.id);

  if (socialErr) {
    console.log('   ❌ FAIL:', socialErr.message);
    failed++;
  } else {
    console.log('   ✅ Query works');
    console.log('   - Records:', social?.length || 0);
    if (social && social.length > 0) {
      console.log('   - Instagram:', social[0].instagram_followers || 0);
      console.log('   - TikTok:', social[0].tiktok_followers || 0);
      console.log('   - Twitter:', social[0].twitter_followers || 0);
    }
    passed++;
  }

  // 3. Agency Matches
  console.log('\n3. AGENCY MATCHES:');
  const { data: matches, error: matchErr } = await supabase
    .from('agency_athlete_matches')
    .select('*, agency:users!agency_athlete_matches_agency_id_fkey(id, first_name, last_name)')
    .eq('athlete_id', sarah.id);

  if (matchErr) {
    console.log('   ❌ FAIL:', matchErr.message);
    failed++;
  } else {
    console.log('   ✅ Query works');
    console.log('   - Matches:', matches?.length || 0);
    if (matches && matches.length > 0) {
      console.log('   - Top match score:', matches[0].match_score);
    }
    passed++;
  }

  // 4. NIL Deals
  console.log('\n4. NIL DEALS:');
  const { data: deals, error: dealErr } = await supabase
    .from('nil_deals')
    .select('id, deal_title, compensation_amount, status')
    .eq('athlete_id', sarah.id);

  if (dealErr) {
    console.log('   ❌ FAIL:', dealErr.message);
    failed++;
  } else {
    console.log('   ✅ Query works');
    console.log('   - Deals:', deals?.length || 0);
    if (deals && deals.length > 0) {
      const totalValue = deals.reduce((sum, d) => sum + (d.compensation_amount || 0), 0);
      console.log('   - Total Value: $' + totalValue.toLocaleString());
      deals.forEach(d => console.log(`      · ${d.deal_title}: $${d.compensation_amount?.toLocaleString() || 0}`));
    }
    passed++;
  }

  // ==================== PROFILE TESTS ====================
  console.log('\n' + '='.repeat(50));
  console.log('PROFILE & SETTINGS TESTS');
  console.log('='.repeat(50));

  // 5. User Badges
  console.log('\n5. USER BADGES:');
  const { data: userBadges, error: badgeErr } = await supabase
    .from('user_badges')
    .select('*, badges(*)')
    .eq('user_id', sarah.id);

  if (badgeErr) {
    console.log('   ❌ FAIL:', badgeErr.message);
    failed++;
  } else {
    console.log('   ✅ Query works');
    console.log('   - Badges earned:', userBadges?.length || 0);
    passed++;
  }

  // 6. Quiz Sessions
  console.log('\n6. QUIZ SESSIONS:');
  const { data: quizzes, error: quizErr } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', sarah.id);

  if (quizErr) {
    console.log('   ❌ FAIL:', quizErr.message);
    failed++;
  } else {
    console.log('   ✅ Query works');
    console.log('   - Sessions:', quizzes?.length || 0);
    passed++;
  }

  // 7. Portfolio Items
  console.log('\n7. PORTFOLIO ITEMS:');
  const { data: portfolio, error: portErr } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('user_id', sarah.id);

  if (portErr) {
    console.log('   ❌ FAIL:', portErr.message);
    failed++;
  } else {
    console.log('   ✅ Query works');
    console.log('   - Items:', portfolio?.length || 0);
    passed++;
  }

  // ==================== DATA INTEGRITY TESTS ====================
  console.log('\n' + '='.repeat(50));
  console.log('DATA INTEGRITY TESTS');
  console.log('='.repeat(50));

  // 8. All badges exist
  console.log('\n8. BADGES TABLE:');
  const { data: allBadges, error: allBadgeErr } = await supabase
    .from('badges')
    .select('id, name, tier, category, criteria');

  if (allBadgeErr) {
    console.log('   ❌ FAIL:', allBadgeErr.message);
    failed++;
  } else {
    console.log('   ✅ Query works');
    console.log('   - Total badges:', allBadges?.length || 0);
    allBadges?.slice(0, 3).forEach(b => {
      console.log('   -', b.name, '(' + b.tier + ')');
    });
    passed++;
  }

  // 9. Quiz questions exist
  console.log('\n9. QUIZ QUESTIONS:');
  const { data: questions, error: qErr } = await supabase
    .from('quiz_questions')
    .select('id, question, difficulty')
    .limit(5);

  if (qErr) {
    console.log('   ❌ FAIL:', qErr.message);
    failed++;
  } else {
    console.log('   ✅ Query works');
    console.log('   - Questions:', questions?.length || 0);
    passed++;
  }

  // 10. Agencies exist
  console.log('\n10. AGENCIES (for matching):');
  const { data: agencies, error: agErr } = await supabase
    .from('users')
    .select('id, first_name, role')
    .eq('role', 'agency')
    .limit(5);

  if (agErr) {
    console.log('   ❌ FAIL:', agErr.message);
    failed++;
  } else {
    console.log('   ✅ Query works');
    console.log('   - Agencies:', agencies?.length || 0);
    passed++;
  }

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`\nTests Passed: ${passed}/${passed + failed}`);
  console.log(`Tests Failed: ${failed}/${passed + failed}`);
  console.log(`Health Score: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n✅ ALL TESTS PASSING - Dashboard and Profile data queries work correctly');
  } else {
    console.log('\n⚠️ Some tests failed - see details above');
  }
}

testDashboardData().catch(console.error);
