#!/usr/bin/env node

/**
 * Apply parent dashboard redesign migration to Supabase
 * Run with: node scripts/apply-parent-dashboard-migration.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
let env = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.+)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
} catch (err) {
  console.error('Could not read .env.local file');
  process.exit(1);
}

const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  console.error('Required: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Parse URL
const url = new URL(SUPABASE_URL);
const projectRef = url.hostname.split('.')[0];

console.log('Starting parent dashboard redesign migration...\n');

// Read migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/025_parent_dashboard_redesign.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('Migration file:', migrationPath);
console.log('-'.repeat(60));

// Execute SQL using Supabase REST API
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
      console.log('\nThe following changes have been made:');
      console.log('  - Added full_name column to users table');
      console.log('  - Updated existing users to have full_name');
      console.log('  - Created coparent_invites table');
      console.log('  - Created parent_notification_preferences table');
      console.log('  - Created parent_action_items table');
      console.log('  - Created child_activity_log table');
      console.log('  - Added necessary indexes');
      console.log('\nParent dashboard V2 is now ready to use!');
    } else {
      console.error('Migration failed with status:', res.statusCode);
      console.error('Response:', responseData);

      // Provide manual instructions
      console.log('\n--- Manual Migration Required ---');
      console.log('The automatic migration failed. Please run it manually:');
      console.log('\n1. Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
      console.log('2. Copy and paste the SQL from: supabase/migrations/025_parent_dashboard_redesign.sql');
      console.log('3. Click "Run"');
    }
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e.message);
  console.log('\n--- Manual Migration Required ---');
  console.log('Please run the migration manually in Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
});

req.write(data);
req.end();
