import { createClient } from '@supabase/supabase-js';
import { findCampaignMatches } from '../lib/campaign-matchmaking';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function deepDiveMatchmaking() {
  console.log('🔬 DEEP DIVE: Matchmaking Investigation\n');
  console.log('=' . repeat(60));

  // Step 1: Get Sarah Johnson
  const { data: sarah } = await supabase
    .from('users')
    .select('*')
    .eq('first_name', 'Sarah')
    .eq('last_name', 'Johnson')
    .single();

  if (!sarah) {
    console.log('❌ Sarah Johnson not found!');
    return;
  }

  console.log('\n📋 STEP 1: Athlete Data');
  console.log(`✅ Found: ${sarah.first_name} ${sarah.last_name}`);
  console.log(`   ID: ${sarah.id}`);
  console.log(`   Sport: ${sarah.primary_sport}`);
  console.log(`   School: ${sarah.school_name}`);
  console.log(`   State: ${sarah.state}`);

  // Step 2: Check if she has FMV data
  console.log('\n📋 STEP 2: FMV Data');
  const { data: fmvData, error: fmvError } = await supabase
    .from('athlete_fmv_data')
    .select('*')
    .eq('athlete_id', sarah.id)
    .single();

  if (fmvError || !fmvData) {
    console.log(`❌ No FMV data found!`);
    console.log(`   Error: ${fmvError?.message || 'Record not found'}`);
  } else {
    console.log(`✅ FMV Score: ${fmvData.fmv_score}`);
    console.log(`   Tier: ${fmvData.fmv_tier}`);
    console.log(`   Deal Value: $${(fmvData.estimated_deal_value_mid / 100).toLocaleString()}`);
  }

  // Step 3: Check if she has a public profile
  console.log('\n📋 STEP 3: Public Profile');
  const { data: publicProfile, error: profileError } = await supabase
    .from('athlete_public_profiles')
    .select('*')
    .eq('user_id', sarah.id)
    .single();

  if (profileError || !publicProfile) {
    console.log(`❌ No public profile found!`);
    console.log(`   Error: ${profileError?.message || 'Record not found'}`);
  } else {
    console.log(`✅ Display Name: ${publicProfile.display_name}`);
    console.log(`   Available: ${publicProfile.is_available_for_partnerships}`);
    console.log(`   Partnership Types: ${publicProfile.partnership_types?.join(', ')}`);
  }

  // Step 4: Check social media stats
  console.log('\n📋 STEP 4: Social Media Stats');
  const { data: socialStats, error: socialError } = await supabase
    .from('social_media_stats')
    .select('*')
    .eq('athlete_id', sarah.id)
    .single();

  if (socialError || !socialStats) {
    console.log(`❌ No social media stats found!`);
    console.log(`   Error: ${socialError?.message || 'Record not found'}`);
  } else {
    console.log(`✅ Instagram: ${socialStats.instagram_followers?.toLocaleString()} followers`);
    console.log(`   TikTok: ${socialStats.tiktok_followers?.toLocaleString()} followers`);
    console.log(`   Total Followers: ${socialStats.total_followers?.toLocaleString()}`);
  }

  // Step 5: Test findCampaignMatches directly with one campaign
  console.log('\n📋 STEP 5: Testing findCampaignMatches Function');
  const { data: campaigns } = await supabase
    .from('agency_campaigns')
    .select('*')
    .eq('status', 'active')
    .limit(1);

  if (!campaigns || campaigns.length === 0) {
    console.log('❌ No active campaigns found!');
    return;
  }

  const testCampaign = campaigns[0];
  console.log(`\n🎯 Testing with campaign: ${testCampaign.campaign_name}`);
  console.log(`   Brand: ${testCampaign.brand_name}`);
  console.log(`   Target Sports: ${testCampaign.target_sports?.join(', ')}`);
  console.log(`   Min FMV Score: ${testCampaign.min_fmv_score}`);
  console.log(`   Min Followers: ${testCampaign.min_followers?.toLocaleString()}`);

  try {
    console.log('\n🔄 Calling findCampaignMatches...');
    const matches = await findCampaignMatches(testCampaign.id, {
      minMatchScore: 50,
      maxResults: 100,
      includeBreakdown: true
    });

    console.log(`\n✅ Function returned ${matches.length} total matches`);

    // Check if Sarah is in the matches
    const sarahMatch = matches.find((m: any) => m.athleteId === sarah.id);

    if (sarahMatch) {
      console.log(`\n🎉 FOUND SARAH IN MATCHES!`);
      console.log(`   Match Percentage: ${sarahMatch.matchPercentage}%`);
      console.log(`   Confidence: ${sarahMatch.confidence}`);
      console.log(`   Recommended Offer: $${(sarahMatch.recommendedOffer / 100).toLocaleString()}`);
      console.log(`   Strengths:`, sarahMatch.strengths);
    } else {
      console.log(`\n❌ Sarah NOT found in matches`);
      console.log(`\n📊 Sample of who WAS matched (first 3):`);
      matches.slice(0, 3).forEach((match: any, i: number) => {
        console.log(`\n   ${i + 1}. Athlete ID: ${match.athleteId}`);
        console.log(`      Match: ${match.matchPercentage}%`);
        console.log(`      Name: ${match.athleteName || 'Unknown'}`);
      });
    }

  } catch (error: any) {
    console.log(`\n❌ Error calling findCampaignMatches:`);
    console.log(`   ${error.message}`);
    console.log(`\n   Stack trace:`);
    console.log(error.stack);
  }

  // Step 6: Check requirements
  console.log('\n\n📋 STEP 6: Matchmaking Requirements Analysis');
  console.log('=' . repeat(60));

  const hasUser = !!sarah;
  const hasFMV = !!fmvData;
  const hasProfile = !!publicProfile;
  const hasSocial = !!socialStats;
  const isAvailable = publicProfile?.is_available_for_partnerships;

  console.log(`\n✓ User Record: ${hasUser ? '✅' : '❌'}`);
  console.log(`✓ FMV Data: ${hasFMV ? '✅' : '❌'}`);
  console.log(`✓ Public Profile: ${hasProfile ? '✅' : '❌'}`);
  console.log(`✓ Social Stats: ${hasSocial ? '✅' : '❌'}`);
  console.log(`✓ Available for Partnerships: ${isAvailable ? '✅' : '❌'}`);

  if (!hasFMV || !hasProfile || !hasSocial || !isAvailable) {
    console.log(`\n🔧 MISSING DATA DETECTED!`);
    console.log(`\nTo fix, you need to:`);
    if (!hasFMV) console.log(`   1. Run FMV calculation for Sarah`);
    if (!hasProfile) console.log(`   2. Create public profile for Sarah`);
    if (!hasSocial) console.log(`   3. Add social media stats for Sarah`);
    if (!isAvailable) console.log(`   4. Set is_available_for_partnerships = true`);
  }
}

deepDiveMatchmaking().catch(console.error);
