import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixUsernames() {
  console.log('🔧 Fixing usernames to be more readable...\n');

  // Get all athletes
  const { data: athletes, error } = await supabase
    .from('athlete_profiles')
    .select('user_id, sport, position, school');

  if (error || !athletes) {
    console.error('❌ Error fetching athletes:', error);
    return;
  }

  console.log(`Found ${athletes.length} athletes to update\n`);

  // Update each one with a proper username
  for (const athlete of athletes) {
    const sport = (athlete.sport || 'athlete').toLowerCase().replace(/[^a-z0-9]/g, '');
    const position = (athlete.position || 'player').toLowerCase().replace(/[^a-z0-9]/g, '');
    const school = (athlete.school || 'university').toLowerCase().replace(/[^a-z0-9]/g, '');

    const username = `${sport}-${position}-${school}`;

    const { error: updateError } = await supabase
      .from('athlete_profiles')
      .update({ username })
      .eq('user_id', athlete.user_id);

    if (updateError) {
      console.error(`❌ Error updating ${athlete.user_id}:`, updateError);
    } else {
      console.log(`✅ Updated: ${username}`);
    }
  }

  console.log('\n📊 Verifying results...\n');
  const { data: updated, error: verifyError } = await supabase
    .from('athlete_profiles')
    .select('sport, position, school, username')
    .limit(5);

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError);
  } else {
    console.log('Sample updated usernames:');
    console.log(JSON.stringify(updated, null, 2));
  }
}

fixUsernames();
