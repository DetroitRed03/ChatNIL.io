import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function comprehensiveAudit() {
  console.log('🔍 COMPREHENSIVE PROFILE AUDIT FOR SARAH JOHNSON\n');
  console.log('='.repeat(70), '\n');

  // Get Sarah's user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (userError) {
    console.error('❌ Error fetching user:', userError);
    return;
  }

  console.log('👤 USER DATA:');
  console.log('  ID:', user.id);
  console.log('  Username:', user.username || 'NULL');
  console.log('  Profile Completion:', user.profile_completion_score);
  console.log('');

  // Check FMV data
  console.log('💰 FMV DATA (athlete_fmv_data table):');
  const { data: fmv, error: fmvError } = await supabase
    .from('athlete_fmv_data')
    .select('*')
    .eq('athlete_id', user.id)
    .maybeSingle();

  if (fmvError) {
    console.log('  ⚠️  Table might not exist:', fmvError.message);
  } else if (!fmv) {
    console.log('  ❌ NO FMV DATA - This is a problem!');
  } else {
    console.log('  ✅ FMV Score:', fmv.fmv_score);
    console.log('  ✅ FMV Tier:', fmv.fmv_tier);
    console.log('  ✅ Percentile Rank:', fmv.percentile_rank);
    console.log('  ✅ Deal Value Est:', `$${fmv.estimated_deal_value_low} - $${fmv.estimated_deal_value_high}`);
  }
  console.log('');

  // Check athletic stats
  console.log('🏀 ATHLETIC STATS:');
  console.log('  Height:', user.height_inches ? `${Math.floor(user.height_inches / 12)}'${user.height_inches % 12}"` : '❌ NULL');
  console.log('  Weight:', user.weight_lbs ? `${user.weight_lbs} lbs` : '❌ NULL');
  console.log('  Jersey #:', user.jersey_number ?? '❌ NULL');
  console.log('  Achievements:', user.achievements?.length > 0 ? `✅ ${user.achievements.length} items` : '❌ Empty');
  console.log('');

  // Check content/portfolio
  console.log('📸 CONTENT & PORTFOLIO:');
  console.log('  Content Samples:', user.content_samples ? '✅ Has data' : '❌ NULL');
  console.log('  Profile Video:', user.profile_video_url || '❌ NULL');
  console.log('  Profile Photo:', user.profile_photo_url || '❌ NULL');
  console.log('  Cover Photo:', user.cover_photo_url || '❌ NULL');
  console.log('');

  // Check NIL deals
  console.log('💼 NIL DEALS:');
  const { count: dealsCount } = await supabase
    .from('nil_deals')
    .select('*', { count: 'exact', head: true })
    .eq('athlete_id', user.id);
  console.log('  Active Deals Count:', dealsCount ?? 0);
  console.log('');

  // Summary
  console.log('='.repeat(70));
  console.log('📋 ISSUES FOUND:\n');

  const issues = [];
  if (!fmv) issues.push('❌ Missing FMV data - FMV card won\'t display');
  if (!user.height_inches) issues.push('❌ Missing height - Athletic stats incomplete');
  if (!user.weight_lbs) issues.push('❌ Missing weight - Athletic stats incomplete');
  if (!user.jersey_number) issues.push('❌ Missing jersey number - Athletic stats incomplete');
  if (!user.content_samples) issues.push('❌ Missing content samples - Portfolio empty');
  if (!user.profile_video_url) issues.push('❌ Missing profile video - Portfolio incomplete');
  if (!user.profile_photo_url) issues.push('⚠️  Missing profile photo - Header will use placeholder');
  if (!user.cover_photo_url) issues.push('⚠️  Missing cover photo - Header will use gradient');

  if (issues.length === 0) {
    console.log('  ✅ No issues found! All systems functional.');
  } else {
    issues.forEach(issue => console.log('  ' + issue));
  }
}

comprehensiveAudit();
