-- Seed data for Parent Dashboard test users
-- Run this in Supabase SQL Editor to create test parents and children

-- Note: Users must first be created via auth.users (through sign-up or admin API)
-- This script creates the corresponding athlete_profiles and relationships

-- Test Users Overview:
-- Parent: David Johnson (david.johnson@test.chatnil.com / password123)
--   Child: Marcus Johnson (marcus.johnson@test.chatnil.com) - Consent Approved
-- Parent: Michelle Williams (michelle.williams@test.chatnil.com / password123)
--   Child: Sarah Williams (sarah.williams@test.chatnil.com) - Consent Pending

-- ============================================================================
-- Step 1: Create auth users (run this in auth context or use Supabase Dashboard)
-- ============================================================================
-- These need to be created through the Supabase Auth API or Dashboard:
-- 1. david.johnson@test.chatnil.com (password: password123)
-- 2. michelle.williams@test.chatnil.com (password: password123)
-- 3. marcus.johnson@test.chatnil.com (password: password123)
-- 4. sarah.williams@test.chatnil.com (password: password123)

-- ============================================================================
-- Step 2: After auth users exist, create their profiles
-- Replace the UUIDs below with actual auth.users IDs after creation
-- ============================================================================

-- Example profiles (uncomment and update UUIDs after creating auth users):

/*
-- David Johnson (Parent)
INSERT INTO public.athlete_profiles (
  id,
  full_name,
  role,
  email,
  created_at,
  updated_at
) VALUES (
  'REPLACE_WITH_DAVID_AUTH_ID',
  'David Johnson',
  'parent',
  'david.johnson@test.chatnil.com',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Michelle Williams (Parent)
INSERT INTO public.athlete_profiles (
  id,
  full_name,
  role,
  email,
  created_at,
  updated_at
) VALUES (
  'REPLACE_WITH_MICHELLE_AUTH_ID',
  'Michelle Williams',
  'parent',
  'michelle.williams@test.chatnil.com',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Marcus Johnson (HS Student - David's son)
INSERT INTO public.athlete_profiles (
  id,
  full_name,
  role,
  email,
  sport,
  school_name,
  primary_state,
  consent_status,
  streak_count,
  parent_email,
  created_at,
  updated_at
) VALUES (
  'REPLACE_WITH_MARCUS_AUTH_ID',
  'Marcus Johnson',
  'hs_student',
  'marcus.johnson@test.chatnil.com',
  'Basketball',
  'Jefferson High School',
  'KY',
  'approved',
  5,
  'david.johnson@test.chatnil.com',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  consent_status = EXCLUDED.consent_status;

-- Sarah Williams (HS Student - Michelle's daughter)
INSERT INTO public.athlete_profiles (
  id,
  full_name,
  role,
  email,
  sport,
  school_name,
  primary_state,
  consent_status,
  streak_count,
  parent_email,
  created_at,
  updated_at
) VALUES (
  'REPLACE_WITH_SARAH_AUTH_ID',
  'Sarah Williams',
  'hs_student',
  'sarah.williams@test.chatnil.com',
  'Soccer',
  'Lincoln High School',
  'TX',
  'pending',
  0,
  'michelle.williams@test.chatnil.com',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  consent_status = EXCLUDED.consent_status;

-- ============================================================================
-- Step 3: Create parent-child relationships
-- ============================================================================

-- David Johnson -> Marcus Johnson (approved)
INSERT INTO public.parent_child_relationships (
  parent_id,
  child_id,
  relationship_type,
  consent_status,
  created_at,
  updated_at
) VALUES (
  'REPLACE_WITH_DAVID_AUTH_ID',
  'REPLACE_WITH_MARCUS_AUTH_ID',
  'parent',
  'approved',
  NOW() - INTERVAL '3 days',
  NOW()
) ON CONFLICT (parent_id, child_id) DO UPDATE SET
  consent_status = EXCLUDED.consent_status;

-- Michelle Williams -> Sarah Williams (pending)
INSERT INTO public.parent_child_relationships (
  parent_id,
  child_id,
  relationship_type,
  consent_status,
  created_at,
  updated_at
) VALUES (
  'REPLACE_WITH_MICHELLE_AUTH_ID',
  'REPLACE_WITH_SARAH_AUTH_ID',
  'parent',
  'pending',
  NOW() - INTERVAL '1 day',
  NOW()
) ON CONFLICT (parent_id, child_id) DO UPDATE SET
  consent_status = EXCLUDED.consent_status;

-- ============================================================================
-- Step 4: Create chapter progress for Marcus (he's been learning)
-- ============================================================================

INSERT INTO public.chapter_unlocks (
  user_id,
  chapter_name,
  unlocked_at
) VALUES
  ('REPLACE_WITH_MARCUS_AUTH_ID', 'identity', NOW() - INTERVAL '5 days'),
  ('REPLACE_WITH_MARCUS_AUTH_ID', 'business', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Create conversation flow for Marcus
INSERT INTO public.conversation_flows (
  user_id,
  current_pillar,
  current_day,
  last_interaction_at,
  created_at
) VALUES (
  'REPLACE_WITH_MARCUS_AUTH_ID',
  'business',
  3,
  NOW(),
  NOW() - INTERVAL '5 days'
) ON CONFLICT (user_id) DO UPDATE SET
  current_pillar = EXCLUDED.current_pillar,
  current_day = EXCLUDED.current_day,
  last_interaction_at = EXCLUDED.last_interaction_at;
*/

-- ============================================================================
-- Quick verification queries (run after seeding):
-- ============================================================================

-- Check parent profiles
-- SELECT id, full_name, role, email FROM athlete_profiles WHERE role = 'parent';

-- Check student profiles
-- SELECT id, full_name, role, school_name, sport, consent_status FROM athlete_profiles WHERE role = 'hs_student';

-- Check relationships
-- SELECT p.full_name as parent, c.full_name as child, r.consent_status
-- FROM parent_child_relationships r
-- JOIN athlete_profiles p ON p.id = r.parent_id
-- JOIN athlete_profiles c ON c.id = r.child_id;
