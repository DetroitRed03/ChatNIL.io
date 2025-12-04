import { supabaseAdmin } from '../lib/supabase';

async function checkSarahStats() {
  console.log('Checking Sarah\'s physical stats...\n');

  const { data, error } = await supabaseAdmin
    .from('athlete_profiles')
    .select('jersey_number, height_inches, weight_lbs, user_id')
    .eq('user_id', 'ca05429a-0f32-4280-8b71-99dc5baee0dc')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Jersey number:', data?.jersey_number);
  console.log('Height (inches):', data?.height_inches);
  console.log('Weight (lbs):', data?.weight_lbs);
}

checkSarahStats();
