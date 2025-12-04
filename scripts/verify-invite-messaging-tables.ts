/**
 * Verify Invite & Messaging Tables
 * =================================
 * This script verifies that all required tables for the invite and messaging
 * system exist in the database.
 *
 * Run: SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/verify-invite-messaging-tables.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TableCheck {
  name: string;
  description: string;
  migration: string;
}

const requiredTables: TableCheck[] = [
  {
    name: 'campaign_athletes',
    description: 'Stores athlete invitations to campaigns',
    migration: 'migration 100',
  },
  {
    name: 'agency_message_threads',
    description: 'Stores message threads between agencies and athletes',
    migration: 'migration 110',
  },
  {
    name: 'agency_athlete_messages',
    description: 'Stores individual messages in threads',
    migration: 'migration 040',
  },
  {
    name: 'campaigns',
    description: 'Stores campaign data',
    migration: 'migration 100',
  },
  {
    name: 'agencies',
    description: 'Stores agency profile data',
    migration: 'migration 040',
  },
];

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      // PGRST116 = "The result contains 0 rows" - table exists but empty
      if (error.code === 'PGRST116') {
        return true;
      }
      // 42P01 = "undefined_table" - table doesn't exist
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return false;
      }
      console.error(`Error checking ${tableName}:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`Exception checking ${tableName}:`, e);
    return false;
  }
}

async function getTableRowCount(tableName: string): Promise<number | null> {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) return null;
    return count ?? 0;
  } catch (e) {
    return null;
  }
}

async function main() {
  console.log('=== Invite & Messaging Tables Verification ===\n');
  console.log('Checking required database tables...\n');

  let allTablesExist = true;
  const results: { table: string; exists: boolean; count: number | null; migration: string }[] = [];

  for (const table of requiredTables) {
    const exists = await checkTableExists(table.name);
    const count = exists ? await getTableRowCount(table.name) : null;

    results.push({
      table: table.name,
      exists,
      count,
      migration: table.migration,
    });

    if (!exists) {
      allTablesExist = false;
    }
  }

  // Print results
  console.log('Results:');
  console.log('─'.repeat(70));
  console.log(`${'Table'.padEnd(25)} | ${'Status'.padEnd(10)} | ${'Rows'.padEnd(10)} | Migration`);
  console.log('─'.repeat(70));

  for (const result of results) {
    const status = result.exists ? '✅ EXISTS' : '❌ MISSING';
    const rows = result.count !== null ? result.count.toString() : 'N/A';
    console.log(`${result.table.padEnd(25)} | ${status.padEnd(10)} | ${rows.padEnd(10)} | ${result.migration}`);
  }

  console.log('─'.repeat(70));
  console.log();

  if (allTablesExist) {
    console.log('✅ All required tables exist!\n');
    console.log('If invites are still failing, check:');
    console.log('  1. RLS policies on campaign_athletes table');
    console.log('  2. Foreign key constraints (campaign_id, athlete_id must reference existing records)');
    console.log('  3. User authentication is working properly');
  } else {
    console.log('❌ Some tables are missing!\n');
    console.log('Run the following migrations to create missing tables:');
    const missingMigrations = new Set(
      results.filter(r => !r.exists).map(r => r.migration)
    );
    for (const migration of missingMigrations) {
      console.log(`  - ${migration}`);
    }
    console.log('\nUse the Supabase SQL editor or migration scripts to apply them.');
  }

  console.log('\n=== Verification Complete ===');
}

main().catch(console.error);
