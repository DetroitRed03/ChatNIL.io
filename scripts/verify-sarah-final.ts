import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifySarah() {
  console.log('🔍 Verifying Sarah Johnson\'s profile...\n');

  const userId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  // Try to query via REST API (this will show if PostgREST can see the data)
  const { data: profiles, error } = await supabase
    .from('athlete_public_profiles')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('❌ REST API Error:', error.message);
    console.log('\nℹ️  This might be due to schema cache. Let me check via raw SQL...\n');
  } else if (profiles && profiles.length > 0) {
    console.log('✅ Profile found via REST API!\n');
    const profile = profiles[0];

    console.log('📊 PROFILE DATA:');
    console.log('─'.repeat(60));
    console.log(`Name: ${profile.display_name}`);
    console.log(`Sport: ${profile.sport}`);
    console.log(`School: ${profile.school}`);
    console.log(`Graduation Year: ${profile.graduation_year}`);
    console.log(`Bio: ${profile.bio}`);
    console.log();
    console.log('📱 SOCIAL MEDIA:');
    console.log('─'.repeat(60));
    console.log(`Instagram: ${profile.instagram_handle} (${profile.instagram_followers?.toLocaleString()} followers)`);
    console.log(`TikTok: ${profile.tiktok_handle} (${profile.tiktok_followers?.toLocaleString()} followers)`);
    console.log(`Twitter: ${profile.twitter_handle} (${profile.twitter_followers?.toLocaleString()} followers)`);
    console.log(`Total Followers: ${profile.total_followers?.toLocaleString()}`);
    console.log(`Avg Engagement: ${profile.avg_engagement_rate}%`);
    console.log();
    console.log('💰 VALUATION:');
    console.log('─'.repeat(60));
    console.log(`Estimated FMV: $${profile.estimated_fmv?.toLocaleString()}`);
    console.log(`Profile Score: ${profile.profile_completion_score}/100`);
    console.log(`Profile Tier: ${profile.profile_completion_tier}`);
    console.log();
    console.log('🏆 ACHIEVEMENTS:');
    console.log('─'.repeat(60));
    if (profile.achievements) {
      profile.achievements.forEach((achievement: string) => {
        console.log(`  • ${achievement}`);
      });
    }
    console.log();
    console.log('📁 CONTENT CATEGORIES:');
    console.log('─'.repeat(60));
    if (profile.content_categories) {
      console.log(JSON.stringify(profile.content_categories, null, 2));
    }
    console.log();
    console.log('✅ SUCCESS! Sarah\'s profile is complete and ready!');
    console.log('🔐 Login: sarah.johnson@test.com / TestPassword123!');
  } else {
    console.log('⚠️  No profile found via REST API');
    console.log('Checking if data exists in database via SQL...\n');

    // Check count via SQL
    const { data: countResult } = await supabase.rpc('exec_sql', {
      query: `SELECT COUNT(*) as count FROM athlete_public_profiles WHERE user_id = '${userId}';`
    });

    console.log('SQL Count Result:', countResult);

    if (countResult?.success) {
      console.log('\n💡 Data might exist in DB but PostgREST schema cache needs refresh.');
      console.log('Try these steps:');
      console.log('1. Wait 10-30 seconds for cache to refresh automatically');
      console.log('2. Or run: NOTIFY pgrst, \'reload schema\' in Supabase SQL Editor');
    }
  }
}

verifySarah();
