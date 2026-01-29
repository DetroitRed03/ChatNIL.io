import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isMinor } from '@/lib/types/onboarding';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, dateOfBirth, state, sport, schoolName, parentEmail } = body;

    // Validate required fields
    if (!fullName || !dateOfBirth || !state || !sport || !schoolName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Check if parent email required for minors
    const needsParentConsent = isMinor(dateOfBirth);
    if (needsParentConsent && !parentEmail) {
      return NextResponse.json({ error: 'Parent email required for minors' }, { status: 400 });
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
        school_name: schoolName,
        role: 'hs_student',
        learning_path: 'foundation',
        consent_status: needsParentConsent ? 'pending' : 'not_required',
        onboarding_completed: !needsParentConsent, // Complete if no consent needed
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // If minor, send consent email to parent
    if (needsParentConsent && parentEmail) {
      // Create consent request with verification token
      const token = crypto.randomUUID();

      const { error: consentError } = await supabase
        .from('parent_child_relationships')
        .insert({
          parent_id: null, // Will be filled when parent signs up
          child_id: user.id,
          consent_status: 'pending',
          verification_method: 'email',
          verification_token: token,
          parent_email_pending: parentEmail,
        });

      if (consentError) {
        console.error('Error creating consent request:', consentError);
      }

      // Send consent email (implement with your email provider)
      await sendParentConsentEmail(parentEmail, fullName, token);
    }

    return NextResponse.json({
      success: true,
      needsParentConsent,
      redirectTo: needsParentConsent ? '/onboarding/pending-consent' : '/discovery',
    });
  } catch (error) {
    console.error('HS student onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendParentConsentEmail(parentEmail: string, childName: string, token: string) {
  // TODO: Implement with your email provider (Resend, SendGrid, etc.)
  console.log(`Sending consent email to ${parentEmail} for ${childName} with token ${token}`);

  // For now, just log the consent URL
  const consentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/parent/consent?token=${token}`;
  console.log('Consent URL:', consentUrl);
}
