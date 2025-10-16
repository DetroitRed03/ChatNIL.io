/**
 * Badge Service Layer
 * Handles all badge-related operations including fetching, awarding, and progress tracking
 * NOTE: This is for CLIENT-SIDE operations only. For server-side operations, use badges-server.ts
 */

import { supabase } from './supabase';
import { Badge, UserBadge } from './types';

export interface BadgeStats {
  totalBadges: number;
  earnedCount: number;
  totalPoints: number;
  completionPercentage: number;
}

export interface BadgeWithEarnedStatus extends Badge {
  isEarned: boolean;
  earnedAt?: string;
  userBadgeId?: string;
}

/**
 * Fetch all available badges from the database
 */
export async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching badges:', error);
    throw new Error('Failed to fetch badges');
  }

  return data || [];
}

/**
 * Fetch all badges earned by a specific user
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badges (*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    throw new Error('Failed to fetch user badges');
  }

  return data || [];
}

/**
 * Get badges with earned status for a user
 */
export async function getBadgesWithStatus(userId: string): Promise<BadgeWithEarnedStatus[]> {
  const [allBadges, userBadges] = await Promise.all([
    getAllBadges(),
    getUserBadges(userId)
  ]);

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const earnedBadgeMap = new Map(
    userBadges.map(ub => [ub.badge_id, { earnedAt: ub.earned_at, userBadgeId: ub.id }])
  );

  return allBadges.map(badge => {
    const isEarned = earnedBadgeIds.has(badge.id);
    const earnedInfo = earnedBadgeMap.get(badge.id);

    return {
      ...badge,
      isEarned,
      earnedAt: earnedInfo?.earnedAt,
      userBadgeId: earnedInfo?.userBadgeId
    };
  });
}

/**
 * Get locked badges (not yet earned) for a user
 */
export async function getLockedBadges(userId: string): Promise<Badge[]> {
  const badgesWithStatus = await getBadgesWithStatus(userId);
  return badgesWithStatus
    .filter(badge => !badge.isEarned)
    .map(({ isEarned, earnedAt, userBadgeId, ...badge }) => badge);
}

/**
 * Get earned badges for a user
 */
export async function getEarnedBadges(userId: string): Promise<UserBadge[]> {
  return getUserBadges(userId);
}

/**
 * Get badge statistics for a user
 */
export async function getBadgeStats(userId: string): Promise<BadgeStats> {
  const [allBadges, userBadges] = await Promise.all([
    getAllBadges(),
    getUserBadges(userId)
  ]);

  const totalBadges = allBadges.length;
  const earnedCount = userBadges.length;

  // Calculate total points from earned badges
  const totalPoints = userBadges.reduce((sum, ub) => {
    const badgePoints = (ub.badge as any)?.points || 0;
    return sum + badgePoints;
  }, 0);

  const completionPercentage = totalBadges > 0
    ? Math.round((earnedCount / totalBadges) * 100)
    : 0;

  return {
    totalBadges,
    earnedCount,
    totalPoints,
    completionPercentage
  };
}

/**
 * Award a badge to a user
 * Returns the user_badge record if awarded, or null if already earned
 */
export async function awardBadge(
  userId: string,
  badgeId: string,
  awardedBy?: string,
  notes?: string
): Promise<UserBadge | null> {
  // First check if user already has this badge
  const { data: existing, error: checkError } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .single();

  if (existing) {
    console.log(`User ${userId} already has badge ${badgeId}`);
    return null;
  }

  // Award the badge
  const { data, error } = await supabase
    .from('user_badges')
    .insert({
      user_id: userId,
      badge_id: badgeId,
      awarded_by: awardedBy || null,
      notes: notes || null,
      is_displayed: true // Auto-display newly earned badges
    })
    .select(`
      *,
      badge:badges (*)
    `)
    .single();

  if (error) {
    console.error('Error awarding badge:', error);
    throw new Error('Failed to award badge');
  }

  console.log(`✅ Badge awarded: ${badgeId} to user ${userId}`);
  return data;
}

/**
 * Award a badge by name (helper for common operations)
 */
export async function awardBadgeByName(
  userId: string,
  badgeName: string,
  awardedBy?: string,
  notes?: string
): Promise<UserBadge | null> {
  // Find badge by name
  const { data: badge, error: badgeError } = await supabase
    .from('badges')
    .select('id')
    .eq('name', badgeName)
    .eq('is_active', true)
    .single();

  if (badgeError || !badge) {
    console.error(`Badge not found: ${badgeName}`, badgeError);
    throw new Error(`Badge "${badgeName}" not found`);
  }

  return awardBadge(userId, badge.id, awardedBy, notes);
}

/**
 * Check and award badge based on trigger action
 */
export async function checkAndAwardBadgeForAction(
  userId: string,
  action: 'onboarding_complete' | 'first_message' | 'first_quiz' | 'profile_complete'
): Promise<UserBadge | null> {
  let badgeName: string;

  switch (action) {
    case 'onboarding_complete':
      badgeName = 'First Steps';
      break;
    case 'first_message':
      badgeName = 'First Steps'; // Based on migration, "First Steps" is for first message
      break;
    case 'first_quiz':
      badgeName = 'NIL Novice';
      break;
    case 'profile_complete':
      badgeName = 'Profile Complete';
      break;
    default:
      console.warn(`Unknown badge action: ${action}`);
      return null;
  }

  try {
    const userBadge = await awardBadgeByName(
      userId,
      badgeName,
      undefined,
      `Awarded for: ${action}`
    );

    if (userBadge) {
      console.log(`🎉 Badge "${badgeName}" awarded to user ${userId} for action: ${action}`);
    }

    return userBadge;
  } catch (error) {
    console.error(`Error checking/awarding badge for action ${action}:`, error);
    return null;
  }
}

/**
 * Calculate progress toward a badge based on criteria
 */
export async function getBadgeProgress(
  userId: string,
  badgeId: string
): Promise<{ current: number; required: number; percentage: number; description: string }> {
  // Fetch the badge to get criteria
  const { data: badge, error } = await supabase
    .from('badges')
    .select('*')
    .eq('id', badgeId)
    .single();

  if (error || !badge) {
    throw new Error('Badge not found');
  }

  const criteria = badge.criteria || {};

  // Check different criteria types
  if (criteria.messages_sent) {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('role', 'user');

    return {
      current: count || 0,
      required: criteria.messages_sent,
      percentage: Math.min(100, Math.round(((count || 0) / criteria.messages_sent) * 100)),
      description: `Send ${criteria.messages_sent} messages`
    };
  }

  if (criteria.quizzes_completed) {
    const { count } = await supabase
      .from('user_quiz_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    return {
      current: count || 0,
      required: criteria.quizzes_completed,
      percentage: Math.min(100, Math.round(((count || 0) / criteria.quizzes_completed) * 100)),
      description: `Complete ${criteria.quizzes_completed} quizzes`
    };
  }

  if (criteria.profile_completion) {
    // This would require profile completion calculation
    // For now, return 0
    return {
      current: 0,
      required: criteria.profile_completion,
      percentage: 0,
      description: `Complete ${criteria.profile_completion}% of profile`
    };
  }

  // Default: no progress trackable
  return {
    current: 0,
    required: 1,
    percentage: 0,
    description: 'Progress not available'
  };
}

/**
 * Get rarity color for badge styling
 */
export function getBadgeRarityColor(rarity: string): {
  bg: string;
  border: string;
  text: string;
  glow: string;
} {
  switch (rarity) {
    case 'common':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-600',
        glow: 'shadow-blue-200'
      };
    case 'uncommon':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-600',
        glow: 'shadow-green-200'
      };
    case 'rare':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-600',
        glow: 'shadow-purple-200'
      };
    case 'epic':
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-600',
        glow: 'shadow-orange-200'
      };
    case 'legendary':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-600',
        glow: 'shadow-yellow-200'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        glow: 'shadow-gray-200'
      };
  }
}

/**
 * Get category icon name
 */
export function getBadgeCategoryIcon(category: string): string {
  switch (category) {
    case 'learning':
      return 'book-open';
    case 'engagement':
      return 'message-circle';
    case 'social':
      return 'users';
    case 'achievement':
      return 'trophy';
    case 'milestone':
      return 'flag';
    default:
      return 'award';
  }
}
