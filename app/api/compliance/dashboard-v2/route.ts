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

    // First try institution_staff table (new schema)
    let institutionId: string | null = null;
    let institutionName = 'Your Institution';
    let institutionLogoUrl: string | undefined;
    let officerTitle: string | undefined;

    const { data: staffRecord } = await supabaseAdmin
      .from('institution_staff')
      .select(`
        *,
        institutions (
          id,
          name,
          logo_url
        )
      `)
      .eq('user_id', user.id)
      .eq('role', 'compliance_officer')
      .single();

    if (staffRecord) {
      institutionId = staffRecord.institution_id;
      const institution = staffRecord.institutions as { id: string; name: string; logo_url?: string } | null;
      institutionName = institution?.name || 'Your Institution';
      institutionLogoUrl = institution?.logo_url;
      officerTitle = staffRecord.title;
    } else {
      // Fallback to athlete_profiles table (legacy schema)
      const { data: officerProfile } = await supabaseAdmin
        .from('athlete_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!officerProfile || officerProfile.role !== 'compliance_officer') {
        console.log('Officer check failed: No compliance officer record found for user', user.id);
        return NextResponse.json({ error: 'Not authorized - compliance officers only' }, { status: 403 });
      }

      institutionId = officerProfile.institution_id;
      institutionName = officerProfile.school_name || officerProfile.school || 'Your Institution';
    }

    if (!institutionId) {
      console.log('Officer check failed: No institution_id found for user', user.id);
      return NextResponse.json({ error: 'Not authorized - no institution assigned' }, { status: 403 });
    }

    // Get all athletes at institution (query without relation expansion)
    const { data: athleteProfiles, error: athletesError } = await supabaseAdmin
      .from('athlete_profiles')
      .select('id, user_id, username, sport')
      .eq('institution_id', institutionId)
      .eq('role', 'college_athlete');

    if (athletesError) {
      console.error('Error fetching athletes:', athletesError);
    }

    // Check if empty
    const isEmpty = !athleteProfiles || athleteProfiles.length === 0;

    // Get deals for these athletes separately (nil_deals.athlete_id references users.id = athlete_profiles.user_id)
    const athleteUserIds = athleteProfiles?.map(a => a.user_id) || [];

    const { data: allDeals, error: dealsError } = athleteUserIds.length > 0
      ? await supabaseAdmin
          .from('nil_deals')
          .select('id, athlete_id, deal_title, third_party_name, compensation_amount, created_at, status, deal_type')
          .in('athlete_id', athleteUserIds)
      : { data: [], error: null };

    if (dealsError) {
      console.error('Error fetching deals:', dealsError);
    }

    // Map deals to athletes
    const dealsByAthleteId = new Map<string, typeof allDeals>();
    (allDeals || []).forEach(deal => {
      const existing = dealsByAthleteId.get(deal.athlete_id) || [];
      existing.push(deal);
      dealsByAthleteId.set(deal.athlete_id, existing);
    });

    // Combine athletes with their deals
    const athletes = (athleteProfiles || []).map(athlete => ({
      ...athlete,
      full_name: athlete.username, // Use username as display name
      nil_deals: dealsByAthleteId.get(athlete.user_id) || []
    }));

    // Get officer's profile for display name
    const { data: officerProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, username')
      .eq('id', user.id)
      .single();

    const officerName = officerProfile?.full_name || officerProfile?.username || officerTitle || user.email?.split('@')[0] || 'Compliance Officer';

    if (isEmpty) {
      return NextResponse.json({
        institution: {
          id: institutionId,
          name: institutionName,
          logoUrl: institutionLogoUrl
        },
        officer: {
          id: user.id,
          name: officerName
        },
        actionRequired: [],
        programHealth: {
          percentage: 100,
          trend: 0,
          totalAthletes: 0,
          totalDeals: 0
        },
        thisWeek: {
          submitted: 0,
          reviewed: 0,
          pending: 0,
          pastDeadline: 0,
          avgReviewTime: 0
        },
        auditReadiness: {
          documented: 0,
          missedDeadlines: 0,
          overridesLogged: 0
        },
        deadlines: {
          overdue: 0,
          today: 0,
          tomorrow: 0,
          thisWeek: 0,
          nextWeek: 0,
          overdueItems: [],
          todayItems: [],
          tomorrowItems: []
        },
        bySport: [],
        recentActivity: [],
        isEmpty: true
      });
    }

    // Get compliance scores for all deals
    const allDealIds = athletes.flatMap(a => (a.nil_deals || []).map(d => d.id));

    const { data: complianceScores } = allDealIds.length > 0
      ? await supabaseAdmin
          .from('compliance_scores')
          .select('*')
          .in('deal_id', allDealIds)
      : { data: [] };

    // Create scores map
    const scoresMap = new Map(complianceScores?.map(s => [s.deal_id, s]) || []);

    // Calculate all metrics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    let totalDeals = 0;
    let greenDeals = 0;
    let yellowDeals = 0;
    let redDeals = 0;
    const actionItems: any[] = [];
    const sportStats: Record<string, { total: number; compliant: number; red: number; yellow: number }> = {};
    const thisWeekDeals: any[] = [];
    const lastWeekDeals: any[] = [];
    const recentActivity: any[] = [];

    // Process all athletes
    athletes.forEach(athlete => {
      const deals = athlete.nil_deals || [];
      const sport = athlete.sport || 'Other';

      // Initialize sport stats
      if (!sportStats[sport]) {
        sportStats[sport] = { total: 1, compliant: 0, red: 0, yellow: 0 };
      } else {
        sportStats[sport].total++;
      }

      let athleteWorstStatus = 'green';

      deals.forEach(deal => {
        totalDeals++;
        const score = scoresMap.get(deal.id);
        const dealDate = new Date(deal.created_at);

        // Track by week
        if (dealDate >= weekAgo) {
          thisWeekDeals.push({ ...deal, score });
          recentActivity.push({
            id: deal.id,
            type: 'deal_submitted',
            description: `${athlete.full_name || athlete.username} submitted deal with ${deal.third_party_name || deal.deal_title}`,
            timestamp: deal.created_at,
            athleteName: athlete.full_name || athlete.username,
            dealName: deal.third_party_name || deal.deal_title
          });
        } else if (dealDate >= twoWeeksAgo) {
          lastWeekDeals.push({ ...deal, score });
        }

        const status = score?.status || 'pending';

        if (status === 'green') {
          greenDeals++;
        } else if (status === 'yellow') {
          yellowDeals++;
          if (athleteWorstStatus === 'green') athleteWorstStatus = 'yellow';

          // Add to action items
          actionItems.push({
            id: `${deal.id}`,
            athleteId: athlete.id,
            athleteName: athlete.full_name || athlete.username,
            dealId: deal.id,
            severity: 'warning',
            issue: score?.reason_codes?.[0] || 'Needs review',
            amount: parseFloat(deal.compensation_amount) || 0,
            action: 'Review required',
            dueDate: deal.created_at
          });
        } else if (status === 'red') {
          redDeals++;
          athleteWorstStatus = 'red';

          // Add to action items (critical)
          actionItems.push({
            id: `${deal.id}`,
            athleteId: athlete.id,
            athleteName: athlete.full_name || athlete.username,
            dealId: deal.id,
            severity: 'critical',
            issue: score?.reason_codes?.[0] || 'Critical compliance issue',
            amount: parseFloat(deal.compensation_amount) || 0,
            action: 'REVIEW NOW',
            dueDate: deal.created_at
          });
        }
      });

      // Update sport compliance
      if (athleteWorstStatus === 'green' || deals.length === 0) {
        sportStats[sport].compliant++;
      } else if (athleteWorstStatus === 'yellow') {
        sportStats[sport].yellow++;
      } else if (athleteWorstStatus === 'red') {
        sportStats[sport].red++;
      }
    });

    // Calculate program health
    const totalScoredDeals = greenDeals + yellowDeals + redDeals;
    const programHealth = totalScoredDeals > 0
      ? Math.round((greenDeals / totalScoredDeals) * 1000) / 10
      : 100;

    // Calculate last week's health for trend
    const lastWeekGreen = lastWeekDeals.filter(d => d.score?.status === 'green').length;
    const lastWeekTotal = lastWeekDeals.filter(d => d.score).length;
    const lastWeekHealth = lastWeekTotal > 0 ? (lastWeekGreen / lastWeekTotal) * 100 : 100;
    const trend = Math.round((programHealth - lastWeekHealth) * 10) / 10;

    // Sort action items (critical first)
    actionItems.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return 0;
    });

    // Format sport breakdown
    const bySport = Object.entries(sportStats)
      .map(([sport, stats]) => ({
        sport,
        totalAthletes: stats.total,
        compliancePercentage: stats.total > 0
          ? Math.round((stats.compliant / stats.total) * 100)
          : 100,
        redCount: stats.red,
        yellowCount: stats.yellow
      }))
      .sort((a, b) => a.compliancePercentage - b.compliancePercentage)
      .slice(0, 10);

    // Calculate deadlines (5 days from creation = NCAA disclosure deadline)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    const startOfDayAfter = new Date(startOfTomorrow.getTime() + 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endOfNextWeek = new Date(startOfToday.getTime() + 14 * 24 * 60 * 60 * 1000);

    let overdueDue = 0, todayDue = 0, tomorrowDue = 0, thisWeekDue = 0, nextWeekDue = 0;
    const overdueItems: any[] = [];
    const todayItems: any[] = [];
    const tomorrowItems: any[] = [];

    athletes.forEach(athlete => {
      (athlete.nil_deals || []).forEach(deal => {
        const created = new Date(deal.created_at);
        const deadline = new Date(created.getTime() + 5 * 24 * 60 * 60 * 1000);

        // Only count deals without a compliance decision
        if (deal.status === 'approved' || deal.status === 'rejected' || deal.status === 'approved_conditional') return;

        const deadlineItem = {
          id: deal.id,
          athleteId: athlete.id,
          athleteName: athlete.full_name || athlete.username,
          dealName: deal.third_party_name || deal.deal_title,
          amount: parseFloat(deal.compensation_amount) || 0,
          deadline: deadline.toISOString()
        };

        if (deadline < startOfToday) {
          overdueDue++;
          overdueItems.push(deadlineItem);
        } else if (deadline < startOfTomorrow) {
          todayDue++;
          todayItems.push(deadlineItem);
        } else if (deadline < startOfDayAfter) {
          tomorrowDue++;
          tomorrowItems.push(deadlineItem);
        } else if (deadline < endOfWeek) {
          thisWeekDue++;
        } else if (deadline < endOfNextWeek) {
          nextWeekDue++;
        }
      });
    });

    // Get override count
    const { count: overrideCount } = await supabaseAdmin
      .from('compliance_overrides')
      .select('*', { count: 'exact', head: true })
      .in('athlete_id', athletes.map(a => a.user_id));

    // Sort recent activity by timestamp
    recentActivity.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      institution: {
        id: institutionId,
        name: institutionName,
        logoUrl: institutionLogoUrl
      },
      officer: {
        id: user.id,
        name: officerName
      },
      actionRequired: actionItems.slice(0, 20),
      programHealth: {
        percentage: programHealth,
        trend: trend,
        totalAthletes: athletes.length,
        totalDeals: totalDeals
      },
      thisWeek: {
        submitted: thisWeekDeals.length,
        reviewed: thisWeekDeals.filter(d => d.score?.status && d.score.status !== 'pending').length,
        pending: thisWeekDeals.filter(d => !d.score || d.score.status === 'pending').length,
        pastDeadline: todayItems.filter(item => new Date(item.deadline) < now).length,
        avgReviewTime: 1.2 // Would calculate from actual data
      },
      auditReadiness: {
        documented: totalDeals,
        missedDeadlines: 0,
        overridesLogged: overrideCount || 0
      },
      deadlines: {
        overdue: overdueDue,
        today: todayDue,
        tomorrow: tomorrowDue,
        thisWeek: thisWeekDue,
        nextWeek: nextWeekDue,
        overdueItems: overdueItems.slice(0, 5),
        todayItems: todayItems.slice(0, 5),
        tomorrowItems: tomorrowItems.slice(0, 5)
      },
      bySport: bySport,
      recentActivity: recentActivity.slice(0, 5),
      isEmpty: false
    });
  } catch (error) {
    console.error('Error fetching compliance dashboard v2:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
