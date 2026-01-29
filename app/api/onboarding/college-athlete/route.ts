import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, dateOfBirth, state, sport, institutionId, institutionName } = body;

    // Validate required fields
    if (!fullName || !dateOfBirth || !state || !sport) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Need either institutionId or institutionName
    if (!institutionId && !institutionName) {
      return NextResponse.json({ error: 'Institution is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update athlete_profiles
    const { error: updateError } = await supabase
      .from('athlete_profiles')
      .update({
        full_name: fullName,
        date_of_birth: dateOfBirth,
        primary_state: state,
        sport,
        institution_id: institutionId || null,
        institution_name: institutionName,
        role: 'college_athlete',
        learning_path: 'activation', // College athletes start in activation path
        consent_status: 'not_required', // College athletes are 18+
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // If institution is selected, link athlete to institution
    if (institutionId) {
      const { error: linkError } = await supabase
        .from('institution_staff')
        .insert({
          institution_id: institutionId,
          user_id: user.id,
          role: 'athlete',
          is_verified: false, // Needs verification by compliance officer
        });

      if (linkError) {
        console.error('Error linking to institution:', linkError);
        // Non-fatal error, continue
      }
    }

    return NextResponse.json({
      success: true,
      redirectTo: '/chat?discovery=true',
    });
  } catch (error) {
    console.error('College athlete onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
