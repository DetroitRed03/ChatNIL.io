#!/usr/bin/env node
/**
 * Helper script to update Supabase configuration
 * Usage: node scripts/update-supabase-config.js <url> <anon_key> <service_key>
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');

function updateEnvironmentFile(url, anonKey, serviceKey) {
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${anonKey}
SUPABASE_URL=${url}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development Mode (set to "mock" to use mock authentication, "real" for actual database)
NEXT_PUBLIC_DEV_MODE=real
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file updated successfully!');
  console.log('🚀 Supabase URL:', url);
  console.log('🔑 Keys configured');
  console.log('📋 Dev mode set to: real');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart your dev server (npm run dev)');
  console.log('2. Check console for "🚀 Using real Supabase client"');
  console.log('3. Test authentication flow');
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 3) {
  console.log('Usage: node scripts/update-supabase-config.js <url> <anon_key> <service_key>');
  console.log('');
  console.log('Example:');
  console.log('node scripts/update-supabase-config.js \\');
  console.log('  "https://abcdefgh.supabase.co" \\');
  console.log('  "eyJ..." \\');
  console.log('  "eyJ..."');
  process.exit(1);
}

const [url, anonKey, serviceKey] = args;

// Validate inputs
if (!url.includes('supabase.co')) {
  console.error('❌ Invalid URL format. Should be like: https://project-id.supabase.co');
  process.exit(1);
}

if (!anonKey.startsWith('eyJ') || !serviceKey.startsWith('eyJ')) {
  console.error('❌ Invalid API key format. Keys should start with "eyJ"');
  process.exit(1);
}

updateEnvironmentFile(url, anonKey, serviceKey);