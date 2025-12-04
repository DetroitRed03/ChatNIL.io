import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAPIQuery() {
  console.log('🧪 Testing API FMV Query Logic...\n');

  const userId = '69ccbc5b-165b-4ae9-8789-b8ef9ae40ce1';

  // Replicate the exact API query
  const { data: fmvData, error } = await supabaseAdmin
    .from('athlete_fmv_data')
    .select('fmv_score, fmv_tier, percentile_rank, is_public_score')
    .eq('athlete_id', userId)
    .order('last_calculated_at', { ascending: false })
    .limit(1)
    .single();

  console.log('📊 Query Result:');
  console.log('  Error:', error);
  console.log('  Data:', fmvData);

  if (fmvData) {
    console.log('\n✅ FMV Data Found:');
    console.log('  is_public_score:', fmvData.is_public_score);
    console.log('  fmv_score:', fmvData.fmv_score);
    console.log('  fmv_tier:', fmvData.fmv_tier);
    console.log('  percentile_rank:', fmvData.percentile_rank);

    console.log('\n🔍 What the API will return:');
    const apiReturn = {
      fmv_score: fmvData.is_public_score ? fmvData.fmv_score : null,
      fmv_tier: fmvData.is_public_score ? fmvData.fmv_tier : null,
      percentile_rank: fmvData.is_public_score ? fmvData.percentile_rank : null,
    };
    console.log('  ', apiReturn);
  } else {
    console.log('\n❌ No FMV data found or error occurred');
  }
}

testAPIQuery();
