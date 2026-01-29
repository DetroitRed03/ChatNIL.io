/**
 * Seed Parent Dashboard Test Users
 *
 * Creates:
 * - David Johnson (parent) with Marcus Johnson (hs_student, approved)
 * - Michelle Williams (parent) with Sarah Williams (hs_student, pending)
 * - Lisa Smith (parent) with Jordan Smith (hs_student, approved)
 *
 * Run: npx tsx scripts/seed-parent-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    const env: Record<string, string> = {};
    for (const line of lines) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    }
    return env;
  } catch {
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

interface TestUser {
  email: string;
  password: string;
  fullName: string;
  role: 'parent' | 'hs_student';
  sport?: string;
  school?: string;
  state?: string;
  consentStatus?: string;
  streakCount?: number;
  parentEmail?: string;
}

const testUsers: TestUser[] = [
  // Parents
  {
    email: 'david.johnson@test.chatnil.com',
    password: 'password123',
    fullName: 'David Johnson',
    role: 'parent',
  },
  {
    email: 'michelle.williams@test.chatnil.com',
    password: 'password123',
    fullName: 'Michelle Williams',
    role: 'parent',
  },
  // Children
  {
    email: 'marcus.johnson@test.chatnil.com',
    password: 'password123',
    fullName: 'Marcus Johnson',
    role: 'hs_student',
    sport: 'Basketball',
    school: 'Jefferson High School',
    state: 'KY',
    consentStatus: 'approved',
    streakCount: 5,
    parentEmail: 'david.johnson@test.chatnil.com',
  },
  {
    email: 'sarah.williams@test.chatnil.com',
    password: 'password123',
    fullName: 'Sarah Williams',
    role: 'hs_student',
    sport: 'Soccer',
    school: 'Lincoln High School',
    state: 'TX',
    consentStatus: 'pending',
    streakCount: 0,
    parentEmail: 'michelle.williams@test.chatnil.com',
  },
  // Jordan Smith + parent
  {
    email: 'lisa.smith@test.chatnil.com',
    password: 'password123',
    fullName: 'Lisa Smith',
    role: 'parent',
  },
  {
    email: 'jordan.smith@test.chatnil.com',
    password: 'password123',
    fullName: 'Jordan Smith',
    role: 'hs_student',
    sport: 'Football',
    school: 'Westside High School',
    state: 'GA',
    consentStatus: 'approved',
    streakCount: 3,
    parentEmail: 'lisa.smith@test.chatnil.com',
  },
];

async function createUser(user: TestUser): Promise<string | null> {
  console.log(`Creating user: ${user.email}...`);

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find(u => u.email === user.email);

  if (existing) {
    console.log(`  User ${user.email} already exists (ID: ${existing.id})`);
    return existing.id;
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
  });

  if (authError) {
    console.error(`  Failed to create auth user: ${authError.message}`);
    return null;
  }

  const userId = authData.user.id;
  console.log(`  Created auth user (ID: ${userId})`);

  // Create athlete profile (set id = auth user id to match codebase convention)
  const profileData: Record<string, unknown> = {
    id: userId,
    user_id: userId,
    username: user.fullName,
    role: user.role,
    sport: user.sport || null,
    school_name: user.school || null,
    primary_state: user.state || null,
    consent_status: user.consentStatus || (user.role === 'parent' ? 'not_required' : undefined),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error: profileError } = await supabase
    .from('athlete_profiles')
    .upsert(profileData, { onConflict: 'user_id' });

  if (profileError) {
    console.error(`  Failed to create profile: ${profileError.message}`);
  } else {
    console.log(`  Created profile for ${user.fullName}`);
  }

  return userId;
}

async function createRelationship(parentId: string, childId: string, status: string) {
  console.log(`Creating relationship: parent ${parentId} -> child ${childId} (${status})`);

  // Try parent_child_relationships first
  const { error: pcrError } = await supabase
    .from('parent_child_relationships')
    .upsert({
      parent_id: parentId,
      child_id: childId,
      relationship_type: 'parent',
      consent_status: status,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (pcrError) {
    console.log(`  parent_child_relationships failed: ${pcrError.message}`);

    // Try parent_athlete_relationships as fallback
    const { error: parError } = await supabase
      .from('parent_athlete_relationships')
      .upsert({
        parent_id: parentId,
        athlete_id: childId,
        relationship_type: 'parent',
        verified: status === 'approved',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (parError) {
      console.error(`  parent_athlete_relationships also failed: ${parError.message}`);
    } else {
      console.log(`  Created via parent_athlete_relationships`);
    }
  } else {
    console.log(`  Created via parent_child_relationships`);
  }
}

async function createChapterProgress(userId: string, chapters: string[]) {
  console.log(`Creating chapter progress for ${userId}...`);

  for (const chapter of chapters) {
    const { error } = await supabase
      .from('chapter_unlocks')
      .upsert({
        user_id: userId,
        chapter_name: chapter,
        unlocked_via: 'conversation',
        unlocked_at: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (error) {
      console.log(`  Chapter ${chapter}: ${error.message}`);
    } else {
      console.log(`  Unlocked chapter: ${chapter}`);
    }
  }

  // Create conversation flow
  const { error: flowError } = await supabase
    .from('conversation_flows')
    .upsert({
      user_id: userId,
      current_pillar: 'business',
      current_day: 3,
      last_interaction_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    });

  if (flowError) {
    console.log(`  Conversation flow: ${flowError.message}`);
  } else {
    console.log(`  Created conversation flow`);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Seeding Parent Dashboard Test Users');
  console.log('='.repeat(60));
  console.log('');

  const userIds: Record<string, string> = {};

  // Create all users
  for (const user of testUsers) {
    const userId = await createUser(user);
    if (userId) {
      userIds[user.email] = userId;
    }
    console.log('');
  }

  // Create relationships
  console.log('Creating parent-child relationships...');
  console.log('');

  if (userIds['david.johnson@test.chatnil.com'] && userIds['marcus.johnson@test.chatnil.com']) {
    await createRelationship(
      userIds['david.johnson@test.chatnil.com'],
      userIds['marcus.johnson@test.chatnil.com'],
      'approved'
    );
  }

  if (userIds['michelle.williams@test.chatnil.com'] && userIds['sarah.williams@test.chatnil.com']) {
    await createRelationship(
      userIds['michelle.williams@test.chatnil.com'],
      userIds['sarah.williams@test.chatnil.com'],
      'pending'
    );
  }

  if (userIds['lisa.smith@test.chatnil.com'] && userIds['jordan.smith@test.chatnil.com']) {
    await createRelationship(
      userIds['lisa.smith@test.chatnil.com'],
      userIds['jordan.smith@test.chatnil.com'],
      'approved'
    );
  }

  console.log('');

  // Create progress for Marcus (approved child)
  if (userIds['marcus.johnson@test.chatnil.com']) {
    await createChapterProgress(userIds['marcus.johnson@test.chatnil.com'], ['identity', 'business']);
  }

  // Create progress for Jordan (approved child)
  if (userIds['jordan.smith@test.chatnil.com']) {
    await createChapterProgress(userIds['jordan.smith@test.chatnil.com'], ['identity']);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Seeding Complete!');
  console.log('='.repeat(60));
  console.log('');
  console.log('Test Credentials:');
  console.log('');
  console.log('Parent 1 (Approved Child):');
  console.log('  Email: david.johnson@test.chatnil.com');
  console.log('  Password: password123');
  console.log('');
  console.log('Parent 2 (Pending Child):');
  console.log('  Email: michelle.williams@test.chatnil.com');
  console.log('  Password: password123');
  console.log('');
  console.log('Parent 3 (Approved Child - Jordan):');
  console.log('  Email: lisa.smith@test.chatnil.com');
  console.log('  Password: password123');
  console.log('');
  console.log('HS Student (Jordan Smith):');
  console.log('  Email: jordan.smith@test.chatnil.com');
  console.log('  Password: password123');
  console.log('');
}

main().catch(console.error);
