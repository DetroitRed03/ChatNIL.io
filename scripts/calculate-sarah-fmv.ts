import { createClient } from '@supabase/supabase-js';
import { calculateFMV, type FMVInputs } from '@/lib/fmv/fmv-calculator';
import type { User, SocialMediaStat, NILDeal } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function calculateSarahFMV() {
  console.log('🧮 CALCULATING FMV FOR SARAH JOHNSON\n');
  console.log('='.repeat(80));
  console.log('\n');

  // 1. Get Sarah's athlete profile
  const { data: athleteProfile } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('username', 'sarah-johnson')
    .single();

  if (!athleteProfile) {
    console.error('❌ Sarah Johnson profile not found');
    return;
  }

  console.log(`✅ Found athlete profile: ${athleteProfile.username}`);
  console.log(`   User ID: ${athleteProfile.user_id}`);

  // 2. Get user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', athleteProfile.user_id)
    .single();

  if (!user) {
    console.error('❌ User data not found');
    return;
  }

  console.log(`   Name: ${user.first_name} ${user.last_name}`);
  console.log(`   Sport: ${athleteProfile.primary_sport}`);
  console.log(`   Position: ${athleteProfile.position}`);
  console.log(`   School: ${athleteProfile.school_name}`);
  console.log('\n');

  // 3. Get social media stats
  const { data: socialStatsData } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('user_id', athleteProfile.user_id)
    .maybeSingle();

  const socialStats: SocialMediaStat[] = [];

  if (socialStatsData) {
    console.log('📱 Social Media Stats:');
    if (socialStatsData.instagram_followers) {
      socialStats.push({
        id: 'instagram',
        user_id: athleteProfile.user_id,
        platform: 'instagram',
        handle: 'sarahjohnson_hoops',
        followers: socialStatsData.instagram_followers,
        engagement_rate: socialStatsData.engagement_rate || 4.2,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log(`   Instagram: ${socialStatsData.instagram_followers.toLocaleString()} followers`);
    }
    if (socialStatsData.tiktok_followers) {
      socialStats.push({
        id: 'tiktok',
        user_id: athleteProfile.user_id,
        platform: 'tiktok',
        handle: 'sjhoops23',
        followers: socialStatsData.tiktok_followers,
        engagement_rate: (socialStatsData.engagement_rate || 4.7) + 2.1,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log(`   TikTok: ${socialStatsData.tiktok_followers.toLocaleString()} followers`);
    }
    if (socialStatsData.twitter_followers) {
      socialStats.push({
        id: 'twitter',
        user_id: athleteProfile.user_id,
        platform: 'twitter',
        handle: 'sarahj_hoops',
        followers: socialStatsData.twitter_followers,
        engagement_rate: (socialStatsData.engagement_rate || 4.7) - 1.6,
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log(`   Twitter: ${socialStatsData.twitter_followers.toLocaleString()} followers`);
    }
    console.log(`   Total: ${socialStatsData.total_followers?.toLocaleString()} followers`);
    console.log(`   Avg Engagement: ${socialStatsData.engagement_rate}%`);
  } else {
    console.log('⚠️  No social media stats found');
  }
  console.log('\n');

  // 4. Get NIL deals
  const { data: nilDeals } = await supabase
    .from('nil_deals')
    .select('*')
    .eq('athlete_id', athleteProfile.user_id);

  console.log(`💼 NIL Deals: ${nilDeals?.length || 0} deals`);
  console.log('\n');

  // 5. Prepare FMV inputs
  const fmvInputs: FMVInputs = {
    athlete: {
      ...user,
      ...athleteProfile,
      id: athleteProfile.user_id,
    } as User,
    socialStats,
    nilDeals: (nilDeals || []) as NILDeal[],
    externalRankings: [],
  };

  // 6. Calculate FMV
  console.log('🧮 Calculating FMV...\n');
  const fmvResult = await calculateFMV(fmvInputs);

  // 7. Display results
  console.log('='.repeat(80));
  console.log('📊 FMV CALCULATION RESULTS');
  console.log('='.repeat(80));
  console.log('\n');
  console.log(`🎯 Overall FMV Score: ${fmvResult.fmv_score}/100`);
  console.log(`🏆 FMV Tier: ${fmvResult.fmv_tier.toUpperCase()}`);
  console.log(`📈 Percentile Rank: Top ${100 - fmvResult.percentile_rank}%`);
  console.log('\n');
  console.log('Category Breakdown:');
  console.log(`   📱 Social Score: ${fmvResult.social_score}/30`);
  console.log(`   ⚽ Athletic Score: ${fmvResult.athletic_score}/30`);
  console.log(`   🌍 Market Score: ${fmvResult.market_score}/20`);
  console.log(`   💼 Brand Score: ${fmvResult.brand_score}/20`);
  console.log('\n');
  console.log('Deal Value Estimates:');
  console.log(`   Sponsored Post: $${fmvResult.estimated_deal_value_low?.toLocaleString()}`);
  console.log(`   Brand Ambassador: $${fmvResult.estimated_deal_value_mid?.toLocaleString()} - $${fmvResult.estimated_deal_value_high?.toLocaleString()}`);
  console.log('\n');

  if (fmvResult.strengths && fmvResult.strengths.length > 0) {
    console.log('💪 Strengths:');
    fmvResult.strengths.forEach(s => console.log(`   ✅ ${s}`));
    console.log('\n');
  }

  if (fmvResult.weaknesses && fmvResult.weaknesses.length > 0) {
    console.log('⚠️  Areas for Improvement:');
    fmvResult.weaknesses.forEach(w => console.log(`   📌 ${w}`));
    console.log('\n');
  }

  if (fmvResult.improvement_suggestions && fmvResult.improvement_suggestions.length > 0) {
    console.log('💡 Top Improvement Suggestions:');
    fmvResult.improvement_suggestions.forEach((suggestion, i) => {
      console.log(`\n   ${i + 1}. ${suggestion.area.toUpperCase()} - ${suggestion.priority.toUpperCase()} PRIORITY`);
      console.log(`      Current: ${suggestion.current}`);
      console.log(`      Target: ${suggestion.target}`);
      console.log(`      Action: ${suggestion.action}`);
      console.log(`      Impact: ${suggestion.impact}`);
    });
    console.log('\n');
  }

  // 8. Save to database
  console.log('='.repeat(80));
  console.log('💾 Saving FMV data to database...');
  console.log('='.repeat(80));
  console.log('\n');

  const { data: existingFmv } = await supabase
    .from('athlete_fmv_data')
    .select('id')
    .eq('athlete_id', athleteProfile.user_id)
    .maybeSingle();

  if (existingFmv) {
    // Update existing record
    const { error } = await supabase
      .from('athlete_fmv_data')
      .update({
        fmv_score: fmvResult.fmv_score,
        fmv_tier: fmvResult.fmv_tier,
        social_score: fmvResult.social_score,
        athletic_score: fmvResult.athletic_score,
        market_score: fmvResult.market_score,
        brand_score: fmvResult.brand_score,
        estimated_deal_value_low: fmvResult.estimated_deal_value_low,
        estimated_deal_value_mid: fmvResult.estimated_deal_value_mid,
        estimated_deal_value_high: fmvResult.estimated_deal_value_high,
        improvement_suggestions: fmvResult.improvement_suggestions,
        strengths: fmvResult.strengths,
        weaknesses: fmvResult.weaknesses,
        percentile_rank: fmvResult.percentile_rank,
        is_public_score: true, // Make it public so it shows on profile
        last_calculation_date: new Date().toISOString(),
        calculation_version: fmvResult.calculation_version,
      })
      .eq('athlete_id', athleteProfile.user_id);

    if (error) {
      console.error('❌ Error updating FMV data:', error.message);
      return;
    }
    console.log('✅ FMV data updated successfully!');
  } else {
    // Insert new record
    const { error } = await supabase
      .from('athlete_fmv_data')
      .insert({
        athlete_id: athleteProfile.user_id,
        fmv_score: fmvResult.fmv_score,
        fmv_tier: fmvResult.fmv_tier,
        social_score: fmvResult.social_score,
        athletic_score: fmvResult.athletic_score,
        market_score: fmvResult.market_score,
        brand_score: fmvResult.brand_score,
        estimated_deal_value_low: fmvResult.estimated_deal_value_low,
        estimated_deal_value_mid: fmvResult.estimated_deal_value_mid,
        estimated_deal_value_high: fmvResult.estimated_deal_value_high,
        improvement_suggestions: fmvResult.improvement_suggestions,
        strengths: fmvResult.strengths,
        weaknesses: fmvResult.weaknesses,
        percentile_rank: fmvResult.percentile_rank,
        is_public_score: true, // Make it public so it shows on profile
        last_calculation_date: new Date().toISOString(),
        calculation_version: fmvResult.calculation_version,
        calculation_count_today: 1,
        last_calculation_reset_date: new Date().toISOString().split('T')[0],
      });

    if (error) {
      console.error('❌ Error inserting FMV data:', error.message);
      console.error('Error details:', error);
      return;
    }
    console.log('✅ FMV data inserted successfully!');
  }

  console.log('\n');
  console.log('='.repeat(80));
  console.log('✅ FMV CALCULATION COMPLETE');
  console.log('='.repeat(80));
  console.log('\n');
  console.log('🌐 View Sarah\'s public profile with FMV:');
  console.log('   http://localhost:3000/athletes/sarah-johnson');
  console.log('\n');
}

calculateSarahFMV().catch(console.error);
