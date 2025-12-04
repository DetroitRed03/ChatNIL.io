import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  // Find Sarah's user_id
  const { data: user } = await supabase
    .from('users')
    .select('id, username, first_name, last_name, social_media_handles')
    .eq('username', 'sarah-johnson')
    .single();

  console.log('Sarah user:', user);
  console.log('social_media_handles on user:', user?.social_media_handles);

  // Check athlete_profiles for handles
  const { data: athleteProfile } = await supabase
    .from('athlete_profiles')
    .select('user_id, social_media_handles, instagram_handle, tiktok_handle, twitter_handle')
    .eq('user_id', user?.id)
    .maybeSingle();

  console.log('\nathlete_profiles:', athleteProfile);

  // Check social_media_stats for any handle data
  const { data: socialStats } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('user_id', user?.id)
    .maybeSingle();

  console.log('\nsocial_media_stats:', socialStats);

  // Check athlete_public_profiles view
  const { data: publicProfile } = await supabase
    .from('athlete_public_profiles')
    .select('*')
    .eq('user_id', user?.id)
    .maybeSingle();

  console.log('\nathlete_public_profiles (all columns):');
  console.log(JSON.stringify(publicProfile, null, 2));
}

check().catch(console.error);
