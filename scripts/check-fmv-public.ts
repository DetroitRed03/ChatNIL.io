import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
  const { data, error } = await supabase
    .from('athlete_fmv_data')
    .select('*')
    .eq('athlete_id', '69ccbc5b-165b-4ae9-8789-b8ef9ae40ce1')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('📊 Sarah\'s FMV Data Privacy Settings:\n');
  console.log('is_public_score:', data?.is_public_score);
  console.log('is_public_breakdown:', data?.is_public_breakdown);
  console.log('is_public_comparison:', data?.is_public_comparison);
  console.log('\nFull FMV record:', JSON.stringify(data, null, 2));
}

check();
