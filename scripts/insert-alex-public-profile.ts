import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function insertAlexPublicProfile() {
  const alexId = 'b63b82c5-8551-40e4-ba3c-c3223932e0ad';

  // Insert Alex into athlete_public_profiles
  const { data: profile, error } = await supabase
    .from('athlete_public_profiles')
    .upsert({
      user_id: alexId,
      display_name: 'Alex Rivera',
      bio: 'D1 soccer player passionate about fitness and community outreach.',
      sport: 'Soccer',
      position: 'Midfielder',
      school_name: 'UCLA',
      school_level: 'college',
      graduation_year: 2026,
      state: 'CA',
      instagram_handle: '@alexrivera',
      instagram_followers: 25000,
      instagram_engagement_rate: 5.2,
      tiktok_handle: '@alexrivera',
      tiktok_followers: 45000,
      tiktok_engagement_rate: 8.1,
      twitter_handle: '@alexrivera',
      twitter_followers: 8000,
      youtube_channel: 'alexriveraofficial',
      youtube_subscribers: 2000,
      // total_followers is a generated column - don't set it
      estimated_fmv_min: 8000,
      estimated_fmv_max: 20000,
      avg_engagement_rate: 4.5,
      content_categories: ['fitness', 'lifestyle', 'sports', 'soccer'],
      brand_values: ['authenticity', 'excellence', 'community'],
      is_available_for_partnerships: true,
      preferred_partnership_types: ['sponsored_posts', 'brand_ambassador', 'content_creation'],
      response_rate: 92,
      avg_response_time_hours: 4,
      is_verified: false,
      total_partnerships_completed: 2
    }, { onConflict: 'user_id' })
    .select();

  console.log('=== Inserted athlete_public_profiles ===');
  console.log(profile);
  if (error) console.log('Error:', error);

  // Verify Alex now appears
  const { data: verify } = await supabase
    .from('athlete_public_profiles')
    .select('user_id, display_name, sport, school_name, total_followers')
    .eq('user_id', alexId);

  console.log('\n=== Verification ===');
  console.log(verify);

  // Show all athletes now
  const { data: allAthletes, count } = await supabase
    .from('athlete_public_profiles')
    .select('user_id, display_name, sport', { count: 'exact' });

  console.log('\n=== All athletes in athlete_public_profiles ===');
  console.log('Count:', count);
  allAthletes?.forEach(a => console.log(`  - ${a.display_name}: ${a.sport}`));
}

insertAlexPublicProfile().catch(console.error);
