import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { PillarType, PILLARS } from '@/lib/discovery/questions';

export const dynamic = 'force-dynamic';

// Daily questions pool — enhanced with hints and coaching context
const dailyQuestions = [
  {
    id: 'dq-1',
    question: 'What 3 words would your teammates use to describe you?',
    pillar: 'identity',
    type: 'text',
    hints: ['Think about what your coach says about you', 'What do friends come to you for?'],
    coachingContext: 'The athlete is identifying personal brand traits. Look for self-awareness and specificity.'
  },
  {
    id: 'dq-2',
    question: 'Quick! Name ONE brand you\'d love to partner with and WHY',
    pillar: 'identity',
    type: 'text',
    hints: ['Think about brands you already use and love', 'What brands match your personality?'],
    coachingContext: 'The athlete is connecting personal identity to brand alignment. Look for genuine reasoning.'
  },
  {
    id: 'dq-3',
    question: 'If you earned $500 from an NIL deal today, how would you split it up?',
    pillar: 'money',
    type: 'text',
    hints: ['Think about taxes — how much should you set aside?', 'What about saving vs. spending?'],
    coachingContext: 'The athlete is demonstrating financial literacy. Look for awareness of taxes, saving, and responsible spending.'
  },
  {
    id: 'dq-4',
    question: 'What\'s ONE thing you want to be known for after your athletic career?',
    pillar: 'legacy',
    type: 'text',
    hints: ['Think beyond sports — what impact do you want to make?', 'What would you want people to say about you at 40?'],
    coachingContext: 'The athlete is articulating their long-term legacy vision. Look for depth of thought about identity beyond athletics.'
  },
  {
    id: 'dq-5',
    question: 'What makes you DIFFERENT from other athletes in your sport?',
    pillar: 'identity',
    type: 'text',
    hints: ['Think about your personality, not just your stats', 'What hobbies or interests set you apart?'],
    coachingContext: 'The athlete is identifying their unique value proposition. Look for specificity beyond just athletic ability.'
  },
  {
    id: 'dq-6',
    question: 'What\'s a red flag you\'d look for in an NIL deal?',
    pillar: 'business',
    type: 'text',
    hints: ['What if they pressure you to sign quickly?', 'What about deals that seem too good to be true?'],
    coachingContext: 'The athlete is learning to identify predatory deal terms. Look for awareness of common red flags.'
  },
  {
    id: 'dq-7',
    question: 'What cause or community issue do you care about most?',
    pillar: 'legacy',
    type: 'text',
    hints: ['What issue in your community fires you up?', 'Is there a cause connected to your personal story?'],
    coachingContext: 'The athlete is identifying causes that shape their brand. Look for genuine passion and personal connection.'
  },
  {
    id: 'dq-8',
    question: 'What\'s one skill you have OUTSIDE of sports that could help your brand?',
    pillar: 'identity',
    type: 'text',
    hints: ['Are you creative, funny, a good speaker?', 'Think about what you do in your free time'],
    coachingContext: 'The athlete is recognizing transferable skills. Look for self-awareness about non-athletic talents.'
  },
  {
    id: 'dq-9',
    question: 'What does "exclusivity" mean in an NIL contract?',
    pillar: 'business',
    type: 'text',
    hints: ['Think about what it means to only work with one brand', 'What if Nike pays you — can you wear Adidas?'],
    coachingContext: 'The athlete is demonstrating understanding of exclusivity clauses and their implications.'
  },
  {
    id: 'dq-10',
    question: 'If a brand asked you to promote something you don\'t believe in, what would you do?',
    pillar: 'legacy',
    type: 'text',
    hints: ['Think about your values and what you stand for', 'Consider how it would look to your community'],
    coachingContext: 'The athlete is navigating authenticity vs. money. Look for awareness that saying no protects long-term brand value.'
  },
  {
    id: 'dq-11',
    question: 'Who should you talk to BEFORE signing any NIL deal?',
    pillar: 'business',
    type: 'text',
    hints: ['Think about trusted adults in your life', 'What about your school\'s compliance office?'],
    coachingContext: 'The athlete is identifying their support network. Look for mentions of parents/guardians, compliance officers, or mentors.'
  },
];

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

    // Get user profile
    const { data: profile } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Check if user is HS student
    if (profile?.role !== 'hs_student') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get discovery state
    const { data: conversationFlow } = await supabase
      .from('conversation_flows')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get unlocked chapters
    const { data: chapters } = await supabase
      .from('chapter_unlocks')
      .select('chapter_name')
      .eq('user_id', user.id);

    const unlockedChapters = chapters?.map(c => c.chapter_name as PillarType) || [];

    // Get discovery profile (uses individual columns, not profile_data JSONB)
    const { data: discoveryProfile } = await supabase
      .from('student_discovery_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Map individual columns to the expected profile data structure
    const profileData = discoveryProfile ? {
      sport: discoveryProfile.sport ? { value: discoveryProfile.sport } : undefined,
      position: discoveryProfile.position ? { value: discoveryProfile.position } : undefined,
      social_platforms: discoveryProfile.social_platforms ? { value: discoveryProfile.social_platforms } : undefined,
      leadership_style: discoveryProfile.leadership_style ? { value: discoveryProfile.leadership_style } : undefined,
      personal_brand_statement: discoveryProfile.unique_story ? { value: discoveryProfile.unique_story } : undefined,
      brand_confidence_score: discoveryProfile.nil_interest_level ? { value: discoveryProfile.nil_interest_level } : undefined,
      state_nil_awareness: discoveryProfile.compliance_quiz_completed ? { value: 'yes' } : undefined,
      compliance_confidence_score: discoveryProfile.compliance_knowledge_score ? { value: discoveryProfile.compliance_knowledge_score } : undefined,
      support_network: discoveryProfile.communication_style ? { value: discoveryProfile.communication_style } : undefined,
      has_bank_account: discoveryProfile.has_bank_account !== undefined ? { value: discoveryProfile.has_bank_account } : undefined,
      tax_awareness: discoveryProfile.understands_tax_obligations !== undefined ? { value: discoveryProfile.understands_tax_obligations } : undefined,
      savings_goals: discoveryProfile.financial_goals ? { value: discoveryProfile.financial_goals } : undefined,
      financial_confidence_score: discoveryProfile.financial_independence_level ? { value: discoveryProfile.financial_independence_level } : undefined,
      causes_passionate_about: discoveryProfile.causes_passionate_about ? { value: discoveryProfile.causes_passionate_about } : undefined,
      legacy_statement: discoveryProfile.career_aspirations ? { value: discoveryProfile.career_aspirations } : undefined,
      vision_clarity_score: discoveryProfile.athletic_aspirations ? { value: discoveryProfile.athletic_aspirations } : undefined,
    } : {};

    // Calculate streak (simplified - would need activity tracking table in production)
    const { data: recentActivity } = await supabase
      .from('conversation_flows')
      .select('last_interaction_at')
      .eq('user_id', user.id)
      .single();

    let streak = 0;
    if (recentActivity?.last_interaction_at) {
      const lastActivity = new Date(recentActivity.last_interaction_at);
      const today = new Date();
      const daysSinceActivity = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceActivity <= 1) {
        streak = profile?.streak_count || 1;
      }
    }

    // Get daily question (rotate based on day of year)
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const dailyQuestion = dailyQuestions[dayOfYear % dailyQuestions.length];

    // Calculate discovery completion
    const totalPillars = 4;
    const completionPercentage = Math.round((unlockedChapters.length / totalPillars) * 100);
    const isDiscoveryComplete = unlockedChapters.length === 4;

    // Build profile summary by pillar
    const profileSummary = {
      identity: {
        unlocked: unlockedChapters.includes('identity'),
        data: {
          sport: profileData.sport,
          position: profileData.position,
          socialPlatforms: profileData.social_platforms,
          leadershipStyle: profileData.leadership_style,
          personalBrandStatement: profileData.personal_brand_statement,
        },
      },
      business: {
        unlocked: unlockedChapters.includes('business'),
        data: {
          stateNilAwareness: profileData.state_nil_awareness,
          complianceConfidenceScore: profileData.compliance_confidence_score,
          supportNetwork: profileData.support_network,
        },
      },
      money: {
        unlocked: unlockedChapters.includes('money'),
        data: {
          hasBankAccount: profileData.has_bank_account,
          taxAwareness: profileData.tax_awareness,
          savingsGoals: profileData.savings_goals,
          financialConfidenceScore: profileData.financial_confidence_score,
        },
      },
      legacy: {
        unlocked: unlockedChapters.includes('legacy'),
        data: {
          causesPassionateAbout: profileData.causes_passionate_about,
          legacyStatement: profileData.legacy_statement,
          visionClarityScore: profileData.vision_clarity_score,
        },
      },
    };

    // Determine consent status based on age
    const userAge = profile?.date_of_birth
      ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : 16; // Default to minor if unknown

    const consentStatus = userAge >= 18
      ? 'not_required'
      : profile?.consent_status || 'pending';

    // Look up connected parent name
    let parentName: string | undefined;
    if (consentStatus === 'approved') {
      // Try parent_child_relationships first
      const { data: parentRel } = await supabase
        .from('parent_child_relationships')
        .select('parent_id')
        .eq('child_id', user.id)
        .eq('consent_status', 'approved')
        .limit(1)
        .single();

      if (parentRel?.parent_id) {
        // Prefer users.full_name (human-readable) over athlete_profiles.username (system-generated)
        const { data: parentUser } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', parentRel.parent_id)
          .single();
        parentName = parentUser?.full_name || undefined;

        // Fallback to athlete_profiles.username
        if (!parentName) {
          const { data: parentProfile } = await supabase
            .from('athlete_profiles')
            .select('username')
            .eq('user_id', parentRel.parent_id)
            .single();
          parentName = parentProfile?.username || undefined;
        }
      }

      // Fallback: try parent_consent_invites
      if (!parentName) {
        const { data: invite } = await supabase
          .from('parent_consent_invites')
          .select('parent_name')
          .eq('student_id', user.id)
          .eq('status', 'approved')
          .limit(1)
          .single();
        parentName = invite?.parent_name || undefined;
      }
    }

    // Generate badges based on progress
    const badges = [];
    if (unlockedChapters.includes('identity')) {
      badges.push({
        id: 'identity-complete',
        name: 'Identity Explorer',
        description: 'Completed the Identity chapter',
        icon: '🎯',
        category: 'discovery' as const,
        earnedAt: new Date().toISOString(),
      });
    }
    if (unlockedChapters.includes('business')) {
      badges.push({
        id: 'business-complete',
        name: 'Business Basics',
        description: 'Completed the Business chapter',
        icon: '📋',
        category: 'discovery' as const,
        earnedAt: new Date().toISOString(),
      });
    }
    if (streak >= 3) {
      badges.push({
        id: 'streak-3',
        name: 'Getting Started',
        description: '3-day learning streak',
        icon: '🔥',
        category: 'streak' as const,
        earnedAt: new Date().toISOString(),
      });
    }
    if (isDiscoveryComplete) {
      badges.push({
        id: 'all-chapters',
        name: 'NIL Scholar',
        description: 'Completed all 4 chapters',
        icon: '🎓',
        category: 'milestone' as const,
        earnedAt: new Date().toISOString(),
      });
    }

    // Generate week activity (simplified - would track in production)
    const weekActivity = [false, false, false, false, false, false, false];
    if (recentActivity?.last_interaction_at) {
      const lastActivity = new Date(recentActivity.last_interaction_at);
      const today = new Date();
      const daysSinceActivity = Math.floor(
        (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceActivity < 7) {
        weekActivity[6 - daysSinceActivity] = true;
      }
      // Mark today as active if there was activity
      if (daysSinceActivity === 0) {
        weekActivity[6] = true;
      }
    }

    // Fetch real state NIL rules for the athlete's state
    const state = profile?.primary_state || 'CA';
    let stateRules = null;
    try {
      const { data: stateData } = await supabase
        .from('state_nil_rules')
        .select('state_name, state_code, high_school_allowed, allows_nil, summary_can_do, summary_cannot_do, summary_must_do, summary_warnings, athletic_association_name, athletic_association_url, detailed_summary, short_summary, disclaimer, prohibited_categories, requires_parental_consent, disclosure_deadline_days')
        .eq('state_code', state)
        .single();

      if (stateData) {
        stateRules = stateData;
      }
    } catch (e) {
      console.log('Could not fetch state NIL rules (non-critical)');
    }

    // Build response
    const dashboardData = {
      user: {
        id: user.id,
        fullName: profile?.username || user.email?.split('@')[0] || 'Athlete',
        sport: profile?.sport || profileData.sport?.value || 'Not set',
        school: profile?.school_name || 'High School',
        state,
        avatar: profile?.avatar_url,
        age: userAge,
      },
      discovery: {
        completionPercentage,
        currentPillar: (conversationFlow?.current_pillar || 'identity') as PillarType,
        currentDay: conversationFlow?.current_day || 1,
        unlockedChapters,
        isComplete: isDiscoveryComplete,
      },
      consent: {
        status: consentStatus,
        parentName,
        parentEmail: profile?.parent_email,
        requestedAt: profile?.consent_requested_at,
      },
      profile: profileSummary,
      stateRules,
      learningPath: {
        name: profile?.learning_path === 'foundation' ? 'Foundation Path' : 'Learning Path',
        progress: Math.min(completionPercentage + 10, 100),
        nextLesson: isDiscoveryComplete
          ? 'Advanced NIL Strategies'
          : `${PILLARS[conversationFlow?.current_pillar as PillarType || 'identity'].name} - Day ${conversationFlow?.current_day || 1}`,
      },
      badges,
      dailyQuestion,
      streak,
      longestStreak: profile?.longest_streak || streak,
      lastActivity: recentActivity?.last_interaction_at,
      weekActivity,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error loading HS student dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
