/**
 * Phase 5 FMV System - Seed Script
 * Creates test athletes with realistic FMV scores for demo and testing
 */

import { createClient } from '@supabase/supabase-js';
import { calculateFMV } from '../lib/fmv/fmv-calculator';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test athlete data - 5 athletes with varying FMV scores
const testAthletes = [
  {
    email: 'sarah.johnson@test.com',
    password: 'TestPassword123!',
    first_name: 'Sarah',
    last_name: 'Johnson',
    role: 'athlete' as const,
    school_name: 'University of Kentucky',
    graduation_year: 2026,
    major: 'Business Administration',
    gpa: 3.8,
    primary_sport: 'Basketball',
    position: 'Point Guard',
    achievements: ['All-State 2024', 'Team Captain', '1st Team All-Conference'],
    nil_interests: ['fashion', 'fitness', 'lifestyle'],
    nil_concerns: ['time_commitment', 'contract_terms'],
    social_media_handles: {
      instagram: { handle: '@sarahjbasketball', followers: 85000, verified: true, engagement_rate: 6.8 },
      tiktok: { handle: '@sarahj_hoops', followers: 40000, verified: true, engagement_rate: 8.2 }
    },
    expected_fmv: 92
  },
  {
    email: 'marcus.williams@test.com',
    password: 'TestPassword123!',
    first_name: 'Marcus',
    last_name: 'Williams',
    role: 'athlete' as const,
    school_name: 'University of Texas',
    graduation_year: 2025,
    major: 'Kinesiology',
    gpa: 3.4,
    primary_sport: 'Football',
    position: 'Quarterback',
    achievements: ['All-American 2023', 'Conference Player of the Year', '3,000+ passing yards'],
    nil_interests: ['gaming', 'technology', 'music'],
    nil_concerns: ['ncaa_compliance', 'brand_fit'],
    social_media_handles: {
      instagram: { handle: '@marcus_qb1', followers: 30000, verified: false, engagement_rate: 5.2 },
      twitter: { handle: '@MarcusW_QB', followers: 15000, verified: false, engagement_rate: 3.8 }
    },
    expected_fmv: 78
  },
  {
    email: 'emma.garcia@test.com',
    password: 'TestPassword123!',
    first_name: 'Emma',
    last_name: 'Garcia',
    role: 'athlete' as const,
    school_name: 'UCLA',
    graduation_year: 2027,
    major: 'Environmental Science',
    gpa: 3.9,
    primary_sport: 'Soccer',
    position: 'Midfielder',
    achievements: ['Academic All-American', 'Conference Freshman of the Year'],
    nil_interests: ['sustainability', 'travel', 'food'],
    nil_concerns: ['tax_implications', 'time_commitment'],
    social_media_handles: {
      instagram: { handle: '@emmagsoccer', followers: 6000, verified: false, engagement_rate: 4.2 },
      tiktok: { handle: '@emmag_footie', followers: 2500, verified: false, engagement_rate: 5.8 }
    },
    expected_fmv: 62
  },
  {
    email: 'jake.miller@test.com',
    password: 'TestPassword123!',
    first_name: 'Jake',
    last_name: 'Miller',
    role: 'athlete' as const,
    school_name: 'University of Florida',
    graduation_year: 2026,
    major: 'Sports Management',
    gpa: 3.2,
    primary_sport: 'Baseball',
    position: 'Pitcher',
    achievements: ['SEC Honorable Mention', '3.2 ERA'],
    nil_interests: ['fitness', 'gaming'],
    nil_concerns: ['contract_terms'],
    social_media_handles: {
      instagram: { handle: '@jake_miller_88', followers: 1500, verified: false, engagement_rate: 3.1 },
      twitter: { handle: '@JMiller88', followers: 600, verified: false, engagement_rate: 2.2 }
    },
    expected_fmv: 48
  },
  {
    email: 'olivia.brown@test.com',
    password: 'TestPassword123!',
    first_name: 'Olivia',
    last_name: 'Brown',
    role: 'athlete' as const,
    school_name: 'Kentucky Central High School',
    graduation_year: 2026,
    major: null,
    gpa: 3.6,
    primary_sport: 'Volleyball',
    position: 'Outside Hitter',
    achievements: ['District All-Star', 'Team MVP'],
    nil_interests: ['fashion', 'music'],
    nil_concerns: ['ncaa_compliance', 'eligibility'],
    social_media_handles: {
      instagram: { handle: '@olivia_vball', followers: 650, verified: false, engagement_rate: 2.8 }
    },
    expected_fmv: 28
  }
];

// Test agency data
const testAgencies = [
  {
    email: 'nike.agency@test.com',
    password: 'TestPassword123!',
    first_name: 'Nike',
    last_name: 'Sports Agency',
    role: 'agency' as const,
    company_name: 'Nike Athlete Management',
  },
  {
    email: 'gatorade.agency@test.com',
    password: 'TestPassword123!',
    first_name: 'Gatorade',
    last_name: 'Partnerships',
    role: 'agency' as const,
    company_name: 'Gatorade Sports Marketing',
  },
  {
    email: 'local.agency@test.com',
    password: 'TestPassword123!',
    first_name: 'Local',
    last_name: 'Business Agency',
    role: 'agency' as const,
    company_name: 'Local Sports Marketing',
  }
];

// NIL deals to create (using valid deal_type ENUM values)
const nilDealsData = [
  // Sarah's deals (3 total)
  { athlete_email: 'sarah.johnson@test.com', agency_email: 'nike.agency@test.com', title: 'Nike Athlete Partnership', value: 25000, type: 'sponsorship', status: 'active' },
  { athlete_email: 'sarah.johnson@test.com', agency_email: 'gatorade.agency@test.com', title: 'Gatorade Social Campaign', value: 5000, type: 'social_media', status: 'completed' },
  { athlete_email: 'sarah.johnson@test.com', agency_email: 'local.agency@test.com', title: 'Local Restaurant Promotion', value: 500, type: 'content_creation', status: 'completed' },

  // Marcus's deals (2 total)
  { athlete_email: 'marcus.williams@test.com', agency_email: 'gatorade.agency@test.com', title: 'Gatorade Game Day Partnership', value: 2500, type: 'endorsement', status: 'completed' },
  { athlete_email: 'marcus.williams@test.com', agency_email: 'local.agency@test.com', title: 'Campus Gym Brand Ambassador', value: 1000, type: 'sponsorship', status: 'active' },

  // Emma's deal (1 total)
  { athlete_email: 'emma.garcia@test.com', agency_email: 'local.agency@test.com', title: 'Local Pizza Restaurant', value: 500, type: 'appearance', status: 'completed' }

  // Jake and Olivia: No deals
];

async function seedAgencies() {
  console.log('🏢 Creating test agencies...\n');

  const createdAgencies = [];

  for (const agency of testAgencies) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: agency.email,
        password: agency.password,
        email_confirm: true,
      });

      if (authError) {
        // Check if user already exists (check both message and code)
        if (authError.message.includes('already registered') || authError.code === 'email_exists') {
          console.log(`⚠️  ${agency.first_name} auth user already exists, checking profile...`);

          // Get the auth user to get the ID
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          const existingAuthUser = authUsers?.users.find(u => u.email === agency.email);

          if (!existingAuthUser) {
            console.log(`❌ Could not find auth user for ${agency.email}`);
            continue;
          }

          // Try to fetch existing profile
          const { data: existingAgency, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', agency.email)
            .single();

          if (existingAgency) {
            createdAgencies.push({ ...agency, userId: existingAgency.id });
            console.log(`✅ Loaded existing agency: ${agency.first_name} (${agency.email})`);
          } else {
            // Auth user exists but no profile - create the profile
            console.log(`  Creating missing profile for ${agency.first_name}...`);
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: existingAuthUser.id,
                email: agency.email,
                first_name: agency.first_name,
                last_name: agency.last_name,
                role: agency.role,
                onboarding_completed: true,
              });

            if (profileError) {
              console.log(`  ❌ Failed to create profile: ${profileError.message}`);
            } else {
              createdAgencies.push({ ...agency, userId: existingAuthUser.id });
              console.log(`✅ Created agency profile: ${agency.first_name} (${agency.email})`);
            }
          }
          continue;
        }
        throw authError;
      }

      const userId = authData.user!.id;

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: agency.email,
          first_name: agency.first_name,
          last_name: agency.last_name,
          role: agency.role,
          onboarding_completed: true,
        });

      if (profileError) throw profileError;

      console.log(`✅ Created agency: ${agency.first_name} (${agency.email})`);

      createdAgencies.push({ ...agency, userId });

    } catch (error) {
      console.error(`❌ Failed to create ${agency.first_name}:`, error);
    }
  }

  console.log(`\n✅ Created ${createdAgencies.length} agencies\n`);
  return createdAgencies;
}

async function seedAthletes() {
  console.log('👥 Creating test athletes...\n');

  const createdAthletes = [];

  for (const athlete of testAthletes) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: athlete.email,
        password: athlete.password,
        email_confirm: true,
      });

      if (authError) {
        // Check if user already exists (check both message and code)
        if (authError.message.includes('already registered') || authError.code === 'email_exists') {
          console.log(`⚠️  ${athlete.first_name} ${athlete.last_name} auth user already exists, checking profile...`);

          // Get the auth user to get the ID
          const { data: authUsers } = await supabase.auth.admin.listUsers();
          const existingAuthUser = authUsers?.users.find(u => u.email === athlete.email);

          if (!existingAuthUser) {
            console.log(`❌ Could not find auth user for ${athlete.email}`);
            continue;
          }

          // Try to fetch existing profile
          const { data: existingAthlete, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('email', athlete.email)
            .single();

          if (existingAthlete) {
            createdAthletes.push({ ...athlete, userId: existingAthlete.id });
            console.log(`✅ Loaded existing athlete: ${athlete.first_name} ${athlete.last_name} (${athlete.email})`);
          } else {
            // Auth user exists but no profile - create the profile
            console.log(`  Creating missing profile for ${athlete.first_name} ${athlete.last_name}...`);
            const { error: profileError } = await supabase
              .from('users')
              .insert({
                id: existingAuthUser.id,
                email: athlete.email,
                first_name: athlete.first_name,
                last_name: athlete.last_name,
                role: athlete.role,
                school_name: athlete.school_name,
                graduation_year: athlete.graduation_year,
                major: athlete.major,
                gpa: athlete.gpa,
                primary_sport: athlete.primary_sport,
                position: athlete.position,
                achievements: athlete.achievements,
                nil_interests: athlete.nil_interests,
                nil_concerns: athlete.nil_concerns,
                onboarding_completed: true,
              });

            if (profileError) {
              console.log(`  ❌ Failed to create profile: ${profileError.message}`);
            } else {
              // Create social media stats
              const socialPlatforms = Object.entries(athlete.social_media_handles);
              for (const [platform, data] of socialPlatforms) {
                await supabase
                  .from('social_media_stats')
                  .insert({
                    user_id: existingAuthUser.id,
                    platform: platform,
                    handle: data.handle,
                    followers: data.followers,
                    verified: data.verified,
                    engagement_rate: data.engagement_rate,
                  });
              }

              createdAthletes.push({ ...athlete, userId: existingAuthUser.id });
              console.log(`✅ Created athlete profile: ${athlete.first_name} ${athlete.last_name} (${athlete.email})`);
            }
          }
          continue;
        }
        throw authError;
      }

      const userId = authData.user!.id;

      // 2. Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: athlete.email,
          first_name: athlete.first_name,
          last_name: athlete.last_name,
          role: athlete.role,
          school_name: athlete.school_name,
          graduation_year: athlete.graduation_year,
          major: athlete.major,
          gpa: athlete.gpa,
          primary_sport: athlete.primary_sport,
          position: athlete.position,
          achievements: athlete.achievements,
          nil_interests: athlete.nil_interests,
          nil_concerns: athlete.nil_concerns,
          onboarding_completed: true,
        });

      if (profileError) throw profileError;

      // 3. Create social media stats
      const socialPlatforms = Object.entries(athlete.social_media_handles);
      for (const [platform, data] of socialPlatforms) {
        const { error: socialError } = await supabase
          .from('social_media_stats')
          .insert({
            user_id: userId,
            platform: platform,
            handle: data.handle,
            followers: data.followers,
            verified: data.verified,
            engagement_rate: data.engagement_rate,
          });

        if (socialError) throw socialError;
      }

      console.log(`✅ Created athlete: ${athlete.first_name} ${athlete.last_name} (${athlete.email})`);
      console.log(`   Expected FMV: ~${athlete.expected_fmv}`);

      createdAthletes.push({ ...athlete, userId });

    } catch (error) {
      console.error(`❌ Failed to create ${athlete.first_name} ${athlete.last_name}:`, error);
    }
  }

  console.log(`\n✅ Created ${createdAthletes.length} athletes\n`);
  return createdAthletes;
}

async function seedNILDeals(athletes: any[], agencies: any[]) {
  console.log('💰 Creating NIL deals...\n');

  let dealsCreated = 0;
  let dealsSkipped = 0;

  for (const deal of nilDealsData) {
    try {
      // Find athlete by email
      const athlete = athletes.find(a => a.email === deal.athlete_email);
      if (!athlete) {
        console.log(`⚠️  Athlete not found for ${deal.athlete_email}, skipping deal...`);
        continue;
      }

      // Find agency by email
      const agency = agencies.find(a => a.email === deal.agency_email);
      if (!agency) {
        console.log(`⚠️  Agency not found for ${deal.agency_email}, skipping deal...`);
        continue;
      }

      // Check if deal already exists (same athlete, agency, and title)
      const { data: existingDeal } = await supabase
        .from('nil_deals')
        .select('id')
        .eq('athlete_id', athlete.userId)
        .eq('agency_id', agency.userId)
        .eq('deal_title', deal.title)
        .single();

      if (existingDeal) {
        dealsSkipped++;
        continue;
      }

      const { error } = await supabase
        .from('nil_deals')
        .insert({
          athlete_id: athlete.userId,
          agency_id: agency.userId,
          deal_title: deal.title,
          compensation_amount: deal.value,
          deal_type: deal.type,
          status: deal.status,
          description: `Test NIL deal: ${deal.title}`,
        });

      if (error) throw error;

      console.log(`   ✅ ${athlete.first_name} ${athlete.last_name} ← ${agency.first_name}: ${deal.title}`);
      dealsCreated++;

    } catch (error) {
      console.error(`❌ Failed to create deal "${deal.title}":`, error);
    }
  }

  console.log(`\n✅ Created ${dealsCreated} NIL deals${dealsSkipped > 0 ? ` (${dealsSkipped} already existed)` : ''}\n`);
}

async function calculateFMVForAthletes(athletes: any[]) {
  console.log('🎯 Calculating FMV scores...\n');

  for (const athlete of athletes) {
    try {
      // 1. Fetch full user profile
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', athlete.userId)
        .single();

      if (userError) throw userError;

      // 2. Fetch social stats
      const { data: socialStats, error: socialError } = await supabase
        .from('social_media_stats')
        .select('*')
        .eq('user_id', athlete.userId);

      if (socialError) throw socialError;

      // 3. Fetch NIL deals
      const { data: nilDeals, error: dealsError } = await supabase
        .from('nil_deals')
        .select('*')
        .eq('athlete_id', athlete.userId);

      if (dealsError) throw dealsError;

      // Debug: Log deals for first athlete
      if (athlete.userId === athletes[0].userId) {
        console.log(`\n🔍 Debug - ${athlete.first_name}'s data:`);
        console.log(`   NIL Deals: ${nilDeals?.length || 0} deals`);
        if (nilDeals && nilDeals.length > 0) {
          nilDeals.forEach(deal => {
            console.log(`     - ${deal.deal_title}: $${deal.compensation_amount} (${deal.status})`);
          });
        }
        console.log(`   Social Stats: ${socialStats?.length || 0} platforms`);
        if (socialStats && socialStats.length > 0) {
          socialStats.forEach(stat => {
            console.log(`     - ${stat.platform}: ${stat.followers} followers (${stat.engagement_rate}% engagement)`);
          });
        }
      }

      // 4. Calculate FMV
      const fmvResult = await calculateFMV({
        athlete: user,
        socialStats: socialStats || [],
        nilDeals: nilDeals || [],
      });

      // 5. Save FMV data
      const { error: fmvError } = await supabase
        .from('athlete_fmv_data')
        .upsert({
          athlete_id: athlete.userId,
          ...fmvResult,
        }, {
          onConflict: 'athlete_id'
        });

      if (fmvError) throw fmvError;

      const tierEmoji = {
        elite: '🏆',
        high: '⭐',
        medium: '📈',
        developing: '🌱',
        emerging: '💫'
      }[fmvResult.fmv_tier] || '📊';

      // Enhanced logging with component scores
      console.log(`${tierEmoji} ${athlete.first_name} ${athlete.last_name}: FMV ${fmvResult.fmv_score} (${fmvResult.fmv_tier}) - Top ${fmvResult.percentile_rank}%`);
      if (athlete.userId === athletes[0].userId) {
        console.log(`   Score breakdown: Social ${fmvResult.social_score} + Athletic ${fmvResult.athletic_score} + Market ${fmvResult.market_score} + Brand ${fmvResult.brand_score}\n`);
      }

    } catch (error) {
      console.error(`❌ Failed to calculate FMV for ${athlete.first_name} ${athlete.last_name}:`, error);
    }
  }

  console.log('');
}

async function seedPhase5Data() {
  console.log('🌱 Starting Phase 5 FMV System seed...\n');
  console.log('📊 Supabase URL:', SUPABASE_URL);
  console.log('');

  try {
    // 1. Create test agencies
    const agencies = await seedAgencies();

    // 2. Create test athletes
    const athletes = await seedAthletes();

    if (athletes.length === 0) {
      console.log('⚠️  No athletes were created. They may already exist.');
      console.log('💡 Run: npm run clean:phase5 to remove existing test data\n');
      return;
    }

    // 3. Create NIL deals
    await seedNILDeals(athletes, agencies);

    // 4. Calculate FMV scores
    await calculateFMVForAthletes(athletes);

    console.log('✅ Phase 5 seed complete!\n');
    console.log('📊 Summary:');
    console.log(`   - ${agencies.length} agencies created`);
    console.log(`   - ${athletes.length} athletes created`);
    console.log(`   - ${nilDealsData.length} NIL deals created`);
    console.log(`   - ${athletes.length} FMV calculations completed\n`);
    console.log('🧪 Test with:');
    console.log('   sarah.johnson@test.com / TestPassword123! (Expected: ~92 FMV)');
    console.log('   marcus.williams@test.com / TestPassword123! (Expected: ~78 FMV)');
    console.log('   emma.garcia@test.com / TestPassword123! (Expected: ~62 FMV)\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedPhase5Data();
