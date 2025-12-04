import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Load environment variables
const envOld = fs.readFileSync('.env.old', 'utf-8');
const oldVars: Record<string, string> = {};
envOld.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...values] = line.split('=');
    oldVars[key] = values.join('=');
  }
});

const envLocal = fs.readFileSync('.env.local', 'utf-8');
const newVars: Record<string, string> = {};
envLocal.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...values] = line.split('=');
    newVars[key] = values.join('=');
  }
});

const oldSupabase = createClient(
  oldVars.OLD_SUPABASE_URL,
  oldVars.OLD_SUPABASE_SERVICE_ROLE_KEY
);

const newSupabase = createClient(
  newVars.SUPABASE_URL,
  newVars.SUPABASE_SERVICE_ROLE_KEY
);

async function getTableSample(supabase: any, tableName: string) {
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return Object.keys(data[0]);
}

async function compareSchemas() {
  console.log('🔍 COMPARING DATABASE SCHEMAS\n');
  console.log('=' .repeat(80));

  const tablesToCompare = ['users', 'athlete_profiles'];

  for (const table of tablesToCompare) {
    console.log(`\n📊 TABLE: ${table}`);
    console.log('-'.repeat(80));

    const oldCols = await getTableSample(oldSupabase, table);
    const newCols = await getTableSample(newSupabase, table);

    if (!oldCols) {
      console.log(`❌ OLD: Table '${table}' not found or no data`);
    } else {
      console.log(`\n✅ OLD DATABASE (${oldCols.length} columns):`);
      oldCols.forEach((col: string) => {
        console.log(`   - ${col}`);
      });
    }

    if (!newCols) {
      console.log(`\n❌ NEW: Table '${table}' not found or no data`);
    } else {
      console.log(`\n✅ NEW DATABASE (${newCols.length} columns):`);
      newCols.forEach((col: string) => {
        console.log(`   - ${col}`);
      });
    }

    // Find differences
    if (oldCols && newCols) {
      const inOldOnly = oldCols.filter((c: string) => !newCols.includes(c));
      const inNewOnly = newCols.filter((c: string) => !oldCols.includes(c));

      if (inOldOnly.length > 0) {
        console.log(`\n⚠️  ONLY IN OLD DATABASE:`);
        inOldOnly.forEach(col => console.log(`   - ${col}`));
      }

      if (inNewOnly.length > 0) {
        console.log(`\n⚠️  ONLY IN NEW DATABASE:`);
        inNewOnly.forEach(col => console.log(`   - ${col}`));
      }

      if (inOldOnly.length === 0 && inNewOnly.length === 0) {
        console.log(`\n✅ SCHEMAS MATCH PERFECTLY`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n🔍 CHECKING SARAH\'S DATA IN OLD DATABASE...\n');

  // Check Sarah's data
  const { data: oldSarah, error: sarahError } = await oldSupabase
    .from('users')
    .select('*')
    .eq('email', 'sarah.johnson@test.com')
    .single();

  if (sarahError) {
    console.log('❌ Sarah not found in old database:', sarahError.message);
  } else {
    console.log('✅ Found Sarah in old database:');
    console.log(JSON.stringify(oldSarah, null, 2));

    // Check athlete profile
    const { data: oldProfile, error: profileError } = await oldSupabase
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', oldSarah.id)
      .single();

    if (profileError) {
      console.log('\n⚠️  No athlete profile found:', profileError.message);
    } else {
      console.log('\n✅ Found athlete profile:');
      console.log(JSON.stringify(oldProfile, null, 2));
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📋 MIGRATION PLAN:\n');
  console.log('If schemas match, the migration will:');
  console.log('1. Export Sarah\'s auth.users record (with password hash)');
  console.log('2. Export Sarah\'s public.users record');
  console.log('3. Export Sarah\'s athlete_profiles record');
  console.log('4. Import all records to new database');
  console.log('5. Verify migration succeeded');
  console.log('\n⚠️  If schemas DON\'T match, we\'ll need to:');
  console.log('1. Add missing columns to new database first');
  console.log('2. Then perform migration');
  console.log('\n✅ Ready to proceed? Review the output above.\n');
}

compareSchemas().catch(console.error);
