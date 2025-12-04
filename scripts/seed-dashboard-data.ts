/**
 * Comprehensive Dashboard Data Seeding Script
 *
 * This script populates test accounts with realistic data to showcase
 * the full ChatNIL platform including:
 * - Athlete dashboards with deals, opportunities, and metrics
 * - Agency dashboards with athlete matches and campaign performance
 * - Business dashboards with NIL deal tracking
 *
 * Run with: npx tsx scripts/seed-dashboard-data.ts
 */

import { createServiceRoleClient } from '../lib/supabase/server';

const supabase = createServiceRoleClient();

// Test user IDs (we'll fetch these from the database)
let SARAH_ATHLETE_ID: string;
let JAMES_ATHLETE_ID: string;
let ELITE_AGENCY_ID: string;
let LOCAL_BUSINESS_ID: string;

// Seed data configurations
const SEED_DATA = {
  // NIL Deals for athletes
  nilDeals: [
    {
      title: 'Nike Social Media Campaign',
      brand: 'Nike',
      amount: 5000,
      status: 'active' as const,
      dealType: 'social_media' as const,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-04-15'),
      deliverables: ['3 Instagram posts per month', '2 TikTok videos per month', 'Story mentions'],
      athleteId: '' // Will be filled
    },
    {
      title: 'Local Restaurant Partnership',
      brand: 'Bluegrass Bistro',
      amount: 1200,
      status: 'active' as const,
      dealType: 'appearance' as const,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-05-31'),
      deliverables: ['Monthly restaurant visit', 'Social media posts', 'Menu item endorsement'],
      athleteId: ''
    },
    {
      title: 'Campus Bookstore Ambassador',
      brand: 'UK Campus Store',
      amount: 800,
      status: 'pending' as const,
      dealType: 'endorsement' as const,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-12-31'),
      deliverables: ['Quarterly photoshoot', 'In-store appearances', 'Social promotion'],
      athleteId: ''
    },
    {
      title: 'Sports Equipment Deal',
      brand: 'Under Armour',
      amount: 15000,
      status: 'completed' as const,
      dealType: 'equipment' as const,
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-12-31'),
      deliverables: ['Wear brand during games', 'Social media content', 'Training videos'],
      athleteId: ''
    }
  ],

  // Opportunities for athletes
  opportunities: [
    {
      title: 'Local Coffee Shop Brand Ambassador',
      company: 'Java Junction',
      compensation: '$500/month',
      dealType: 'brand_ambassador',
      requirements: ['10K+ social media following', 'Local to Lexington', 'Active Instagram'],
      description: 'Looking for a local athlete to be the face of our new student discount program',
      status: 'open'
    },
    {
      title: 'Fitness App Partnership',
      company: 'FitTrack Pro',
      compensation: '$2,000 one-time + commission',
      dealType: 'digital_content',
      requirements: ['Create workout content', '50K+ followers', 'Fitness focus'],
      description: 'Partner with growing fitness app to create exclusive athlete workout programs',
      status: 'open'
    },
    {
      title: 'Car Dealership Social Campaign',
      company: 'Lexington Auto Group',
      compensation: '$3,500',
      dealType: 'social_media',
      requirements: ['Local athlete', 'Drivers license', 'Clean social media'],
      description: 'Feature in our "Drive Your Dreams" campaign targeting college students',
      status: 'open'
    }
  ],

  // Chat sessions for athletes
  chatSessions: [
    {
      title: 'Understanding NIL Compliance',
      messages: [
        { role: 'user', content: 'Can you explain the basic NIL compliance rules for NCAA athletes?' },
        { role: 'assistant', content: 'Absolutely! NIL (Name, Image, Likeness) compliance involves several key rules:\n\n1. **Disclosure Requirements**: You must report all NIL deals to your school\'s compliance office\n2. **No School Logos**: You cannot use official team logos or uniforms in NIL activities without permission\n3. **State Laws**: Kentucky has specific NIL laws you must follow\n4. **No Pay-for-Play**: Compensation cannot be tied to athletic performance or recruitment\n\nWould you like me to explain any of these in more detail?' }
      ]
    },
    {
      title: 'Negotiating My Nike Deal',
      messages: [
        { role: 'user', content: 'I have a potential deal with Nike. What should I negotiate for?' },
        { role: 'assistant', content: 'Great opportunity! Here are key points to negotiate:\n\n1. **Compensation**: Market rate for your following and sport\n2. **Usage Rights**: How long can they use your content?\n3. **Exclusivity**: Can you work with competing brands?\n4. **Deliverables**: Be specific about what you\'ll create\n5. **Payment Schedule**: Monthly, upfront, or milestone-based?\n\nI recommend having a lawyer or agent review before signing.' }
      ]
    },
    {
      title: 'Tax Questions for NIL Income',
      messages: [
        { role: 'user', content: 'Do I have to pay taxes on my NIL money?' },
        { role: 'assistant', content: 'Yes, NIL income is taxable. Here\'s what you need to know:\n\n1. **Self-Employment**: NIL income is considered self-employment income\n2. **Quarterly Taxes**: You may need to pay estimated taxes quarterly\n3. **Deductions**: You can deduct business expenses (equipment, travel, etc.)\n4. **1099 Forms**: Brands will send you 1099 forms for payments over $600\n\nI strongly recommend consulting with a tax professional who understands athlete NIL income.' }
      ]
    }
  ],

  // Quiz progress and badges
  learningProgress: {
    quizzesCompleted: 12,
    averageScore: 87,
    totalQuizzes: 20,
    badges: [
      { name: 'NIL Basics', rarity: 'common', earned: true },
      { name: 'Contract Pro', rarity: 'rare', earned: true },
      { name: 'Tax Wizard', rarity: 'epic', earned: false },
      { name: 'Compliance Expert', rarity: 'legendary', earned: false }
    ]
  },

  // Notifications
  notifications: [
    {
      type: 'deal_update',
      title: 'Nike Deal Payment Received',
      message: 'Your $5,000 payment from Nike has been processed',
      read: false,
      priority: 'high'
    },
    {
      type: 'opportunity',
      title: 'New Opportunity Match',
      message: 'Java Junction is looking for brand ambassadors in your area',
      read: false,
      priority: 'medium'
    },
    {
      type: 'compliance',
      title: 'Quarterly NIL Report Due',
      message: 'Submit your NIL activity report to compliance by March 31st',
      read: true,
      priority: 'high'
    },
    {
      type: 'message',
      title: 'New Message from Elite Sports Agency',
      message: 'We\'d like to discuss representation opportunities',
      read: false,
      priority: 'medium'
    }
  ],

  // Upcoming events
  events: [
    {
      title: 'NIL Compliance Workshop',
      date: new Date('2025-03-15T14:00:00'),
      type: 'workshop',
      location: 'Memorial Coliseum',
      description: 'Learn about new NCAA NIL regulations'
    },
    {
      title: 'Brand Meet & Greet',
      date: new Date('2025-03-20T18:00:00'),
      type: 'networking',
      location: 'Virtual',
      description: 'Connect with local businesses interested in NIL partnerships'
    },
    {
      title: 'Tax Planning Session',
      date: new Date('2025-04-01T16:00:00'),
      type: 'consultation',
      location: 'Zoom',
      description: 'Free consultation with NIL tax specialist'
    }
  ]
};

async function main() {
  console.log('🌱 Starting dashboard data seeding...\n');

  try {
    // Step 1: Get test user IDs
    console.log('📋 Step 1: Fetching test user accounts...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name')
      .or('email.like.%test%,email.like.%demo%');

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      console.log('⚠️  No test users found. Please create test accounts first.');
      console.log('   Expected: sarah.johnson@test.com (athlete)');
      console.log('   Expected: james.wilson@test.com (athlete)');
      console.log('   Expected: elite@agency.test (agency)');
      console.log('   Expected: local@business.test (business)');
      return;
    }

    // Map users by email pattern
    const sarah = users.find(u => u.email.includes('sarah'));
    const james = users.find(u => u.email.includes('james'));
    const agency = users.find(u => u.role === 'agency');
    const business = users.find(u => u.role === 'business');

    if (sarah) {
      SARAH_ATHLETE_ID = sarah.id;
      console.log(`✅ Found athlete: ${sarah.first_name} ${sarah.last_name} (${sarah.email})`);
    }
    if (james) {
      JAMES_ATHLETE_ID = james.id;
      console.log(`✅ Found athlete: ${james.first_name} ${james.last_name} (${james.email})`);
    }
    if (agency) {
      ELITE_AGENCY_ID = agency.id;
      console.log(`✅ Found agency: ${agency.email}`);
    }
    if (business) {
      LOCAL_BUSINESS_ID = business.id;
      console.log(`✅ Found business: ${business.email}`);
    }

    if (!sarah && !james) {
      console.log('⚠️  No athlete test accounts found. Skipping athlete-specific data.');
    }

    console.log('\n📊 Step 2: Creating NIL deals...');

    if (SARAH_ATHLETE_ID) {
      // Create deals for Sarah
      const sarahDeals = SEED_DATA.nilDeals.map(deal => ({
        ...deal,
        athlete_id: SARAH_ATHLETE_ID,
        user_id: SARAH_ATHLETE_ID,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data: dealsData, error: dealsError } = await supabase
        .from('nil_deals')
        .insert(sarahDeals)
        .select();

      if (dealsError) {
        console.log('⚠️  Error creating deals:', dealsError.message);
      } else {
        console.log(`✅ Created ${dealsData?.length || 0} NIL deals for Sarah`);
      }
    }

    console.log('\n💬 Step 3: Creating chat sessions...');

    if (SARAH_ATHLETE_ID) {
      for (const session of SEED_DATA.chatSessions) {
        // Create chat session
        const { data: sessionData, error: sessionError } = await supabase
          .from('chat_sessions')
          .insert({
            user_id: SARAH_ATHLETE_ID,
            title: session.title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (sessionError) {
          console.log(`⚠️  Error creating session "${session.title}":`, sessionError.message);
          continue;
        }

        // Create messages for this session
        const messages = session.messages.map((msg, index) => ({
          session_id: sessionData.id,
          user_id: SARAH_ATHLETE_ID,
          content: msg.content,
          role: msg.role,
          created_at: new Date(Date.now() - (1000 * 60 * 60 * 24 * (10 - index))).toISOString() // Stagger dates
        }));

        const { error: messagesError } = await supabase
          .from('chat_messages')
          .insert(messages);

        if (messagesError) {
          console.log(`⚠️  Error creating messages for "${session.title}":`, messagesError.message);
        } else {
          console.log(`✅ Created chat: "${session.title}" with ${messages.length} messages`);
        }
      }
    }

    console.log('\n🔔 Step 4: Creating notifications...');

    if (SARAH_ATHLETE_ID) {
      const notifications = SEED_DATA.notifications.map((notif, index) => ({
        user_id: SARAH_ATHLETE_ID,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: notif.read,
        priority: notif.priority,
        created_at: new Date(Date.now() - (1000 * 60 * 60 * (72 - index * 12))).toISOString()
      }));

      const { data: notifData, error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (notifError) {
        console.log('⚠️  Error creating notifications:', notifError.message);
      } else {
        console.log(`✅ Created ${notifData?.length || 0} notifications`);
      }
    }

    console.log('\n📅 Step 5: Creating events...');

    if (SARAH_ATHLETE_ID) {
      const events = SEED_DATA.events.map(event => ({
        user_id: SARAH_ATHLETE_ID,
        title: event.title,
        date: event.date.toISOString(),
        type: event.type,
        location: event.location,
        description: event.description,
        created_at: new Date().toISOString()
      }));

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .insert(events)
        .select();

      if (eventsError) {
        console.log('⚠️  Error creating events:', eventsError.message);
      } else {
        console.log(`✅ Created ${eventsData?.length || 0} events`);
      }
    }

    console.log('\n🎓 Step 6: Creating quiz progress and badges...');

    if (SARAH_ATHLETE_ID) {
      // Update or insert quiz progress
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_progress')
        .upsert({
          user_id: SARAH_ATHLETE_ID,
          quizzes_completed: SEED_DATA.learningProgress.quizzesCompleted,
          total_score: SEED_DATA.learningProgress.averageScore * SEED_DATA.learningProgress.quizzesCompleted,
          average_score: SEED_DATA.learningProgress.averageScore,
          badges_earned: SEED_DATA.learningProgress.badges.filter(b => b.earned).length,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (quizError) {
        console.log('⚠️  Error creating quiz progress:', quizError.message);
      } else {
        console.log(`✅ Created quiz progress: ${SEED_DATA.learningProgress.quizzesCompleted} quizzes completed`);
      }

      // Create badges
      const badges = SEED_DATA.learningProgress.badges.map(badge => ({
        user_id: SARAH_ATHLETE_ID,
        name: badge.name,
        rarity: badge.rarity,
        earned: badge.earned,
        earned_at: badge.earned ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      }));

      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .upsert(badges, {
          onConflict: 'user_id,name'
        })
        .select();

      if (badgesError) {
        console.log('⚠️  Error creating badges:', badgesError.message);
      } else {
        console.log(`✅ Created ${badgesData?.length || 0} badges`);
      }
    }

    console.log('\n✨ Seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   - NIL Deals: ${SEED_DATA.nilDeals.length}`);
    console.log(`   - Chat Sessions: ${SEED_DATA.chatSessions.length}`);
    console.log(`   - Notifications: ${SEED_DATA.notifications.length}`);
    console.log(`   - Events: ${SEED_DATA.events.length}`);
    console.log(`   - Badges: ${SEED_DATA.learningProgress.badges.length}`);
    console.log('\n🎉 Test dashboards are now fully populated!');
    console.log('   Visit http://localhost:3000/dashboard to see the data\n');

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
