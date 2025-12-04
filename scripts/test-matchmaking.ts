#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { findCampaignMatches } from '../lib/campaign-matchmaking';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestCampaign(): Promise<string> {
  console.log('📝 Creating test campaign...\n');

  // Get a random agency user
  const { data: agencies } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'agency')
    .limit(1);

  if (!agencies || agencies.length === 0) {
    throw new Error('No agencies found');
  }

  const agencyId = agencies[0].id;
  const campaignId = crypto.randomUUID();

  // Create test campaign using SQL to bypass RLS
  const insertSQL = `
    INSERT INTO agency_campaigns (
      id,
      agency_user_id,
      campaign_name,
      brand_name,
      description,
      total_budget,
      budget_per_athlete,
      target_sports,
      target_states,
      target_school_levels,
      min_followers,
      min_engagement_rate,
      start_date,
      end_date,
      status,
      required_deliverables
    ) VALUES (
      '${campaignId}',
      '${agencyId}',
      'Nike Basketball Summer Campaign 2025',
      'Nike',
      'Looking for basketball athletes for summer shoe launch campaign',
      5000000,
      500000,
      ARRAY['Basketball'],
      ARRAY['KY', 'TN', 'OH', 'IN'],
      ARRAY['high_school', 'college'],
      5000,
      3.0,
      '2025-06-01',
      '2025-08-31',
      'active',
      '{"posts": 3, "stories": 5, "video": 1}'::jsonb
    );
  `;

  const { error } = await supabase.rpc('exec_sql', {
    query: insertSQL
  });

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`);
  }

  console.log(`✅ Created campaign: "Nike Basketball Summer Campaign 2025"`);
  console.log(`   Campaign ID: ${campaignId}`);
  console.log(`   Budget per athlete: $5,000`);
  console.log(`   Target sports: Basketball`);
  console.log(`   Target states: KY, TN, OH, IN`);
  console.log(`   Min followers: 5,000\n`);

  return campaignId;
}

async function testMatchmaking() {
  console.log('🎯 Testing Campaign Matchmaking Engine...\n');
  console.log('━'.repeat(70));
  console.log('\n');

  try {
    // Create test campaign
    const campaignId = await createTestCampaign();

    // Run matchmaking
    console.log('🔄 Running matchmaking algorithm...\n');
    const matches = await findCampaignMatches(campaignId, {
      minMatchScore: 40,
      maxResults: 10,
      includeBreakdown: true
    });

    if (matches.length === 0) {
      console.log('⚠️  No matches found with minimum score of 40%\n');
      return;
    }

    console.log(`✅ Found ${matches.length} matches!\n`);
    console.log('━'.repeat(70));
    console.log('\n');

    // Display top matches
    console.log('🏆 TOP 10 ATHLETE MATCHES:\n');

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      console.log(`${i + 1}. ${match.athleteName} - ${match.matchPercentage}% MATCH (${match.confidence.toUpperCase()} CONFIDENCE)`);
      console.log(`   Sport: ${match.athleteProfile.sport} | School: ${match.athleteProfile.school_name}`);
      console.log(`   State: ${match.athleteProfile.state} | Level: ${match.athleteProfile.school_level}`);

      // Score breakdown
      console.log(`\n   📊 Score Breakdown:`);
      console.log(`      Brand Values: ${match.matchScore.brandValues}/20`);
      console.log(`      Interests: ${match.matchScore.interests}/15`);
      console.log(`      Campaign Fit: ${match.matchScore.campaignFit}/20`);
      console.log(`      Budget: ${match.matchScore.budget}/15`);
      console.log(`      Geography: ${match.matchScore.geography}/10`);
      console.log(`      Demographics: ${match.matchScore.demographics}/10`);
      console.log(`      Engagement: ${match.matchScore.engagement}/10`);

      // Strengths
      if (match.strengths.length > 0) {
        console.log(`\n   ✅ Strengths:`);
        match.strengths.forEach(s => console.log(`      • ${s}`));
      }

      // Concerns
      if (match.concerns.length > 0) {
        console.log(`\n   ⚠️  Concerns:`);
        match.concerns.forEach(c => console.log(`      • ${c}`));
      }

      // Recommended offer
      console.log(`\n   💰 Recommended Offer: $${(match.recommendedOffer / 100).toLocaleString()}`);
      console.log('');
    }

    console.log('━'.repeat(70));
    console.log('\n');

    // Match quality distribution
    const excellent = matches.filter(m => m.matchPercentage >= 80).length;
    const good = matches.filter(m => m.matchPercentage >= 60 && m.matchPercentage < 80).length;
    const potential = matches.filter(m => m.matchPercentage >= 40 && m.matchPercentage < 60).length;

    console.log('📈 Match Quality Distribution:\n');
    console.log(`   Excellent (80%+): ${excellent} matches`);
    console.log(`   Good (60-79%): ${good} matches`);
    console.log(`   Potential (40-59%): ${potential} matches`);

    console.log('\n━'.repeat(70));
    console.log('\n✅ Matchmaking test completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testMatchmaking();
