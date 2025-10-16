import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing credentials');
  process.exit(1);
}

console.log('🚀 Running migration...\n');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Read migration
const migrationPath = path.join(__dirname, '../supabase/migrations/013_add_missing_athlete_fields.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration SQL:');
console.log('─'.repeat(60));
console.log(sql);
console.log('─'.repeat(60));
console.log('');

// Execute ALTER TABLE directly
console.log('⏳ Adding columns to users table...\n');

const alterTableSQL = `
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS secondary_sports TEXT[],
  ADD COLUMN IF NOT EXISTS school_level VARCHAR(50),
  ADD COLUMN IF NOT EXISTS coach_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS coach_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nil_goals TEXT[],
  ADD COLUMN IF NOT EXISTS stats JSONB,
  ADD COLUMN IF NOT EXISTS bio TEXT;
`;

// Try using query parameter
const { data, error } = await supabase.rpc('exec', { query: alterTableSQL });

if (error) {
  console.error('❌ RPC error:', error.message);
  console.log('\n⚠️  Automatic migration is not possible via API.');
  console.log('\n📋 Please run manually in Supabase SQL Editor:');
  console.log('URL: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb/sql/new');
  console.log('\nCopy this SQL:\n');
  console.log(sql);
  process.exit(1);
}

console.log('✅ Migration executed!');

// Verify
const { data: verifyData, error: verifyError } = await supabase
  .from('users')
  .select('secondary_sports, school_level, coach_name')
  .limit(1);

if (verifyError) {
  console.log('⚠️  Verification:', verifyError.message);
} else {
  console.log('✅ Columns verified successfully!');
}
