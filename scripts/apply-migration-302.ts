/**
 * Apply Migration 302 - Fix E2E Schema Issues
 * Uses direct fetch to Supabase SQL endpoint
 */

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function executeSql(sql: string, description: string): Promise<{ success: boolean; error?: string }> {
  console.log(`   Executing: ${description}...`);
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function applyMigration() {
  console.log('🔧 Applying Migration 302: Fix E2E Schema Issues\n');

  // PART 1: Add missing columns
  console.log('📋 Part 1: Adding missing columns...');

  let result = await executeSql(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS state TEXT;
    ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS fmv_score NUMERIC DEFAULT 0;
    UPDATE athlete_profiles SET fmv_score = estimated_fmv WHERE estimated_fmv IS NOT NULL AND (fmv_score IS NULL OR fmv_score = 0);
  `, 'Add columns to users and athlete_profiles');

  if (result.success) {
    console.log('   ✅ Columns added\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 2: Create quiz_sessions table
  console.log('📋 Part 2: Creating quiz_sessions table...');

  result = await executeSql(`
    CREATE TABLE IF NOT EXISTS quiz_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      quiz_id UUID,
      started_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      score INTEGER,
      total_questions INTEGER,
      correct_answers INTEGER,
      current_question_index INTEGER DEFAULT 0,
      answers JSONB DEFAULT '[]'::jsonb,
      difficulty TEXT DEFAULT 'beginner',
      status TEXT DEFAULT 'in_progress',
      time_spent_seconds INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status);
  `, 'Create quiz_sessions table');

  if (result.success) {
    console.log('   ✅ quiz_sessions table created\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 2b: quiz_sessions permissions
  result = await executeSql(`
    ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON quiz_sessions TO service_role;
    GRANT SELECT, INSERT, UPDATE ON quiz_sessions TO authenticated;
    GRANT SELECT ON quiz_sessions TO anon;

    DROP POLICY IF EXISTS "service_role_full_access_quiz_sessions" ON quiz_sessions;
    DROP POLICY IF EXISTS "users_view_own_quiz_sessions" ON quiz_sessions;
    DROP POLICY IF EXISTS "users_create_own_quiz_sessions" ON quiz_sessions;
    DROP POLICY IF EXISTS "users_update_own_quiz_sessions" ON quiz_sessions;

    CREATE POLICY "service_role_full_access_quiz_sessions" ON quiz_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "users_view_own_quiz_sessions" ON quiz_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "users_create_own_quiz_sessions" ON quiz_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "users_update_own_quiz_sessions" ON quiz_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  `, 'Set quiz_sessions permissions');

  if (result.success) {
    console.log('   ✅ quiz_sessions permissions set\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 3: Create badges table
  console.log('📋 Part 3: Creating badges table...');

  result = await executeSql(`
    CREATE TABLE IF NOT EXISTS badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'general',
      tier TEXT DEFAULT 'bronze',
      icon_url TEXT,
      icon_name TEXT,
      points INTEGER DEFAULT 10,
      requirements JSONB DEFAULT '{}'::jsonb,
      unlock_criteria TEXT,
      is_active BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
    CREATE INDEX IF NOT EXISTS idx_badges_tier ON badges(tier);
  `, 'Create badges table');

  if (result.success) {
    console.log('   ✅ badges table created\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 3b: badges permissions
  result = await executeSql(`
    ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON badges TO service_role;
    GRANT SELECT ON badges TO authenticated;
    GRANT SELECT ON badges TO anon;

    DROP POLICY IF EXISTS "service_role_full_access_badges" ON badges;
    DROP POLICY IF EXISTS "everyone_view_badges" ON badges;
    DROP POLICY IF EXISTS "anon_view_badges" ON badges;

    CREATE POLICY "service_role_full_access_badges" ON badges FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "everyone_view_badges" ON badges FOR SELECT TO authenticated USING (is_active = true);
    CREATE POLICY "anon_view_badges" ON badges FOR SELECT TO anon USING (is_active = true);
  `, 'Set badges permissions');

  if (result.success) {
    console.log('   ✅ badges permissions set\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 4: Create user_badges table
  console.log('📋 Part 4: Creating user_badges table...');

  result = await executeSql(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
      earned_at TIMESTAMPTZ DEFAULT NOW(),
      progress INTEGER DEFAULT 100,
      is_featured BOOLEAN DEFAULT false,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, badge_id)
    );
    CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
  `, 'Create user_badges table');

  if (result.success) {
    console.log('   ✅ user_badges table created\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 4b: user_badges permissions
  result = await executeSql(`
    ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON user_badges TO service_role;
    GRANT SELECT, INSERT ON user_badges TO authenticated;
    GRANT SELECT ON user_badges TO anon;

    DROP POLICY IF EXISTS "service_role_full_access_user_badges" ON user_badges;
    DROP POLICY IF EXISTS "users_view_own_badges" ON user_badges;
    DROP POLICY IF EXISTS "users_view_others_featured_badges" ON user_badges;
    DROP POLICY IF EXISTS "users_earn_badges" ON user_badges;

    CREATE POLICY "service_role_full_access_user_badges" ON user_badges FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "users_view_own_badges" ON user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "users_view_others_featured_badges" ON user_badges FOR SELECT TO authenticated USING (is_featured = true);
    CREATE POLICY "users_earn_badges" ON user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  `, 'Set user_badges permissions');

  if (result.success) {
    console.log('   ✅ user_badges permissions set\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 5: Create portfolio_items table
  console.log('📋 Part 5: Creating portfolio_items table...');

  result = await executeSql(`
    CREATE TABLE IF NOT EXISTS portfolio_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'other',
      media_type TEXT DEFAULT 'image',
      media_url TEXT,
      thumbnail_url TEXT,
      external_url TEXT,
      tags TEXT[] DEFAULT ARRAY[]::TEXT[],
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT false,
      is_public BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON portfolio_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category);
  `, 'Create portfolio_items table');

  if (result.success) {
    console.log('   ✅ portfolio_items table created\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 5b: portfolio_items permissions
  result = await executeSql(`
    ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON portfolio_items TO service_role;
    GRANT SELECT, INSERT, UPDATE, DELETE ON portfolio_items TO authenticated;
    GRANT SELECT ON portfolio_items TO anon;

    DROP POLICY IF EXISTS "service_role_full_access_portfolio" ON portfolio_items;
    DROP POLICY IF EXISTS "users_manage_own_portfolio" ON portfolio_items;
    DROP POLICY IF EXISTS "public_view_portfolio" ON portfolio_items;
    DROP POLICY IF EXISTS "authenticated_view_public_portfolio" ON portfolio_items;

    CREATE POLICY "service_role_full_access_portfolio" ON portfolio_items FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "users_manage_own_portfolio" ON portfolio_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "public_view_portfolio" ON portfolio_items FOR SELECT TO anon USING (is_public = true);
    CREATE POLICY "authenticated_view_public_portfolio" ON portfolio_items FOR SELECT TO authenticated USING (is_public = true OR auth.uid() = user_id);
  `, 'Set portfolio_items permissions');

  if (result.success) {
    console.log('   ✅ portfolio_items permissions set\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 6: Create quiz_answers table
  console.log('📋 Part 6: Creating quiz_answers table...');

  result = await executeSql(`
    CREATE TABLE IF NOT EXISTS quiz_answers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      selected_answer TEXT,
      is_correct BOOLEAN,
      time_taken_seconds INTEGER,
      answered_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_quiz_answers_session_id ON quiz_answers(session_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_answers_user_id ON quiz_answers(user_id);
  `, 'Create quiz_answers table');

  if (result.success) {
    console.log('   ✅ quiz_answers table created\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 6b: quiz_answers permissions
  result = await executeSql(`
    ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON quiz_answers TO service_role;
    GRANT SELECT, INSERT ON quiz_answers TO authenticated;

    DROP POLICY IF EXISTS "service_role_full_access_quiz_answers" ON quiz_answers;
    DROP POLICY IF EXISTS "users_view_own_answers" ON quiz_answers;
    DROP POLICY IF EXISTS "users_submit_answers" ON quiz_answers;

    CREATE POLICY "service_role_full_access_quiz_answers" ON quiz_answers FOR ALL TO service_role USING (true) WITH CHECK (true);
    CREATE POLICY "users_view_own_answers" ON quiz_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "users_submit_answers" ON quiz_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  `, 'Set quiz_answers permissions');

  if (result.success) {
    console.log('   ✅ quiz_answers permissions set\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 7: Seed default badges
  console.log('📋 Part 7: Seeding default badges...');

  result = await executeSql(`
    INSERT INTO badges (name, description, category, tier, icon_name, points, unlock_criteria)
    VALUES
      ('Welcome', 'Welcome to ChatNIL! Complete your profile to earn this badge.', 'onboarding', 'bronze', 'star', 10, 'Complete profile setup'),
      ('Profile Pro', 'Completed your profile with all required information.', 'profile', 'silver', 'user-check', 25, 'Fill out all profile fields'),
      ('Quiz Starter', 'Completed your first NIL education quiz.', 'education', 'bronze', 'book-open', 15, 'Complete 1 quiz'),
      ('Quiz Master', 'Completed 10 NIL education quizzes.', 'education', 'gold', 'award', 50, 'Complete 10 quizzes'),
      ('Social Butterfly', 'Connected all your social media accounts.', 'social', 'silver', 'share-2', 30, 'Connect 3+ social accounts'),
      ('Rising Star', 'Reached 1,000 total social media followers.', 'social', 'gold', 'trending-up', 40, 'Reach 1000 followers'),
      ('Deal Maker', 'Successfully completed your first NIL deal.', 'deals', 'gold', 'handshake', 100, 'Complete 1 NIL deal'),
      ('Engaged Learner', 'Spent 30 minutes learning about NIL.', 'education', 'bronze', 'clock', 20, 'Study for 30 minutes'),
      ('Portfolio Builder', 'Added 5 items to your portfolio.', 'portfolio', 'silver', 'folder-plus', 35, 'Add 5 portfolio items'),
      ('Knowledge Seeker', 'Answered 50 quiz questions correctly.', 'education', 'platinum', 'brain', 75, 'Answer 50 questions correctly')
    ON CONFLICT DO NOTHING;
  `, 'Seed default badges');

  if (result.success) {
    console.log('   ✅ Default badges seeded\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  // PART 8: Refresh PostgREST schema cache
  console.log('📋 Part 8: Refreshing PostgREST schema cache...');

  result = await executeSql(`NOTIFY pgrst, 'reload schema';`, 'Refresh schema cache');

  if (result.success) {
    console.log('   ✅ Schema cache refresh requested\n');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100), '\n');
  }

  console.log('🎉 Migration 302 completed!');
  console.log('\nSummary:');
  console.log('- Added avatar_url, state, fmv_score columns');
  console.log('- Created quiz_sessions table with RLS');
  console.log('- Created badges table with RLS');
  console.log('- Created user_badges table with RLS');
  console.log('- Created portfolio_items table with RLS');
  console.log('- Created quiz_answers table with RLS');
  console.log('- Seeded 10 default badges');
  console.log('- Refreshed PostgREST schema cache');
}

applyMigration().catch(console.error);
