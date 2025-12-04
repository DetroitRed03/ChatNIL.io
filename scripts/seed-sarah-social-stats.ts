/**
 * Seed Social Media Stats for Sarah's Test Account
 *
 * This adds social media follower data to properly test profile completion
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedSocialStats() {
  console.log('📱 Seeding social media stats for Sarah...\n');

  const sarahId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  // Check if stats already exist
  const { data: existing } = await supabase
    .from('social_media_stats')
    .select('id')
    .eq('user_id', sarahId)
    .maybeSingle();

  if (existing) {
    console.log('⚠️  Social stats already exist for Sarah, updating...');

    const { error } = await supabase
      .from('social_media_stats')
      .update({
        instagram_followers: 50000,
        tiktok_followers: 75000,
        twitter_followers: 12000,
        youtube_subscribers: 8500,
        total_followers: 145500,
        engagement_rate: 4.2,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', sarahId);

    if (error) {
      console.error('❌ Error updating:', error);
      return;
    }

    console.log('✅ Updated social media stats');
  } else {
    console.log('📝 Creating new social media stats record...');

    const { error } = await supabase
      .from('social_media_stats')
      .insert({
        user_id: sarahId,
        instagram_followers: 50000,
        tiktok_followers: 75000,
        twitter_followers: 12000,
        youtube_subscribers: 8500,
        total_followers: 145500,
        engagement_rate: 4.2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error inserting:', error);
      return;
    }

    console.log('✅ Created social media stats');
  }

  // Verify
  const { data: stats } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('user_id', sarahId)
    .single();

  console.log('\n📊 Social Media Stats:');
  console.log('   Instagram:', stats?.instagram_followers?.toLocaleString());
  console.log('   TikTok:', stats?.tiktok_followers?.toLocaleString());
  console.log('   Twitter:', stats?.twitter_followers?.toLocaleString());
  console.log('   YouTube:', stats?.youtube_subscribers?.toLocaleString());
  console.log('   Total:', stats?.total_followers?.toLocaleString());
  console.log('   Engagement Rate:', stats?.engagement_rate + '%');

  console.log('\n✅ Done! Profile completion should now show social media contribution.');
}

seedSocialStats().catch(console.error);
