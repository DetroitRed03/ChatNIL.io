#!/usr/bin/env node

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

// Read migration SQL
const migrationPath = path.join(__dirname, 'migrations', '016_athlete_enhancements.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

console.log('🚀 Attempting Migration 016 via Supabase API...\n');

const url = new URL(SUPABASE_URL);

// Try using exec_sql function
const postData = JSON.stringify({
  query: migrationSQL
});

const options = {
  hostname: url.hostname,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Length': Buffer.byteLength(postData),
    'Prefer': 'return=representation'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
    console.log('');

    if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
      console.log('✅ Migration executed successfully!');
      console.log('\n🎉 Migration 016 completed!');
      console.log('\nNext steps:');
      console.log('1. Refresh http://localhost:3002');
      console.log('2. Sign up as athlete');
      console.log('3. Complete 8-step onboarding');
    } else {
      console.log('⚠️  API method unavailable. Manual application required.\n');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📝 MANUAL MIGRATION STEPS:');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('1. Open: https://supabase.com/dashboard/project/enbuwffusjhpcyoveewb');
      console.log('');
      console.log('2. Click: SQL Editor (left sidebar)');
      console.log('');
      console.log('3. Click: "+ New Query"');
      console.log('');
      console.log('4. Run this command to copy SQL:');
      console.log('   cat migrations/016_athlete_enhancements.sql | pbcopy');
      console.log('');
      console.log('5. Paste (Cmd+V) in SQL Editor');
      console.log('');
      console.log('6. Click: "Run" button');
      console.log('');
      console.log('7. Wait for success message:');
      console.log('   "SUCCESS: Migration 016 completed successfully!"');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════\n');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
  console.log('\nPlease apply migration manually via Supabase Dashboard.');
});

req.write(postData);
req.end();
