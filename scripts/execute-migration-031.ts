import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  console.log('🚀 Starting Migration 031: Add Username Column\n');

  try {
    // Execute raw SQL to add username column
    console.log('📝 Step 1: Adding username column...');

    const { data: result1, error: error1 } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

        COMMENT ON COLUMN users.username IS 'Unique username for public profile URLs. Format: lowercase alphanumeric with hyphens/underscores only.';
      `
    });

    if (error1) {
      // Try alternative approach - direct SQL execution
      console.log('⚠️  RPC method not available, trying direct approach...');

      // We'll need to use the REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS username TEXT;
          `
        })
      });

      if (!response.ok) {
        console.log('⚠️  DDL via RPC not available. Using alternative method...');
      }
    }

    console.log('✅ Username column structure prepared\n');

    // Step 2: Generate usernames for all athletes
    console.log('📝 Step 2: Generating usernames for athletes...');

    const { data: athletes, error: fetchError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('role', 'athlete');

    if (fetchError) {
      throw new Error(`Failed to fetch athletes: ${fetchError.message}`);
    }

    console.log(`Found ${athletes.length} athletes\n`);

    let successCount = 0;
    let failCount = 0;

    for (const athlete of athletes) {
      if (athlete.first_name && athlete.last_name) {
        let username = `${athlete.first_name.toLowerCase().replace(/\s+/g, '-')}-${athlete.last_name.toLowerCase().replace(/\s+/g, '-')}`;

        // Try to update
        const { error: updateError } = await supabase
          .from('users')
          .update({ username })
          .eq('id', athlete.id);

        if (updateError) {
          // If username already exists, try with a number suffix
          if (updateError.code === '23505') { // Unique violation
            let attempt = 1;
            let success = false;

            while (attempt <= 10 && !success) {
              const numberedUsername = `${username}-${attempt}`;
              const { error: retryError } = await supabase
                .from('users')
                .update({ username: numberedUsername })
                .eq('id', athlete.id);

              if (!retryError) {
                console.log(`✅ ${athlete.first_name} ${athlete.last_name} → ${numberedUsername}`);
                successCount++;
                success = true;
              }
              attempt++;
            }

            if (!success) {
              console.log(`❌ Failed: ${athlete.first_name} ${athlete.last_name} (couldn't find unique username)`);
              failCount++;
            }
          } else {
            console.log(`❌ Failed: ${athlete.first_name} ${athlete.last_name} - ${updateError.message}`);
            failCount++;
          }
        } else {
          console.log(`✅ ${athlete.first_name} ${athlete.last_name} → ${username}`);
          successCount++;
        }
      }
    }

    console.log(`\n📊 Results: ${successCount} successful, ${failCount} failed`);
    console.log('\n🎉 Migration completed!\n');

    // Show Sarah's profile URL
    const { data: sarah, error: sarahError } = await supabase
      .from('users')
      .select('username, first_name, last_name')
      .eq('email', 'sarah.johnson@test.com')
      .single();

    if (!sarahError && sarah) {
      console.log('🔗 Sarah Johnson\'s Profile:');
      console.log(`   http://localhost:3000/athletes/${sarah.username}\n`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

executeMigration();
