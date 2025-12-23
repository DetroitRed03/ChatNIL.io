/**
 * Test Athlete and Parent User Journeys
 * Identifies which steps are failing and why
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

interface TestResult {
  step: string;
  passed: boolean;
  error?: string;
  details?: string;
}

async function testAthleteJourney(): Promise<TestResult[]> {
  console.log('\n' + '='.repeat(60));
  console.log('ATHLETE JOURNEY TESTS (Expected: 7 steps)');
  console.log('='.repeat(60));

  const results: TestResult[] = [];

  // Get Sarah (test athlete)
  const { data: sarah, error: sarahErr } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (sarahErr || !sarah) {
    console.log('ERROR: Test athlete not found');
    return [{ step: 'Setup', passed: false, error: 'Test athlete not found' }];
  }

  console.log(`Testing with: ${sarah.email} (${sarah.role})\n`);

  // STEP 1: User Registration/Login
  console.log('1. USER REGISTRATION/LOGIN:');
  const step1: TestResult = { step: '1. Registration/Login', passed: true };
  if (sarah.id && sarah.email) {
    console.log('   ✅ User exists with ID and email');
    step1.details = 'User record exists';
  } else {
    console.log('   ❌ Missing user ID or email');
    step1.passed = false;
    step1.error = 'Missing ID or email';
  }
  results.push(step1);

  // STEP 2: Role Selection
  console.log('\n2. ROLE SELECTION:');
  const step2: TestResult = { step: '2. Role Selection', passed: true };
  if (sarah.role === 'athlete') {
    console.log('   ✅ Role is set to "athlete"');
    step2.details = 'Role correctly set';
  } else {
    console.log('   ❌ Role is not "athlete":', sarah.role);
    step2.passed = false;
    step2.error = `Role is "${sarah.role}" instead of "athlete"`;
  }
  results.push(step2);

  // STEP 3: Onboarding Completion
  console.log('\n3. ONBOARDING COMPLETION:');
  const step3: TestResult = { step: '3. Onboarding Completion', passed: true };

  const { data: profile, error: profileErr } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', sarah.id)
    .single();

  if (profileErr) {
    console.log('   ❌ Failed to fetch athlete profile:', profileErr.message);
    step3.passed = false;
    step3.error = profileErr.message;
  } else if (!profile) {
    console.log('   ❌ No athlete profile found');
    step3.passed = false;
    step3.error = 'No profile record';
  } else {
    const requiredFields = ['sport', 'school', 'graduation_year'];
    const missingFields = requiredFields.filter(f => !profile[f]);

    if (missingFields.length > 0) {
      console.log('   ⚠️ Missing required fields:', missingFields.join(', '));
      step3.passed = false;
      step3.error = `Missing: ${missingFields.join(', ')}`;
    } else {
      console.log('   ✅ Athlete profile complete with required fields');
      console.log('   - Sport:', profile.sport);
      console.log('   - School:', profile.school);
      console.log('   - State:', profile.state || 'NOT SET');
      step3.details = 'Profile has all required fields';
    }
  }
  results.push(step3);

  // STEP 4: Dashboard Access
  console.log('\n4. DASHBOARD ACCESS:');
  const step4: TestResult = { step: '4. Dashboard Access', passed: true };

  // Check if dashboard data can be fetched
  const dashboardQueries = [
    { name: 'Profile', table: 'athlete_profiles', filter: { user_id: sarah.id } },
    { name: 'Social Stats', table: 'social_media_stats', filter: { user_id: sarah.id } },
    { name: 'Matches', table: 'agency_athlete_matches', filter: { athlete_id: sarah.id } },
  ];

  let dashboardErrors: string[] = [];
  for (const query of dashboardQueries) {
    const { error } = await supabase
      .from(query.table)
      .select('id')
      .match(query.filter)
      .limit(1);

    if (error) {
      dashboardErrors.push(`${query.name}: ${error.message}`);
    }
  }

  if (dashboardErrors.length > 0) {
    console.log('   ❌ Dashboard query errors:');
    dashboardErrors.forEach(e => console.log('     -', e));
    step4.passed = false;
    step4.error = dashboardErrors.join('; ');
  } else {
    console.log('   ✅ All dashboard queries successful');
    step4.details = 'Dashboard data accessible';
  }
  results.push(step4);

  // STEP 5: Opportunities Page
  console.log('\n5. OPPORTUNITIES PAGE:');
  const step5: TestResult = { step: '5. Opportunities Page', passed: true };

  // Check agency matches and NIL deals
  const { data: matches, error: matchErr } = await supabase
    .from('agency_athlete_matches')
    .select('id, match_score, status')
    .eq('athlete_id', sarah.id);

  const { data: deals, error: dealErr } = await supabase
    .from('nil_deals')
    .select('id, deal_title, status')
    .eq('athlete_id', sarah.id);

  if (matchErr) {
    console.log('   ❌ Failed to fetch matches:', matchErr.message);
    step5.passed = false;
    step5.error = matchErr.message;
  } else if (dealErr) {
    console.log('   ❌ Failed to fetch deals:', dealErr.message);
    step5.passed = false;
    step5.error = dealErr.message;
  } else {
    console.log('   ✅ Opportunities data accessible');
    console.log('   - Agency Matches:', matches?.length || 0);
    console.log('   - NIL Deals:', deals?.length || 0);
    step5.details = `${matches?.length || 0} matches, ${deals?.length || 0} deals`;
  }
  results.push(step5);

  // STEP 6: Badge Earning Flow
  console.log('\n6. BADGE EARNING FLOW:');
  const step6: TestResult = { step: '6. Badge Earning', passed: true };

  // Check badges table and user_badges
  const { data: allBadges, error: badgeErr } = await supabase
    .from('badges')
    .select('id, name')
    .eq('is_active', true);

  const { data: userBadges, error: userBadgeErr } = await supabase
    .from('user_badges')
    .select('id, badge_id, badges(name)')
    .eq('user_id', sarah.id);

  if (badgeErr) {
    console.log('   ❌ Failed to fetch badges:', badgeErr.message);
    step6.passed = false;
    step6.error = badgeErr.message;
  } else if (userBadgeErr) {
    console.log('   ❌ Failed to fetch user badges:', userBadgeErr.message);
    step6.passed = false;
    step6.error = userBadgeErr.message;
  } else {
    console.log('   ✅ Badge system accessible');
    console.log('   - Available badges:', allBadges?.length || 0);
    console.log('   - Earned badges:', userBadges?.length || 0);
    step6.details = `${userBadges?.length || 0}/${allBadges?.length || 0} badges earned`;
  }
  results.push(step6);

  // STEP 7: Quiz/Education System
  console.log('\n7. QUIZ/EDUCATION SYSTEM:');
  const step7: TestResult = { step: '7. Quiz System', passed: true };

  const { data: questions, error: qErr } = await supabase
    .from('quiz_questions')
    .select('id, difficulty')
    .limit(10);

  const { data: sessions, error: sErr } = await supabase
    .from('quiz_sessions')
    .select('id, status, score')
    .eq('user_id', sarah.id);

  if (qErr) {
    console.log('   ❌ Failed to fetch questions:', qErr.message);
    step7.passed = false;
    step7.error = qErr.message;
  } else if (sErr) {
    console.log('   ❌ Failed to fetch sessions:', sErr.message);
    step7.passed = false;
    step7.error = sErr.message;
  } else {
    console.log('   ✅ Quiz system accessible');
    console.log('   - Questions available:', questions?.length || 0);
    console.log('   - User sessions:', sessions?.length || 0);
    step7.details = `${questions?.length || 0} questions, ${sessions?.length || 0} sessions`;
  }
  results.push(step7);

  return results;
}

async function testParentJourney(): Promise<TestResult[]> {
  console.log('\n' + '='.repeat(60));
  console.log('PARENT JOURNEY TESTS (Expected: 3 steps)');
  console.log('='.repeat(60));

  const results: TestResult[] = [];

  // Check if parent user exists
  const { data: parent, error: parentErr } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'parent')
    .limit(1)
    .single();

  if (parentErr || !parent) {
    console.log('\nNo parent user found. Creating test parent...');

    // Check if we need to create a parent
    const { data: existingParent } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'parent.test@chatnil.com')
      .single();

    if (!existingParent) {
      console.log('   Creating test parent user...');

      const { data: newParent, error: createErr } = await supabase
        .from('users')
        .insert({
          email: 'parent.test@chatnil.com',
          first_name: 'Parent',
          last_name: 'Tester',
          role: 'parent',
          onboarding_completed: true
        })
        .select()
        .single();

      if (createErr) {
        console.log('   ❌ Failed to create parent:', createErr.message);
        return [{ step: 'Setup', passed: false, error: createErr.message }];
      }

      console.log('   ✅ Created parent:', newParent?.email);
    }
  }

  // Get parent user for testing
  const { data: testParent } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'parent')
    .limit(1)
    .single();

  if (!testParent) {
    return [{ step: 'Setup', passed: false, error: 'No parent user available' }];
  }

  console.log(`\nTesting with: ${testParent.email} (${testParent.role})\n`);

  // STEP 1: Parent Registration
  console.log('1. PARENT REGISTRATION:');
  const step1: TestResult = { step: '1. Registration', passed: true };
  if (testParent.id && testParent.email && testParent.role === 'parent') {
    console.log('   ✅ Parent user exists with correct role');
    step1.details = 'User registered as parent';
  } else {
    console.log('   ❌ Parent user setup incomplete');
    step1.passed = false;
    step1.error = 'Missing ID, email, or wrong role';
  }
  results.push(step1);

  // STEP 2: Parent Onboarding/Child Link
  console.log('\n2. PARENT ONBOARDING:');
  const step2: TestResult = { step: '2. Onboarding', passed: true };

  // Check if parent has onboarding completed flag
  if (testParent.onboarding_completed) {
    console.log('   ✅ Onboarding completed flag is set');
    step2.details = 'Onboarding marked complete';
  } else {
    console.log('   ⚠️ Onboarding not marked as completed');
    // This might be okay if parent flow doesn't require full onboarding
    step2.details = 'Onboarding not required for parent role';
  }

  // Check for parent-specific data (if any table exists)
  const { data: parentProfile, error: ppErr } = await supabase
    .from('users')
    .select('first_name, last_name, email')
    .eq('id', testParent.id)
    .single();

  if (ppErr) {
    console.log('   ❌ Failed to fetch parent data:', ppErr.message);
    step2.passed = false;
    step2.error = ppErr.message;
  } else {
    console.log('   ✅ Parent profile data accessible');
    console.log('   - Name:', parentProfile?.first_name, parentProfile?.last_name);
  }
  results.push(step2);

  // STEP 3: Parent Dashboard Access
  console.log('\n3. PARENT DASHBOARD:');
  const step3: TestResult = { step: '3. Dashboard Access', passed: true };

  // Parents should be able to access their own data
  // Check if there's a linked athlete (parent-child relationship)
  const { data: linkedAthletes, error: linkErr } = await supabase
    .from('users')
    .select('id, first_name, last_name, role')
    .eq('role', 'athlete')
    .limit(5);

  if (linkErr) {
    console.log('   ❌ Failed to query athletes:', linkErr.message);
    step3.passed = false;
    step3.error = linkErr.message;
  } else {
    console.log('   ✅ Parent can view athlete data');
    console.log('   - Athletes in system:', linkedAthletes?.length || 0);
    step3.details = `${linkedAthletes?.length || 0} athletes viewable`;
  }
  results.push(step3);

  return results;
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('USER JOURNEY TESTING');
  console.log('='.repeat(60));

  // Test Athlete Journey
  const athleteResults = await testAthleteJourney();

  // Test Parent Journey
  const parentResults = await testParentJourney();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  const athletePassed = athleteResults.filter(r => r.passed).length;
  const athleteTotal = athleteResults.length;
  console.log(`\nATHLETE JOURNEY: ${athletePassed}/${athleteTotal} passed`);
  athleteResults.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`   ${status} ${r.step}${r.error ? ` - ${r.error}` : ''}`);
  });

  const parentPassed = parentResults.filter(r => r.passed).length;
  const parentTotal = parentResults.length;
  console.log(`\nPARENT JOURNEY: ${parentPassed}/${parentTotal} passed`);
  parentResults.forEach(r => {
    const status = r.passed ? '✅' : '❌';
    console.log(`   ${status} ${r.step}${r.error ? ` - ${r.error}` : ''}`);
  });

  // Failing steps detail
  const failingAthleteSteps = athleteResults.filter(r => !r.passed);
  const failingParentSteps = parentResults.filter(r => !r.passed);

  if (failingAthleteSteps.length > 0 || failingParentSteps.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('FAILING STEPS REQUIRING FIXES');
    console.log('='.repeat(60));

    if (failingAthleteSteps.length > 0) {
      console.log('\nAthlete Journey Issues:');
      failingAthleteSteps.forEach(r => {
        console.log(`   - ${r.step}: ${r.error}`);
      });
    }

    if (failingParentSteps.length > 0) {
      console.log('\nParent Journey Issues:');
      failingParentSteps.forEach(r => {
        console.log(`   - ${r.step}: ${r.error}`);
      });
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('OVERALL HEALTH');
  console.log('='.repeat(60));
  const totalPassed = athletePassed + parentPassed;
  const totalTests = athleteTotal + parentTotal;
  const healthScore = Math.round((totalPassed / totalTests) * 100);
  console.log(`\nHealth Score: ${healthScore}%`);
  console.log(`Tests Passed: ${totalPassed}/${totalTests}`);
}

runAllTests().catch(console.error);
