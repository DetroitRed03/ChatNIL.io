import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [key, ...valueParts] = trimmed.split('=');
  env[key] = valueParts.join('=');
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedAgencyDashboardData() {
  console.log('🌱 Seeding Agency Dashboard Test Data\n');
  console.log('🎯 Target:', env.NEXT_PUBLIC_SUPABASE_URL, '\n');

  try {
    // Step 1: Create test agency user
    console.log('📋 Step 1: Creating test agency user...');

    const testEmail = 'agency-test@chatnil.io';

    // Create auth user for agency
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'TestAgency123!',
      email_confirm: true,
      user_metadata: {
        role: 'agency',
        first_name: 'Test',
        last_name: 'Agency'
      }
    });

    if (authError && authError.code !== 'email_exists' && !authError.message.includes('already registered')) {
      console.error('❌ Error creating agency user:', authError);
      process.exit(1);
    }

    let agencyUserId = authUser?.user?.id;

    // If user already exists, find them
    if (!agencyUserId) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const existingUser = users?.users?.find(u => u.email === testEmail);
      agencyUserId = existingUser?.id;
    }

    if (!agencyUserId) {
      console.error('❌ Could not get agency user ID');
      process.exit(1);
    }

    console.log(`✅ Agency user created/found: ${agencyUserId}\n`);

    // Step 2: Create agency profile
    console.log('📋 Step 2: Creating agency profile...');

    let agencyId = agencyUserId;

    // Try to select existing agency first
    const { data: existingAgency, error: selectError } = await supabase
      .from('agencies')
      .select('id, company_name')
      .eq('id', agencyUserId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine
      console.warn(`⚠️  Note: ${selectError.message}`);
    }

    if (!existingAgency) {
      const { error: agencyError } = await supabase
        .from('agencies')
        .insert({
          id: agencyUserId,
          company_name: 'Elite Sports Marketing',
          agency_type: 'full_service',
          description: 'Premier NIL representation agency',
          website: 'https://elitesportsmarketing.com',
          contact_email: testEmail,
          contact_phone: '555-0123',
          verified: true,
          tier: 'premium'
        });

      if (agencyError) {
        // Check if it's just a duplicate key error
        if (agencyError.code === '23505') {
          console.log('✅ Agency profile already exists\n');
        } else {
          console.error('❌ Error creating agency:', agencyError);
          process.exit(1);
        }
      } else {
        console.log('✅ Created agency profile\n');
      }
    } else {
      console.log(`✅ Using existing agency: ${existingAgency.company_name}\n`);
    }

    // Step 3: Create test athlete users and profiles
    console.log('📋 Step 3: Creating test athlete users...');

    const athleteData = [
      { email: 'athlete1@test.com', first_name: 'Sarah', last_name: 'Johnson', sport: 'Basketball', school: 'UCLA', position: 'Guard' },
      { email: 'athlete2@test.com', first_name: 'Mike', last_name: 'Williams', sport: 'Football', school: 'USC', position: 'Quarterback' },
      { email: 'athlete3@test.com', first_name: 'Emily', last_name: 'Chen', sport: 'Soccer', school: 'Stanford', position: 'Forward' },
      { email: 'athlete4@test.com', first_name: 'James', last_name: 'Davis', sport: 'Basketball', school: 'Duke', position: 'Forward' },
      { email: 'athlete5@test.com', first_name: 'Maria', last_name: 'Garcia', sport: 'Volleyball', school: 'Texas', position: 'Outside Hitter' }
    ];

    const athleteIds = [];

    for (const athlete of athleteData) {
      // Create auth user
      const { data: athleteAuthUser } = await supabase.auth.admin.createUser({
        email: athlete.email,
        password: 'TestAthlete123!',
        email_confirm: true,
        user_metadata: {
          role: 'athlete',
          first_name: athlete.first_name,
          last_name: athlete.last_name
        }
      });

      let athleteId = athleteAuthUser?.user?.id;

      // If user already exists, find them
      if (!athleteId) {
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === athlete.email);
        athleteId = existingUser?.id;
      }

      if (!athleteId) continue;

      athleteIds.push(athleteId);

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('athlete_profiles')
        .select('user_id')
        .eq('user_id', athleteId)
        .single();

      if (!existingProfile) {
        // Create athlete profile
        await supabase.from('athlete_profiles').insert({
          user_id: athleteId,
          sport: athlete.sport,
          school: athlete.school,
          position: athlete.position,
          year: 'Junior',
          eligibility_status: 'eligible',
          verified: true
        });
      }
    }

    console.log(`✅ Created/found ${athleteIds.length} athletes\n`);

    const athletes = athleteIds.map((id, i) => ({
      user_id: id,
      sport: athleteData[i].sport,
      school: athleteData[i].school
    }));

    // Step 4: Create test campaigns
    console.log('📋 Step 4: Creating test campaigns...');

    const campaignData = [
      {
        agency_id: agencyId,
        name: 'Spring Football Campaign 2024',
        description: 'Multi-athlete social media push for spring football season',
        status: 'active',
        campaign_type: 'social_media',
        start_date: '2024-03-01',
        end_date: '2024-05-31',
        total_budget: 50000,
        spent_budget: 28000,
        target_demographics: { age: '18-24', interests: ['sports', 'fitness'] },
        kpis: { min_impressions: 500000, min_engagement_rate: 3.5 },
        total_impressions: 425000,
        total_engagement: 18900,
        avg_engagement_rate: 4.45,
        roi_percentage: 180
      },
      {
        agency_id: agencyId,
        name: 'Basketball Elite Series',
        description: 'Premium basketball athlete partnerships',
        status: 'active',
        campaign_type: 'endorsement',
        start_date: '2024-02-15',
        end_date: '2024-06-15',
        total_budget: 75000,
        spent_budget: 52000,
        target_demographics: { age: '18-35', interests: ['basketball', 'sneakers'] },
        kpis: { min_impressions: 750000, min_engagement_rate: 4.0 },
        total_impressions: 680000,
        total_engagement: 30600,
        avg_engagement_rate: 4.5,
        roi_percentage: 210
      },
      {
        agency_id: agencyId,
        name: 'Summer Training Camp Promo',
        description: 'Cross-sport summer training camp promotion',
        status: 'pending',
        campaign_type: 'event',
        start_date: '2024-06-01',
        end_date: '2024-08-31',
        total_budget: 30000,
        spent_budget: 0,
        target_demographics: { age: '16-22', interests: ['sports', 'training'] },
        kpis: { min_impressions: 200000, min_engagement_rate: 3.0 },
        total_impressions: 0,
        total_engagement: 0,
        avg_engagement_rate: 0,
        roi_percentage: 0
      },
      {
        agency_id: agencyId,
        name: 'Winter Sports Apparel Launch',
        description: 'New apparel line launch with winter sports athletes',
        status: 'completed',
        campaign_type: 'product_launch',
        start_date: '2023-11-01',
        end_date: '2024-01-31',
        total_budget: 45000,
        spent_budget: 45000,
        target_demographics: { age: '18-30', interests: ['fashion', 'winter sports'] },
        kpis: { min_impressions: 400000, min_engagement_rate: 3.8 },
        total_impressions: 520000,
        total_engagement: 22880,
        avg_engagement_rate: 4.4,
        roi_percentage: 195
      }
    ];

    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select();

    if (campaignError) {
      console.error('❌ Error creating campaigns:', campaignError);
      process.exit(1);
    }

    console.log(`✅ Created ${campaigns.length} campaigns\n`);

    // Step 5: Assign athletes to campaigns
    console.log('📋 Step 5: Assigning athletes to campaigns...');

    const campaignAthletes = [];

    // Assign 2-3 athletes to each active campaign
    for (const campaign of campaigns) {
      if (campaign.status !== 'active') continue;

      const numAthletes = Math.min(3, athletes.length);
      for (let i = 0; i < numAthletes; i++) {
        const athlete = athletes[i];
        campaignAthletes.push({
          campaign_id: campaign.id,
          athlete_id: athlete.user_id,
          status: 'active',
          contract_value: Math.floor(Math.random() * 10000) + 5000,
          performance_bonus: Math.floor(Math.random() * 5000) + 1000,
          deliverables: {
            posts: 10,
            stories: 20,
            videos: 3
          },
          impressions: Math.floor(Math.random() * 100000) + 50000,
          engagement: Math.floor(Math.random() * 5000) + 2000,
          engagement_rate: (Math.random() * 3 + 2).toFixed(2), // 2-5%
          clicks: Math.floor(Math.random() * 2000) + 500,
          conversions: Math.floor(Math.random() * 100) + 20
        });
      }
    }

    const { error: athleteError } = await supabase
      .from('campaign_athletes')
      .insert(campaignAthletes);

    if (athleteError) {
      console.error('❌ Error assigning athletes:', athleteError);
      process.exit(1);
    }

    console.log(`✅ Assigned ${campaignAthletes.length} athlete-campaign relationships\n`);

    // Step 6: Create budget allocation
    console.log('📋 Step 6: Creating budget allocation...');

    const { error: budgetError } = await supabase
      .from('agency_budget_allocations')
      .insert({
        agency_id: agencyId,
        period_start: '2024-01-01',
        period_end: '2024-12-31',
        total_budget: 250000,
        allocated_budget: 200000,
        spent_budget: 125000,
        categories: {
          social_media: 80000,
          endorsements: 75000,
          events: 30000,
          product_launches: 45000,
          misc: 20000
        }
      });

    if (budgetError) {
      console.error('❌ Error creating budget:', budgetError);
      process.exit(1);
    }

    console.log('✅ Created budget allocation\n');

    // Step 7: Create activity log entries
    console.log('📋 Step 7: Creating activity log...');

    const activities = [
      {
        agency_id: agencyId,
        activity_type: 'campaign_created',
        title: 'New Campaign Created',
        description: 'Spring Football Campaign 2024 has been created',
        metadata: { campaign_id: campaigns[0].id }
      },
      {
        agency_id: agencyId,
        activity_type: 'athlete_added',
        title: 'Athletes Added',
        description: 'Added 3 athletes to Basketball Elite Series',
        metadata: { campaign_id: campaigns[1].id, count: 3 }
      },
      {
        agency_id: agencyId,
        activity_type: 'campaign_milestone',
        title: 'Campaign Milestone Reached',
        description: 'Spring Football Campaign reached 400K impressions',
        metadata: { campaign_id: campaigns[0].id, milestone: 'impressions_400k' }
      },
      {
        agency_id: agencyId,
        activity_type: 'budget_updated',
        title: 'Budget Updated',
        description: 'Q1 2024 budget allocation updated',
        metadata: { amount: 250000 }
      }
    ];

    const { error: activityError } = await supabase
      .from('agency_activity_log')
      .insert(activities);

    if (activityError) {
      console.error('❌ Error creating activity log:', activityError);
      process.exit(1);
    }

    console.log(`✅ Created ${activities.length} activity log entries\n`);

    // Step 8: Create pending actions
    console.log('📋 Step 8: Creating pending actions...');

    const actions = [
      {
        agency_id: agencyId,
        action_type: 'review_contract',
        title: 'Review Contract',
        description: 'Review and approve contract for new athlete in Spring Campaign',
        priority: 'high',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        status: 'pending',
        metadata: { campaign_id: campaigns[0].id }
      },
      {
        agency_id: agencyId,
        action_type: 'approve_content',
        title: 'Approve Content',
        description: 'Approve athlete social media content for Basketball Elite Series',
        priority: 'medium',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
        status: 'pending',
        metadata: { campaign_id: campaigns[1].id }
      },
      {
        agency_id: agencyId,
        action_type: 'review_metrics',
        title: 'Review Campaign Metrics',
        description: 'Weekly review of Spring Football Campaign performance',
        priority: 'medium',
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        status: 'pending',
        metadata: { campaign_id: campaigns[0].id }
      }
    ];

    const { error: actionsError } = await supabase
      .from('agency_pending_actions')
      .insert(actions);

    if (actionsError) {
      console.error('❌ Error creating pending actions:', actionsError);
      process.exit(1);
    }

    console.log(`✅ Created ${actions.length} pending actions\n`);

    // Step 9: Verify data
    console.log('📋 Step 9: Verifying seeded data...\n');

    // Check campaign count
    const { count: campaignCount } = await supabase
      .from('campaigns')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyId);

    // Check athlete assignments
    const { count: athleteAssignmentCount } = await supabase
      .from('campaign_athletes')
      .select('*', { count: 'exact', head: true });

    console.log('📊 Seeded Data Summary:');
    console.log(`   Campaigns: ${campaignCount}`);
    console.log(`   Athlete Assignments: ${athleteAssignmentCount}`);
    console.log(`   Athletes: ${athleteIds.length}`);
    console.log(`   Activity Log Entries: ${activities.length}`);
    console.log(`   Pending Actions: ${actions.length}\n`);

    console.log('🎉 Agency dashboard data seeded successfully!\n');
    console.log('✅ Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Log in as agency user');
    console.log('   3. Navigate to /dashboard/agency');
    console.log('   4. Verify all widgets display data correctly\n');

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedAgencyDashboardData();
