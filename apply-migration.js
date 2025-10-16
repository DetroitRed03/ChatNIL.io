#!/usr/bin/env node

/**
 * Apply Migration 016 to Supabase
 * Simple script using native Node.js - no dependencies needed
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read .env.local manually
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
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

console.log('');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║          Migration 016: Athlete Profile Enhancements          ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('📦 Project:', projectRef);
console.log('🔗 URL:', SUPABASE_URL);
console.log('');

// Read migration SQL
const migrationPath = path.join(__dirname, 'migrations', '016_athlete_enhancements.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

console.log('📄 Migration file:', path.basename(migrationPath));
console.log('📏 Size:', (migrationSQL.length / 1024).toFixed(2), 'KB');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('⚠️  IMPORTANT: Manual Migration Required');
console.log('');
console.log('Due to Supabase API limitations, please apply this migration manually:');
console.log('');
console.log('📝 Steps:');
console.log('');
console.log('  1. Open Supabase Dashboard:');
console.log(`     https://supabase.com/dashboard/project/${projectRef}`);
console.log('');
console.log('  2. Navigate to: SQL Editor (left sidebar)');
console.log('');
console.log('  3. Click: "+ New Query"');
console.log('');
console.log('  4. Copy migration file:');
console.log(`     ${migrationPath}`);
console.log('');
console.log('  5. Paste entire contents into SQL Editor');
console.log('');
console.log('  6. Click: "Run" (or press Cmd/Ctrl + Enter)');
console.log('');
console.log('  7. Wait for completion (~5-10 seconds)');
console.log('');
console.log('  8. Verify success message:');
console.log('     "SUCCESS: Migration 016 completed successfully!"');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('✨ What this migration adds:');
console.log('');
console.log('  Database Changes:');
console.log('    ✓ 13 new athlete profile columns');
console.log('    ✓ 12 performance indexes (GIN + B-tree)');
console.log('    ✓ 4 calculation functions');
console.log('    ✓ 1 auto-update trigger');
console.log('    ✓ 3 auto-calculated fields');
console.log('');
console.log('  New Features:');
console.log('    ✓ Social media stats tracking (8 platforms)');
console.log('    ✓ Interests & hobbies selection');
console.log('    ✓ NIL partnership preferences');
console.log('    ✓ Portfolio builder (content samples)');
console.log('    ✓ Profile completion scoring');
console.log('    ✓ Agency-athlete matchmaking');
console.log('');
console.log('  UI Components:');
console.log('    ✓ 4 new onboarding steps for athletes');
console.log('    ✓ Profile completion indicator');
console.log('    ✓ Matchmaking algorithm (7 factors)');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📋 After migration completes:');
console.log('');
console.log('  1. Refresh browser: http://localhost:3002');
console.log('  2. Sign up as athlete');
console.log('  3. Experience 8-step onboarding (4 new steps!)');
console.log('  4. Test new features:');
console.log('     - Social Media Stats');
console.log('     - Interests & Hobbies');
console.log('     - NIL Preferences');
console.log('     - Portfolio & Bio');
console.log('');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                    Ready to apply migration!                   ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

// Open migration file for easy copying
console.log('💡 Tip: Copy migration file to clipboard:');
console.log('');
if (process.platform === 'darwin') {
  console.log(`  cat migrations/016_athlete_enhancements.sql | pbcopy`);
} else if (process.platform === 'linux') {
  console.log(`  cat migrations/016_athlete_enhancements.sql | xclip -selection clipboard`);
} else {
  console.log(`  Open migrations/016_athlete_enhancements.sql and copy manually`);
}
console.log('');
