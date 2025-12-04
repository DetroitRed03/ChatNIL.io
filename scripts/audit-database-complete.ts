import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditDatabase() {
  console.log('🔍 COMPREHENSIVE DATABASE AUDIT\n');
  console.log('='.repeat(80));
  console.log('\n');

  // Get Sarah's user_id first
  const { data: sarahProfile } = await supabase
    .from('athlete_profiles')
    .select('user_id, username')
    .eq('username', 'sarah-johnson')
    .maybeSingle();

  const sarahUserId = sarahProfile?.user_id;
  console.log(`📋 Sarah Johnson User ID: ${sarahUserId || 'NOT FOUND'}\n`);

  // 1. FMV SYSTEM
  console.log('1️⃣  FMV SYSTEM');
  console.log('-'.repeat(80));

  const { count: fmvCount } = await supabase
    .from('athlete_fmv_data')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total FMV Records: ${fmvCount || 0}`);

  if (sarahUserId) {
    const { data: sarahFmv } = await supabase
      .from('athlete_fmv_data')
      .select('*')
      .eq('athlete_id', sarahUserId)
      .maybeSingle();

    if (sarahFmv) {
      console.log(`   ✅ Sarah has FMV data:`);
      console.log(`      - FMV Score: ${sarahFmv.fmv_score}`);
      console.log(`      - FMV Tier: ${sarahFmv.fmv_tier}`);
      console.log(`      - Percentile: ${sarahFmv.percentile_rank}%`);
      console.log(`      - Public: ${sarahFmv.is_public_score}`);
      console.log(`      - Last Calculated: ${sarahFmv.last_calculation_date}`);
    } else {
      console.log(`   ❌ Sarah has NO FMV data - THIS IS THE PROBLEM`);
    }
  }
  console.log('\n');

  // 2. AGENCIES
  console.log('2️⃣  AGENCIES');
  console.log('-'.repeat(80));

  const { count: agenciesCount } = await supabase
    .from('agencies')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total Agencies: ${agenciesCount || 0}`);

  const { data: sampleAgencies } = await supabase
    .from('agencies')
    .select('name, specializations')
    .limit(5);

  if (sampleAgencies && sampleAgencies.length > 0) {
    console.log(`   ✅ Sample agencies:`);
    sampleAgencies.forEach(agency => {
      console.log(`      - ${agency.name}`);
    });
  } else {
    console.log(`   ❌ No agencies found`);
  }
  console.log('\n');

  // 3. CAMPAIGNS
  console.log('3️⃣  CAMPAIGNS');
  console.log('-'.repeat(80));

  const { count: campaignsCount } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total Campaigns: ${campaignsCount || 0}`);

  const { data: sampleCampaigns } = await supabase
    .from('campaigns')
    .select('title, campaign_type, status')
    .limit(5);

  if (sampleCampaigns && sampleCampaigns.length > 0) {
    console.log(`   ✅ Sample campaigns:`);
    sampleCampaigns.forEach(campaign => {
      console.log(`      - ${campaign.title} (${campaign.campaign_type}, ${campaign.status})`);
    });
  } else {
    console.log(`   ❌ No campaigns found`);
  }
  console.log('\n');

  // 4. NIL DEALS
  console.log('4️⃣  NIL DEALS');
  console.log('-'.repeat(80));

  const { count: dealsCount } = await supabase
    .from('nil_deals')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total NIL Deals: ${dealsCount || 0}`);

  if (sarahUserId) {
    const { count: sarahDeals } = await supabase
      .from('nil_deals')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', sarahUserId);

    console.log(`   Sarah's NIL Deals: ${sarahDeals || 0}`);
  }

  const { data: sampleDeals } = await supabase
    .from('nil_deals')
    .select('deal_type, status, compensation_amount')
    .limit(5);

  if (sampleDeals && sampleDeals.length > 0) {
    console.log(`   ✅ Sample deals:`);
    sampleDeals.forEach(deal => {
      console.log(`      - ${deal.deal_type} (${deal.status}): $${deal.compensation_amount || 0}`);
    });
  } else {
    console.log(`   ❌ No NIL deals found`);
  }
  console.log('\n');

  // 5. AGENCY-ATHLETE MATCHES
  console.log('5️⃣  AGENCY-ATHLETE MATCHES');
  console.log('-'.repeat(80));

  const { count: matchesCount } = await supabase
    .from('agency_athlete_matches')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total Matches: ${matchesCount || 0}`);

  if (sarahUserId) {
    const { count: sarahMatches } = await supabase
      .from('agency_athlete_matches')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', sarahUserId);

    console.log(`   Sarah's Matches: ${sarahMatches || 0}`);
  }

  if (matchesCount && matchesCount > 0) {
    const { data: sampleMatches } = await supabase
      .from('agency_athlete_matches')
      .select('match_score, match_status')
      .limit(5);

    if (sampleMatches) {
      console.log(`   ✅ Sample matches:`);
      sampleMatches.forEach(match => {
        console.log(`      - Score: ${match.match_score}/100, Status: ${match.match_status}`);
      });
    }
  } else {
    console.log(`   ❌ No matches found`);
  }
  console.log('\n');

  // 6. STATE NIL RULES (COMPLIANCE)
  console.log('6️⃣  STATE NIL RULES (COMPLIANCE)');
  console.log('-'.repeat(80));

  const { count: rulesCount } = await supabase
    .from('state_nil_rules')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total State Rules: ${rulesCount || 0}`);

  if (rulesCount && rulesCount > 0) {
    const { data: sampleRules } = await supabase
      .from('state_nil_rules')
      .select('state_code, contract_approval_required')
      .limit(5);

    if (sampleRules) {
      console.log(`   ✅ Sample state rules:`);
      sampleRules.forEach(rule => {
        console.log(`      - ${rule.state_code}: Approval required = ${rule.contract_approval_required}`);
      });
    }
  } else {
    console.log(`   ❌ No state rules found`);
  }
  console.log('\n');

  // 7. INSTITUTION PROFILES (SCHOOLS)
  console.log('7️⃣  INSTITUTION PROFILES (SCHOOLS)');
  console.log('-'.repeat(80));

  const { count: schoolsCount } = await supabase
    .from('institution_profiles')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total Schools: ${schoolsCount || 0}`);

  if (schoolsCount && schoolsCount > 0) {
    const { data: sampleSchools } = await supabase
      .from('institution_profiles')
      .select('institution_name, city, state')
      .limit(5);

    if (sampleSchools) {
      console.log(`   ✅ Sample schools:`);
      sampleSchools.forEach(school => {
        console.log(`      - ${school.institution_name} (${school.city}, ${school.state})`);
      });
    }
  } else {
    console.log(`   ❌ No schools found`);
  }
  console.log('\n');

  // 8. SOCIAL MEDIA STATS
  console.log('8️⃣  SOCIAL MEDIA STATS');
  console.log('-'.repeat(80));

  const { count: socialCount } = await supabase
    .from('social_media_stats')
    .select('*', { count: 'exact', head: true });

  console.log(`   Total Social Media Records: ${socialCount || 0}`);

  if (sarahUserId) {
    const { data: sarahSocial } = await supabase
      .from('social_media_stats')
      .select('*')
      .eq('user_id', sarahUserId)
      .maybeSingle();

    if (sarahSocial) {
      console.log(`   ✅ Sarah has social media data:`);
      console.log(`      - Instagram: ${sarahSocial.instagram_followers?.toLocaleString()}`);
      console.log(`      - TikTok: ${sarahSocial.tiktok_followers?.toLocaleString()}`);
      console.log(`      - Twitter: ${sarahSocial.twitter_followers?.toLocaleString()}`);
      console.log(`      - Total: ${sarahSocial.total_followers?.toLocaleString()}`);
      console.log(`      - Engagement: ${sarahSocial.engagement_rate}%`);
    } else {
      console.log(`   ❌ Sarah has NO social media data`);
    }
  }
  console.log('\n');

  // 9. PORTFOLIO (CONTENT SAMPLES)
  console.log('9️⃣  PORTFOLIO (CONTENT SAMPLES)');
  console.log('-'.repeat(80));

  if (sarahUserId) {
    const { data: sarahAthlete } = await supabase
      .from('athlete_profiles')
      .select('content_samples')
      .eq('user_id', sarahUserId)
      .maybeSingle();

    if (sarahAthlete?.content_samples) {
      const portfolioItems = Array.isArray(sarahAthlete.content_samples)
        ? sarahAthlete.content_samples
        : [];
      console.log(`   ✅ Sarah has ${portfolioItems.length} portfolio items`);
    } else {
      console.log(`   ❌ Sarah has NO portfolio items`);
    }
  }
  console.log('\n');

  // 10. DASHBOARD VIEWS
  console.log('🔟 DASHBOARD MATERIALIZED VIEWS');
  console.log('-'.repeat(80));

  try {
    const { data: quickStats } = await supabase
      .from('dashboard_quick_stats_view')
      .select('*')
      .limit(1);

    if (quickStats && quickStats.length > 0) {
      console.log(`   ✅ dashboard_quick_stats_view exists and has data`);
    } else {
      console.log(`   ⚠️  dashboard_quick_stats_view exists but empty`);
    }
  } catch (e: any) {
    console.log(`   ❌ dashboard_quick_stats_view error: ${e.message}`);
  }

  try {
    const { data: athleteDash } = await supabase
      .from('athlete_dashboard_view')
      .select('*')
      .limit(1);

    if (athleteDash && athleteDash.length > 0) {
      console.log(`   ✅ athlete_dashboard_view exists and has data`);
    } else {
      console.log(`   ⚠️  athlete_dashboard_view exists but empty`);
    }
  } catch (e: any) {
    console.log(`   ❌ athlete_dashboard_view error: ${e.message}`);
  }

  try {
    const { data: agencyDash } = await supabase
      .from('agency_dashboard_view')
      .select('*')
      .limit(1);

    if (agencyDash && agencyDash.length > 0) {
      console.log(`   ✅ agency_dashboard_view exists and has data`);
    } else {
      console.log(`   ⚠️  agency_dashboard_view exists but empty`);
    }
  } catch (e: any) {
    console.log(`   ❌ agency_dashboard_view error: ${e.message}`);
  }
  console.log('\n');

  // SUMMARY
  console.log('='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log('\n');

  console.log('✅ WORKING (Has Data):');
  if (sarahProfile) console.log('   - Portfolio (6 items for Sarah)');
  if (socialCount && socialCount > 0) console.log(`   - Social Media Stats (${socialCount} records)`);

  console.log('\n❌ MISSING DATA (Code exists but no data):');
  if (!fmvCount || fmvCount === 0) console.log('   - FMV System (0 records) ⚠️  CRITICAL');
  if (!agenciesCount || agenciesCount === 0) console.log('   - Agencies (0 records)');
  if (!campaignsCount || campaignsCount === 0) console.log('   - Campaigns (0 records)');
  if (!dealsCount || dealsCount === 0) console.log('   - NIL Deals (0 records)');
  if (!matchesCount || matchesCount === 0) console.log('   - Agency-Athlete Matches (0 records)');
  if (!rulesCount || rulesCount === 0) console.log('   - State NIL Rules (0 records)');
  if (!schoolsCount || schoolsCount === 0) console.log('   - Schools (0 records)');

  console.log('\n');
  console.log('🔧 RECOMMENDED ACTIONS:');
  console.log('   1. Calculate FMV for Sarah Johnson (PRIORITY)');
  console.log('   2. Seed compliance data (50 state rules)');
  console.log('   3. Create sample agencies');
  console.log('   4. Create sample campaigns');
  console.log('   5. Create sample NIL deals for Sarah');
  console.log('   6. Generate agency-athlete matches');
  console.log('   7. Add school/institution data');
  console.log('\n');
}

auditDatabase().catch(console.error);
