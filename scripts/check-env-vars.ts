#!/usr/bin/env tsx
/**
 * Check if environment variables are set correctly
 */

console.log('🔍 Environment Variables Check\n');
console.log('═'.repeat(80));

const vars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
};

for (const [key, value] of Object.entries(vars)) {
  if (value) {
    const display = value.length > 50 ? `${value.substring(0, 50)}...` : value;
    console.log(`✅ ${key}: ${display}`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
}

console.log('\n' + '═'.repeat(80));

// Check if the anon key is valid format
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (anonKey) {
  const parts = anonKey.split('.');
  if (parts.length === 3) {
    console.log('✅ Anon key format looks valid (JWT with 3 parts)');
  } else {
    console.log('⚠️  Anon key format looks wrong (should be JWT with 3 parts)');
  }
}
