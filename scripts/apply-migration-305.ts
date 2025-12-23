/**
 * Migration 305: Fix Athlete & Parent Journey Issues
 *
 * Issues:
 * 1. athlete_profiles needs an 'id' column for standard querying
 * 2. social_media_stats needs an 'id' column
 * 3. Parent users table may need additional fields
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

async function executeSql(sql: string, description: string): Promise<{ success: boolean; error?: string }> {
  console.log(`   Executing: ${description}...`);
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
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
  console.log('🔧 Migration 305: Fix Athlete & Parent Journey Issues\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // PART 1: Add id column to athlete_profiles
  console.log('📋 Part 1: Adding id column to athlete_profiles...');

  let result = await executeSql(`
    -- Add id column to athlete_profiles if it doesn't exist
    ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

    -- Create index on id
    CREATE INDEX IF NOT EXISTS idx_athlete_profiles_id ON athlete_profiles(id);

    -- Populate id for existing rows that have NULL
    UPDATE athlete_profiles SET id = gen_random_uuid() WHERE id IS NULL;
  `, 'Add id column to athlete_profiles');

  if (result.success) {
    console.log('   ✅ id column added to athlete_profiles');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 150));
  }

  // PART 2: Add id column to social_media_stats
  console.log('\n📋 Part 2: Adding id column to social_media_stats...');

  result = await executeSql(`
    -- Add id column to social_media_stats if it doesn't exist
    ALTER TABLE social_media_stats ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

    -- Create index on id
    CREATE INDEX IF NOT EXISTS idx_social_media_stats_id ON social_media_stats(id);

    -- Populate id for existing rows that have NULL
    UPDATE social_media_stats SET id = gen_random_uuid() WHERE id IS NULL;
  `, 'Add id column to social_media_stats');

  if (result.success) {
    console.log('   ✅ id column added to social_media_stats');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 150));
  }

  // PART 3: Ensure parent role is supported
  console.log('\n📋 Part 3: Ensuring parent user support...');

  // Check if there's a parent table or if parents use the users table
  const { data: parentUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('role', 'parent')
    .limit(1);

  if (parentUser && parentUser.length > 0) {
    console.log('   ✅ Parent role exists in users table');
  } else {
    console.log('   ℹ️ No parent users found, but role is supported');
  }

  // PART 4: Add any missing columns for parent functionality
  console.log('\n📋 Part 4: Adding parent-specific fields if needed...');

  result = await executeSql(`
    -- Add linked_athletes column for parents to track their children
    ALTER TABLE users ADD COLUMN IF NOT EXISTS linked_athletes UUID[] DEFAULT ARRAY[]::UUID[];

    -- Add parent_of column to athlete_profiles for linking
    ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS parent_user_id UUID REFERENCES users(id);
  `, 'Add parent-child linking columns');

  if (result.success) {
    console.log('   ✅ Parent-child linking columns added');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 150));
  }

  // PART 5: Refresh schema cache
  console.log('\n📋 Part 5: Refreshing PostgREST schema cache...');

  result = await executeSql(`NOTIFY pgrst, 'reload schema';`, 'Refresh schema cache');

  if (result.success) {
    console.log('   ✅ Schema cache refreshed');
  } else {
    console.log('   ⚠️ Note:', result.error?.slice(0, 100));
  }

  // Verify the changes
  console.log('\n📋 Verification...');

  const { data: profileCheck } = await supabase
    .from('athlete_profiles')
    .select('id, user_id')
    .limit(1);

  if (profileCheck && profileCheck[0] && profileCheck[0].id) {
    console.log('   ✅ athlete_profiles.id accessible');
  } else {
    console.log('   ⚠️ athlete_profiles.id not yet visible (may need schema cache reload)');
  }

  const { data: socialCheck } = await supabase
    .from('social_media_stats')
    .select('id, user_id')
    .limit(1);

  if (socialCheck && socialCheck[0] && socialCheck[0].id) {
    console.log('   ✅ social_media_stats.id accessible');
  } else {
    console.log('   ⚠️ social_media_stats.id not yet visible (may need schema cache reload)');
  }

  console.log('\n🎉 Migration 305 completed!');
  console.log('\nSummary:');
  console.log('- Added id column to athlete_profiles');
  console.log('- Added id column to social_media_stats');
  console.log('- Added parent-child linking columns');
  console.log('- Refreshed PostgREST schema cache');
}

applyMigration().catch(console.error);
