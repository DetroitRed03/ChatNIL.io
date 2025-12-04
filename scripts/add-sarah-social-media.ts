import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addSocialMedia() {
  console.log('🔧 Adding social media data to Sarah Johnson...\n');

  // Get Sarah's user_id
  const { data: profile } = await supabase
    .from('athlete_profiles')
    .select('user_id, username')
    .eq('username', 'sarah-johnson')
    .single();

  if (!profile) {
    console.error('❌ Sarah Johnson profile not found');
    return;
  }

  console.log(`📋 User ID: ${profile.user_id}\n`);

  // Social media stats data
  const instagramFollowers = 45200;
  const tiktokFollowers = 82100;
  const twitterFollowers = 18500;
  const totalFollowers = instagramFollowers + tiktokFollowers + twitterFollowers; // 145,800
  const avgEngagement = 4.7;

  // Check if record exists
  const { data: existing } = await supabase
    .from('social_media_stats')
    .select('id')
    .eq('user_id', profile.user_id)
    .maybeSingle();

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('social_media_stats')
      .update({
        instagram_followers: instagramFollowers,
        tiktok_followers: tiktokFollowers,
        twitter_followers: twitterFollowers,
        total_followers: totalFollowers,
        engagement_rate: avgEngagement,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id);

    if (error) {
      console.error('❌ Error updating social media:', error.message);
      return;
    }
    console.log('✅ Social media stats updated successfully!');
  } else {
    // Insert new record
    const { error } = await supabase
      .from('social_media_stats')
      .insert({
        user_id: profile.user_id,
        instagram_followers: instagramFollowers,
        tiktok_followers: tiktokFollowers,
        twitter_followers: twitterFollowers,
        total_followers: totalFollowers,
        engagement_rate: avgEngagement
      });

    if (error) {
      console.error('❌ Error inserting social media:', error.message);
      return;
    }
    console.log('✅ Social media stats added successfully!');
  }

  console.log('\n📊 Social Media Stats:');
  console.log(`   Instagram: ${instagramFollowers.toLocaleString()} followers`);
  console.log(`   TikTok: ${tiktokFollowers.toLocaleString()} followers`);
  console.log(`   Twitter: ${twitterFollowers.toLocaleString()} followers`);
  console.log(`\n📈 Total Followers: ${totalFollowers.toLocaleString()}`);
  console.log(`📈 Avg Engagement Rate: ${avgEngagement.toFixed(1)}%`);
  console.log('\n🌐 View at: http://localhost:3000/athletes/sarah-johnson');
}

addSocialMedia();
