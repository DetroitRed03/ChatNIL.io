import { supabaseAdmin } from '../lib/supabase';

// Sample brand users to create
const BRAND_USERS = [
  {
    email: 'nike@chatnil.demo',
    first_name: 'Nike',
    last_name: 'Athletics',
    role: 'brand',
    username: 'nike_athletics'
  },
  {
    email: 'adidas@chatnil.demo',
    first_name: 'Adidas',
    last_name: 'Sports',
    role: 'brand',
    username: 'adidas_sports'
  },
  {
    email: 'gatorade@chatnil.demo',
    first_name: 'Gatorade',
    last_name: 'Performance',
    role: 'brand',
    username: 'gatorade_performance'
  }
];

// Campaign templates to create (will be distributed among brands)
const CAMPAIGN_TEMPLATES = [
  {
    name: 'Spring Basketball Showcase',
    description: 'Multi-athlete campaign featuring top college basketball players during March Madness season',
    status: 'active',
    campaign_type: 'social_media',
    total_budget: 50000,
    spent_budget: 15000,
    start_date: '2024-03-01T00:00:00Z',
    end_date: '2024-04-15T00:00:00Z',
    total_athletes: 8,
    total_impressions: 2500000,
    total_engagement: 125000,
    engagement_rate: 5.0,
    goals: {
      primary: 'Brand awareness during March Madness',
      secondary: 'Drive product sales through athlete endorsements',
      target_impressions: 3000000,
      target_engagement_rate: 6.0
    },
    target_audience: {
      demographics: ['18-34 year olds', 'College sports fans'],
      interests: ['Basketball', 'College sports', 'Athletic apparel']
    }
  },
  {
    name: 'Summer Training Program',
    description: 'Featuring athletes sharing their summer training routines and product usage',
    status: 'active',
    campaign_type: 'content_creation',
    total_budget: 35000,
    spent_budget: 8000,
    start_date: '2024-06-01T00:00:00Z',
    end_date: '2024-08-31T00:00:00Z',
    total_athletes: 12,
    total_impressions: 1800000,
    total_engagement: 90000,
    engagement_rate: 5.0,
    goals: {
      primary: 'Showcase product effectiveness',
      secondary: 'Build authentic athlete partnerships',
      target_impressions: 2500000,
      target_engagement_rate: 5.5
    },
    target_audience: {
      demographics: ['16-30 year olds', 'Fitness enthusiasts'],
      interests: ['Training', 'Fitness', 'Athletic performance']
    }
  },
  {
    name: 'Back to School Game Day',
    description: 'Game day content featuring athletes on their campus and in their communities',
    status: 'pending',
    campaign_type: 'event',
    total_budget: 75000,
    spent_budget: 0,
    start_date: '2024-09-01T00:00:00Z',
    end_date: '2024-11-30T00:00:00Z',
    total_athletes: 0,
    total_impressions: 0,
    total_engagement: 0,
    engagement_rate: 0,
    goals: {
      primary: 'Campus visibility during fall sports season',
      secondary: 'Connect brand with school spirit',
      target_impressions: 4000000,
      target_engagement_rate: 7.0
    },
    target_audience: {
      demographics: ['18-24 year olds', 'College students'],
      interests: ['Football', 'College sports', 'School spirit']
    }
  },
  {
    name: 'Holiday Performance Challenge',
    description: 'Holiday-themed fitness challenge with participating athletes',
    status: 'draft',
    campaign_type: 'influencer',
    total_budget: 40000,
    spent_budget: 0,
    start_date: '2024-12-01T00:00:00Z',
    end_date: '2024-12-31T00:00:00Z',
    total_athletes: 0,
    total_impressions: 0,
    total_engagement: 0,
    engagement_rate: 0,
    goals: {
      primary: 'Holiday season brand engagement',
      secondary: 'Drive year-end sales',
      target_impressions: 2000000,
      target_engagement_rate: 6.5
    },
    target_audience: {
      demographics: ['18-40 year olds', 'Holiday shoppers'],
      interests: ['Fitness', 'Gifts', 'Wellness']
    }
  },
  {
    name: 'Championship Series',
    description: 'Premium campaign featuring top-tier athletes during championship season',
    status: 'completed',
    campaign_type: 'brand_partnership',
    total_budget: 100000,
    spent_budget: 98500,
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-02-28T00:00:00Z',
    total_athletes: 6,
    total_impressions: 5200000,
    total_engagement: 312000,
    engagement_rate: 6.0,
    goals: {
      primary: 'Premium brand positioning',
      secondary: 'Associate with championship excellence',
      target_impressions: 5000000,
      target_engagement_rate: 5.5
    },
    target_audience: {
      demographics: ['21-45 year olds', 'Sports enthusiasts'],
      interests: ['Elite sports', 'Championships', 'Premium products']
    }
  }
];

async function seedCampaigns() {
  console.log('🏢 Creating Sample Campaigns for Agencies...\n');

  // Step 1: Get existing agency users
  console.log('📝 Step 1: Finding existing agency users...\n');

  const { data: agencies, error: agencyError } = await supabaseAdmin
    .from('users')
    .select('id, first_name, last_name')
    .eq('role', 'agency')
    .limit(10);

  if (agencyError || !agencies || agencies.length === 0) {
    console.error('❌ No agency users found in database');
    return;
  }

  console.log(`✅ Found ${agencies.length} agency users\n`);
  agencies.forEach(agency => {
    console.log(`  - ${agency.first_name} ${agency.last_name} (${agency.id})`);
  });

  const agencyIds = agencies.map(a => a.id);
  console.log(`\n✅ ${agencyIds.length} agencies ready to receive campaigns\n`);

  // Step 2: Create campaigns
  console.log('📝 Step 2: Creating campaigns...\n');

  // Distribute campaigns among agencies (round-robin)
  const campaigns = CAMPAIGN_TEMPLATES.map((template, index) => ({
    ...template,
    agency_id: agencyIds[index % agencyIds.length]
  }));

  // Check existing campaigns
  const { data: existingCampaigns } = await supabaseAdmin
    .from('campaigns')
    .select('name');

  const existingNames = new Set(existingCampaigns?.map(c => c.name) || []);

  // Filter out campaigns that already exist
  const newCampaigns = campaigns.filter(c => !existingNames.has(c.name));

  if (newCampaigns.length === 0) {
    console.log('✅ All campaigns already exist!');
  } else {
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert(newCampaigns)
      .select();

    if (error) {
      console.error('❌ Error creating campaigns:', error);
    } else {
      console.log(`✅ Created ${data?.length || 0} campaigns\n`);

      data?.forEach(campaign => {
        console.log(`  - ${campaign.name} (${campaign.status})`);
      });
    }
  }

  // Step 3: Verify final counts
  console.log('\n📊 Final Status:\n');

  const { count: agencyCount } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'agency');

  const { count: campaignCount } = await supabaseAdmin
    .from('campaigns')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ Agency users: ${agencyCount || 0}`);
  console.log(`✅ Campaigns: ${campaignCount || 0}`);

  console.log('\n🎉 Campaign seeding complete!');
}

seedCampaigns();
