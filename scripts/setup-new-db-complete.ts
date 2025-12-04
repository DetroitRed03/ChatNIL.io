/**
 * Complete NEW Database Setup
 *
 * This script:
 * 1. Creates all necessary tables (schema)
 * 2. Seeds demo data (5 athletes, 2 campaigns, etc.)
 *
 * Target: NEW database (lqskiijspudfocddhkqs)
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://lqskiijspudfocddhkqs.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxc2tpaWpzcHVkZm9jZGRoa3FzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU5MzM1NCwiZXhwIjoyMDc3MTY5MzU0fQ.LpapT51choXCwTfpbE81AIc4JC9QOO0FpOtqUxZ405I';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration(filename: string, description: string) {
  console.log(`\n📋 ${description}...`);
  console.log('━'.repeat(60));

  const migrationPath = path.join(process.cwd(), 'migrations', filename);
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log(`📊 File: ${filename}`);
  console.log(`📦 Size: ${(sql.length / 1024).toFixed(2)} KB`);
  console.log('⚙️  Executing...');

  const { data, error } = await supabase.rpc('exec_sql', { query: sql });

  if (error) {
    console.error('❌ Error:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    throw error;
  }

  console.log('✅ Success!');

  if (data && Array.isArray(data) && data.length > 0) {
    console.log('\n📊 Results:');
    data.forEach((row: any) => {
      console.log(JSON.stringify(row, null, 2));
    });
  }

  return data;
}

async function main() {
  console.log('🚀 Setting up NEW Database');
  console.log(`📊 Database: ${SUPABASE_URL}`);
  console.log('━'.repeat(60));

  try {
    // Step 1: Create Schema
    await runMigration(
      'CONSOLIDATED_NEW_DB_SETUP.sql',
      'STEP 1: Creating Database Schema'
    );

    console.log('\n✅ Tables created:');
    console.log('   - athlete_profiles');
    console.log('   - social_media_stats');
    console.log('   - agency_campaigns');
    console.log('   - campaign_athletes');
    console.log('   - agency_athlete_lists');
    console.log('   - agency_message_threads');
    console.log('   - agency_athlete_matches');

    // Step 2: Seed Data
    const seedData = await runMigration(
      '110_demo_complete_seed.sql',
      'STEP 2: Seeding Demo Data'
    );

    console.log('\n✅ Demo data created:');
    console.log('   - 5 athletes (Sarah, Marcus, Emma, Tyler, Olivia)');
    console.log('   - 2 campaigns ($150K total budget)');
    console.log('   - Social media stats (90K-207K followers)');
    console.log('   - Saved lists, message threads, matches');

    // Step 3: Verify
    console.log('\n📋 STEP 3: Verification');
    console.log('━'.repeat(60));

    const {data: athletes} = await supabase
      .from('users')
      .select('full_name, email')
      .eq('role', 'athlete')
      .like('email', '%@demo.chatnil.io');

    console.log(`✅ Athletes: ${athletes?.length || 0}`);
    athletes?.forEach(a => console.log(`   - ${a.full_name}`));

    const {data: campaigns} = await supabase
      .from('agency_campaigns')
      .select('name, budget, status')
      .eq('agency_id', '3f270e9b-cc2b-48a0-b82e-52fdf1094879');

    console.log(`✅ Campaigns: ${campaigns?.length || 0}`);
    campaigns?.forEach(c => console.log(`   - ${c.name}: $${c.budget} (${c.status})`));

    console.log('\n━'.repeat(60));
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('━'.repeat(60));
    console.log('\n✅ Next Steps:');
    console.log('  1. Go to http://localhost:3000/agencies/dashboard');
    console.log('  2. Dashboard should show 2 campaigns, 2 saved athletes');
    console.log('  3. Go to http://localhost:3000/agencies/discover');
    console.log('  4. Click "Generate Match" to see real athletes');
    console.log('  5. Test Save and Message buttons');
    console.log('\n🎯 Database is ready for end-to-end testing!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
