import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createUltraMinimalSarah() {
  const userId = 'ca05429a-0f32-4280-8b71-99dc5baee0dc';

  const { error } = await supabase
    .from('athlete_profiles')
    .upsert({
      user_id: userId,
      username: 'sarah-johnson',
      sport: 'Basketball',
      position: 'Guard',
      school: 'UCLA',
      year: 'Junior',
      bio: 'Point guard with exceptional court vision.',
      achievements: ['All-Pac-12 First Team', 'Team Captain'],
      estimated_fmv: 75000,
      instagram_handle: '@sarahjbasketball',
      tiktok_handle: '@sarahjhoops',
      twitter_handle: '@SJohnson_UCLA',
      total_followers: 142000,
      is_available_for_partnerships: true
    });

  console.log(error ? `❌ ${error.message}` : '✅ Sarah ready! Login: sarah.johnson@test.com / TestPassword123!');
}

createUltraMinimalSarah();
