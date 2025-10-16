#!/usr/bin/env node

/**
 * Script to run Migration 016 via Supabase REST API
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Read migration file
const migrationPath = path.join(__dirname, 'migrations', '016_athlete_enhancements.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

console.log('🚀 Running Migration 016: Athlete Profile Enhancements');
console.log('📄 File:', migrationPath);
console.log('🔗 Supabase URL:', SUPABASE_URL);
console.log('');

// Execute migration via Supabase REST API
async function runMigration() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    });

    if (!response.ok) {
      // Try alternative approach - direct SQL execution
      console.log('⚠️  First approach failed, trying direct SQL execution...');

      const response2 = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          query: migrationSQL
        })
      });

      if (!response2.ok) {
        const errorText = await response2.text();
        throw new Error(`Migration failed: ${response2.status} - ${errorText}`);
      }
    }

    const data = await response.text();

    console.log('✅ Migration executed successfully!');
    console.log('');
    console.log('📊 Response:', data);
    console.log('');
    console.log('🎉 Migration 016 completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Verify migration in Supabase Dashboard → SQL Editor');
    console.log('2. Check users table has 13 new columns');
    console.log('3. Test athlete onboarding with new 4 steps');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('📝 Manual steps:');
    console.error('1. Go to Supabase Dashboard');
    console.error('2. Navigate to SQL Editor');
    console.error('3. Open migrations/016_athlete_enhancements.sql');
    console.error('4. Copy and paste the entire file');
    console.error('5. Click "Run"');
    process.exit(1);
  }
}

runMigration();
