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
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const SUPABASE_URL = envVars.SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

// Read FIXED migration
const migrationPath = path.join(__dirname, 'migrations', '016_athlete_enhancements_fixed.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

console.log('\n🔧 Applying FIXED Migration 016...\n');

const url = new URL(SUPABASE_URL);
const postData = JSON.stringify({ query: migrationSQL });

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
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);

    try {
      const jsonData = JSON.parse(data);

      if (jsonData.success === false) {
        console.log('\n❌ Error:', jsonData.error);
        console.log('Detail:', jsonData.detail);
      } else if (data.includes('Migration 016 completed successfully')) {
        console.log('\n✅ SUCCESS! Migration 016 applied successfully!');
        console.log('\n🎉 Database updated with:');
        console.log('   ✓ 13 new athlete profile columns');
        console.log('   ✓ 12 performance indexes');
        console.log('   ✓ 4 calculation functions');
        console.log('   ✓ 1 auto-update trigger');
        console.log('\n🚀 Test now:');
        console.log('   → Open: http://localhost:3002');
        console.log('   → Sign up as athlete');
        console.log('   → Experience 8-step onboarding!');
        console.log('\n');
      } else {
        console.log('\nResponse:', data);
      }
    } catch (e) {
      if (data.includes('Migration 016 completed successfully')) {
        console.log('\n✅ SUCCESS! Migration applied!');
        console.log('\n🧪 Ready to test at http://localhost:3002');
      } else {
        console.log('\nResponse:', data);
      }
    }
  });
});

req.on('error', (e) => {
  console.error('\n❌ Request failed:', e.message);
});

req.write(postData);
req.end();
