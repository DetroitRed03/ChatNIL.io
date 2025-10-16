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

console.log('\n🔍 Checking Database Tables via REST API...\n');

const tablesToCheck = [
  'nil_deals',
  'agency_athlete_matches',
  'school_administrators',
  'school_account_batches',
  'compliance_consents'
];

let checkedCount = 0;
let foundTables = [];

function checkTable(tableName) {
  return new Promise((resolve) => {
    const url = new URL(SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: `/rest/v1/${tableName}?limit=1`,
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ ${tableName} - EXISTS`);
          foundTables.push(tableName);
          resolve(true);
        } else {
          console.log(`   ❌ ${tableName} - NOT FOUND (HTTP ${res.statusCode})`);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`   ❌ ${tableName} - ERROR: ${e.message}`);
      resolve(false);
    });

    req.end();
  });
}

async function checkAllTables() {
  console.log('Checking tables:\n');

  for (const table of tablesToCheck) {
    await checkTable(table);
  }

  console.log(`\n📊 Summary: ${foundTables.length}/${tablesToCheck.length} tables found\n`);

  if (foundTables.length === tablesToCheck.length) {
    console.log('✅ All required tables created successfully!\n');

    // Now check user_role enum
    console.log('🔍 Checking user_role enum...\n');

    const enumQuery = `
      SELECT enumlabel as role
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'user_role'
      ORDER BY e.enumsortorder;
    `;

    const url = new URL(SUPABASE_URL);
    const postData = JSON.stringify({ query: enumQuery });

    const options = {
      hostname: url.hostname,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (Array.isArray(result)) {
            console.log('User roles in database:');
            result.forEach(r => console.log(`   • ${r.role}`));

            const hasCoach = result.some(r => r.role === 'coach');
            const hasAgency = result.some(r => r.role === 'agency');

            if (hasCoach) {
              console.log('\n❌ Coach role still exists (should be removed)\n');
            } else {
              console.log('\n✅ Coach role successfully removed\n');
            }

            if (hasAgency) {
              console.log('✅ Agency role exists\n');
            } else {
              console.log('❌ Agency role missing (should exist)\n');
            }
          }
        } catch (e) {
          console.log('Note: Could not verify enum values');
        }

        console.log('\n🎉 Migration verification complete!\n');
      });
    });

    req.write(postData);
    req.end();
  } else {
    console.log('⚠️  Some tables are missing. Please review migration logs.\n');
    process.exit(1);
  }
}

checkAllTables();
