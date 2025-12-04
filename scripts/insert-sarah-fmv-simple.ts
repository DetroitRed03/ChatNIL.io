import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSimpleFmv() {
  console.log('💾 INSERTING SIMPLE FMV DATA FOR SARAH\n');

  // Get Sarah's user_id
  const { data: profile } = await supabase
    .from('athlete_profiles')
    .select('user_id')
    .eq('username', 'sarah-johnson')
    .single();

  if (!profile) {
    console.error('❌ Sarah not found');
    return;
  }

  const athleteId = profile.user_id;
  console.log(`✅ Sarah's User ID: ${athleteId}\n`);

  // Simplified FMV data with only essential fields
  const fmvData = {
    athlete_id: athleteId,
    fmv_score: 65, // Medium tier
    fmv_tier: 'medium',
    is_public_score: true,
    percentile_rank: 65
  };

  console.log('📊 FMV Data to insert:');
  console.log(JSON.stringify(fmvData, null, 2));
  console.log('\n');

  // Try insert
  const { data, error } = await supabase
    .from('athlete_fmv_data')
    .insert(fmvData)
    .select();

  if (error) {
    console.error('❌ Insert error:', error.message);
    console.error('Code:', error.code);
    console.error('Details:', error.details);
    console.error('Hint:', error.hint);

    // If constraint error, try update instead
    if (error.code === '23505') { // Unique violation
      console.log('\n⚠️  Record exists, trying UPDATE instead...\n');

      const { error: updateError } = await supabase
        .from('athlete_fmv_data')
        .update(fmvData)
        .eq('athlete_id', athleteId);

      if (updateError) {
        console.error('❌ Update error:', updateError.message);
      } else {
        console.log('✅ FMV data updated successfully!');
      }
    }
  } else {
    console.log('✅ FMV data inserted successfully!');
    console.log('Data:', JSON.stringify(data, null, 2));
  }

  console.log('\n🌐 View at: http://localhost:3000/athletes/sarah-johnson');
}

insertSimpleFmv().catch(console.error);
