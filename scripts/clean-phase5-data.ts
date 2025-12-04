/**
 * Phase 5 FMV System - Cleanup Script
 * Removes all test data created by seed-phase5-data.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanPhase5Data() {
  console.log('🧹 Cleaning Phase 5 FMV System test data...\n');
  console.log('📊 Supabase URL:', SUPABASE_URL);
  console.log('');

  try {
    // 1. Find all test users (emails ending in @test.com)
    const { data: testUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .like('email', '%@test.com');

    if (fetchError) {
      throw fetchError;
    }

    if (!testUsers || testUsers.length === 0) {
      console.log('✅ No test data found. Nothing to clean.\n');
      return;
    }

    console.log(`Found ${testUsers.length} test users:\n`);
    testUsers.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
    });
    console.log('');

    // 2. Delete related data (cascade will handle most, but let's be explicit)
    console.log('🗑️  Deleting related data...\n');

    for (const user of testUsers) {
      // Delete FMV data
      const { error: fmvError } = await supabase
        .from('athlete_fmv_data')
        .delete()
        .eq('athlete_id', user.id);

      if (fmvError && fmvError.code !== 'PGRST116') { // Ignore "not found" errors
        console.error(`  ⚠️  Error deleting FMV data for ${user.email}:`, fmvError.message);
      }

      // Delete social media stats
      const { error: socialError } = await supabase
        .from('social_media_stats')
        .delete()
        .eq('user_id', user.id);

      if (socialError && socialError.code !== 'PGRST116') {
        console.error(`  ⚠️  Error deleting social stats for ${user.email}:`, socialError.message);
      }

      // Delete NIL deals
      const { error: dealsError } = await supabase
        .from('nil_deals')
        .delete()
        .eq('athlete_id', user.id);

      if (dealsError && dealsError.code !== 'PGRST116') {
        console.error(`  ⚠️  Error deleting NIL deals for ${user.email}:`, dealsError.message);
      }
    }

    console.log('✅ Related data deleted\n');

    // 3. Delete user profiles from database
    console.log('🗑️  Deleting user profiles...\n');

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .like('email', '%@test.com');

    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ User profiles deleted\n');

    // 4. Delete auth users
    console.log('🗑️  Deleting auth users...\n');

    for (const user of testUsers) {
      try {
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

        if (authDeleteError) {
          console.error(`  ⚠️  Error deleting auth for ${user.email}:`, authDeleteError.message);
        } else {
          console.log(`  ✅ ${user.first_name} ${user.last_name}`);
        }
      } catch (error) {
        console.error(`  ⚠️  Error deleting auth for ${user.email}:`, error);
      }
    }

    console.log('');
    console.log('✅ Phase 5 test data cleaned successfully!\n');
    console.log(`Removed ${testUsers.length} test athletes and all related data.\n`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanPhase5Data();
