/**
 * Apply Migration 031: Create deal_analyses table
 * Run with: npx tsx scripts/apply-migration-031.ts
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function execSQL(sql: string, label: string) {
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error(`  ❌ ${label} failed:`, error.message);
    return false;
  }
  console.log(`  ✅ ${label}`);
  return true;
}

async function applyMigration() {
  console.log('🔧 Applying migration 031: deal_analyses table...\n');

  const sqlFile = fs.readFileSync(
    path.join(__dirname, '../supabase/migrations/031_deal_analyses.sql'),
    'utf-8'
  );

  // Split by semicolons but handle DO $$ blocks
  const statements: string[] = [];
  let current = '';
  let inDollarBlock = false;

  for (const line of sqlFile.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('--')) {
      continue;
    }

    current += line + '\n';

    if (trimmed.includes('DO $$') || trimmed.includes('DO $$ BEGIN')) {
      inDollarBlock = true;
    }
    if (inDollarBlock && trimmed.includes('END $$;')) {
      inDollarBlock = false;
      statements.push(current.trim());
      current = '';
      continue;
    }

    if (!inDollarBlock && trimmed.endsWith(';') && current.trim()) {
      statements.push(current.trim());
      current = '';
    }
  }

  if (current.trim()) statements.push(current.trim());

  let success = 0;
  let failed = 0;

  for (const stmt of statements) {
    if (!stmt || stmt.length < 5) continue;
    const label = stmt.substring(0, 60).replace(/\n/g, ' ') + '...';
    const ok = await execSQL(stmt, label);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n📊 Results: ${success} succeeded, ${failed} failed`);

  // Verify table exists
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'deal_analyses' ORDER BY ordinal_position;`
  });

  if (error) {
    console.error('❌ Verification failed:', error.message);
  } else {
    console.log('\n✅ deal_analyses table verified!');
  }
}

applyMigration();
