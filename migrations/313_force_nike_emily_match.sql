-- Force insert match for Emily Chen for Nike Agency
-- First delete any existing match to avoid constraint issues
DELETE FROM agency_athlete_matches
WHERE agency_id = '3f270e9b-cc2b-48a0-b82e-52fdf1094879'
AND athlete_id = '49031d94-342e-404f-8f7e-c1e9f9b3956e';

-- Now insert the match
INSERT INTO agency_athlete_matches (
  agency_id,
  athlete_id,
  match_score,
  tier,
  status,
  match_reasons,
  created_at
) VALUES (
  '3f270e9b-cc2b-48a0-b82e-52fdf1094879',
  '49031d94-342e-404f-8f7e-c1e9f9b3956e',
  82,
  'high',
  'suggested',
  '["Strong engagement in target demographic", "Regional market alignment (West Coast)", "High academic reputation appeal", "Volleyball rising star potential"]'::jsonb,
  NOW() - INTERVAL '2 days'
);

-- Verify
SELECT
  'Nike Agency Matches' as context,
  m.athlete_id,
  u.first_name,
  u.last_name,
  m.match_score,
  m.tier
FROM agency_athlete_matches m
JOIN users u ON u.id = m.athlete_id
WHERE m.agency_id = '3f270e9b-cc2b-48a0-b82e-52fdf1094879';
