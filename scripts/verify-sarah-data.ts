import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifySarahData() {
  console.log('🔍 Verifying Sarah Johnson\'s profile data...\n');

  const userId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  // Query Sarah's profile from athlete_public_profiles
  const { data: profile, error } = await supabase
    .from('athlete_public_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('❌ Error querying profile:', error);
    return;
  }

  if (!profile) {
    console.log('❌ No profile found for Sarah');
    return;
  }

  console.log('✅ Profile found!\n');
  console.log('📊 COMPLETE PROFILE DATA:');
  console.log(JSON.stringify(profile, null, 2));

  console.log('\n\n📈 SOCIAL MEDIA STATS:');
  console.log('─'.repeat(50));
  console.log(`Instagram: ${profile.instagram_handle || 'NOT SET'}`);
  console.log(`  Followers: ${profile.instagram_followers || 0}`);
  console.log(`  Engagement: ${profile.instagram_engagement_rate || 0}%`);
  console.log();
  console.log(`TikTok: ${profile.tiktok_handle || 'NOT SET'}`);
  console.log(`  Followers: ${profile.tiktok_followers || 0}`);
  console.log(`  Engagement: ${profile.tiktok_engagement_rate || 0}%`);
  console.log();
  console.log(`Twitter: ${profile.twitter_handle || 'NOT SET'}`);
  console.log(`  Followers: ${profile.twitter_followers || 0}`);
  console.log();
  console.log(`Total Followers: ${profile.total_followers || 0}`);
  console.log(`Avg Engagement: ${profile.avg_engagement_rate || 0}%`);

  console.log('\n\n🎯 PROFILE METRICS:');
  console.log('─'.repeat(50));
  console.log(`Sport: ${profile.sport || 'NOT SET'}`);
  console.log(`School: ${profile.school || 'NOT SET'}`);
  console.log(`Graduation Year: ${profile.graduation_year || 'NOT SET'}`);
  console.log(`Bio: ${profile.bio || 'NOT SET'}`);
  console.log(`Estimated FMV: $${profile.estimated_fmv?.toLocaleString() || 0}`);
  console.log(`Profile Score: ${profile.profile_completion_score || 0}/100`);
  console.log(`Profile Tier: ${profile.profile_completion_tier || 'NOT SET'}`);

  console.log('\n\n🏆 ACHIEVEMENTS:');
  console.log('─'.repeat(50));
  if (profile.achievements) {
    console.log(JSON.stringify(profile.achievements, null, 2));
  } else {
    console.log('❌ No achievements found');
  }

  console.log('\n\n📱 CONTENT CATEGORIES:');
  console.log('─'.repeat(50));
  if (profile.content_categories) {
    console.log(JSON.stringify(profile.content_categories, null, 2));
  } else {
    console.log('❌ No content categories found');
  }

  console.log('\n\n🔍 NULL FIELD CHECK:');
  console.log('─'.repeat(50));
  const nullFields = Object.entries(profile)
    .filter(([_, value]) => value === null)
    .map(([key]) => key);

  if (nullFields.length > 0) {
    console.log('Fields that are NULL:');
    nullFields.forEach(field => console.log(`  - ${field}`));
  } else {
    console.log('✅ No NULL fields!');
  }

  console.log('\n\n✅ POPULATED FIELDS:');
  console.log('─'.repeat(50));
  const populatedFields = Object.entries(profile)
    .filter(([_, value]) => value !== null)
    .map(([key]) => key);

  console.log(`Total populated fields: ${populatedFields.length}`);
  populatedFields.forEach(field => console.log(`  ✓ ${field}`));
}

verifySarahData();
