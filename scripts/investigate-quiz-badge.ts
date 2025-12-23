/**
 * Investigate Quiz & Badge System
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function investigate() {
  console.log('=== QUIZ & BADGE SYSTEM INVESTIGATION ===\n');

  // 1. Check quiz_sessions table
  console.log('1. QUIZ_SESSIONS TABLE:');
  const { data: sessions, error: sessErr } = await supabase
    .from('quiz_sessions')
    .select('*')
    .limit(3);
  if (sessErr) {
    console.log('   Error:', sessErr.message);
  } else {
    console.log('   Exists: YES');
    console.log('   Rows:', sessions?.length || 0);
    if (sessions && sessions[0]) {
      console.log('   Columns:', Object.keys(sessions[0]).join(', '));
    }
  }

  // 2. Check badges table
  console.log('\n2. BADGES TABLE:');
  const { data: badges, error: badgeErr } = await supabase
    .from('badges')
    .select('*')
    .limit(10);
  if (badgeErr) {
    console.log('   Error:', badgeErr.message);
  } else {
    console.log('   Exists: YES');
    console.log('   Rows:', badges?.length || 0);
    if (badges && badges[0]) {
      console.log('   Columns:', Object.keys(badges[0]).join(', '));
    }
    badges?.forEach(b => console.log('   -', b.name, '(' + b.tier + ')'));
  }

  // 3. Check user_badges table
  console.log('\n3. USER_BADGES TABLE:');
  const { data: userBadges, error: ubErr } = await supabase
    .from('user_badges')
    .select('*')
    .limit(3);
  if (ubErr) {
    console.log('   Error:', ubErr.message);
  } else {
    console.log('   Exists: YES');
    console.log('   Rows:', userBadges?.length || 0);
    if (userBadges && userBadges[0]) {
      console.log('   Columns:', Object.keys(userBadges[0]).join(', '));
    }
  }

  // 4. Check quiz_questions table
  console.log('\n4. QUIZ_QUESTIONS TABLE:');
  const { data: questions, error: qErr } = await supabase
    .from('quiz_questions')
    .select('id, question, difficulty')
    .limit(3);
  if (qErr) {
    console.log('   Error:', qErr.message);
  } else {
    console.log('   Exists: YES');
    console.log('   Rows:', questions?.length || 0);
  }

  // 5. Check quiz_answers table
  console.log('\n5. QUIZ_ANSWERS TABLE:');
  const { data: answers, error: aErr } = await supabase
    .from('quiz_answers')
    .select('*')
    .limit(3);
  if (aErr) {
    console.log('   Error:', aErr.message);
  } else {
    console.log('   Exists: YES');
    console.log('   Rows:', answers?.length || 0);
    if (answers && answers[0]) {
      console.log('   Columns:', Object.keys(answers[0]).join(', '));
    }
  }

  // 6. Test creating a quiz session
  console.log('\n6. TEST INSERT QUIZ_SESSION:');
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (users && users[0]) {
    const { data: newSession, error: insertErr } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: users[0].id,
        difficulty: 'beginner',
        status: 'in_progress'
      })
      .select()
      .single();

    if (insertErr) {
      console.log('   Insert Error:', insertErr.message);
    } else {
      console.log('   Insert Success:', newSession?.id);
      // Clean up
      await supabase.from('quiz_sessions').delete().eq('id', newSession?.id);
      console.log('   Cleaned up test session');
    }
  }

  // 7. Test awarding a badge
  console.log('\n7. TEST AWARD BADGE:');
  const { data: testBadge } = await supabase.from('badges').select('id').limit(1);
  if (users && users[0] && testBadge && testBadge[0]) {
    const { data: newBadge, error: badgeInsertErr } = await supabase
      .from('user_badges')
      .insert({
        user_id: users[0].id,
        badge_id: testBadge[0].id
      })
      .select()
      .single();

    if (badgeInsertErr) {
      if (badgeInsertErr.message.includes('duplicate')) {
        console.log('   User already has this badge (expected)');
      } else {
        console.log('   Insert Error:', badgeInsertErr.message);
      }
    } else {
      console.log('   Badge Award Success:', newBadge?.id);
      // Clean up
      await supabase.from('user_badges').delete().eq('id', newBadge?.id);
      console.log('   Cleaned up test badge');
    }
  }

  console.log('\n=== INVESTIGATION COMPLETE ===');
}

investigate().catch(console.error);
