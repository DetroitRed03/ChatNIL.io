#!/usr/bin/env tsx
/**
 * Universal Migration Runner for ChatNIL
 *
 * Usage:
 *   npx tsx scripts/run-migration.ts <migration-file>
 *   npx tsx scripts/run-migration.ts migrations/031_add_username_to_users.sql
 *
 * This script:
 * 1. Reads any SQL file
 * 2. Executes it against your Supabase database
 * 3. Handles errors gracefully
 * 4. Works with the current database credentials
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Get migration file from command line
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: npx tsx scripts/run-migration.ts <migration-file>');
  console.error('   Example: npx tsx scripts/run-migration.ts migrations/031_add_username_to_users.sql');
  process.exit(1);
}

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('   Make sure .env.local exists with these values.');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  // Resolve file path
  const filePath = join(process.cwd(), migrationFile);

  if (!existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${filePath}`);
    process.exit(1);
  }

  console.log('🚀 ChatNIL Migration Runner');
  console.log('═'.repeat(80));
  console.log(`📂 File: ${migrationFile}`);
  console.log(`🌐 Database: ${SUPABASE_URL}`);
  console.log('═'.repeat(80));
  console.log('');

  try {
    // Read SQL file
    console.log('📖 Reading migration file...');
    const sql = readFileSync(filePath, 'utf-8');
    console.log(`   ✅ Loaded ${sql.length} characters`);
    console.log('');

    // Execute SQL
    console.log('⚡ Executing migration...');
    console.log('');

    // Split into statements (basic split on semicolons)
    // Remove comments but keep the SQL
    const statements = sql
      .split(';')
      .map(s => {
        // Remove single-line comments but keep the SQL
        return s.split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim();
      })
      .filter(s => s.length > 0);

    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 80).replace(/\s+/g, ' ');

      console.log(`   [${i + 1}/${statements.length}] ${preview}...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query: statement
        });

        if (error) {
          // Check if it's a "already exists" error - these are safe to skip
          const errorMessage = error.message || JSON.stringify(error);

          if (
            errorMessage.includes('already exists') ||
            errorMessage.includes('duplicate') ||
            error.code === '42P07' || // duplicate table
            error.code === '42710' || // duplicate object
            error.code === '42723' || // duplicate function
            error.code === '42P16'    // invalid table definition
          ) {
            console.log(`        ⚠️  Already exists (skipping)`);
            skipCount++;
            continue;
          }

          // Real error
          throw error;
        }

        console.log(`        ✅ Success`);
        successCount++;

      } catch (stmtError: any) {
        console.error(`        ❌ Error:`, stmtError.message || stmtError);

        // If exec_sql doesn't exist, provide helpful message
        if (stmtError.message?.includes('exec_sql')) {
          console.log('');
          console.log('⚠️  The exec_sql function does not exist.');
          console.log('   This function is needed to run migrations.');
          console.log('');
          console.log('   Run this first:');
          console.log('   npx tsx scripts/setup-exec-sql.ts');
          console.log('');
          process.exit(1);
        }

        throw stmtError;
      }
    }

    console.log('');
    console.log('═'.repeat(80));
    console.log('📊 MIGRATION SUMMARY');
    console.log('═'.repeat(80));
    console.log(`✅ Executed: ${successCount} statements`);
    if (skipCount > 0) {
      console.log(`⚠️  Skipped: ${skipCount} statements (already exist)`);
    }
    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('');

  } catch (error: any) {
    console.log('');
    console.log('═'.repeat(80));
    console.log('❌ MIGRATION FAILED');
    console.log('═'.repeat(80));
    console.log('');
    console.error('Error:', error.message || error);
    console.log('');
    console.log('💡 Tips:');
    console.log('   - Check if the SQL syntax is valid');
    console.log('   - Verify database permissions');
    console.log('   - Look for dependency issues (missing tables/functions)');
    console.log('');
    process.exit(1);
  }
}

runMigration();
