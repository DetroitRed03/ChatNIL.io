import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, childEmail, consentToken } = body;

    // Validate required fields
    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }

    // Need either childEmail or consentToken
    if (!childEmail && !consentToken) {
      return NextResponse.json({ error: 'Child email or consent token is required' }, { status: 400 });
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

    // Update athlete_profiles for parent
    const { error: updateError } = await supabase
      .from('athlete_profiles')
      .update({
        full_name: fullName,
        role: 'parent',
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    let childLinked = false;

    if (consentToken) {
      // Consent flow - approve child's request
      const { data: relationship, error: fetchError } = await supabase
        .from('parent_child_relationships')
        .select('*, child:child_id(id, full_name, email)')
        .eq('verification_token', consentToken)
        .eq('consent_status', 'pending')
        .single();

      if (fetchError || !relationship) {
        return NextResponse.json({ error: 'Invalid or expired consent token' }, { status: 400 });
      }

      // Update relationship with parent ID and approve
      const { error: relationshipError } = await supabase
        .from('parent_child_relationships')
        .update({
          parent_id: user.id,
          consent_status: 'approved',
          consented_at: new Date().toISOString(),
        })
        .eq('id', relationship.id);

      if (relationshipError) {
        console.error('Error updating relationship:', relationshipError);
        return NextResponse.json({ error: 'Failed to approve consent' }, { status: 500 });
      }

      // Update child's profile to mark consent as approved
      const { error: childUpdateError } = await supabase
        .from('athlete_profiles')
        .update({
          consent_status: 'approved',
          onboarding_completed: true,
        })
        .eq('id', relationship.child_id);

      if (childUpdateError) {
        console.error('Error updating child profile:', childUpdateError);
      }

      childLinked = true;
    } else if (childEmail) {
      // Direct link flow - find child by email
      const { data: childProfile, error: childError } = await supabase
        .from('athlete_profiles')
        .select('id, full_name')
        .eq('email', childEmail)
        .single();

      if (childProfile) {
        // Child exists, create relationship
        const { error: relationshipError } = await supabase
          .from('parent_child_relationships')
          .insert({
            parent_id: user.id,
            child_id: childProfile.id,
            consent_status: 'approved',
            verification_method: 'parent_initiated',
            consented_at: new Date().toISOString(),
          });

        if (relationshipError) {
          console.error('Error creating relationship:', relationshipError);
        } else {
          childLinked = true;
        }
      } else {
        // Child doesn't exist yet, send invite email
        await sendChildInviteEmail(childEmail, fullName);

        // Store pending invite
        const { error: inviteError } = await supabase
          .from('parent_child_relationships')
          .insert({
            parent_id: user.id,
            child_id: null, // Will be filled when child signs up
            consent_status: 'pending',
            verification_method: 'parent_invite',
            child_email_pending: childEmail,
          });

        if (inviteError) {
          console.error('Error creating invite:', inviteError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      childLinked,
      redirectTo: '/parent/dashboard',
    });
  } catch (error) {
    console.error('Parent onboarding error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function sendChildInviteEmail(childEmail: string, parentName: string) {
  // TODO: Implement with your email provider (Resend, SendGrid, etc.)
  console.log(`Sending invite email to ${childEmail} from parent ${parentName}`);

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?invited=true&parent=${encodeURIComponent(parentName)}`;
  console.log('Invite URL:', inviteUrl);
}
