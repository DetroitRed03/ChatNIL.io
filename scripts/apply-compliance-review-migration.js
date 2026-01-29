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
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Parse URL
const url = new URL(SUPABASE_URL);

console.log('🚀 Applying compliance review migration...\n');

// Read migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/20250127000000_compliance_review_columns.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration file:', migrationPath);
console.log('─'.repeat(60));

// Execute SQL using Supabase RPC (exec_sql function with query parameter)
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
    console.log('\n📡 Response status:', res.statusCode);

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration executed successfully!');
      console.log('\n🔍 Response:', responseData || 'No response data');

      console.log('\n✅ Migration completed! The following changes have been made:');
      console.log('  ✓ nil_deals: compliance_decision, compliance_decision_at, compliance_decision_by');
      console.log('  ✓ nil_deals: athlete_notes, internal_notes');
      console.log('  ✓ compliance_scores: override_score, override_justification, override_by, override_at');
      console.log('  ✓ compliance_audit_log table created');
      console.log('\n🎉 Compliance officers can now review and approve deals!');
    } else {
      console.error('❌ Migration failed with status:', res.statusCode);
      console.error('Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(data);
req.end();
