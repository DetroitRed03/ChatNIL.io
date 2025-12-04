import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: { schema: 'public' },
    auth: { persistSession: false }
  }
);

async function seedTestSchool() {
  console.log('🏫 Seeding test school...');

  try {
    // Use SQL directly to check if school exists
    const { data: existingSchools, error: checkError } = await supabase.rpc('exec_sql', {
      query: `SELECT id, school_name, custom_slug FROM schools WHERE custom_slug = 'test-hs';`
    });

    if (checkError) {
      console.error('Error checking existing school:', checkError);
    }

    if (existingSchools && existingSchools.length > 0) {
      const school = existingSchools[0];
      console.log('⚠️  Test school already exists:');
      console.log(`   ID: ${school.id}`);
      console.log(`   Name: ${school.school_name}`);
      console.log(`   Slug: ${school.custom_slug}`);
      console.log(`   Signup URL: https://chatnil.io/school/${school.custom_slug}/signup`);
      console.log(`   Local Test: http://localhost:3000/school/${school.custom_slug}/signup`);
      console.log('\n✅ Test school already seeded (skipping)');
      return;
    }

    // Insert test school using SQL
    const { error: insertError } = await supabase.rpc('exec_sql', {
      query: `
        INSERT INTO schools (
          school_name, school_district, state, school_type, custom_slug,
          primary_color, contact_name, contact_email, contact_phone, active
        ) VALUES (
          'Test High School', 'Test District', 'KY', 'high_school', 'test-hs',
          '#3B82F6', 'John Smith', 'admin@testschool.edu', '555-0100', true
        );
      `
    });

    if (insertError) {
      console.error('❌ Error creating school:', insertError);
      throw insertError;
    }

    // Query the inserted school
    const { data: schools, error: queryError } = await supabase.rpc('exec_sql', {
      query: `SELECT * FROM schools WHERE custom_slug = 'test-hs';`
    });

    console.log('Query result:', { schools, queryError });

    if (queryError) {
      console.error('❌ Error querying school:', queryError);
      throw queryError;
    }

    const school = schools && schools.length > 0 ? schools[0] : null;

    if (!school) {
      throw new Error('School was not found after insert');
    }

    console.log('✅ Test school created successfully:');
    console.log(`   ID: ${school.id}`);
    console.log(`   Name: ${school.school_name}`);
    console.log(`   Slug: ${school.custom_slug}`);
    console.log(`   State: ${school.state}`);
    console.log(`   Type: ${school.school_type}`);
    console.log(`   Contact: ${school.contact_name} (${school.contact_email})`);
    console.log(`   Primary Color: ${school.primary_color}`);
    console.log(`   Active: ${school.active}`);
    console.log('\n📋 Signup URLs:');
    console.log(`   Production: https://chatnil.io/school/${school.custom_slug}/signup`);
    console.log(`   Local Dev:  http://localhost:3000/school/${school.custom_slug}/signup`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seedTestSchool()
  .then(() => {
    console.log('\n🎉 Test school seed complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed error:', error);
    process.exit(1);
  });
