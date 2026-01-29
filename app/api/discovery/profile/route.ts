import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { PILLARS, PILLAR_ORDER, PillarType } from '@/lib/discovery/questions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get discovery profile
    const { data: profile, error: profileError } = await supabase
      .from('student_discovery_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get unlocked chapters
    const { data: chapters } = await supabase
      .from('chapter_unlocks')
      .select('*')
      .eq('user_id', user.id);

    // Get conversation flow for progress
    const { data: flow } = await supabase
      .from('conversation_flows')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Compile profile summary by pillar (using actual table columns, not profile_data JSONB)
    const unlockedChapters = chapters?.map(c => c.chapter_name as PillarType) || [];

    const summary = {
      identity: {
        unlocked: unlockedChapters.includes('identity'),
        data: {
          sport: profile?.sport,
          position: profile?.position,
          socialPlatforms: profile?.social_platforms,
          contentType: profile?.content_type,
          leadershipStyle: profile?.leadership_style,
          personalBrandStatement: profile?.unique_story,
          differentiator: profile?.personal_brand_keywords,
          brandConfidenceScore: profile?.nil_interest_level,
        },
      },
      business: {
        unlocked: unlockedChapters.includes('business'),
        data: {
          stateNilAwareness: profile?.nil_experience_level,
          previousApproaches: profile?.deal_types_interested,
          complianceConfidenceScore: profile?.compliance_knowledge_score,
          nilInterests: profile?.nil_interest_level,
          supportNetwork: profile?.communication_style,
        },
      },
      money: {
        unlocked: unlockedChapters.includes('money'),
        data: {
          workExperience: profile?.financial_independence_level,
          hasBankAccount: profile?.has_bank_account,
          taxAwareness: profile?.understands_tax_obligations,
          savingsGoals: profile?.financial_goals,
          financialConfidenceScore: profile?.financial_independence_level,
          financialMentors: null,
        },
      },
      legacy: {
        unlocked: unlockedChapters.includes('legacy'),
        data: {
          visionAt25: profile?.career_aspirations,
          athleticAspirations: profile?.athletic_aspirations,
          causesPassionateAbout: profile?.causes_passionate_about,
          platformMessage: profile?.community_involvement,
          legacyStatement: profile?.career_aspirations,
          visionClarityScore: null,
        },
      },
    };

    // Calculate overall completion
    const totalUnlocked = unlockedChapters.length;
    const completionPercentage = Math.round((totalUnlocked / 4) * 100);

    return NextResponse.json({
      profile: {
        id: profile?.id,
        userId: user.id,
        createdAt: profile?.created_at,
        updatedAt: profile?.updated_at,
      },
      summary,
      unlockedChapters,
      completionPercentage,
      isComplete: totalUnlocked === 4,
      currentPillar: flow?.current_pillar,
      currentDay: flow?.current_day,
    });
  } catch (error) {
    console.error('Error getting discovery profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
