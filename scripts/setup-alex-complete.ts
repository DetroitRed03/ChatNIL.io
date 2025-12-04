import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupAlexComplete() {
  const alexId = 'b63b82c5-8551-40e4-ba3c-c3223932e0ad';

  // First check if social stats exist
  const { data: existing } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('user_id', alexId);

  console.log('=== Existing social_media_stats ===');
  console.log(existing);

  const noExistingStats = !existing || existing.length === 0;
  if (noExistingStats) {
    // Insert (not upsert)
    const { data: socialStats, error: socialErr } = await supabase
      .from('social_media_stats')
      .insert({
        user_id: alexId,
        instagram_followers: 25000,
        tiktok_followers: 45000,
        twitter_followers: 8000,
        youtube_subscribers: 2000,
        total_followers: 80000,
        engagement_rate: 4.5
      })
      .select();

    console.log('\n=== Inserted social_media_stats ===');
    console.log(socialStats);
    if (socialErr) console.log('Error:', socialErr);
  }

  // Check the athlete_public_profiles view columns
  const { data: viewSample } = await supabase
    .from('athlete_public_profiles')
    .select('*')
    .limit(1);

  console.log('\n=== athlete_public_profiles view columns ===');
  if (viewSample && viewSample[0]) {
    console.log(Object.keys(viewSample[0]));
  }

  // Now check Alex again
  const { data: alexPublic, error: alexErr } = await supabase
    .from('athlete_public_profiles')
    .select('*')
    .eq('user_id', alexId);

  console.log('\n=== Alex in athlete_public_profiles ===');
  console.log(alexPublic);
  if (alexErr) console.log('Error:', alexErr);

  // If Alex is still not in the view, it might be a materialized view that needs refresh
  // Or the view has specific join conditions (like requiring a specific user role)
  // Let's check if Alex is in the users table with role='athlete'
  const { data: alexUser } = await supabase
    .from('users')
    .select('id, role, first_name, last_name')
    .eq('id', alexId)
    .single();

  console.log('\n=== Alex user record ===');
  console.log(alexUser);

  // Check athlete_profiles
  const { data: alexProfile } = await supabase
    .from('athlete_profiles')
    .select('user_id, sport, school')
    .eq('user_id', alexId)
    .single();

  console.log('\n=== Alex athlete_profile ===');
  console.log(alexProfile);
}

setupAlexComplete().catch(console.error);
