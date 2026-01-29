import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  try {
    const { dealId } = await params;

    // Get auth token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('sb-access-token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user owns this deal
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get deal with athlete info
    const { data: deal, error: dealError } = await supabase
      .from('nil_deals')
      .select(`
        id,
        brand_name,
        compensation,
        athlete_id,
        submission_status,
        athlete:athlete_profiles(
          user_id,
          school_id,
          full_name,
          schools(
            name,
            state,
            compliance_email
          )
        )
      `)
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Check athlete ownership
    const athlete = deal.athlete as any;
    if (athlete?.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already submitted
    if (deal.submission_status === 'pending_review' || deal.submission_status === 'approved') {
      return NextResponse.json(
        { error: 'Deal has already been submitted' },
        { status: 400 }
      );
    }

    // Update deal submission status
    const submittedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('nil_deals')
      .update({
        submission_status: 'pending_review',
        submitted_to_compliance_at: submittedAt,
        updated_at: submittedAt,
      })
      .eq('id', dealId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to submit deal' }, { status: 500 });
    }

    // Log to audit trail
    await supabase.from('compliance_audit_log').insert({
      deal_id: dealId,
      athlete_id: deal.athlete_id,
      action: 'submitted_to_compliance',
      details: {
        brandName: deal.brand_name,
        compensation: deal.compensation_amount,
        submittedAt,
        schoolName: athlete?.schools?.name,
        complianceEmail: athlete?.schools?.compliance_email,
      },
    }).catch(err => console.warn('Audit log failed:', err));

    // Create submission record
    await supabase.from('compliance_submissions').insert({
      deal_id: dealId,
      athlete_id: deal.athlete_id,
      school_id: athlete?.school_id,
      status: 'pending',
      submitted_at: submittedAt,
    }).catch(err => console.warn('Submission record failed:', err));

    // TODO: Send email notification to compliance office
    // This would integrate with your email service (SendGrid, etc.)
    const complianceEmail = athlete?.schools?.compliance_email;
    if (complianceEmail) {
      console.log(`📧 Would send email to ${complianceEmail} about new submission`);
      // await sendComplianceNotification(complianceEmail, {
      //   athleteName: athlete.full_name,
      //   brandName: deal.brand_name,
      //   compensation: deal.compensation_amount,
      // });
    }

    return NextResponse.json({
      success: true,
      message: 'Deal submitted to compliance successfully',
      submittedAt,
    });
  } catch (error) {
    console.error('Submit to compliance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
