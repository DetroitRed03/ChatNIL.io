import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSarahProfile() {
  console.log('🔍 Checking Sarah Johnson\'s profile...\n');

  const { data: user, error } = await supabase
    .from('users')
    .select('first_name, last_name, profile_completion_score, avg_engagement_rate, social_media_stats, total_followers, primary_sport, position, achievements, bio, school_name, graduation_year')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 Profile Data:');
  console.log('Name:', user.first_name, user.last_name);
  console.log('Profile Completion Score:', user.profile_completion_score);
  console.log('Avg Engagement Rate:', user.avg_engagement_rate);
  console.log('Total Followers:', user.total_followers);
  console.log('\n📱 Social Media Stats:');
  console.log(JSON.stringify(user.social_media_stats, null, 2));

  console.log('\n🏀 Athletic Info:');
  console.log('Primary Sport:', user.primary_sport);
  console.log('Position:', user.position);
  console.log('Achievements:', user.achievements);

  console.log('\n📝 Other Info:');
  console.log('Bio:', user.bio?.substring(0, 50) + '...');
  console.log('School:', user.school_name);
  console.log('Graduation Year:', user.graduation_year);

  // Check if engagement rates are stored as decimals or percentages
  if (user.social_media_stats?.instagram?.engagement_rate) {
    const igRate = user.social_media_stats.instagram.engagement_rate;
    console.log('\n🔍 Instagram Engagement Rate Analysis:');
    console.log('Raw value:', igRate);
    console.log('Type:', typeof igRate);
    console.log('Is it a decimal (< 1)?', igRate < 1);
    console.log('As percentage:', igRate > 1 ? `${igRate}%` : `${(igRate * 100).toFixed(1)}%`);
  }
}

checkSarahProfile();
