import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting Migration 031: Add Username Column\n');

  try {
    // Step 1: Fetch current athletes without username
    console.log('📝 Step 1: Checking current athletes...');
    const { data: athletes, error: fetchError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role')
      .eq('role', 'athlete');

    if (fetchError) {
      throw new Error(`Failed to fetch athletes: ${fetchError.message}`);
    }

    console.log(`✅ Found ${athletes.length} athletes\n`);

    // Step 2: Update each athlete with a username
    console.log('📝 Step 2: Generating usernames...');

    for (const athlete of athletes) {
      if (athlete.first_name && athlete.last_name) {
        const username = `${athlete.first_name.toLowerCase().replace(/\s+/g, '-')}-${athlete.last_name.toLowerCase().replace(/\s+/g, '-')}`;

        const { error: updateError } = await supabase
          .from('users')
          .update({ username })
          .eq('id', athlete.id);

        if (updateError) {
          console.log(`❌ Failed to set username for ${athlete.first_name} ${athlete.last_name}: ${updateError.message}`);
        } else {
          console.log(`✅ Set username for ${athlete.first_name} ${athlete.last_name}: ${username}`);
        }
      }
    }

    console.log('\n🎉 Migration 031 completed successfully!\n');
    console.log('📋 Next step:');
    console.log('   Visit: http://localhost:3000/athletes/sarah-johnson\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
