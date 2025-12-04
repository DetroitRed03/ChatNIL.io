import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Define what fields are critical for client demo
const CRITICAL_FIELDS = {
  personal: ['first_name', 'last_name', 'email', 'date_of_birth', 'phone'],
  physical: ['height_inches', 'weight_lbs', 'jersey_number'],
  photos: ['profile_photo_url', 'cover_photo_url'],
  sports: ['primary_sport', 'position', 'school_name', 'graduation_year'],
  nil: ['bio'],
  onboarding: ['onboarding_completed'],
};

const TEST_ACCOUNTS = [
  'sarah.johnson@test.com',
  // 'james.martinez@test.com', // Uncomment when account is created
];

async function verifyDemoReadiness() {
  console.log('🔍 Demo Readiness Verification Report\n');
  console.log('='.repeat(70));
  console.log('\n📋 Checking test accounts for client demo...\n');

  let allAccountsReady = true;

  for (const email of TEST_ACCOUNTS) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📧 Account: ${email}`);
    console.log('─'.repeat(70));

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.log(`❌ ERROR: Account not found\n`);
      allAccountsReady = false;
      continue;
    }

    console.log(`✅ User ID: ${user.id}`);
    console.log(`✅ Name: ${user.first_name} ${user.last_name}`);
    console.log(`✅ Role: ${user.role}\n`);

    // Check each category
    let categoryResults = {
      personal: { complete: 0, total: 0, missing: [] as string[] },
      physical: { complete: 0, total: 0, missing: [] as string[] },
      photos: { complete: 0, total: 0, missing: [] as string[] },
      sports: { complete: 0, total: 0, missing: [] as string[] },
      nil: { complete: 0, total: 0, missing: [] as string[] },
      onboarding: { complete: 0, total: 0, missing: [] as string[] },
    };

    // Check each category of fields
    for (const [category, fields] of Object.entries(CRITICAL_FIELDS)) {
      categoryResults[category].total = fields.length;

      for (const field of fields) {
        if (user[field] !== null && user[field] !== undefined && user[field] !== '') {
          categoryResults[category].complete++;
        } else {
          categoryResults[category].missing.push(field);
        }
      }
    }

    // Display category results
    console.log('📊 Profile Completeness:');
    console.log('');

    for (const [category, result] of Object.entries(categoryResults)) {
      const percentage = Math.round((result.complete / result.total) * 100);
      const status = percentage === 100 ? '✅' : '⚠️';
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

      console.log(`  ${status} ${categoryName}: ${result.complete}/${result.total} (${percentage}%)`);

      if (result.missing.length > 0) {
        console.log(`     Missing: ${result.missing.join(', ')}`);
        allAccountsReady = false;
      }
    }

    // Fetch social media stats
    console.log('\n📱 Social Media Stats:');
    const { data: socialStats, error: socialError } = await supabase
      .from('social_media_stats')
      .select('*')
      .eq('user_id', user.id);

    if (socialError) {
      console.log('   ⚠️  Error fetching social stats:', socialError.message);
    } else if (!socialStats || socialStats.length === 0) {
      console.log('   ⚠️  No social media stats found');
      allAccountsReady = false;
    } else {
      console.log(`   ✅ ${socialStats.length} platform(s) connected`);
      for (const stat of socialStats) {
        console.log(`      • ${stat.platform}: ${stat.handle} (${stat.followers.toLocaleString()} followers)`);
      }
    }

    // Check photo URLs are accessible
    console.log('\n🖼️  Photo URL Verification:');
    if (user.profile_photo_url) {
      console.log(`   ✅ Profile Photo: ${user.profile_photo_url}`);
    } else {
      console.log(`   ❌ Profile Photo: Missing`);
    }

    if (user.cover_photo_url) {
      console.log(`   ✅ Cover Photo: ${user.cover_photo_url}`);
    } else {
      console.log(`   ❌ Cover Photo: Missing`);
    }

    // Calculate overall completion
    const totalFields = Object.values(categoryResults).reduce((sum, cat) => sum + cat.total, 0);
    const completedFields = Object.values(categoryResults).reduce((sum, cat) => sum + cat.complete, 0);
    const overallPercentage = Math.round((completedFields / totalFields) * 100);

    console.log(`\n📈 Overall Completion: ${completedFields}/${totalFields} (${overallPercentage}%)`);

    if (overallPercentage === 100 && socialStats && socialStats.length > 0) {
      console.log('✅ DEMO READY - Profile is 100% complete!');
    } else {
      console.log('⚠️  NOT DEMO READY - Some fields are missing');
      allAccountsReady = false;
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(70));
  console.log('\n🎯 Final Demo Readiness Report\n');

  if (allAccountsReady) {
    console.log('✅ ALL TEST ACCOUNTS ARE DEMO READY!');
    console.log('✅ Profiles are 100% complete');
    console.log('✅ All photos present');
    console.log('✅ Social media stats populated');
    console.log('✅ Ready to show client!\n');
  } else {
    console.log('⚠️  SOME ACCOUNTS NEED ATTENTION');
    console.log('⚠️  Run: npx tsx scripts/populate-test-profiles-complete.ts');
    console.log('⚠️  Then re-verify with this script\n');
  }

  console.log('='.repeat(70) + '\n');

  return allAccountsReady;
}

// Run the script
verifyDemoReadiness()
  .then((ready) => {
    process.exit(ready ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
