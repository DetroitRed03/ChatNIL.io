#!/usr/bin/env tsx

/**
 * Seed remaining tables with SQL to bypass RLS
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedBadges() {
  console.log('\n🏆 Seeding Badges...');

  const badgesSQL = `
    INSERT INTO badges (name, description, category, rarity, points, icon_url)
    VALUES
      ('First Steps', 'Complete your profile', 'profile', 'common', 10, '/badges/first-steps.svg'),
      ('Deal Maker', 'Complete your first NIL deal', 'deals', 'uncommon', 25, '/badges/deal-maker.svg'),
      ('Social Butterfly', 'Connect 3 social media accounts', 'social', 'common', 15, '/badges/social-butterfly.svg'),
      ('Knowledge Seeker', 'Complete 5 NIL education quizzes', 'education', 'uncommon', 30, '/badges/knowledge-seeker.svg'),
      ('Rising Star', 'Reach 10K total followers', 'social', 'rare', 50, '/badges/rising-star.svg'),
      ('Deal Closer', 'Complete 5 NIL deals', 'deals', 'rare', 75, '/badges/deal-closer.svg'),
      ('Brand Ambassador', 'Maintain a brand partnership for 6 months', 'deals', 'epic', 100, '/badges/brand-ambassador.svg'),
      ('Influencer Elite', 'Reach 100K total followers', 'social', 'epic', 150, '/badges/influencer-elite.svg'),
      ('NIL Master', 'Complete 20 deals and earn $50K+', 'deals', 'legendary', 250, '/badges/nil-master.svg'),
      ('Trendsetter', 'Be featured in platform highlights 5 times', 'achievement', 'legendary', 300, '/badges/trendsetter.svg')
    ON CONFLICT (name) DO NOTHING;
  `;

  const { error } = await supabase.rpc('exec_sql', { query: badgesSQL });
  if (error) console.error('❌ Error:', error);
  else console.log('✅ Badges seeded');
}

async function seedNotificationsAndEvents() {
  console.log('\n🔔 Seeding Notifications and Events...');

  // Get all users
  const { data: users } = await supabase
    .from('users')
    .select('id, role')
    .limit(50); // Limit to first 50 users

  if (!users || users.length === 0) {
    console.log('⚠️  No users found');
    return;
  }

  console.log(`Found ${users.length} users`);

  // Generate notifications SQL
  const notificationValues: string[] = [];
  const eventValues: string[] = [];

  const notifTypes = ['deal_update', 'opportunity', 'compliance', 'message', 'system'];
  const priorities = ['low', 'medium', 'high'];
  const eventTypes = ['workshop', 'networking', 'consultation', 'deadline', 'meeting'];

  for (const user of users) {
    // 10 notifications per user
    for (let i = 0; i < 10; i++) {
      const type = notifTypes[Math.floor(Math.random() * notifTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const isRead = Math.random() < 0.4;
      const daysAgo = Math.floor(Math.random() * 30);

      notificationValues.push(`(
        '${user.id}',
        '${type}',
        'Test Notification ${i + 1}',
        'This is a test notification for development',
        '${priority}',
        ${isRead},
        ${isRead ? `NOW() - INTERVAL '${daysAgo} days'` : 'NULL'},
        NOW() - INTERVAL '${daysAgo} days'
      )`);
    }

    // 5 events per athlete
    if (user.role === 'athlete') {
      for (let i = 0; i < 5; i++) {
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const daysFromNow = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
        const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours

        eventValues.push(`(
          '${user.id}',
          'Test Event ${i + 1}',
          'This is a test event for development',
          '${type}',
          NOW() + INTERVAL '${daysFromNow} days',
          ${type !== 'deadline' ? `NOW() + INTERVAL '${daysFromNow} days' + INTERVAL '${duration} hours'` : 'NULL'},
          ${type === 'workshop' || type === 'networking' ? `'Test Location'` : 'NULL'},
          ${type === 'workshop' || type === 'consultation' ? `'https://zoom.us/j/test'` : 'NULL'},
          ${daysFromNow < 0 || Math.random() < 0.5},
          NOW() - INTERVAL '${Math.floor(Math.random() * 7)} days'
        )`);
      }
    }
  }

  if (notificationValues.length > 0) {
    const notifSQL = `
      INSERT INTO notifications (user_id, type, title, message, priority, read, read_at, created_at)
      VALUES ${notificationValues.join(',\n')};
    `;

    const { error } = await supabase.rpc('exec_sql', { query: notifSQL });
    if (error) console.error('❌ Notifications error:', error);
    else console.log(`✅ Seeded ${notificationValues.length} notifications`);
  }

  if (eventValues.length > 0) {
    const eventSQL = `
      INSERT INTO events (user_id, title, description, event_type, start_time, end_time, location, url, reminder_sent, created_at)
      VALUES ${eventValues.join(',\n')};
    `;

    const { error } = await supabase.rpc('exec_sql', { query: eventSQL });
    if (error) console.error('❌ Events error:', error);
    else console.log(`✅ Seeded ${eventValues.length} events`);
  }
}

async function seedQuizProgress() {
  console.log('\n📝 Seeding Quiz Progress...');

  const { data: athletes } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'athlete')
    .limit(50);

  if (!athletes || athletes.length === 0) {
    console.log('⚠️  No athletes found');
    return;
  }

  const values: string[] = [];

  for (const athlete of athletes) {
    const quizzesCompleted = Math.floor(Math.random() * 16); // 0-15
    const totalScore = quizzesCompleted * (Math.floor(Math.random() * 41) + 60); // 60-100 per quiz
    const avgScore = quizzesCompleted > 0 ? Math.floor(totalScore / quizzesCompleted) : 0;

    values.push(`(
      '${athlete.id}',
      ${quizzesCompleted},
      ${totalScore},
      ${avgScore},
      ${Math.floor(quizzesCompleted / 5)},
      ${Math.floor(Math.random() * 8)},
      ${Math.floor(Math.random() * 15)},
      ${quizzesCompleted > 0 ? `NOW() - INTERVAL '${Math.floor(Math.random() * 14)} days'` : 'NULL'}
    )`);
  }

  const sql = `
    INSERT INTO quiz_progress (user_id, quizzes_completed, total_score, average_score, badges_earned, current_streak, longest_streak, last_quiz_date)
    VALUES ${values.join(',\n')}
    ON CONFLICT (user_id) DO UPDATE SET
      quizzes_completed = EXCLUDED.quizzes_completed,
      total_score = EXCLUDED.total_score,
      updated_at = NOW();
  `;

  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) console.error('❌ Error:', error);
  else console.log(`✅ Seeded ${values.length} quiz progress records`);
}

async function main() {
  console.log('🚀 Seeding Remaining Tables...\n');

  await seedBadges();
  await seedNotificationsAndEvents();
  await seedQuizProgress();

  console.log('\n✨ Remaining tables seeded!');
  console.log('\n📊 Summary:');
  console.log('   ✅ Badges: 10 types');
  console.log('   ✅ Notifications: ~500 notifications');
  console.log('   ✅ Events: ~250 events');
  console.log('   ✅ Quiz Progress: ~50 records');
}

main();
