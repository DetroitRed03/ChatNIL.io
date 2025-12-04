/**
 * Seed athlete profiles using raw SQL to bypass schema cache issues
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function seedProfiles() {
  try {
    console.log('🌱 Seeding athlete profiles using raw SQL...\n');

    // Get all athletes
    const { data: athletes, error: athletesError } = await supabase
      .from('users')
      .select('id, first_name, last_name, primary_sport, school_name, graduation_year')
      .eq('role', 'athlete');

    if (athletesError || !athletes) {
      console.error('❌ Error fetching athletes:', athletesError);
      process.exit(1);
    }

    console.log(`📝 Found ${athletes.length} athletes\n`);

    // Build SQL INSERT statements
    const values = athletes.map(athlete => {
      const slug = `${athlete.first_name?.toLowerCase()}-${athlete.last_name?.toLowerCase()}`.replace(/[^a-z0-9-]/g, '');
      const displayName = `${athlete.first_name} ${athlete.last_name}`;
      const sport = athlete.primary_sport || 'Unknown';
      const school = athlete.school_name || 'Unknown';
      const bio = `${sport} athlete at ${school}`.replace(/'/g, "''");
      const gradYear = athlete.graduation_year || 'NULL';

      return `(
        '${athlete.id}',
        '${displayName.replace(/'/g, "''")}',
        '${sport.replace(/'/g, "''")}',
        '${school.replace(/'/g, "''")}',
        ${gradYear},
        '${bio}',
        '${slug}',
        true,
        ARRAY['sponsored_posts', 'events', 'appearances']::text[]
      )`;
    }).join(',\n      ');

    const sql = `
-- Insert athlete profiles (ignore duplicates)
INSERT INTO athlete_public_profiles (
  user_id,
  display_name,
  sport,
  school,
  graduation_year,
  bio,
  slug,
  is_profile_public,
  partnership_types
)
VALUES
      ${values}
ON CONFLICT (user_id) DO NOTHING;
`;

    console.log('🔄 Executing bulk insert...\n');

    const { error } = await supabase.rpc('exec_sql', {
      query: sql
    });

    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }

    // Verify
    const { data: count } = await supabase
      .from('athlete_public_profiles')
      .select('id', { count: 'exact', head: true });

    console.log(`✅ Successfully seeded athlete profiles!`);
    console.log(`📊 Total profiles in database: ${count}\n`);

  } catch (error: any) {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  }
}

seedProfiles();
