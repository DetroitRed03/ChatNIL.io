-- Insert match for Emily Chen (new athlete not in saved roster)
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
  '["Strong engagement in target demographic", "Regional market alignment (West Coast)", "Academic reputation"]'::jsonb,
  NOW() - INTERVAL '1 day'
) ON CONFLICT (agency_id, athlete_id) DO NOTHING;

-- Verify
SELECT
  m.athlete_id,
  u.first_name,
  u.last_name,
  m.match_score,
  m.tier,
  m.status
FROM agency_athlete_matches m
JOIN users u ON u.id = m.athlete_id
WHERE m.agency_id = '3f270e9b-cc2b-48a0-b82e-52fdf1094879';
