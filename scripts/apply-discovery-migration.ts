/**
 * Apply the discovery tables migration
 * Run with: npx tsx scripts/apply-discovery-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key && value) process.env[key] = value;
      }
    }
  } catch (error) {
    console.error('Could not load .env.local');
  }
}

loadEnv();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyMigration() {
  console.log('🔧 Applying discovery tables migration...\n');

  const sql = `
    -- Add role column to athlete_profiles
    ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50);
    ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS learning_path VARCHAR(50);
    ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS consent_status VARCHAR(50);
    ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
    ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS school_name VARCHAR(255);
    ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
    ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS primary_state VARCHAR(2);

    -- Create conversation_flows table
    CREATE TABLE IF NOT EXISTS public.conversation_flows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      current_pillar VARCHAR(50) DEFAULT 'identity',
      current_day INT DEFAULT 1,
      current_question_number INT DEFAULT 1,
      answers_given JSONB DEFAULT '{}',
      messages_history JSONB DEFAULT '[]',
      started_at TIMESTAMPTZ DEFAULT NOW(),
      last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      CONSTRAINT conversation_flows_user_id_key UNIQUE (user_id)
    );

    -- Create chapter_unlocks table
    CREATE TABLE IF NOT EXISTS public.chapter_unlocks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      chapter_id VARCHAR(50) NOT NULL,
      chapter_name VARCHAR(255),
      unlocked_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT chapter_unlocks_user_chapter UNIQUE (user_id, chapter_id)
    );

    -- Create student_discovery_profiles table
    CREATE TABLE IF NOT EXISTS public.student_discovery_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      profile_data JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT student_discovery_profiles_user_id_key UNIQUE (user_id)
    );

    -- Enable RLS
    ALTER TABLE public.conversation_flows ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.chapter_unlocks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.student_discovery_profiles ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for conversation_flows
    DROP POLICY IF EXISTS "Users can view own conversation flow" ON public.conversation_flows;
    CREATE POLICY "Users can view own conversation flow" ON public.conversation_flows
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own conversation flow" ON public.conversation_flows;
    CREATE POLICY "Users can insert own conversation flow" ON public.conversation_flows
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own conversation flow" ON public.conversation_flows;
    CREATE POLICY "Users can update own conversation flow" ON public.conversation_flows
      FOR UPDATE USING (auth.uid() = user_id);

    -- RLS Policies for chapter_unlocks
    DROP POLICY IF EXISTS "Users can view own chapter unlocks" ON public.chapter_unlocks;
    CREATE POLICY "Users can view own chapter unlocks" ON public.chapter_unlocks
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own chapter unlocks" ON public.chapter_unlocks;
    CREATE POLICY "Users can insert own chapter unlocks" ON public.chapter_unlocks
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- RLS Policies for student_discovery_profiles
    DROP POLICY IF EXISTS "Users can view own discovery profile" ON public.student_discovery_profiles;
    CREATE POLICY "Users can view own discovery profile" ON public.student_discovery_profiles
      FOR SELECT USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can insert own discovery profile" ON public.student_discovery_profiles;
    CREATE POLICY "Users can insert own discovery profile" ON public.student_discovery_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Users can update own discovery profile" ON public.student_discovery_profiles;
    CREATE POLICY "Users can update own discovery profile" ON public.student_discovery_profiles
      FOR UPDATE USING (auth.uid() = user_id);
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('❌ Migration error:', error);
    return false;
  }

  console.log('✅ Migration applied successfully!\n');
  return true;
}

applyMigration().then((success) => {
  if (success) {
    console.log('Now run: npx tsx scripts/create-test-hs-student.ts');
  }
});
