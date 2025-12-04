import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFeatures() {
  console.log('🔍 Checking Sarah Johnson\'s feature data...\n');

  const { data, error } = await supabase
    .from('users')
    .select('fmv_score, fmv_tier, percentile_rank, active_deals_count, content_samples, profile_video_url, achievements, height_inches, weight_lbs, jersey_number')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📊 Feature Data for Sarah:\n');
  console.log('💰 FMV & Rankings:');
  console.log('  FMV Score:', data?.fmv_score ?? 'NULL');
  console.log('  FMV Tier:', data?.fmv_tier ?? 'NULL');
  console.log('  Percentile Rank:', data?.percentile_rank ?? 'NULL');

  console.log('\n📋 NIL & Content:');
  console.log('  Active Deals:', data?.active_deals_count ?? 0);
  console.log('  Content Samples:', data?.content_samples ?? 'NULL');
  console.log('  Profile Video:', data?.profile_video_url ?? 'NULL');

  console.log('\n🏆 Athletic Info:');
  console.log('  Achievements:', data?.achievements ?? 'NULL');
  console.log('  Height:', data?.height_inches ?? 'NULL', data?.height_inches ? `(${Math.floor(data.height_inches / 12)}'${data.height_inches % 12}")` : '');
  console.log('  Weight:', data?.weight_lbs ?? 'NULL', data?.weight_lbs ? `lbs` : '');
  console.log('  Jersey #:', data?.jersey_number ?? 'NULL');

  console.log('\n🔍 Missing/NULL Fields:');
  const missing = [];
  if (!data?.fmv_score) missing.push('FMV Score');
  if (!data?.fmv_tier) missing.push('FMV Tier');
  if (data?.percentile_rank === null || data?.percentile_rank === undefined) missing.push('Percentile Rank');
  if (!data?.content_samples) missing.push('Content Samples');
  if (!data?.profile_video_url) missing.push('Profile Video');
  if (!data?.height_inches) missing.push('Height');
  if (!data?.weight_lbs) missing.push('Weight');
  if (!data?.jersey_number) missing.push('Jersey Number');

  if (missing.length > 0) {
    missing.forEach(field => console.log('  ❌', field));
  } else {
    console.log('  ✅ All fields populated!');
  }
}

checkFeatures();
