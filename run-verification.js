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

// Read verification query
const verifyPath = path.join(__dirname, 'migrations', 'verify-simple.sql');
const verifySQL = fs.readFileSync(verifyPath, 'utf-8');

console.log('\n🔍 Running Database Verification...\n');
console.log('─'.repeat(60));

const url = new URL(SUPABASE_URL);
const postData = JSON.stringify({ query: verifySQL });

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
    console.log('\n📊 Verification Results:\n');

    if (res.statusCode === 200 || res.statusCode === 201) {
      try {
        const jsonData = JSON.parse(data);

        if (Array.isArray(jsonData)) {
          // Parse verification results
          let allPassed = true;
          const checks = [];
          const details = [];

          jsonData.forEach(row => {
            if (row.check_name && row.passed !== null && row.passed !== undefined) {
              const icon = row.passed ? '✅' : '❌';
              const status = row.passed ? 'PASS' : 'FAIL';
              allPassed = allPassed && row.passed;

              checks.push({
                name: row.check_name,
                passed: row.passed,
                actual: row.actual_count,
                expected: row.expected_count
              });

              console.log(`${icon} ${status} - ${row.check_name}: ${row.actual_count}/${row.expected_count}`);
            } else if (row.section && row.section.includes('---')) {
              console.log(`\n${row.section}`);
            } else if (row.table_name || row.role) {
              const info = row.table_name
                ? `   • ${row.table_name}: ${row.index_count} indexes, RLS ${row.rls_status}`
                : `   • ${row.role}`;
              console.log(info);
            }
          });

          console.log('\n' + '─'.repeat(60));

          if (allPassed) {
            console.log('\n✅ ALL CHECKS PASSED!\n');
            console.log('🎉 Database migrations verified successfully!\n');
            console.log('📋 Summary:');
            checks.forEach(check => {
              console.log(`   ✓ ${check.name}`);
            });
            console.log('');
          } else {
            console.log('\n⚠️  SOME CHECKS FAILED\n');
            console.log('Please review the results above and fix any issues.\n');
            process.exit(1);
          }
        } else {
          console.log('Response:', JSON.stringify(jsonData, null, 2));
        }
      } catch (e) {
        console.log('Raw response:', data);
      }
    } else {
      console.log(`❌ Verification failed (HTTP ${res.statusCode})`);
      try {
        const errorData = JSON.parse(data);
        console.log('Error:', errorData.message || errorData.error);
      } catch (e) {
        console.log('Error:', data);
      }
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ Request failed: ${e.message}\n`);
  process.exit(1);
});

req.write(postData);
req.end();
