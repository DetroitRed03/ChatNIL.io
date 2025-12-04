/**
 * Notifications Widget - Design System V4 - HIGH ENERGY
 *
 * Bold, vibrant notification feed with visual hierarchy.
 * Matches the FMVScoreCard aesthetic with gradient header and priority-based styling.
 *
 * Features:
 * - Gradient header with shimmer effect
 * - Larger high-priority notifications (text-lg titles, text-base body)
 * - Gradient backgrounds for high-priority items
 * - Colored left borders for priority levels
 * - Larger icons (w-5 h-5)
 * - Prominent unread indicator
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Eye, AlertCircle, Star, Info, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

// Priority configuration - with warm colors and gradients
const priorityConfig = {
  high: {
    icon: AlertCircle,
    label: 'High Priority',
    borderColor: 'border-l-orange-500',
    gradient: 'from-orange-500 to-red-500',
    shadow: 'shadow-orange-500/30',
    bgGradient: 'from-orange-50 to-red-50',
  },
  medium: {
    icon: Star,
    label: 'Medium',
    borderColor: 'border-l-amber-500',
    gradient: 'from-amber-500 to-yellow-500',
    shadow: 'shadow-amber-500/30',
    bgGradient: 'from-amber-50 to-yellow-50',
  },
  low: {
    icon: Info,
    label: 'Low',
    borderColor: 'border-l-orange-300',
    gradient: 'from-orange-100 to-amber-100',
    shadow: 'shadow-orange-200/30',
    bgGradient: 'from-orange-50/50 to-amber-50/50',
  }
} as const;

type Priority = keyof typeof priorityConfig;

interface Notification {
  id: string;
  type?: string;
  title: string;
  message: string;
  read: boolean;
  priority: Priority;
  createdAt: Date;
}

// Map notification type to priority and title
function getNotificationDetails(type: string, message: string): { priority: Priority; title: string } {
  if (type === 'match') {
    return { priority: 'high', title: 'New Brand Match' };
  } else if (type === 'deal') {
    if (message.includes('payment received')) {
      return { priority: 'high', title: 'Payment Received' };
    } else if (message.includes('active')) {
      return { priority: 'medium', title: 'Deal Activated' };
    } else {
      return { priority: 'medium', title: 'New Deal Proposal' };
    }
  } else if (type === 'fmv') {
    return { priority: 'low', title: 'FMV Update' };
  } else if (type === 'message') {
    return { priority: 'medium', title: 'New Message' };
  } else if (type === 'invite') {
    return { priority: 'high', title: 'Campaign Invite' };
  }
  return { priority: 'low', title: 'Notification' };
}


// Helper function to get relative timestamp
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

export function NotificationsWidget() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id; // Capture for use in async function

    async function fetchNotifications() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/dashboard/notifications?userId=${userId}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();

        // Extract notifications array from response
        const notificationsData = data.notifications || data;

        // Transform API notifications to component format
        const transformedNotifications: Notification[] = notificationsData.map((item: any) => {
          const details = getNotificationDetails(item.type, item.message);
          return {
            id: item.id,
            type: item.type,
            title: details.title,
            message: item.message,
            read: item.read,
            priority: details.priority,
            createdAt: new Date(item.created_at),
          };
        });

        setNotifications(transformedNotifications);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotifications();
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayedNotifications = showAll
    ? notifications
    : notifications.filter(n => !n.read);

  const hasNotifications = displayedNotifications.length > 0;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 border border-orange-100/40 overflow-hidden shadow-sm shadow-orange-100/30">
      {/* Warm Gradient Header with Shimmer */}
      <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 px-6 py-6 overflow-hidden">
        {/* Animated shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />

        {/* Header Content */}
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="font-bold text-2xl text-white">What You Missed 🔔</h3>
            <p className="text-white/90 text-sm font-medium mt-1">Stay in the loop</p>
          </div>
          {unreadCount > 0 && (
            <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-white font-bold text-lg">{unreadCount}</span>
            </div>
          )}
        </div>

        {/* Toggle button */}
        {notifications.some(n => n.read) && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="absolute top-4 right-4 text-sm font-medium text-white/90 hover:text-white transition-colors flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm"
          >
            <Eye className="w-4 h-4" />
            {showAll ? 'Unread only' : 'Show all'}
          </button>
        )}
      </div>

      <div className="p-0 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="px-6 py-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-8">
            <EmptyState
              variant="simple"
              icon={<AlertCircle className="w-10 h-10 text-red-400" />}
              title="Error loading notifications"
              description={error}
            />
          </div>
        ) : !hasNotifications ? (
          <div className="px-6 py-8">
            <EmptyState
              variant="simple"
              icon={<Bell className="w-10 h-10 text-gray-400" />}
              title="All caught up"
              description={showAll ? "No notifications yet" : "You're all up to date"}
            />
          </div>
        ) : (
          <div className="divide-y divide-orange-100/30">
            <AnimatePresence mode="popLayout">
              {displayedNotifications.map((notification, index) => {
                const config = priorityConfig[notification.priority];
                const Icon = config.icon;
                const isHighPriority = notification.priority === 'high';

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className={cn(
                      'group relative cursor-pointer transition-all bg-white/80 border-b border-orange-100/30',
                      notification.read && 'opacity-60',
                      isHighPriority && !notification.read
                        ? `bg-gradient-to-r ${config.bgGradient}`
                        : 'hover:bg-gradient-to-br hover:from-orange-50/30 hover:to-amber-50/20 hover:shadow-md hover:shadow-orange-200/30'
                    )}
                  >
                    {/* Colored left border */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.borderColor}`} />

                    <div className="px-6 py-4 pl-8">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${config.gradient} shadow-md flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title and Unread Indicator */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className={`${isHighPriority ? 'text-lg' : 'text-base'} font-bold text-gray-900`}>
                              {notification.title}
                            </h4>
                            {/* Prominent unread indicator */}
                            {!notification.read && (
                              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${config.gradient} shadow-md`}>
                                <span className="inline-flex h-2 w-2 rounded-full bg-white animate-pulse" />
                                <span className="text-xs font-bold text-white">NEW</span>
                              </div>
                            )}
                          </div>

                          {/* Priority Badge */}
                          <span className={`inline-block text-xs font-bold text-white bg-gradient-to-r ${config.gradient} px-3 py-1 rounded-full shadow-sm mb-2`}>
                            {config.label}
                          </span>

                          {/* Message */}
                          <p className={`${isHighPriority ? 'text-base' : 'text-sm'} text-gray-700 line-clamp-2 mb-2 font-medium`}>
                            {notification.message}
                          </p>

                          {/* Timestamp and Mark as Read */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">{getRelativeTime(notification.createdAt)}</span>
                            </div>

                            {/* Mark as read button (shown on hover) */}
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-sm font-bold text-primary-600 hover:text-primary-700 transition-all flex items-center gap-1"
                              >
                                <Check className="w-4 h-4" />
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </Card>
  );
}
