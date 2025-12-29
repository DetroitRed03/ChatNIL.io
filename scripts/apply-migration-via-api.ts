/**
 * Apply Migration via Supabase Management API
 *
 * This script applies the migration using Supabase's SQL execution endpoint.
 */

import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_PROJECT_REF = 'lqskiijspudfocddhkqs';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function applyMigration() {
  console.log('🚀 Applying Migration 017: Document Analysis System\n');

  // Read migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/017_document_analysis.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split into statements and execute one by one
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements\n`);

  // For now, output instructions since we need the dashboard
  console.log('📋 Please apply the following SQL in Supabase Dashboard > SQL Editor:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF + '/sql/new');
  console.log('2. Paste the contents of: supabase/migrations/017_document_analysis.sql');
  console.log('3. Click "Run"\n');

  console.log('Or copy this SQL:\n');
  console.log('--- START SQL ---');
  console.log(migrationSQL);
  console.log('--- END SQL ---');
}

applyMigration();
