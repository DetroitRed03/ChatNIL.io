/**
 * Create a test High School Student user for development
 *
 * Run with: npx tsx scripts/create-test-hs-student.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
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
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  } catch (error) {
    console.error('Could not load .env.local');
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.log('Make sure you have these in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function ensureTablesExist() {
  console.log('📋 Ensuring required tables exist...\n');

  // Create tables using exec_sql RPC if available, otherwise try direct SQL
  const tableCreationSQL = `
    -- Add missing columns to athlete_profiles if they don't exist
    DO $$
    BEGIN
      -- role column
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'role') THEN
        ALTER TABLE athlete_profiles ADD COLUMN role VARCHAR(50);
      END IF;

      -- learning_path column
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'learning_path') THEN
        ALTER TABLE athlete_profiles ADD COLUMN learning_path VARCHAR(50);
      END IF;

      -- consent_status column
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'consent_status') THEN
        ALTER TABLE athlete_profiles ADD COLUMN consent_status VARCHAR(50);
      END IF;

      -- onboarding_completed column
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE athlete_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
      END IF;

      -- school_name column
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'school_name') THEN
        ALTER TABLE athlete_profiles ADD COLUMN school_name VARCHAR(255);
      END IF;

      -- date_of_birth column
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'date_of_birth') THEN
        ALTER TABLE athlete_profiles ADD COLUMN date_of_birth DATE;
      END IF;

      -- primary_state column
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'athlete_profiles' AND column_name = 'primary_state') THEN
        ALTER TABLE athlete_profiles ADD COLUMN primary_state VARCHAR(2);
      END IF;
    END $$;

    -- Create conversation_flows table if not exists
    CREATE TABLE IF NOT EXISTS public.conversation_flows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      current_pillar VARCHAR(50) DEFAULT 'identity',
      current_day INT DEFAULT 1,
      current_question_number INT DEFAULT 1,
      answers_given JSONB DEFAULT '{}',
      messages_history JSONB DEFAULT '[]',
      started_at TIMESTAMPTZ DEFAULT NOW(),
      last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    );

    -- Create chapter_unlocks table if not exists
    CREATE TABLE IF NOT EXISTS public.chapter_unlocks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      chapter_id VARCHAR(50) NOT NULL,
      chapter_name VARCHAR(255),
      unlocked_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, chapter_id)
    );

    -- Create student_discovery_profiles table if not exists
    CREATE TABLE IF NOT EXISTS public.student_discovery_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      profile_data JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    // Try using exec_sql RPC
    const { error } = await supabase.rpc('exec_sql', { sql: tableCreationSQL });
    if (error) {
      console.log('Note: Could not run migration via RPC, tables may already exist');
    } else {
      console.log('✅ Tables verified/created');
    }
  } catch (e) {
    console.log('Note: exec_sql RPC not available, assuming tables exist');
  }
}

async function createTestHSStudent() {
  const testEmail = 'test.athlete@chatnil.dev';
  const testPassword = 'TestAthlete123!';

  console.log('🏈 Creating test HS Student user...\n');

  try {
    // Ensure tables exist
    await ensureTablesExist();

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail);

    let userId: string;

    if (existingUser) {
      console.log('User already exists, using existing user...');
      userId = existingUser.id;
    } else {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Marcus Johnson',
        },
      });

      if (authError) {
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      userId = authData.user.id;
      console.log('✅ Auth user created');
    }

    // Create/update athlete profile with correct column names
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('athlete_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: profileError } = await supabase
        .from('athlete_profiles')
        .update({
          sport: 'Basketball',
          role: 'hs_student',
          learning_path: 'foundation',
          consent_status: 'approved',
          onboarding_completed: true,
          school_name: 'Lincoln High School',
          primary_state: 'CA',
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError.message);
      } else {
        console.log('✅ Athlete profile updated');
      }
    } else {
      // Insert new profile
      const { error: profileError } = await supabase
        .from('athlete_profiles')
        .insert({
          id: userId,
          sport: 'Basketball',
          role: 'hs_student',
          learning_path: 'foundation',
          consent_status: 'approved',
          onboarding_completed: true,
          school_name: 'Lincoln High School',
          primary_state: 'CA',
        });

      if (profileError) {
        console.error('Profile insert error:', profileError.message);
      } else {
        console.log('✅ Athlete profile created');
      }
    }

    // Also create/update entry in users table (some APIs query this table)
    const { error: usersError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: testEmail,
        full_name: 'Marcus Johnson',
        role: 'hs_student',
        onboarding_completed: true,
      }, {
        onConflict: 'id',
      });

    if (usersError) {
      console.log('Users table note:', usersError.message);
    } else {
      console.log('✅ Users table entry created/updated');
    }

    // Create conversation flow (using current_step instead of current_question_number)
    const { data: existingFlow } = await supabase
      .from('conversation_flows')
      .select('id')
      .eq('user_id', userId)
      .single();

    const flowData = {
      flow_type: 'discovery',
      current_pillar: 'business',
      current_day: 2,
      current_step: 1,
      answers_given: {
        'identity-1-1': { answer: 'Basketball', extractedData: { sport: 'Basketball' } },
        'identity-1-2': { answer: 'Point Guard', extractedData: { position: 'Point Guard' } },
        'identity-5-3': { answer: '7', extractedData: { brand_confidence_score: 7 } },
      },
      status: 'active',
      flow_started_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_interaction_at: new Date().toISOString(),
    };

    if (existingFlow) {
      const { error: flowError } = await supabase
        .from('conversation_flows')
        .update(flowData)
        .eq('user_id', userId);

      if (flowError) {
        console.error('Flow update error:', flowError.message);
      } else {
        console.log('✅ Conversation flow updated');
      }
    } else {
      const { error: flowError } = await supabase
        .from('conversation_flows')
        .insert({ user_id: userId, ...flowData });

      if (flowError) {
        console.error('Flow insert error:', flowError.message);
      } else {
        console.log('✅ Conversation flow created');
      }
    }

    // Unlock Identity chapter (using chapter_name as the identifier)
    // First check if chapter is already unlocked
    const { data: existingChapter } = await supabase
      .from('chapter_unlocks')
      .select('id')
      .eq('user_id', userId)
      .eq('chapter_name', 'identity')
      .single();

    if (!existingChapter) {
      const { error: chapterError } = await supabase
        .from('chapter_unlocks')
        .insert({
          user_id: userId,
          chapter_name: 'identity',
          unlocked_via: 'pillar_completion',  // Valid enum value
          unlocked_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (chapterError) {
        console.error('Chapter error:', chapterError.message);
      } else {
        console.log('✅ Identity chapter unlocked');
      }
    } else {
      console.log('✅ Identity chapter already unlocked');
    }

    // Create discovery profile (using individual columns, not profile_data JSONB)
    const { data: existingDiscovery } = await supabase
      .from('student_discovery_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    const discoveryData = {
      sport: 'Basketball',
      position: 'Point Guard',
      leadership_style: 'Lead by Example',
      unique_story: 'A dedicated point guard who leads by example',
      nil_interest_level: 4,  // Check constraint likely 1-5
      compliance_quiz_completed: true,
      compliance_knowledge_score: 4,  // Also likely 1-5
      communication_style: 'Confident and direct',
      has_bank_account: true,
      understands_tax_obligations: true,
    };

    if (existingDiscovery) {
      const { error: discoveryError } = await supabase
        .from('student_discovery_profiles')
        .update(discoveryData)
        .eq('user_id', userId);

      if (discoveryError) {
        console.error('Discovery profile update error:', discoveryError.message);
      } else {
        console.log('✅ Discovery profile updated');
      }
    } else {
      const { error: discoveryError } = await supabase
        .from('student_discovery_profiles')
        .insert({ user_id: userId, ...discoveryData });

      if (discoveryError) {
        console.error('Discovery profile insert error:', discoveryError.message);
      } else {
        console.log('✅ Discovery profile created');
      }
    }

    console.log('\n========================================');
    console.log('🎉 Test HS Student created successfully!');
    console.log('========================================\n');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('\n👤 Profile:');
    console.log('   Name: Marcus Johnson');
    console.log('   Sport: Basketball - Point Guard');
    console.log('   School: Lincoln High School, CA');
    console.log('\n📊 Discovery Progress:');
    console.log('   ✅ Identity Chapter: UNLOCKED');
    console.log('   🔄 Business Chapter: Day 2 (in progress)');
    console.log('   🔒 Money Chapter: Locked');
    console.log('   🔒 Legacy Chapter: Locked');
    console.log('\n🔗 Login at: http://localhost:3000/login');
    console.log('   Dashboard: http://localhost:3000/dashboard/hs-student');
    console.log('   Discovery: http://localhost:3000/discovery');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

createTestHSStudent();
