#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  // Read the migration SQL file
  const migrationPath = join(__dirname, '../supabase/migrations/013_add_missing_athlete_fields.sql');
  const sql = readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration SQL:');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
  console.log('');

  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`⏳ Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;

      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(`SQL: ${stmt.substring(0, 100)}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql_string: stmt + ';'
      });

      if (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error.message);

        // Try alternative approach using direct query
        console.log('🔄 Trying direct query...');

        const { error: queryError } = await supabase
          .from('_migrations')
          .insert({ statement: stmt });

        if (queryError) {
          console.error('❌ Direct query also failed:', queryError.message);
          // Continue anyway - some failures are okay (e.g., "already exists")
        }
      } else {
        console.log(`✅ Statement ${i + 1} succeeded`);
      }
    }

    console.log('\n🔍 Verifying new columns...');

    // Try to select from the new columns
    const { data: testData, error: verifyError } = await supabase
      .from('users')
      .select('secondary_sports, school_level, coach_name, coach_email, nil_goals, stats, bio')
      .limit(1);

    if (verifyError) {
      console.log('⚠️  Column verification result:', verifyError.message);
      if (verifyError.message.includes('column') && verifyError.message.includes('does not exist')) {
        console.log('❌ Migration may have failed - columns not found');
      }
    } else {
      console.log('✅ Migration successful! All columns are accessible:');
      console.log('  ✓ secondary_sports');
      console.log('  ✓ school_level');
      console.log('  ✓ coach_name');
      console.log('  ✓ coach_email');
      console.log('  ✓ nil_goals');
      console.log('  ✓ stats');
      console.log('  ✓ bio');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

runMigration();
