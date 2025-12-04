import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addUsernameColumn() {
  console.log('🔧 Adding username column to athlete_profiles...\n');

  // Add column
  const { data: addCol, error: addColError } = await supabase.rpc('exec_sql', {
    query: `
      ALTER TABLE athlete_profiles
      ADD COLUMN IF NOT EXISTS username TEXT;
    `
  });

  if (addColError) {
    console.error('❌ Error adding column:', addColError);
    return;
  }

  console.log('✅ Username column added\n');

  // Generate usernames from existing data
  console.log('🏷️  Generating usernames from existing data...\n');

  const { data: genUsernames, error: genError } = await supabase.rpc('exec_sql', {
    query: `
      UPDATE athlete_profiles
      SET username = LOWER(
        REGEXP_REPLACE(
          CONCAT(
            COALESCE(sport, 'athlete'),
            '-',
            COALESCE(position, 'player'),
            '-',
            COALESCE(school, 'university')
          ),
          '[^a-z0-9-]', '', 'g'
        )
      )
      WHERE username IS NULL;
    `
  });

  if (genError) {
    console.error('❌ Error generating usernames:', genError);
    return;
  }

  console.log('✅ Usernames generated\n');

  // Add unique constraint
  const { data: addConstraint, error: constraintError } = await supabase.rpc('exec_sql', {
    query: `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'athlete_profiles_username_key'
        ) THEN
          ALTER TABLE athlete_profiles
          ADD CONSTRAINT athlete_profiles_username_key UNIQUE (username);
        END IF;
      END $$;
    `
  });

  if (constraintError) {
    console.error('⚠️  Note: Could not add unique constraint:', constraintError);
  } else {
    console.log('✅ Unique constraint added\n');
  }

  // Create index
  const { data: addIndex, error: indexError } = await supabase.rpc('exec_sql', {
    query: `
      CREATE INDEX IF NOT EXISTS idx_athlete_profiles_username
      ON athlete_profiles(username);
    `
  });

  if (indexError) {
    console.error('❌ Error creating index:', indexError);
  } else {
    console.log('✅ Index created\n');
  }

  // Verify the results
  console.log('📊 Verifying results...\n');
  const { data: athletes, error: verifyError } = await supabase
    .from('athlete_profiles')
    .select('user_id, sport, position, school, username')
    .limit(5);

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError);
  } else {
    console.log('Sample athletes with usernames:');
    console.log(JSON.stringify(athletes, null, 2));
  }
}

addUsernameColumn();
