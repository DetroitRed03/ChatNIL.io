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

// Simple query to check tables
const query = `
SELECT
  tablename,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count,
  CASE WHEN rowsecurity THEN 'Enabled' ELSE 'Disabled' END as rls_status
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('nil_deals', 'agency_athlete_matches', 'school_administrators', 'school_account_batches', 'compliance_consents')
ORDER BY tablename;
`;

console.log('\n🔍 Checking Database Tables...\n');

const url = new URL(SUPABASE_URL);
const postData = JSON.stringify({ query });

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
    try {
      const jsonData = JSON.parse(data);

      if (Array.isArray(jsonData) && jsonData.length > 0) {
        console.log('✅ Tables Found:\n');
        jsonData.forEach(row => {
          console.log(`   • ${row.tablename}`);
          console.log(`     - Indexes: ${row.index_count}`);
          console.log(`     - RLS: ${row.rls_status}\n`);
        });

        console.log(`📊 Total tables: ${jsonData.length}/5`);

        if (jsonData.length === 5) {
          console.log('\n✅ All 5 tables created successfully!\n');
        } else {
          console.log('\n⚠️  Expected 5 tables, found ' + jsonData.length + '\n');
        }
      } else {
        console.log('Response:', JSON.stringify(jsonData, null, 2));
      }
    } catch (e) {
      console.log('Error parsing response:', e.message);
      console.log('Raw data:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(postData);
req.end();
