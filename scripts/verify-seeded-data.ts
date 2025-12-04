#!/usr/bin/env tsx

/**
 * Verify all seeded data
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verify() {
  console.log('🔍 Verifying Seeded Data...\n');
  console.log('━'.repeat(60));

  const tables = [
    { name: 'users', role: 'athlete', label: 'Athletes' },
    { name: 'users', role: 'agency', label: 'Agencies' },
    { name: 'social_media_stats', label: 'Social Media Stats' },
    { name: 'athlete_public_profiles', label: 'Athlete Public Profiles' },
    { name: 'notifications', label: 'Notifications' },
    { name: 'events', label: 'Events' },
    { name: 'quiz_progress', label: 'Quiz Progress' },
    { name: 'badges', label: 'Badges' }
  ];

  for (const table of tables) {
    let query = supabase.from(table.name).select('id', { count: 'exact', head: true });

    if (table.role) {
      query = query.eq('role', table.role);
    }

    const { count, error } = await query;

    if (error) {
      console.log(`❌ ${table.label}: Error - ${error.message}`);
    } else {
      console.log(`✅ ${table.label}: ${count} records`);
    }
  }

  // Check some sample data
  console.log('\n' + '━'.repeat(60));
  console.log('📊 Sample Data:\n');

  const { data: sampleAthlete } = await supabase
    .from('users')
    .select('first_name, last_name, email, primary_sport, school_name')
    .eq('role', 'athlete')
    .limit(1)
    .single();

  if (sampleAthlete) {
    console.log('Sample Athlete:');
    console.log(`  Name: ${sampleAthlete.first_name} ${sampleAthlete.last_name}`);
    console.log(`  Email: ${sampleAthlete.email}`);
    console.log(`  Sport: ${sampleAthlete.primary_sport}`);
    console.log(`  School: ${sampleAthlete.school_name}`);
  }

  const { data: sampleProfile } = await supabase
    .from('athlete_public_profiles')
    .select('display_name, sport, instagram_followers, estimated_fmv_min, estimated_fmv_max')
    .limit(1)
    .single();

  if (sampleProfile) {
    console.log('\nSample Public Profile:');
    console.log(`  Name: ${sampleProfile.display_name}`);
    console.log(`  Sport: ${sampleProfile.sport}`);
    console.log(`  Instagram: ${sampleProfile.instagram_followers} followers`);
    console.log(`  FMV: $${sampleProfile.estimated_fmv_min / 100} - $${sampleProfile.estimated_fmv_max / 100}`);
  }

  const { data: badges } = await supabase
    .from('badges')
    .select('name, rarity, points')
    .order('points', { ascending: false })
    .limit(3);

  if (badges && badges.length > 0) {
    console.log('\nTop Badges:');
    badges.forEach(b => {
      console.log(`  ${b.name} (${b.rarity}) - ${b.points} points`);
    });
  }

  console.log('\n' + '━'.repeat(60));
  console.log('✨ Verification Complete!\n');
}

verify();
