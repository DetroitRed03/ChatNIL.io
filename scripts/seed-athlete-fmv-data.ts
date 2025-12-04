/**
 * Seed FMV Data for Test Athletes
 * ================================
 * This script seeds FMV (Fair Market Value) data for existing test athletes
 * who were created directly in the database without going through onboarding.
 *
 * Athletes to seed:
 * - Marcus Williams (Kentucky Basketball)
 * - James Thompson (Alabama Football)
 * - Alex Rivera (UCLA Soccer)
 *
 * Run: SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/seed-athlete-fmv-data.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AthleteToSeed {
  name: string;
  user_id: string;
  sport: string;
  fmv_data: {
    fmv_score: number;
    fmv_tier: 'elite' | 'high' | 'medium' | 'developing' | 'emerging';
    percentile_rank: number;
    deal_value_min: number;
    deal_value_max: number;
  };
  estimated_fmv_for_profile: number;
}

const athletesToSeed: AthleteToSeed[] = [
  {
    name: 'Marcus Williams',
    user_id: '7a799d45-d306-4622-b70f-46e7444e1caa',
    sport: 'Basketball',
    fmv_data: {
      fmv_score: 72,
      fmv_tier: 'medium',
      percentile_rank: 72,
      deal_value_min: 2500,
      deal_value_max: 35000,
    },
    estimated_fmv_for_profile: 35000,
  },
  {
    name: 'James Thompson',
    user_id: 'f496bd63-2c98-42af-a976-6b42528d0a59',
    sport: 'Football',
    fmv_data: {
      fmv_score: 78,
      fmv_tier: 'high',
      percentile_rank: 78,
      deal_value_min: 5000,
      deal_value_max: 50000,
    },
    estimated_fmv_for_profile: 45000,
  },
  {
    name: 'Alex Rivera',
    user_id: 'b63b82c5-8551-40e4-ba3c-c3223932e0ad',
    sport: 'Soccer',
    fmv_data: {
      fmv_score: 58,
      fmv_tier: 'medium',
      percentile_rank: 58,
      deal_value_min: 1000,
      deal_value_max: 14000,
    },
    estimated_fmv_for_profile: 14000,
  },
];

async function seedFMVData() {
  console.log('=== Seeding FMV Data for Test Athletes ===\n');

  for (const athlete of athletesToSeed) {
    console.log(`\n--- Processing ${athlete.name} (${athlete.sport}) ---`);
    console.log(`User ID: ${athlete.user_id}`);

    // Check if FMV data already exists
    const { data: existingFmv, error: checkError } = await supabase
      .from('athlete_fmv_data')
      .select('athlete_id, fmv_score')
      .eq('athlete_id', athlete.user_id)
      .single();

    if (existingFmv) {
      console.log(`  FMV already exists: Score ${existingFmv.fmv_score}`);
      console.log(`  Updating existing record...`);

      // Update existing record
      const { error: updateError } = await supabase
        .from('athlete_fmv_data')
        .update({
          fmv_score: athlete.fmv_data.fmv_score,
          fmv_tier: athlete.fmv_data.fmv_tier,
          percentile_rank: athlete.fmv_data.percentile_rank,
          deal_value_min: athlete.fmv_data.deal_value_min,
          deal_value_max: athlete.fmv_data.deal_value_max,
          is_public_score: true,
          updated_at: new Date().toISOString(),
        })
        .eq('athlete_id', athlete.user_id);

      if (updateError) {
        console.error(`  ERROR updating FMV:`, updateError.message);
      } else {
        console.log(`  Updated FMV: Score ${athlete.fmv_data.fmv_score}, Tier: ${athlete.fmv_data.fmv_tier}`);
      }
    } else {
      // Prepare FMV record (matching actual schema)
      const fmvRecord = {
        athlete_id: athlete.user_id,
        fmv_score: athlete.fmv_data.fmv_score,
        fmv_tier: athlete.fmv_data.fmv_tier,
        percentile_rank: athlete.fmv_data.percentile_rank,
        deal_value_min: athlete.fmv_data.deal_value_min,
        deal_value_max: athlete.fmv_data.deal_value_max,
        is_public_score: true,
      };

      // Insert FMV data
      const { data: insertedFmv, error: insertError } = await supabase
        .from('athlete_fmv_data')
        .insert(fmvRecord)
        .select()
        .single();

      if (insertError) {
        console.error(`  ERROR inserting FMV:`, insertError.message);
        continue;
      }

      console.log(`  FMV data inserted:`);
      console.log(`    Score: ${insertedFmv.fmv_score}`);
      console.log(`    Tier: ${insertedFmv.fmv_tier}`);
      console.log(`    Percentile: ${insertedFmv.percentile_rank}`);
    }

    // Update athlete_profiles with estimated_fmv
    const { error: profileUpdateError } = await supabase
      .from('athlete_profiles')
      .update({
        estimated_fmv: athlete.estimated_fmv_for_profile,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', athlete.user_id);

    if (profileUpdateError) {
      console.error(`  ERROR updating athlete_profiles:`, profileUpdateError.message);
    } else {
      console.log(`  Updated athlete_profiles.estimated_fmv: $${athlete.estimated_fmv_for_profile.toLocaleString()}`);
    }

    // Update athlete_public_profiles FMV estimates
    const { error: publicProfileError } = await supabase
      .from('athlete_public_profiles')
      .update({
        estimated_fmv_min: athlete.fmv_data.deal_value_min,
        estimated_fmv_max: athlete.fmv_data.deal_value_max,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', athlete.user_id);

    if (publicProfileError) {
      console.error(`  ERROR updating athlete_public_profiles:`, publicProfileError.message);
    } else {
      console.log(`  Updated athlete_public_profiles FMV range: $${athlete.fmv_data.deal_value_min.toLocaleString()} - $${athlete.fmv_data.deal_value_max.toLocaleString()}`);
    }
  }

  // Final verification
  console.log('\n\n=== Verification ===');
  const { data: allFmv, error: verifyError } = await supabase
    .from('athlete_fmv_data')
    .select('athlete_id, fmv_score, fmv_tier, percentile_rank, is_public_score')
    .in('athlete_id', athletesToSeed.map(a => a.user_id));

  if (verifyError) {
    console.error('Verification error:', verifyError);
  } else {
    console.log('\nFMV Data in database:');
    for (const fmv of (allFmv || [])) {
      const athlete = athletesToSeed.find(a => a.user_id === fmv.athlete_id);
      console.log(`  ${athlete?.name || fmv.athlete_id}: Score ${fmv.fmv_score}, Tier: ${fmv.fmv_tier}, Public: ${fmv.is_public_score}`);
    }
  }

  console.log('\n=== FMV Seeding Complete ===');
}

seedFMVData().catch(console.error);
