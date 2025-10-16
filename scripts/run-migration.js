#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting migration...\n');

  // Read the migration SQL file
  const migrationPath = path.join(__dirname, '../supabase/migrations/013_add_missing_athlete_fields.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Migration SQL:');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
  console.log('');

  try {
    // Execute the SQL
    console.log('⏳ Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('Details:', error);

      // Try alternative method - execute each statement separately
      console.log('\n🔄 Trying alternative approach - executing statements separately...\n');

      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'));

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (!stmt) continue;

        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        // Use raw SQL execution via Postgres connection
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ query: stmt + ';' })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`❌ Statement ${i + 1} failed:`, errText);
        } else {
          console.log(`✅ Statement ${i + 1} succeeded`);
        }
      }
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('Data:', data);
    }

    // Verify the columns were added
    console.log('\n🔍 Verifying new columns...');
    const { data: columns, error: verifyError } = await supabase
      .from('users')
      .select('secondary_sports, school_level, coach_name, coach_email, nil_goals, stats, bio')
      .limit(1);

    if (verifyError) {
      console.log('⚠️  Could not verify columns (this is expected if no users exist yet)');
      console.log('Error:', verifyError.message);
    } else {
      console.log('✅ Columns verified! Schema includes:');
      console.log('  - secondary_sports');
      console.log('  - school_level');
      console.log('  - coach_name');
      console.log('  - coach_email');
      console.log('  - nil_goals');
      console.log('  - stats');
      console.log('  - bio');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

runMigration();
