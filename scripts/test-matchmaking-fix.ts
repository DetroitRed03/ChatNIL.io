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

async function testMatchmakingFix() {
  console.log('🧪 Testing Matchmaking Fix\n');
  console.log('='.repeat(60));

  // Get first active campaign
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
  console.log(`\n📋 Testing with Campaign: ${testCampaign.campaign_name}`);
  console.log(`   Brand: ${testCampaign.brand_name}`);
  console.log(`   ID: ${testCampaign.id}`);

  try {
    console.log('\n🔄 Running matchmaking...');

    const matches = await findCampaignMatches(testCampaign.id, {
      minMatchScore: 50,
      maxResults: 100,
      includeBreakdown: true
    });

    console.log(`\n✅ SUCCESS! Found ${matches.length} matches`);

    if (matches.length > 0) {
      console.log('\n📊 Top 5 Matches:');
      matches.slice(0, 5).forEach((match, i) => {
        console.log(`\n${i + 1}. ${match.athleteName}`);
        console.log(`   Match Score: ${match.matchPercentage}%`);
        console.log(`   Confidence: ${match.confidence}`);
        console.log(`   Recommended Offer: $${(match.recommendedOffer / 100).toLocaleString()}`);
        console.log(`   Strengths: ${match.strengths.join(', ')}`);
      });

      // Check if Sarah Johnson is in the matches
      const sarah = matches.find(m => m.athleteName.includes('Sarah') && m.athleteName.includes('Johnson'));
      if (sarah) {
        console.log('\n\n🎉 SARAH JOHNSON FOUND IN MATCHES!');
        console.log(`   Match Score: ${sarah.matchPercentage}%`);
        console.log(`   Rank: ${matches.indexOf(sarah) + 1} out of ${matches.length}`);
      } else {
        console.log('\n\n⚠️  Sarah Johnson not found in matches');
      }
    } else {
      console.log('\n⚠️  No matches found (this could be normal if no athletes meet criteria)');
    }

  } catch (error: any) {
    console.log(`\n❌ ERROR: ${error.message}`);
    console.log(`\nStack trace:`);
    console.log(error.stack);
  }
}

testMatchmakingFix().catch(console.error);
