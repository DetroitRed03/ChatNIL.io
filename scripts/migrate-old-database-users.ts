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

interface MigrationStats {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ email: string; error: string; }>;
}

async function migrateUsers(dryRun: boolean = false, limit?: number) {
  console.log('🚀 ChatNIL Database User Migration');
  console.log('═'.repeat(80));
  console.log(`\n🔧 Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE MIGRATION'}`);
  console.log(`📊 Old Database: ${oldVars.OLD_SUPABASE_URL}`);
  console.log(`📊 New Database: ${newVars.SUPABASE_URL}\n`);

  const stats: MigrationStats = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  // Step 1: Fetch all athlete users from old database
  console.log('📊 STEP 1: Fetching users from old database...\n');

  let query = oldSupabase
    .from('users')
    .select('*')
    .eq('role', 'athlete');

  if (limit) {
    query = query.limit(limit);
  }

  const { data: oldUsers, error: fetchError } = await query;

  if (fetchError) {
    console.error('❌ Error fetching users:', fetchError);
    return;
  }

  if (!oldUsers || oldUsers.length === 0) {
    console.log('⚠️  No users found in old database!');
    return;
  }

  stats.total = oldUsers.length;
  console.log(`✅ Found ${oldUsers.length} athlete accounts to migrate\n`);

  // Show sample data
  console.log('📋 Sample user data (first user):');
  console.log('─'.repeat(80));
  const sample = oldUsers[0];
  console.log(`Email: ${sample.email}`);
  console.log(`Name: ${sample.full_name || `${sample.first_name} ${sample.last_name}`}`);
  console.log(`Username: ${sample.username}`);
  console.log(`Sport: ${sample.primary_sport} - ${sample.position}`);
  console.log(`School: ${sample.school_name}`);
  console.log(`Social Followers: ${sample.total_followers?.toLocaleString() || 0}`);
  console.log(`Profile Score: ${sample.profile_completion_score || 0}/100 (${sample.profile_completion_tier || 'bronze'})`);
  console.log('─'.repeat(80));
  console.log('');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - Here\'s what would be migrated:\n');
    oldUsers.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email} - ${user.full_name} (${user.primary_sport})`);
    });
    console.log(`\n✅ DRY RUN COMPLETE - ${oldUsers.length} users ready to migrate`);
    return stats;
  }

  // Step 2: Confirm migration
  console.log('⚠️  WARNING: This will create/update users in the NEW database!');
  console.log('   Press Ctrl+C now to cancel...\n');
  console.log('   Starting migration in 3 seconds...\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Step 3: Migrate each user
  console.log('📊 STEP 2: Migrating users...\n');
  console.log('═'.repeat(80));

  for (let i = 0; i < oldUsers.length; i++) {
    const user = oldUsers[i];
    const progress = `[${i + 1}/${oldUsers.length}]`;

    try {
      console.log(`\n${progress} 🔄 Migrating: ${user.email}`);
      console.log(`         Name: ${user.full_name || `${user.first_name} ${user.last_name}`}`);
      console.log(`         Sport: ${user.primary_sport} - ${user.position}`);

      // Check if user already exists in new database
      const { data: existingAuth } = await newSupabase.auth.admin.listUsers();
      const userExists = existingAuth?.users?.find(u => u.email === user.email);

      let userId = user.id;

      if (!userExists) {
        console.log(`         → Creating auth user...`);

        // Generate a secure temporary password
        const tempPassword = `ChatNIL2025!${user.id.slice(0, 8)}`;

        const { data: authData, error: authError } = await newSupabase.auth.admin.createUser({
          email: user.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: user.full_name || `${user.first_name} ${user.last_name}`,
            username: user.username,
            migrated_from_old_db: true,
            migration_date: new Date().toISOString(),
            original_user_id: user.id
          }
        });

        if (authError) {
          throw new Error(`Auth creation failed: ${authError.message}`);
        }

        userId = authData.user.id;
        console.log(`         ✅ Auth user created (ID: ${userId.slice(0, 8)}...)`);
      } else {
        userId = userExists.id;
        console.log(`         ⏭️  Auth user already exists (ID: ${userId.slice(0, 8)}...)`);
      }

      // Call migration function with updated user_id
      const userData = {
        ...user,
        id: userId  // Use the auth user ID (new or existing)
      };

      console.log(`         → Migrating profile data...`);

      const { data: migrateResult, error: migrateError } = await newSupabase
        .rpc('migrate_user_from_old_db', {
          p_user_data: userData
        });

      if (migrateError) {
        throw new Error(`Profile migration failed: ${migrateError.message}`);
      }

      console.log(`         ✅ Profile data migrated successfully`);

      // Verify the migration
      const { data: verifyProfile } = await newSupabase
        .from('athlete_profiles')
        .select('id, username, sport, profile_completion_score')
        .eq('user_id', userId)
        .single();

      if (verifyProfile) {
        console.log(`         ✅ Verified: ${verifyProfile.sport} profile (Score: ${verifyProfile.profile_completion_score})`);
      }

      stats.success++;
      console.log(`${progress} ✅ SUCCESS - ${user.email} migrated`);

    } catch (err: any) {
      stats.failed++;
      const errorMsg = err.message || String(err);
      console.error(`${progress} ❌ FAILED - ${user.email}`);
      console.error(`         Error: ${errorMsg}`);
      stats.errors.push({
        email: user.email,
        error: errorMsg
      });
    }
  }

  // Step 4: Summary
  console.log('\n' + '═'.repeat(80));
  console.log('\n📈 MIGRATION SUMMARY\n');
  console.log(`📊 Total Users: ${stats.total}`);
  console.log(`✅ Successfully Migrated: ${stats.success}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);

  if (stats.errors.length > 0) {
    console.log('\n⚠️  ERRORS:\n');
    stats.errors.forEach((e, idx) => {
      console.log(`${idx + 1}. ${e.email}`);
      console.log(`   ${e.error}\n`);
    });
  }

  console.log('\n' + '═'.repeat(80));

  if (stats.success > 0) {
    console.log('\n✅ MIGRATION COMPLETE!');
    console.log('\n📋 NEXT STEPS:\n');
    console.log('1. Verify migrated data in Supabase dashboard');
    console.log('2. Run validation script: npm run validate-migration');
    console.log('3. Test login with migrated accounts');
    console.log('4. Send password reset emails to users:');
    console.log('   → Go to Supabase Auth > Users');
    console.log('   → Select users and send reset emails');
    console.log('5. Test profile editing functionality');
    console.log('6. Verify agency features still work\n');
  }

  return stats;
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-d');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
ChatNIL Database Migration Script

Usage:
  npx tsx scripts/migrate-old-database-users.ts [options]

Options:
  --dry-run, -d     Run in dry-run mode (no changes made)
  --limit=N         Limit migration to first N users
  --help, -h        Show this help message

Examples:
  npx tsx scripts/migrate-old-database-users.ts --dry-run
  npx tsx scripts/migrate-old-database-users.ts --limit=10
  npx tsx scripts/migrate-old-database-users.ts

IMPORTANT:
  - Make sure migration/200_merge_old_database_schema.sql has been applied first!
  - Backup your database before running live migration
  - Test with --limit=1 first
`);
  process.exit(0);
}

// Run migration
migrateUsers(dryRun, limit)
  .then(stats => {
    if (stats) {
      const exitCode = stats.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    }
  })
  .catch(err => {
    console.error('\n❌ FATAL ERROR:', err);
    process.exit(1);
  });
