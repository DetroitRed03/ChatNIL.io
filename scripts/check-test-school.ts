import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkTestSchool() {
  console.log('🔍 Checking for test school...\n');

  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('custom_slug', 'test-hs')
    .single();

  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔨 Creating test school...');

    const { data: newSchool, error: insertError } = await supabase
      .from('schools')
      .upsert({
        school_name: 'Test High School',
        school_district: 'Test District',
        state: 'KY',
        school_type: 'high_school',
        custom_slug: 'test-hs',
        primary_color: '#3B82F6',
        contact_name: 'John Smith',
        contact_email: 'admin@testschool.edu',
        contact_phone: '555-0100',
        active: true,
        students_registered: 0,
        students_completed: 0
      }, {
        onConflict: 'custom_slug'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
    } else {
      console.log('✅ Test school created!');
      printSchool(newSchool);
    }
  } else {
    console.log('✅ Test school exists!');
    printSchool(data);
  }
}

function printSchool(school: any) {
  console.log('\n📋 School Details:');
  console.log(`   • ID: ${school.id}`);
  console.log(`   • Name: ${school.school_name}`);
  console.log(`   • Slug: ${school.custom_slug}`);
  console.log(`   • State: ${school.state}`);
  console.log(`   • Active: ${school.active}`);
  console.log(`   • URL: http://localhost:3000/school/${school.custom_slug}/signup`);
}

checkTestSchool()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
