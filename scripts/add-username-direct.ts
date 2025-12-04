import { Client } from 'pg';
import { createClient } from '@supabase/supabase-js';

const connectionString = 'postgresql://postgres.enbuwffusjhpcyoveewb:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuYnV3ZmZ1c2pocGN5b3ZlZXdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY4NjcwOSwiZXhwIjoyMDc0MjYyNzA5fQ.fXvyvHrUoNLdAr1expbRsguM8fkmurrNQi3-7xk8-TM@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addUsernameColumn() {
  const client = new Client({ connectionString });

  try {
    console.log('🚀 Connecting to database...\n');
    await client.connect();

    console.log('📝 Step 1: Adding username column...');
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
    `);
    console.log('✅ Username column added\n');

    console.log('📝 Step 2: Creating index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
    console.log('✅ Index created\n');

    console.log('📝 Step 3: Adding comment...');
    await client.query(`
      COMMENT ON COLUMN users.username IS 'Unique username for public profile URLs. Format: lowercase alphanumeric with hyphens/underscores only.';
    `);
    console.log('✅ Comment added\n');

    await client.end();

    // Now generate usernames using Supabase client
    console.log('📝 Step 4: Generating usernames for athletes...');

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

        const { error: updateError } = await supabase
          .from('users')
          .update({ username })
          .eq('id', athlete.id);

        if (updateError) {
          if (updateError.code === '23505') {
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
              console.log(`❌ Failed: ${athlete.first_name} ${athlete.last_name}`);
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
    console.log('\n🎉 Migration 031 completed successfully!\n');

    // Show Sarah's profile URL
    const { data: sarah } = await supabase
      .from('users')
      .select('username')
      .eq('email', 'sarah.johnson@test.com')
      .single();

    if (sarah?.username) {
      console.log('🔗 Sarah Johnson\'s Profile URL:');
      console.log(`   http://localhost:3000/athletes/${sarah.username}\n`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addUsernameColumn();
