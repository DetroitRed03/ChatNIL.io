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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Parse URL
const url = new URL(SUPABASE_URL);

console.log('Applying compliance workflow migration...\n');

// Read migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/20250128000000_compliance_workflow.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('Migration file:', migrationPath);
console.log('-'.repeat(60));

// Execute SQL using Supabase RPC
const options = {
  hostname: url.hostname,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Prefer': 'return=representation'
  }
};

const data = JSON.stringify({ query: sql });

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse status:', res.statusCode);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('Migration executed successfully!');
      console.log('\nChanges made:');
      console.log('  + nil_deals: athlete_notified_at, athlete_viewed_decision_at');
      console.log('  + nil_deals: has_active_appeal, appeal_count, last_appeal_at');
      console.log('  + nil_deal_appeals table created');
      console.log('  + compliance_info_requests table created');
      console.log('  + RLS policies added');
      console.log('  + Trigger for appeal tracking');
      console.log('\nCompliance workflow database ready!');
    } else {
      console.error('Migration failed with status:', res.statusCode);
      console.error('Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e.message);
});

req.write(data);
req.end();
