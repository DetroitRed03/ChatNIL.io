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

// State rules lookup
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

// Dimension weights for compliance scoring
const DIMENSION_WEIGHTS = {
  policyFit: 0.30,
  documentHygiene: 0.20,
  fmvVerification: 0.15,
  taxReadiness: 0.15,
  brandSafety: 0.10,
  guardianConsent: 0.10,
};

interface DimensionData {
  score: number;
  weight: number;
  status: 'good' | 'warning' | 'critical';
  issues?: string[];
}

interface Deal {
  id: string;
  brandName: string;
  brandLogo?: string;
  value: number;
  dealType: string;
  overallScore: number;
  dimensions: {
    policyFit: DimensionData;
    documentHygiene: DimensionData;
    fmvVerification: DimensionData;
    taxReadiness: DimensionData;
    brandSafety: DimensionData;
    guardianConsent: DimensionData;
  };
  issues: Array<{
    id: string;
    dimension: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    actionLabel: string;
    actionUrl?: string;
  }>;
  submissionStatus: 'not_submitted' | 'pending_review' | 'approved' | 'needs_revision' | 'rejected' | 'response_submitted' | 'conditions_completed';
  submissionDeadline?: string;
  submittedAt?: string;
  reviewedAt?: string;
  athleteNotes?: string;
  startDate?: string;
  endDate?: string;
  supersededByDealId?: string | null;
  resubmittedFromDealId?: string | null;
}

function getDimensionStatus(score: number): 'good' | 'warning' | 'critical' {
  if (score >= 80) return 'good';
  if (score >= 50) return 'warning';
  return 'critical';
}

function getOverallStatus(score: number): 'protected' | 'attention_needed' | 'at_risk' {
  if (score >= 80) return 'protected';
  if (score >= 50) return 'attention_needed';
  return 'at_risk';
}

function calculateQuarterlyTax(totalIncome: number): Array<{
  quarter: number;
  quarterName: string;
  dueDate: string;
  estimatedTax: number;
  paymentStatus: 'upcoming' | 'due_soon' | 'overdue' | 'paid' | 'partial';
  amountPaid?: number;
}> {
  const now = new Date();
  const year = now.getFullYear();
  const estimatedQuarterlyTax = Math.round(totalIncome * 0.25 / 4);

  const quarters = [
    { quarter: 1, name: 'Q1', month: 3, day: 15 },
    { quarter: 2, name: 'Q2', month: 5, day: 15 },
    { quarter: 3, name: 'Q3', month: 8, day: 15 },
    { quarter: 4, name: 'Q4', month: 0, day: 15, nextYear: true },
  ];

  return quarters.map(q => {
    const dueYear = q.nextYear ? year + 1 : year;
    const dueDate = new Date(dueYear, q.month, q.day);
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: 'upcoming' | 'due_soon' | 'overdue' | 'paid' | 'partial' = 'upcoming';
    if (diffDays < 0) status = 'overdue';
    else if (diffDays <= 14) status = 'due_soon';

    return {
      quarter: q.quarter,
      quarterName: q.name,
      dueDate: dueDate.toISOString().split('T')[0],
      estimatedTax: estimatedQuarterlyTax,
      paymentStatus: status,
    };
  });
}

function generateMockDimensionScores(baseTotalScore: number): Deal['dimensions'] {
  // Generate dimension scores that roughly average to the base total score
  const variance = () => Math.random() * 30 - 15; // ±15 variance

  const generateScore = (baseOffset: number) => {
    const score = Math.max(0, Math.min(100, Math.round(baseTotalScore + baseOffset + variance())));
    return {
      score,
      weight: 0,
      status: getDimensionStatus(score),
    };
  };

  return {
    policyFit: { ...generateScore(5), weight: DIMENSION_WEIGHTS.policyFit },
    documentHygiene: { ...generateScore(-10), weight: DIMENSION_WEIGHTS.documentHygiene },
    fmvVerification: { ...generateScore(0), weight: DIMENSION_WEIGHTS.fmvVerification },
    taxReadiness: { ...generateScore(-5), weight: DIMENSION_WEIGHTS.taxReadiness },
    brandSafety: { ...generateScore(10), weight: DIMENSION_WEIGHTS.brandSafety },
    guardianConsent: { ...generateScore(15), weight: DIMENSION_WEIGHTS.guardianConsent },
  };
}

function generateIssuesFromDimensions(dimensions: Deal['dimensions'], dealId: string): Deal['issues'] {
  const issues: Deal['issues'] = [];

  if (dimensions.policyFit.status === 'critical') {
    issues.push({
      id: `${dealId}-policy-1`,
      dimension: 'policyFit',
      severity: 'critical',
      title: 'School policy conflict',
      description: 'This deal may conflict with your school\'s NIL policy. Review required.',
      actionLabel: 'Review Policy',
    });
  } else if (dimensions.policyFit.status === 'warning') {
    issues.push({
      id: `${dealId}-policy-2`,
      dimension: 'policyFit',
      severity: 'warning',
      title: 'Policy review recommended',
      description: 'Double-check this deal against your school\'s guidelines.',
      actionLabel: 'Check Guidelines',
    });
  }

  if (dimensions.documentHygiene.status === 'critical') {
    issues.push({
      id: `${dealId}-docs-1`,
      dimension: 'documentHygiene',
      severity: 'critical',
      title: 'Missing contract',
      description: 'No signed contract uploaded. This is required for your protection.',
      actionLabel: 'Upload Contract',
    });
  } else if (dimensions.documentHygiene.status === 'warning') {
    issues.push({
      id: `${dealId}-docs-2`,
      dimension: 'documentHygiene',
      severity: 'warning',
      title: 'Contract incomplete',
      description: 'Your contract is missing key terms (payment schedule, termination).',
      actionLabel: 'Review Contract',
    });
  }

  if (dimensions.fmvVerification.status === 'critical') {
    issues.push({
      id: `${dealId}-fmv-1`,
      dimension: 'fmvVerification',
      severity: 'critical',
      title: 'Deal value looks unusual',
      description: 'The payment is significantly different from typical rates for this type of deal.',
      actionLabel: 'Get FMV Check',
    });
  }

  if (dimensions.taxReadiness.status === 'critical') {
    issues.push({
      id: `${dealId}-tax-1`,
      dimension: 'taxReadiness',
      severity: 'warning',
      title: 'W-9 not submitted',
      description: 'You haven\'t submitted your W-9 to this brand yet.',
      actionLabel: 'Submit W-9',
    });
  }

  if (dimensions.brandSafety.status === 'critical') {
    issues.push({
      id: `${dealId}-brand-1`,
      dimension: 'brandSafety',
      severity: 'critical',
      title: 'Brand category concern',
      description: 'This brand may be in a restricted category for college athletes.',
      actionLabel: 'Review Brand',
    });
  }

  if (dimensions.guardianConsent.status === 'critical') {
    issues.push({
      id: `${dealId}-consent-1`,
      dimension: 'guardianConsent',
      severity: 'warning',
      title: 'Parent approval pending',
      description: 'Your parent/guardian hasn\'t approved this deal yet.',
      actionLabel: 'Request Approval',
    });
  }

  return issues;
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

    // Get user record and athlete profile
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    let { data: profile } = await supabaseAdmin
      .from('athlete_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      const { data: profileByUserId } = await supabaseAdmin
        .from('athlete_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      profile = profileByUserId;
    }

    const userRole = profile?.role || userRecord?.role;
    const excludedRoles = ['hs_student', 'agency', 'parent', 'school'];

    if (!profile) {
      return NextResponse.json({ error: 'No athlete profile found.' }, { status: 403 });
    }

    if (userRole && excludedRoles.includes(userRole)) {
      return NextResponse.json({ error: 'Access denied. College athletes only.' }, { status: 403 });
    }

    const userState = profile?.primary_state || 'CA';
    const stateRules = stateRulesLookup[userState] || defaultStateRules;

    // Get user's deals
    const { data: rawDeals } = await supabaseAdmin
      .from('nil_deals')
      .select(`
        id,
        deal_title,
        deal_type,
        compliance_decision,
        compliance_decision_at,
        athlete_notes,
        compensation_amount,
        status,
        created_at,
        start_date,
        end_date,
        superseded_by_deal_id,
        resubmitted_from_deal_id
      `)
      .eq('athlete_id', user.id)
      .order('created_at', { ascending: false });

    // Get compliance scores
    const dealIds = rawDeals?.map(d => d.id) || [];
    const { data: complianceScores } = dealIds.length > 0
      ? await supabaseAdmin
          .from('compliance_scores')
          .select('deal_id, total_score, status, scored_at')
          .in('deal_id', dealIds)
      : { data: [] };

    const scoresMap = new Map(complianceScores?.map(s => [s.deal_id, s]) || []);

    // Get deal submissions if table exists
    let submissionsMap = new Map<string, { status: string; submitted_at?: string }>();
    try {
      const { data: submissions } = await supabaseAdmin
        .from('deal_submissions')
        .select('deal_id, status, submitted_at')
        .eq('user_id', user.id);

      if (submissions) {
        submissionsMap = new Map(submissions.map(s => [s.deal_id, {
          status: s.status === 'submitted' ? 'pending_review' : s.status,
          submitted_at: s.submitted_at
        }]));
      }
    } catch {
      // Table may not exist yet
    }

    // Get todos for the athlete
    let todos: Array<{
      id: string;
      title: string;
      description?: string;
      urgency: 'urgent' | 'soon' | 'later';
      completed: boolean;
      dueDate?: string;
      actionLabel: string;
      actionUrl?: string;
      relatedDealId?: string;
    }> = [];

    try {
      const { data: dbTodos } = await supabaseAdmin
        .from('athlete_todos')
        .select('*')
        .eq('athlete_id', user.id)
        .eq('is_completed', false)
        .order('urgency', { ascending: true })
        .order('due_date', { ascending: true });

      if (dbTodos) {
        todos = dbTodos.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          urgency: t.urgency as 'urgent' | 'soon' | 'later',
          completed: t.is_completed,
          dueDate: t.due_date,
          actionLabel: t.action_label || 'Take Action',
          actionUrl: t.action_url,
          relatedDealId: t.related_deal_id,
        }));
      }
    } catch {
      // Table may not exist yet
    }

    // Format deals with 6-dimension breakdown
    const formattedDeals: Deal[] = (rawDeals || []).map(deal => {
      const score = scoresMap.get(deal.id);
      const submission = submissionsMap.get(deal.id);
      const totalScore = score?.total_score ?? 85;
      const dimensions = generateMockDimensionScores(totalScore);
      const issues = generateIssuesFromDimensions(dimensions, deal.id);

      // Calculate submission deadline based on deal creation and state rules
      const createdAt = new Date(deal.created_at);
      const deadlineDate = new Date(createdAt);
      deadlineDate.setDate(deadlineDate.getDate() + stateRules.disclosureDeadlineDays);

      return {
        id: deal.id,
        brandName: deal.deal_title || 'Untitled Deal',
        value: parseFloat(deal.compensation_amount) || 0,
        dealType: deal.deal_type || 'Other',
        overallScore: totalScore,
        dimensions,
        issues,
        submissionStatus: (submission?.status as Deal['submissionStatus'])
          || (deal.compliance_decision === 'approved' ? 'approved'
            : deal.compliance_decision === 'rejected' ? 'rejected'
            : deal.compliance_decision === 'response_submitted' ? 'response_submitted'
            : deal.compliance_decision === 'conditions_completed' ? 'conditions_completed'
            : deal.compliance_decision === 'info_requested' ? 'needs_revision'
            : deal.compliance_decision === 'approved_with_conditions' ? 'needs_revision'
            : deal.compliance_decision ? 'pending_review'
            : score ? 'pending_review'
            : 'not_submitted') as Deal['submissionStatus'],
        submissionDeadline: deadlineDate.toISOString(),
        submittedAt: submission?.submitted_at || undefined,
        reviewedAt: deal.compliance_decision_at || undefined,
        athleteNotes: deal.athlete_notes || undefined,
        startDate: deal.start_date,
        endDate: deal.end_date,
        supersededByDealId: deal.superseded_by_deal_id || null,
        resubmittedFromDealId: deal.resubmitted_from_deal_id || null,
      };
    });

    // Separate deals by protection status
    const urgentDeals = formattedDeals.filter(d => d.overallScore < 80);
    const protectedDeals = formattedDeals.filter(d => d.overallScore >= 80);

    // Calculate overall protection score (weighted average of all deals, or 100 if no deals)
    const overallProtectionScore = formattedDeals.length > 0
      ? Math.round(formattedDeals.reduce((sum, d) => sum + d.overallScore, 0) / formattedDeals.length)
      : 100;

    const totalEarnings = formattedDeals.reduce((sum, d) => sum + d.value, 0);

    // Build tax tracker data
    const taxData = {
      currentYear: new Date().getFullYear(),
      totalIncome: totalEarnings,
      estimatedTax: Math.round(totalEarnings * 0.25),
      quarters: calculateQuarterlyTax(totalEarnings),
      setAsidePerDeal: formattedDeals.length > 0
        ? Math.round((totalEarnings * 0.25) / formattedDeals.length)
        : 0,
      nextDueDate: '',
      nextDueAmount: 0,
    };

    // Find next unpaid quarter
    const nextQuarter = taxData.quarters.find(q => q.paymentStatus !== 'paid');
    if (nextQuarter) {
      taxData.nextDueDate = nextQuarter.dueDate;
      taxData.nextDueAmount = nextQuarter.estimatedTax;
    }

    // Generate todos if none exist in DB
    if (todos.length === 0) {
      // Add submission reminders for deals not yet submitted
      const unsubmittedDeals = formattedDeals.filter(d => d.submissionStatus === 'not_submitted');
      for (const deal of unsubmittedDeals.slice(0, 3)) {
        const deadline = new Date(deal.submissionDeadline || '');
        const now = new Date();
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        todos.push({
          id: `submit-${deal.id}`,
          title: `Report ${deal.brandName} deal to school`,
          description: `${stateRules.stateName} requires disclosure within ${stateRules.disclosureDeadlineDays} days`,
          urgency: diffDays <= 2 ? 'urgent' : diffDays <= 5 ? 'soon' : 'later',
          completed: false,
          dueDate: deal.submissionDeadline,
          actionLabel: 'Report Now',
          relatedDealId: deal.id,
        });
      }

      // Add tax reminder if earnings > $600
      if (totalEarnings >= 600 && nextQuarter) {
        todos.push({
          id: 'tax-quarterly',
          title: `Quarterly tax payment due ${nextQuarter.quarterName}`,
          description: `Set aside ~$${nextQuarter.estimatedTax} for estimated taxes`,
          urgency: nextQuarter.paymentStatus === 'due_soon' ? 'soon' : 'later',
          completed: false,
          dueDate: nextQuarter.dueDate,
          actionLabel: 'Set Reminder',
        });
      }

      // Add issue-related todos
      for (const deal of urgentDeals.slice(0, 2)) {
        for (const issue of deal.issues.slice(0, 1)) {
          todos.push({
            id: `issue-${issue.id}`,
            title: issue.title,
            description: `${deal.brandName}: ${issue.description}`,
            urgency: issue.severity === 'critical' ? 'urgent' : 'soon',
            completed: false,
            actionLabel: issue.actionLabel,
            relatedDealId: deal.id,
          });
        }
      }
    }

    // Sort todos by urgency
    const urgencyOrder = { urgent: 0, soon: 1, later: 2 };
    todos.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

    // Get user's pending reminders
    let reminders: Array<{
      id: string;
      title: string;
      description?: string;
      reminderDate: string;
      reminderType: string;
      relatedDealId?: string;
    }> = [];

    try {
      const { data: dbReminders } = await supabaseAdmin
        .from('user_reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('reminder_date', { ascending: true });

      if (dbReminders) {
        reminders = dbReminders.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          title: r.title as string,
          description: r.description as string | undefined,
          reminderDate: r.reminder_date as string,
          reminderType: r.reminder_type as string,
          relatedDealId: r.related_deal_id as string | undefined,
        }));
      }
    } catch {
      // Table may not exist yet
    }

    // Get unread notification count
    let unreadNotificationCount = 0;
    try {
      const { count } = await supabaseAdmin
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      unreadNotificationCount = count || 0;
    } catch {
      // Table may not exist
    }

    const now = new Date();
    const dueRemindersCount = reminders.filter(r =>
      new Date(r.reminderDate) <= now
    ).length;

    // Build response
    const dashboardData = {
      // User info
      user: {
        id: user.id,
        firstName: (profile?.full_name || userRecord?.full_name || 'Athlete').split(' ')[0],
        fullName: profile?.full_name || userRecord?.full_name || user.email?.split('@')[0] || 'Athlete',
        sport: profile?.sport || 'Not set',
        position: profile?.position || null,
        school: {
          name: profile?.school_name || profile?.school || 'University',
          state: stateRules.stateName,
          stateCode: userState,
          complianceEmail: 'compliance@school.edu', // Would come from school table
        },
        year: profile?.year || profile?.graduation_year || null,
        avatar: profile?.avatar_url || profile?.profile_photo_url,
        isMinor: false, // Would be calculated from DOB
      },

      // Protection Status (Hero section)
      protection: {
        score: overallProtectionScore,
        status: getOverallStatus(overallProtectionScore),
        activeDeals: formattedDeals.length,
        protectedDeals: protectedDeals.length,
        issuesCount: urgentDeals.reduce((sum, d) => sum + d.issues.length, 0),
        totalEarnings,
      },

      // Urgent Deals (needs attention)
      urgentDeals,

      // Protected Deals (fully compliant)
      protectedDeals,

      // All deals with submission status
      allDeals: formattedDeals,

      // Action Center (todos)
      todos,

      // Tax Tracker
      tax: taxData,

      // State Rules
      stateRules: {
        stateCode: userState,
        stateName: stateRules.stateName,
        nilAllowed: stateRules.nilAllowed,
        disclosureDeadlineDays: stateRules.disclosureDeadlineDays,
        prohibitedCategories: stateRules.prohibitedCategories,
      },

      // Reminders
      reminders,

      // Notification badge counts
      notificationBadge: {
        unreadNotifications: unreadNotificationCount,
        pendingReminders: dueRemindersCount,
        total: unreadNotificationCount + dueRemindersCount,
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error loading college athlete dashboard v2:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
