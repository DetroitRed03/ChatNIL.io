import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, institutionId, institutionName, title, department, workEmail } = body;

    // Validate required fields
    if (!fullName || !title || !workEmail) {
      return NextResponse.json({ error: 'Full name, title, and work email are required' }, { status: 400 });
    }

    // Need either institutionId or institutionName
    if (!institutionId && !institutionName) {
      return NextResponse.json({ error: 'Institution is required' }, { status: 400 });
    }

    // Validate work email is institutional
    const emailDomain = workEmail.split('@')[1]?.toLowerCase();
    const isEduEmail = emailDomain?.endsWith('.edu');

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

    let finalInstitutionId = institutionId;

    // If no institution ID, create new institution
    if (!institutionId && institutionName) {
      const { data: newInstitution, error: institutionError } = await supabase
        .from('institutions')
        .insert({
          name: institutionName,
          type: 'university',
          is_verified: false,
        })
        .select('id')
        .single();

      if (institutionError) {
        console.error('Error creating institution:', institutionError);
      } else {
        finalInstitutionId = newInstitution.id;
      }
    }

    // Update athlete_profiles for compliance officer
    const { error: updateError } = await supabase
      .from('athlete_profiles')
      .update({
        full_name: fullName,
        role: 'compliance_officer',
        institution_id: finalInstitutionId,
        institution_name: institutionName || undefined,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Create institution_staff record
    if (finalInstitutionId) {
      const { error: staffError } = await supabase
        .from('institution_staff')
        .insert({
          institution_id: finalInstitutionId,
          user_id: user.id,
          role: 'compliance_officer',
          title,
          department,
          work_email: workEmail,
          is_verified: isEduEmail, // Auto-verify if .edu email
        });

      if (staffError) {
        console.error('Error creating staff record:', staffError);
      }
    }

    // Send verification email if not auto-verified
    if (!isEduEmail) {
      await sendVerificationEmail(workEmail, fullName);
    }

    return NextResponse.json({
      success: true,
      needsVerification: !isEduEmail,
      redirectTo: '/compliance/dashboard',
    });
  } catch (error) {
    console.error('Compliance officer onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendVerificationEmail(email: string, name: string) {
  // TODO: Implement with your email provider (Resend, SendGrid, etc.)
  console.log(`Sending verification email to ${email} for compliance officer ${name}`);

  // In production, this would send an email with a verification link
  // that an admin would use to verify the compliance officer
}
