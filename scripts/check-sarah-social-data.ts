import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Find Sarah's user_id
  const { data: user } = await supabase
    .from('users')
    .select('id, username, first_name, last_name')
    .eq('username', 'sarah-johnson')
    .single();

  console.log('Sarah user:', user);

  if (!user) {
    console.log('Sarah not found by username, trying first name...');
    const { data: users } = await supabase
      .from('users')
      .select('id, username, first_name, last_name')
      .ilike('first_name', '%sarah%');
    console.log('Users with Sarah in name:', users);
    return;
  }

  // Check social_media_stats table
  const { data: socialStats, error: socialError } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  console.log('\n=== social_media_stats table ===');
  console.log(socialStats);
  if (socialError) console.log('Error:', socialError);

  // Check athlete_public_profiles
  const { data: publicProfile, error: publicError } = await supabase
    .from('athlete_public_profiles')
    .select('user_id, instagram_followers, tiktok_followers, twitter_followers, total_followers')
    .eq('user_id', user.id)
    .maybeSingle();

  console.log('\n=== athlete_public_profiles ===');
  console.log(publicProfile);
  if (publicError) console.log('Error:', publicError);
}

check().catch(console.error);
