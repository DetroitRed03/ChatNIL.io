-- Migration 008: Create quiz_questions table for NIL education system
-- This table stores all quiz questions for the NIL learning platform

-- Create quiz difficulty enum
DO $$ BEGIN
    CREATE TYPE quiz_difficulty AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create quiz category enum
DO $$ BEGIN
    CREATE TYPE quiz_category AS ENUM (
      'nil_basics',
      'contracts',
      'branding',
      'social_media',
      'compliance',
      'tax_finance',
      'negotiation',
      'legal',
      'marketing',
      'athlete_rights'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Question content
  question text NOT NULL,
  question_type varchar(50) DEFAULT 'multiple_choice', -- multiple_choice, true_false, multi_select

  -- Answer options (array of options for multiple choice)
  options jsonb NOT NULL DEFAULT '[]', -- Array of answer options

  -- Correct answer(s)
  correct_answer jsonb NOT NULL, -- Can be single answer or array for multi-select
  correct_answer_index integer, -- Index of correct answer (for multiple choice)

  -- Educational content
  explanation text, -- Explanation of the correct answer
  learning_resources jsonb DEFAULT '[]', -- Array of links to learn more

  -- Classification
  category quiz_category NOT NULL,
  topic varchar(100), -- Specific topic within category
  difficulty quiz_difficulty NOT NULL DEFAULT 'beginner',
  tags text[] DEFAULT '{}', -- Additional tags for filtering

  -- Metadata
  points integer DEFAULT 10, -- Points awarded for correct answer
  time_limit_seconds integer DEFAULT 60, -- Suggested time limit
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,

  -- Usage statistics
  times_answered integer DEFAULT 0,
  times_correct integer DEFAULT 0,

  -- User context targeting
  target_roles text[] DEFAULT '{"athlete", "parent", "coach"}', -- Which user roles should see this

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Active questions are readable by all authenticated users
CREATE POLICY "Authenticated users can read active questions" ON quiz_questions
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Service role and creators can manage questions
CREATE POLICY "Service role can manage questions" ON quiz_questions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Creators can manage own questions" ON quiz_questions
  FOR ALL USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic ON quiz_questions(topic);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_active ON quiz_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_display_order ON quiz_questions(display_order);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_tags ON quiz_questions USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_target_roles ON quiz_questions USING gin(target_roles);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_quiz_questions_updated_at
    BEFORE UPDATE ON quiz_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments for documentation
COMMENT ON TABLE quiz_questions IS 'Quiz questions for NIL education and learning platform';
COMMENT ON COLUMN quiz_questions.options IS 'JSON array of answer options (e.g., ["Option A", "Option B", "Option C", "Option D"])';
COMMENT ON COLUMN quiz_questions.correct_answer IS 'Correct answer as JSON (string for single, array for multi-select)';
COMMENT ON COLUMN quiz_questions.learning_resources IS 'JSON array of learning resource links';
COMMENT ON COLUMN quiz_questions.target_roles IS 'Array of user roles this question is relevant for';

-- Insert sample NIL quiz questions
INSERT INTO quiz_questions (
  question,
  question_type,
  options,
  correct_answer,
  correct_answer_index,
  explanation,
  category,
  topic,
  difficulty,
  tags,
  points
) VALUES
  -- NIL Basics
  (
    'What does NIL stand for in college athletics?',
    'multiple_choice',
    '["Name, Image, and Likeness", "National Income Level", "New Investment Law", "None of the above"]',
    '"Name, Image, and Likeness"',
    0,
    'NIL stands for Name, Image, and Likeness. It refers to the rights of college athletes to profit from their personal brand and identity.',
    'nil_basics',
    'NIL Definition',
    'beginner',
    ARRAY['basics', 'definition'],
    10
  ),
  (
    'As of 2021, can college athletes earn money from their NIL?',
    'multiple_choice',
    '["Yes, in all states", "No, it is prohibited", "Only in certain states", "Only for professional athletes"]',
    '"Yes, in all states"',
    0,
    'As of July 2021, the NCAA allows all college athletes to earn money from their Name, Image, and Likeness across all states.',
    'nil_basics',
    'NIL Rules',
    'beginner',
    ARRAY['basics', 'rules', 'history'],
    10
  ),

  -- Contracts
  (
    'What is the most important thing to do before signing any NIL contract?',
    'multiple_choice',
    '["Sign immediately to secure the deal", "Have a lawyer or advisor review it", "Post about it on social media", "Ask your teammates what they think"]',
    '"Have a lawyer or advisor review it"',
    1,
    'You should ALWAYS have a qualified lawyer or advisor review any NIL contract before signing. This protects you from unfavorable terms and ensures you understand your obligations.',
    'contracts',
    'Contract Review',
    'intermediate',
    ARRAY['contracts', 'legal', 'safety'],
    15
  ),

  -- Branding
  (
    'Which element is most important when building your personal brand as an athlete?',
    'multiple_choice',
    '["Posting frequently on social media", "Being authentic and consistent", "Copying other successful athletes", "Only focusing on your sport"]',
    '"Being authentic and consistent"',
    1,
    'Authenticity and consistency are key to building a strong personal brand. Your audience wants to connect with the real you, not a manufactured persona.',
    'branding',
    'Personal Brand',
    'intermediate',
    ARRAY['branding', 'social media', 'authenticity'],
    15
  ),

  -- Social Media
  (
    'What should you do if a brand asks you to post content that goes against your values?',
    'multiple_choice',
    '["Post it anyway for the money", "Politely decline the opportunity", "Post it but delete it later", "Ask your friends to post it instead"]',
    '"Politely decline the opportunity"',
    1,
    'Always stay true to your values. Declining opportunities that don''t align with your brand is important for long-term success and maintaining authenticity.',
    'social_media',
    'Brand Alignment',
    'intermediate',
    ARRAY['values', 'ethics', 'decision-making'],
    15
  ),

  -- Compliance
  (
    'True or False: You must report NIL activities to your school''s compliance office.',
    'multiple_choice',
    '["True", "False"]',
    '"True"',
    0,
    'TRUE. Most schools require athletes to report NIL activities to ensure compliance with NCAA rules and state laws. Always check with your compliance office.',
    'compliance',
    'Reporting Requirements',
    'beginner',
    ARRAY['compliance', 'reporting', 'ncaa'],
    10
  ),

  -- Tax & Finance
  (
    'Are NIL earnings considered taxable income?',
    'multiple_choice',
    '["Yes, always", "No, never", "Only if over $10,000", "Only if you''re a professional"]',
    '"Yes, always"',
    0,
    'YES. All NIL earnings are considered taxable income and must be reported to the IRS. You may need to pay quarterly estimated taxes if you earn significant income.',
    'tax_finance',
    'Tax Obligations',
    'intermediate',
    ARRAY['taxes', 'finance', 'income'],
    15
  ),

  -- Legal
  (
    'Can a brand require you to exclusively work with them and no competitors?',
    'multiple_choice',
    '["No, exclusivity clauses are illegal", "Yes, if specified in the contract", "Only for professional athletes", "Only if you''re paid over $50,000"]',
    '"Yes, if specified in the contract"',
    1,
    'Yes, brands can include exclusivity clauses in contracts. This means you cannot work with competing brands. Always understand these terms before signing.',
    'legal',
    'Contract Terms',
    'advanced',
    ARRAY['contracts', 'exclusivity', 'legal'],
    20
  ),

  -- Marketing
  (
    'What is the best way to measure the success of your NIL social media campaigns?',
    'multiple_choice',
    '["Number of followers only", "Engagement rate and conversions", "Number of posts made", "How many likes you get"]',
    '"Engagement rate and conversions"',
    1,
    'Engagement rate (likes, comments, shares) and conversions (clicks, purchases) are the best metrics for measuring campaign success. They show real audience interest and value.',
    'marketing',
    'Performance Metrics',
    'advanced',
    ARRAY['marketing', 'analytics', 'metrics'],
    20
  ),

  -- Athlete Rights
  (
    'Can your coach or school prevent you from participating in NIL activities?',
    'multiple_choice',
    '["Yes, they have full control", "No, they cannot restrict NIL at all", "They can set reasonable restrictions related to team obligations", "Only during the season"]',
    '"They can set reasonable restrictions related to team obligations"',
    2,
    'Schools and coaches can set reasonable restrictions (like blackout periods during games or team conflicts) but cannot completely ban NIL activities. Know your rights and your school''s policies.',
    'athlete_rights',
    'Restrictions & Rights',
    'advanced',
    ARRAY['rights', 'restrictions', 'school-policy'],
    20
  )
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration 008 completed: quiz_questions table created successfully!';
    RAISE NOTICE 'Initialized with 10 sample NIL education questions';
END $$;
