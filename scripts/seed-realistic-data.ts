/**
 * Seed Realistic Data Script
 *
 * Enhances EXISTING athletes and creates:
 * - Matches between athletes and agencies
 * - NIL deals with various statuses
 * - Realistic message threads with multi-turn conversations
 *
 * Run with: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-realistic-data.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// DATA DEFINITIONS
// ============================================

// Note: Matches actual users table columns
const athleteEnhancements: Record<string, {
  sport: string;
  school_name: string;
  school_level?: string;
  instagram_followers?: number;
  tiktok_followers?: number;
  twitter_followers?: number;
  youtube_subscribers?: number;
}> = {
  'Sarah Johnson': {
    sport: 'Basketball',
    school_name: 'UCLA',
    school_level: 'D1',
    instagram_followers: 125000,
    tiktok_followers: 89000,
    twitter_followers: 45000,
    youtube_subscribers: 12000
  },
  'Marcus Williams': {
    sport: 'Football',
    school_name: 'Ohio State',
    school_level: 'D1',
    instagram_followers: 230000,
    tiktok_followers: 156000,
    twitter_followers: 78000,
    youtube_subscribers: 25000
  },
  'James Thompson': {
    sport: 'Track & Field',
    school_name: 'USC',
    school_level: 'D1',
    instagram_followers: 67000,
    tiktok_followers: 34000,
    twitter_followers: 21000,
    youtube_subscribers: 5000
  },
  'Emily Chen': {
    sport: 'Gymnastics',
    school_name: 'Stanford',
    school_level: 'D1',
    instagram_followers: 185000,
    tiktok_followers: 420000,
    twitter_followers: 52000,
    youtube_subscribers: 35000
  },
  'Alex Rivera': {
    sport: 'Soccer',
    school_name: 'Duke',
    school_level: 'D1',
    instagram_followers: 94000,
    tiktok_followers: 67000,
    twitter_followers: 31000,
    youtube_subscribers: 8000
  },
  'John Doe': {
    sport: 'Swimming',
    school_name: 'Michigan',
    school_level: 'D1',
    instagram_followers: 45000,
    tiktok_followers: 28000,
    twitter_followers: 15000,
    youtube_subscribers: 3000
  }
};

// Conversation templates for different scenarios
const conversationTemplates = [
  {
    context: 'initial_outreach_nutrition',
    messages: [
      { sender: 'agency', text: "Hi! I'm reaching out from GreenLife Nutrition. We've been following your athletic journey and are really impressed with your dedication to health and performance. Would you be interested in discussing a potential partnership?" },
      { sender: 'athlete', text: "Hey! Thanks for reaching out. I'm definitely interested in hearing more about what you have in mind. I'm pretty selective about nutrition brands since I need to make sure everything aligns with my training regimen." },
      { sender: 'agency', text: "Absolutely understand! We specialize in clean, NCAA-compliant supplements. We're thinking a content partnership where you'd share your nutrition routine with your followers. We'd provide product, plus compensation. Can we set up a call this week?" },
      { sender: 'athlete', text: "That sounds promising. I'd want to try the products first and have my trainer review them. If everything checks out, I'm open to discussing further. How about Thursday afternoon?" },
      { sender: 'agency', text: "Perfect! Thursday at 2pm EST works great. I'll send over some product samples and our standard partnership overview beforehand. Looking forward to connecting!" }
    ]
  },
  {
    context: 'deal_negotiation',
    messages: [
      { sender: 'agency', text: "Great news! The brand loved your proposal. They're offering $5,000 for a 3-month campaign with 2 posts per month. Thoughts?" },
      { sender: 'athlete', text: "Thanks for the update! The exposure sounds great, but given my engagement rates and follower count, I was hoping for something closer to $7,500. Would they consider meeting in the middle?" },
      { sender: 'agency', text: "I hear you. Let me go back to them. Your engagement rate is definitely above average. Would you be flexible on adding one additional story per month if they can hit $6,500?" },
      { sender: 'athlete', text: "If it's just stories and not reels, that works for me. Stories are easier to fit into my schedule during the season. Let's do it!" },
      { sender: 'agency', text: "They agreed! $6,500 for 2 posts + 3 stories monthly over 3 months. I'll draft the contract and send it over for your review. Congrats!" }
    ]
  },
  {
    context: 'campaign_check_in',
    messages: [
      { sender: 'agency', text: "Hey! Just checking in on how the first month of the campaign went. The brand mentioned your last post performed really well - 45% above their benchmark!" },
      { sender: 'athlete', text: "That's awesome to hear! I've been really enjoying the partnership. My followers have been asking lots of questions about the products, which is a good sign." },
      { sender: 'agency', text: "Love it! They're actually asking if you'd be interested in extending the deal for another 6 months with a 15% increase. They'd also want to feature you in their spring campaign shoot." },
      { sender: 'athlete', text: "A spring campaign shoot sounds exciting! I'm definitely interested. Can we discuss timing? My championship season starts in March, so I'd need to work around that." }
    ]
  },
  {
    context: 'new_opportunity',
    messages: [
      { sender: 'agency', text: "I have an exciting opportunity for you! A major sports apparel brand is launching a college athlete initiative and specifically asked about you. They're offering $12,000 for a year-long ambassador role." },
      { sender: 'athlete', text: "Wow, that's significant! What would the deliverables look like? And would there be any exclusivity requirements?" },
      { sender: 'agency', text: "4 posts quarterly, appearance at 2 events (travel covered), and exclusivity only for athletic apparel - so your current nutrition deal wouldn't conflict. They'd also provide full gear packages." },
      { sender: 'athlete', text: "The exclusivity for just apparel is reasonable. I'm interested but want to make sure the events don't conflict with my game schedule. Can you get me the tentative event dates?" },
      { sender: 'agency', text: "Already requested them! Should have the dates by tomorrow. They mentioned they're flexible and willing to work around your schedule. I think this could be a great fit for building your personal brand." }
    ]
  },
  {
    context: 'quick_content_approval',
    messages: [
      { sender: 'agency', text: "Hey! Quick one - the brand needs to approve your post caption before you publish tomorrow. Can you send me what you're planning?" },
      { sender: 'athlete', text: "Sure! Here it is: 'Game day fuel hits different with @BrandName. Clean energy, no crash. Use code ATHLETE20 for 20% off! #ad #partner'" },
      { sender: 'agency', text: "Love it! Just one small tweak - they want #paidpartnership instead of #partner for FTC compliance. Otherwise good to go!" },
      { sender: 'athlete', text: "Got it, updating now. Will post at 11am tomorrow morning right before our home game. Should get good engagement timing." }
    ]
  }
];

const dealTemplates = [
  {
    brand_name: 'GreenLife Nutrition',
    deal_title: 'Athlete Ambassador Program',
    description: 'Monthly content creation featuring nutrition products with exclusive discount code',
    deal_type: 'content',
    compensation_amount: 5000,
    status: 'active',
    deliverables: ['2 Instagram posts/month', '4 Instagram stories/month', 'Exclusive discount code']
  },
  {
    brand_name: 'TechGear Athletics',
    deal_title: 'Spring Campaign Feature',
    description: 'Featured athlete in spring marketing campaign with social media promotion',
    deal_type: 'campaign',
    compensation_amount: 8500,
    status: 'active',
    deliverables: ['Photo shoot appearance', '3 Instagram posts', '1 TikTok video', 'Story takeover']
  },
  {
    brand_name: 'Local Sports Shop',
    deal_title: 'Meet & Greet Event',
    description: 'In-store appearance and autograph session',
    deal_type: 'appearance',
    compensation_amount: 1500,
    status: 'completed',
    deliverables: ['2-hour appearance', 'Social media mention', 'Photo opportunities']
  },
  {
    brand_name: 'Energy Drink Co',
    deal_title: 'Game Day Partnership',
    description: 'Product placement and content during game days',
    deal_type: 'content',
    compensation_amount: 3000,
    status: 'pending',
    deliverables: ['4 game day posts', 'Product placement in stories']
  },
  {
    brand_name: 'Athletic Apparel Brand',
    deal_title: 'Year-Long Ambassador',
    description: 'Exclusive athletic apparel ambassador with quarterly content',
    deal_type: 'ambassador',
    compensation_amount: 15000,
    status: 'negotiating',
    deliverables: ['4 posts quarterly', '2 event appearances', 'Full gear package', 'Exclusivity clause']
  }
];

// ============================================
// MAIN SEEDING FUNCTIONS
// ============================================

async function enhanceAthleteProfiles() {
  console.log('\n📊 Enhancing athlete profiles...');

  const { data: athletes, error: fetchError } = await supabase
    .from('users')
    .select('id, first_name, last_name, full_name')
    .eq('role', 'athlete');

  if (fetchError || !athletes) {
    console.error('Failed to fetch athletes:', fetchError);
    return [];
  }

  const enhancedAthletes: { id: string; name: string }[] = [];

  for (const athlete of athletes) {
    const name = athlete.full_name || `${athlete.first_name} ${athlete.last_name}`.trim();
    const enhancement = athleteEnhancements[name];

    if (enhancement) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          sport: enhancement.sport,
          school_name: enhancement.school_name,
          school_level: enhancement.school_level,
          instagram_followers: enhancement.instagram_followers,
          tiktok_followers: enhancement.tiktok_followers,
          twitter_followers: enhancement.twitter_followers,
          youtube_subscribers: enhancement.youtube_subscribers
        })
        .eq('id', athlete.id);

      if (updateError) {
        console.log(`  ⚠️ Could not update ${name}: ${updateError.message}`);
      } else {
        console.log(`  ✅ Enhanced: ${name} (${enhancement.sport}, ${enhancement.school_name})`);
        enhancedAthletes.push({ id: athlete.id, name });
      }
    }
  }

  return enhancedAthletes;
}

async function getAgencies() {
  console.log('\n🏢 Fetching agencies...');

  const { data: agencies, error } = await supabase
    .from('users')
    .select('id, company_name, first_name, last_name')
    .in('role', ['agency', 'business']);

  if (error || !agencies?.length) {
    console.error('No agencies found:', error);
    return [];
  }

  console.log(`  Found ${agencies.length} agencies`);
  agencies.forEach(a => console.log(`    - ${a.company_name || a.first_name}`));

  return agencies;
}

async function seedMatches(athletes: { id: string; name: string }[], agencies: any[]) {
  console.log('\n🤝 Creating athlete-agency matches...');

  // Check if match table exists and has correct columns
  const { error: tableCheck } = await supabase
    .from('athlete_agency_matches')
    .select('id')
    .limit(1);

  if (tableCheck?.message?.includes('does not exist')) {
    console.log('  ⚠️ athlete_agency_matches table does not exist, skipping...');
    return;
  }

  let matchCount = 0;

  for (const athlete of athletes) {
    // Create 2-4 matches per athlete with different agencies
    const numMatches = 2 + Math.floor(Math.random() * 3);
    const shuffledAgencies = [...agencies].sort(() => Math.random() - 0.5).slice(0, numMatches);

    for (const agency of shuffledAgencies) {
      const matchScore = 70 + Math.floor(Math.random() * 25); // 70-95

      const { error } = await supabase
        .from('athlete_agency_matches')
        .upsert({
          athlete_id: athlete.id,
          agency_id: agency.id,
          match_score: matchScore,
          status: ['pending', 'contacted', 'interested', 'active'][Math.floor(Math.random() * 4)],
          created_at: new Date().toISOString()
        }, {
          onConflict: 'athlete_id,agency_id'
        });

      if (!error) {
        matchCount++;
      }
    }
  }

  console.log(`  ✅ Created ${matchCount} matches`);
}

async function seedDeals(athletes: { id: string; name: string }[], agencies: any[]) {
  console.log('\n💰 Creating NIL deals...');

  let dealCount = 0;

  for (const athlete of athletes) {
    // Create 1-3 deals per athlete
    const numDeals = 1 + Math.floor(Math.random() * 3);
    const templates = [...dealTemplates].sort(() => Math.random() - 0.5).slice(0, numDeals);

    for (const template of templates) {
      const agency = agencies[Math.floor(Math.random() * agencies.length)];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 60));

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 3 + Math.floor(Math.random() * 6));

      const { error } = await supabase
        .from('nil_deals')
        .insert({
          athlete_id: athlete.id,
          agency_id: agency.id,
          brand_name: template.brand_name,
          deal_title: template.deal_title,
          description: template.description,
          deal_type: template.deal_type,
          compensation_amount: template.compensation_amount * (0.8 + Math.random() * 0.4), // Vary by 80-120%
          currency: 'USD',
          status: template.status,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          deliverables: template.deliverables,
          is_public: Math.random() > 0.3
        });

      if (!error) {
        dealCount++;
        console.log(`  ✅ ${athlete.name}: ${template.deal_title} (${template.status})`);
      } else {
        console.log(`  ⚠️ Failed deal for ${athlete.name}: ${error.message}`);
      }
    }
  }

  console.log(`  Created ${dealCount} deals total`);
}

async function seedMessageThreads(athletes: { id: string; name: string }[], agencies: any[]) {
  console.log('\n💬 Creating message threads...');

  let threadCount = 0;
  let messageCount = 0;

  for (const athlete of athletes.slice(0, 4)) { // First 4 athletes get conversations
    // 1-2 conversations per athlete
    const numConversations = 1 + Math.floor(Math.random() * 2);
    const shuffledAgencies = [...agencies].sort(() => Math.random() - 0.5).slice(0, numConversations);
    const shuffledTemplates = [...conversationTemplates].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledAgencies.length; i++) {
      const agency = shuffledAgencies[i];
      const template = shuffledTemplates[i % shuffledTemplates.length];

      // Check if thread already exists
      const { data: existingThread } = await supabase
        .from('agency_message_threads')
        .select('id')
        .eq('agency_id', agency.id)
        .eq('athlete_id', athlete.id)
        .single();

      let threadId: string;

      if (existingThread) {
        threadId = existingThread.id;
      } else {
        // Create new thread
        const { data: newThread, error: threadError } = await supabase
          .from('agency_message_threads')
          .insert({
            agency_id: agency.id,
            athlete_id: athlete.id,
            status: 'active',
            last_message: template.messages[template.messages.length - 1].text.slice(0, 100)
          })
          .select()
          .single();

        if (threadError || !newThread) {
          console.log(`  ⚠️ Failed to create thread: ${threadError?.message}`);
          continue;
        }

        threadId = newThread.id;
        threadCount++;
      }

      // Add messages with realistic timestamps
      const baseTime = new Date();
      baseTime.setDate(baseTime.getDate() - Math.floor(Math.random() * 14)); // Start 0-14 days ago

      for (let j = 0; j < template.messages.length; j++) {
        const msg = template.messages[j];
        const msgTime = new Date(baseTime);
        msgTime.setMinutes(msgTime.getMinutes() + j * (15 + Math.floor(Math.random() * 120))); // 15-135 min between messages

        const senderId = msg.sender === 'agency' ? agency.id : athlete.id;

        const { error: msgError } = await supabase
          .from('agency_athlete_messages')
          .insert({
            thread_id: threadId,
            agency_user_id: agency.id,
            athlete_user_id: athlete.id,
            sender_id: senderId,
            message_text: msg.text,
            is_read: j < template.messages.length - 1, // Last message might be unread
            created_at: msgTime.toISOString()
          });

        if (!msgError) {
          messageCount++;
        }
      }

      console.log(`  ✅ ${athlete.name} <-> ${agency.company_name || agency.first_name}: ${template.messages.length} messages`);
    }
  }

  console.log(`  Created ${threadCount} threads, ${messageCount} messages total`);
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('🚀 Starting realistic data seed...\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Enhance existing athletes
    const athletes = await enhanceAthleteProfiles();

    if (athletes.length === 0) {
      console.log('\n⚠️ No athletes found to enhance. Exiting.');
      return;
    }

    // Step 2: Get existing agencies
    const agencies = await getAgencies();

    if (agencies.length === 0) {
      console.log('\n⚠️ No agencies found. Exiting.');
      return;
    }

    // Step 3: Create matches
    await seedMatches(athletes, agencies);

    // Step 4: Create deals
    await seedDeals(athletes, agencies);

    // Step 5: Create message threads
    await seedMessageThreads(athletes, agencies);

    console.log('\n' + '=' .repeat(50));
    console.log('✅ Seed completed successfully!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
