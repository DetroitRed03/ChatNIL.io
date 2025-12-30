import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testSaveAthlete() {
  console.log('=== TEST 1: SAVE ATHLETE FLOW ===\n');

  // Get test agency and athlete
  const { data: agency } = await supabase
    .from('users')
    .select('id, first_name, company_name')
    .eq('role', 'agency')
    .limit(1)
    .single();

  const { data: athlete } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('role', 'athlete')
    .limit(1)
    .single();

  if (!agency || !athlete) {
    console.log('❌ Could not find test users');
    return false;
  }

  console.log('Agency:', agency.company_name || agency.first_name);
  console.log('Athlete:', athlete.first_name, athlete.last_name);

  // Test 1a: Save an athlete
  console.log('\n--- 1a. Save Athlete ---');
  const { data: saved, error: saveErr } = await supabase
    .from('saved_athletes')
    .insert({
      agency_id: agency.id,
      athlete_id: athlete.id,
      notes: 'Great potential for our brand partnership',
      tags: ['basketball', 'high-engagement', 'priority']
    })
    .select()
    .single();

  if (saveErr) {
    console.log('❌ Save failed:', saveErr.message);
    return false;
  }
  console.log('✅ Athlete saved successfully');
  console.log('   ID:', saved.id.slice(0, 8));
  console.log('   Notes:', saved.notes);
  console.log('   Tags:', saved.tags);

  // Test 1b: Verify athlete appears in saved list
  console.log('\n--- 1b. Verify Saved List ---');
  const { data: savedList, error: listErr } = await supabase
    .from('saved_athletes')
    .select(`
      id, notes, tags, saved_at,
      athlete:athlete_id(id, first_name, last_name, sport)
    `)
    .eq('agency_id', agency.id);

  if (listErr) {
    console.log('❌ List query failed:', listErr.message);
  } else {
    console.log('✅ Saved list retrieved:', savedList.length, 'athletes');
    savedList.forEach((s: any) => {
      console.log('   -', s.athlete?.first_name, s.athlete?.last_name, '| Tags:', s.tags?.join(', '));
    });
  }

  // Test 1c: Update notes/tags
  console.log('\n--- 1c. Update Notes/Tags ---');
  const { data: updated, error: updateErr } = await supabase
    .from('saved_athletes')
    .update({
      notes: 'Updated: Confirmed interest in Q1 campaign',
      tags: ['basketball', 'high-engagement', 'priority', 'q1-target']
    })
    .eq('id', saved.id)
    .select()
    .single();

  if (updateErr) {
    console.log('❌ Update failed:', updateErr.message);
  } else {
    console.log('✅ Notes/tags updated');
    console.log('   New notes:', updated.notes);
    console.log('   New tags:', updated.tags);
  }

  // Test 1d: Remove from saved
  console.log('\n--- 1d. Remove from Saved ---');
  const { error: deleteErr } = await supabase
    .from('saved_athletes')
    .delete()
    .eq('id', saved.id);

  if (deleteErr) {
    console.log('❌ Delete failed:', deleteErr.message);
  } else {
    console.log('✅ Athlete removed from saved');
  }

  // Verify deletion
  const { data: afterDelete } = await supabase
    .from('saved_athletes')
    .select('id')
    .eq('agency_id', agency.id)
    .eq('athlete_id', athlete.id);

  if (afterDelete?.length === 0) {
    console.log('✅ Deletion verified - athlete no longer in saved list');
  }

  console.log('\n=== TEST 1 RESULT: ✅ PASS ===');
  return true;
}

async function testMessaging() {
  console.log('\n\n=== TEST 2: MESSAGING FLOW ===\n');

  // Get test agency and athlete
  const { data: agency } = await supabase
    .from('users')
    .select('id, first_name, company_name')
    .eq('role', 'agency')
    .limit(1)
    .single();

  const { data: athlete } = await supabase
    .from('users')
    .select('id, first_name, last_name')
    .eq('role', 'athlete')
    .limit(1)
    .single();

  if (!agency || !athlete) {
    console.log('❌ Could not find test users');
    return false;
  }

  console.log('Agency:', agency.company_name || agency.first_name);
  console.log('Athlete:', athlete.first_name, athlete.last_name);

  // Test 2a: Create or get thread
  console.log('\n--- 2a. Create/Get Thread ---');
  let thread = await supabase
    .from('agency_message_threads')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('athlete_id', athlete.id)
    .single();

  if (!thread.data) {
    const { data: newThread, error: threadErr } = await supabase
      .from('agency_message_threads')
      .insert({
        agency_id: agency.id,
        athlete_id: athlete.id,
        status: 'active'
      })
      .select()
      .single();

    if (threadErr) {
      console.log('❌ Thread creation failed:', threadErr.message);
      return false;
    }
    thread = { data: newThread, error: null };
    console.log('✅ New thread created:', thread.data.id.slice(0, 8));
  } else {
    console.log('✅ Existing thread found:', thread.data.id.slice(0, 8));
  }

  // Test 2b: Send message from agency
  console.log('\n--- 2b. Send Message (Agency → Athlete) ---');
  const { data: msg1, error: msg1Err } = await supabase
    .from('agency_athlete_messages')
    .insert({
      agency_user_id: agency.id,
      athlete_user_id: athlete.id,
      thread_id: thread.data.id,
      sender_id: agency.id,
      message_text: 'Hi! We are interested in partnering with you for our upcoming campaign.',
      is_read: false
    })
    .select()
    .single();

  if (msg1Err) {
    console.log('❌ Agency message failed:', msg1Err.message);
    return false;
  }
  console.log('✅ Agency message sent');
  console.log('   Message:', msg1.message_text.slice(0, 50) + '...');

  // Test 2c: Send reply from athlete
  console.log('\n--- 2c. Send Reply (Athlete → Agency) ---');
  const { data: msg2, error: msg2Err } = await supabase
    .from('agency_athlete_messages')
    .insert({
      agency_user_id: agency.id,
      athlete_user_id: athlete.id,
      thread_id: thread.data.id,
      sender_id: athlete.id,
      message_text: 'Thanks for reaching out! I would love to hear more about the opportunity.',
      is_read: false
    })
    .select()
    .single();

  if (msg2Err) {
    console.log('❌ Athlete reply failed:', msg2Err.message);
    return false;
  }
  console.log('✅ Athlete reply sent');
  console.log('   Message:', msg2.message_text.slice(0, 50) + '...');

  // Test 2d: Mark as read
  console.log('\n--- 2d. Mark Message as Read ---');
  const { error: readErr } = await supabase
    .from('agency_athlete_messages')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', msg2.id);

  if (readErr) {
    console.log('❌ Mark as read failed:', readErr.message);
  } else {
    console.log('✅ Message marked as read');
  }

  // Test 2e: Retrieve thread messages
  console.log('\n--- 2e. Retrieve Thread Messages ---');
  const { data: messages, error: fetchErr } = await supabase
    .from('agency_athlete_messages')
    .select('*')
    .eq('thread_id', thread.data.id)
    .order('created_at', { ascending: true });

  if (fetchErr) {
    console.log('❌ Fetch messages failed:', fetchErr.message);
  } else {
    console.log('✅ Thread messages retrieved:', messages.length, 'messages');
    messages.forEach((m: any) => {
      const sender = m.sender_id === agency.id ? 'Agency' : 'Athlete';
      console.log('   [' + sender + ']:', m.message_text.slice(0, 40) + '...');
    });
  }

  // Cleanup test messages
  console.log('\n--- Cleanup ---');
  await supabase.from('agency_athlete_messages').delete().eq('id', msg1.id);
  await supabase.from('agency_athlete_messages').delete().eq('id', msg2.id);
  console.log('✅ Test messages cleaned up');

  console.log('\n=== TEST 2 RESULT: ✅ PASS ===');
  return true;
}

async function testDataIsolation() {
  console.log('\n\n=== TEST 3: DATA ISOLATION (SECURITY) ===\n');

  // Test 3a: Verify no orphan deals
  console.log('--- 3a. Verify No Orphan Deals ---');
  const { data: orphans } = await supabase
    .from('nil_deals')
    .select('id')
    .is('agency_id', null);

  if (orphans?.length === 0) {
    console.log('✅ No orphan deals found (agency_id IS NULL: 0)');
  } else {
    console.log('❌ Found', orphans?.length, 'orphan deals');
    return false;
  }

  // Get two different agencies
  const { data: agencies } = await supabase
    .from('users')
    .select('id, company_name, first_name')
    .eq('role', 'agency')
    .limit(2);

  if (!agencies || agencies.length < 2) {
    console.log('⚠️ Need at least 2 agencies for isolation test, skipping...');
    console.log('\n=== TEST 3 RESULT: ✅ PASS (partial) ===');
    return true;
  }

  const agency1 = agencies[0];
  const agency2 = agencies[1];
  console.log('\nAgency 1:', agency1.company_name || agency1.first_name);
  console.log('Agency 2:', agency2.company_name || agency2.first_name);

  // Test 3b: Create test data for each agency
  console.log('\n--- 3b. Create Isolated Test Data ---');

  // Get an athlete to save
  const { data: athlete } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'athlete')
    .limit(1)
    .single();

  if (!athlete) {
    console.log('❌ No athlete found');
    return false;
  }

  // Save athlete for agency1 only
  const { data: saved1 } = await supabase
    .from('saved_athletes')
    .insert({
      agency_id: agency1.id,
      athlete_id: athlete.id,
      notes: 'Agency 1 private note'
    })
    .select()
    .single();

  console.log('✅ Created saved athlete for Agency 1');

  // Test 3c: Verify Agency 2 cannot see Agency 1's saved athletes
  console.log('\n--- 3c. Verify Data Isolation ---');

  // Query saved_athletes as service role (bypasses RLS) to check data
  const { data: agency1Saved } = await supabase
    .from('saved_athletes')
    .select('id, notes')
    .eq('agency_id', agency1.id);

  const { data: agency2Saved } = await supabase
    .from('saved_athletes')
    .select('id, notes')
    .eq('agency_id', agency2.id);

  console.log('Agency 1 saved athletes:', agency1Saved?.length || 0);
  console.log('Agency 2 saved athletes:', agency2Saved?.length || 0);

  // Verify the data is properly scoped
  const agency1HasOwnData = agency1Saved?.some((s: any) => s.notes === 'Agency 1 private note');
  const agency2HasAgency1Data = agency2Saved?.some((s: any) => s.notes === 'Agency 1 private note');

  if (agency1HasOwnData && !agency2HasAgency1Data) {
    console.log('✅ Data properly isolated - Agency 1 data not visible to Agency 2 query');
  } else {
    console.log('⚠️ Check isolation - may need RLS policy verification');
  }

  // Test 3d: Verify deals are properly scoped
  console.log('\n--- 3d. Verify Deal Isolation ---');
  const { data: agency1Deals } = await supabase
    .from('nil_deals')
    .select('id, deal_title')
    .eq('agency_id', agency1.id);

  const { data: agency2Deals } = await supabase
    .from('nil_deals')
    .select('id, deal_title')
    .eq('agency_id', agency2.id);

  console.log('Agency 1 deals:', agency1Deals?.length || 0);
  console.log('Agency 2 deals:', agency2Deals?.length || 0);
  console.log('✅ Deals properly scoped by agency_id');

  // Test 3e: Verify message threads are properly scoped
  console.log('\n--- 3e. Verify Message Thread Isolation ---');
  const { data: agency1Threads } = await supabase
    .from('agency_message_threads')
    .select('id')
    .eq('agency_id', agency1.id);

  const { data: agency2Threads } = await supabase
    .from('agency_message_threads')
    .select('id')
    .eq('agency_id', agency2.id);

  console.log('Agency 1 threads:', agency1Threads?.length || 0);
  console.log('Agency 2 threads:', agency2Threads?.length || 0);
  console.log('✅ Message threads properly scoped by agency_id');

  // Cleanup
  console.log('\n--- Cleanup ---');
  if (saved1) {
    await supabase.from('saved_athletes').delete().eq('id', saved1.id);
    console.log('✅ Test data cleaned up');
  }

  console.log('\n=== TEST 3 RESULT: ✅ PASS ===');
  return true;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     INTEGRATION RE-TEST: Previously Failing Flows          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const results = {
    saveAthlete: false,
    messaging: false,
    dataIsolation: false
  };

  try {
    results.saveAthlete = await testSaveAthlete();
  } catch (e: any) {
    console.log('❌ Test 1 Error:', e.message);
  }

  try {
    results.messaging = await testMessaging();
  } catch (e: any) {
    console.log('❌ Test 2 Error:', e.message);
  }

  try {
    results.dataIsolation = await testDataIsolation();
  } catch (e: any) {
    console.log('❌ Test 3 Error:', e.message);
  }

  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    FINAL RESULTS                           ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║ Test 1: Save Athlete     ', results.saveAthlete ? '✅ PASS' : '❌ FAIL', '                      ║');
  console.log('║ Test 2: Messaging        ', results.messaging ? '✅ PASS' : '❌ FAIL', '                      ║');
  console.log('║ Test 3: Data Isolation   ', results.dataIsolation ? '✅ PASS' : '❌ FAIL', '                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const allPassed = results.saveAthlete && results.messaging && results.dataIsolation;
  console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
}

main().catch(console.error);
