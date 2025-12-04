import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createMinimalSarah() {
  console.log('🚀 Creating minimal Sarah profile\n');

  const userId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  //  Add minimal athlete profile
  const { error: profileError } = await supabase
    .from('athlete_profiles')
    .upsert({
      user_id: userId,
      username: 'sarah-johnson',
      sport: 'Basketball',
      position: 'Guard',
      school: 'UCLA',
      year: 'Junior',
      bio: 'Point guard with exceptional court vision. Two-time All-Pac-12 selection.',
      achievements: ['All-Pac-12 First Team', 'Team Captain'],
      estimated_fmv: 75000,
      instagram_handle: '@sarahjbasketball',
      instagram_followers: 45000,
      tiktok_handle: '@sarahjhoops',
      tiktok_followers: 82000,
      twitter_handle: '@SJohnson_UCLA',
      twitter_followers: 15000,
      total_followers: 142000,
      content_categories: ['Sports', 'Fitness'],
      is_available_for_partnerships: true
    });

  if (profileError) {
    console.error('❌ Profile Error:', profileError.message);
    console.log('\nColumn:', profileError.details);
  } else {
    console.log('✅ SUCCESS! Sarah is ready!\n');
    console.log('📧 Email: sarah.johnson@test.com');
    console.log('🔑 Password: TestPassword123!');
    console.log('\n✅ Login at http://localhost:3000');
  }
}

createMinimalSarah();
