import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixFMVVisibility() {
  console.log('🔧 Fixing FMV visibility settings...\n');

  // Option 1: Fix just Sarah's FMV
  console.log('📊 Setting Sarah Johnson\'s FMV to public...');
  const { error: sarahError } = await supabase
    .from('athlete_fmv_data')
    .update({ is_public_score: true })
    .eq('athlete_id', '69ccbc5b-165b-4ae9-8789-b8ef9ae40ce1');

  if (sarahError) {
    console.error('❌ Error updating Sarah:', sarahError);
  } else {
    console.log('✅ Sarah\'s FMV is now public\n');
  }

  // Option 2: Set ALL athletes' FMV scores to public (for demo purposes)
  console.log('🌍 Setting ALL athlete FMV scores to public (for demo)...');
  const { data: updated, error: allError } = await supabase
    .from('athlete_fmv_data')
    .update({ is_public_score: true })
    .eq('is_public_score', false)
    .select('athlete_id');

  if (allError) {
    console.error('❌ Error updating all:', allError);
  } else {
    console.log(`✅ Updated ${updated?.length || 0} athletes to public FMV\n`);
  }

  // Verify Sarah's settings
  console.log('🔍 Verifying Sarah\'s FMV settings...');
  const { data: verification, error: verifyError } = await supabase
    .from('athlete_fmv_data')
    .select('is_public_score, fmv_score, fmv_tier, percentile_rank')
    .eq('athlete_id', '69ccbc5b-165b-4ae9-8789-b8ef9ae40ce1')
    .single();

  if (verifyError) {
    console.error('❌ Verification error:', verifyError);
  } else {
    console.log('📊 Sarah\'s FMV Data:');
    console.log('  is_public_score:', verification.is_public_score ? '✅ TRUE' : '❌ FALSE');
    console.log('  FMV Score:', verification.fmv_score);
    console.log('  FMV Tier:', verification.fmv_tier);
    console.log('  Percentile Rank:', verification.percentile_rank);
  }

  console.log('\n✨ FMV visibility fix complete!');
  console.log('🌐 Visit http://localhost:3000/athletes/sarah-johnson to see the FMV card');
}

fixFMVVisibility();
