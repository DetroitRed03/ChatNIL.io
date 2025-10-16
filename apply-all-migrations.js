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

// Define migrations to apply
const migrations = [
  {
    number: '017',
    file: '017_remove_coach_role_fixed.sql',
    name: 'Remove Coach Role'
  },
  {
    number: '018',
    file: '018_nil_deals.sql',
    name: 'NIL Deals Table'
  },
  {
    number: '019',
    file: '019_agency_athlete_matches.sql',
    name: 'Agency-Athlete Matches Table'
  },
  {
    number: '020',
    file: '020_school_compliance.sql',
    name: 'School Compliance Tables'
  },
  {
    number: '021',
    file: '021_rls_policies.sql',
    name: 'RLS Policies for New Tables'
  }
];

console.log('\n🚀 ChatNIL Database Migration Runner\n');
console.log(`📋 Applying ${migrations.length} migrations...\n`);
console.log('─'.repeat(60));

// Function to apply a single migration
async function applyMigration(migration) {
  return new Promise((resolve, reject) => {
    const migrationPath = path.join(__dirname, 'migrations', migration.file);

    if (!fs.existsSync(migrationPath)) {
      reject(new Error(`Migration file not found: ${migration.file}`));
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log(`\n🔧 Migration ${migration.number}: ${migration.name}`);
    console.log(`   File: ${migration.file}`);
    console.log(`   Status: Running...`);

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
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`   ✅ SUCCESS (HTTP ${res.statusCode})`);

          try {
            const jsonData = JSON.parse(data);
            if (jsonData.error) {
              console.log(`   ⚠️  Warning: ${jsonData.error}`);
            }
          } catch (e) {
            // Response might not be JSON
          }

          resolve({ success: true, migration });
        } else {
          console.log(`   ❌ FAILED (HTTP ${res.statusCode})`);
          try {
            const errorData = JSON.parse(data);
            console.log(`   Error: ${errorData.message || errorData.error || data}`);
            reject({ success: false, migration, error: errorData });
          } catch (e) {
            console.log(`   Error: ${data}`);
            reject({ success: false, migration, error: data });
          }
        }
      });
    });

    req.on('error', (e) => {
      console.log(`   ❌ Request failed: ${e.message}`);
      reject({ success: false, migration, error: e.message });
    });

    req.write(postData);
    req.end();
  });
}

// Run migrations sequentially
async function runMigrations() {
  const results = [];

  for (const migration of migrations) {
    try {
      const result = await applyMigration(migration);
      results.push(result);
    } catch (error) {
      results.push(error);

      // Ask if we should continue or stop
      console.log(`\n⚠️  Migration ${migration.number} failed. Stopping migration process.`);
      break;
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(60));
  console.log('\n📊 Migration Summary:\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const status = result.success ? 'SUCCESS' : 'FAILED';
    console.log(`   ${icon} Migration ${result.migration.number}: ${status}`);
  });

  console.log(`\n   Total: ${successful} successful, ${failed} failed`);

  if (failed === 0) {
    console.log('\n🎉 All migrations completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run verification: node run-verification.js');
    console.log('   2. Test the application');
    console.log('   3. Commit changes to git\n');
  } else {
    console.log('\n⚠️  Some migrations failed. Please review errors above.\n');
    process.exit(1);
  }
}

// Start migration process
runMigrations().catch(error => {
  console.error('\n❌ Migration process failed:', error);
  process.exit(1);
});
