import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function completeMatchmakingData() {
  console.log('🤝 COMPLETING MATCHMAKING DATA\n');
  console.log('='.repeat(80));
  console.log('\n');

  // Get Sarah's user ID
  const { data: sarahProfile } = await supabase
    .from('athlete_profiles')
    .select('user_id, username')
    .eq('username', 'sarah-johnson')
    .single();

  if (!sarahProfile) {
    console.error('❌ Sarah Johnson not found');
    return;
  }

  const sarahId = sarahProfile.user_id;
  console.log(`✅ Sarah Johnson ID: ${sarahId}\n`);

  // Get agencies
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, company_name, agency_type')
    .in('company_name', [
      'Elite Sports Management',
      'Athlete Brand Collective',
      'Next Level NIL Partners',
      'West Coast Athlete Agency',
      'Social Impact Sports',
      'Premier NIL Group',
      'Digital Athletes Network',
      'Hometown Heroes Collective'
    ]);

  if (!agencies || agencies.length === 0) {
    console.error('❌ No agencies found');
    return;
  }

  console.log(`✅ Found ${agencies.length} agencies\n`);

  // ============================================================================
  // 1. CREATE CAMPAIGNS
  // ============================================================================
  console.log('1️⃣  CREATING CAMPAIGNS\n');
  console.log('-'.repeat(80));

  const campaigns = [
    {
      agency_user_id: agencies.find(a => a.company_name === 'Elite Sports Management')?.id,
      campaign_name: 'College Basketball Ambassadors 2024',
      brand_name: 'Nike',
      description: 'Seeking D1 basketball athletes for social media partnerships. Focus on authentic content creation and brand ambassadorship.',
      total_budget: 10000000, // $100,000 in cents
      budget_per_athlete: 500000, // $5,000 per athlete
      target_sports: ['Basketball'],
      target_states: ['CA', 'NY', 'TX', 'FL'],
      target_school_levels: ['college'],
      min_followers: 25000,
      min_engagement_rate: 3.5,
      start_date: '2024-09-01',
      end_date: '2025-05-31',
      status: 'active',
      required_deliverables: {
        posts: 4,
        stories: 8,
        reels: 2
      }
    },
    {
      agency_user_id: agencies.find(a => a.company_name === 'Digital Athletes Network')?.id,
      campaign_name: 'TikTok Content Creators - Sports Edition',
      brand_name: 'Gatorade',
      description: 'Looking for athletic TikTok creators with high engagement. Must be comfortable creating lifestyle and training content.',
      total_budget: 5000000, // $50,000
      budget_per_athlete: 250000, // $2,500
      target_sports: ['Basketball', 'Volleyball', 'Soccer', 'Track'],
      target_states: ['CA', 'NY', 'FL', 'TX', 'IL'],
      target_school_levels: ['college', 'high_school'],
      min_followers: 50000,
      min_engagement_rate: 5.0,
      start_date: '2024-08-01',
      end_date: '2025-03-31',
      status: 'active',
      required_deliverables: {
        tiktoks: 6,
        instagram_reels: 3,
        stories: 10
      }
    },
    {
      agency_user_id: agencies.find(a => a.company_name === 'Social Impact Sports')?.id,
      campaign_name: 'Athletes for Education',
      brand_name: 'Teach For America',
      description: 'Mission-driven campaign connecting athletes with educational nonprofits. Focus on mentorship and community engagement.',
      total_budget: 3000000, // $30,000
      budget_per_athlete: 150000, // $1,500
      target_sports: ['Basketball', 'Football', 'Soccer', 'Volleyball'],
      target_states: ['CA', 'NY', 'IL', 'GA', 'NC'],
      target_school_levels: ['college'],
      min_followers: 10000,
      min_engagement_rate: 3.0,
      start_date: '2024-09-01',
      end_date: '2025-06-30',
      status: 'active',
      required_deliverables: {
        posts: 2,
        community_events: 3,
        stories: 5
      }
    },
    {
      agency_user_id: agencies.find(a => a.company_name === 'Hometown Heroes Collective')?.id,
      campaign_name: 'Local Business Ambassadors - Kentucky',
      brand_name: 'Kentucky Local Businesses',
      description: 'Connect college athletes with hometown businesses in Kentucky. Focus on authentic local partnerships.',
      total_budget: 2000000, // $20,000
      budget_per_athlete: 100000, // $1,000
      target_sports: ['Basketball', 'Football', 'Baseball'],
      target_states: ['KY', 'TN', 'IN', 'OH'],
      target_school_levels: ['college'],
      min_followers: 5000,
      min_engagement_rate: 2.5,
      start_date: '2024-08-15',
      end_date: '2025-05-15',
      status: 'active',
      required_deliverables: {
        posts: 3,
        local_appearances: 2,
        stories: 6
      }
    },
    {
      agency_user_id: agencies.find(a => a.company_name === 'Premier NIL Group')?.id,
      campaign_name: 'Elite Athletes Partnership Program',
      brand_name: 'Adidas',
      description: 'Premium brand partnerships for top-tier D1 athletes. High-value deals for athletes with strong social presence.',
      total_budget: 15000000, // $150,000
      budget_per_athlete: 1500000, // $15,000
      target_sports: ['Basketball', 'Football'],
      target_states: ['CA', 'TX', 'FL', 'GA', 'NC'],
      target_school_levels: ['college'],
      min_followers: 100000,
      min_engagement_rate: 4.0,
      start_date: '2024-07-01',
      end_date: '2025-06-30',
      status: 'active',
      required_deliverables: {
        posts: 6,
        videos: 3,
        events: 2
      }
    }
  ];

  let campaignIds: string[] = [];
  for (const campaign of campaigns) {
    if (!campaign.agency_user_id) continue;

    const { data, error } = await supabase
      .from('agency_campaigns')
      .insert(campaign)
      .select('id')
      .single();

    if (error) {
      console.log(`   ❌ ${campaign.campaign_name}: ${error.message}`);
    } else {
      console.log(`   ✅ ${campaign.campaign_name}`);
      console.log(`      Brand: ${campaign.brand_name}, Budget: $${(campaign.budget_per_athlete! / 100).toLocaleString()}/athlete\n`);
      campaignIds.push(data.id);
    }
  }

  console.log(`\n📊 Created ${campaignIds.length}/5 campaigns\n\n`);

  // ============================================================================
  // 2. CREATE NIL DEALS FOR SARAH
  // ============================================================================
  console.log('2️⃣  CREATING NIL DEALS FOR SARAH\n');
  console.log('-'.repeat(80));

  const nilDeals = [
    {
      athlete_id: sarahId,
      brand_name: 'Nike',
      deal_type: 'social_media_post',
      compensation_amount: 1500,
      deal_date: '2024-02-01',
      status: 'completed',
      description: 'Instagram post featuring new basketball shoes',
      deliverables: ['1 Instagram post', '3 Instagram stories'],
      is_public: true
    },
    {
      athlete_id: sarahId,
      brand_name: 'Gatorade',
      deal_type: 'content_creation',
      compensation_amount: 2000,
      deal_date: '2024-03-15',
      status: 'completed',
      description: 'Training recovery content series for TikTok',
      deliverables: ['2 TikTok videos', '1 Instagram Reel'],
      is_public: true
    },
    {
      athlete_id: sarahId,
      brand_name: 'Local Sporting Goods',
      deal_type: 'brand_ambassador',
      compensation_amount: 5000,
      deal_date: '2024-09-01',
      status: 'active',
      description: 'Season-long brand ambassador for local sports store',
      deliverables: ['Monthly social posts', 'Quarterly in-store appearances'],
      is_public: true
    }
  ];

  let dealsCreated = 0;
  for (const deal of nilDeals) {
    const { error } = await supabase
      .from('nil_deals')
      .insert(deal);

    if (error) {
      console.log(`   ❌ ${deal.brand_name}: ${error.message}`);
    } else {
      console.log(`   ✅ ${deal.brand_name} - $${deal.compensation_amount.toLocaleString()}`);
      console.log(`      Type: ${deal.deal_type}, Status: ${deal.status}\n`);
      dealsCreated++;
    }
  }

  console.log(`\n📊 Created ${dealsCreated}/3 NIL deals\n\n`);

  // ============================================================================
  // 3. GENERATE AGENCY-ATHLETE MATCHES
  // ============================================================================
  console.log('3️⃣  GENERATING AGENCY-ATHLETE MATCHES\n');
  console.log('-'.repeat(80));

  // Simple match scores based on agency type and Sarah's profile
  const matches = [
    {
      agency_id: agencies.find(a => a.company_name === 'Elite Sports Management')?.id,
      athlete_id: sarahId,
      match_score: 85,
      score_breakdown: {
        sport_alignment: 10,
        geographic_match: 8,
        school_division: 5,
        follower_count: 10,
        engagement_rate: 13,
        audience_demographics: 4,
        hobby_overlap: 12,
        brand_affinity: 9,
        past_nil_success: 6,
        content_quality: 5,
        response_rate: 3
      },
      match_reason: 'Strong alignment for basketball-focused partnerships. Excellent social media presence (145.8K followers, 4.7% engagement) and proven content creation skills.',
      match_highlights: [
        'Basketball specialist with 145.8K total followers',
        'High engagement rate (4.7%) ideal for brand campaigns',
        'UCLA athlete - strong school brand',
        'Proven content quality with 6 portfolio items'
      ],
      match_status: 'pending'
    },
    {
      agency_id: agencies.find(a => a.company_name === 'Digital Athletes Network')?.id,
      athlete_id: sarahId,
      match_score: 78,
      score_breakdown: {
        sport_alignment: 8,
        geographic_match: 10,
        school_division: 5,
        follower_count: 10,
        engagement_rate: 14,
        audience_demographics: 5,
        hobby_overlap: 10,
        brand_affinity: 7,
        past_nil_success: 4,
        content_quality: 5,
        response_rate: 0
      },
      match_reason: 'Perfect fit for digital-first campaigns. Strong TikTok presence (82.1K) and high engagement rate make her ideal for social media partnerships.',
      match_highlights: [
        'TikTok presence: 82.1K followers',
        'California-based (UCLA) - key market',
        'High engagement rate across all platforms',
        'Content creation experience'
      ],
      match_status: 'pending'
    },
    {
      agency_id: agencies.find(a => a.company_name === 'Social Impact Sports')?.id,
      athlete_id: sarahId,
      match_score: 72,
      score_breakdown: {
        sport_alignment: 10,
        geographic_match: 10,
        school_division: 5,
        follower_count: 8,
        engagement_rate: 12,
        audience_demographics: 4,
        hobby_overlap: 8,
        brand_affinity: 8,
        past_nil_success: 3,
        content_quality: 4,
        response_rate: 0
      },
      match_reason: 'Great match for mission-driven campaigns. UCLA student-athlete with strong community focus and leadership as team captain.',
      match_highlights: [
        'Team captain - natural leader',
        'Academic All-American - strong student profile',
        'Interested in NIL education for other athletes',
        'Strong local presence in California'
      ],
      match_status: 'pending'
    }
  ];

  let matchesCreated = 0;
  for (const match of matches) {
    if (!match.agency_id) continue;

    const { error } = await supabase
      .from('agency_athlete_matches')
      .insert(match);

    if (error) {
      console.log(`   ❌ Match creation failed: ${error.message}`);
    } else {
      const agency = agencies.find(a => a.id === match.agency_id);
      console.log(`   ✅ ${agency?.company_name} → Sarah Johnson`);
      console.log(`      Match Score: ${match.match_score}/100`);
      console.log(`      Reason: ${match.match_reason.substring(0, 80)}...\n`);
      matchesCreated++;
    }
  }

  console.log(`\n📊 Created ${matchesCreated}/3 matches\n\n`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('='.repeat(80));
  console.log('✅ MATCHMAKING DATA COMPLETE\n');
  console.log(`📊 Summary:`);
  console.log(`   • ${campaignIds.length} Active Campaigns`);
  console.log(`   • ${dealsCreated} NIL Deals for Sarah`);
  console.log(`   • ${matchesCreated} Agency-Athlete Matches`);
  console.log(`   • ${agencies.length} Total Agencies`);
  console.log('\n✅ MATCHMAKING SYSTEM IS NOW FULLY FUNCTIONAL!\n');
  console.log('🔗 Test URLs:');
  console.log('   • Sarah\'s Profile: http://localhost:3000/athletes/sarah-johnson');
  console.log('   • Agency Discovery: http://localhost:3000/agencies');
  console.log('   • Campaign Browser: http://localhost:3000/campaigns');
  console.log('   • Matchmaking: http://localhost:3000/matches');
  console.log('\n');
}

completeMatchmakingData().catch(console.error);
