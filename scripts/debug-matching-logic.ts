import { createClient } from '@supabase/supabase-js';

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

async function debugMatchingLogic() {
  console.log('🔍 Debugging Matching Logic\n');
  console.log('='.repeat(70));

  // Get campaign
  const { data: campaigns } = await supabase
    .from('agency_campaigns')
    .select('*')
    .eq('status', 'active')
    .limit(1);

  if (!campaigns || campaigns.length === 0) {
    console.log('❌ No campaigns');
    return;
  }

  const campaign = campaigns[0];
  console.log(`\n📋 Campaign: ${campaign.campaign_name}`);
  console.log(`   Target Sports: ${campaign.target_sports?.join(', ')}`);
  console.log(`   Min FMV Score: ${campaign.min_fmv_score}`);
  console.log(`   Min Followers: ${campaign.min_followers?.toLocaleString()}`);

  // Fetch athletes with NEW query syntax
  console.log('\n\n🔄 Fetching athletes with fixed query...\n');

  const { data: athletes, error: athletesError } = await supabase
    .from('users')
    .select(`
      *,
      athlete_public_profiles!inner(*),
      athlete_fmv_data!inner(*),
      social_media_stats!user_id(*)
    `)
    .eq('role', 'athlete')
    .eq('athlete_public_profiles.is_available_for_partnerships', true);

  if (athletesError) {
    console.log(`❌ Query Error: ${athletesError.message}`);
    console.log(`   Details:`, athletesError);
    return;
  }

  if (!athletes || athletes.length === 0) {
    console.log('❌ No athletes found!');
    return;
  }

  console.log(`✅ Found ${athletes.length} athletes`);

  // Analyze first 3 athletes in detail
  console.log('\n\n📊 Analyzing First 3 Athletes:\n');
  console.log('='.repeat(70));

  for (let i = 0; i < Math.min(3, athletes.length); i++) {
    const athlete = athletes[i];
    const profile = athlete.athlete_public_profiles?.[0];
    const fmvData = athlete.athlete_fmv_data?.[0];
    const socialStats = athlete.social_media_stats || [];

    console.log(`\n${i + 1}. ${athlete.first_name} ${athlete.last_name}`);
    console.log(`   ID: ${athlete.id}`);

    console.log(`\n   🎯 Profile Data:`);
    if (profile) {
      console.log(`      ✅ Has profile`);
      console.log(`      Sport: ${profile.sport}`);
      console.log(`      Available: ${profile.is_available_for_partnerships}`);
      console.log(`      State: ${profile.state}`);
    } else {
      console.log(`      ❌ NO PROFILE`);
    }

    console.log(`\n   💰 FMV Data:`);
    if (fmvData) {
      console.log(`      ✅ Has FMV data`);
      console.log(`      FMV Score: ${fmvData.fmv_score}`);
      console.log(`      Tier: ${fmvData.fmv_tier}`);
      console.log(`      Deal Range: $${(fmvData.estimated_deal_value_low / 100).toFixed(0)} - $${(fmvData.estimated_deal_value_high / 100).toFixed(0)}`);
    } else {
      console.log(`      ❌ NO FMV DATA`);
    }

    console.log(`\n   📱 Social Stats:`);
    if (socialStats.length > 0) {
      console.log(`      ✅ Has ${socialStats.length} platforms`);
      const totalFollowers = socialStats.reduce((sum: number, s: any) => sum + (s.followers || 0), 0);
      const avgEngagement = socialStats.reduce((sum: number, s: any) => sum + (s.engagement_rate || 0), 0) / socialStats.length;
      console.log(`      Total Followers: ${totalFollowers.toLocaleString()}`);
      console.log(`      Avg Engagement: ${avgEngagement.toFixed(2)}%`);

      socialStats.forEach((stat: any) => {
        console.log(`         - ${stat.platform}: ${stat.followers?.toLocaleString()} followers (${stat.engagement_rate}%)`);
      });
    } else {
      console.log(`      ❌ NO SOCIAL STATS`);
    }

    // Check if would match campaign criteria
    console.log(`\n   ✅ Matching Checks:`);
    const passesProfile = !!profile;
    const passesFMV = !!fmvData;
    const passesSocial = socialStats.length > 0;
    const totalFollowers = socialStats.reduce((sum: number, s: any) => sum + (s.followers || 0), 0);
    const passesFollowers = !campaign.min_followers || totalFollowers >= campaign.min_followers;
    const passesFMVScore = !campaign.min_fmv_score || (fmvData && fmvData.fmv_score >= campaign.min_fmv_score);
    const passesSport = !campaign.target_sports || campaign.target_sports.length === 0 ||
                       (profile && campaign.target_sports.includes(profile.sport));

    console.log(`      Has Profile: ${passesProfile ? '✅' : '❌'}`);
    console.log(`      Has FMV: ${passesFMV ? '✅' : '❌'}`);
    console.log(`      Has Social Stats: ${passesSocial ? '✅' : '❌'}`);
    console.log(`      Meets Follower Req (${campaign.min_followers?.toLocaleString()}): ${passesFollowers ? '✅' : '❌'} (has ${totalFollowers.toLocaleString()})`);
    console.log(`      Meets FMV Score (${campaign.min_fmv_score}): ${passesFMVScore ? '✅' : '❌'} (has ${fmvData?.fmv_score})`);
    console.log(`      Sport Match (${campaign.target_sports?.join(', ')}): ${passesSport ? '✅' : '❌'} (has ${profile?.sport})`);

    const wouldMatch = passesProfile && passesFMV && passesSocial && passesFollowers && passesFMVScore && passesSport;
    console.log(`\n   ${wouldMatch ? '🎉 WOULD MATCH' : '❌ WOULD NOT MATCH'}`);
  }

  // Check data structure
  console.log('\n\n📦 Data Structure Check:');
  console.log(`   athlete.athlete_public_profiles is: ${Array.isArray(athletes[0].athlete_public_profiles) ? 'Array' : typeof athletes[0].athlete_public_profiles}`);
  console.log(`   athlete.athlete_fmv_data is: ${Array.isArray(athletes[0].athlete_fmv_data) ? 'Array' : typeof athletes[0].athlete_fmv_data}`);
  console.log(`   athlete.social_media_stats is: ${Array.isArray(athletes[0].social_media_stats) ? 'Array' : typeof athletes[0].social_media_stats}`);
}

debugMatchingLogic().catch(console.error);
