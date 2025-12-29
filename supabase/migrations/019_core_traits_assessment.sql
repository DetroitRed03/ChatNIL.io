-- Migration 016: Core Traits Assessment
-- Enables personality/values assessment for athlete brand identity

-- ============================================================
-- TABLE 1: Core Traits Definition
-- ============================================================
CREATE TABLE IF NOT EXISTS core_traits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Trait identity
  trait_code text UNIQUE NOT NULL,  -- e.g., 'leadership', 'creativity'
  trait_name text NOT NULL,
  trait_description text NOT NULL,

  -- Display
  icon_name text,  -- Lucide icon name
  color_hex text,  -- Brand color

  -- Categorization
  category text CHECK (category IN ('personality', 'values', 'style', 'motivation')),

  -- Ordering
  display_order int DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE 2: Assessment Questions
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Question content
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('scale', 'choice', 'ranking')),

  -- For 'scale' type: 1-5 rating
  -- For 'choice' type: multiple choice options
  -- For 'ranking' type: rank items
  options jsonb,  -- Array of options for choice/ranking types

  -- Trait weights (which traits this question measures)
  trait_weights jsonb NOT NULL,  -- { "leadership": 0.8, "teamwork": 0.5 }

  -- Ordering & grouping
  question_order int NOT NULL,
  section text,  -- Optional grouping (e.g., "Work Style", "Values")

  -- Display
  is_required boolean DEFAULT true,
  help_text text,

  -- Status
  is_active boolean DEFAULT true,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- TABLE 3: Assessment Sessions (Progress Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session state
  status text NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'abandoned')),

  -- Progress tracking
  current_question_index int DEFAULT 0,
  total_questions int NOT NULL,
  skipped_question_ids uuid[] DEFAULT '{}',

  -- Timing
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  last_activity_at timestamptz DEFAULT now(),

  -- Session metadata
  version int DEFAULT 1  -- Assessment version for future updates
);

-- ============================================================
-- TABLE 4: Assessment Responses
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Response data
  response_value jsonb NOT NULL,  -- Flexible: number for scale, string for choice, array for ranking

  -- Skip tracking
  was_skipped boolean DEFAULT false,
  skipped_at timestamptz,
  answered_at timestamptz DEFAULT now(),

  -- Time spent (for analytics)
  time_spent_ms int,

  UNIQUE(session_id, question_id)
);

-- ============================================================
-- TABLE 5: User Trait Results
-- ============================================================
CREATE TABLE IF NOT EXISTS user_trait_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,

  -- Calculated scores
  trait_scores jsonb NOT NULL,  -- { "leadership": 85, "creativity": 72, ... }
  top_traits text[] NOT NULL,   -- ['leadership', 'authenticity', 'competition']

  -- Archetype determination
  archetype_code text,
  archetype_name text,
  archetype_description text,

  -- For AI/matching
  embedding vector(1536),

  -- Timestamps
  calculated_at timestamptz DEFAULT now(),

  UNIQUE(user_id)  -- One result per user (latest)
);

-- ============================================================
-- TABLE 6: Trait Archetypes (Predefined Combinations)
-- ============================================================
CREATE TABLE IF NOT EXISTS trait_archetypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  archetype_code text UNIQUE NOT NULL,
  archetype_name text NOT NULL,
  archetype_description text NOT NULL,

  -- What trait combination defines this archetype
  defining_traits jsonb NOT NULL,  -- { "leadership": { "min": 70 }, "teamwork": { "min": 60 } }

  -- Example athletes (for relatability)
  example_athletes text[],

  -- AI prompt modifier
  ai_personality_hint text,

  -- Display
  icon_name text,
  color_hex text,

  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user ON assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status ON assessment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session ON assessment_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_user ON assessment_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trait_results_user ON user_trait_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trait_results_embedding ON user_trait_results
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
CREATE INDEX IF NOT EXISTS idx_core_traits_code ON core_traits(trait_code);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_order ON assessment_questions(question_order);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE core_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trait_results ENABLE ROW LEVEL SECURITY;

-- Public read access for traits, questions, and archetypes
CREATE POLICY "Anyone can read core_traits" ON core_traits
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read assessment_questions" ON assessment_questions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can read trait_archetypes" ON trait_archetypes
  FOR SELECT USING (true);

-- Users can only see their own data
CREATE POLICY "Users view own sessions" ON assessment_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own sessions" ON assessment_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own sessions" ON assessment_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users view own responses" ON assessment_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own responses" ON assessment_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own responses" ON assessment_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users view own results" ON user_trait_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own results" ON user_trait_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own results" ON user_trait_results
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access core_traits" ON core_traits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access assessment_questions" ON assessment_questions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access trait_archetypes" ON trait_archetypes
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access sessions" ON assessment_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access responses" ON assessment_responses
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access results" ON user_trait_results
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Get or create assessment session
CREATE OR REPLACE FUNCTION get_or_create_assessment_session(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id uuid;
  v_total_questions int;
BEGIN
  -- Check for existing in-progress session
  SELECT id INTO v_session_id
  FROM assessment_sessions
  WHERE user_id = p_user_id AND status = 'in_progress';

  IF v_session_id IS NOT NULL THEN
    -- Update last activity
    UPDATE assessment_sessions
    SET last_activity_at = now()
    WHERE id = v_session_id;
    RETURN v_session_id;
  END IF;

  -- Get total active questions
  SELECT COUNT(*) INTO v_total_questions
  FROM assessment_questions
  WHERE is_active = true;

  -- Create new session
  INSERT INTO assessment_sessions (user_id, total_questions, status)
  VALUES (p_user_id, v_total_questions, 'in_progress')
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

-- Calculate trait scores from responses
CREATE OR REPLACE FUNCTION calculate_trait_scores(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_scores jsonb := '{}';
  v_counts jsonb := '{}';
  v_response RECORD;
  v_trait text;
  v_weight float;
  v_value float;
BEGIN
  FOR v_response IN
    SELECT
      ar.response_value,
      aq.trait_weights
    FROM assessment_responses ar
    JOIN assessment_questions aq ON aq.id = ar.question_id
    WHERE ar.session_id = p_session_id
      AND ar.was_skipped = false
  LOOP
    -- For each trait in the question's weights
    FOR v_trait, v_weight IN SELECT * FROM jsonb_each_text(v_response.trait_weights)
    LOOP
      v_value := (v_response.response_value->>'value')::float;

      -- Accumulate weighted scores
      v_scores := jsonb_set(
        v_scores,
        ARRAY[v_trait],
        to_jsonb(COALESCE((v_scores->>v_trait)::float, 0) + (v_value * v_weight::float))
      );

      -- Track count for averaging
      v_counts := jsonb_set(
        v_counts,
        ARRAY[v_trait],
        to_jsonb(COALESCE((v_counts->>v_trait)::int, 0) + 1)
      );
    END LOOP;
  END LOOP;

  -- Calculate averages and normalize to 0-100
  FOR v_trait IN SELECT jsonb_object_keys(v_scores)
  LOOP
    v_scores := jsonb_set(
      v_scores,
      ARRAY[v_trait],
      to_jsonb(
        ROUND(
          ((v_scores->>v_trait)::float / GREATEST((v_counts->>v_trait)::int, 1)) * 20
        )::int
      )
    );
  END LOOP;

  RETURN v_scores;
END;
$$;

-- Match users by trait similarity
CREATE OR REPLACE FUNCTION match_users_by_traits(
  p_user_id uuid,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  matched_user_id uuid,
  similarity float,
  shared_top_traits text[]
)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  WITH user_result AS (
    SELECT embedding, top_traits
    FROM user_trait_results
    WHERE user_id = p_user_id
  )
  SELECT
    utr.user_id as matched_user_id,
    1 - (utr.embedding <=> ur.embedding) as similarity,
    ARRAY(
      SELECT unnest(utr.top_traits)
      INTERSECT
      SELECT unnest(ur.top_traits)
    ) as shared_top_traits
  FROM user_trait_results utr
  CROSS JOIN user_result ur
  WHERE
    utr.user_id != p_user_id
    AND utr.embedding IS NOT NULL
    AND 1 - (utr.embedding <=> ur.embedding) > match_threshold
  ORDER BY utr.embedding <=> ur.embedding
  LIMIT match_count;
$$;

-- Get assessment progress for a user
CREATE OR REPLACE FUNCTION get_assessment_progress(p_user_id uuid)
RETURNS TABLE (
  session_id uuid,
  status text,
  current_index int,
  total_questions int,
  skipped_count int,
  answered_count int,
  progress_percent float
)
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT
    s.id as session_id,
    s.status,
    s.current_question_index as current_index,
    s.total_questions,
    COALESCE(array_length(s.skipped_question_ids, 1), 0) as skipped_count,
    (SELECT COUNT(*)::int FROM assessment_responses WHERE session_id = s.id AND was_skipped = false) as answered_count,
    CASE
      WHEN s.total_questions > 0
      THEN ((SELECT COUNT(*) FROM assessment_responses WHERE session_id = s.id)::float / s.total_questions * 100)
      ELSE 0
    END as progress_percent
  FROM assessment_sessions s
  WHERE s.user_id = p_user_id AND s.status = 'in_progress'
  LIMIT 1;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_core_traits_updated_at
  BEFORE UPDATE ON core_traits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_questions_updated_at
  BEFORE UPDATE ON assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA: Core Traits
-- ============================================================
INSERT INTO core_traits (trait_code, trait_name, trait_description, category, icon_name, color_hex, display_order)
VALUES
  ('leadership', 'Leadership', 'Natural ability to guide, inspire, and motivate others toward goals', 'personality', 'Crown', '#FFD700', 1),
  ('creativity', 'Creativity', 'Innovative thinking and unique approaches to challenges and content', 'style', 'Lightbulb', '#FF6B6B', 2),
  ('community_focus', 'Community Focus', 'Strong connection to giving back and supporting others', 'values', 'Heart', '#E91E63', 3),
  ('competition', 'Competitive Drive', 'Intense desire to win and be the best in your field', 'motivation', 'Trophy', '#4CAF50', 4),
  ('authenticity', 'Authenticity', 'Being genuine and true to yourself in all interactions', 'values', 'Fingerprint', '#9C27B0', 5),
  ('resilience', 'Resilience', 'Ability to bounce back from setbacks and adversity', 'personality', 'Shield', '#2196F3', 6),
  ('teamwork', 'Team Player', 'Thriving in collaborative environments and lifting others up', 'personality', 'Users', '#00BCD4', 7),
  ('ambition', 'Ambition', 'Strong drive for achievement and long-term success', 'motivation', 'Rocket', '#FF9800', 8),
  ('charisma', 'Charisma', 'Natural ability to connect with and engage audiences', 'style', 'Sparkles', '#673AB7', 9),
  ('discipline', 'Discipline', 'Commitment to routines, preparation, and consistent effort', 'personality', 'Target', '#607D8B', 10),
  ('innovation', 'Innovation', 'Willingness to try new things and push boundaries', 'style', 'Zap', '#FFEB3B', 11),
  ('loyalty', 'Loyalty', 'Deep commitment to team, family, and community connections', 'values', 'Handshake', '#795548', 12)
ON CONFLICT (trait_code) DO NOTHING;

-- ============================================================
-- SEED DATA: Trait Archetypes
-- ============================================================
INSERT INTO trait_archetypes (archetype_code, archetype_name, archetype_description, defining_traits, example_athletes, ai_personality_hint, icon_name, color_hex)
VALUES
  ('captain', 'The Captain', 'A natural leader who inspires through actions and words. You command respect and bring out the best in everyone around you.', '{"leadership": {"min": 75}, "teamwork": {"min": 60}, "resilience": {"min": 60}}', ARRAY['Tom Brady', 'Megan Rapinoe', 'Derek Jeter'], 'Respond with leadership-focused language. Emphasize team impact, legacy, and inspiring others.', 'Crown', '#FFD700'),
  ('trailblazer', 'The Trailblazer', 'An innovator who breaks the mold. You see opportunities others miss and aren''t afraid to be first.', '{"innovation": {"min": 75}, "creativity": {"min": 70}, "ambition": {"min": 60}}', ARRAY['Naomi Osaka', 'Colin Kaepernick', 'Sha''Carri Richardson'], 'Emphasize unique opportunities, being first-to-market, and unconventional partnerships.', 'Zap', '#FF6B6B'),
  ('champion', 'The Champion', 'Driven by an unrelenting desire to win. You''re focused, disciplined, and let your performance speak loudest.', '{"competition": {"min": 80}, "discipline": {"min": 70}, "resilience": {"min": 65}}', ARRAY['Michael Jordan', 'Serena Williams', 'Kobe Bryant'], 'Focus on performance-based deals, winning mindset, and results-driven partnerships.', 'Trophy', '#4CAF50'),
  ('ambassador', 'The Ambassador', 'Your platform is for something bigger. You''re driven by causes and making a genuine impact in communities.', '{"community_focus": {"min": 80}, "authenticity": {"min": 70}, "loyalty": {"min": 60}}', ARRAY['LeBron James', 'Marcus Rashford', 'Maya Moore'], 'Prioritize cause-aligned partnerships, community impact, and authentic storytelling.', 'Heart', '#E91E63'),
  ('entertainer', 'The Entertainer', 'You light up any room and captivate audiences. Your charisma and creativity make brands come to you.', '{"charisma": {"min": 75}, "creativity": {"min": 70}, "authenticity": {"min": 60}}', ARRAY['Shaquille O''Neal', 'Patrick Mahomes', 'Simone Biles'], 'Focus on content opportunities, audience engagement, and personality-driven campaigns.', 'Sparkles', '#673AB7'),
  ('purist', 'The Purist', 'Your craft comes first. You prefer partnerships that honor the sport and your dedication to excellence.', '{"discipline": {"min": 80}, "authenticity": {"min": 75}, "competition": {"min": 60}}', ARRAY['Tim Duncan', 'Russell Wilson', 'Kawhi Leonard'], 'Emphasize sports equipment, training, and performance-focused brands. Minimal but quality partnerships.', 'Target', '#607D8B'),
  ('connector', 'The Connector', 'You build bridges between worlds. Your network is your superpower, and you elevate everyone in your circle.', '{"teamwork": {"min": 75}, "loyalty": {"min": 70}, "charisma": {"min": 65}}', ARRAY['Chris Paul', 'Sue Bird', 'Draymond Green'], 'Focus on collaborative opportunities, team-oriented brands, and relationship-building deals.', 'Users', '#00BCD4'),
  ('builder', 'The Builder', 'You''re playing the long game. Every deal is a step toward your empire, and you think like a CEO.', '{"ambition": {"min": 80}, "innovation": {"min": 65}, "discipline": {"min": 65}}', ARRAY['Magic Johnson', 'Venus Williams', 'David Beckham'], 'Emphasize equity deals, long-term partnerships, business ownership, and brand building.', 'Rocket', '#FF9800')
ON CONFLICT (archetype_code) DO NOTHING;

-- ============================================================
-- SEED DATA: Assessment Questions
-- ============================================================
INSERT INTO assessment_questions (question_text, question_type, options, trait_weights, question_order, section, is_required, help_text)
VALUES
  -- Question 1: Team Dynamics
  ('When your team is struggling, you naturally...', 'choice',
   '[{"value": "A", "label": "Step up and take charge", "weights": {"leadership": 5, "resilience": 3}}, {"value": "B", "label": "Encourage teammates one-on-one", "weights": {"teamwork": 5, "community_focus": 3}}, {"value": "C", "label": "Lead by example through your own performance", "weights": {"discipline": 5, "competition": 3}}, {"value": "D", "label": "Find creative solutions others haven''t tried", "weights": {"creativity": 5, "innovation": 3}}]',
   '{"leadership": 0.8, "teamwork": 0.5, "resilience": 0.3}', 1, 'Team Dynamics', true, null),

  -- Question 2: Values
  ('How important is it that your brand partnerships align with causes you care about?', 'scale',
   null,
   '{"authenticity": 0.9, "community_focus": 0.7}', 2, 'Values', true, '1 = Not important, 5 = Essential'),

  -- Question 3: Content Style
  ('Your ideal content style is...', 'choice',
   '[{"value": "A", "label": "Polished and professional", "weights": {"discipline": 4, "ambition": 3}}, {"value": "B", "label": "Raw and authentic behind-the-scenes", "weights": {"authenticity": 5, "charisma": 2}}, {"value": "C", "label": "Creative and unexpected", "weights": {"creativity": 5, "innovation": 4}}, {"value": "D", "label": "Community-focused and interactive", "weights": {"community_focus": 5, "teamwork": 3}}]',
   '{"creativity": 0.6, "authenticity": 0.6, "charisma": 0.4}', 3, 'Content Style', true, null),

  -- Question 4: Mindset
  ('After a tough loss, how long does it typically take you to mentally reset?', 'scale',
   null,
   '{"resilience": 0.9, "competition": 0.4, "discipline": 0.3}', 4, 'Mindset', true, '1 = Days/weeks, 5 = Hours or less'),

  -- Question 5: Brand Identity
  ('Rank these in order of importance to your personal brand:', 'ranking',
   '[{"value": "winning", "label": "Winning and championships"}, {"value": "giving_back", "label": "Giving back to community"}, {"value": "entertainment", "label": "Entertaining fans"}, {"value": "inspiration", "label": "Inspiring the next generation"}]',
   '{"competition": 0.5, "community_focus": 0.5, "charisma": 0.4, "leadership": 0.4}', 5, 'Brand Identity', true, null),

  -- Question 6: Business Approach
  ('When approaching a brand deal negotiation, you prefer to...', 'choice',
   '[{"value": "A", "label": "Push hard for the best possible terms", "weights": {"competition": 5, "ambition": 4}}, {"value": "B", "label": "Find a win-win that builds long-term relationships", "weights": {"teamwork": 4, "loyalty": 5}}, {"value": "C", "label": "Focus on creative freedom over money", "weights": {"creativity": 5, "authenticity": 3}}, {"value": "D", "label": "Let your results speak for themselves", "weights": {"discipline": 4, "resilience": 3}}]',
   '{"ambition": 0.7, "competition": 0.5, "teamwork": 0.4}', 6, 'Business Approach', true, null),

  -- Question 7: Authenticity
  ('How comfortable are you being vulnerable and sharing struggles publicly?', 'scale',
   null,
   '{"authenticity": 0.9, "charisma": 0.5, "resilience": 0.4}', 7, 'Authenticity', true, '1 = Very uncomfortable, 5 = Very comfortable'),

  -- Question 8: Brand Alignment
  ('Your dream NIL partnership would be with...', 'choice',
   '[{"value": "A", "label": "A cutting-edge sports tech company", "weights": {"innovation": 5, "ambition": 4}}, {"value": "B", "label": "A nonprofit or cause-driven organization", "weights": {"community_focus": 5, "authenticity": 4}}, {"value": "C", "label": "A major global brand with huge reach", "weights": {"ambition": 5, "competition": 3}}, {"value": "D", "label": "A local business in your hometown", "weights": {"loyalty": 5, "community_focus": 4}}]',
   '{"ambition": 0.6, "community_focus": 0.5, "loyalty": 0.4}', 8, 'Brand Alignment', true, null),

  -- Question 9: Work Ethic
  ('How structured is your daily training and preparation routine?', 'scale',
   null,
   '{"discipline": 0.9, "ambition": 0.5, "resilience": 0.3}', 9, 'Work Ethic', true, '1 = Very flexible, 5 = Highly structured'),

  -- Question 10: Fan Engagement
  ('When meeting fans, you most enjoy...', 'choice',
   '[{"value": "A", "label": "Having deep one-on-one conversations", "weights": {"authenticity": 5, "community_focus": 4}}, {"value": "B", "label": "Entertaining large groups with your energy", "weights": {"charisma": 5, "leadership": 3}}, {"value": "C", "label": "Inspiring young athletes with advice", "weights": {"leadership": 5, "community_focus": 4}}, {"value": "D", "label": "Quick interactions that let you focus on performance", "weights": {"competition": 4, "discipline": 3}}]',
   '{"charisma": 0.7, "community_focus": 0.6, "leadership": 0.4}', 10, 'Fan Engagement', true, null),

  -- Question 11: Content Strategy
  ('If you could only post one type of content forever, it would be...', 'choice',
   '[{"value": "A", "label": "Training and workout content", "weights": {"discipline": 5, "competition": 4}}, {"value": "B", "label": "Personal life and family moments", "weights": {"authenticity": 5, "loyalty": 4}}, {"value": "C", "label": "Community service and charitable work", "weights": {"community_focus": 5, "leadership": 3}}, {"value": "D", "label": "Creative collaborations and brand campaigns", "weights": {"creativity": 5, "innovation": 4}}]',
   '{"creativity": 0.5, "authenticity": 0.5, "discipline": 0.4}', 11, 'Content Strategy', true, null),

  -- Question 12: Resilience
  ('How do you handle criticism on social media?', 'scale',
   null,
   '{"resilience": 0.9, "discipline": 0.4, "authenticity": 0.3}', 12, 'Resilience', true, '1 = It really affects me, 5 = Water off a duck''s back'),

  -- Question 13: Leadership
  ('Your captain/leader style is best described as...', 'choice',
   '[{"value": "A", "label": "Vocal and commanding", "weights": {"leadership": 5, "charisma": 4}}, {"value": "B", "label": "Lead by example, few words", "weights": {"discipline": 5, "resilience": 3}}, {"value": "C", "label": "Emotionally supportive and encouraging", "weights": {"teamwork": 5, "community_focus": 4}}, {"value": "D", "label": "I''m not really a captain type", "weights": {"authenticity": 3, "creativity": 2}}]',
   '{"leadership": 0.8, "teamwork": 0.5, "charisma": 0.4}', 13, 'Leadership', true, null),

  -- Question 14: Innovation
  ('How willing are you to take risks with unconventional brand partnerships?', 'scale',
   null,
   '{"innovation": 0.9, "creativity": 0.6, "ambition": 0.4}', 14, 'Innovation', true, '1 = Prefer safe/traditional, 5 = Love being first to try new things'),

  -- Question 15: Priorities
  ('What matters most in choosing which NIL opportunities to pursue?', 'ranking',
   '[{"value": "money", "label": "Compensation amount"}, {"value": "values", "label": "Brand values alignment"}, {"value": "exposure", "label": "Exposure and reach"}, {"value": "creative", "label": "Creative control"}]',
   '{"ambition": 0.6, "authenticity": 0.5, "creativity": 0.4, "competition": 0.3}', 15, 'Priorities', true, null),

  -- Question 16: Team Bonds
  ('How often do you go out of your way to help teammates with personal (non-sport) challenges?', 'scale',
   null,
   '{"teamwork": 0.8, "community_focus": 0.7, "loyalty": 0.6}', 16, 'Team Bonds', true, '1 = Rarely, 5 = All the time'),

  -- Question 17: Social Strategy
  ('Your approach to social media is...', 'choice',
   '[{"value": "A", "label": "Strategic and planned content calendar", "weights": {"discipline": 5, "ambition": 4}}, {"value": "B", "label": "Spontaneous and in-the-moment", "weights": {"authenticity": 5, "creativity": 3}}, {"value": "C", "label": "Focused on engaging with my community", "weights": {"community_focus": 5, "charisma": 4}}, {"value": "D", "label": "Minimal - I let my performance do the talking", "weights": {"competition": 4, "discipline": 3}}]',
   '{"discipline": 0.5, "creativity": 0.5, "charisma": 0.4}', 17, 'Social Strategy', true, null),

  -- Question 18: Competition
  ('How important is winning championships to your personal identity?', 'scale',
   null,
   '{"competition": 0.9, "ambition": 0.7, "resilience": 0.4}', 18, 'Competition', true, '1 = One of many goals, 5 = Everything'),

  -- Question 19: Creative Control
  ('When a brand wants you to create content, you prefer...', 'choice',
   '[{"value": "A", "label": "Complete creative freedom", "weights": {"creativity": 5, "authenticity": 4}}, {"value": "B", "label": "Collaboration with their creative team", "weights": {"teamwork": 5, "innovation": 3}}, {"value": "C", "label": "Clear guidelines I can execute well", "weights": {"discipline": 5, "loyalty": 3}}, {"value": "D", "label": "Whatever pays the most", "weights": {"ambition": 4, "competition": 3}}]',
   '{"creativity": 0.7, "authenticity": 0.5, "discipline": 0.4}', 19, 'Creative Control', true, null),

  -- Question 20: Vision
  ('Five years from now, success means...', 'choice',
   '[{"value": "A", "label": "Being considered the best in my sport", "weights": {"competition": 5, "ambition": 5}}, {"value": "B", "label": "Having built a lasting business empire", "weights": {"ambition": 5, "innovation": 4}}, {"value": "C", "label": "Making a real difference in my community", "weights": {"community_focus": 5, "authenticity": 4}}, {"value": "D", "label": "Being remembered as a great teammate and person", "weights": {"teamwork": 5, "loyalty": 5}}]',
   '{"ambition": 0.7, "competition": 0.5, "community_focus": 0.5}', 20, 'Vision', true, null)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Success message
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Migration 016: Core Traits Assessment completed!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - core_traits (12 traits seeded)';
    RAISE NOTICE '  - assessment_questions (20 questions seeded)';
    RAISE NOTICE '  - assessment_sessions';
    RAISE NOTICE '  - assessment_responses';
    RAISE NOTICE '  - user_trait_results';
    RAISE NOTICE '  - trait_archetypes (8 archetypes seeded)';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - get_or_create_assessment_session';
    RAISE NOTICE '  - calculate_trait_scores';
    RAISE NOTICE '  - match_users_by_traits';
    RAISE NOTICE '  - get_assessment_progress';
END $$;
