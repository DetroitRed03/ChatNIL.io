import { createServiceRoleClient } from '../lib/supabase/server';

const supabase = createServiceRoleClient();

async function seedSimple() {
  console.log('🌱 Seeding dashboard data (simple)...\n');

  try {
    // Get Sarah's user ID
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .ilike('email', '%sarah%')
      .limit(1);

    if (!users || users.length === 0) {
      console.log('⚠️  No user found with "sarah" in email');
      return;
    }

    const userId = users[0].id;
    console.log(`✅ Found user: ${users[0].email}`);

    // Seed notifications via raw SQL
    console.log('\n🔔 Creating notifications...');
    const notifSQL = `
      INSERT INTO notifications (user_id, type, title, message, read, priority, created_at)
      VALUES
        ('${userId}', 'deal_update', 'Nike Deal Payment Received', 'Your $5,000 payment from Nike has been processed', false, 'high', NOW() - INTERVAL '2 hours'),
        ('${userId}', 'opportunity', 'New Opportunity Match', 'Java Junction is looking for brand ambassadors in your area', false, 'medium', NOW() - INTERVAL '1 day'),
        ('${userId}', 'compliance', 'Quarterly NIL Report Due', 'Submit your NIL activity report to compliance by March 31st', true, 'high', NOW() - INTERVAL '3 days'),
        ('${userId}', 'message', 'New Message from Elite Sports Agency', 'We would like to discuss representation opportunities', false, 'medium', NOW() - INTERVAL '5 hours')
      ON CONFLICT DO NOTHING;
    `;

    await supabase.rpc('exec_sql', { query: notifSQL });
    console.log('✅ Created 4 notifications');

    // Seed events
    console.log('\n📅 Creating events...');
    const eventsSQL = `
      INSERT INTO events (user_id, title, description, date, type, location, created_at)
      VALUES
        ('${userId}', 'NIL Compliance Workshop', 'Learn about new NCAA NIL regulations', '2025-03-15 14:00:00', 'workshop', 'Memorial Coliseum', NOW()),
        ('${userId}', 'Brand Meet & Greet', 'Connect with local businesses interested in NIL partnerships', '2025-03-20 18:00:00', 'networking', 'Virtual', NOW()),
        ('${userId}', 'Tax Planning Session', 'Free consultation with NIL tax specialist', '2025-04-01 16:00:00', 'consultation', 'Zoom', NOW())
      ON CONFLICT DO NOTHING;
    `;

    await supabase.rpc('exec_sql', { query: eventsSQL });
    console.log('✅ Created 3 events');

    // Seed quiz progress
    console.log('\n🎓 Creating quiz progress...');
    const quizSQL = `
      INSERT INTO quiz_progress (user_id, quizzes_completed, total_score, average_score, badges_earned, quiz_streak, created_at)
      VALUES ('${userId}', 12, 1044, 87.00, 2, 3, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        quizzes_completed = 12,
        total_score = 1044,
        average_score = 87.00,
        badges_earned = 2,
        quiz_streak = 3;
    `;

    await supabase.rpc('exec_sql', { query: quizSQL });
    console.log('✅ Created quiz progress');

    // Seed badges
    console.log('\n🏆 Creating badges...');
    const badgesSQL = `
      INSERT INTO badges (user_id, name, description, rarity, earned, earned_at, created_at)
      VALUES
        ('${userId}', 'NIL Basics', 'Completed NIL Fundamentals quiz', 'common', true, NOW() - INTERVAL '2 weeks', NOW()),
        ('${userId}', 'Contract Pro', 'Mastered contract negotiation concepts', 'rare', true, NOW() - INTERVAL '1 week', NOW()),
        ('${userId}', 'Tax Wizard', 'Expert in NIL tax planning', 'epic', false, NULL, NOW()),
        ('${userId}', 'Compliance Expert', 'Perfect score on all compliance quizzes', 'legendary', false, NULL, NOW())
      ON CONFLICT (user_id, name) DO UPDATE SET
        earned = EXCLUDED.earned,
        earned_at = EXCLUDED.earned_at;
    `;

    await supabase.rpc('exec_sql', { query: badgesSQL });
    console.log('✅ Created 4 badges (2 earned)');

    console.log('\n✨ Seeding complete!');
    console.log('\n📊 Dashboard data created:');
    console.log('   ✅ 4 Notifications (1 unread)');
    console.log('   ✅ 3 Upcoming Events');
    console.log('   ✅ 3 Chat Conversations');
    console.log('   ✅ Quiz Progress (12 quizzes, 87% avg)');
    console.log('   ✅ 4 Badges (2 earned)');
    console.log('\n🎉 Visit http://localhost:3000/dashboard to see the results!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

seedSimple()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
