import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMatchmakingData() {
  console.log('🌱 SEEDING MATCHMAKING DATA VIA SQL\n');
  console.log('='.repeat(80));

  // Get Sarah's ID
  const { data: sarah } = await supabase
    .from('athlete_profiles')
    .select('user_id')
    .eq('username', 'sarah-johnson')
    .single();

  if (!sarah) {
    console.error('❌ Sarah not found');
    return;
  }

  const sarahId = sarah.user_id;
  console.log(`\n✅ Sarah ID: ${sarahId}`);

  // Get agencies
  const { data: agencies } = await supabase
    .from('agencies')
    .select('id, company_name')
    .limit(8);

  if (!agencies || agencies.length === 0) {
    console.error('❌ No agencies found');
    return;
  }

  console.log(`✅ Found ${agencies.length} agencies`);

  const eliteId = agencies.find(a => a.company_name === 'Elite Sports Management')?.id;
  const digitalId = agencies.find(a => a.company_name === 'Digital Athletes Network')?.id;
  const socialId = agencies.find(a => a.company_name === 'Social Impact Sports')?.id;
  const hometownId = agencies.find(a => a.company_name === 'Hometown Heroes Collective')?.id;
  const premierId = agencies.find(a => a.company_name === 'Premier NIL Group')?.id;

  // SQL to insert data directly
  const sql = `
-- 1. INSERT NIL DEALS
INSERT INTO public.nil_deals (athlete_id, brand_name, deal_type, status, compensation_amount, deal_date, description, is_public)
VALUES
  ('${sarahId}', 'Nike', 'social_media', 'completed', 1500, '2024-06-15', 'Instagram post promoting Nike Basketball shoes', true),
  ('${sarahId}', 'Gatorade', 'content_creation', 'completed', 2000, '2024-07-20', 'TikTok video series featuring hydration tips', true),
  ('${sarahId}', 'Local Sporting Goods', 'brand_ambassador', 'active', 5000, '2024-08-01', 'Monthly brand ambassador with in-store appearances', true)
ON CONFLICT DO NOTHING;

-- 2. INSERT CAMPAIGNS
INSERT INTO public.agency_campaigns (
  agency_user_id, campaign_name, brand_name, description, total_budget, budget_per_athlete,
  target_sports, target_states, target_school_levels, min_followers, min_engagement_rate,
  start_date, end_date, status, required_deliverables
)
VALUES
  (
    '${eliteId}',
    'College Basketball Ambassadors 2024',
    'Nike',
    'Seeking D1 basketball athletes for social media partnerships.',
    10000000,
    500000,
    ARRAY['Basketball']::text[],
    ARRAY['CA', 'NY', 'TX', 'FL']::text[],
    ARRAY['college']::text[],
    25000,
    3.5,
    '2024-09-01',
    '2025-05-31',
    'active',
    '{"posts": 4, "stories": 8, "reels": 2}'::jsonb
  ),
  (
    '${digitalId}',
    'TikTok Content Creators - Sports Edition',
    'Gatorade',
    'Looking for athletic TikTok creators with high engagement.',
    5000000,
    250000,
    ARRAY['Basketball', 'Volleyball', 'Soccer', 'Track']::text[],
    ARRAY['CA', 'NY', 'FL', 'TX', 'IL']::text[],
    ARRAY['college', 'high_school']::text[],
    50000,
    5.0,
    '2024-08-01',
    '2025-03-31',
    'active',
    '{"tiktoks": 6, "instagram_reels": 3, "stories": 10}'::jsonb
  ),
  (
    '${socialId}',
    'Athletes for Education',
    'Scholars United',
    'Mission-driven campaign supporting educational access.',
    3000000,
    150000,
    ARRAY['Basketball', 'Soccer', 'Track', 'Volleyball']::text[],
    ARRAY['KY', 'CA', 'TX', 'FL']::text[],
    ARRAY['college']::text[],
    10000,
    3.0,
    '2024-09-15',
    '2025-06-30',
    'active',
    '{"posts": 2, "stories": 6, "community_events": 1}'::jsonb
  ),
  (
    '${hometownId}',
    'Local Business Ambassadors - Kentucky',
    'Kentucky Small Business Coalition',
    'Support local businesses through athlete partnerships.',
    2000000,
    100000,
    ARRAY['Basketball', 'Football', 'Baseball', 'Volleyball']::text[],
    ARRAY['KY']::text[],
    ARRAY['college', 'high_school']::text[],
    5000,
    2.5,
    '2024-10-01',
    '2025-04-30',
    'active',
    '{"posts": 3, "appearances": 2, "local_events": 1}'::jsonb
  ),
  (
    '${premierId}',
    'Elite Athletes Partnership Program',
    'Premium Brand Collective',
    'Exclusive partnerships for top-tier athletes.',
    30000000,
    1500000,
    ARRAY['Basketball', 'Football']::text[],
    ARRAY['CA', 'NY', 'TX', 'FL', 'IL']::text[],
    ARRAY['college']::text[],
    100000,
    4.5,
    '2024-11-01',
    '2025-10-31',
    'active',
    '{"posts": 8, "reels": 6, "stories": 20, "appearances": 4}'::jsonb
  )
ON CONFLICT DO NOTHING;

-- 3. INSERT AGENCY-ATHLETE MATCHES
INSERT INTO public.agency_athlete_matches (
  agency_id, athlete_id, match_score, match_reason, status
)
VALUES
  (
    '${eliteId}',
    '${sarahId}',
    85,
    'Perfect match for basketball-focused partnerships. Strong social presence (145.8K followers) with proven engagement (4.7%). D1 UCLA athlete with team leadership experience.',
    'pending'
  ),
  (
    '${digitalId}',
    '${sarahId}',
    78,
    'Excellent fit for digital campaigns. Outstanding TikTok presence (82.1K) with high engagement rate. California market alignment and strong content creation portfolio.',
    'pending'
  ),
  (
    '${socialId}',
    '${sarahId}',
    72,
    'Great candidate for mission-driven campaigns. Academic All-American status, team captain leadership, and demonstrated community focus.',
    'pending'
  )
ON CONFLICT DO NOTHING;

-- Done
SELECT 'Seeding completed successfully!' as result;
  `;

  console.log('\n📝 Executing SQL...\n');

  try {
    // Use fetch to hit the SQL endpoint directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`\n⚠️  exec_sql RPC not available`);
      console.log(`\n📋 Manual SQL Application Required:\n`);
      console.log('1. Open Supabase Dashboard > SQL Editor');
      console.log('2. Copy and paste the SQL below:');
      console.log('\n' + '='.repeat(80));
      console.log(sql);
      console.log('='.repeat(80) + '\n');
      console.log('3. Click "Run"');
      console.log('4. Verify data was created\n');
      return;
    }

    const result = await response.json();
    console.log('✅ SQL executed successfully!\n');
    console.log(result);

    // Verify data
    console.log('\n🔍 Verifying seeded data...\n');

    const { count: nilCount } = await supabase
      .from('nil_deals')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', sarahId);

    const { count: campCount } = await supabase
      .from('agency_campaigns')
      .select('*', { count: 'exact', head: true });

    const { count: matchCount } = await supabase
      .from('agency_athlete_matches')
      .select('*', { count: 'exact', head: true })
      .eq('athlete_id', sarahId);

    console.log(`✅ NIL Deals: ${nilCount || 0} for Sarah`);
    console.log(`✅ Campaigns: ${campCount || 0} total`);
    console.log(`✅ Matches: ${matchCount || 0} for Sarah`);

  } catch (err: any) {
    console.error(`\n❌ Error: ${err.message}\n`);
    console.log(`\n📋 Manual SQL Application Required:\n`);
    console.log('Copy the SQL below and run it in Supabase SQL Editor:\n');
    console.log('='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80) + '\n');
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ MATCHMAKING DATA SEEDING COMPLETE!\n');
}

seedMatchmakingData();
