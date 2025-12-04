/**
 * Seed New Supabase Database with Test Data
 *
 * Creates essential test data for development and testing
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function log(message: string, emoji: string = '📋') {
  console.log(`${emoji} ${message}`);
}

async function main() {
  console.log('\n' + '='.repeat(60));
  log('🌱 Seeding New Database with Test Data', '🌱');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. Create test athlete
    log('Creating test athlete: Sarah Johnson...', '👤');
    const athleteEmail = `sarah.johnson.${Date.now()}@test.com`;
    const { data: athlete, error: athleteError } = await supabase.auth.admin.createUser({
      email: athleteEmail,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'athlete',
      },
    });

    if (athleteError) {
      log(`Error creating athlete: ${athleteError.message}`, '❌');
    } else {
      log(`Created athlete: ${athlete.user.id}`, '✅');

      // Update user profile
      await supabase.from('users').update({
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'athlete',
        username: 'sarah-johnson',
        bio: 'Point guard | Lincoln High | 2025 Class',
        school_name: 'Lincoln High School',
        graduation_year: 2025,
        primary_sport: 'Basketball',
        position: 'Point Guard',
        height_inches: 70,
        weight_lbs: 145,
        jersey_number: '7',
        profile_photo_url: 'https://i.pravatar.cc/400?img=45',
        onboarding_completed: true,
        profile_completion_score: 65,
      }).eq('id', athlete.user.id);

      log('Updated athlete profile', '✅');
    }

    // 2. Create test agency
    log('\nCreating test agency: Nike...', '🏢');
    const agencyEmail = `nike.${Date.now()}@test.com`;
    const { data: agency, error: agencyError } = await supabase.auth.admin.createUser({
      email: agencyEmail,
      password: 'testpassword123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Nike',
        last_name: 'Marketing',
        role: 'agency',
      },
    });

    if (agencyError) {
      log(`Error creating agency: ${agencyError.message}`, '❌');
    } else {
      log(`Created agency: ${agency.user.id}`, '✅');

      // Create agency profile
      await supabase.from('agencies').insert({
        id: agency.user.id,
        company_name: 'Nike',
        agency_type: 'brand',
        industry: 'Sports & Apparel',
        company_size: '10000+',
        website: 'https://nike.com',
        logo_url: 'https://logo.clearbit.com/nike.com',
      });

      log('Created agency profile', '✅');
    }

    // 3. Create a match between athlete and agency
    if (athlete && agency) {
      log('\nCreating athlete-agency match...', '🤝');
      const { error: matchError } = await supabase.from('agency_athlete_matches').insert({
        agency_id: agency.user.id,
        athlete_id: athlete.user.id,
        match_score: 85,
        tier: 'gold',
        status: 'active',
        match_reasons: ['Strong social media presence', 'Target demographic alignment'],
      });

      if (!matchError) {
        log('Created match', '✅');
      }
    }

    // 4. Create FMV data for athlete
    if (athlete) {
      log('\nCreating FMV data...', '💰');
      await supabase.from('athlete_fmv_data').insert({
        athlete_id: athlete.user.id,
        fmv_score: 52,
        fmv_tier: 'developing',
        percentile_rank: 49,
        deal_value_min: 1850,
        deal_value_max: 4162.50,
        is_public_score: true,
      });

      log('Created FMV data', '✅');
    }

    // 5. Create some quiz questions
    log('\nCreating quiz questions...', '📝');
    const quizQuestions = [
      {
        category: 'nil_basics',
        question: 'What does NIL stand for?',
        options: ['Name, Image, and Likeness', 'National Image League', 'New Income Law', 'None of the above'],
        correct_answer: 0,
        difficulty: 'beginner',
        points: 10,
      },
      {
        category: 'ncaa_rules',
        question: 'Can student-athletes earn money from NIL deals?',
        options: ['Yes, as of July 2021', 'No, it\'s prohibited', 'Only professionals', 'Only in certain states'],
        correct_answer: 0,
        difficulty: 'beginner',
        points: 10,
      },
    ];

    for (const q of quizQuestions) {
      await supabase.from('quiz_questions').insert(q);
    }

    log('Created quiz questions', '✅');

    // Summary
    console.log('\n' + '='.repeat(60));
    log('🎉 Seeding Complete!', '🎉');
    console.log('='.repeat(60));

    log('\n📊 Test Accounts Created:', '📊');
    log(`  Athlete: ${athleteEmail} / testpassword123`, '👤');
    log(`  Agency: ${agencyEmail} / testpassword123`, '🏢');

    log('\n📍 Next Steps:', '📍');
    log('  1. Enable Realtime in Supabase Dashboard', '1️⃣');
    log('  2. Restart dev server: npm run dev', '2️⃣');
    log('  3. Login and test!', '3️⃣');

    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error: any) {
    log(`\nFatal error: ${error.message}`, '❌');
    console.error(error);
    process.exit(1);
  }
}

main();
