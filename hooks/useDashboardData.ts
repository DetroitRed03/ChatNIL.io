/**
 * Dashboard Data Hooks (SWR)
 *
 * Custom hooks for fetching dashboard data with automatic caching,
 * revalidation, and error handling via SWR.
 */

import useSWR from 'swr';

/**
 * SWR Configuration Presets
 */
const swrConfig = {
  refreshInterval: 30000, // 30 seconds
  revalidateOnFocus: true,
  dedupingInterval: 10000, // 10 seconds
};

const swrRealTimeConfig = {
  refreshInterval: 10000, // 10 seconds
  revalidateOnFocus: true,
  dedupingInterval: 5000, // 5 seconds
};

const swrLowFrequencyConfig = {
  refreshInterval: 300000, // 5 minutes
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1 minute
};

/**
 * Type definitions for dashboard data
 */
export interface AthleteMetrics {
  athlete_id: string;
  active_matches: number;
  total_deals: number;
  lifetime_earnings: number;
  current_fmv_score: number;
  fmv_tier: string;
  total_followers: number;
  instagram_followers: number;
  tiktok_followers: number;
  twitter_followers: number;
  youtube_subscribers: number;
  unread_notifications: number;
  unread_messages: number;
  profile_completion_score: number;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyMetrics {
  agency_id: string;
  active_athletes: number;
  pending_deals: number;
  active_deals: number;
  completed_deals: number;
  pipeline_value: number;
  monthly_revenue: number;
  total_matches: number;
  converted_matches: number;
  response_rate_percentage: number;
  recent_deals_pipeline: any[];
  avg_deal_size: number;
  avg_deal_duration_days: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityFeedItem {
  activity_id: string;
  user_id: string;
  activity_type: 'match' | 'deal' | 'message';
  title: string;
  description: string;
  metadata: any;
  created_at: string;
  sort_timestamp: string;
}

export interface ActivityFeedResponse {
  activities: ActivityFeedItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Hook: useAthleteMetrics
 *
 * Fetches athlete dashboard metrics from materialized view.
 * Auto-refreshes every 30 seconds.
 *
 * @param userId - The athlete's user ID
 * @returns SWR response with athlete metrics
 */
export function useAthleteMetrics(userId?: string) {
  const key = userId ? `/api/dashboard/athlete/metrics?userId=${userId}` : null;
  return useSWR<AthleteMetrics>(key);
}

/**
 * Hook: useAgencyMetrics
 *
 * Fetches agency dashboard metrics from materialized view.
 * Auto-refreshes every 30 seconds.
 *
 * @param userId - The agency user's ID
 * @returns SWR response with agency metrics
 */
export function useAgencyMetrics(userId?: string) {
  const key = userId ? `/api/dashboard/agency/overview?userId=${userId}` : null;
  return useSWR<AgencyMetrics>(key);
}

/**
 * Hook: useActivityFeed
 *
 * Fetches activity feed with pagination support.
 * Auto-refreshes every 30 seconds.
 *
 * @param userId - The user's ID
 * @param limit - Number of items per page
 * @param offset - Offset for pagination
 * @param type - Optional filter by activity type
 * @returns SWR response with activity feed
 */
export function useActivityFeed(
  userId?: string,
  limit: number = 20,
  offset: number = 0,
  type?: 'match' | 'deal' | 'message'
) {
  if (!userId) {
    return useSWR<ActivityFeedResponse>(null);
  }

  const params = new URLSearchParams({
    userId,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (type) {
    params.append('type', type);
  }

  return useSWR<ActivityFeedResponse>(
    `/api/dashboard/activity?${params.toString()}`
  );
}

/**
 * Hook: useCampaignOpportunities
 *
 * Fetches AI-matched campaign opportunities for athletes.
 * Auto-refreshes every 30 seconds.
 *
 * @param userId - The authenticated user's ID
 * @returns SWR response with campaign opportunities
 */
export function useCampaignOpportunities(userId: string | undefined) {
  return useSWR<any>(
    userId ? `/api/matchmaking/athlete/campaigns?userId=${userId}` : null,
    swrConfig
  );
}

/**
 * Hook: useNotifications
 *
 * Fetches user notifications with high-frequency revalidation.
 * Auto-refreshes every 10 seconds (real-time config).
 *
 * @param unreadOnly - Only fetch unread notifications
 * @returns SWR response with notifications
 */
export function useNotifications(unreadOnly: boolean = false) {
  const params = unreadOnly ? '?unread=true' : '';

  return useSWR<any>(
    `/api/dashboard/notifications${params}`,
    swrRealTimeConfig // High-frequency polling for notifications
  );
}

/**
 * Hook: useUserProfile
 *
 * Fetches user profile data with low-frequency revalidation.
 * Auto-refreshes every 5 minutes (low-frequency config).
 *
 * @returns SWR response with user profile
 */
export function useUserProfile() {
  return useSWR<any>(
    '/api/user/profile',
    swrLowFrequencyConfig // Low-frequency polling for profile data
  );
}

/**
 * Hook: useMessageThreads
 *
 * Fetches message threads with high-frequency revalidation.
 * Auto-refreshes every 10 seconds (real-time config).
 *
 * @returns SWR response with message threads
 */
export function useMessageThreads() {
  return useSWR<any>(
    '/api/messages/threads',
    swrRealTimeConfig // High-frequency polling for messages
  );
}

/**
 * Hook: useQuizProgress
 *
 * Fetches quiz progress data for Learning Hub widget.
 * Auto-refreshes every 5 minutes (low-frequency).
 *
 * @param userId - The user's ID
 * @returns SWR response with quiz progress data
 */
export function useQuizProgress(userId?: string) {
  const key = userId ? `/api/dashboard/quizzes?userId=${userId}` : null;

  return useSWR<any>(key, {
    refreshInterval: 300000, // 5 minutes (low-frequency)
    revalidateOnFocus: false,
    dedupingInterval: 60000, // 1 minute dedup
  });
}

/**
 * Hook: useRecentChats
 *
 * Fetches recent chat sessions for Learning Hub widget.
 * Auto-refreshes every 30 seconds (default).
 *
 * @param userId - The user's ID
 * @returns SWR response with recent chat sessions
 */
export function useRecentChats(userId?: string) {
  const key = userId ? `/api/dashboard/chats?userId=${userId}` : null;

  return useSWR<any>(key, {
    refreshInterval: 30000, // 30 seconds (default)
    revalidateOnFocus: true,
  });
}

/**
 * Hook: useQuizUnlockStatus
 *
 * Fetches quiz difficulty unlock status and progress.
 * Refreshes when user completes quizzes.
 *
 * @param userId - The user's ID
 * @returns SWR response with unlock status for all difficulty tiers
 */
export function useQuizUnlockStatus(userId?: string) {
  const key = userId ? `/api/quizzes/unlock-status?userId=${userId}` : null;

  return useSWR<any>(key, {
    refreshInterval: 60000, // 1 minute
    revalidateOnFocus: true,
    dedupingInterval: 30000, // 30 seconds dedup
  });
}
