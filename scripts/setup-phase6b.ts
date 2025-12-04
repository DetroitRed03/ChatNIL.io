import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupPhase6B() {
  console.log('🚀 Starting Phase 6B: School System Setup\n');

  try {
    // Step 1: Create schools table
    console.log('📝 Step 1: Creating schools table...');
    const { data: createTable, error: createTableError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS schools (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          school_name TEXT NOT NULL,
          school_district TEXT,
          state TEXT NOT NULL,
          school_type TEXT CHECK (school_type IN ('high_school', 'college', 'university', 'community_college')),
          custom_slug TEXT UNIQUE NOT NULL,
          signup_url TEXT,
          qr_code_url TEXT,
          logo_url TEXT,
          primary_color TEXT DEFAULT '#3B82F6',
          students_registered INTEGER DEFAULT 0,
          students_completed INTEGER DEFAULT 0,
          contact_name TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          created_by UUID
        );
      `
    });

    console.log('   Result:', createTable);
    if (createTableError) {
      console.error('   ❌ Error:', createTableError);
    } else {
      console.log('   ✅ Schools table ready');
    }

    // Step 2: Add columns to users table
    console.log('\n📝 Step 2: Adding school fields to users table...');
    const { data: alterTable, error: alterError } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE users
          ADD COLUMN IF NOT EXISTS school_created BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS profile_completion_tier TEXT DEFAULT 'full',
          ADD COLUMN IF NOT EXISTS home_completion_required BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS school_id UUID,
          ADD COLUMN IF NOT EXISTS home_completed_at TIMESTAMPTZ;
      `
    });

    console.log('   Result:', alterTable);
    if (alterError) {
      console.error('   ❌ Error:', alterError);
    } else {
      console.log('   ✅ User table columns ready');
    }

    // Step 3: Create indexes
    console.log('\n📝 Step 3: Creating indexes...');
    const { data: indexes, error: indexError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(custom_slug);
        CREATE INDEX IF NOT EXISTS idx_schools_state ON schools(state);
        CREATE INDEX IF NOT EXISTS idx_schools_active ON schools(active);
        CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
        CREATE INDEX IF NOT EXISTS idx_users_completion_tier ON users(profile_completion_tier);
        CREATE INDEX IF NOT EXISTS idx_users_school_created ON users(school_created);
      `
    });

    console.log('   Result:', indexes);
    if (indexError) {
      console.error('   ❌ Error:', indexError);
    } else {
      console.log('   ✅ Indexes created');
    }

    // Step 4: Enable RLS
    console.log('\n📝 Step 4: Enabling Row Level Security...');
    const { data: rls, error: rlsError } = await supabase.rpc('exec_sql', {
      query: `ALTER TABLE schools ENABLE ROW LEVEL SECURITY;`
    });

    console.log('   Result:', rls);
    if (rlsError) {
      console.error('   ❌ Error:', rlsError);
    } else {
      console.log('   ✅ RLS enabled');
    }

    // Step 5: Create RLS policies
    console.log('\n📝 Step 5: Creating RLS policies...');
    const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
      query: `
        DROP POLICY IF EXISTS "Anyone can view active schools" ON schools;
        CREATE POLICY "Anyone can view active schools" ON schools FOR SELECT USING (active = true);
      `
    });

    console.log('   Result:', policies);
    if (policyError) {
      console.error('   ❌ Error:', policyError);
    } else {
      console.log('   ✅ RLS policies created');
    }

    // Wait a moment for schema to update
    console.log('\n⏳ Waiting for schema cache to update...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 6: Insert test school using direct insert
    console.log('\n📝 Step 6: Inserting test school...');
    const { data: school, error: insertError } = await supabase
      .from('schools')
      .insert({
        school_name: 'Test High School',
        school_district: 'Test District',
        state: 'KY',
        school_type: 'high_school',
        custom_slug: 'test-hs',
        primary_color: '#3B82F6',
        contact_name: 'John Smith',
        contact_email: 'admin@testschool.edu',
        contact_phone: '555-0100',
        active: true
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        console.log('   ⚠️  Test school already exists');

        // Query existing school
        const { data: existingSchool } = await supabase
          .from('schools')
          .select('*')
          .eq('custom_slug', 'test-hs')
          .single();

        if (existingSchool) {
          console.log('   ✅ Using existing test school');
          printSchoolDetails(existingSchool);
        }
      } else {
        console.error('   ❌ Insert error:', insertError);

        // If insert fails, try via SQL
        console.log('   🔄 Trying via SQL...');
        await insertViaSQL();
      }
    } else {
      console.log('   ✅ Test school created');
      printSchoolDetails(school);
    }

    console.log('\n🎉 Phase 6B setup complete!\n');
    console.log('📋 Next steps:');
    console.log('   1. Build the rest of the components (OnboardingContext, pages, etc.)');
    console.log('   2. Test at: http://localhost:3000/school/test-hs/signup');

  } catch (error) {
    console.error('\n💥 Setup failed:', error);
    throw error;
  }
}

async function insertViaSQL() {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: `
      INSERT INTO schools (
        school_name, school_district, state, school_type, custom_slug,
        primary_color, contact_name, contact_email, contact_phone, active
      ) VALUES (
        'Test High School', 'Test District', 'KY', 'high_school', 'test-hs',
        '#3B82F6', 'John Smith', 'admin@testschool.edu', '555-0100', true
      )
      ON CONFLICT (custom_slug) DO NOTHING;
    `
  });

  if (error) {
    console.error('   ❌ SQL insert error:', error);
  } else {
    console.log('   ✅ School inserted via SQL');

    // Query to get the details
    const { data: school } = await supabase
      .from('schools')
      .select('*')
      .eq('custom_slug', 'test-hs')
      .single();

    if (school) {
      printSchoolDetails(school);
    }
  }
}

function printSchoolDetails(school: any) {
  console.log('\n📋 School Details:');
  console.log(`   • ID: ${school.id}`);
  console.log(`   • Name: ${school.school_name}`);
  console.log(`   • Slug: ${school.custom_slug}`);
  console.log(`   • State: ${school.state}`);
  console.log(`   • Type: ${school.school_type}`);
  console.log(`   • Contact: ${school.contact_name} <${school.contact_email}>`);
  console.log(`   • Active: ${school.active}`);
  console.log('\n🔗 Signup URLs:');
  console.log(`   • Local: http://localhost:3000/school/${school.custom_slug}/signup`);
  console.log(`   • Prod:  https://chatnil.io/school/${school.custom_slug}/signup`);
}

setupPhase6B()
  .then(() => {
    console.log('\n✅ Setup script complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Setup script failed:', error);
    process.exit(1);
  });
