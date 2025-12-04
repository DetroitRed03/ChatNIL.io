import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use admin client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const SARAH_ID = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

async function insertData() {
  console.log('🌱 INSERTING MATCHMAKING DATA DIRECTLY\n');
  console.log('='.repeat(80));

  // 1. INSERT NIL DEALS using REST API directly
  console.log('\n1️⃣  Inserting NIL Deals...\n');

  const nilDeals = [
    {
      athlete_id: SARAH_ID,
      brand_name: 'Nike',
      deal_type: 'social_media',
      status: 'completed',
      compensation_amount: 1500,
      deal_date: '2024-06-15',
      description: 'Instagram post promoting Nike Basketball shoes with behind-the-scenes training content',
      is_public: true
    },
    {
      athlete_id: SARAH_ID,
      brand_name: 'Gatorade',
      deal_type: 'content_creation',
      status: 'completed',
      compensation_amount: 2000,
      deal_date: '2024-07-20',
      description: 'TikTok video series featuring hydration tips and game-day preparation',
      is_public: true
    },
    {
      athlete_id: SARAH_ID,
      brand_name: 'Local Sporting Goods Store',
      deal_type: 'brand_ambassador',
      status: 'active',
      compensation_amount: 5000,
      deal_date: '2024-08-01',
      description: 'Monthly brand ambassador with in-store appearances, social media posts, and community events',
      is_public: true
    }
  ];

  for (const deal of nilDeals) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/nil_deals`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal,resolution=ignore-duplicates'
        },
        body: JSON.stringify(deal)
      });

      if (response.ok || response.status === 409) {
        console.log(`   ✅ ${deal.brand_name} - $${deal.compensation_amount}`);
      } else {
        const error = await response.text();
        console.log(`   ⚠️  ${deal.brand_name}: ${error.substring(0, 80)}`);
      }
    } catch (err: any) {
      console.log(`   ⚠️  ${deal.brand_name}: ${err.message}`);
    }
  }

  // 2. INSERT CAMPAIGNS
  console.log('\n2️⃣  Inserting Campaigns...\n');

  const campaigns = [
    {
      agency_user_id: '3f270e9b-cc2b-48a0-b82e-52fdf1094879', // Nike agency
      campaign_name: 'College Basketball Ambassadors 2024',
      brand_name: 'Nike',
      description: 'Seeking D1 basketball athletes for social media partnerships.',
      total_budget: 10000000,
      budget_per_athlete: 500000,
      target_sports: ['Basketball'],
      target_states: ['CA', 'NY', 'TX', 'FL'],
      target_school_levels: ['college'],
      min_followers: 25000,
      min_engagement_rate: 3.5,
      start_date: '2024-09-01',
      end_date: '2025-05-31',
      status: 'active',
      required_deliverables: { posts: 4, stories: 8, reels: 2 }
    },
    {
      agency_user_id: '6adbdd57-e355-4a99-9911-038726067533', // Gatorade agency
      campaign_name: 'TikTok Content Creators - Sports Edition',
      brand_name: 'Gatorade',
      description: 'Looking for athletic TikTok creators with high engagement.',
      total_budget: 5000000,
      budget_per_athlete: 250000,
      target_sports: ['Basketball', 'Volleyball', 'Soccer', 'Track'],
      target_states: ['CA', 'NY', 'FL', 'TX', 'IL'],
      target_school_levels: ['college', 'high_school'],
      min_followers: 50000,
      min_engagement_rate: 5.0,
      start_date: '2024-08-01',
      end_date: '2025-03-31',
      status: 'active',
      required_deliverables: { tiktoks: 6, instagram_reels: 3, stories: 10 }
    },
    {
      agency_user_id: 'c6c392f8-682c-45e8-8daf-fcc0b44b8cd6', // Local Business agency
      campaign_name: 'Athletes for Education',
      brand_name: 'Scholars United',
      description: 'Mission-driven campaign supporting educational access.',
      total_budget: 3000000,
      budget_per_athlete: 150000,
      target_sports: ['Basketball', 'Soccer', 'Track', 'Volleyball'],
      target_states: ['KY', 'CA', 'TX', 'FL'],
      target_school_levels: ['college'],
      min_followers: 10000,
      min_engagement_rate: 3.0,
      start_date: '2024-09-15',
      end_date: '2025-06-30',
      status: 'active',
      required_deliverables: { posts: 2, stories: 6, community_events: 1 }
    },
    {
      agency_user_id: 'a6d72510-8ec1-4821-99b8-3b08b37ec58c', // Elite Sports Management
      campaign_name: 'Local Business Ambassadors - Kentucky',
      brand_name: 'Kentucky Small Business Coalition',
      description: 'Support local Kentucky businesses through athlete partnerships.',
      total_budget: 2000000,
      budget_per_athlete: 100000,
      target_sports: ['Basketball', 'Football', 'Baseball', 'Volleyball'],
      target_states: ['KY'],
      target_school_levels: ['college', 'high_school'],
      min_followers: 5000,
      min_engagement_rate: 2.5,
      start_date: '2024-10-01',
      end_date: '2025-04-30',
      status: 'active',
      required_deliverables: { posts: 3, appearances: 2, local_events: 1 }
    },
    {
      agency_user_id: '471b4543-940f-4ade-8097-dae36e33365f', // Athlete Brand Collective
      campaign_name: 'Elite Athletes Partnership Program',
      brand_name: 'Premium Brand Collective',
      description: 'Exclusive partnerships for top-tier athletes with national reach.',
      total_budget: 30000000,
      budget_per_athlete: 1500000,
      target_sports: ['Basketball', 'Football'],
      target_states: ['CA', 'NY', 'TX', 'FL', 'IL'],
      target_school_levels: ['college'],
      min_followers: 100000,
      min_engagement_rate: 4.5,
      start_date: '2024-11-01',
      end_date: '2025-10-31',
      status: 'active',
      required_deliverables: { posts: 8, reels: 6, stories: 20, appearances: 4 }
    }
  ];

  for (const campaign of campaigns) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/agency_campaigns`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal,resolution=ignore-duplicates'
        },
        body: JSON.stringify(campaign)
      });

      if (response.ok || response.status === 409) {
        console.log(`   ✅ ${campaign.campaign_name}`);
      } else {
        const error = await response.text();
        console.log(`   ⚠️  ${campaign.campaign_name}: ${error.substring(0, 80)}`);
      }
    } catch (err: any) {
      console.log(`   ⚠️  ${campaign.campaign_name}: ${err.message}`);
    }
  }

  // 3. INSERT MATCHES
  console.log('\n3️⃣  Inserting Agency-Athlete Matches...\n');

  const matches = [
    {
      agency_id: '3f270e9b-cc2b-48a0-b82e-52fdf1094879',
      athlete_id: SARAH_ID,
      match_score: 85,
      match_reason: 'Perfect match for basketball-focused partnerships. Sarah has strong social presence (145.8K total followers) with proven engagement rate of 4.7%. D1 UCLA athlete with team leadership experience as captain.',
      status: 'pending'
    },
    {
      agency_id: '6adbdd57-e355-4a99-9911-038726067533',
      athlete_id: SARAH_ID,
      match_score: 78,
      match_reason: 'Excellent fit for digital campaigns. Outstanding TikTok presence (82.1K followers) with engagement well above platform average. California market alignment.',
      status: 'pending'
    },
    {
      agency_id: 'c6c392f8-682c-45e8-8daf-fcc0b44b8cd6',
      athlete_id: SARAH_ID,
      match_score: 72,
      match_reason: 'Great candidate for mission-driven campaigns. Academic All-American status demonstrates commitment to excellence beyond athletics.',
      status: 'pending'
    }
  ];

  for (const match of matches) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/agency_athlete_matches`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal,resolution=ignore-duplicates'
        },
        body: JSON.stringify(match)
      });

      if (response.ok || response.status === 409) {
        console.log(`   ✅ Match Score: ${match.match_score}/100`);
      } else {
        const error = await response.text();
        console.log(`   ⚠️  Match ${match.match_score}: ${error.substring(0, 80)}`);
      }
    } catch (err: any) {
      console.log(`   ⚠️  Match ${match.match_score}: ${err.message}`);
    }
  }

  // VERIFY
  console.log('\n' + '='.repeat(80));
  console.log('\n🔍 VERIFYING INSERTED DATA...\n');

  // Count NIL deals
  const nilResponse = await fetch(`${supabaseUrl}/rest/v1/nil_deals?athlete_id=eq.${SARAH_ID}&select=*`, {
    method: 'HEAD',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'count=exact'
    }
  });
  const nilCount = nilResponse.headers.get('content-range')?.split('/')[1] || '?';

  // Count campaigns
  const campaignResponse = await fetch(`${supabaseUrl}/rest/v1/agency_campaigns?status=eq.active&select=*`, {
    method: 'HEAD',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'count=exact'
    }
  });
  const campaignCount = campaignResponse.headers.get('content-range')?.split('/')[1] || '?';

  // Count matches
  const matchResponse = await fetch(`${supabaseUrl}/rest/v1/agency_athlete_matches?athlete_id=eq.${SARAH_ID}&select=*`, {
    method: 'HEAD',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'count=exact'
    }
  });
  const matchCount = matchResponse.headers.get('content-range')?.split('/')[1] || '?';

  console.log(`   📊 NIL Deals for Sarah: ${nilCount}`);
  console.log(`   📊 Active Campaigns: ${campaignCount}`);
  console.log(`   📊 Matches for Sarah: ${matchCount}`);

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ MATCHMAKING DATA INSERTION COMPLETE!\n');
  console.log('🔗 Test the features:');
  console.log('   • http://localhost:3000/athletes/sarah-johnson');
  console.log('   • http://localhost:3000/campaigns');
  console.log('   • http://localhost:3000/matches\n');
}

insertData().catch(console.error);
