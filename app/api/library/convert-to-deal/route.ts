/**
 * POST /api/library/convert-to-deal
 *
 * Convert a completed deal analysis into a draft nil_deals record.
 * The athlete can then review/edit it in the DealValidationWizard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    let { data: { user } } = await supabase.auth.getUser();
    if (!user && bearerToken) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(bearerToken);
      if (tokenUser) user = tokenUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { analysisId } = body;

    if (!analysisId) {
      return NextResponse.json({ error: 'analysisId is required' }, { status: 400 });
    }

    // Fetch the analysis
    const { data: analysis, error: fetchError } = await supabaseAdmin
      .from('deal_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    if (analysis.analysis_status !== 'completed') {
      return NextResponse.json({ error: 'Analysis is not completed' }, { status: 400 });
    }

    if (analysis.converted_to_deal_id) {
      return NextResponse.json(
        { error: 'Analysis already converted to deal', dealId: analysis.converted_to_deal_id },
        { status: 409 }
      );
    }

    const extraction = analysis.extraction_result;
    if (!extraction) {
      return NextResponse.json({ error: 'No extraction data found' }, { status: 400 });
    }

    // Create nil_deals record (matches pattern from /api/deals/save)
    const { data: deal, error: dealError } = await supabaseAdmin
      .from('nil_deals')
      .insert({
        athlete_id: user.id,
        agency_id: user.id,
        deal_title: `${extraction.brand || 'Unknown'} Deal`,
        brand_name: extraction.brand || 'Unknown',
        third_party_name: extraction.brand || 'Unknown',
        deal_type: extraction.dealType || 'other',
        compensation_amount: extraction.compensation || 0,
        description: extraction.deliverables || '',
        deliverables: extraction.deliverables || '',
        status: 'draft',
        compliance_status: analysis.compliance_status || 'pending',
        is_third_party_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dealError || !deal) {
      console.error('Error creating deal:', dealError);
      return NextResponse.json(
        { error: 'Failed to create deal', details: dealError?.message },
        { status: 500 }
      );
    }

    // Save compliance score if available
    if (analysis.compliance_result) {
      const cr = analysis.compliance_result;
      await supabaseAdmin
        .from('compliance_scores')
        .insert({
          deal_id: deal.id,
          user_id: user.id,
          policy_fit_score: cr.dimensions?.policyFit?.score || 0,
          policy_fit_weight: cr.dimensions?.policyFit?.weight || 0.3,
          policy_fit_notes: cr.dimensions?.policyFit?.notes || '',
          fmv_score: cr.dimensions?.fmvVerification?.score || 0,
          fmv_weight: cr.dimensions?.fmvVerification?.weight || 0.15,
          fmv_notes: cr.dimensions?.fmvVerification?.notes || '',
          document_score: cr.dimensions?.documentHygiene?.score || 0,
          document_weight: cr.dimensions?.documentHygiene?.weight || 0.2,
          document_notes: cr.dimensions?.documentHygiene?.notes || '',
          tax_score: cr.dimensions?.taxReadiness?.score || 0,
          tax_weight: cr.dimensions?.taxReadiness?.weight || 0.15,
          tax_notes: cr.dimensions?.taxReadiness?.notes || '',
          brand_safety_score: cr.dimensions?.brandSafety?.score || 0,
          brand_safety_weight: cr.dimensions?.brandSafety?.weight || 0.1,
          brand_safety_notes: cr.dimensions?.brandSafety?.notes || '',
          guardian_consent_score: cr.dimensions?.guardianConsent?.score || 0,
          guardian_consent_weight: cr.dimensions?.guardianConsent?.weight || 0.1,
          guardian_consent_notes: cr.dimensions?.guardianConsent?.notes || '',
          total_score: cr.totalScore || 0,
          weighted_score: cr.totalScore || 0,
          status: cr.status || 'pending',
          reason_codes: cr.overallReasonCodes || [],
          fix_recommendations: cr.overallRecommendations || [],
          scored_at: new Date().toISOString(),
        });
    }

    // Mark analysis as converted
    await supabaseAdmin
      .from('deal_analyses')
      .update({
        converted_to_deal_id: deal.id,
        converted_at: new Date().toISOString(),
      })
      .eq('id', analysisId);

    return NextResponse.json({
      success: true,
      dealId: deal.id,
    });
  } catch (error: any) {
    console.error('Error converting to deal:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
