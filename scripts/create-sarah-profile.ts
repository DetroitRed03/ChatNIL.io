import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createSarahProfile() {
  console.log('🚀 Creating Sarah Johnson profile...\n');

  const userId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  // Create athlete_public_profiles record
  const { error: profileError } = await supabase
    .from('athlete_public_profiles')
    .upsert({
      user_id: userId,
      username: 'sarah-johnson',
      sport: 'Basketball',
      position: 'Guard',
      school: 'UCLA',
      year: 'Junior',
      bio: 'Point guard with exceptional court vision and defensive skills. Two-time All-Pac-12 selection.',
      achievements: [
        'All-Pac-12 First Team (2023, 2024)',
        'Team Captain',
        'Academic All-American',
        '1,200+ career points'
      ],
      height_inches: 69, // 5'9"
      weight_lbs: 145,
      graduation_year: 2026,
      major: 'Communications',
      gpa: 3.7,
      instagram_handle: '@sarahjbasketball',
      instagram_followers: 45000,
      instagram_engagement_rate: 4.8,
      tiktok_handle: '@sarahjhoops',
      tiktok_followers: 82000,
      tiktok_engagement_rate: 6.2,
      twitter_handle: '@SJohnson_UCLA',
      twitter_followers: 15000,
      total_followers: 142000,
      avg_engagement_rate: 5.5,
      content_categories: ['Sports', 'Fitness', 'Lifestyle', 'Fashion'],
      is_available_for_partnerships: true,
      estimated_fmv: 75000,
      profile_completion_score: 85,
      profile_completion_tier: 'platinum',
      nil_interests: ['Brand Partnerships', 'Social Media Campaigns'],
      nil_goals: ['Build personal brand', 'Support family'],
      preferred_partnership_types: ['Social Media', 'Appearances', 'Content Creation']
    });

  if (profileError) {
    console.error('❌ Error creating profile:', profileError.message);
    console.error('Details:', profileError);
    process.exit(1);
  }

  console.log('✅ SUCCESS! Sarah Johnson profile created!\n');
  console.log('📧 Email: sarah.johnson@test.com');
  console.log('🔑 Password: TestPassword123!');
  console.log('👤 Username: sarah-johnson');
  console.log('🏀 Sport: Basketball - Guard');
  console.log('🎓 School: UCLA');
  console.log('📊 Profile Score: 85/100 (Platinum)');
  console.log('\n✅ Login at http://localhost:3000');
  console.log('\n🎯 Ready for client screenshots!');
}

createSarahProfile();
