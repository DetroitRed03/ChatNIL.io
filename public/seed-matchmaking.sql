
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
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    'Nike',
    'social_media',
    'completed',
    1500,
    '2024-06-15',
    'Instagram post promoting Nike Basketball shoes with behind-the-scenes training content',
    true
  ),
  (
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    'Gatorade',
    'content_creation',
    'completed',
    2000,
    '2024-07-20',
    'TikTok video series featuring hydration tips and game-day preparation',
    true
  ),
  (
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
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
    '3f270e9b-cc2b-48a0-b82e-52fdf1094879',
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
    '6adbdd57-e355-4a99-9911-038726067533',
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
    'c6c392f8-682c-45e8-8daf-fcc0b44b8cd6',
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
    'a6d72510-8ec1-4821-99b8-3b08b37ec58c',
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
    '471b4543-940f-4ade-8097-dae36e33365f',
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
    '3f270e9b-cc2b-48a0-b82e-52fdf1094879',
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    85,
    'Perfect match for basketball-focused partnerships. Sarah has strong social presence (145.8K total followers) with proven engagement rate of 4.7%. D1 UCLA athlete with team leadership experience as captain. Portfolio shows high-quality content creation.',
    'pending'
  ),

  -- Match 2: Digital specialist (78/100)
  (
    '6adbdd57-e355-4a99-9911-038726067533',
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    78,
    'Excellent fit for digital campaigns. Outstanding TikTok presence (82.1K followers) with engagement well above platform average. California market alignment. Strong content creation portfolio (6 featured items). Proven brand partnership experience.',
    'pending'
  ),

  -- Match 3: Mission-driven (72/100)
  (
    'c6c392f8-682c-45e8-8daf-fcc0b44b8cd6',
    'ca05429a-0f32-4280-8b71-99dc5baee0dc',
    72,
    'Great candidate for mission-driven campaigns. Academic All-American status demonstrates commitment to excellence beyond athletics. Team captain leadership aligns with advocacy goals. Growing social media presence provides reach for educational messaging.',
    'pending'
  )
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT
  'Seeding completed!' as status,
  (SELECT COUNT(*) FROM public.nil_deals WHERE athlete_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc') as nil_deals_count,
  (SELECT COUNT(*) FROM public.agency_campaigns WHERE status = 'active') as active_campaigns_count,
  (SELECT COUNT(*) FROM public.agency_athlete_matches WHERE athlete_id = 'ca05429a-0f32-4280-8b71-99dc5baee0dc') as sarah_matches_count;
  