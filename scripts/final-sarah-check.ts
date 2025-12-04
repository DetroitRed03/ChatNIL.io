import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function finalCheck() {
  console.log('🔍 FINAL COMPREHENSIVE CHECK\n');
  console.log('=' .repeat(70));

  const userId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  // 1. Check if record exists via raw SQL
  console.log('\n1️⃣ Checking if Sarah\'s profile EXISTS in database (via SQL)...\n');

  try {
    const { data: existsResult, error: existsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          CASE WHEN EXISTS (
            SELECT 1 FROM athlete_public_profiles WHERE user_id = '${userId}'
          ) THEN 'YES' ELSE 'NO' END as profile_exists;
      `
    });

    console.log('Query result:', JSON.stringify(existsResult, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }

  // 2. Try to get all profiles
  console.log('\n2️⃣ Checking ALL profiles in table...\n');

  const { data: allProfiles, error: allError } = await supabase
    .from('athlete_public_profiles')
    .select('user_id, display_name, sport');

  if (allError) {
    console.log('❌ REST API Error:', allError.message);
  } else {
    console.log(`✅ Found ${allProfiles?.length || 0} profiles total`);
    if (allProfiles && allProfiles.length > 0) {
      console.log('\nProfiles:');
      allProfiles.forEach(p => {
        console.log(`  - ${p.display_name} (${p.sport}) - ${p.user_id}`);
      });

      const sarah = allProfiles.find(p => p.user_id === userId);
      if (sarah) {
        console.log('\n✅ SARAH FOUND IN REST API RESULTS!');
      } else {
        console.log('\n❌ Sarah NOT in REST API results (schema cache issue)');
      }
    }
  }

  // 3. Direct query for Sarah
  console.log('\n3️⃣ Direct REST API query for Sarah...\n');

  const { data: sarahData, error: sarahError } = await supabase
    .from('athlete_public_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (sarahError) {
    console.log('❌ Error:', sarahError.message);
  } else if (sarahData) {
    console.log('✅ SUCCESS! Sarah\'s profile is accessible!\n');
    console.log('📊 PROFILE DATA:');
    console.log('─'.repeat(70));
    console.log(`Name: ${sarahData.display_name}`);
    console.log(`Sport: ${sarahData.sport}`);
    console.log(`School: ${sarahData.school}`);
    console.log(`Instagram: ${sarahData.instagram_handle} (${sarahData.instagram_followers?.toLocaleString()} followers)`);
    console.log(`TikTok: ${sarahData.tiktok_handle} (${sarahData.tiktok_followers?.toLocaleString()} followers)`);
    console.log(`Twitter: ${sarahData.twitter_handle} (${sarahData.twitter_followers?.toLocaleString()} followers)`);
    console.log(`Total: ${sarahData.total_followers?.toLocaleString()} followers`);
    console.log(`FMV: $${sarahData.estimated_fmv?.toLocaleString()}`);
    console.log(`\n🎉 READY FOR CLIENT DEMO!`);
    console.log(`🔐 Login: sarah.johnson@test.com / TestPassword123!`);
  } else {
    console.log('❌ No data returned');
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n📋 DIAGNOSIS:');
  console.log('─'.repeat(70));

  if (!allProfiles || allProfiles.length === 0) {
    console.log('⚠️  PostgREST schema cache needs manual refresh');
    console.log('\n🔧 FIX: Go to Supabase Dashboard → SQL Editor');
    console.log('     Run: NOTIFY pgrst, \'reload schema\';');
    console.log('     Wait 10 seconds, then try logging in as Sarah');
  } else if (allProfiles.find(p => p.user_id === userId)) {
    console.log('✅ Everything is working! Sarah is ready!');
  } else {
    console.log('⚠️  Profile exists but not visible via REST API yet');
    console.log('     Wait 30-60 seconds for cache to auto-refresh');
  }
}

finalCheck();
