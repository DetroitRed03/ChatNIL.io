import { SupabaseClient } from '@supabase/supabase-js';
import { UserRole } from '../system-prompts';
import { getStateRulesContext } from './state-rules-context';

export async function buildUserContext(
  userId: string,
  role: UserRole,
  supabase: SupabaseClient
): Promise<Record<string, string | number | null>> {
  switch (role) {
    case 'hs_student':
      return buildHSStudentContext(userId, supabase);
    case 'college_athlete':
      return buildCollegeAthleteContext(userId, supabase);
    case 'parent':
      return buildParentContext(userId, supabase);
    case 'compliance_officer':
      return buildComplianceOfficerContext(userId, supabase);
    default:
      return {};
  }
}

async function buildHSStudentContext(userId: string, supabase: SupabaseClient) {
  // === 1. ATHLETE PROFILE ===
  let profile: any = null;
  const { data: profileById } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileById) {
    profile = profileById;
  } else {
    const { data: profileByUserId } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    profile = profileByUserId;
  }

  // === 2. CONVERSATION FLOW (learning progress) ===
  const { data: flow } = await supabase
    .from('conversation_flows')
    .select('*')
    .eq('user_id', userId)
    .single();

  // === 3. CHAPTER UNLOCKS ===
  const { data: chapters } = await supabase
    .from('chapter_unlocks')
    .select('chapter_name')
    .eq('user_id', userId);

  // === 4. CHAPTER PROGRESS (actual answers to text questions) ===
  const { data: chapterProgress } = await supabase
    .from('chapter_progress')
    .select('pillar, question_id, answer, quality_score, ai_feedback')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // === 5. DAILY CHALLENGE ANSWERS ===
  const { data: dailyAnswers } = await supabase
    .from('daily_question_answers')
    .select('question_id, answer, quality_score, ai_feedback, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  // === 6. QUIZ RESULTS ===
  const { data: quizResults } = await supabase
    .from('user_quiz_progress')
    .select('question_id, is_correct, points_earned, session_score, session_total_questions')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  // === 7. DISCOVERY PROFILE (rich self-discovery data) ===
  const { data: discoveryProfile } = await supabase
    .from('student_discovery_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // === 8. PARENT CONSENT ===
  const { data: parentRelationship } = await supabase
    .from('parent_child_relationships')
    .select('consent_status, relationship_type')
    .eq('child_id', userId)
    .single();

  // === 9. STATE RULES ===
  const stateCode = profile?.primary_state || profile?.state || discoveryProfile?.state_code;
  const stateRules = await getStateRulesContext(stateCode, supabase);

  // === BUILD CONTEXT ===
  const pillarsCompleted = chapters?.map(c => c.chapter_name) || [];
  const userName = profile?.username || profile?.full_name || discoveryProfile?.full_name || 'Athlete';
  const userSport = profile?.sport || discoveryProfile?.sport || 'Unknown';
  const userState = stateCode || 'Unknown';
  const userSchool = profile?.school_name || profile?.school || discoveryProfile?.team_name || 'Unknown';
  const graduationYear = profile?.graduation_year || discoveryProfile?.graduation_year || 'Unknown';

  // Format chapter answers for AI context (the user's actual reflections)
  const chapterInsights = (chapterProgress || [])
    .filter((p: any) => p.answer && p.answer.length > 20)
    .slice(0, 8)
    .map((p: any) => `[${p.pillar}] "${p.answer.substring(0, 150)}${p.answer.length > 150 ? '...' : ''}"${p.quality_score ? ` (quality: ${p.quality_score}/5)` : ''}`)
    .join('\n');

  // Format daily challenge answers
  const dailyInsights = (dailyAnswers || [])
    .filter((a: any) => a.answer && a.answer.length > 20)
    .slice(0, 5)
    .map((a: any) => `"${a.answer.substring(0, 120)}${a.answer.length > 120 ? '...' : ''}"${a.quality_score ? ` (quality: ${a.quality_score}/5)` : ''}`)
    .join('\n');

  // Quiz performance summary
  const totalQuizAnswered = quizResults?.length || 0;
  const quizCorrect = quizResults?.filter((q: any) => q.is_correct)?.length || 0;
  const quizAccuracy = totalQuizAnswered > 0 ? Math.round((quizCorrect / totalQuizAnswered) * 100) : 0;

  // Discovery profile insights
  const personalityTraits = discoveryProfile?.personality_traits?.join(', ') || '';
  const brandKeywords = discoveryProfile?.personal_brand_keywords?.join(', ') || '';
  const brandValues = discoveryProfile?.brand_values?.join(', ') || '';
  const interests = profile?.interests?.join(', ') || discoveryProfile?.deal_types_interested?.join(', ') || '';
  const bio = profile?.bio || discoveryProfile?.unique_story || '';
  const nilInterestLevel = discoveryProfile?.nil_interest_level || 'exploring';
  const causes = discoveryProfile?.causes_passionate_about?.join(', ') || '';

  // Social media
  const socialPlatforms = discoveryProfile?.social_platforms;
  const followerCount = discoveryProfile?.follower_count_total || 0;
  const instagramHandle = profile?.instagram_handle || '';
  const tiktokHandle = profile?.tiktok_handle || '';

  // XP and level
  const currentXP = profile?.current_xp || profile?.lifetime_xp || 0;
  const level = profile?.level || 1;
  const streak = profile?.streak_count || 0;

  // Build what they haven't done yet (for AI to suggest)
  const opportunities: string[] = [];
  if (!bio) opportunities.push('Write their bio');
  if (pillarsCompleted.length < 4) opportunities.push(`Complete remaining chapters (${4 - pillarsCompleted.length} left)`);
  if (!instagramHandle && !tiktokHandle) opportunities.push('Connect social media accounts');
  if (totalQuizAnswered === 0) opportunities.push('Take NIL quizzes to test knowledge');
  if (!causes) opportunities.push('Identify causes they care about');

  return {
    USER_NAME: userName,
    USER_STATE: userState,
    USER_SPORT: userSport,
    USER_SCHOOL: userSchool,
    GRADUATION_YEAR: graduationYear,
    CURRENT_PILLAR: flow?.current_pillar || 'identity',
    PILLARS_COMPLETED: pillarsCompleted.length > 0 ? pillarsCompleted.join(', ') : 'None yet',
    CONSENT_STATUS: parentRelationship?.consent_status || profile?.consent_status || 'pending',
    STATE_RULES: stateRules,
    STATE_SPECIFIC_ANSWER: stateRules.includes('Allowed')
      ? 'Good news - your state does allow some NIL activities for high school athletes! But there are still rules to follow.'
      : 'Your state currently has restrictions on high school NIL. Focus on building your brand now so you\'re ready for college!',
    // XP & Progress
    XP_LEVEL: `Level ${level} (${currentXP} XP)`,
    STREAK: streak > 0 ? `${streak} day streak` : 'No active streak',
    QUIZ_PERFORMANCE: totalQuizAnswered > 0 ? `${quizAccuracy}% accuracy (${quizCorrect}/${totalQuizAnswered} correct)` : 'No quizzes taken yet',
    // Personal brand
    BIO: bio || 'Not written yet',
    PERSONALITY_TRAITS: personalityTraits || 'Not discovered yet',
    BRAND_KEYWORDS: brandKeywords || 'Not identified yet',
    BRAND_VALUES: brandValues || 'Not explored yet',
    INTERESTS: interests || 'Not specified yet',
    NIL_INTEREST_LEVEL: nilInterestLevel,
    CAUSES: causes || 'Not identified yet',
    // Social media
    SOCIAL_MEDIA: instagramHandle || tiktokHandle
      ? [instagramHandle ? `Instagram: @${instagramHandle}` : '', tiktokHandle ? `TikTok: @${tiktokHandle}` : ''].filter(Boolean).join(', ')
      : 'No accounts connected',
    FOLLOWER_COUNT: followerCount > 0 ? followerCount.toLocaleString() : 'Unknown',
    // Self-discovery insights (what they've actually said about themselves)
    CHAPTER_INSIGHTS: chapterInsights || 'No chapter answers yet',
    DAILY_CHALLENGE_INSIGHTS: dailyInsights || 'No daily challenge answers yet',
    // Opportunities
    OPPORTUNITIES: opportunities.length > 0 ? opportunities.join('; ') : 'All caught up!',
  };
}

async function buildCollegeAthleteContext(userId: string, supabase: SupabaseClient) {
  // Try both id and user_id for profile lookup
  let profile = null;
  const { data: profileById } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileById) {
    profile = profileById;
  } else {
    const { data: profileByUserId } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    profile = profileByUserId;
  }

  // Get deals with compliance scores
  const { data: deals } = await supabase
    .from('nil_deals')
    .select(`
      *,
      compliance_scores (*)
    `)
    .eq('athlete_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const stateRules = await getStateRulesContext(profile?.primary_state || profile?.state, supabase);

  // Calculate compliance status
  let overallStatus = 'green';
  let totalEarnings = 0;

  deals?.forEach(deal => {
    totalEarnings += deal.compensation || 0;
    const score = deal.compliance_scores?.[0];
    if (score?.status === 'red') overallStatus = 'red';
    else if (score?.status === 'yellow' && overallStatus !== 'red') overallStatus = 'yellow';
  });

  const recentDeals = deals?.map(d =>
    `- ${d.third_party_name}: $${d.compensation} (${d.compliance_scores?.[0]?.status || 'pending'})`
  ).join('\n') || 'No deals yet';

  return {
    USER_NAME: profile?.username || profile?.full_name || 'Athlete',
    USER_STATE: profile?.primary_state || profile?.state || 'Unknown',
    USER_SPORT: profile?.sport || 'Unknown',
    USER_SCHOOL: profile?.school_name || profile?.school || 'Unknown',
    DEAL_COUNT: deals?.length || 0,
    COMPLIANCE_STATUS: overallStatus.toUpperCase(),
    TOTAL_EARNINGS: `$${totalEarnings.toLocaleString()}`,
    STATE_RULES: stateRules,
    RECENT_DEALS: recentDeals
  };
}

async function buildParentContext(userId: string, supabase: SupabaseClient) {
  // Get parent profile
  let profile = null;
  const { data: profileById } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileById) {
    profile = profileById;
  } else {
    const { data: profileByUserId } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    profile = profileByUserId;
  }

  // Get linked children
  const { data: relationships } = await supabase
    .from('parent_child_relationships')
    .select('*')
    .eq('parent_id', userId);

  let child = null;
  let stateRules = 'State rules not available';
  let childProgress = 0;
  let childCurrentPillar = 'identity';

  if (relationships && relationships.length > 0) {
    // Get first child's profile
    const { data: childProfile } = await supabase
      .from('athlete_profiles')
      .select('*')
      .or(`id.eq.${relationships[0].child_id},user_id.eq.${relationships[0].child_id}`)
      .single();

    child = childProfile;

    if (child) {
      stateRules = await getStateRulesContext(child.primary_state || child.state, supabase);

      // Get child's learning progress
      const { data: chapters } = await supabase
        .from('chapter_unlocks')
        .select('chapter_name')
        .eq('user_id', relationships[0].child_id);

      const pillarsCompleted = chapters?.length || 0;
      childProgress = Math.round((pillarsCompleted / 4) * 100);

      const { data: flow } = await supabase
        .from('conversation_flows')
        .select('current_pillar')
        .eq('user_id', relationships[0].child_id)
        .single();

      childCurrentPillar = flow?.current_pillar || 'identity';
    }
  }

  return {
    USER_NAME: profile?.username || profile?.full_name || 'Parent',
    CHILD_NAME: child?.username || child?.full_name || 'Your child',
    CHILD_STATE: child?.primary_state || child?.state || 'Unknown',
    CHILD_SPORT: child?.sport || 'Unknown',
    CHILD_CURRENT_PILLAR: childCurrentPillar,
    CHILD_PROGRESS_PERCENT: childProgress,
    CONSENT_STATUS: relationships?.[0]?.consent_status || 'pending',
    STATE_RULES: stateRules
  };
}

async function buildComplianceOfficerContext(userId: string, supabase: SupabaseClient) {
  // Get officer profile
  let profile = null;
  const { data: profileById } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileById) {
    profile = profileById;
  } else {
    const { data: profileByUserId } = await supabase
      .from('athlete_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    profile = profileByUserId;
  }

  const institutionId = profile?.institution_id;
  const institutionName = profile?.school_name || profile?.school || 'Unknown Institution';
  const institutionState = profile?.primary_state || profile?.state;

  // Get all athletes at institution
  const { data: athletes } = await supabase
    .from('athlete_profiles')
    .select('id, user_id')
    .eq('role', 'college_athlete')
    .eq('institution_id', institutionId);

  const athleteIds = athletes?.map(a => a.user_id || a.id) || [];

  // Get all deals for these athletes
  let deals: Array<{ athlete_id: string; compliance_scores?: Array<{ status: string }> }> = [];
  if (athleteIds.length > 0) {
    const { data: dealsData } = await supabase
      .from('nil_deals')
      .select(`
        athlete_id,
        compliance_scores (status)
      `)
      .in('athlete_id', athleteIds);
    deals = dealsData || [];
  }

  // Calculate stats
  let green = 0, yellow = 0, red = 0, noDeals = 0;

  athletes?.forEach(athlete => {
    const athleteDeals = deals.filter(d => d.athlete_id === athlete.id || d.athlete_id === athlete.user_id);
    if (athleteDeals.length === 0) {
      noDeals++;
      return;
    }

    let worstStatus = 'green';
    athleteDeals.forEach(deal => {
      const status = deal.compliance_scores?.[0]?.status;
      if (status === 'red') worstStatus = 'red';
      else if (status === 'yellow' && worstStatus !== 'red') worstStatus = 'yellow';
    });

    if (worstStatus === 'red') red++;
    else if (worstStatus === 'yellow') yellow++;
    else green++;
  });

  const total = green + yellow + red + noDeals;
  const stateRules = await getStateRulesContext(institutionState, supabase);

  return {
    USER_NAME: profile?.username || profile?.full_name || 'Compliance Officer',
    INSTITUTION_NAME: institutionName,
    INSTITUTION_STATE: institutionState || 'Unknown',
    TOTAL_ATHLETES: total,
    GREEN_COUNT: green,
    GREEN_PERCENT: total > 0 ? Math.round((green / total) * 100) : 0,
    YELLOW_COUNT: yellow,
    YELLOW_PERCENT: total > 0 ? Math.round((yellow / total) * 100) : 0,
    RED_COUNT: red,
    RED_PERCENT: total > 0 ? Math.round((red / total) * 100) : 0,
    NO_DEALS_COUNT: noDeals,
    ALERT_COUNT: red + yellow,
    DEADLINE_COUNT: 0, // Would calculate from deal dates
    STATE_RULES: stateRules
  };
}
