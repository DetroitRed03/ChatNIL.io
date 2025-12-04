import { createClient } from '@/lib/supabase/server';
import type {
  DashboardMetrics,
  NILDeal,
  Opportunity,
  Notification,
  Event,
  QuickStats,
  QuizProgress,
  BadgeProgress,
  RecentChat,
  LearningStats
} from '@/types';

/**
 * Get dashboard metrics for athlete
 * Aggregates earnings, deals, profile views, and FMV score
 */
export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const supabase = await createClient();

  // Fetch user profile data
  const { data: user } = await supabase
    .from('users')
    .select('total_followers, avg_engagement_rate, profile_completion_score')
    .eq('id', userId)
    .single();

  // Fetch NIL deals to calculate earnings
  const { data: deals } = await supabase
    .from('nil_deals')
    .select('compensation_amount, status')
    .eq('athlete_id', userId);

  const totalEarnings = deals?.reduce((sum, deal) => {
    if (deal.status === 'completed') {
      return sum + (deal.compensation_amount || 0);
    }
    return sum;
  }, 0) || 0;

  const recentEarnings = deals?.filter(d => d.status === 'completed')
    .slice(0, 3)
    .reduce((sum, deal) => sum + (deal.compensation_amount || 0), 0) || 0;

  const activeDeals = deals?.filter(d => d.status === 'active').length || 0;
  const completedDeals = deals?.filter(d => d.status === 'completed').length || 0;

  // Profile views - use 0 until analytics system is implemented
  // TODO: Wire to real analytics when available
  const profileViews = 0;
  const viewsChange = 0;

  // Calculate FMV score (simplified version)
  const fmvScore = Math.floor(
    ((user?.total_followers || 0) / 1000) * 0.4 +
    ((user?.avg_engagement_rate || 0) * 10) * 0.3 +
    ((user?.profile_completion_score || 0)) * 0.3
  );

  return {
    totalEarnings,
    earningsChange: recentEarnings,
    activeDeals,
    completedDeals,
    profileViews,
    viewsChange,
    fmvScore,
    fmvChange: 0, // No mock changes - show 0 until analytics available
  };
}

/**
 * Get active NIL deals for athlete
 */
export async function getActiveDeals(userId: string): Promise<NILDeal[]> {
  const supabase = await createClient();

  const { data: deals } = await supabase
    .from('nil_deals')
    .select(`
      *,
      agency:users!nil_deals_agency_id_fkey(
        id,
        company_name,
        email
      )
    `)
    .eq('athlete_id', userId)
    .eq('status', 'active')
    .order('start_date', { ascending: false })
    .limit(5);

  return deals || [];
}

/**
 * Get matched opportunities for athlete
 */
export async function getMatchedOpportunities(userId: string): Promise<Opportunity[]> {
  const supabase = await createClient();

  // Fetch matched opportunities from agency_athlete_matches
  const { data: matches } = await supabase
    .from('agency_athlete_matches')
    .select(`
      *,
      agency:users!agency_athlete_matches_agency_id_fkey(
        id,
        company_name,
        industry,
        campaign_interests
      )
    `)
    .eq('athlete_id', userId)
    .eq('match_status', 'potential')
    .gte('match_score', 70)
    .order('match_score', { ascending: false })
    .limit(10);

  // Transform matches into opportunities
  const opportunities: Opportunity[] = (matches || []).map((match) => ({
    id: match.id,
    title: `${match.agency?.campaign_interests?.[0] || 'Brand'} Campaign`,
    brand_name: match.agency?.company_name || 'Agency',
    description: `Partnership opportunity in ${match.agency?.industry || 'your industry'}`,
    compensation_min: 1000,
    compensation_max: 5000,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    match_score: Math.floor(match.match_score),
    status: 'open',
  }));

  return opportunities;
}

/**
 * Get notifications for athlete
 * TODO: Implement real notifications system
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient();
  const notifications: Notification[] = [];

  // Generate notifications from agency matches (last 7 days)
  const { data: recentMatches } = await supabase
    .from('agency_athlete_matches')
    .select(`
      id,
      agency_id,
      match_score,
      status,
      created_at,
      users!agency_athlete_matches_agency_id_fkey(first_name, last_name)
    `)
    .eq('athlete_id', userId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })
    .limit(5);

  recentMatches?.forEach(match => {
    const agencyUser = match.users as any;
    const agencyName = `${agencyUser?.first_name || ''} ${agencyUser?.last_name || ''}`.trim() || 'A brand';

    notifications.push({
      id: `match-${match.id}`,
      user_id: userId,
      type: 'match',
      message: `${agencyName} wants to partner with you (${match.match_score}% match!)`,
      url: '/discover',
      read: false,
      created_at: match.created_at,
    });
  });

  // Generate notifications from NIL deals (last 30 days)
  const { data: recentDeals } = await supabase
    .from('nil_deals')
    .select('id, brand_name, deal_type, status, compensation_amount, created_at, updated_at')
    .eq('athlete_id', userId)
    .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('updated_at', { ascending: false })
    .limit(5);

  recentDeals?.forEach(deal => {
    const dealTypeLabel = deal.deal_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Deal';

    if (deal.status === 'completed' && deal.compensation_amount) {
      notifications.push({
        id: `deal-payment-${deal.id}`,
        user_id: userId,
        type: 'deal',
        message: `${deal.brand_name} payment received: $${deal.compensation_amount.toLocaleString()}`,
        url: '/nil-deals',
        read: false,
        created_at: deal.updated_at,
      });
    } else if (deal.status === 'active') {
      notifications.push({
        id: `deal-active-${deal.id}`,
        user_id: userId,
        type: 'deal',
        message: `${deal.brand_name} ${dealTypeLabel} is now active`,
        url: '/nil-deals',
        read: false,
        created_at: deal.updated_at,
      });
    } else if (deal.status === 'pending') {
      notifications.push({
        id: `deal-pending-${deal.id}`,
        user_id: userId,
        type: 'deal',
        message: `New ${dealTypeLabel} proposal from ${deal.brand_name}`,
        url: '/nil-deals',
        read: false,
        created_at: deal.created_at,
      });
    }
  });

  // Generate notifications from campaign invites (using agency_campaigns table)
  const { data: pendingInvites } = await supabase
    .from('campaign_athletes')
    .select(`
      id,
      campaign_id,
      status,
      invited_at
    `)
    .eq('athlete_id', userId)
    .eq('status', 'invited')
    .order('invited_at', { ascending: false })
    .limit(10);

  // Fetch campaign and agency info separately for invites
  if (pendingInvites && pendingInvites.length > 0) {
    const campaignIds = pendingInvites.map(inv => inv.campaign_id);

    // Get campaigns from agency_campaigns table
    const { data: campaigns } = await supabase
      .from('agency_campaigns')
      .select('id, name, agency_id')
      .in('id', campaignIds);

    const campaignMap = new Map(campaigns?.map(c => [c.id, c]) || []);
    const agencyIds = [...new Set(campaigns?.map(c => c.agency_id).filter(Boolean) || [])];

    // Get agency names
    const { data: agencies } = await supabase
      .from('agencies')
      .select('id, company_name')
      .in('id', agencyIds);

    const agencyMap = new Map(agencies?.map(a => [a.id, a.company_name]) || []);

    pendingInvites.forEach(invite => {
      const campaign = campaignMap.get(invite.campaign_id);
      const agencyName = campaign ? agencyMap.get(campaign.agency_id) : null;

      notifications.push({
        id: `invite-${invite.id}`,
        user_id: userId,
        type: 'invite',
        message: `${agencyName || 'A brand'} invited you to their campaign "${campaign?.name || 'Untitled'}"`,
        url: `/opportunities?invite=${invite.campaign_id}`,
        read: false,
        created_at: invite.invited_at,
      });
    });
  }

  // Sort all notifications by timestamp (most recent first)
  notifications.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return notifications.slice(0, 10); // Return top 10 most recent
}

/**
 * Get upcoming events from deal deliverables
 */
export async function getUpcomingEvents(userId: string): Promise<Event[]> {
  const supabase = await createClient();

  // Fetch active deals with deliverables
  const { data: deals } = await supabase
    .from('nil_deals')
    .select('id, deal_title, brand_name, deliverables')
    .eq('athlete_id', userId)
    .in('status', ['active', 'pending']);

  const events: Event[] = [];

  // Extract deliverable deadlines
  deals?.forEach((deal) => {
    if (deal.deliverables && Array.isArray(deal.deliverables)) {
      deal.deliverables.forEach((deliverable: any, index: number) => {
        if (deliverable.deadline) {
          events.push({
            id: `${deal.id}-deliverable-${index}`,
            title: deliverable.type || deliverable.description || 'Deliverable due',
            type: 'deliverable',
            date: deliverable.deadline,
            deal_id: deal.id,
            deal_title: deal.deal_title || deal.brand_name || 'NIL Deal',
          });
        }
      });
    }
  });

  // Sort by date and return upcoming events (only future events)
  return events
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
}

/**
 * Get quick stats for athlete
 */
export async function getQuickStats(userId: string): Promise<QuickStats> {
  const supabase = await createClient();

  // Fetch deals for calculations
  const { data: deals } = await supabase
    .from('nil_deals')
    .select('status, created_at')
    .eq('athlete_id', userId);

  const totalDeals = deals?.length || 0;
  const completedDeals = deals?.filter(d => d.status === 'completed').length || 0;
  const activeDeals = deals?.filter(d => d.status === 'active').length || 0;

  // Calculate success rate
  const dealSuccessRate = totalDeals > 0
    ? Math.round((completedDeals / totalDeals) * 100)
    : 0;

  // Response metrics - show 0 until messaging system is implemented
  // TODO: Wire to real messaging system when available
  const responseRate = 0;
  const avgResponseTime = '--';

  // Profile growth - show 0 until analytics available
  const profileGrowth = 0;

  return {
    responseRate,
    avgResponseTime,
    dealSuccessRate,
    profileGrowth,
  };
}

// Badge milestones for quiz gamification
const BADGE_MILESTONES = [
  { threshold: 5, name: "Quiz Rookie 🌱" },
  { threshold: 10, name: "Quiz Pro ⭐" },
  { threshold: 25, name: "Quiz Master 🏆" },
  { threshold: 50, name: "NIL Expert 👑" },
];

function calculateBadgeProgress(totalQuizzes: number) {
  const nextMilestone = BADGE_MILESTONES.find(m => m.threshold > totalQuizzes)
    || BADGE_MILESTONES[BADGE_MILESTONES.length - 1];
  const prevThreshold = BADGE_MILESTONES
    .filter(m => m.threshold <= totalQuizzes)
    .pop()?.threshold || 0;

  const quizzesUntilBadge = Math.max(0, nextMilestone.threshold - totalQuizzes);
  const progressRange = nextMilestone.threshold - prevThreshold;
  const currentProgress = totalQuizzes - prevThreshold;
  const nextBadgeProgress = progressRange > 0
    ? Math.min(100, Math.round((currentProgress / progressRange) * 100))
    : 100;

  return {
    nextBadgeName: nextMilestone.name,
    quizzesUntilBadge,
    nextBadgeProgress
  };
}

function calculateStreak(attempts: any[]): number {
  if (!attempts || attempts.length === 0) return 0;

  // Sort by date descending
  const sorted = [...attempts].sort((a, b) =>
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const attempt of sorted) {
    const attemptDate = new Date(attempt.completed_at);
    attemptDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0 || daysDiff === 1) {
      streak++;
      currentDate = attemptDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get quiz progress for athlete
 * Shows recent quiz attempts, completion stats, and gamification data
 */
export async function getQuizProgress(userId: string): Promise<QuizProgress> {
  const supabase = await createClient();

  // Fetch quiz attempts
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(5);

  // Calculate completion stats
  const { data: allAttempts } = await supabase
    .from('quiz_attempts')
    .select('score_percentage, category, completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  const totalQuizzes = allAttempts?.length || 0;
  const averageScore = allAttempts && allAttempts.length > 0
    ? Math.round(allAttempts.reduce((sum, a) => sum + (a.score_percentage || 0), 0) / allAttempts.length)
    : 0;

  // Get unique categories completed
  const categoriesCompleted = new Set(allAttempts?.map(a => a.category) || []).size;

  // Calculate gamification metrics
  const currentStreak = calculateStreak(allAttempts || []);
  const totalPoints = allAttempts
    ? allAttempts.reduce((sum, a) => sum + Math.round((a.score_percentage || 0) * 10), 0)
    : 0;
  const badgeProgress = calculateBadgeProgress(totalQuizzes);

  return {
    recentQuizzes: (attempts || []).map(a => ({
      id: a.id,
      category: a.category,
      score: a.score_percentage,
      completedAt: a.completed_at,
      questionsCorrect: a.questions_correct,
      questionsTotal: a.questions_total,
    })),
    totalQuizzes,
    averageScore,
    categoriesCompleted,
    nextRecommended: 'NIL Basics',
    currentStreak,
    totalPoints,
    ...badgeProgress
  };
}

/**
 * Get badge progress for athlete
 * Shows earned badges and stats
 */
export async function getBadgeProgress(userId: string): Promise<BadgeProgress> {
  const supabase = await createClient();

  // Fetch earned badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select(`
      id,
      earned_at,
      badge:badges(
        id,
        name,
        description,
        icon_url,
        rarity,
        points
      )
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
    .limit(5);

  // Get total badge count
  const { data: allBadges } = await supabase
    .from('badges')
    .select('id, points')
    .eq('is_active', true);

  const totalBadges = allBadges?.length || 0;
  const earnedCount = userBadges?.length || 0;
  const totalPoints = userBadges?.reduce((sum, ub: any) => sum + (ub.badge?.points || 0), 0) || 0;

  return {
    recentBadges: (userBadges || []).map((ub: any) => ({
      id: ub.badge?.id || '',
      name: ub.badge?.name || '',
      description: ub.badge?.description || '',
      iconUrl: ub.badge?.icon_url,
      rarity: ub.badge?.rarity || 'common',
      points: ub.badge?.points || 0,
      earnedAt: ub.earned_at,
    })),
    totalBadges,
    earnedCount,
    totalPoints,
    completionPercentage: totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0,
  };
}

/**
 * Get recent AI chat conversations
 */
export async function getRecentChats(userId: string): Promise<RecentChat[]> {
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select(`
      id,
      title,
      updated_at,
      is_archived
    `)
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching chat sessions:', error);
    return [];
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  // Fetch messages for each session to get last message and count
  const chatsWithMessages = await Promise.all(
    sessions.map(async (session) => {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('content, created_at, role')
        .eq('session_id', session.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id);

      const lastMessage = messages && messages.length > 0 ? messages[0] : null;

      return {
        id: session.id,
        title: session.title,
        lastMessage: lastMessage?.content || 'No messages yet',
        updatedAt: session.updated_at,
        messageCount: count || 0,
      };
    })
  );

  return chatsWithMessages;
}


/**
 * Get learning stats for athlete
 * Overall education metrics
 */
export async function getLearningStats(userId: string): Promise<LearningStats> {
  const supabase = await createClient();

  // Get quiz stats
  const { data: quizzes } = await supabase
    .from('quiz_attempts')
    .select('score_percentage, completed_at')
    .eq('user_id', userId);

  const averageScore = quizzes && quizzes.length > 0
    ? Math.round(quizzes.reduce((sum, q) => sum + (q.score_percentage || 0), 0) / quizzes.length)
    : 0;

  // Get badge count
  const { data: badges } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId);

  const badgesEarned = badges?.length || 0;

  // Calculate quiz streak using the shared function
  const quizStreak = calculateStreak(quizzes || []);

  // Calculate knowledge level based on average score
  let knowledgeLevel = 'Beginner';
  if (averageScore >= 90) knowledgeLevel = 'Expert';
  else if (averageScore >= 75) knowledgeLevel = 'Advanced';
  else if (averageScore >= 60) knowledgeLevel = 'Intermediate';

  return {
    knowledgeLevel,
    averageScore,
    badgesEarned,
    quizStreak,
    scoreChange: 0, // No mock data - show 0 until we calculate real changes
  };
}
