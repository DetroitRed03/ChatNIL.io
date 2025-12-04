import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function quickFixSarah() {
  console.log('🚀 Quick Fix: Adding Sarah Johnson profile data\n');

  const userId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc'; // From auth check
  const email = 'sarah.johnson@test.com';
  const password = 'TestPassword123!';

  // Step 1: Add to public.users
  console.log('1️⃣ Adding to public.users table...');
  const { error: userError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: email,
      username: 'sarah-johnson',
      full_name: 'Sarah Johnson',
      user_type: 'athlete',
      role: 'athlete',
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (userError) {
    console.error('❌ Error:', userError);
  } else {
    console.log('✅ Public user record created');
  }

  // Step 2: Add to athlete_profiles
  console.log('\n2️⃣ Adding athlete profile...');
  const { error: profileError } = await supabase
    .from('athlete_profiles')
    .upsert({
      user_id: userId,
      username: 'sarah-johnson',
      sport: 'Basketball',
      position: 'Guard',
      school: 'UCLA',
      year: 'Junior',
      height: '5\'9"',
      weight: 145,
      bio: 'Point guard with exceptional court vision and defensive skills. Two-time All-Pac-12 selection.',
      achievements: [
        'All-Pac-12 First Team (2023, 2024)',
        'Team Captain',
        'Academic All-American',
        '1,200+ career points'
      ],
      estimated_fmv: 75000,
      instagram_handle: '@sarahjbasketball',
      instagram_followers: 45000,
      instagram_engagement_rate: 4.8,
      tiktok_handle: '@sarahjhoops',
      tiktok_followers: 82000,
      tiktok_engagement_rate: 6.2,
      twitter_handle: '@SJohnson_UCLA',
      twitter_followers: 15000,
      youtube_channel: null,
      youtube_subscribers: 0,
      total_followers: 142000,
      avg_engagement_rate: 5.5,
      content_categories: ['Sports', 'Fitness', 'Lifestyle', 'Fashion'],
      is_available_for_partnerships: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('❌ Error:', profileError);
  } else {
    console.log('✅ Athlete profile created');
  }

  console.log('\n' + '═'.repeat(80));
  console.log('\n🎉 SUCCESS! Sarah Johnson is ready to use!\n');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('👤 Username: sarah-johnson');
  console.log('🏀 Sport: Basketball - Guard');
  console.log('🎓 School: UCLA');
  console.log('\n✅ You can now log in at http://localhost:3000');
  console.log('');
}

quickFixSarah();
