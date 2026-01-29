/**
 * Dashboard Context Module
 * ========================
 * Fetches real-time dashboard data based on user role.
 * Provides structured context for AI chat awareness.
 */

export interface DashboardContext {
  role: string;
  summary: string;
  data: any;
  availableActions: string[];
}

export async function getDashboardContext(
  userId: string,
  role: string,
  supabase: any
): Promise<DashboardContext> {
  switch (role) {
    case 'compliance_officer':
      return getComplianceOfficerContext(userId, supabase);
    case 'college_athlete':
      return getCollegeAthleteContext(userId, supabase);
    case 'hs_student':
      return getHSStudentContext(userId, supabase);
    case 'parent':
      return getParentContext(userId, supabase);
    default:
      return getDefaultContext(userId, supabase);
  }
}

async function getComplianceOfficerContext(
  userId: string,
  supabase: any
): Promise<DashboardContext> {
  // Get officer profile and institution
  const { data: officer } = await supabase
    .from('users')
    .select('*, institution:institution_id(*)')
    .eq('id', userId)
    .single();

  if (!officer?.institution_id) {
    return {
      role: 'compliance_officer',
      summary: 'No institution linked to this account.',
      data: {},
      availableActions: ['link_institution']
    };
  }

  const institutionId = officer.institution_id;

  // Get all athletes at institution
  const { data: athletes } = await supabase
    .from('athlete_profiles')
    .select(`
      id,
      full_name,
      sport,
      nil_deals (
        id,
        third_party_name,
        compensation,
        status,
        created_at,
        compliance_scores (
          total_score,
          status,
          reason_codes
        )
      )
    `)
    .eq('institution_id', institutionId);

  // Calculate stats
  const totalAthletes = athletes?.length || 0;
  let greenCount = 0, yellowCount = 0, redCount = 0, noDealsCount = 0;
  let totalDeals = 0;
  let totalEarnings = 0;
  const athletesNeedingAttention: any[] = [];
  const w9Alerts: any[] = [];

  athletes?.forEach((athlete: any) => {
    const deals = athlete.nil_deals || [];

    if (deals.length === 0) {
      noDealsCount++;
      return;
    }

    let athleteWorstStatus = 'green';
    let athleteEarnings = 0;

    deals.forEach((deal: any) => {
      totalDeals++;
      athleteEarnings += deal.compensation || 0;
      const score = deal.compliance_scores?.[0];

      if (score?.status === 'red') {
        athleteWorstStatus = 'red';
        athletesNeedingAttention.push({
          athleteId: athlete.id,
          athleteName: athlete.full_name,
          sport: athlete.sport,
          dealId: deal.id,
          dealName: deal.third_party_name,
          amount: deal.compensation,
          score: score.total_score,
          status: 'red',
          issues: score.reason_codes
        });
      } else if (score?.status === 'yellow' && athleteWorstStatus !== 'red') {
        athleteWorstStatus = 'yellow';
        athletesNeedingAttention.push({
          athleteId: athlete.id,
          athleteName: athlete.full_name,
          sport: athlete.sport,
          dealId: deal.id,
          dealName: deal.third_party_name,
          amount: deal.compensation,
          score: score.total_score,
          status: 'yellow',
          issues: score.reason_codes
        });
      }
    });

    if (athleteWorstStatus === 'green') greenCount++;
    else if (athleteWorstStatus === 'yellow') yellowCount++;
    else if (athleteWorstStatus === 'red') redCount++;

    totalEarnings += athleteEarnings;

    // W-9 alert if over $600
    if (athleteEarnings > 600) {
      w9Alerts.push({
        athleteId: athlete.id,
        athleteName: athlete.full_name,
        earnings: athleteEarnings
      });
    }
  });

  // Sort by severity (red first, then by score)
  athletesNeedingAttention.sort((a, b) => {
    if (a.status === 'red' && b.status !== 'red') return -1;
    if (a.status !== 'red' && b.status === 'red') return 1;
    return a.score - b.score;
  });

  const athletesWithDeals = totalAthletes - noDealsCount;
  const complianceRate = athletesWithDeals > 0
    ? Math.round((greenCount / athletesWithDeals) * 100)
    : 100;

  const data = {
    institution: {
      id: institutionId,
      name: officer.institution?.name
    },
    officer: {
      id: userId,
      name: officer.full_name
    },
    stats: {
      totalAthletes,
      greenCount,
      yellowCount,
      redCount,
      noDealsCount,
      totalDeals,
      totalEarnings,
      complianceRate
    },
    athletesNeedingAttention: athletesNeedingAttention.slice(0, 20),
    w9Alerts: w9Alerts.filter(a => a.earnings > 600),
    urgentCount: athletesNeedingAttention.filter(a => a.status === 'red').length
  };

  const summary = `
You are viewing the compliance dashboard for ${officer.institution?.name}.

CURRENT STATUS:
- Total Athletes: ${totalAthletes}
- Compliance Rate: ${complianceRate}%
- GREEN (Compliant): ${greenCount} athletes
- YELLOW (Needs Review): ${yellowCount} athletes
- RED (Critical): ${redCount} athletes
- No Deals Yet: ${noDealsCount} athletes

URGENT ATTENTION NEEDED:
${athletesNeedingAttention.slice(0, 5).map(a =>
  `- ${a.athleteName} (${a.sport}): ${a.dealName} - Score ${a.score}/100 [${a.status.toUpperCase()}]`
).join('\n') || '- No urgent issues'}

W-9 ALERTS (Athletes over $600 threshold):
${w9Alerts.slice(0, 5).map(a =>
  `- ${a.athleteName}: $${a.earnings.toLocaleString()} total earnings`
).join('\n') || '- No W-9 alerts'}

TOTAL INSTITUTIONAL NIL ACTIVITY:
- ${totalDeals} deals across all athletes
- $${totalEarnings.toLocaleString()} total NIL earnings
`;

  return {
    role: 'compliance_officer',
    summary,
    data,
    availableActions: [
      'view_athlete_details',
      'generate_compliance_email',
      'export_ncaa_report',
      'view_w9_alerts',
      'filter_by_status',
      'filter_by_sport',
      'generate_audit_package'
    ]
  };
}

async function getCollegeAthleteContext(
  userId: string,
  supabase: any
): Promise<DashboardContext> {
  // Get athlete profile - try both id patterns
  let { data: profile } = await supabase
    .from('athlete_profiles')
    .select('*, institution:institution_id(name)')
    .eq('user_id', userId)
    .single();

  if (!profile) {
    const { data: profileById } = await supabase
      .from('athlete_profiles')
      .select('*, institution:institution_id(name)')
      .eq('id', userId)
      .single();
    profile = profileById;
  }

  if (!profile) {
    return {
      role: 'college_athlete',
      summary: 'Profile not found. Please complete your profile setup.',
      data: {},
      availableActions: ['complete_profile']
    };
  }

  // Get all deals with compliance scores
  const { data: deals } = await supabase
    .from('nil_deals')
    .select(`
      *,
      compliance_scores (
        total_score,
        status,
        policy_fit_score,
        document_hygiene_score,
        fmv_score,
        tax_readiness_score,
        brand_safety_score,
        guardian_consent_score,
        reason_codes,
        issues
      )
    `)
    .eq('athlete_id', profile.id)
    .order('created_at', { ascending: false });

  // Get state rules
  const stateCode = profile.state || profile.primary_state || 'CA';
  const { data: stateRules } = await supabase
    .from('jurisdictions')
    .select('*')
    .eq('state_code', stateCode)
    .single();

  // Process deals
  const processedDeals = (deals || []).map((deal: any) => {
    const score = deal.compliance_scores?.[0];
    return {
      id: deal.id,
      name: deal.third_party_name || deal.deal_title || 'Unnamed Deal',
      type: deal.deal_type,
      amount: parseFloat(deal.compensation || deal.compensation_amount || 0),
      status: deal.status,
      score: score?.total_score || 0,
      scoreStatus: score?.status || 'pending',
      dimensions: score ? {
        policyFit: score.policy_fit_score,
        documentHygiene: score.document_hygiene_score,
        fmv: score.fmv_score,
        taxReadiness: score.tax_readiness_score,
        brandSafety: score.brand_safety_score,
        guardianConsent: score.guardian_consent_score
      } : null,
      issues: score?.reason_codes || []
    };
  });

  const totalEarnings = processedDeals.reduce((sum: number, d: any) => sum + d.amount, 0);
  const estimatedTax = Math.round(totalEarnings * 0.25);
  const greenDeals = processedDeals.filter((d: any) => d.scoreStatus === 'green');
  const yellowDeals = processedDeals.filter((d: any) => d.scoreStatus === 'yellow');
  const redDeals = processedDeals.filter((d: any) => d.scoreStatus === 'red');

  const protectionPercentage = processedDeals.length > 0
    ? Math.round((greenDeals.length / processedDeals.length) * 100)
    : 100;

  let overallStatus = 'protected';
  if (redDeals.length > 0) overallStatus = 'at-risk';
  else if (yellowDeals.length > 0) overallStatus = 'attention';

  const data = {
    athlete: {
      id: profile.id,
      name: profile.full_name,
      school: profile.institution?.name || profile.school_name || profile.school,
      sport: profile.sport,
      state: stateCode
    },
    protection: {
      percentage: protectionPercentage,
      status: overallStatus,
      protectedCount: greenDeals.length,
      attentionCount: yellowDeals.length,
      atRiskCount: redDeals.length
    },
    earnings: {
      total: totalEarnings,
      estimatedTax,
      taxRate: 25
    },
    deals: processedDeals,
    dealsNeedingAttention: [...redDeals, ...yellowDeals],
    stateRules: stateRules ? {
      state: stateRules.state_code,
      nilAllowed: stateRules.nil_allowed,
      reportingDays: stateRules.disclosure_days,
      prohibitedCategories: stateRules.prohibited_categories
    } : null
  };

  const schoolName = profile.institution?.name || profile.school_name || profile.school || 'Not set';

  const summary = `
You are viewing ${profile.full_name}'s NIL dashboard.

PROFILE:
- School: ${schoolName}
- Sport: ${profile.sport}
- State: ${stateCode}

PROTECTION STATUS: ${overallStatus.toUpperCase()}
- Protection Score: ${protectionPercentage}%
- ${greenDeals.length} deals fully protected (GREEN)
- ${yellowDeals.length} deals need attention (YELLOW)
- ${redDeals.length} deals at risk (RED)

EARNINGS:
- Total NIL Earnings: $${totalEarnings.toLocaleString()}
- Estimated Tax Owed: $${estimatedTax.toLocaleString()} (~25%)
- ${totalEarnings > 600 ? 'Will receive 1099 forms' : 'Under 1099 threshold'}

YOUR DEALS:
${processedDeals.slice(0, 5).map((d: any) =>
  `- ${d.name}: $${d.amount.toLocaleString()} - ${d.score}/100 [${d.scoreStatus.toUpperCase()}]`
).join('\n') || '- No deals yet'}

${yellowDeals.length + redDeals.length > 0 ? `
ISSUES TO ADDRESS:
${[...redDeals, ...yellowDeals].slice(0, 3).map((d: any) =>
  `- ${d.name}: ${d.issues.join(', ') || 'Review needed'}`
).join('\n')}
` : ''}

STATE RULES (${stateCode}):
- NIL Allowed: ${stateRules?.nil_allowed ? 'Yes' : 'Check restrictions'}
- Reporting Requirement: ${stateRules?.disclosure_days || 'Check with compliance'} days
- Prohibited: ${stateRules?.prohibited_categories?.join(', ') || 'Alcohol, Tobacco, Gambling'}
`;

  return {
    role: 'college_athlete',
    summary,
    data,
    availableActions: [
      'validate_new_deal',
      'view_deal_breakdown',
      'get_fmv_estimate',
      'generate_nil_go_packet',
      'contact_compliance',
      'view_tax_info',
      'upload_contract'
    ]
  };
}

async function getHSStudentContext(
  userId: string,
  supabase: any
): Promise<DashboardContext> {
  // Get student profile
  const { data: profile } = await supabase
    .from('student_discovery_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get chapter progress
  const { data: chapters } = await supabase
    .from('chapter_unlocks')
    .select('*')
    .eq('user_id', userId);

  // Get badges
  const { data: badges } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId);

  // Get quiz results
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get state rules
  const stateCode = profile?.state || 'CA';
  const { data: stateRules } = await supabase
    .from('jurisdictions')
    .select('*')
    .eq('state_code', stateCode)
    .single();

  // Get parent consent
  const { data: consent } = await supabase
    .from('parent_child_relationships')
    .select('*')
    .eq('child_id', userId)
    .single();

  // Calculate profile strength (out of 20 data points)
  const profileFields = [
    profile?.sport, profile?.position, profile?.school,
    profile?.graduation_year, profile?.state, profile?.gpa,
    profile?.instagram_handle, profile?.tiktok_handle,
    profile?.twitter_handle, profile?.instagram_followers,
    profile?.athletic_achievements, profile?.goals,
    profile?.interests, profile?.college_preferences,
    profile?.scholarship_status, profile?.highlight_video,
    profile?.profile_photo, profile?.bio,
    profile?.contact_email, profile?.contact_phone
  ];
  const filledFields = profileFields.filter(f => f).length;
  const profileStrength = Math.round((filledFields / 20) * 100);

  // Pillar progress
  const pillars = ['identity', 'business', 'money', 'legacy'];
  const completedPillars = chapters?.filter((c: any) => c.completed).map((c: any) => c.pillar) || [];
  const currentPillar = pillars.find(p => !completedPillars.includes(p)) || 'identity';

  const data = {
    student: {
      id: profile?.id,
      name: profile?.full_name,
      sport: profile?.sport,
      school: profile?.school,
      state: profile?.state,
      graduationYear: profile?.graduation_year
    },
    progress: {
      profileStrength,
      filledFields,
      totalFields: 20,
      currentPillar,
      completedPillars,
      totalPillars: 4,
      pillarProgress: Math.round((completedPillars.length / 4) * 100)
    },
    chapters: chapters || [],
    badges: badges?.map((b: any) => ({
      id: b.badge?.id,
      name: b.badge?.name,
      earnedAt: b.created_at
    })) || [],
    quizResults: quizResults?.slice(0, 5) || [],
    stateRules: stateRules ? {
      state: stateRules.state_code,
      hsNilAllowed: stateRules.hs_nil_allowed,
      restrictions: stateRules.hs_restrictions
    } : null,
    consent: {
      status: consent?.status || 'pending',
      parentEmail: consent?.parent_email
    }
  };

  const summary = `
You are chatting with ${profile?.full_name || 'a high school student'}.

PROFILE:
- Sport: ${profile?.sport || 'Not set'}
- School: ${profile?.school || 'Not set'}
- State: ${profile?.state || 'Not set'}
- Graduation: ${profile?.graduation_year || 'Not set'}

LEARNING PROGRESS:
- Current Chapter: ${currentPillar.charAt(0).toUpperCase() + currentPillar.slice(1)}
- Pillars Completed: ${completedPillars.length}/4 (${pillars.map(p => completedPillars.includes(p) ? '✓' : '○').join(' ')})
- Profile Strength: ${profileStrength}% (${filledFields}/20 data points)

BADGES EARNED: ${badges?.length || 0}
${badges?.slice(0, 3).map((b: any) => `- ${b.badge?.name}`).join('\n') || '- None yet'}

RECENT QUIZ SCORES:
${quizResults?.slice(0, 3).map((q: any) => `- ${q.pillar}: ${q.score}%`).join('\n') || '- No quizzes taken yet'}

PARENT CONSENT: ${consent?.status?.toUpperCase() || 'PENDING'}

STATE RULES (${profile?.state || 'Unknown'}):
- HS NIL Allowed: ${stateRules?.hs_nil_allowed ? 'Yes (with restrictions)' : 'Limited/No'}
${stateRules?.hs_restrictions ? `- Restrictions: ${stateRules.hs_restrictions}` : ''}

NEXT STEPS:
${completedPillars.length === 0 ? '- Complete the Discovery conversation to unlock your first chapter' : ''}
${!consent || consent.status !== 'approved' ? '- Get parent consent to continue' : ''}
${profileStrength < 60 ? '- Add more profile information to increase your strength' : ''}
`;

  return {
    role: 'hs_student',
    summary,
    data,
    availableActions: [
      'continue_discovery',
      'take_quiz',
      'view_state_rules',
      'update_profile',
      'view_badges',
      'request_parent_consent'
    ]
  };
}

async function getParentContext(
  userId: string,
  supabase: any
): Promise<DashboardContext> {
  // Get parent profile
  const { data: parent } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  // Get linked children
  const { data: relationships } = await supabase
    .from('parent_child_relationships')
    .select(`
      *,
      child:child_id (
        id,
        full_name,
        email
      )
    `)
    .eq('parent_id', userId);

  // Get children's progress
  const childrenData = await Promise.all(
    (relationships || []).map(async (rel: any) => {
      const { data: profile } = await supabase
        .from('student_discovery_profiles')
        .select('*')
        .eq('user_id', rel.child_id)
        .single();

      const { data: chapters } = await supabase
        .from('chapter_unlocks')
        .select('*')
        .eq('user_id', rel.child_id);

      const { data: badges } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', rel.child_id);

      const { data: activity } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', rel.child_id)
        .order('created_at', { ascending: false })
        .limit(10);

      const completedPillars = chapters?.filter((c: any) => c.completed).length || 0;

      return {
        childId: rel.child_id,
        childName: rel.child?.full_name || profile?.full_name || 'Unknown',
        consentStatus: rel.status,
        sport: profile?.sport,
        school: profile?.school,
        state: profile?.state,
        progress: {
          pillarsCompleted: completedPillars,
          totalPillars: 4,
          percentage: Math.round((completedPillars / 4) * 100)
        },
        badgesEarned: badges?.length || 0,
        recentActivity: activity?.slice(0, 5) || []
      };
    })
  );

  const data = {
    parent: {
      id: userId,
      name: parent?.full_name
    },
    children: childrenData,
    totalChildren: childrenData.length,
    pendingConsent: childrenData.filter(c => c.consentStatus === 'pending').length
  };

  const summary = `
You are viewing ${parent?.full_name || 'the parent'}'s dashboard.

YOUR CHILDREN ON CHATNIL: ${childrenData.length}

${childrenData.map(child => `
${child.childName}:
- Sport: ${child.sport || 'Not set'}
- School: ${child.school || 'Not set'}
- Consent Status: ${child.consentStatus?.toUpperCase() || 'PENDING'}
- Learning Progress: ${child.progress.pillarsCompleted}/4 pillars complete (${child.progress.percentage}%)
- Badges Earned: ${child.badgesEarned}
- Recent Activity: ${child.recentActivity.length > 0 ? child.recentActivity[0]?.message || 'Active recently' : 'No recent activity'}
`).join('\n---\n')}

${data.pendingConsent > 0 ? `
PENDING CONSENT: ${data.pendingConsent} child(ren) awaiting your approval
` : 'All consents approved'}

WHAT CHATNIL DOES:
- Educates your child about NIL rules BEFORE college
- Does NOT facilitate deals for high school students
- Teaches the 4 Pillars: Identity, Business, Money, Legacy
- Profile data transfers when they reach college
`;

  return {
    role: 'parent',
    summary,
    data,
    availableActions: [
      'view_child_progress',
      'manage_consent',
      'view_child_activity',
      'update_notification_preferences'
    ]
  };
}

async function getDefaultContext(
  userId: string,
  supabase: any
): Promise<DashboardContext> {
  // Try to get basic user info
  const { data: user } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', userId)
    .single();

  return {
    role: user?.role || 'unknown',
    summary: `Welcome to ChatNIL${user?.full_name ? `, ${user.full_name}` : ''}! Please complete your profile to get started.`,
    data: { user },
    availableActions: ['complete_onboarding']
  };
}
