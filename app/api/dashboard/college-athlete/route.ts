import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create admin client for database queries (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// State rules lookup (simplified - would come from jurisdictions table in production)
const stateRulesLookup: Record<string, {
  stateName: string;
  nilAllowed: boolean;
  disclosureDeadlineDays: number;
  prohibitedCategories: string[];
}> = {
  CA: {
    stateName: 'California',
    nilAllowed: true,
    disclosureDeadlineDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'cannabis'],
  },
  TX: {
    stateName: 'Texas',
    nilAllowed: true,
    disclosureDeadlineDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
  },
  FL: {
    stateName: 'Florida',
    nilAllowed: true,
    disclosureDeadlineDays: 3,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'sports_betting'],
  },
  KY: {
    stateName: 'Kentucky',
    nilAllowed: true,
    disclosureDeadlineDays: 5,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
  },
  AL: {
    stateName: 'Alabama',
    nilAllowed: true,
    disclosureDeadlineDays: 7,
    prohibitedCategories: ['alcohol', 'tobacco', 'gambling', 'cannabis'],
  },
};

const defaultStateRules = {
  stateName: 'Unknown State',
  nilAllowed: true,
  disclosureDeadlineDays: 7,
  prohibitedCategories: ['alcohol', 'tobacco', 'gambling'],
};

function getOverallStatus(deals: Array<{ complianceScore: number }>): 'green' | 'yellow' | 'red' {
  if (deals.length === 0) return 'green';

  const hasRed = deals.some(d => d.complianceScore < 50);
  const hasYellow = deals.some(d => d.complianceScore >= 50 && d.complianceScore < 80);

  if (hasRed) return 'red';
  if (hasYellow) return 'yellow';
  return 'green';
}

function getQuarterlyDueDates(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Quarterly due dates: Apr 15, Jun 15, Sep 15, Jan 15
  const dueDates = [
    { month: 3, day: 15, label: `Apr 15, ${year}` },
    { month: 5, day: 15, label: `Jun 15, ${year}` },
    { month: 8, day: 15, label: `Sep 15, ${year}` },
    { month: 0, day: 15, label: `Jan 15, ${year + 1}` },
  ];

  for (const due of dueDates) {
    const dueDate = new Date(due.month === 0 ? year + 1 : year, due.month, due.day);
    if (dueDate > now) {
      return due.label;
    }
  }

  return `Apr 15, ${year + 1}`;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Check for Authorization header (Bearer token from localStorage)
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

    // Try to get user from cookies first
    let { data: { user }, error: authError } = await supabase.auth.getUser();

    // If no user from cookies and Bearer token is provided, try using the token
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

    // Use admin client for database queries (bypasses RLS)
    // Get user record (for role) - try both id and user_id patterns
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    // Get athlete profile - try both id and user_id patterns
    let { data: profile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // If not found by id, try user_id (some schemas use this)
    if (!profile) {
      const { data: profileByUserId } = await supabaseAdmin
        .from('athlete_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      profile = profileByUserId;
    }

    // Get role from athlete_profiles, fallback to users table
    const userRole = profile?.role || userRecord?.role;

    // Check if user is college athlete
    // If profile exists and role is NOT hs_student, allow access
    // This handles cases where role might be null/undefined but user has an athlete profile
    const excludedRoles = ['hs_student', 'agency', 'parent', 'school'];

    if (!profile) {
      return NextResponse.json({ error: 'No athlete profile found.' }, { status: 403 });
    }

    if (userRole && excludedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Access denied. College athletes only.' }, { status: 403 });
    }

    const userState = profile?.primary_state || 'CA';

    // Get user's deals with compliance scores
    const { data: deals } = await supabaseAdmin
      .from('nil_deals')
      .select(`
        id,
        deal_title,
        deal_type,
        compensation_amount,
        status,
        created_at
      `)
      .eq('athlete_id', user.id)
      .order('created_at', { ascending: false });

    // Get compliance scores for these deals
    const dealIds = deals?.map(d => d.id) || [];
    const { data: complianceScores } = dealIds.length > 0
      ? await supabaseAdmin
          .from('compliance_scores')
          .select('deal_id, total_score, status, scored_at')
          .in('deal_id', dealIds)
      : { data: [] };

    // Map compliance scores to deals
    const scoresMap = new Map(complianceScores?.map(s => [s.deal_id, s]) || []);

    const formattedDeals = (deals || []).map(deal => {
      const score = scoresMap.get(deal.id);
      return {
        id: deal.id,
        brandName: deal.deal_title || 'Untitled Deal',
        dealType: deal.deal_type || 'other',
        compensation: parseFloat(deal.compensation_amount) || 0,
        complianceScore: score?.total_score || 85, // Default score if not scored yet
        status: deal.status === 'active' ? 'active' as const :
                deal.status === 'completed' ? 'completed' as const :
                deal.status === 'on_hold' ? 'review' as const :
                'pending' as const,
        scoredAt: score?.scored_at,
      };
    });

    // Calculate totals
    const activeDeals = formattedDeals.filter(d => d.status === 'active');
    const totalEarnings = formattedDeals.reduce((sum, d) => sum + d.compensation, 0);
    const issueCount = formattedDeals.filter(d => d.complianceScore < 80).length;
    const overallStatus = getOverallStatus(formattedDeals);

    // Calculate tax info
    const estimatedTax = Math.round(totalEarnings * 0.25);
    const nextQuarterlyDue = getQuarterlyDueDates();

    // Get state rules
    const stateRules = stateRulesLookup[userState] || defaultStateRules;

    // Build recent activity from deals and compliance events
    type ActivityType = 'validation' | 'tax_reminder' | 'deal_update';
    const recentActivity: Array<{
      id: string;
      type: ActivityType;
      message: string;
      timestamp: string;
    }> = [
      ...formattedDeals.slice(0, 3).map(deal => ({
        id: `deal-${deal.id}`,
        type: 'validation' as ActivityType,
        message: `Deal validated: ${deal.brandName} (${deal.complianceScore}/100)`,
        timestamp: deal.scoredAt || new Date().toISOString(),
      })),
    ];

    // Add tax reminder if needed
    if (totalEarnings >= 600) {
      recentActivity.push({
        id: 'tax-reminder',
        type: 'tax_reminder' as const,
        message: `Tax reminder: Quarterly payment due ${nextQuarterlyDue}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Sort by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Build response
    const dashboardData = {
      user: {
        id: user.id,
        fullName: profile?.full_name || userRecord?.full_name || user.email?.split('@')[0] || 'Athlete',
        sport: profile?.sport || 'Not set',
        position: profile?.position || null,
        school: profile?.school_name || profile?.school || 'University',
        year: profile?.year || profile?.graduation_year || null,
        state: userState,
        avatar: profile?.avatar_url || profile?.profile_photo_url,
        bio: profile?.bio || null,
        achievements: profile?.achievements || [],
        estimatedFmv: profile?.estimated_fmv || null,
        // Additional profile/onboarding data
        hobbies: profile?.hobbies || [],
        nilInterests: profile?.nil_interests || [],
        nilGoals: profile?.nil_goals || null,
      },
      compliance: {
        status: overallStatus,
        activeDeals: activeDeals.length,
        totalEarnings,
        issueCount,
      },
      deals: formattedDeals,
      tax: {
        ytdEarnings: totalEarnings,
        estimatedTax,
        nextQuarterlyDue,
      },
      stateRules: {
        stateCode: userState,
        stateName: stateRules.stateName,
        nilAllowed: stateRules.nilAllowed,
        disclosureDeadlineDays: stateRules.disclosureDeadlineDays,
        prohibitedCategories: stateRules.prohibitedCategories,
      },
      recentActivity: recentActivity.slice(0, 5),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error loading college athlete dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
