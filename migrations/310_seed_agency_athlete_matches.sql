-- ============================================================================
-- Migration 310: Seed Agency-Athlete Matches for Nike Agency
-- ============================================================================
-- Seeds match data for athletes NOT already saved to Nike's roster
-- This populates the Live Match Updates widget with unique matches
-- ============================================================================

-- Insert match for Stanford Volleyball athlete (NOT in Nike's saved roster)
INSERT INTO agency_athlete_matches (
  agency_id,
  athlete_id,
  match_score,
  score_breakdown,
  match_reason,
  match_highlights,
  status,
  algorithm_version,
  created_at
)
SELECT
  '3f270e9b-cc2b-48a0-b82e-52fdf1094879' as agency_id,
  ap.user_id as athlete_id,
  82 as match_score,
  '{
    "brand_values": 17,
    "interests": 16,
    "campaign_fit": 13,
    "budget": 12,
    "geography": 9,
    "demographics": 8,
    "engagement": 7
  }'::jsonb as score_breakdown,
  'Strong match based on sport engagement and regional market alignment. Volleyball athletes show high engagement rates and Stanford''s athletic program has significant brand recognition.' as match_reason,
  '["Strong engagement in target demographic", "Regional market alignment (West Coast)", "High academic reputation appeal"]'::jsonb as match_highlights,
  'suggested' as status,
  'v1.0' as algorithm_version,
  NOW() - INTERVAL '2 days' as created_at
FROM athlete_profiles ap
WHERE ap.user_id = '49031d94-342e-404f-8f7e-c1e9f9b3956e'
AND NOT EXISTS (
  SELECT 1 FROM agency_athlete_matches
  WHERE agency_id = '3f270e9b-cc2b-48a0-b82e-52fdf1094879'
  AND athlete_id = ap.user_id
)
ON CONFLICT (agency_id, athlete_id) DO NOTHING;

-- Also seed matches for any other athletes not in Nike's saved list
INSERT INTO agency_athlete_matches (
  agency_id,
  athlete_id,
  match_score,
  score_breakdown,
  match_reason,
  match_highlights,
  status,
  algorithm_version,
  created_at
)
SELECT
  '3f270e9b-cc2b-48a0-b82e-52fdf1094879' as agency_id,
  ap.user_id as athlete_id,
  CASE
    WHEN random() > 0.6 THEN 75 + floor(random() * 20)::int  -- High match (75-94)
    WHEN random() > 0.3 THEN 55 + floor(random() * 20)::int  -- Good match (55-74)
    ELSE 35 + floor(random() * 20)::int                       -- Potential match (35-54)
  END as match_score,
  jsonb_build_object(
    'brand_values', 12 + floor(random() * 8)::int,
    'interests', 12 + floor(random() * 8)::int,
    'campaign_fit', 10 + floor(random() * 5)::int,
    'budget', 10 + floor(random() * 5)::int,
    'geography', 6 + floor(random() * 4)::int,
    'demographics', 6 + floor(random() * 4)::int,
    'engagement', 6 + floor(random() * 4)::int
  ) as score_breakdown,
  'Potential partnership opportunity based on athlete profile and engagement metrics.' as match_reason,
  '["Good audience engagement", "Target demographic fit", "Brand alignment potential"]'::jsonb as match_highlights,
  'suggested' as status,
  'v1.0' as algorithm_version,
  NOW() - (random() * INTERVAL '7 days') as created_at
FROM athlete_profiles ap
WHERE ap.user_id NOT IN (
  -- Exclude athletes already in Nike's saved roster
  SELECT athlete_id FROM agency_athlete_lists
  WHERE agency_id = '3f270e9b-cc2b-48a0-b82e-52fdf1094879'
)
AND NOT EXISTS (
  -- Exclude athletes already matched
  SELECT 1 FROM agency_athlete_matches
  WHERE agency_id = '3f270e9b-cc2b-48a0-b82e-52fdf1094879'
  AND athlete_id = ap.user_id
);

-- Verification
SELECT
  'Migration 310 completed!' as status,
  COUNT(*) as matches_created,
  ROUND(AVG(match_score)) as avg_score
FROM agency_athlete_matches
WHERE agency_id = '3f270e9b-cc2b-48a0-b82e-52fdf1094879';
