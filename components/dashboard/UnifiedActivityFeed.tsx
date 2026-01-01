/**
 * Unified Activity Feed Component
 *
 * Merges the previous Activity Feed and Notifications widgets
 * into a single chronological feed with filter tabs.
 *
 * Features:
 * - Combined activity and notification items
 * - Filter tabs: All, Opportunities, Messages, System
 * - Chronological order
 * - "View All" pagination
 * - Read/unread states
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Target,
  Mail,
  Bell,
  DollarSign,
  TrendingUp,
  User,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useActivityFeed } from '@/hooks/useDashboardData';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'opportunity' | 'message' | 'system';

interface ActivityItem {
  id: string;
  type: 'match' | 'deal' | 'message' | 'notification' | 'fmv' | 'profile';
  title: string;
  description: string;
  timestamp: Date;
  read?: boolean;
  href?: string;
  metadata?: any;
}

interface UnifiedActivityFeedProps {
  className?: string;
  limit?: number;
}

const filterTabs: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'opportunity', label: 'Opportunities' },
  { value: 'message', label: 'Messages' },
  { value: 'system', label: 'System' },
];

function getActivityIcon(type: string) {
  switch (type) {
    case 'match':
      return { icon: Target, color: 'text-orange-600', bg: 'bg-orange-100' };
    case 'deal':
      return { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' };
    case 'message':
      return { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100' };
    case 'fmv':
      return { icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' };
    case 'profile':
      return { icon: User, color: 'text-cyan-600', bg: 'bg-cyan-100' };
    default:
      return { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' };
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function UnifiedActivityFeed({ className, limit = 5 }: UnifiedActivityFeedProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch both activities and notifications
  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;

      try {
        setIsLoading(true);

        // Fetch activities
        const activityRes = await fetch(
          `/api/dashboard/activity?userId=${user.id}&limit=${limit * 2}`,
          { credentials: 'include' }
        );
        if (activityRes.ok) {
          const data = await activityRes.json();
          const activityItems: ActivityItem[] = (data.activities || []).map((a: any) => ({
            id: a.activity_id || a.id,
            type: a.activity_type || a.type,
            title: a.title,
            description: a.description,
            timestamp: new Date(a.created_at || a.sort_timestamp),
            href: getActivityHref(a.activity_type, a.metadata),
            metadata: a.metadata,
          }));
          setActivities(activityItems);
        }

        // Fetch notifications
        const notifRes = await fetch(
          `/api/dashboard/notifications?userId=${user.id}`,
          { credentials: 'include' }
        );
        if (notifRes.ok) {
          const data = await notifRes.json();
          const notifItems: ActivityItem[] = (data.notifications || data || []).map((n: any) => ({
            id: n.id,
            type: mapNotificationType(n.type),
            title: n.title || getNotificationTitle(n.type),
            description: n.message,
            timestamp: new Date(n.created_at),
            read: n.read,
            href: getNotificationHref(n.type, n.data),
            metadata: n.data,
          }));
          setNotifications(notifItems);
        }
      } catch (err) {
        console.error('Error fetching activity feed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user?.id, limit]);

  // Merge and sort activities
  const mergedActivities = useMemo(() => {
    const all = [...activities, ...notifications];

    // Sort by timestamp descending
    all.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Filter based on selected tab
    let filtered = all;
    if (filter === 'opportunity') {
      filtered = all.filter(a => a.type === 'match' || a.type === 'deal');
    } else if (filter === 'message') {
      filtered = all.filter(a => a.type === 'message');
    } else if (filter === 'system') {
      filtered = all.filter(a => ['notification', 'fmv', 'profile'].includes(a.type));
    }

    return filtered.slice(0, limit);
  }, [activities, notifications, filter, limit]);

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className="px-6 py-4 border-b border-gray-100">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card id="activity-feed" className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                filter === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-100">
        {mergedActivities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No activity to show</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {mergedActivities.map((item, index) => {
              const iconConfig = getActivityIcon(item.type);
              const Icon = iconConfig.icon;

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  onClick={() => item.href && router.push(item.href)}
                  className={cn(
                    'w-full flex items-start gap-3 px-6 py-4 text-left transition-colors',
                    'hover:bg-gray-50',
                    item.href && 'cursor-pointer',
                    item.read === false && 'bg-orange-50/50'
                  )}
                >
                  {/* Icon */}
                  <div className={cn('p-2 rounded-lg flex-shrink-0', iconConfig.bg)}>
                    <Icon className={cn('w-4 h-4', iconConfig.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={cn(
                          'text-sm truncate',
                          item.read === false ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'
                        )}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.read === false && (
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                        )}
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {getRelativeTime(item.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow (if clickable) */}
                  {item.href && (
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-2" />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>

    </Card>
  );
}

// Helper functions
function getActivityHref(type: string, metadata: any): string | undefined {
  switch (type) {
    case 'match':
      return metadata?.campaign_id ? `/opportunities?campaign=${metadata.campaign_id}` : '/opportunities';
    case 'deal':
      return metadata?.deal_id ? `/nil-deals?deal=${metadata.deal_id}` : '/nil-deals';
    case 'message':
      return metadata?.thread_id ? `/messages?thread=${metadata.thread_id}` : '/messages';
    default:
      return undefined;
  }
}

function getNotificationHref(type: string, data: any): string | undefined {
  switch (type) {
    case 'match':
      return data?.campaign_id ? `/opportunities?campaign=${data.campaign_id}` : '/opportunities';
    case 'deal':
      return '/nil-deals';
    case 'message':
      return '/messages';
    case 'invite':
      return data?.campaign_id ? `/opportunities?campaign=${data.campaign_id}` : '/opportunities';
    case 'fmv':
      return '/profile?tab=fmv';
    default:
      return undefined;
  }
}

function mapNotificationType(type: string): ActivityItem['type'] {
  switch (type) {
    case 'match':
    case 'invite':
      return 'match';
    case 'deal':
      return 'deal';
    case 'message':
      return 'message';
    case 'fmv':
      return 'fmv';
    case 'profile':
      return 'profile';
    default:
      return 'notification';
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case 'match':
      return 'New Brand Match';
    case 'deal':
      return 'Deal Update';
    case 'message':
      return 'New Message';
    case 'invite':
      return 'Campaign Invitation';
    case 'fmv':
      return 'FMV Updated';
    default:
      return 'Notification';
  }
}

export default UnifiedActivityFeed;
