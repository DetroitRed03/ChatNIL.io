import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMatchmakingData() {
  console.log('🌱 SEEDING MATCHMAKING DATA\n');
  console.log('='.repeat(80));

  // Get Sarah's ID
  const { data: sarah } = await supabase
    .from('athlete_profiles')
    .select('user_id')
    .eq('username', 'sarah-johnson')
    .single();

  if (!sarah) {
    console.error('\n❌ Sarah not found');
    return;
  }

  const sarahId = sarah.user_id;
  console.log(`\n✅ Sarah ID: ${sarahId}`);

  // Get ALL agencies
  const { data: allAgencies } = await supabase
    .from('agencies')
    .select('id, company_name, agency_type');

  if (!allAgencies || allAgencies.length === 0) {
    console.error('\n❌ No agencies found');
    return;
  }

  console.log(`✅ Found ${allAgencies.length} agencies:`);
  allAgencies.forEach(a => {
    console.log(`   • ${a.company_name} (${a.id})`);
  });

  // Use first 5 agencies for campaigns
  const agency1 = allAgencies[0];
  const agency2 = allAgencies[1] || allAgencies[0];
  const agency3 = allAgencies[2] || allAgencies[0];
  const agency4 = allAgencies[3] || allAgencies[0];
  const agency5 = allAgencies[4] || allAgencies[0];

  // SQL to insert data directly
  const sql = `
-- ====================================================================================
-- CHATNIL MATCHMAKING DATA SEEDING
-- ====================================================================================
-- This SQL file seeds Priority 1 & 2 data for the matchmaking system:
-- • 3 NIL Deals for Sarah Johnson
-- • 5 Active Campaigns from agencies
-- • 3 Agency-Athlete Matches for Sarah
-- ====================================================================================

-- 1. INSERT NIL DEALS FOR SARAH JOHNSON
-- Sarah has completed 2 deals and has 1 active brand ambassador partnership
INSERT INTO public.nil_deals (
  athlete_id,
  brand_name,
  deal_type,
  status,
  compensation_amount,
  deal_date,
  description,
  is_public
)
VALUES
  (
    '${sarahId}',
    'Nike',
    'social_media',
    'completed',
    1500,
    '2024-06-15',
    'Instagram post promoting Nike Basketball shoes with behind-the-scenes training content',
    true
  ),
  (
    '${sarahId}',
    'Gatorade',
    'content_creation',
    'completed',
    2000,
    '2024-07-20',
    'TikTok video series featuring hydration tips and game-day preparation',
    true
  ),
  (
    '${sarahId}',
    'Local Sporting Goods Store',
    'brand_ambassador',
    'active',
    5000,
    '2024-08-01',
    'Monthly brand ambassador with in-store appearances, social media posts, and community events',
    true
  )
ON CONFLICT DO NOTHING;

-- 2. INSERT ACTIVE CAMPAIGNS FROM AGENCIES
-- These campaigns match Sarah's profile and demonstrate the matchmaking engine
INSERT INTO public.agency_campaigns (
  agency_user_id,
  campaign_name,
  brand_name,
  description,
  total_budget,
  budget_per_athlete,
  target_sports,
  target_states,
  target_school_levels,
  min_followers,
  min_engagement_rate,
  start_date,
  end_date,
  status,
  required_deliverables
)
VALUES
  -- Campaign 1: Nike Basketball (matches Sarah perfectly)
  (
    '${agency1.id}',
    'College Basketball Ambassadors 2024',
    'Nike',
    'Seeking D1 basketball athletes for social media partnerships. Focus on authentic content creation and brand ambassadorship.',
    10000000,  -- $100,000 total budget
    500000,    -- $5,000 per athlete
    ARRAY['Basketball']::text[],
    ARRAY['CA', 'NY', 'TX', 'FL']::text[],
    ARRAY['college']::text[],
    25000,  -- Min followers
    3.5,    -- Min engagement rate
    '2024-09-01',
    '2025-05-31',
    'active',
    '{"posts": 4, "stories": 8, "reels": 2}'::jsonb
  ),

  -- Campaign 2: Gatorade TikTok (Sarah excels here)
  (
    '${agency2.id}',
    'TikTok Content Creators - Sports Edition',
    'Gatorade',
    'Looking for athletic TikTok creators with high engagement. Must be comfortable creating lifestyle and training content.',
    5000000,   -- $50,000
    250000,    -- $2,500 per athlete
    ARRAY['Basketball', 'Volleyball', 'Soccer', 'Track']::text[],
    ARRAY['CA', 'NY', 'FL', 'TX', 'IL']::text[],
    ARRAY['college', 'high_school']::text[],
    50000,  -- Min followers (Sarah has 82K on TikTok)
    5.0,    -- Min engagement
    '2024-08-01',
    '2025-03-31',
    'active',
    '{"tiktoks": 6, "instagram_reels": 3, "stories": 10}'::jsonb
  ),

  -- Campaign 3: Mission-driven (fits Sarah's Academic All-American status)
  (
    '${agency3.id}',
    'Athletes for Education',
    'Scholars United',
    'Mission-driven campaign supporting educational access through athlete advocacy.',
    3000000,   -- $30,000
    150000,    -- $1,500 per athlete
    ARRAY['Basketball', 'Soccer', 'Track', 'Volleyball']::text[],
    ARRAY['KY', 'CA', 'TX', 'FL']::text[],
    ARRAY['college']::text[],
    10000,  -- Min followers
    3.0,    -- Min engagement
    '2024-09-15',
    '2025-06-30',
    'active',
    '{"posts": 2, "stories": 6, "community_events": 1}'::jsonb
  ),

  -- Campaign 4: Local Kentucky businesses
  (
    '${agency4.id}',
    'Local Business Ambassadors - Kentucky',
    'Kentucky Small Business Coalition',
    'Support local Kentucky businesses through authentic athlete partnerships.',
    2000000,   -- $20,000
    100000,    -- $1,000 per athlete
    ARRAY['Basketball', 'Football', 'Baseball', 'Volleyball']::text[],
    ARRAY['KY']::text[],
    ARRAY['college', 'high_school']::text[],
    5000,   -- Min followers
    2.5,    -- Min engagement
    '2024-10-01',
    '2025-04-30',
    'active',
    '{"posts": 3, "appearances": 2, "local_events": 1}'::jsonb
  ),

  -- Campaign 5: Premium tier (stretch goal for Sarah)
  (
    '${agency5.id}',
    'Elite Athletes Partnership Program',
    'Premium Brand Collective',
    'Exclusive partnerships for top-tier athletes with national reach.',
    30000000,  -- $300,000
    1500000,   -- $15,000 per athlete
    ARRAY['Basketball', 'Football']::text[],
    ARRAY['CA', 'NY', 'TX', 'FL', 'IL']::text[],
    ARRAY['college']::text[],
    100000, -- Min followers (Sarah at 145K total)
    4.5,    -- Min engagement (Sarah at 4.7%)
    '2024-11-01',
    '2025-10-31',
    'active',
    '{"posts": 8, "reels": 6, "stories": 20, "appearances": 4}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- 3. INSERT AGENCY-ATHLETE MATCHES FOR SARAH
-- These show the matchmaking engine's AI-powered match scores and reasoning
INSERT INTO public.agency_athlete_matches (
  agency_id,
  athlete_id,
  match_score,
  match_reason,
  status
)
VALUES
  -- Match 1: Elite fit (85/100)
  (
    '${agency1.id}',
    '${sarahId}',
    85,
    'Perfect match for basketball-focused partnerships. Sarah has strong social presence (145.8K total followers) with proven engagement rate of 4.7%. D1 UCLA athlete with team leadership experience as captain. Portfolio shows high-quality content creation.',
    'pending'
  ),

  -- Match 2: Digital specialist (78/100)
  (
    '${agency2.id}',
    '${sarahId}',
    78,
    'Excellent fit for digital campaigns. Outstanding TikTok presence (82.1K followers) with engagement well above platform average. California market alignment. Strong content creation portfolio (6 featured items). Proven brand partnership experience.',
    'pending'
  ),

  -- Match 3: Mission-driven (72/100)
  (
    '${agency3.id}',
    '${sarahId}',
    72,
    'Great candidate for mission-driven campaigns. Academic All-American status demonstrates commitment to excellence beyond athletics. Team captain leadership aligns with advocacy goals. Growing social media presence provides reach for educational messaging.',
    'pending'
  )
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT
  'Seeding completed!' as status,
  (SELECT COUNT(*) FROM public.nil_deals WHERE athlete_id = '${sarahId}') as nil_deals_count,
  (SELECT COUNT(*) FROM public.agency_campaigns WHERE status = 'active') as active_campaigns_count,
  (SELECT COUNT(*) FROM public.agency_athlete_matches WHERE athlete_id = '${sarahId}') as sarah_matches_count;
  `;

  // Save SQL to file for manual execution
  const sqlPath = join(process.cwd(), 'public', 'seed-matchmaking.sql');
  writeFileSync(sqlPath, sql);

  console.log(`\n📝 SQL file saved to: public/seed-matchmaking.sql`);
  console.log('\n' + '='.repeat(80));
  console.log('\n📋 TO APPLY THIS DATA:\n');
  console.log('Option 1: Supabase Dashboard');
  console.log('  1. Open https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql');
  console.log('  2. Copy/paste the SQL from public/seed-matchmaking.sql');
  console.log('  3. Click "Run"\n');

  console.log('Option 2: Open in browser');
  console.log('  1. Visit http://localhost:3000/seed-matchmaking.sql');
  console.log('  2. Copy the SQL');
  console.log('  3. Run in Supabase SQL Editor\n');

  console.log('='.repeat(80));
  console.log('\n✅ SCRIPT COMPLETE');
  console.log('\n📊 This will create:');
  console.log('   • 3 NIL Deals for Sarah ($8,500 total)');
  console.log('   • 5 Active Campaigns');
  console.log('   • 3 Agency-Athlete Matches (scores: 85, 78, 72)');
  console.log('\n');
}

seedMatchmakingData();
