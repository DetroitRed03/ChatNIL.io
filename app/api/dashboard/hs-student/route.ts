import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { PillarType, PILLARS } from '@/lib/discovery/questions';

export const dynamic = 'force-dynamic';

// Daily questions pool
const dailyQuestions = [
  {
    id: 'dq-1',
    question: 'If you could partner with any brand, which one would you choose and why?',
    category: 'Identity',
  },
  {
    id: 'dq-2',
    question: 'What\'s one thing you learned about NIL this week?',
    category: 'Business',
  },
  {
    id: 'dq-3',
    question: 'If you earned $500 from NIL, how would you split it between spending, saving, and taxes?',
    category: 'Money',
  },
  {
    id: 'dq-4',
    question: 'What impact do you want to have on younger athletes in your community?',
    category: 'Legacy',
  },
  {
    id: 'dq-5',
    question: 'Describe your personal brand in three words.',
    category: 'Identity',
  },
  {
    id: 'dq-6',
    question: 'What would be a red flag in an NIL deal offer?',
    category: 'Business',
  },
  {
    id: 'dq-7',
    question: 'What\'s one money habit you want to build this month?',
    category: 'Money',
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

    // Build response
    const dashboardData = {
      user: {
        id: user.id,
        fullName: profile?.username || user.email?.split('@')[0] || 'Athlete',
        sport: profile?.sport || profileData.sport?.value || 'Not set',
        school: profile?.school_name || 'High School',
        state: profile?.primary_state || 'CA',
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
