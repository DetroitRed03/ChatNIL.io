import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const status = searchParams.get('status')?.split(',').filter(Boolean);

    // Check for Authorization header
    const authHeader = request.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

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

    // Get authenticated user
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    if (!user && bearerToken) {
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(bearerToken);
      if (tokenUser && !tokenError) {
        user = tokenUser;
        authError = null;
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get officer profile
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    const institutionId = officer.institution_id;

    // Get all college athletes at the institution
    const { data: athletes } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('role', 'college_athlete')
      .eq('institution_id', institutionId);

    // Get all deals for these athletes
    const athleteIds = athletes?.map(a => a.user_id) || [];

    const { data: deals } = await supabaseAdmin
      .from('nil_deals')
      .select(`
        *,
        compliance_scores (*)
      `)
      .in('athlete_id', athleteIds.length > 0 ? athleteIds : ['none']);

    // Build rows
    const rows: Record<string, string | number>[] = [];

    athletes?.forEach(athlete => {
      const athleteDeals = deals?.filter(d => d.athlete_id === athlete.user_id) || [];

      athleteDeals.forEach(deal => {
        const score = Array.isArray(deal.compliance_scores) ? deal.compliance_scores[0] : deal.compliance_scores;

        // Filter by status if specified
        if (status && status.length > 0) {
          if (!score || !status.includes(score.status)) return;
        }

        rows.push({
          athlete_name: athlete.username || athlete.full_name || 'Unknown',
          athlete_email: athlete.email || '',
          sport: athlete.sport || 'Unknown',
          third_party: deal.third_party_name || '',
          deal_type: deal.deal_type || '',
          compensation: deal.compensation_amount || 0,
          deliverables: deal.deliverables || '',
          start_date: deal.start_date || '',
          end_date: deal.end_date || '',
          submitted_date: deal.created_at || '',
          compliance_status: score?.status || 'pending',
          total_score: score?.total_score || '',
          policy_fit: score?.policy_fit_score || '',
          fmv: score?.fmv_score || '',
          document: score?.document_score || '',
          tax: score?.tax_score || '',
          brand_safety: score?.brand_safety_score || '',
          guardian_consent: score?.guardian_consent_score || ''
        });
      });
    });

    if (format === 'csv') {
      if (rows.length === 0) {
        return new NextResponse('No data to export', {
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      }

      // Generate CSV
      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(','),
        ...rows.map(row =>
          headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ncaa_compliance_report_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({ rows });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
