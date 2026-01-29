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

    // Get officer profile (query by user_id, not id)
    const { data: officer } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (officer?.role !== 'compliance_officer') {
      return NextResponse.json({ error: 'Not a compliance officer' }, { status: 403 });
    }

    const institutionId = officer.institution_id;
    const institutionName = officer.school_name || officer.school || 'Unknown Institution';

    // Get all college athletes at the institution with their deals
    const { data: athletes } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('role', 'college_athlete')
      .eq('institution_id', institutionId);

    // Get all deals for these athletes (nil_deals.athlete_id stores user_id, not profile id)
    const athleteIds = athletes?.map(a => a.user_id) || [];

    const { data: deals } = await supabaseAdmin
      .from('nil_deals')
      .select(`
        *,
        compliance_scores (*)
      `)
      .in('athlete_id', athleteIds.length > 0 ? athleteIds : ['none']);

    // Calculate aggregates
    let green = 0, yellow = 0, red = 0, noDeals = 0;
    const alerts: Array<{
      id: string;
      name: string;
      sport: string;
      status: 'red' | 'yellow';
      topIssue: string;
      dealId: string;
      score: number;
    }> = [];
    const deadlines: Array<{
      id: string;
      athleteId: string;
      athleteName: string;
      thirdPartyName: string;
      dueInDays: number;
      compensation: number;
    }> = [];
    const sportStats: Record<string, { total: number; green: number; yellow: number; red: number }> = {};

    athletes?.forEach(athlete => {
      const athleteDeals = deals?.filter(d => d.athlete_id === athlete.user_id) || [];
      const sport = athlete.sport || 'Unknown';

      // Track by sport
      if (!sportStats[sport]) {
        sportStats[sport] = { total: 0, green: 0, yellow: 0, red: 0 };
      }
      sportStats[sport].total++;

      if (athleteDeals.length === 0) {
        noDeals++;
        sportStats[sport].green++;
        return;
      }

      // Find worst status
      let worstStatus = 'green';
      let worstScore = 100;
      let topIssue = '';
      let worstDealId = '';

      athleteDeals.forEach(deal => {
        const score = Array.isArray(deal.compliance_scores) ? deal.compliance_scores[0] : deal.compliance_scores;
        if (score) {
          if (score.status === 'red' || (score.status === 'yellow' && worstStatus === 'green')) {
            worstStatus = score.status;
            worstScore = score.total_score;
            topIssue = score.reason_codes?.[0] || 'Compliance issue detected';
            worstDealId = deal.id;
          }
        }

        // Check deadline (5-day NCAA rule) - only for undecided deals
        if (deal.status !== 'approved' && deal.status !== 'rejected' && deal.status !== 'approved_conditional') {
          const dealDate = new Date(deal.created_at);
          const daysSince = Math.floor((Date.now() - dealDate.getTime()) / (1000 * 60 * 60 * 24));
          const dueInDays = 5 - daysSince;
          deadlines.push({
            id: deal.id,
            athleteId: athlete.id,
            athleteName: athlete.username || athlete.full_name || 'Unknown',
            thirdPartyName: deal.third_party_name,
            dueInDays,
            compensation: deal.compensation_amount || 0
          });
        }
      });

      // Count by status
      if (worstStatus === 'green') {
        green++;
        sportStats[sport].green++;
      } else if (worstStatus === 'yellow') {
        yellow++;
        sportStats[sport].yellow++;
        alerts.push({
          id: athlete.id,
          name: athlete.username || athlete.full_name || 'Unknown',
          sport,
          status: 'yellow',
          topIssue,
          dealId: worstDealId,
          score: worstScore
        });
      } else if (worstStatus === 'red') {
        red++;
        sportStats[sport].red++;
        alerts.push({
          id: athlete.id,
          name: athlete.username || athlete.full_name || 'Unknown',
          sport,
          status: 'red',
          topIssue,
          dealId: worstDealId,
          score: worstScore
        });
      }
    });

    // Sort alerts by severity (red first) and score (lowest first)
    alerts.sort((a, b) => {
      if (a.status === 'red' && b.status !== 'red') return -1;
      if (a.status !== 'red' && b.status === 'red') return 1;
      return a.score - b.score;
    });

    // Sort deadlines by urgency
    deadlines.sort((a, b) => a.dueInDays - b.dueInDays);

    // Format sport breakdown
    const bySport = Object.entries(sportStats)
      .map(([sport, stats]) => ({
        sport,
        totalAthletes: stats.total,
        greenPercent: stats.total > 0 ? Math.round((stats.green / stats.total) * 100) : 0,
        yellowPercent: stats.total > 0 ? Math.round((stats.yellow / stats.total) * 100) : 0,
        redPercent: stats.total > 0 ? Math.round((stats.red / stats.total) * 100) : 0,
        hasAlert: stats.red / stats.total > 0.05
      }))
      .sort((a, b) => b.totalAthletes - a.totalAthletes);

    const total = green + yellow + red + noDeals;

    return NextResponse.json({
      institution: {
        id: institutionId,
        name: institutionName,
        totalAthletes: total,
        lastUpdated: new Date().toISOString()
      },
      alerts: {
        redCount: red,
        yellowCount: yellow,
        athletes: alerts.slice(0, 5)
      },
      deadlines: {
        overdue: deadlines.filter(d => d.dueInDays < 0).length,
        urgent: deadlines.filter(d => d.dueInDays >= 0 && d.dueInDays <= 2).length,
        upcoming: deadlines.filter(d => d.dueInDays > 2 && d.dueInDays <= 5).length,
        deals: deadlines.slice(0, 5)
      },
      stats: {
        green,
        yellow,
        red,
        noDeals,
        greenPercent: total > 0 ? Math.round((green / total) * 100) : 0,
        yellowPercent: total > 0 ? Math.round((yellow / total) * 100) : 0,
        redPercent: total > 0 ? Math.round((red / total) * 100) : 0
      },
      bySport: bySport.slice(0, 5)
    });
  } catch (error) {
    console.error('Error loading compliance overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
