#!/usr/bin/env node

/**
 * Script to run Migration 016 using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read migration file
const migrationPath = join(__dirname, 'migrations', '016_athlete_enhancements.sql');
const migrationSQL = readFileSync(migrationPath, 'utf-8');

console.log('🚀 Running Migration 016: Athlete Profile Enhancements');
console.log('📄 File:', migrationPath);
console.log('🔗 Supabase URL:', SUPABASE_URL);
console.log('📏 SQL Length:', migrationSQL.length, 'characters');
console.log('');

async function runMigration() {
  try {
    console.log('🔧 Executing migration SQL...');

    // Execute the migration using RPC
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration error:', error);
      console.log('');
      console.log('⚠️  The RPC method may not be available.');
      console.log('');
      console.log('📝 Please run migration manually:');
      console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard/project/' + SUPABASE_URL.split('//')[1].split('.')[0]);
      console.log('2. Navigate to SQL Editor');
      console.log('3. Open: migrations/016_athlete_enhancements.sql');
      console.log('4. Copy entire contents');
      console.log('5. Paste into SQL Editor');
      console.log('6. Click "Run"');
      console.log('');
      console.log('✅ You should see: "SUCCESS: Migration 016 completed successfully!"');
      process.exit(1);
    }

    console.log('✅ Migration executed successfully!');
    console.log('');
    if (data) {
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    }
    console.log('');
    console.log('🎉 Migration 016 completed!');
    console.log('');
    console.log('✨ What changed:');
    console.log('  • Added 13 new athlete profile fields');
    console.log('  • Created 12 performance indexes');
    console.log('  • Added 4 database functions');
    console.log('  • Created auto-update trigger');
    console.log('  • Enabled matchmaking capabilities');
    console.log('');
    console.log('🧪 Next steps:');
    console.log('1. Refresh your browser at http://localhost:3002');
    console.log('2. Sign up as an athlete');
    console.log('3. Complete the 8-step onboarding (4 new steps added!)');
    console.log('4. See your profile completion score');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('');
    console.log('📝 Manual migration required - see instructions above');
    process.exit(1);
  }
}

runMigration();
