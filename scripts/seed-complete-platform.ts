#!/usr/bin/env tsx

/**
 * Comprehensive Platform Seeding Script
 * Seeds all tables with realistic test data for development and testing
 *
 * Usage: npx tsx scripts/seed-complete-platform.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ============================================================================
// DATA GENERATORS
// ============================================================================

const FIRST_NAMES = {
  male: ['James', 'Michael', 'David', 'Chris', 'Marcus', 'Tyler', 'Jordan', 'Brandon', 'Kevin', 'Justin'],
  female: ['Sarah', 'Jessica', 'Emily', 'Ashley', 'Madison', 'Taylor', 'Morgan', 'Alexis', 'Samantha', 'Rachel']
};

const LAST_NAMES = [
  'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas',
  'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez',
  'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill'
];

const SPORTS = [
  { name: 'Basketball', positions: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'] },
  { name: 'Football', positions: ['Quarterback', 'Running Back', 'Wide Receiver', 'Tight End', 'Linebacker', 'Defensive Back'] },
  { name: 'Soccer', positions: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'] },
  { name: 'Volleyball', positions: ['Outside Hitter', 'Middle Blocker', 'Setter', 'Libero'] },
  { name: 'Track and Field', positions: ['Sprinter', 'Distance Runner', 'Jumper', 'Thrower'] },
  { name: 'Softball', positions: ['Pitcher', 'Catcher', 'Infielder', 'Outfielder'] },
  { name: 'Baseball', positions: ['Pitcher', 'Catcher', 'Infielder', 'Outfielder'] }
];

const SCHOOLS = [
  { name: 'Kentucky State University', state: 'KY', level: 'college', city: 'Lexington' },
  { name: 'Central High School', state: 'KY', level: 'high_school', city: 'Louisville' },
  { name: 'UCLA', state: 'CA', level: 'college', city: 'Los Angeles' },
  { name: 'Long Beach Polytechnic', state: 'CA', level: 'high_school', city: 'Long Beach' },
  { name: 'University of Texas', state: 'TX', level: 'college', city: 'Austin' },
  { name: 'Allen High School', state: 'TX', level: 'high_school', city: 'Allen' },
  { name: 'University of Florida', state: 'FL', level: 'college', city: 'Gainesville' },
  { name: 'IMG Academy', state: 'FL', level: 'high_school', city: 'Bradenton' },
  { name: 'NYU', state: 'NY', level: 'college', city: 'New York' },
  { name: 'Brooklyn Tech', state: 'NY', level: 'high_school', city: 'Brooklyn' }
];

const INTERESTS = [
  'Fashion', 'Technology', 'Music', 'Gaming', 'Fitness', 'Food & Beverage',
  'Travel', 'Photography', 'Art', 'Social Justice', 'Environment', 'Education',
  'Health & Wellness', 'Business', 'Entertainment', 'Sports Media'
];

const CONTENT_CATEGORIES = [
  'Sports Content', 'Lifestyle', 'Fashion & Style', 'Health & Fitness',
  'Gaming', 'Music', 'Food & Dining', 'Technology', 'Travel', 'Education'
];

const BRAND_VALUES = [
  'Authenticity', 'Excellence', 'Community', 'Innovation', 'Integrity',
  'Empowerment', 'Diversity', 'Leadership', 'Teamwork', 'Resilience'
];

// Generate random number in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Pick random item from array
function pickRandom<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

// Pick multiple random items from array
function pickMultipleRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

// Generate username from name
function generateUsername(firstName: string, lastName: string, sport: string): string {
  const rand = randomInt(10, 99);
  return `${firstName.toLowerCase()}${lastName.substring(0, 3).toLowerCase()}${rand}`;
}

// Generate graduation year (high school: 2025-2028, college: 2025-2027)
function generateGradYear(schoolLevel: string): number {
  return schoolLevel === 'high_school'
    ? randomInt(2025, 2028)
    : randomInt(2025, 2027);
}

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedAthletes() {
  console.log('\n📊 Seeding Athletes...');

  const athletes: any[] = [];

  for (let i = 0; i < 30; i++) {
    const gender = i % 2 === 0 ? 'male' : 'female';
    const firstName = pickRandom(FIRST_NAMES[gender]);
    const lastName = pickRandom(LAST_NAMES);
    const sport = pickRandom(SPORTS);
    const school = pickRandom(SCHOOLS);
    const gradYear = generateGradYear(school.level);
    const username = generateUsername(firstName, lastName, sport.name);

    const athlete = {
      email: `${username}@example.com`,
      role: 'athlete',
      first_name: firstName,
      last_name: lastName,
      username: username,
      date_of_birth: new Date(
        school.level === 'high_school'
          ? 2006 + (gradYear - 2025)  // High school: ~15-18 years old
          : 2003 + (gradYear - 2025)  // College: ~18-22 years old
      ).toISOString().split('T')[0],
      phone: `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`,
      school_name: school.name,
      school_level: school.level,
      graduation_year: gradYear,
      primary_sport: sport.name,
      position: pickRandom(sport.positions),
      jersey_number: randomInt(0, 99),
      secondary_sports: pickMultipleRandom(
        SPORTS.filter(s => s.name !== sport.name).map(s => s.name),
        randomInt(0, 2)
      ),
      gpa: parseFloat((Math.random() * 1.5 + 2.5).toFixed(2)), // 2.5 - 4.0
      hobbies: pickMultipleRandom(INTERESTS, randomInt(2, 4)),
      lifestyle_interests: pickMultipleRandom(INTERESTS, randomInt(2, 4)),
      content_creation_interests: pickMultipleRandom(CONTENT_CATEGORIES, randomInt(2, 4)),
      brand_affinity: pickMultipleRandom(BRAND_VALUES, randomInt(2, 4)),
      causes_care_about: pickMultipleRandom(['Social Justice', 'Environment', 'Education', 'Health & Wellness', 'Community'], randomInt(1, 3)),
      bio: `${sport.name} ${pickRandom(sport.positions)} at ${school.name}. Class of ${gradYear}. Passionate about ${pickMultipleRandom(INTERESTS, 2).join(' and ')}.`,
      profile_completion_score: randomInt(70, 100),
      onboarding_completed: true,
      created_at: new Date(Date.now() - randomInt(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      // Store city/state for athlete_public_profiles (not in users table)
      __city: school.city,
      __state: school.state
    };

    athletes.push(athlete);
  }

  // Remove temporary fields before inserting
  const athletesToInsert = athletes.map(({ __city, __state, ...athlete }) => athlete);

  const { data, error } = await supabase
    .from('users')
    .upsert(athletesToInsert, { onConflict: 'email', ignoreDuplicates: false })
    .select('id, email, first_name, last_name, school_name, primary_sport, position, school_level, graduation_year, bio, lifestyle_interests, content_creation_interests, brand_affinity');

  if (error) {
    console.error('❌ Error seeding athletes:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} athletes`);
  // Merge returned IDs with original athlete data (including __city and __state)
  const athletesWithIds = data.map((athleteData, index) => ({
    ...athletes[index],
    id: athleteData.id
  }));
  return athletesWithIds;
}

async function seedSocialMediaStats(athletes: any[]) {
  console.log('\n📱 Seeding Social Media Stats...');

  const platforms = ['instagram', 'tiktok', 'twitter', 'youtube', 'facebook'];
  const socialStats: any[] = [];

  for (const athlete of athletes) {
    // Each athlete has 2-4 platforms
    const athletePlatforms = pickMultipleRandom(platforms, randomInt(2, 4));

    for (const platform of athletePlatforms) {
      let followers: number;
      let engagementRate: number;

      // Realistic follower distribution
      const tier = Math.random();
      if (tier < 0.4) {
        // 40% - Micro influencers (1K - 10K)
        followers = randomInt(1000, 10000);
        engagementRate = randomInt(4, 10); // Higher engagement for smaller accounts
      } else if (tier < 0.75) {
        // 35% - Mid-tier (10K - 50K)
        followers = randomInt(10000, 50000);
        engagementRate = randomInt(3, 7);
      } else if (tier < 0.92) {
        // 17% - Larger (50K - 200K)
        followers = randomInt(50000, 200000);
        engagementRate = randomInt(2, 5);
      } else {
        // 8% - Major (200K - 1M)
        followers = randomInt(200000, 1000000);
        engagementRate = randomInt(1, 4);
      }

      socialStats.push({
        user_id: athlete.id,
        platform: platform,
        handle: `@${athlete.username || athlete.email.split('@')[0]}`,
        followers: followers,
        engagement_rate: engagementRate / 100, // Convert to decimal
        verified: Math.random() < (followers > 100000 ? 0.3 : 0.05), // 30% verified if >100K followers
        last_updated: new Date().toISOString()
      });
    }
  }

  const { data, error } = await supabase
    .from('social_media_stats')
    .upsert(socialStats, { onConflict: 'user_id,platform' })
    .select();

  if (error) {
    console.error('❌ Error seeding social media stats:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} social media stats`);
  return data;
}

async function seedAthletePublicProfiles(athletes: any[], socialStats: any[]) {
  console.log('\n🎯 Seeding Athlete Public Profiles...');

  const profiles: any[] = [];

  for (const athlete of athletes) {
    // Get athlete's social stats
    const athleteSocial = socialStats.filter(s => s.user_id === athlete.id);
    const totalFollowers = athleteSocial.reduce((sum, s) => sum + s.followers, 0);
    const avgEngagement = athleteSocial.reduce((sum, s) => sum + s.engagement_rate, 0) / (athleteSocial.length || 1);

    // Calculate estimated FMV based on followers (in cents)
    let fmvMin: number, fmvMax: number;
    if (totalFollowers < 5000) { fmvMin = 50000; fmvMax = 150000; } // $500-$1500
    else if (totalFollowers < 25000) { fmvMin = 150000; fmvMax = 500000; } // $1500-$5000
    else if (totalFollowers < 100000) { fmvMin = 500000; fmvMax = 1500000; } // $5000-$15000
    else if (totalFollowers < 500000) { fmvMin = 1500000; fmvMax = 5000000; } // $15000-$50000
    else { fmvMin = 5000000; fmvMax = 20000000; } // $50000-$200000

    profiles.push({
      user_id: athlete.id,
      display_name: `${athlete.first_name} ${athlete.last_name}`,
      bio: athlete.bio,
      sport: athlete.primary_sport,
      position: athlete.position,
      school_name: athlete.school_name,
      school_level: athlete.school_level,
      graduation_year: athlete.graduation_year,
      state: athlete.__state, // From temporary field
      city: athlete.__city,   // From temporary field
      instagram_followers: athleteSocial.find(s => s.platform === 'instagram')?.followers || 0,
      instagram_engagement_rate: athleteSocial.find(s => s.platform === 'instagram')?.engagement_rate * 100 || 0,
      tiktok_followers: athleteSocial.find(s => s.platform === 'tiktok')?.followers || 0,
      tiktok_engagement_rate: athleteSocial.find(s => s.platform === 'tiktok')?.engagement_rate * 100 || 0,
      twitter_followers: athleteSocial.find(s => s.platform === 'twitter')?.followers || 0,
      youtube_subscribers: athleteSocial.find(s => s.platform === 'youtube')?.followers || 0,
      estimated_fmv_min: fmvMin,
      estimated_fmv_max: fmvMax,
      avg_engagement_rate: avgEngagement * 100, // Convert to percentage
      content_categories: athlete.content_creation_interests || [],
      brand_values: athlete.brand_affinity || [],
      is_available_for_partnerships: Math.random() > 0.2, // 80% available
      preferred_partnership_types: pickMultipleRandom(
        ['sponsored_post', 'brand_ambassador', 'event_appearance', 'product_review', 'social_media_campaign'],
        randomInt(2, 4)
      ),
      response_rate: randomInt(60, 100),
      avg_response_time_hours: randomInt(2, 48),
      is_verified: totalFollowers > 50000 && Math.random() > 0.7, // 30% of large accounts verified
      created_at: athlete.created_at,
      updated_at: new Date().toISOString(),
      last_active_at: new Date(Date.now() - randomInt(0, 7) * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const { data, error } = await supabase
    .from('athlete_public_profiles')
    .upsert(profiles, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.error('❌ Error seeding athlete public profiles:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} athlete public profiles`);
  return data;
}

async function seedAgencies() {
  console.log('\n🏢 Seeding Agencies...');

  const agencies = [
    {
      email: 'contact@athletex.com',
      role: 'agency',
      first_name: 'AthleteX',
      last_name: 'Marketing',
      bio: 'Leading sports marketing agency specializing in NIL deals for college and high school athletes.',
      phone: '+12125551001'
    },
    {
      email: 'hello@nilpros.com',
      role: 'agency',
      first_name: 'NIL',
      last_name: 'Pros',
      bio: 'Connecting brands with student athletes for authentic partnerships.',
      phone: '+13105552002'
    },
    {
      email: 'team@sportsbrand.co',
      role: 'agency',
      first_name: 'SportsBrand',
      last_name: 'Collective',
      bio: 'Building powerful brand collaborations in the NIL space.',
      phone: '+15125553003'
    }
  ];

  const { data, error } = await supabase
    .from('users')
    .upsert(agencies, { onConflict: 'email' })
    .select();

  if (error) {
    console.error('❌ Error seeding agencies:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} agencies`);
  return data;
}

async function seedAgencyCampaigns(agencies: any[]) {
  console.log('\n📢 Seeding Agency Campaigns...');

  const campaigns: any[] = [];

  const campaignTemplates = [
    { name: 'Summer Sports Drink Campaign', category: 'Food & Beverage', budget: 50000 },
    { name: 'Back to School Fashion', category: 'Fashion & Style', budget: 35000 },
    { name: 'Gaming Gear Launch', category: 'Gaming', budget: 25000 },
    { name: 'Local Restaurant Partnerships', category: 'Food & Dining', budget: 15000 },
    { name: 'Fitness App Promotion', category: 'Health & Fitness', budget: 40000 },
    { name: 'Tech Accessories Brand', category: 'Technology', budget: 30000 },
    { name: 'Holiday Gift Guide', category: 'Lifestyle', budget: 45000 },
    { name: 'Spring Training Sponsor', category: 'Sports Content', budget: 60000 },
    { name: 'Student Housing Campaign', category: 'Lifestyle', budget: 20000 },
    { name: 'Music Festival Promotion', category: 'Music', budget: 35000 }
  ];

  for (let i = 0; i < 10; i++) {
    const template = campaignTemplates[i];
    const agency = pickRandom(agencies);
    const status = i < 5 ? 'active' : (i < 8 ? 'draft' : 'completed');
    const athleteCount = randomInt(3, 8);

    campaigns.push({
      agency_id: agency.id,
      campaign_name: template.name,
      description: `Looking for ${athleteCount} athletes to promote ${template.name.toLowerCase()}. Must align with our brand values and have engaged audience.`,
      campaign_type: pickRandom(['sponsored_content', 'brand_ambassador', 'event_appearance', 'product_review']),
      status: status,
      total_budget: template.budget,
      budget_per_athlete: Math.floor(template.budget / athleteCount),
      target_athlete_count: athleteCount,
      start_date: status === 'active'
        ? new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + randomInt(1, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + randomInt(60, 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      target_sports: pickMultipleRandom(SPORTS.map(s => s.name), randomInt(2, 4)),
      target_states: pickMultipleRandom(['KY', 'CA', 'TX', 'FL', 'NY'], randomInt(2, 5)),
      target_school_levels: pickMultipleRandom(['high_school', 'college'], randomInt(1, 2)),
      content_categories: [template.category],
      deliverables: {
        posts: randomInt(2, 6),
        stories: randomInt(3, 10),
        reels: randomInt(1, 3)
      },
      created_at: new Date(Date.now() - randomInt(7, 90) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabase
    .from('agency_campaigns')
    .upsert(campaigns)
    .select();

  if (error) {
    console.error('❌ Error seeding agency campaigns:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} agency campaigns`);
  return data;
}

async function seedNILDeals(athletes: any[], agencies: any[], campaigns: any[]) {
  console.log('\n💰 Seeding NIL Deals...');

  const deals: any[] = [];
  const statuses: Array<'draft' | 'pending' | 'active' | 'completed' | 'cancelled'> =
    ['draft', 'draft', 'draft', 'pending', 'pending', 'pending', 'pending', 'pending',
     'active', 'active', 'active', 'active', 'active', 'active', 'active', 'active',
     'completed', 'completed', 'completed', 'completed'];

  for (let i = 0; i < 20; i++) {
    const athlete = pickRandom(athletes);
    const agency = pickRandom(agencies);
    const campaign = pickRandom(campaigns.filter(c => c.agency_id === agency.id)) || pickRandom(campaigns);
    const status = statuses[i];
    const value = randomInt(500, 10000);

    deals.push({
      athlete_id: athlete.id,
      brand_name: campaign?.campaign_name.split(' ')[0] || 'Brand',
      brand_contact_id: agency.id,
      deal_type: pickRandom(['sponsored_content', 'brand_ambassador', 'event_appearance', 'product_review', 'social_media_post']),
      deal_status: status,
      deal_value: value,
      payment_status: status === 'completed' ? 'paid' : (status === 'active' ? 'pending' : 'unpaid'),
      start_date: status === 'active' || status === 'completed'
        ? new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date(Date.now() + randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + randomInt(30, 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      deliverables: {
        social_posts: randomInt(2, 8),
        stories: randomInt(4, 12),
        appearances: randomInt(0, 2)
      },
      payment_schedule: {
        upfront: value * 0.5,
        on_completion: value * 0.5
      },
      content_categories: campaign?.content_categories || [pickRandom(CONTENT_CATEGORIES)],
      requires_school_approval: athlete.school_level === 'high_school' && ['KY', 'FL'].includes(athlete.state),
      school_approved: Math.random() > 0.3,
      requires_parent_approval: athlete.school_level === 'high_school',
      parent_approved: Math.random() > 0.2,
      created_at: new Date(Date.now() - randomInt(1, 180) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabase
    .from('nil_deals')
    .upsert(deals)
    .select();

  if (error) {
    console.error('❌ Error seeding NIL deals:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} NIL deals`);
  return data;
}

async function seedAgencyAthleteMatches(athletes: any[], agencies: any[], campaigns: any[]) {
  console.log('\n🤝 Seeding Agency-Athlete Matches...');

  const matches: any[] = [];

  // Generate 100 matches
  for (let i = 0; i < 100; i++) {
    const athlete = pickRandom(athletes);
    const agency = pickRandom(agencies);
    const campaign = pickRandom(campaigns.filter(c => c.agency_id === agency.id)) || null;

    // Generate realistic match scores (weighted toward good matches)
    const rand = Math.random();
    let baseScore: number;
    if (rand < 0.2) baseScore = randomInt(20, 50); // 20% poor matches
    else if (rand < 0.5) baseScore = randomInt(50, 70); // 30% average matches
    else if (rand < 0.85) baseScore = randomInt(70, 85); // 35% good matches
    else baseScore = randomInt(85, 95); // 15% excellent matches

    // Score breakdown (must sum to 100)
    const brandValues = randomInt(15, 20);
    const interests = randomInt(15, 20);
    const campaignFit = randomInt(10, 15);
    const budget = randomInt(10, 15);
    const geography = randomInt(8, 12);
    const demographics = randomInt(8, 12);
    const engagement = randomInt(8, 12);
    const content = 100 - (brandValues + interests + campaignFit + budget + geography + demographics + engagement);

    const totalScore = Math.floor(
      (brandValues * 0.2 + interests * 0.2 + campaignFit * 0.15 +
       budget * 0.15 + geography * 0.1 + demographics * 0.1 +
       engagement * 0.1 + content * 0.1)
    );

    // Determine match status based on score
    let matchStatus: string;
    if (totalScore >= 80) matchStatus = pickRandom(['saved', 'contacted', 'interested']);
    else if (totalScore >= 65) matchStatus = pickRandom(['suggested', 'saved']);
    else matchStatus = 'suggested';

    // 10% of high-scoring matches become partnerships
    if (totalScore >= 85 && Math.random() < 0.1) {
      matchStatus = 'partnered';
    }

    matches.push({
      agency_id: agency.id,
      athlete_id: athlete.id,
      campaign_id: campaign?.id || null,
      match_score: totalScore,
      score_breakdown: {
        brand_values: brandValues,
        interests: interests,
        campaign_fit: campaignFit,
        budget: budget,
        geography: geography,
        demographics: demographics,
        engagement: engagement,
        content: content
      },
      match_status: matchStatus,
      match_reason: `Strong alignment on ${totalScore >= 80 ? 'brand values, interests, and campaign objectives' : totalScore >= 60 ? 'key demographics and content style' : 'geographic location and basic criteria'}.`,
      match_highlights: pickMultipleRandom([
        'Aligned brand values',
        'Engaged audience',
        'Right demographics',
        'Strong content fit',
        'Geographic match',
        'Budget compatible',
        'High engagement rate',
        'Verified accounts'
      ], randomInt(2, 4)),
      athlete_snapshot: {
        name: `${athlete.first_name} ${athlete.last_name}`,
        sport: athlete.primary_sport,
        school: athlete.school_name
      },
      created_at: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabase
    .from('agency_athlete_matches')
    .upsert(matches)
    .select();

  if (error) {
    console.error('❌ Error seeding agency-athlete matches:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} agency-athlete matches`);
  return data;
}

async function seedNotifications(athletes: any[], agencies: any[]) {
  console.log('\n🔔 Seeding Notifications...');

  const notifications: any[] = [];
  const allUsers = [...athletes, ...agencies];

  const notificationTemplates = [
    { type: 'deal_update', title: 'Deal Status Updated', message: 'Your NIL deal with {brand} has been updated to {status}', priority: 'medium' },
    { type: 'opportunity', title: 'New Opportunity Match', message: 'You have a new opportunity matching your profile with a score of {score}', priority: 'high' },
    { type: 'compliance', title: 'Compliance Review Required', message: 'Please review and approve the pending NIL deal', priority: 'high' },
    { type: 'message', title: 'New Message', message: 'You have a new message from {sender}', priority: 'medium' },
    { type: 'system', title: 'Profile Completed', message: 'Congratulations! Your profile is now 100% complete', priority: 'low' },
    { type: 'deal_update', title: 'Payment Received', message: 'Payment of ${amount} has been processed for your deal with {brand}', priority: 'high' },
    { type: 'opportunity', title: 'Campaign Invitation', message: 'You\'ve been invited to join the {campaign} campaign', priority: 'medium' },
    { type: 'system', title: 'New Badge Earned', message: 'You earned the "{badge}" badge!', priority: 'low' }
  ];

  // 50 notifications per user
  for (const user of allUsers) {
    for (let i = 0; i < 50; i++) {
      const template = pickRandom(notificationTemplates);
      const isRead = Math.random() < 0.4; // 40% read

      let message = template.message;
      message = message.replace('{brand}', pickRandom(['Nike', 'Adidas', 'Gatorade', 'Chipotle', 'EA Sports']));
      message = message.replace('{status}', pickRandom(['active', 'pending approval', 'completed']));
      message = message.replace('{score}', randomInt(75, 95).toString());
      message = message.replace('{sender}', pickRandom(agencies).first_name);
      message = message.replace('{amount}', randomInt(500, 5000).toString());
      message = message.replace('{campaign}', pickRandom(['Summer Sports', 'Back to School', 'Holiday Campaign']));
      message = message.replace('{badge}', pickRandom(['Rising Star', 'Deal Closer', 'Content Creator']));

      notifications.push({
        user_id: user.id,
        type: template.type,
        title: template.title,
        message: message,
        priority: template.priority,
        read: isRead,
        read_at: isRead ? new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString() : null,
        created_at: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  const { data, error } = await supabase
    .from('notifications')
    .upsert(notifications)
    .select();

  if (error) {
    console.error('❌ Error seeding notifications:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} notifications`);
  return data;
}

async function seedEvents(athletes: any[]) {
  console.log('\n📅 Seeding Events...');

  const events: any[] = [];

  const eventTemplates = [
    { type: 'workshop', title: 'NIL Education Workshop', location: 'Virtual', duration: 2 },
    { type: 'networking', title: 'Athlete Networking Event', location: 'Local Sports Complex', duration: 3 },
    { type: 'consultation', title: 'Brand Partnership Consultation', location: 'Virtual', duration: 1 },
    { type: 'deadline', title: 'Deal Contract Deadline', location: null, duration: 0 },
    { type: 'meeting', title: 'Brand Meeting', location: 'Virtual', duration: 1 },
    { type: 'workshop', title: 'Social Media Strategy Workshop', location: 'University Campus', duration: 2 },
    { type: 'deadline', title: 'Content Submission Due', location: null, duration: 0 },
    { type: 'networking', title: 'Agency Meet & Greet', location: 'Downtown Conference Center', duration: 2 }
  ];

  // 10 events per athlete
  for (const athlete of athletes) {
    for (let i = 0; i < 10; i++) {
      const template = pickRandom(eventTemplates);
      const daysFromNow = randomInt(-30, 60); // Past 30 days to future 60 days
      const startDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + template.duration * 60 * 60 * 1000);

      events.push({
        user_id: athlete.id,
        title: template.title,
        description: `${template.title} - Important event for your NIL journey`,
        event_type: template.type,
        start_time: startDate.toISOString(),
        end_time: template.duration > 0 ? endDate.toISOString() : null,
        location: template.location,
        url: template.location === 'Virtual' ? 'https://zoom.us/j/example' : null,
        reminder_sent: daysFromNow < 0 || Math.random() < 0.5,
        created_at: new Date(Date.now() - randomInt(7, 60) * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  const { data, error } = await supabase
    .from('events')
    .upsert(events)
    .select();

  if (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} events`);
  return data;
}

async function seedQuizProgress(athletes: any[]) {
  console.log('\n📝 Seeding Quiz Progress...');

  const quizProgress: any[] = [];

  for (const athlete of athletes) {
    const quizzesCompleted = randomInt(0, 15);
    const totalScore = quizzesCompleted * randomInt(60, 100);

    quizProgress.push({
      user_id: athlete.id,
      quizzes_completed: quizzesCompleted,
      total_score: totalScore,
      average_score: quizzesCompleted > 0 ? Math.floor(totalScore / quizzesCompleted) : 0,
      badges_earned: Math.floor(quizzesCompleted / 5), // Badge every 5 quizzes
      current_streak: randomInt(0, 7),
      longest_streak: randomInt(0, 14),
      last_quiz_date: quizzesCompleted > 0
        ? new Date(Date.now() - randomInt(0, 14) * 24 * 60 * 60 * 1000).toISOString()
        : null,
      created_at: athlete.created_at,
      updated_at: new Date().toISOString()
    });
  }

  const { data, error } = await supabase
    .from('quiz_progress')
    .upsert(quizProgress, { onConflict: 'user_id' })
    .select();

  if (error) {
    console.error('❌ Error seeding quiz progress:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} quiz progress entries`);
  return data;
}

async function seedBadges() {
  console.log('\n🏆 Seeding Badges...');

  const badges = [
    { name: 'First Steps', description: 'Complete your profile', category: 'profile', rarity: 'common', points: 10, icon_url: '/badges/first-steps.svg' },
    { name: 'Deal Maker', description: 'Complete your first NIL deal', category: 'deals', rarity: 'uncommon', points: 25, icon_url: '/badges/deal-maker.svg' },
    { name: 'Social Butterfly', description: 'Connect 3 social media accounts', category: 'social', rarity: 'common', points: 15, icon_url: '/badges/social-butterfly.svg' },
    { name: 'Knowledge Seeker', description: 'Complete 5 NIL education quizzes', category: 'education', rarity: 'uncommon', points: 30, icon_url: '/badges/knowledge-seeker.svg' },
    { name: 'Rising Star', description: 'Reach 10K total followers', category: 'social', rarity: 'rare', points: 50, icon_url: '/badges/rising-star.svg' },
    { name: 'Deal Closer', description: 'Complete 5 NIL deals', category: 'deals', rarity: 'rare', points: 75, icon_url: '/badges/deal-closer.svg' },
    { name: 'Brand Ambassador', description: 'Maintain a brand partnership for 6 months', category: 'deals', rarity: 'epic', points: 100, icon_url: '/badges/brand-ambassador.svg' },
    { name: 'Influencer Elite', description: 'Reach 100K total followers', category: 'social', rarity: 'epic', points: 150, icon_url: '/badges/influencer-elite.svg' },
    { name: 'NIL Master', description: 'Complete 20 deals and earn $50K+', category: 'deals', rarity: 'legendary', points: 250, icon_url: '/badges/nil-master.svg' },
    { name: 'Trendsetter', description: 'Be featured in platform highlights 5 times', category: 'achievement', rarity: 'legendary', points: 300, icon_url: '/badges/trendsetter.svg' }
  ];

  const { data, error } = await supabase
    .from('badges')
    .upsert(badges, { onConflict: 'name' })
    .select();

  if (error) {
    console.error('❌ Error seeding badges:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} badges`);
  return data;
}

async function seedUserBadges(athletes: any[], badges: any[]) {
  console.log('\n🎖️ Seeding User Badges...');

  const userBadges: any[] = [];

  for (const athlete of athletes) {
    // Each athlete earns 0-5 badges
    const earnedCount = randomInt(0, 5);
    const earnedBadges = pickMultipleRandom(badges, earnedCount);

    earnedBadges.forEach((badge, index) => {
      userBadges.push({
        user_id: athlete.id,
        badge_id: badge.id,
        earned_at: new Date(Date.now() - randomInt(1, 180) * 24 * 60 * 60 * 1000).toISOString(),
        is_displayed: index < 3, // Display first 3
        display_order: index + 1,
        progress: 100
      });
    });
  }

  if (userBadges.length === 0) {
    console.log('⚠️  No user badges to seed (athletes earned 0 badges)');
    return [];
  }

  const { data, error } = await supabase
    .from('user_badges')
    .upsert(userBadges)
    .select();

  if (error) {
    console.error('❌ Error seeding user badges:', error);
    throw error;
  }

  console.log(`✅ Seeded ${data.length} user badges`);
  return data;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting Comprehensive Platform Seeding...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Seed in dependency order
    const athletes = await seedAthletes();
    const agencies = await seedAgencies();
    const socialStats = await seedSocialMediaStats(athletes);
    const profiles = await seedAthletePublicProfiles(athletes, socialStats);
    const campaigns = await seedAgencyCampaigns(agencies);
    const deals = await seedNILDeals(athletes, agencies, campaigns);
    const matches = await seedAgencyAthleteMatches(athletes, agencies, campaigns);
    const notifications = await seedNotifications(athletes, agencies);
    const events = await seedEvents(athletes);
    const quizProgress = await seedQuizProgress(athletes);
    const badges = await seedBadges();
    const userBadges = await seedUserBadges(athletes, badges);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ SEEDING COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   Athletes: ${athletes.length}`);
    console.log(`   Agencies: ${agencies.length}`);
    console.log(`   Social Media Stats: ${socialStats.length}`);
    console.log(`   Public Profiles: ${profiles.length}`);
    console.log(`   Campaigns: ${campaigns.length}`);
    console.log(`   NIL Deals: ${deals.length}`);
    console.log(`   Matches: ${matches.length}`);
    console.log(`   Notifications: ${notifications.length}`);
    console.log(`   Events: ${events.length}`);
    console.log(`   Quiz Progress: ${quizProgress.length}`);
    console.log(`   Badges: ${badges.length}`);
    console.log(`   User Badges: ${userBadges.length}`);
    console.log('\n🎉 Platform is now ready for testing!');
    console.log('\n📝 Test Accounts:');
    console.log('   Athlete: ' + athletes[0].email + ' (password: set via Supabase Auth)');
    console.log('   Agency: ' + agencies[0].email + ' (password: set via Supabase Auth)');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
