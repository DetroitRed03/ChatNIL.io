/**
 * Seed Demo Data for Agency Matchmaking
 * Run this after applying migration 040_agency_platform_minimal.sql
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  console.log('🌱 Seeding Demo Data for Agency Matchmaking\n');

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Step 1: Create athlete_public_profiles for all athletes
  console.log('1️⃣ Creating athlete public profiles...');

  const { data: athletes, error: athletesError } = await supabase
    .from('users')
    .select('id, first_name, last_name, primary_sport, school_name, graduation_year')
    .eq('role', 'athlete');

  if (athletesError) {
    console.error('❌ Error fetching athletes:', athletesError.message);
    return;
  }

  console.log(`   Found ${athletes.length} athletes to process`);

  let profilesCreated = 0;
  for (const athlete of athletes) {
    const slug = `${athlete.first_name?.toLowerCase()}-${athlete.last_name?.toLowerCase()}`.replace(/[^a-z0-9-]/g, '');

    const profileData = {
      user_id: athlete.id,
      display_name: `${athlete.first_name} ${athlete.last_name}`,
      sport: athlete.primary_sport || 'Unknown',
      school: athlete.school_name,
      graduation_year: athlete.graduation_year,
      bio: `${athlete.primary_sport} athlete at ${athlete.school_name || 'my school'}`,
      partnership_types: ['sponsored_posts', 'events', 'appearances'],
      slug: slug
    };

    const { error } = await supabase
      .from('athlete_public_profiles')
      .insert(profileData);

    if (error) {
      if (!error.message.includes('duplicate key')) {
        console.error(`   ⚠️  Error creating profile for ${athlete.first_name} ${athlete.last_name}:`, error.message);
      }
    } else {
      profilesCreated++;
    }
  }

  console.log(`✅ Created ${profilesCreated} athlete public profiles\n`);

  // Step 2: Create sample agency campaigns
  console.log('2️⃣ Creating sample agency campaigns...');

  // Get a user to use as agency_user_id (just use first user for demo)
  const { data: firstUser } = await supabase
    .from('users')
    .select('id')
    .limit(1)
    .single();

  if (!firstUser) {
    console.error('❌ No users found to create campaigns');
    return;
  }

  const sampleCampaigns = [
    {
      agency_user_id: firstUser.id,
      campaign_name: 'Nike Basketball Showcase',
      brand_name: 'Nike',
      description: 'Showcase basketball athletes wearing Nike gear',
      total_budget: 5000000, // $50,000
      budget_per_athlete: 250000, // $2,500
      target_sports: ['Basketball'],
      target_states: ['California', 'Texas', 'Florida'],
      target_school_levels: ['college'],
      min_followers: 5000,
      min_engagement_rate: 3.0,
      status: 'active',
      required_deliverables: { posts: 3, stories: 5 }
    },
    {
      agency_user_id: firstUser.id,
      campaign_name: 'Gatorade Performance Series',
      brand_name: 'Gatorade',
      description: 'Multi-sport performance campaign',
      total_budget: 10000000, // $100,000
      budget_per_athlete: 300000, // $3,000
      target_sports: ['Football', 'Basketball', 'Soccer', 'Track and Field'],
      target_states: [],
      target_school_levels: ['college'],
      min_followers: 10000,
      min_engagement_rate: 4.0,
      status: 'active',
      required_deliverables: { posts: 4, stories: 10, video: 1 }
    },
    {
      agency_user_id: firstUser.id,
      campaign_name: 'Adidas Soccer Spotlight',
      brand_name: 'Adidas',
      description: 'Feature soccer athletes in Adidas gear',
      total_budget: 3000000, // $30,000
      budget_per_athlete: 200000, // $2,000
      target_sports: ['Soccer'],
      target_states: [],
      target_school_levels: ['college', 'high_school'],
      min_followers: 3000,
      min_engagement_rate: 3.5,
      status: 'active',
      required_deliverables: { posts: 2, stories: 3 }
    },
    {
      agency_user_id: firstUser.id,
      campaign_name: 'Under Armour Volleyball Campaign',
      brand_name: 'Under Armour',
      description: 'Volleyball athletes promoting Under Armour products',
      total_budget: 2000000, // $20,000
      budget_per_athlete: 150000, // $1,500
      target_sports: ['Volleyball'],
      target_states: ['California', 'Florida', 'Texas'],
      target_school_levels: ['college'],
      min_followers: 2000,
      min_engagement_rate: 3.0,
      status: 'active',
      required_deliverables: { posts: 3, stories: 5 }
    },
    {
      agency_user_id: firstUser.id,
      campaign_name: 'Lululemon Wellness Initiative',
      brand_name: 'Lululemon',
      description: 'Female athletes promoting wellness and fitness',
      total_budget: 4000000, // $40,000
      budget_per_athlete: 200000, // $2,000
      target_sports: ['Track and Field', 'Swimming', 'Gymnastics', 'Volleyball'],
      target_states: [],
      target_school_levels: ['college'],
      min_followers: 5000,
      min_engagement_rate: 4.5,
      status: 'active',
      required_deliverables: { posts: 4, stories: 8, video: 1 }
    },
    {
      agency_user_id: firstUser.id,
      campaign_name: 'Powerade Elite Athletes',
      brand_name: 'Powerade',
      description: 'High-performing athletes across all sports',
      total_budget: 8000000, // $80,000
      budget_per_athlete: 400000, // $4,000
      target_sports: ['Football', 'Basketball', 'Baseball', 'Track and Field'],
      target_states: [],
      target_school_levels: ['college'],
      min_followers: 15000,
      min_engagement_rate: 5.0,
      status: 'active',
      required_deliverables: { posts: 5, stories: 15, video: 2 }
    }
  ];

  const { data: createdCampaigns, error: campaignsError } = await supabase
    .from('agency_campaigns')
    .insert(sampleCampaigns)
    .select();

  if (campaignsError) {
    console.error('❌ Error creating campaigns:', campaignsError.message);
  } else {
    console.log(`✅ Created ${createdCampaigns.length} sample campaigns\n`);
    console.log('Sample campaigns:');
    createdCampaigns.forEach((c: any) => {
      console.log(`   - ${c.campaign_name} (${c.brand_name})`);
    });
  }

  console.log('\n✅ Demo data seeding complete!');
  console.log('\nNext steps:');
  console.log('1. Test endpoints with: npx tsx scripts/test-demo-endpoints.ts');
  console.log('2. Visit the demo page to see matchmaking in action');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
