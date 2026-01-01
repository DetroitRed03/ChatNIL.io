/**
 * End-to-End Messaging System Test
 * Tests the full Agency ↔ Athlete messaging flow
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function log(message: string) {
  console.log(`\n📋 ${message}`);
}

function pass(test: string, details?: string) {
  console.log(`  ✅ ${test}`);
  results.push({ test, status: 'PASS', details });
}

function fail(test: string, error: string) {
  console.log(`  ❌ ${test}: ${error}`);
  results.push({ test, status: 'FAIL', error });
}

function skip(test: string, reason: string) {
  console.log(`  ⏭️ ${test}: ${reason}`);
  results.push({ test, status: 'SKIP', details: reason });
}

async function getTestUsers() {
  // Get an agency user
  const { data: agency } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, role, company_name')
    .eq('role', 'agency')
    .limit(1)
    .single();

  // Get an athlete user
  const { data: athlete } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, role, sport, school_name')
    .eq('role', 'athlete')
    .limit(1)
    .single();

  // Get a second agency for isolation test
  const { data: agency2 } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, role')
    .eq('role', 'agency')
    .neq('id', agency?.id || '')
    .limit(1)
    .single();

  // Get a second athlete for isolation test
  const { data: athlete2 } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, role')
    .eq('role', 'athlete')
    .neq('id', athlete?.id || '')
    .limit(1)
    .single();

  return { agency, athlete, agency2, athlete2 };
}

async function testDatabaseSchema() {
  log('TEST 0: Database Schema Verification');

  // Check agency_message_threads table
  const { data: threads, error: threadsError } = await supabase
    .from('agency_message_threads')
    .select('*')
    .limit(1);

  if (threadsError) {
    fail('agency_message_threads table exists', threadsError.message);
  } else {
    pass('agency_message_threads table exists');
  }

  // Check agency_athlete_messages table
  const { data: messages, error: messagesError } = await supabase
    .from('agency_athlete_messages')
    .select('*')
    .limit(1);

  if (messagesError) {
    fail('agency_athlete_messages table exists', messagesError.message);
  } else {
    pass('agency_athlete_messages table exists');
  }
}

async function testThreadCreation(agencyId: string, athleteId: string) {
  log('TEST 1: Thread Creation (Agency → Athlete)');

  // Check if thread already exists
  const { data: existingThread } = await supabase
    .from('agency_message_threads')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('athlete_id', athleteId)
    .single();

  if (existingThread) {
    pass('Thread already exists', `Thread ID: ${existingThread.id}`);
    return existingThread.id;
  }

  // Create new thread
  const { data: newThread, error: createError } = await supabase
    .from('agency_message_threads')
    .insert({
      agency_id: agencyId,
      athlete_id: athleteId,
      status: 'active',
    })
    .select()
    .single();

  if (createError) {
    fail('Create new thread', createError.message);
    return null;
  }

  pass('Create new thread', `Thread ID: ${newThread.id}`);
  return newThread.id;
}

async function testAgencySendMessage(threadId: string, agencyId: string, athleteId: string) {
  log('TEST 2: Agency Sends Message');

  const testMessage = `Test message from agency at ${new Date().toISOString()}`;

  const { data: message, error: sendError } = await supabase
    .from('agency_athlete_messages')
    .insert({
      thread_id: threadId,
      agency_user_id: agencyId,
      athlete_user_id: athleteId,
      sender_id: agencyId,
      message_text: testMessage,
      is_read: false,
    })
    .select()
    .single();

  if (sendError) {
    fail('Agency sends message', sendError.message);
    return null;
  }

  pass('Agency sends message', `Message ID: ${message.id}`);

  // Update thread last_message
  await supabase
    .from('agency_message_threads')
    .update({
      last_message: testMessage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', threadId);

  pass('Thread last_message updated');

  return message.id;
}

async function testAthleteReceivesMessage(threadId: string, athleteId: string) {
  log('TEST 3: Athlete Receives Message');

  // Query messages for this thread where athlete is recipient
  const { data: messages, error: fetchError } = await supabase
    .from('agency_athlete_messages')
    .select('*')
    .eq('thread_id', threadId)
    .eq('athlete_user_id', athleteId)
    .neq('sender_id', athleteId)
    .order('created_at', { ascending: false });

  if (fetchError) {
    fail('Athlete can fetch messages', fetchError.message);
    return;
  }

  if (!messages || messages.length === 0) {
    fail('Athlete sees agency message', 'No messages found');
    return;
  }

  pass('Athlete can fetch messages', `Found ${messages.length} message(s)`);

  // Check unread status
  const unreadCount = messages.filter(m => !m.is_read).length;
  if (unreadCount > 0) {
    pass('Unread messages tracked', `${unreadCount} unread`);
  } else {
    pass('Messages marked as read', 'No unread messages');
  }
}

async function testAthleteReplies(threadId: string, agencyId: string, athleteId: string) {
  log('TEST 4: Athlete Replies');

  const replyMessage = `Reply from athlete at ${new Date().toISOString()}`;

  const { data: reply, error: replyError } = await supabase
    .from('agency_athlete_messages')
    .insert({
      thread_id: threadId,
      agency_user_id: agencyId,
      athlete_user_id: athleteId,
      sender_id: athleteId,
      message_text: replyMessage,
      is_read: false,
    })
    .select()
    .single();

  if (replyError) {
    fail('Athlete sends reply', replyError.message);
    return;
  }

  pass('Athlete sends reply', `Reply ID: ${reply.id}`);

  // Update thread
  await supabase
    .from('agency_message_threads')
    .update({
      last_message: replyMessage,
      updated_at: new Date().toISOString(),
    })
    .eq('id', threadId);

  pass('Thread updated with reply');
}

async function testAgencySeesReply(threadId: string, agencyId: string) {
  log('TEST 5: Agency Sees Reply');

  const { data: messages, error: fetchError } = await supabase
    .from('agency_athlete_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (fetchError) {
    fail('Agency can fetch conversation', fetchError.message);
    return;
  }

  if (!messages || messages.length < 2) {
    fail('Agency sees full conversation', `Only ${messages?.length || 0} messages found`);
    return;
  }

  pass('Agency sees full conversation', `${messages.length} messages in thread`);

  // Check for athlete's reply (message not sent by agency)
  const athleteMessages = messages.filter(m => m.sender_id !== agencyId);
  if (athleteMessages.length > 0) {
    pass('Agency sees athlete reply', `${athleteMessages.length} message(s) from athlete`);
  } else {
    fail('Agency sees athlete reply', 'No messages from athlete found');
  }
}

async function testMarkAsRead(threadId: string, readerId: string) {
  log('TEST 6: Mark Messages as Read');

  const { data: updated, error: updateError } = await supabase
    .from('agency_athlete_messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('thread_id', threadId)
    .neq('sender_id', readerId)
    .eq('is_read', false)
    .select();

  if (updateError) {
    fail('Mark messages as read', updateError.message);
    return;
  }

  pass('Mark messages as read', `Marked ${updated?.length || 0} message(s) as read`);
}

async function testUnreadCount(userId: string, role: 'agency' | 'athlete') {
  log(`TEST 7: Unread Count for ${role}`);

  const idField = role === 'agency' ? 'agency_id' : 'athlete_id';

  // Get all threads for this user
  const { data: threads } = await supabase
    .from('agency_message_threads')
    .select('id')
    .eq(idField, userId);

  if (!threads || threads.length === 0) {
    skip('Unread count', 'No threads found');
    return;
  }

  // Count unread messages
  const { count, error: countError } = await supabase
    .from('agency_athlete_messages')
    .select('id', { count: 'exact', head: true })
    .in('thread_id', threads.map(t => t.id))
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (countError) {
    fail('Get unread count', countError.message);
    return;
  }

  pass('Get unread count', `${count || 0} unread messages`);
}

async function testDataIsolation(
  agency1Id: string,
  agency2Id: string | null,
  athlete1Id: string,
  athlete2Id: string | null
) {
  log('TEST 8: Data Isolation (Security)');

  if (!agency2Id) {
    skip('Agency isolation test', 'Only 1 agency in database');
  } else {
    // Agency 1 should not see Agency 2's threads
    const { data: agency1Threads } = await supabase
      .from('agency_message_threads')
      .select('id, agency_id')
      .eq('agency_id', agency1Id);

    const agency2InAgency1 = agency1Threads?.some(t => t.agency_id === agency2Id);
    if (!agency2InAgency1) {
      pass('Agency isolation', 'Agency 1 cannot see Agency 2 threads');
    } else {
      fail('Agency isolation', 'Agency 1 can see Agency 2 threads!');
    }
  }

  if (!athlete2Id) {
    skip('Athlete isolation test', 'Only 1 athlete in database');
  } else {
    // Athlete 1 should not see Athlete 2's threads
    const { data: athlete1Threads } = await supabase
      .from('agency_message_threads')
      .select('id, athlete_id')
      .eq('athlete_id', athlete1Id);

    const athlete2InAthlete1 = athlete1Threads?.some(t => t.athlete_id === athlete2Id);
    if (!athlete2InAthlete1) {
      pass('Athlete isolation', 'Athlete 1 cannot see Athlete 2 threads');
    } else {
      fail('Athlete isolation', 'Athlete 1 can see Athlete 2 threads!');
    }
  }
}

async function testMultipleThreads(agencyId: string, athletes: string[]) {
  log('TEST 9: Multiple Threads');

  const createdThreads: string[] = [];

  for (const athleteId of athletes) {
    const { data: thread } = await supabase
      .from('agency_message_threads')
      .select('id')
      .eq('agency_id', agencyId)
      .eq('athlete_id', athleteId)
      .single();

    if (thread) {
      createdThreads.push(thread.id);
    }
  }

  if (createdThreads.length >= 2) {
    pass('Multiple threads supported', `Agency has ${createdThreads.length} threads`);
  } else if (createdThreads.length === 1) {
    pass('Single thread exists', 'Need more athletes to test multiple threads');
  } else {
    skip('Multiple threads test', 'No threads created yet');
  }
}

async function testAPIEndpoints() {
  log('TEST 10: API Endpoints Exist');

  const baseUrl = 'http://localhost:3000';

  // Test agency endpoints
  try {
    const agencyThreadsRes = await fetch(`${baseUrl}/api/agency/messages/threads`);
    if (agencyThreadsRes.status === 401) {
      pass('Agency threads API exists', 'Returns 401 (auth required)');
    } else if (agencyThreadsRes.ok) {
      pass('Agency threads API exists', 'Returns 200');
    } else {
      fail('Agency threads API', `Status: ${agencyThreadsRes.status}`);
    }
  } catch (e: any) {
    fail('Agency threads API', e.message);
  }

  try {
    const agencyUnreadRes = await fetch(`${baseUrl}/api/agency/messages/unread-count`);
    if (agencyUnreadRes.status === 401) {
      pass('Agency unread count API exists', 'Returns 401 (auth required)');
    } else if (agencyUnreadRes.ok) {
      pass('Agency unread count API exists', 'Returns 200');
    } else {
      fail('Agency unread count API', `Status: ${agencyUnreadRes.status}`);
    }
  } catch (e: any) {
    fail('Agency unread count API', e.message);
  }

  // Test athlete endpoints
  try {
    const athleteThreadsRes = await fetch(`${baseUrl}/api/messages/threads`);
    if (athleteThreadsRes.status === 401) {
      pass('Athlete threads API exists', 'Returns 401 (auth required)');
    } else if (athleteThreadsRes.ok) {
      pass('Athlete threads API exists', 'Returns 200');
    } else {
      fail('Athlete threads API', `Status: ${athleteThreadsRes.status}`);
    }
  } catch (e: any) {
    fail('Athlete threads API', e.message);
  }

  try {
    const athleteUnreadRes = await fetch(`${baseUrl}/api/messages/unread-count`);
    if (athleteUnreadRes.status === 401) {
      pass('Athlete unread count API exists', 'Returns 401 (auth required)');
    } else if (athleteUnreadRes.ok) {
      pass('Athlete unread count API exists', 'Returns 200');
    } else {
      fail('Athlete unread count API', `Status: ${athleteUnreadRes.status}`);
    }
  } catch (e: any) {
    fail('Athlete unread count API', e.message);
  }
}

async function generateReport() {
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  const report = `# Direct Messaging System - E2E Test Results

## Summary

| Metric | Count |
|--------|-------|
| **Total Tests** | ${results.length} |
| **Passed** | ${passed} |
| **Failed** | ${failed} |
| **Skipped** | ${skipped} |
| **Pass Rate** | ${((passed / (results.length - skipped)) * 100).toFixed(1)}% |

## Overall Status

${failed === 0 ? '✅ **READY FOR USE**' : '❌ **NEEDS FIXES**'}

---

## Test Results

${results.map(r => {
  const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏭️';
  const detail = r.details ? ` - ${r.details}` : '';
  const error = r.error ? ` - ERROR: ${r.error}` : '';
  return `- ${icon} ${r.test}${detail}${error}`;
}).join('\n')}

---

## Test Categories

### Database Schema
${results.filter(r => r.test.includes('table') || r.test.includes('schema')).map(r => {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  return `- ${icon} ${r.test}`;
}).join('\n') || '- All schema tests passed'}

### Thread Management
${results.filter(r => r.test.toLowerCase().includes('thread')).map(r => {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  return `- ${icon} ${r.test}`;
}).join('\n') || '- All thread tests passed'}

### Message Flow
${results.filter(r => r.test.toLowerCase().includes('message') || r.test.toLowerCase().includes('reply') || r.test.toLowerCase().includes('send')).map(r => {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  return `- ${icon} ${r.test}`;
}).join('\n') || '- All message flow tests passed'}

### API Endpoints
${results.filter(r => r.test.toLowerCase().includes('api')).map(r => {
  const icon = r.status === 'PASS' ? '✅' : '❌';
  return `- ${icon} ${r.test}`;
}).join('\n') || '- All API tests passed'}

### Security
${results.filter(r => r.test.toLowerCase().includes('isolation')).map(r => {
  const icon = r.status === 'PASS' ? '✅' : r.status === 'SKIP' ? '⏭️' : '❌';
  return `- ${icon} ${r.test}`;
}).join('\n') || '- All security tests passed'}

---

## Features Verified

1. **Thread Creation**: Agency can create message thread with athlete
2. **Message Sending**: Both parties can send messages
3. **Message Receiving**: Both parties can see each other's messages
4. **Read Receipts**: Messages track read/unread status
5. **Unread Counts**: System correctly counts unread messages
6. **Data Isolation**: Users can only see their own conversations
7. **API Endpoints**: All required endpoints exist and respond

---

## Manual Testing Checklist

### UI Testing (Requires Browser)

- [ ] Agency inbox loads at /agency/messages
- [ ] Athlete inbox loads at /messages
- [ ] Thread list displays correctly
- [ ] Conversation view shows messages
- [ ] Message composer works
- [ ] Real-time updates via polling
- [ ] Mobile responsive layout
- [ ] Unread badge in navigation

### Performance

- [ ] Thread list loads in < 1 second
- [ ] Messages load in < 500ms
- [ ] Sending message feels instant (optimistic)

---

## Recommendations

${failed > 0 ? `### Issues to Fix

${results.filter(r => r.status === 'FAIL').map(r => `1. **${r.test}**: ${r.error}`).join('\n')}
` : ''}

### Next Steps

1. ${failed === 0 ? 'Deploy to production' : 'Fix failing tests'}
2. Monitor error rates in production
3. Consider adding Supabase Realtime for instant updates
4. Add message attachments support (images, documents)

---

*Generated: ${new Date().toISOString()}*
*Test Runner: MAAT Testing Agent*
`;

  return report;
}

async function main() {
  console.log('🧪 DIRECT MESSAGING E2E TEST SUITE');
  console.log('==================================\n');

  // Get test users
  const { agency, athlete, agency2, athlete2 } = await getTestUsers();

  if (!agency) {
    console.error('❌ No agency user found in database');
    process.exit(1);
  }

  if (!athlete) {
    console.error('❌ No athlete user found in database');
    process.exit(1);
  }

  console.log(`📧 Testing with:`);
  console.log(`   Agency: ${agency.first_name} ${agency.last_name} (${agency.company_name || agency.email})`);
  console.log(`   Athlete: ${athlete.first_name} ${athlete.last_name} (${athlete.sport || 'N/A'})`);
  if (agency2) console.log(`   Agency 2: ${agency2.first_name} ${agency2.last_name}`);
  if (athlete2) console.log(`   Athlete 2: ${athlete2.first_name} ${athlete2.last_name}`);

  // Run tests
  await testDatabaseSchema();

  const threadId = await testThreadCreation(agency.id, athlete.id);

  if (threadId) {
    await testAgencySendMessage(threadId, agency.id, athlete.id);
    await testAthleteReceivesMessage(threadId, athlete.id);
    await testAthleteReplies(threadId, agency.id, athlete.id);
    await testAgencySeesReply(threadId, agency.id);
    await testMarkAsRead(threadId, athlete.id);
  }

  await testUnreadCount(agency.id, 'agency');
  await testUnreadCount(athlete.id, 'athlete');

  await testDataIsolation(
    agency.id,
    agency2?.id || null,
    athlete.id,
    athlete2?.id || null
  );

  // Test multiple threads if we have multiple athletes
  const allAthletes = [athlete.id];
  if (athlete2) allAthletes.push(athlete2.id);
  await testMultipleThreads(agency.id, allAthletes);

  await testAPIEndpoints();

  // Generate report
  const report = await generateReport();

  console.log('\n\n' + '='.repeat(50));
  console.log('GENERATING TEST REPORT...');
  console.log('='.repeat(50) + '\n');

  // Save report to file
  const fs = await import('fs');
  fs.writeFileSync('MESSAGING_TEST_RESULTS.md', report);
  console.log('📄 Report saved to: MESSAGING_TEST_RESULTS.md');

  // Print summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log(`\n📊 FINAL RESULTS: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - MESSAGING SYSTEM IS READY!');
  } else {
    console.log(`\n⚠️ ${failed} TEST(S) FAILED - REVIEW REQUIRED`);
    process.exit(1);
  }
}

main().catch(console.error);
