#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.+)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Parse URL
const url = new URL(SUPABASE_URL);
const projectRef = url.hostname.split('.')[0];

console.log('🚀 Starting database migration...\n');

// Read migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/013_add_missing_athlete_fields.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration SQL:');
console.log('─'.repeat(60));
console.log(sql);
console.log('─'.repeat(60));
console.log('');

// Execute SQL using Supabase Management API
const options = {
  hostname: url.hostname,
  path: '/rest/v1/rpc/exec',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Prefer': 'return=representation'
  }
};

const data = JSON.stringify({ sql });

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\n📡 Response status:', res.statusCode);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration executed successfully!');
      console.log('\n🔍 Response:', responseData || 'No response data');

      console.log('\n✅ Migration completed! The following columns have been added:');
      console.log('  ✓ secondary_sports');
      console.log('  ✓ school_level');
      console.log('  ✓ coach_name');
      console.log('  ✓ coach_email');
      console.log('  ✓ nil_goals');
      console.log('  ✓ stats');
      console.log('  ✓ bio');
      console.log('\n🎉 Your onboarding data will now save properly to the database!');
    } else {
      console.error('❌ Migration failed with status:', res.statusCode);
      console.error('Response:', responseData);

      // Try alternative approach - execute via SQL editor URL
      console.log('\n⚠️  Automatic migration failed. Please run the migration manually:');
      console.log('\n📋 Steps:');
      console.log('1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
      console.log('2. Copy and paste the SQL from: supabase/migrations/013_add_missing_athlete_fields.sql');
      console.log('3. Click "Run"');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
  console.log('\n⚠️  Please run the migration manually in Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
});

req.write(data);
req.end();
