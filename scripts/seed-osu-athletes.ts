/**
 * Seed Test Athletes for Oregon State University
 *
 * This script adds test athletes to Oregon State University for testing the compliance dashboard.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2];
      }
    });
  } catch (e) {
    // Env vars may already be set
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const testAthletes = [
  { name: 'Marcus Johnson', sport: 'Football', position: 'Quarterback' },
  { name: 'Emily Chen', sport: 'Basketball', position: 'Point Guard' },
  { name: 'David Rodriguez', sport: 'Baseball', position: 'Pitcher' },
  { name: 'Sarah Williams', sport: 'Soccer', position: 'Forward' },
  { name: 'Michael Brown', sport: 'Football', position: 'Wide Receiver' },
];

const testDeals = [
  { title: 'Nike Sponsorship', brand: 'Nike', amount: 5000, status: 'green' },
  { title: 'Local Car Dealership', brand: 'Bob\'s Auto', amount: 2500, status: 'yellow' },
  { title: 'Energy Drink Promo', brand: 'PowerBoost', amount: 1500, status: 'red' },
  { title: 'Gym Partnership', brand: 'FitLife', amount: 1000, status: 'green' },
  { title: 'Social Media Campaign', brand: 'TechStartup', amount: 3000, status: 'pending' },
];

async function seedOSUAthletes() {
  console.log('\n=== Seeding Oregon State Athletes ===\n');

  // Find Oregon State institution
  const { data: institution } = await supabase
    .from('institutions')
    .select('*')
    .ilike('name', '%Oregon State%')
    .single();

  if (!institution) {
    console.error('Oregon State University not found. Run setup-compliance-officer.ts first.');
    process.exit(1);
  }

  console.log(`Found institution: ${institution.name} (${institution.id})`);

  // Check for existing test athletes
  const { data: existingAthletes } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('institution_id', institution.id)
    .eq('role', 'college_athlete');

  if (existingAthletes && existingAthletes.length > 0) {
    console.log(`\nFound ${existingAthletes.length} existing athletes at ${institution.name}`);
    console.log('Skipping athlete creation.\n');

    // Just add some deals if missing
    for (const athlete of existingAthletes.slice(0, 3)) {
      const { data: existingDeals } = await supabase
        .from('nil_deals')
        .select('id')
        .eq('user_id', athlete.user_id);

      if (!existingDeals || existingDeals.length === 0) {
        const randomDeal = testDeals[Math.floor(Math.random() * testDeals.length)];
        console.log(`Adding deal for ${athlete.full_name}: ${randomDeal.title}`);

        const { error: dealError } = await supabase.from('nil_deals').insert({
          user_id: athlete.user_id,
          deal_title: randomDeal.title,
          third_party_name: randomDeal.brand,
          compensation_amount: randomDeal.amount,
          deal_type: 'sponsorship',
          status: 'active',
          institution_id: institution.id
        });

        if (dealError) {
          console.error('Error adding deal:', dealError.message);
        }
      }
    }
    return;
  }

  // Create test users and athletes
  for (const athlete of testAthletes) {
    const email = `${athlete.name.toLowerCase().replace(' ', '.')}@test.osu.edu`;
    console.log(`\nCreating athlete: ${athlete.name} (${email})`);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: athlete.name.split(' ')[0],
        last_name: athlete.name.split(' ')[1],
        full_name: athlete.name
      }
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`   User already exists, finding...`);
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === email);
        if (existingUser) {
          // Create athlete profile
          await createAthleteProfile(existingUser.id, athlete, institution.id);
        }
      } else {
        console.error(`   Error creating user: ${authError.message}`);
      }
      continue;
    }

    if (authData.user) {
      await createAthleteProfile(authData.user.id, athlete, institution.id);
    }
  }

  console.log('\n=== Seeding Complete ===\n');
}

async function createAthleteProfile(
  userId: string,
  athlete: typeof testAthletes[0],
  institutionId: string
) {
  // Check if profile exists
  const { data: existing } = await supabase
    .from('athlete_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    console.log(`   Profile already exists, updating institution...`);
    await supabase
      .from('athlete_profiles')
      .update({
        institution_id: institutionId,
        role: 'college_athlete',
        sport: athlete.sport
      })
      .eq('user_id', userId);
    return;
  }

  // Create athlete profile
  const { error: profileError } = await supabase.from('athlete_profiles').insert({
    user_id: userId,
    username: athlete.name.toLowerCase().replace(' ', '_'),
    sport: athlete.sport,
    position: athlete.position,
    role: 'college_athlete',
    institution_id: institutionId,
    school_name: 'Oregon State University',
    school: 'Oregon State University',
    school_level: 'college'
  });

  if (profileError) {
    console.error(`   Error creating profile: ${profileError.message}`);
    return;
  }

  console.log(`   Created profile for ${athlete.name}`);

  // Add a random deal
  const randomDeal = testDeals[Math.floor(Math.random() * testDeals.length)];
  const { error: dealError } = await supabase.from('nil_deals').insert({
    user_id: userId,
    deal_title: randomDeal.title,
    third_party_name: randomDeal.brand,
    compensation_amount: randomDeal.amount,
    deal_type: 'sponsorship',
    status: 'active',
    institution_id: institutionId
  });

  if (dealError) {
    console.error(`   Error creating deal: ${dealError.message}`);
  } else {
    console.log(`   Created deal: ${randomDeal.title} ($${randomDeal.amount})`);

    // Add compliance score for this deal
    const { data: deal } = await supabase
      .from('nil_deals')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (deal) {
      const scoreValue = randomDeal.status === 'green' ? 85 : randomDeal.status === 'yellow' ? 65 : 35;
      await supabase.from('compliance_scores').insert({
        deal_id: deal.id,
        user_id: userId,
        total_score: scoreValue,
        status: randomDeal.status === 'pending' ? 'pending' : randomDeal.status,
        policy_fit_score: scoreValue,
        document_score: scoreValue,
        fmv_score: scoreValue,
        tax_score: scoreValue,
        brand_safety_score: scoreValue,
        guardian_consent_score: 100
      });
      console.log(`   Created compliance score: ${randomDeal.status} (${scoreValue})`);
    }
  }
}

seedOSUAthletes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
