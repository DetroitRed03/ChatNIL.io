#!/usr/bin/env tsx

/**
 * Fresh Test Data Seed Script - 4-Role Compliance Platform
 * =========================================================
 * Seeds the database with test users for all 4 roles:
 * - High School Students (2)
 * - College Athletes (2)
 * - Parents (2)
 * - Compliance Officers (2)
 *
 * Includes proper relationships, deals with predictable compliance scores,
 * and discovery profiles.
 *
 * Usage:
 *   npx tsx scripts/seed-fresh-test-data.ts
 *   npx tsx scripts/seed-fresh-test-data.ts --clean
 *   npx tsx scripts/seed-fresh-test-data.ts --role=hs_student
 *   npx tsx scripts/seed-fresh-test-data.ts --role=college_athlete
 *
 * Test Credentials:
 *   All users: password123
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Parse CLI arguments
const args = process.argv.slice(2);
const shouldClean = args.includes('--clean');
const roleFilter = args.find((a) => a.startsWith('--role='))?.split('=')[1];

// Default password for all test users
const TEST_PASSWORD = 'password123';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TestUser {
  email: string;
  password: string;
  role: 'hs_student' | 'college_athlete' | 'parent' | 'compliance_officer';
  profile: {
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth?: string;
    sport?: string;
    position?: string;
    school_name?: string;
    school_level?: string;
    graduation_year?: number;
    primary_state: string;
    bio?: string;
    hobbies?: string[];
    nil_interests?: string[];
    nil_goals?: string;
  };
  institution?: string; // For linking to institution
  parentEmail?: string; // For parent-child relationship
  childEmail?: string; // For parent-child relationship
}

interface TestInstitution {
  name: string;
  type: 'high_school' | 'college' | 'university';
  state: string;
  conference?: string;
}

interface TestDeal {
  athleteEmail: string;
  deal_title: string;
  brand_name: string;
  third_party_name: string;
  deal_type: string;
  compensation_amount: number;
  description: string;
  status: string;
  expectedScore: {
    total: number;
    status: 'green' | 'yellow' | 'red';
    policyFit: number;
    fmv: number;
    document: number;
    tax: number;
    brandSafety: number;
    guardianConsent: number;
  };
}

// ============================================================================
// TEST DATA DEFINITIONS
// ============================================================================

const institutions: TestInstitution[] = [
  {
    name: 'The Ohio State University',
    type: 'university',
    state: 'OH',
    conference: 'Big Ten',
  },
  {
    name: 'University of California, Los Angeles',
    type: 'university',
    state: 'CA',
    conference: 'Big Ten',
  },
  {
    name: 'Jefferson High School',
    type: 'high_school',
    state: 'OH',
  },
  {
    name: 'Austin Preparatory Academy',
    type: 'high_school',
    state: 'TX',
  },
];

const testUsers: TestUser[] = [
  // ========== HIGH SCHOOL STUDENTS ==========
  {
    email: 'marcus.johnson@test.chatnil.com',
    password: TEST_PASSWORD,
    role: 'hs_student',
    profile: {
      first_name: 'Marcus',
      last_name: 'Johnson',
      full_name: 'Marcus Johnson',
      date_of_birth: '2008-03-15',
      sport: 'Basketball',
      position: 'Point Guard',
      school_name: 'Jefferson High School',
      school_level: 'high_school',
      graduation_year: 2026,
      primary_state: 'OH',
      bio: 'Rising star point guard with big dreams and bigger handles.',
      hobbies: ['Gaming', 'Music Production', 'Sneaker Collecting'],
      nil_interests: ['Sportswear', 'Gaming', 'Music'],
      nil_goals: 'Build my brand while learning the business side of sports.',
    },
    institution: 'Jefferson High School',
    parentEmail: 'david.johnson@test.chatnil.com',
  },
  {
    email: 'sarah.williams@test.chatnil.com',
    password: TEST_PASSWORD,
    role: 'hs_student',
    profile: {
      first_name: 'Sarah',
      last_name: 'Williams',
      full_name: 'Sarah Williams',
      date_of_birth: '2007-08-22',
      sport: 'Volleyball',
      position: 'Outside Hitter',
      school_name: 'Austin Preparatory Academy',
      school_level: 'high_school',
      graduation_year: 2025,
      primary_state: 'TX',
      bio: 'Varsity captain leading the pack to state championships.',
      hobbies: ['Fitness', 'Cooking', 'Photography'],
      nil_interests: ['Fitness', 'Fashion', 'Nutrition'],
      nil_goals: 'Prepare for college NIL opportunities while staying compliant.',
    },
    institution: 'Austin Preparatory Academy',
    parentEmail: 'michelle.williams@test.chatnil.com',
  },

  // ========== COLLEGE ATHLETES ==========
  {
    email: 'james.mitchell@test.chatnil.com',
    password: TEST_PASSWORD,
    role: 'college_athlete',
    profile: {
      first_name: 'James',
      last_name: 'Mitchell',
      full_name: 'James Mitchell',
      date_of_birth: '2003-05-10',
      sport: 'Football',
      position: 'Wide Receiver',
      school_name: 'The Ohio State University',
      school_level: 'college',
      graduation_year: 2026,
      primary_state: 'OH',
      bio: 'D1 wide receiver. 4.4 forty. Ready to make an impact on and off the field.',
      hobbies: ['Gaming', 'Fashion', 'Community Service'],
      nil_interests: ['Sportswear', 'Gaming', 'Fast Food'],
      nil_goals: 'Maximize NIL while staying NCAA compliant.',
    },
    institution: 'The Ohio State University',
  },
  {
    email: 'emma.rodriguez@test.chatnil.com',
    password: TEST_PASSWORD,
    role: 'college_athlete',
    profile: {
      first_name: 'Emma',
      last_name: 'Rodriguez',
      full_name: 'Emma Rodriguez',
      date_of_birth: '2004-11-03',
      sport: 'Soccer',
      position: 'Forward',
      school_name: 'University of California, Los Angeles',
      school_level: 'college',
      graduation_year: 2027,
      primary_state: 'CA',
      bio: 'UCLA soccer star with 150K followers and a passion for fitness content.',
      hobbies: ['Yoga', 'Cooking', 'Travel'],
      nil_interests: ['Fitness', 'Athleisure', 'Travel'],
      nil_goals: 'Build a sustainable brand that extends beyond my playing career.',
    },
    institution: 'University of California, Los Angeles',
  },

  // ========== PARENTS ==========
  {
    email: 'david.johnson@test.chatnil.com',
    password: TEST_PASSWORD,
    role: 'parent',
    profile: {
      first_name: 'David',
      last_name: 'Johnson',
      full_name: 'David Johnson',
      date_of_birth: '1978-07-12',
      primary_state: 'OH',
      bio: 'Proud father supporting Marcus on his NIL journey.',
    },
    childEmail: 'marcus.johnson@test.chatnil.com',
  },
  {
    email: 'michelle.williams@test.chatnil.com',
    password: TEST_PASSWORD,
    role: 'parent',
    profile: {
      first_name: 'Michelle',
      last_name: 'Williams',
      full_name: 'Michelle Williams',
      date_of_birth: '1980-02-28',
      primary_state: 'TX',
      bio: 'Making sure Sarah understands her NIL rights and obligations.',
    },
    childEmail: 'sarah.williams@test.chatnil.com',
  },

  // ========== COMPLIANCE OFFICERS ==========
  {
    email: 'robert.chen@test.chatnil.com',
    password: TEST_PASSWORD,
    role: 'compliance_officer',
    profile: {
      first_name: 'Robert',
      last_name: 'Chen',
      full_name: 'Robert Chen',
      primary_state: 'OH',
      bio: 'Ohio State Athletics Compliance Director',
    },
    institution: 'The Ohio State University',
  },
  {
    email: 'patricia.martinez@test.chatnil.com',
    password: TEST_PASSWORD,
    role: 'compliance_officer',
    profile: {
      first_name: 'Patricia',
      last_name: 'Martinez',
      full_name: 'Patricia Martinez',
      primary_state: 'CA',
      bio: 'UCLA Athletics Compliance Officer',
    },
    institution: 'University of California, Los Angeles',
  },
];

// Test deals with predictable compliance scores
const testDeals: TestDeal[] = [
  // ========== JAMES MITCHELL'S DEALS ==========
  // Deal 1: GREEN (92/100) - Perfect third-party deal
  {
    athleteEmail: 'james.mitchell@test.chatnil.com',
    deal_title: 'Nike Social Media Campaign',
    brand_name: 'Nike',
    third_party_name: 'Nike, Inc.',
    deal_type: 'social_post',
    compensation_amount: 5000,
    description: 'Three Instagram posts featuring Nike training gear over 30 days.',
    status: 'active',
    expectedScore: {
      total: 92,
      status: 'green',
      policyFit: 95,
      fmv: 90,
      document: 90,
      tax: 85,
      brandSafety: 100,
      guardianConsent: 100,
    },
  },
  // Deal 2: GREEN (85/100) - Good local business deal
  {
    athleteEmail: 'james.mitchell@test.chatnil.com',
    deal_title: 'Columbus Auto Appearance',
    brand_name: 'Columbus Auto Group',
    third_party_name: 'Columbus Auto Group LLC',
    deal_type: 'appearance',
    compensation_amount: 1500,
    description: 'Two-hour appearance at dealership grand opening.',
    status: 'completed',
    expectedScore: {
      total: 85,
      status: 'green',
      policyFit: 90,
      fmv: 85,
      document: 80,
      tax: 80,
      brandSafety: 90,
      guardianConsent: 100,
    },
  },
  // Deal 3: YELLOW (65/100) - Missing documentation
  {
    athleteEmail: 'james.mitchell@test.chatnil.com',
    deal_title: 'Protein Supplement Endorsement',
    brand_name: 'MaxGains Nutrition',
    third_party_name: 'MaxGains LLC',
    deal_type: 'endorsement',
    compensation_amount: 8000,
    description: 'Brand ambassador for protein supplements. Monthly posts.',
    status: 'pending',
    expectedScore: {
      total: 65,
      status: 'yellow',
      policyFit: 70,
      fmv: 75,
      document: 40,
      tax: 60,
      brandSafety: 70,
      guardianConsent: 100,
    },
  },
  // Deal 4: RED (35/100) - Pay-for-play concerns
  {
    athleteEmail: 'james.mitchell@test.chatnil.com',
    deal_title: 'Booster Collective Deal',
    brand_name: 'Buckeye Victory Fund',
    third_party_name: 'Buckeye Victory Fund',
    deal_type: 'other',
    compensation_amount: 25000,
    description: 'Monthly stipend from collective. No specific deliverables.',
    status: 'on_hold',
    expectedScore: {
      total: 35,
      status: 'red',
      policyFit: 20,
      fmv: 30,
      document: 30,
      tax: 50,
      brandSafety: 40,
      guardianConsent: 100,
    },
  },

  // ========== EMMA RODRIGUEZ'S DEALS ==========
  // Deal 1: GREEN (88/100) - Athletic apparel deal
  {
    athleteEmail: 'emma.rodriguez@test.chatnil.com',
    deal_title: 'Lululemon Ambassador',
    brand_name: 'Lululemon',
    third_party_name: 'Lululemon Athletica, Inc.',
    deal_type: 'brand_ambassador',
    compensation_amount: 10000,
    description: 'Quarterly content creation featuring Lululemon products.',
    status: 'active',
    expectedScore: {
      total: 88,
      status: 'green',
      policyFit: 90,
      fmv: 85,
      document: 90,
      tax: 85,
      brandSafety: 95,
      guardianConsent: 100,
    },
  },
];

// Discovery data for HS students
const discoveryData = {
  'marcus.johnson@test.chatnil.com': {
    current_pillar: 'business' as const,
    current_day: 3,
    unlockedChapters: ['identity', 'business'],
    pillars_completed: ['identity'],
    profile_completeness: 50,
    sport: 'Basketball',
    position: 'Point Guard',
    social_platforms: JSON.stringify(['instagram', 'tiktok']),
    follower_count_total: 5200,
    engagement_rate: 4.5,
    nil_interest_level: 'interested' as const,
    nil_experience_level: 'beginner' as const,
    has_bank_account: true,
    understands_tax_obligations: false,
    financial_independence_level: 'dependent' as const,
    athletic_aspirations: 'Play D1 basketball and eventually professional',
    career_aspirations: 'Sports media or coaching after playing career',
    causes_passionate_about: ['Youth mentorship', 'Education equity'],
  },
  'sarah.williams@test.chatnil.com': {
    current_pillar: 'money' as const,
    current_day: 1,
    unlockedChapters: ['identity', 'business', 'money'],
    pillars_completed: ['identity', 'business'],
    profile_completeness: 75,
    sport: 'Volleyball',
    position: 'Outside Hitter',
    social_platforms: JSON.stringify(['instagram', 'twitter']),
    follower_count_total: 8500,
    engagement_rate: 5.2,
    nil_interest_level: 'ready' as const,
    nil_experience_level: 'some' as const,
    has_bank_account: true,
    understands_tax_obligations: true,
    financial_independence_level: 'partial' as const,
    athletic_aspirations: 'Play D1 volleyball at a top program',
    career_aspirations: 'Sports marketing or athletic training',
    causes_passionate_about: ['Women in sports', 'Mental health awareness'],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function cleanTestData(): Promise<void> {
  console.log('\n🧹 Cleaning existing test data...');

  const testEmails = testUsers.map((u) => u.email);

  // Get user IDs for test users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const users = authUsers?.users || [];
  const testAuthUsers = users.filter((u: { email?: string }) => testEmails.includes(u.email || ''));

  // Delete from auth (cascades to users/profiles)
  for (const user of testAuthUsers) {
    try {
      await supabase.auth.admin.deleteUser(user.id);
      console.log(`  Deleted auth user: ${user.email}`);
    } catch (err) {
      // Ignore if already deleted
    }
  }

  // Clean up orphaned data
  for (const email of testEmails) {
    await supabase.from('users').delete().eq('email', email);
    await supabase.from('profiles').delete().eq('email', email);
  }

  // Clean test institutions
  for (const inst of institutions) {
    await supabase.from('institutions').delete().eq('name', inst.name);
  }

  console.log('✅ Test data cleaned\n');
}

async function createAuthUser(
  email: string,
  password: string
): Promise<{ id: string; email: string } | null> {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const users = existingUsers?.users || [];
  const existing = users.find((u: { email?: string; id: string }) => u.email === email);
  if (existing) {
    console.log(`  User already exists: ${email}`);
    return { id: existing.id, email: existing.email || email };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { email_verified: true },
  });

  if (error) {
    console.error(`  ❌ Failed to create auth user ${email}:`, error.message);
    return null;
  }

  return data.user ? { id: data.user.id, email: data.user.email || email } : null;
}

async function seedInstitutions(supabase: SupabaseClient): Promise<Map<string, string>> {
  console.log('\n🏫 Seeding Institutions...');
  const institutionMap = new Map<string, string>();

  for (const inst of institutions) {
    // Check if exists first
    const { data: existing } = await supabase
      .from('institutions')
      .select('id')
      .eq('name', inst.name)
      .single();

    if (existing) {
      institutionMap.set(inst.name, existing.id);
      console.log(`  Already exists: ${inst.name}`);
      continue;
    }

    const { data, error } = await supabase
      .from('institutions')
      .insert({
        name: inst.name,
        type: inst.type,
        state: inst.state,
        conference: inst.conference,
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  ❌ Failed to create institution ${inst.name}:`, error.message);
      continue;
    }

    institutionMap.set(inst.name, data.id);
    console.log(`  ✅ Created: ${inst.name}`);
  }

  return institutionMap;
}

async function seedUsers(
  supabase: SupabaseClient,
  institutionMap: Map<string, string>
): Promise<Map<string, string>> {
  console.log('\n👤 Seeding Users...');
  const userMap = new Map<string, string>();

  // Filter by role if specified
  const usersToSeed = roleFilter
    ? testUsers.filter((u) => u.role === roleFilter)
    : testUsers;

  for (const testUser of usersToSeed) {
    // Create auth user
    const authUser = await createAuthUser(testUser.email, testUser.password);
    if (!authUser) continue;

    userMap.set(testUser.email, authUser.id);

    // Map role for database
    const dbRole =
      testUser.role === 'college_athlete' ? 'athlete' : testUser.role;

    // Upsert into users table
    const userData: Record<string, any> = {
      id: authUser.id,
      email: testUser.email,
      first_name: testUser.profile.first_name,
      last_name: testUser.profile.last_name,
      full_name: testUser.profile.full_name,
      role: dbRole,
      username: testUser.email.split('@')[0].replace('.', '_'),
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await supabase.from('users').upsert(userData, { onConflict: 'id' });

    // Create athlete_profiles for athletes
    if (testUser.role === 'hs_student' || testUser.role === 'college_athlete') {
      const institutionId = testUser.institution
        ? institutionMap.get(testUser.institution)
        : null;

      const athleteProfile: Record<string, any> = {
        id: authUser.id,
        user_id: authUser.id,
        role: testUser.role,
        sport: testUser.profile.sport,
        position: testUser.profile.position,
        school_name: testUser.profile.school_name,
        school_level: testUser.profile.school_level,
        graduation_year: testUser.profile.graduation_year,
        year: testUser.profile.graduation_year,
        primary_state: testUser.profile.primary_state,
        state: testUser.profile.primary_state, // Also set 'state' column
        bio: testUser.profile.bio,
        nil_interests: testUser.profile.nil_interests,
        nil_goals: testUser.profile.nil_goals ? [testUser.profile.nil_goals] : null,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add date_of_birth if available
      if (testUser.profile.date_of_birth) {
        athleteProfile.date_of_birth = testUser.profile.date_of_birth;
      }

      // Try to insert into athlete_profiles (delete first if exists)
      await supabase.from('athlete_profiles').delete().eq('user_id', authUser.id);
      const { error: profileError } = await supabase
        .from('athlete_profiles')
        .insert(athleteProfile);

      if (profileError) {
        console.error(
          `  ⚠️ athlete_profiles error for ${testUser.email}:`,
          profileError.message
        );
      }

      // Also try profiles table
      const profileData: Record<string, any> = {
        id: authUser.id,
        email: testUser.email,
        full_name: testUser.profile.full_name,
        role: testUser.role,
        primary_state: testUser.profile.primary_state,
        institution_id: institutionId,
        consent_status:
          testUser.role === 'hs_student' ? 'pending' : 'not_required',
        learning_path: testUser.role === 'hs_student' ? 'foundation' : null,
      };

      if (testUser.profile.date_of_birth) {
        profileData.date_of_birth = testUser.profile.date_of_birth;
      }

      const { error: profiles2Error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profiles2Error) {
        // Profiles table may not exist with these columns, ignore
      }
    }

    // Create institution_staff for compliance officers
    if (testUser.role === 'compliance_officer' && testUser.institution) {
      const institutionId = institutionMap.get(testUser.institution);
      if (institutionId) {
        await supabase.from('institution_staff').upsert(
          {
            user_id: authUser.id,
            institution_id: institutionId,
            role: 'compliance_officer',
            title: testUser.profile.bio,
            is_primary_contact: true,
            permissions: {
              can_view_athletes: true,
              can_review_deals: true,
              can_approve_deals: true,
            },
          },
          { onConflict: 'user_id,institution_id' }
        );
      }
    }

    console.log(`  ✅ Created ${testUser.role}: ${testUser.profile.full_name} (${testUser.email})`);
  }

  return userMap;
}

async function seedParentChildRelationships(
  supabase: SupabaseClient,
  userMap: Map<string, string>
): Promise<void> {
  console.log('\n👨‍👧 Seeding Parent-Child Relationships...');

  const parentUsers = testUsers.filter(
    (u) => u.role === 'parent' && u.childEmail
  );

  for (const parent of parentUsers) {
    const parentId = userMap.get(parent.email);
    const childId = parent.childEmail ? userMap.get(parent.childEmail) : null;

    if (!parentId || !childId) {
      console.log(`  ⚠️ Missing user for relationship: ${parent.email} -> ${parent.childEmail}`);
      continue;
    }

    const { error } = await supabase.from('parent_child_relationships').upsert(
      {
        parent_id: parentId,
        child_id: childId,
        relationship_type: 'parent',
        consent_status: 'approved',
        consent_given_at: new Date().toISOString(),
        verification_method: 'email',
        verified_at: new Date().toISOString(),
      },
      { onConflict: 'parent_id,child_id' }
    );

    if (error) {
      console.error(`  ❌ Failed to create relationship:`, error.message);
      continue;
    }

    // Update the child's profile with consent status
    const childUser = testUsers.find((u) => u.email === parent.childEmail);
    if (childUser) {
      await supabase
        .from('athlete_profiles')
        .update({ consent_status: 'approved', parent_email: parent.email })
        .eq('id', childId);

      await supabase
        .from('profiles')
        .update({ consent_status: 'approved', parent_user_id: parentId })
        .eq('id', childId);
    }

    console.log(`  ✅ ${parent.profile.full_name} -> ${parent.childEmail?.split('@')[0]}`);
  }
}

async function seedDealsAndComplianceScores(
  supabase: SupabaseClient,
  userMap: Map<string, string>
): Promise<void> {
  console.log('\n💰 Seeding Deals and Compliance Scores...');

  for (const deal of testDeals) {
    const athleteId = userMap.get(deal.athleteEmail);
    if (!athleteId) {
      console.log(`  ⚠️ Athlete not found: ${deal.athleteEmail}`);
      continue;
    }

    // Find athlete's state
    const athlete = testUsers.find((u) => u.email === deal.athleteEmail);
    const state = athlete?.profile.primary_state || 'OH';

    // Create the deal (agency_id set to athlete_id for self-created deals)
    const { data: dealData, error: dealError } = await supabase
      .from('nil_deals')
      .insert({
        athlete_id: athleteId,
        agency_id: athleteId, // Self-created deal - athlete is the "agency"
        deal_title: deal.deal_title,
        brand_name: deal.brand_name,
        third_party_name: deal.third_party_name,
        deal_type: deal.deal_type,
        compensation_amount: deal.compensation_amount,
        description: deal.description,
        status: deal.status,
        compliance_status: deal.expectedScore.status,
        is_third_party_verified: deal.expectedScore.status === 'green',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (dealError) {
      console.error(`  ❌ Failed to create deal "${deal.deal_title}":`, dealError.message);
      continue;
    }

    // Create compliance score
    const { error: scoreError } = await supabase.from('compliance_scores').insert({
      deal_id: dealData.id,
      user_id: athleteId,
      policy_fit_score: deal.expectedScore.policyFit,
      fmv_score: deal.expectedScore.fmv,
      fmv_estimated: deal.compensation_amount,
      document_score: deal.expectedScore.document,
      tax_score: deal.expectedScore.tax,
      w9_required: deal.compensation_amount >= 600,
      w9_submitted: deal.expectedScore.tax >= 80,
      brand_safety_score: deal.expectedScore.brandSafety,
      guardian_consent_score: deal.expectedScore.guardianConsent,
      consent_required: false,
      consent_obtained: true,
      total_score: deal.expectedScore.total,
      status: deal.expectedScore.status,
      scored_at: new Date().toISOString(),
    });

    if (scoreError) {
      console.error(`  ❌ Failed to create compliance score:`, scoreError.message);
      continue;
    }

    const statusEmoji =
      deal.expectedScore.status === 'green'
        ? '🟢'
        : deal.expectedScore.status === 'yellow'
        ? '🟡'
        : '🔴';
    console.log(
      `  ${statusEmoji} ${deal.deal_title} (${deal.expectedScore.total}/100) - ${deal.athleteEmail.split('@')[0]}`
    );
  }
}

async function seedDiscoveryProfiles(
  supabase: SupabaseClient,
  userMap: Map<string, string>
): Promise<void> {
  console.log('\n📚 Seeding Discovery Profiles & Chapter Unlocks...');

  for (const [email, data] of Object.entries(discoveryData)) {
    const userId = userMap.get(email);
    if (!userId) {
      console.log(`  ⚠️ User not found: ${email}`);
      continue;
    }

    // Create student_discovery_profiles
    const { error: profileError } = await supabase
      .from('student_discovery_profiles')
      .upsert({
        user_id: userId,
        sport: data.sport,
        position: data.position,
        social_platforms: data.social_platforms,
        follower_count_total: data.follower_count_total,
        engagement_rate: data.engagement_rate,
        nil_interest_level: data.nil_interest_level,
        nil_experience_level: data.nil_experience_level,
        has_bank_account: data.has_bank_account,
        understands_tax_obligations: data.understands_tax_obligations,
        financial_independence_level: data.financial_independence_level,
        athletic_aspirations: data.athletic_aspirations,
        career_aspirations: data.career_aspirations,
        causes_passionate_about: data.causes_passionate_about,
        current_pillar: data.current_pillar,
        pillars_completed: data.pillars_completed,
        profile_completeness: data.profile_completeness,
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error(`  ⚠️ Discovery profile error for ${email}:`, profileError.message);
    }

    // Create conversation_flows
    const { error: flowError } = await supabase.from('conversation_flows').upsert({
      user_id: userId,
      flow_type: 'discovery',
      current_pillar: data.current_pillar,
      current_day: data.current_day,
      status: data.pillars_completed.length === 4 ? 'completed' : 'active',
      last_interaction_at: new Date().toISOString(),
    });

    if (flowError) {
      console.error(`  ⚠️ Conversation flow error for ${email}:`, flowError.message);
    }

    // Create chapter_unlocks for each unlocked chapter
    for (const chapter of data.unlockedChapters) {
      const { error: chapterError } = await supabase.from('chapter_unlocks').upsert(
        {
          user_id: userId,
          chapter_name: chapter,
          chapter_category: chapter,
          unlocked_via: 'conversation',
          quiz_passed: data.pillars_completed.includes(chapter),
          quiz_score: data.pillars_completed.includes(chapter) ? 85 : null,
          content_progress: data.pillars_completed.includes(chapter) ? 100 : 50,
          unlocked_at: new Date().toISOString(),
          completed_at: data.pillars_completed.includes(chapter)
            ? new Date().toISOString()
            : null,
        },
        { onConflict: 'user_id,chapter_name' }
      );

      if (chapterError) {
        console.error(`  ⚠️ Chapter unlock error:`, chapterError.message);
      }
    }

    console.log(`  ✅ ${email.split('@')[0]}: ${data.unlockedChapters.length}/4 chapters`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     ChatNIL 4-Role Compliance Platform - Test Data Seed      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  if (roleFilter) {
    console.log(`🔍 Filtering by role: ${roleFilter}`);
  }

  try {
    // Clean if requested
    if (shouldClean) {
      await cleanTestData();
    }

    // Seed in order
    const institutionMap = await seedInstitutions(supabase);
    const userMap = await seedUsers(supabase, institutionMap);
    await seedParentChildRelationships(supabase, userMap);
    await seedDealsAndComplianceScores(supabase, userMap);
    await seedDiscoveryProfiles(supabase, userMap);

    // Print summary
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    SEEDING COMPLETE                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Summary:');
    console.log('┌─────────────────────────────────────────────────────────────────┐');
    console.log('│ Role                 │ Count │ Email Examples                   │');
    console.log('├─────────────────────────────────────────────────────────────────┤');
    console.log('│ HS Student           │   2   │ marcus.johnson@, sarah.williams@ │');
    console.log('│ College Athlete      │   2   │ james.mitchell@, emma.rodriguez@ │');
    console.log('│ Parent               │   2   │ david.johnson@, michelle.williams│');
    console.log('│ Compliance Officer   │   2   │ robert.chen@, patricia.martinez@ │');
    console.log('└─────────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('🏫 Institutions: 4 (Ohio State, UCLA, Jefferson HS, Austin Prep)');
    console.log('💰 Deals: 5 (4 for James, 1 for Emma)');
    console.log('📚 Discovery: 2 HS students with chapter progress');
    console.log('');
    console.log('🔐 All users can login with password: password123');
    console.log('');
    console.log('📋 Deal Compliance Scores:');
    console.log('   🟢 Nike Social Media Campaign          (92/100)');
    console.log('   🟢 Columbus Auto Appearance            (85/100)');
    console.log('   🟡 Protein Supplement Endorsement      (65/100)');
    console.log('   🔴 Booster Collective Deal             (35/100)');
    console.log('   🟢 Lululemon Ambassador                (88/100)');
    console.log('');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
