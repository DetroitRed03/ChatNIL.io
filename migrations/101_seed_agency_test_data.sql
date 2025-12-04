-- ============================================================================
-- Migration 101: Seed Agency Dashboard Test Data
-- ============================================================================
-- This migration creates test data for the agency dashboard
-- Run this via Supabase SQL Editor

-- Step 1: Insert test agency (using existing auth user)
INSERT INTO public.agencies (
  id,
  company_name,
  agency_type,
  industry,
  company_size,
  website,
  description,
  created_at,
  updated_at
) VALUES (
  '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
  'Elite Sports Marketing',
  'full_service',
  'Sports & Entertainment',
  'medium',
  'https://elitesportsmarketing.com',
  'Premier NIL representation agency specializing in college athlete partnerships',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  updated_at = NOW();

-- Step 2: Create test campaigns
INSERT INTO public.campaigns (
  agency_id,
  name,
  description,
  status,
  campaign_type,
  start_date,
  end_date,
  total_budget,
  spent_budget,
  total_impressions,
  total_engagement,
  avg_engagement_rate,
  roi_percentage,
  created_at,
  updated_at
) VALUES
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'Spring Football Campaign 2024',
    'Multi-athlete social media push for spring football season',
    'active',
    'social_media',
    '2024-03-01',
    '2024-05-31',
    50000,
    28000,
    425000,
    18900,
    4.45,
    180,
    NOW(),
    NOW()
  ),
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'Basketball Elite Series',
    'Premium basketball athlete partnerships',
    'active',
    'endorsement',
    '2024-02-15',
    '2024-06-15',
    75000,
    52000,
    680000,
    30600,
    4.5,
    210,
    NOW(),
    NOW()
  ),
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'Summer Training Camp Promo',
    'Cross-sport summer training camp promotion',
    'pending',
    'event',
    '2024-06-01',
    '2024-08-31',
    30000,
    0,
    0,
    0,
    0,
    0,
    NOW(),
    NOW()
  ),
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'Winter Sports Apparel Launch',
    'New apparel line launch with winter sports athletes',
    'completed',
    'product_launch',
    '2023-11-01',
    '2024-01-31',
    45000,
    45000,
    520000,
    22880,
    4.4,
    195,
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Step 3: Get some athlete IDs from existing athlete_profiles
DO $$
DECLARE
  v_campaign_id_1 UUID;
  v_campaign_id_2 UUID;
  v_athlete_ids UUID[];
BEGIN
  -- Get the campaign IDs we just created
  SELECT id INTO v_campaign_id_1
  FROM public.campaigns
  WHERE name = 'Spring Football Campaign 2024'
  LIMIT 1;

  SELECT id INTO v_campaign_id_2
  FROM public.campaigns
  WHERE name = 'Basketball Elite Series'
  LIMIT 1;

  -- Get some athlete IDs
  SELECT ARRAY_AGG(user_id) INTO v_athlete_ids
  FROM (
    SELECT user_id
    FROM public.athlete_profiles
    WHERE verified = true
    LIMIT 5
  ) athletes;

  -- Only proceed if we have athletes
  IF array_length(v_athlete_ids, 1) > 0 AND v_campaign_id_1 IS NOT NULL THEN
    -- Assign athletes to Spring Football Campaign
    FOR i IN 1..LEAST(3, array_length(v_athlete_ids, 1))
    LOOP
      INSERT INTO public.campaign_athletes (
        campaign_id,
        athlete_id,
        status,
        contract_value,
        performance_bonus,
        deliverables,
        impressions,
        engagement,
        engagement_rate,
        clicks,
        conversions,
        created_at,
        updated_at
      ) VALUES (
        v_campaign_id_1,
        v_athlete_ids[i],
        'active',
        5000 + (i * 1000),
        1000 + (i * 500),
        jsonb_build_object('posts', 10, 'stories', 20, 'videos', 3),
        50000 + (i * 10000),
        2000 + (i * 500),
        (2 + (i * 0.5))::numeric,
        500 + (i * 100),
        20 + (i * 10),
        NOW(),
        NOW()
      ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Assign athletes to Basketball Elite Series
    FOR i IN 1..LEAST(3, array_length(v_athlete_ids, 1))
    LOOP
      INSERT INTO public.campaign_athletes (
        campaign_id,
        athlete_id,
        status,
        contract_value,
        performance_bonus,
        deliverables,
        impressions,
        engagement,
        engagement_rate,
        clicks,
        conversions,
        created_at,
        updated_at
      ) VALUES (
        v_campaign_id_2,
        v_athlete_ids[i],
        'active',
        8000 + (i * 1500),
        2000 + (i * 500),
        jsonb_build_object('posts', 15, 'stories', 25, 'videos', 5),
        75000 + (i * 15000),
        3500 + (i * 750),
        (3 + (i * 0.5))::numeric,
        800 + (i * 150),
        35 + (i * 15),
        NOW(),
        NOW()
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Step 4: Create budget allocation
INSERT INTO public.agency_budget_allocations (
  agency_id,
  period_start,
  period_end,
  total_budget,
  allocated_budget,
  spent_budget,
  categories,
  created_at,
  updated_at
) VALUES (
  '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
  '2024-01-01',
  '2024-12-31',
  250000,
  200000,
  125000,
  jsonb_build_object(
    'social_media', 80000,
    'endorsements', 75000,
    'events', 30000,
    'product_launches', 45000,
    'misc', 20000
  ),
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Step 5: Create activity log entries
INSERT INTO public.agency_activity_log (
  agency_id,
  activity_type,
  title,
  description,
  metadata,
  created_at
) VALUES
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'campaign_created',
    'New Campaign Created',
    'Spring Football Campaign 2024 has been created',
    jsonb_build_object('campaign_id', (SELECT id FROM public.campaigns WHERE name = 'Spring Football Campaign 2024' LIMIT 1)),
    NOW() - INTERVAL '2 hours'
  ),
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'athlete_added',
    'Athletes Added',
    'Added 3 athletes to Basketball Elite Series',
    jsonb_build_object('campaign_id', (SELECT id FROM public.campaigns WHERE name = 'Basketball Elite Series' LIMIT 1), 'count', 3),
    NOW() - INTERVAL '5 hours'
  ),
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'campaign_milestone',
    'Campaign Milestone Reached',
    'Spring Football Campaign reached 400K impressions',
    jsonb_build_object('campaign_id', (SELECT id FROM public.campaigns WHERE name = 'Spring Football Campaign 2024' LIMIT 1), 'milestone', 'impressions_400k'),
    NOW() - INTERVAL '1 day'
  ),
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'budget_updated',
    'Budget Updated',
    'Q1 2024 budget allocation updated',
    jsonb_build_object('amount', 250000),
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT DO NOTHING;

-- Step 6: Create pending actions
INSERT INTO public.agency_pending_actions (
  agency_id,
  action_type,
  title,
  description,
  priority,
  due_date,
  status,
  metadata,
  created_at,
  updated_at
) VALUES
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'review_contract',
    'Review Contract',
    'Review and approve contract for new athlete in Spring Campaign',
    'high',
    (CURRENT_DATE + INTERVAL '2 days')::date,
    'pending',
    jsonb_build_object('campaign_id', (SELECT id FROM public.campaigns WHERE name = 'Spring Football Campaign 2024' LIMIT 1)),
    NOW(),
    NOW()
  ),
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'approve_content',
    'Approve Content',
    'Approve athlete social media content for Basketball Elite Series',
    'medium',
    (CURRENT_DATE + INTERVAL '5 days')::date,
    'pending',
    jsonb_build_object('campaign_id', (SELECT id FROM public.campaigns WHERE name = 'Basketball Elite Series' LIMIT 1)),
    NOW(),
    NOW()
  ),
  (
    '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid,
    'review_metrics',
    'Review Campaign Metrics',
    'Weekly review of Spring Football Campaign performance',
    'medium',
    (CURRENT_DATE + INTERVAL '3 days')::date,
    'pending',
    jsonb_build_object('campaign_id', (SELECT id FROM public.campaigns WHERE name = 'Spring Football Campaign 2024' LIMIT 1)),
    NOW(),
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Verification query
SELECT
  'Agencies' as table_name,
  COUNT(*) as row_count
FROM public.agencies
WHERE id = '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid
UNION ALL
SELECT 'Campaigns', COUNT(*)
FROM public.campaigns
WHERE agency_id = '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid
UNION ALL
SELECT 'Campaign Athletes', COUNT(*)
FROM public.campaign_athletes ca
JOIN public.campaigns c ON c.id = ca.campaign_id
WHERE c.agency_id = '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid
UNION ALL
SELECT 'Budget Allocations', COUNT(*)
FROM public.agency_budget_allocations
WHERE agency_id = '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid
UNION ALL
SELECT 'Activity Log', COUNT(*)
FROM public.agency_activity_log
WHERE agency_id = '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid
UNION ALL
SELECT 'Pending Actions', COUNT(*)
FROM public.agency_pending_actions
WHERE agency_id = '28f1070c-b398-4da0-a81a-921e7de352e0'::uuid;
