import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedTestSchool() {
  console.log('🌱 Seeding test school via SQL...\n');

  try {
    // Use ON CONFLICT to update if exists, insert if not
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        INSERT INTO schools (
          school_name, school_district, state, school_type, custom_slug,
          primary_color, contact_name, contact_email, contact_phone, active,
          students_registered, students_completed
        ) VALUES (
          'Test High School',
          'Test District',
          'KY',
          'high_school',
          'test-hs',
          '#3B82F6',
          'John Smith',
          'admin@testschool.edu',
          '555-0100',
          true,
          0,
          0
        )
        ON CONFLICT (custom_slug)
        DO UPDATE SET
          school_name = EXCLUDED.school_name,
          updated_at = NOW()
        RETURNING *;
      `
    });

    if (error) {
      console.error('❌ Error:', error);
      throw error;
    }

    console.log('✅ Test school seeded successfully!');

    // Now query it to show details
    const { data: school, error: queryError } = await supabase.rpc('exec_sql', {
      query: `SELECT * FROM schools WHERE custom_slug = 'test-hs';`
    });

    if (!queryError && school) {
      console.log('\n📋 School Details:');
      console.log('   Query result:', school);
    }

  } catch (error) {
    console.error('\n💥 Seeding failed:', error);
    throw error;
  }
}

seedTestSchool()
  .then(() => {
    console.log('\n✅ Seeding complete!');
    console.log('🔗 Test URL: http://localhost:3000/school/test-hs/signup');
    process.exit(0);
  })
  .catch(() => process.exit(1));
