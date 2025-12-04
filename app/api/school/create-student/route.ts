import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Server-side service role client (secure)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'X-Client-Info': 'chatnil-school-signup-api'
    }
  }
});

// Generate memorable password (e.g., "Tiger1234", "Eagle5678")
function generateMemorablePassword(): string {
  const animals = [
    'Tiger', 'Eagle', 'Lion', 'Bear', 'Wolf', 'Hawk',
    'Shark', 'Panther', 'Dragon', 'Phoenix', 'Falcon', 'Mustang'
  ];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${randomAnimal}${randomNumber}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏫 === API ROUTE: CREATE SCHOOL STUDENT ===');

    const body = await request.json();
    const { schoolId, firstName, lastName, primarySport, gradeLevel, graduationYear } = body;

    console.log('📋 Student creation request:', {
      schoolId,
      firstName,
      lastName,
      primarySport,
      gradeLevel,
      graduationYear
    });

    // Validate required fields
    if (!schoolId || !firstName || !lastName || !primarySport || !gradeLevel || !graduationYear) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify school exists and is active
    console.log('🔍 Verifying school...');
    const { data: school, error: schoolError } = await supabaseAdmin
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .eq('active', true)
      .single();

    if (schoolError || !school) {
      console.error('❌ School not found or inactive:', schoolError?.message);
      return NextResponse.json(
        { error: 'School not found or inactive' },
        { status: 404 }
      );
    }

    console.log('✅ School verified:', school.school_name);

    // Generate temporary email
    const sanitizedFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tempEmail = `${sanitizedFirstName}.${sanitizedLastName}.${randomSuffix}@school.chatnil.temp`;

    console.log('📧 Generated temporary email:', tempEmail);

    // Generate memorable password
    const password = generateMemorablePassword();
    console.log('🔐 Generated password (length):', password.length);

    // Create Supabase Auth user
    console.log('👤 Creating Supabase auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: tempEmail,
      password: password,
      email_confirm: true, // Auto-confirm temp email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        school_created: true,
        school_id: schoolId,
        school_name: school.school_name,
        profile_completion_tier: 'basic',
        home_completion_required: true,
      }
    });

    if (authError || !authData.user) {
      console.error('❌ Failed to create auth user:', authError?.message);
      return NextResponse.json(
        { error: `Failed to create user account: ${authError?.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Create user profile in users table (FERPA-minimal data)
    console.log('📝 Creating user profile...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: tempEmail,
        role: 'athlete',
        first_name: firstName,
        last_name: lastName,
        primary_sport: primarySport,
        graduation_year: graduationYear,
        school_name: school.school_name,
        school_id: schoolId,
        school_created: true,
        profile_completion_tier: 'basic',
        home_completion_required: true,
        onboarding_completed: false, // Will complete at home
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Failed to create user profile:', profileError);

      // Rollback: delete the auth user
      console.log('🔄 Rolling back auth user creation...');
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: `Failed to create user profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ User profile created successfully');

    // Update school statistics
    console.log('📊 Updating school statistics...');
    const { error: statsError } = await supabaseAdmin
      .from('schools')
      .update({
        students_registered: school.students_registered + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', schoolId);

    if (statsError) {
      console.warn('⚠️ Failed to update school statistics (non-critical):', statsError);
    } else {
      console.log('✅ School statistics updated');
    }

    console.log('🎉 Student account created successfully:', {
      userId: authData.user.id,
      email: tempEmail,
      school: school.school_name
    });

    // Return credentials (shown only once!)
    return NextResponse.json({
      success: true,
      credentials: {
        email: tempEmail,
        password: password,
      },
      profile: {
        id: profile.id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        school: school.school_name,
      }
    });

  } catch (error: any) {
    console.error('💥 API Route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
