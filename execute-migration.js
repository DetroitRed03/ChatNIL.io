#!/usr/bin/env node

/**
 * Execute Migration 016 via Supabase REST API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const SUPABASE_URL = envVars.SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Read migration SQL
const migrationPath = path.join(__dirname, 'migrations', '016_athlete_enhancements.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

console.log('🚀 Executing Migration 016...\n');

// Parse Supabase URL
const url = new URL(SUPABASE_URL);

// Prepare request to execute SQL via Supabase's management API
const postData = JSON.stringify({
  query: migrationSQL
});

const options = {
  hostname: url.hostname,
  path: '/rest/v1/rpc/exec',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration executed successfully!\n');
      console.log('Response:', data);
      console.log('\n🎉 Migration 016 completed!');
      console.log('\nNext: Refresh http://localhost:3002 and test athlete onboarding');
    } else {
      console.error('❌ Migration failed');
      console.error('Status:', res.statusCode);
      console.error('Response:', data);
      console.log('\n📝 Please apply manually via Supabase Dashboard');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
  console.log('\n📝 Please apply migration manually:');
  console.log('1. Open: https://supabase.com/dashboard');
  console.log('2. SQL Editor → New Query');
  console.log('3. Paste migration SQL (already in clipboard)');
  console.log('4. Run the query');
});

req.write(postData);
req.end();
