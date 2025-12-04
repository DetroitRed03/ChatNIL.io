-- Migration 029: Seed Sample FMV Data for Testing
-- Creates realistic test data for FMV system demonstration and testing
--
-- NOTE: This is sample data only. In production, actual FMV scores
-- should only be generated through the calculation API.

-- Helper function to generate sample FMV data
CREATE OR REPLACE FUNCTION generate_sample_fmv_data()
RETURNS void AS $$
DECLARE
  v_athlete_id UUID;
  v_fmv_score INTEGER;
  v_tier fmv_tier;
  v_social_score INTEGER;
  v_athletic_score INTEGER;
  v_market_score INTEGER;
  v_brand_score INTEGER;
BEGIN
  RAISE NOTICE '🔄 Generating sample FMV data...';

  -- Get sample athletes (first 20 athletes from users table)
  FOR v_athlete_id IN (
    SELECT id FROM users WHERE role = 'athlete' ORDER BY created_at LIMIT 20
  ) LOOP
    -- Generate randomized but realistic scores
    v_social_score := (RANDOM() * 30)::INTEGER;  -- 0-30
    v_athletic_score := (RANDOM() * 30)::INTEGER; -- 0-30
    v_market_score := (RANDOM() * 20)::INTEGER;   -- 0-20
    v_brand_score := (RANDOM() * 20)::INTEGER;    -- 0-20

    v_fmv_score := v_social_score + v_athletic_score + v_market_score + v_brand_score;

    -- Determine tier
    IF v_fmv_score >= 80 THEN
      v_tier := 'elite';
    ELSIF v_fmv_score >= 70 THEN
      v_tier := 'high';
    ELSIF v_fmv_score >= 50 THEN
      v_tier := 'medium';
    ELSIF v_fmv_score >= 30 THEN
      v_tier := 'developing';
    ELSE
      v_tier := 'emerging';
    END IF;

    -- Insert sample FMV data
    INSERT INTO athlete_fmv_data (
      athlete_id,
      fmv_score,
      fmv_tier,
      social_score,
      athletic_score,
      market_score,
      brand_score,
      percentile_rank,
      comparable_athletes,
      estimated_deal_values,
      improvement_suggestions,
      strengths,
      weaknesses,
      score_history,
      is_public_score,
      last_calculated_at,
      calculation_count_today,
      last_calculation_reset_date
    ) VALUES (
      v_athlete_id,
      v_fmv_score,
      v_tier,
      v_social_score,
      v_athletic_score,
      v_market_score,
      v_brand_score,
      (RANDOM() * 100)::INTEGER, -- Random percentile
      '[]'::JSONB, -- Empty comparable athletes array
      jsonb_build_object(
        'sponsored_post', jsonb_build_object('low', 100, 'mid', 500, 'high', 2000),
        'brand_ambassador', jsonb_build_object('low', 5000, 'mid', 20000, 'high', 50000),
        'event_appearance', jsonb_build_object('low', 500, 'mid', 2000, 'high', 5000),
        'product_endorsement', jsonb_build_object('low', 1000, 'mid', 5000, 'high', 20000),
        'content_creation', jsonb_build_object('low', 250, 'mid', 1500, 'high', 5000)
      ),
      jsonb_build_array(
        jsonb_build_object(
          'area', 'social',
          'current', 'Growing social presence',
          'target', 'Reach 10K followers',
          'action', 'Post consistently 3-4 times per week',
          'impact', '+5 points',
          'priority', 'high'
        )
      ),
      ARRAY['Strong social media presence']::TEXT[],
      ARRAY['Limited NIL deal experience']::TEXT[],
      jsonb_build_array(
        jsonb_build_object(
          'score', v_fmv_score,
          'calculated_at', NOW(),
          'trigger', 'sample_data'
        )
      ),
      (RANDOM() > 0.5), -- 50% chance of public score
      NOW(),
      0,
      CURRENT_DATE
    )
    ON CONFLICT (athlete_id) DO NOTHING;

  END LOOP;

  RAISE NOTICE '✅ Sample FMV data generation complete';
END;
$$ LANGUAGE plpgsql;

-- Run the function to generate sample data
SELECT generate_sample_fmv_data();

-- Drop the helper function
DROP FUNCTION generate_sample_fmv_data();

-- Log results
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM athlete_fmv_data;
  RAISE NOTICE '📊 Total FMV records: %', v_count;
END $$;
