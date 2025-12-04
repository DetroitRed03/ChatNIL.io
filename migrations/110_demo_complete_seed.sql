-- Migration 110: Complete Demo Seed Data
-- This migration creates comprehensive demo data for end-to-end testing
-- Run this migration to populate the database with athletes, campaigns, and relationships

BEGIN;

-- ============================================================================
-- 1. UPDATE NIKE AGENCY
-- ============================================================================

-- Complete Nike agency onboarding
UPDATE users
SET onboarding_completed = true,
    updated_at = NOW()
WHERE email = 'nike.agency@test.com';

-- ============================================================================
-- 2. CREATE ATHLETE USERS AND PROFILES
-- ============================================================================

-- Create athlete user accounts
DO $$
DECLARE
    sarah_id UUID := gen_random_uuid();
    marcus_id UUID := gen_random_uuid();
    emma_id UUID := gen_random_uuid();
    tyler_id UUID := gen_random_uuid();
    olivia_id UUID := gen_random_uuid();
BEGIN
    -- Sarah Johnson - Basketball Guard
    INSERT INTO users (
        id, email, full_name, role, username,
        onboarding_completed, created_at, updated_at
    ) VALUES (
        sarah_id,
        'sarah.johnson@demo.chatnil.io',
        'Sarah Johnson',
        'athlete',
        'sarah_johnson',
        true,
        NOW(),
        NOW()
    );

    INSERT INTO athlete_profiles (
        user_id,
        sport,
        position,
        school,
        year,
        height,
        weight,
        estimated_fmv,
        profile_photo_url,
        bio,
        achievements,
        created_at,
        updated_at
    ) VALUES (
        sarah_id,
        'Basketball',
        'Guard',
        'UCLA',
        'Junior',
        '5''9"',
        145,
        35000,
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
        'Dynamic point guard with exceptional court vision and leadership. Two-time All-Pac-12 selection averaging 18.5 PPG and 7.2 APG. Known for clutch performances and strong social media presence.',
        ARRAY['2x All-Pac-12 First Team', 'Team Captain 2024', 'Conference Player of the Week (4x)', '1,000+ Career Points'],
        NOW(),
        NOW()
    );

    -- Marcus Williams - Football Wide Receiver
    INSERT INTO users (
        id, email, full_name, role, username,
        onboarding_completed, created_at, updated_at
    ) VALUES (
        marcus_id,
        'marcus.williams@demo.chatnil.io',
        'Marcus Williams',
        'athlete',
        'marcus_williams',
        true,
        NOW(),
        NOW()
    );

    INSERT INTO athlete_profiles (
        user_id,
        sport,
        position,
        school,
        year,
        height,
        weight,
        estimated_fmv,
        profile_photo_url,
        bio,
        achievements,
        created_at,
        updated_at
    ) VALUES (
        marcus_id,
        'Football',
        'Wide Receiver',
        'Ohio State',
        'Sophomore',
        '6''2"',
        195,
        45000,
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'Elite wide receiver with explosive speed and reliable hands. Led Big Ten in receiving yards as freshman. Rising star with massive social media following and authentic engagement.',
        ARRAY['Freshman All-American', 'Big Ten Receiving Leader', '1,200+ Receiving Yards (Freshman)', 'ESPN Top 100 Recruit'],
        NOW(),
        NOW()
    );

    -- Emma Davis - Soccer Forward
    INSERT INTO users (
        id, email, full_name, role, username,
        onboarding_completed, created_at, updated_at
    ) VALUES (
        emma_id,
        'emma.davis@demo.chatnil.io',
        'Emma Davis',
        'athlete',
        'emma_davis',
        true,
        NOW(),
        NOW()
    );

    INSERT INTO athlete_profiles (
        user_id,
        sport,
        position,
        school,
        year,
        height,
        weight,
        estimated_fmv,
        profile_photo_url,
        bio,
        achievements,
        created_at,
        updated_at
    ) VALUES (
        emma_id,
        'Soccer',
        'Forward',
        'Stanford',
        'Senior',
        '5''7"',
        135,
        25000,
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        'Prolific goal scorer and team leader heading into senior season. Academic All-American with strong community involvement. Perfect fit for brands targeting student-athlete authenticity.',
        ARRAY['3x All-American', 'Hermann Trophy Semifinalist', '45 Career Goals', 'Academic All-American'],
        NOW(),
        NOW()
    );

    -- Tyler Brown - Baseball Pitcher
    INSERT INTO users (
        id, email, full_name, role, username,
        onboarding_completed, created_at, updated_at
    ) VALUES (
        tyler_id,
        'tyler.brown@demo.chatnil.io',
        'Tyler Brown',
        'athlete',
        'tyler_brown',
        true,
        NOW(),
        NOW()
    );

    INSERT INTO athlete_profiles (
        user_id,
        sport,
        position,
        school,
        year,
        height,
        weight,
        estimated_fmv,
        profile_photo_url,
        bio,
        achievements,
        created_at,
        updated_at
    ) VALUES (
        tyler_id,
        'Baseball',
        'Pitcher',
        'Florida',
        'Junior',
        '6''3"',
        205,
        20000,
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        'Hard-throwing right-hander with pro potential. Dominant strikeout numbers and consistent performance. Growing YouTube presence documenting training and game preparation.',
        ARRAY['SEC Pitcher of the Week (3x)', '150+ Career Strikeouts', '2.85 Career ERA', 'Perfect Game All-American'],
        NOW(),
        NOW()
    );

    -- Olivia Martinez - Volleyball Outside Hitter
    INSERT INTO users (
        id, email, full_name, role, username,
        onboarding_completed, created_at, updated_at
    ) VALUES (
        olivia_id,
        'olivia.martinez@demo.chatnil.io',
        'Olivia Martinez',
        'athlete',
        'olivia_martinez',
        true,
        NOW(),
        NOW()
    );

    INSERT INTO athlete_profiles (
        user_id,
        sport,
        position,
        school,
        year,
        height,
        weight,
        estimated_fmv,
        profile_photo_url,
        bio,
        achievements,
        created_at,
        updated_at
    ) VALUES (
        olivia_id,
        'Volleyball',
        'Outside Hitter',
        'Texas',
        'Sophomore',
        '6''0"',
        165,
        15000,
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        'Rising star with powerful hitting and exceptional athleticism. Breakout freshman season with All-Big 12 honors. Strong engagement with volleyball community on TikTok and Instagram.',
        ARRAY['All-Big 12 Freshman Team', '350+ Kills (Freshman)', 'Big 12 Freshman of the Year', 'AVCA All-Region'],
        NOW(),
        NOW()
    );

-- ============================================================================
-- 3. CREATE SOCIAL MEDIA STATS
-- ============================================================================

    -- Sarah Johnson - Strong presence across platforms
    INSERT INTO social_media_stats (
        user_id,
        instagram_followers,
        tiktok_followers,
        twitter_followers,
        youtube_subscribers,
        total_followers,
        engagement_rate,
        created_at,
        updated_at
    ) VALUES (
        sarah_id,
        45000,
        85000,
        18000,
        5000,
        153000,
        4.8,
        NOW(),
        NOW()
    );

    -- Marcus Williams - Highest follower count
    INSERT INTO social_media_stats (
        user_id,
        instagram_followers,
        tiktok_followers,
        twitter_followers,
        youtube_subscribers,
        total_followers,
        engagement_rate,
        created_at,
        updated_at
    ) VALUES (
        marcus_id,
        52000,
        125000,
        22000,
        8500,
        207500,
        5.2,
        NOW(),
        NOW()
    );

    -- Emma Davis - Balanced presence
    INSERT INTO social_media_stats (
        user_id,
        instagram_followers,
        tiktok_followers,
        twitter_followers,
        youtube_subscribers,
        total_followers,
        engagement_rate,
        created_at,
        updated_at
    ) VALUES (
        emma_id,
        32000,
        48000,
        12000,
        3200,
        95200,
        4.5,
        NOW(),
        NOW()
    );

    -- Tyler Brown - Growing YouTube presence
    INSERT INTO social_media_stats (
        user_id,
        instagram_followers,
        tiktok_followers,
        twitter_followers,
        youtube_subscribers,
        total_followers,
        engagement_rate,
        created_at,
        updated_at
    ) VALUES (
        tyler_id,
        28000,
        35000,
        15000,
        12000,
        90000,
        4.2,
        NOW(),
        NOW()
    );

    -- Olivia Martinez - Strong TikTok presence
    INSERT INTO social_media_stats (
        user_id,
        instagram_followers,
        tiktok_followers,
        twitter_followers,
        youtube_subscribers,
        total_followers,
        engagement_rate,
        created_at,
        updated_at
    ) VALUES (
        olivia_id,
        25000,
        65000,
        8000,
        2000,
        100000,
        5.0,
        NOW(),
        NOW()
    );

-- ============================================================================
-- 4. CREATE ACTIVE CAMPAIGNS
-- ============================================================================

    -- Get Nike agency ID
    DECLARE nike_agency_id UUID := (SELECT id FROM users WHERE email = 'nike.agency@test.com');
    DECLARE campaign1_id UUID := gen_random_uuid();
    DECLARE campaign2_id UUID := gen_random_uuid();

    -- Campaign 1: Nike Basketball Showcase
    INSERT INTO agency_campaigns (
        id,
        agency_id,
        name,
        description,
        budget,
        spent,
        status,
        start_date,
        end_date,
        target_sports,
        target_demographics,
        created_at,
        updated_at
    ) VALUES (
        campaign1_id,
        nike_agency_id,
        'Nike Basketball Showcase',
        'Showcase campaign featuring top college basketball talent. Focus on authentic content creation and social media engagement.',
        50000,
        10000,
        'active',
        NOW() - INTERVAL '30 days',
        NOW() + INTERVAL '60 days',
        ARRAY['Basketball'],
        jsonb_build_object(
            'min_followers', 20000,
            'target_schools', ARRAY['UCLA', 'Duke', 'Kentucky'],
            'preferred_positions', ARRAY['Guard', 'Forward']
        ),
        NOW(),
        NOW()
    );

    -- Campaign 2: Nike Performance Series
    INSERT INTO agency_campaigns (
        id,
        agency_id,
        name,
        description,
        budget,
        spent,
        status,
        start_date,
        end_date,
        target_sports,
        target_demographics,
        created_at,
        updated_at
    ) VALUES (
        campaign2_id,
        nike_agency_id,
        'Nike Performance Series',
        'Multi-sport performance campaign highlighting elite college athletes. Emphasis on training content and product integration.',
        100000,
        25000,
        'active',
        NOW() - INTERVAL '15 days',
        NOW() + INTERVAL '90 days',
        ARRAY['Football', 'Basketball', 'Soccer', 'Baseball'],
        jsonb_build_object(
            'min_followers', 30000,
            'engagement_rate_min', 4.0,
            'target_years', ARRAY['Sophomore', 'Junior']
        ),
        NOW(),
        NOW()
    );

-- ============================================================================
-- 5. CREATE CAMPAIGN ATHLETE ASSIGNMENTS
-- ============================================================================

    -- Check if campaign_athletes table exists, create if needed
    CREATE TABLE IF NOT EXISTS campaign_athletes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES agency_campaigns(id) ON DELETE CASCADE,
        athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        deal_value DECIMAL(10, 2),
        deliverables JSONB,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(campaign_id, athlete_id)
    );

    -- Assign Sarah Johnson to Basketball Showcase
    INSERT INTO campaign_athletes (
        campaign_id,
        athlete_id,
        status,
        deal_value,
        deliverables,
        notes,
        created_at,
        updated_at
    ) VALUES (
        campaign1_id,
        sarah_id,
        'active',
        15000,
        jsonb_build_object(
            'social_posts', 8,
            'story_mentions', 12,
            'product_appearances', 4,
            'video_content', 2
        ),
        'Lead athlete for campaign. Excellent engagement and content quality.',
        NOW(),
        NOW()
    );

    -- Assign Marcus Williams to Performance Series
    INSERT INTO campaign_athletes (
        campaign_id,
        athlete_id,
        status,
        deal_value,
        deliverables,
        notes,
        created_at,
        updated_at
    ) VALUES (
        campaign2_id,
        marcus_id,
        'active',
        20000,
        jsonb_build_object(
            'social_posts', 10,
            'training_videos', 4,
            'product_reviews', 2,
            'live_streams', 2
        ),
        'Highest-profile athlete in campaign. Strong social media performance.',
        NOW(),
        NOW()
    );

-- ============================================================================
-- 6. CREATE AGENCY-ATHLETE MATCHES
-- ============================================================================

    -- Create matches for Nike with all 5 athletes
    INSERT INTO agency_athlete_matches (
        agency_id,
        athlete_id,
        match_score,
        match_tier,
        match_reasons,
        status,
        created_at,
        updated_at
    ) VALUES
    -- Sarah Johnson - Top match
    (
        nike_agency_id,
        sarah_id,
        92,
        'excellent',
        ARRAY[
            'Strong social media presence (153K followers)',
            'High engagement rate (4.8%)',
            'Excellent athletic achievements',
            'Perfect demographic fit for basketball campaigns'
        ],
        'active',
        NOW(),
        NOW()
    ),
    -- Marcus Williams - Top match
    (
        nike_agency_id,
        marcus_id,
        95,
        'excellent',
        ARRAY[
            'Highest follower count (207K)',
            'Elite athletic performance',
            'Strong engagement metrics (5.2%)',
            'Rising star with massive growth potential'
        ],
        'active',
        NOW(),
        NOW()
    ),
    -- Emma Davis - Good match
    (
        nike_agency_id,
        emma_id,
        85,
        'good',
        ARRAY[
            'Academic All-American appeal',
            'Strong community involvement',
            'Consistent athletic performance',
            'Authentic social presence'
        ],
        'new',
        NOW(),
        NOW()
    ),
    -- Tyler Brown - Good match
    (
        nike_agency_id,
        tyler_id,
        82,
        'good',
        ARRAY[
            'Growing YouTube presence',
            'Pro potential increases brand value',
            'Unique training content opportunity',
            'Strong male demographic appeal'
        ],
        'new',
        NOW(),
        NOW()
    ),
    -- Olivia Martinez - Potential match
    (
        nike_agency_id,
        olivia_id,
        78,
        'potential',
        ARRAY[
            'High TikTok engagement',
            'Rising sophomore star',
            'Strong volleyball community connection',
            'Growth trajectory favorable'
        ],
        'new',
        NOW(),
        NOW()
    );

-- ============================================================================
-- 7. CREATE SAVED ATHLETES LIST
-- ============================================================================

    -- Check if agency_athlete_lists table exists, create if needed
    CREATE TABLE IF NOT EXISTS agency_athlete_lists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        athlete_ids UUID[] DEFAULT ARRAY[]::UUID[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create saved list for Nike with top athletes
    INSERT INTO agency_athlete_lists (
        agency_id,
        name,
        description,
        athlete_ids,
        created_at,
        updated_at
    ) VALUES (
        nike_agency_id,
        'Top Prospects Q4 2024',
        'High-priority athletes for upcoming campaigns',
        ARRAY[sarah_id, marcus_id],
        NOW(),
        NOW()
    );

-- ============================================================================
-- 8. CREATE MESSAGE THREADS
-- ============================================================================

    -- Check if agency_message_threads table exists, create if needed
    CREATE TABLE IF NOT EXISTS agency_message_threads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agency_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        athlete_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'unread',
        last_message TEXT,
        last_message_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(agency_id, athlete_id)
    );

    -- Thread with Sarah Johnson (active conversation)
    INSERT INTO agency_message_threads (
        agency_id,
        athlete_id,
        status,
        last_message,
        last_message_at,
        created_at,
        updated_at
    ) VALUES (
        nike_agency_id,
        sarah_id,
        'active',
        'Thanks for the details! I''m really excited about this opportunity. When can we schedule a call to discuss next steps?',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '2 hours'
    );

    -- Thread with Marcus Williams (new/unread)
    INSERT INTO agency_message_threads (
        agency_id,
        athlete_id,
        status,
        last_message,
        last_message_at,
        created_at,
        updated_at
    ) VALUES (
        nike_agency_id,
        marcus_id,
        'unread',
        'Hi Marcus, we''re impressed with your performance this season. We''d love to discuss a potential partnership opportunity with Nike.',
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '6 hours',
        NOW() - INTERVAL '6 hours'
    );

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify athletes created
SELECT
    'Athletes Created' as check_type,
    COUNT(*) as count,
    STRING_AGG(full_name, ', ') as names
FROM users
WHERE role = 'athlete'
  AND email LIKE '%@demo.chatnil.io';

-- Verify athlete profiles
SELECT
    'Athlete Profiles' as check_type,
    COUNT(*) as count,
    STRING_AGG(sport || ' - ' || school, ', ') as details
FROM athlete_profiles ap
JOIN users u ON ap.user_id = u.id
WHERE u.email LIKE '%@demo.chatnil.io';

-- Verify social media stats
SELECT
    'Social Media Stats' as check_type,
    COUNT(*) as count,
    ROUND(AVG(total_followers)) as avg_followers,
    ROUND(AVG(engagement_rate), 2) as avg_engagement
FROM social_media_stats sms
JOIN users u ON sms.user_id = u.id
WHERE u.email LIKE '%@demo.chatnil.io';

-- Verify campaigns
SELECT
    'Campaigns Created' as check_type,
    COUNT(*) as count,
    STRING_AGG(name, ', ') as campaign_names,
    SUM(budget) as total_budget,
    SUM(spent) as total_spent
FROM agency_campaigns
WHERE agency_id = (SELECT id FROM users WHERE email = 'nike.agency@test.com');

-- Verify campaign assignments
SELECT
    'Campaign Assignments' as check_type,
    COUNT(*) as count,
    SUM(deal_value) as total_deal_value
FROM campaign_athletes
WHERE campaign_id IN (
    SELECT id FROM agency_campaigns
    WHERE agency_id = (SELECT id FROM users WHERE email = 'nike.agency@test.com')
);

-- Verify matches
SELECT
    'Agency Matches' as check_type,
    COUNT(*) as count,
    STRING_AGG(match_tier, ', ') as tiers,
    ROUND(AVG(match_score)) as avg_score
FROM agency_athlete_matches
WHERE agency_id = (SELECT id FROM users WHERE email = 'nike.agency@test.com');

-- Verify saved lists
SELECT
    'Saved Lists' as check_type,
    COUNT(*) as count,
    ARRAY_LENGTH(athlete_ids, 1) as athletes_in_list
FROM agency_athlete_lists
WHERE agency_id = (SELECT id FROM users WHERE email = 'nike.agency@test.com');

-- Verify message threads
SELECT
    'Message Threads' as check_type,
    COUNT(*) as count,
    STRING_AGG(status, ', ') as statuses
FROM agency_message_threads
WHERE agency_id = (SELECT id FROM users WHERE email = 'nike.agency@test.com');

-- Final summary
SELECT
    'MIGRATION SUMMARY' as summary,
    (SELECT COUNT(*) FROM users WHERE role = 'athlete' AND email LIKE '%@demo.chatnil.io') as athletes,
    (SELECT COUNT(*) FROM agency_campaigns WHERE agency_id = (SELECT id FROM users WHERE email = 'nike.agency@test.com')) as campaigns,
    (SELECT COUNT(*) FROM agency_athlete_matches WHERE agency_id = (SELECT id FROM users WHERE email = 'nike.agency@test.com')) as matches,
    (SELECT COUNT(*) FROM agency_message_threads WHERE agency_id = (SELECT id FROM users WHERE email = 'nike.agency@test.com')) as threads;

COMMIT;
