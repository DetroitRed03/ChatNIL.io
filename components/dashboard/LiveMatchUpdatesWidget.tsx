/**
 * Live Match Updates Widget - Dashboard Component
 *
 * Displays real-time match notifications in the dashboard using SSE.
 * Shows live connection status and recent match activity.
 *
 * Features:
 * - Real-time SSE connection with live indicator
 * - Match tier badges (excellent/good/fair)
 * - Animated new match entries
 * - Quick actions for each match
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Wifi,
  WifiOff,
  Target,
  TrendingUp,
  Clock,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMatchNotifications } from '@/hooks/useMatchNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface LiveMatchUpdatesWidgetProps {
  className?: string;
  limit?: number;
}

export function LiveMatchUpdatesWidget({
  className,
  limit = 5,
}: LiveMatchUpdatesWidgetProps) {
  const { user } = useAuth();
  const router = useRouter();
  // Default to showing all notifications so they don't disappear when clicked
  const [showRead, setShowRead] = useState(true);

  const {
    notifications,
    isConnected,
    connectionError,
    unreadCount,
    markAsRead,
    markAllAsRead,
    reconnect,
  } = useMatchNotifications(user?.id || null);

  const displayedNotifications = showRead
    ? notifications.slice(0, limit)
    : notifications.filter((n) => !n.read).slice(0, limit);

  const getMatchTierConfig = (tier: string) => {
    switch (tier) {
      case 'excellent':
        return {
          gradient: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          label: 'Excellent',
        };
      case 'good':
        return {
          gradient: 'from-orange-500 to-amber-500',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          label: 'Good',
        };
      case 'fair':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          label: 'Fair',
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          label: 'Match',
        };
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMatchClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    if (notification.type === 'campaign_match') {
      // For athletes, navigate to opportunities page with the match ID to auto-open the modal
      if (notification.matchId) {
        router.push(`/opportunities?match=${notification.matchId}`);
      } else {
        router.push('/opportunities');
      }
    } else if (notification.type === 'athlete_match') {
      // Use athleteUsername (preferred) or athleteId as fallback for profile URL
      const profileIdentifier = notification.athleteUsername || notification.athleteId;
      if (profileIdentifier) {
        router.push(`/athletes/${profileIdentifier}`);
      }
    }
  };

  return (
    <Card
      className={cn(
        'bg-gradient-to-br from-orange-50/20 via-white to-amber-50/15 border border-orange-100/40 overflow-hidden shadow-sm shadow-orange-100/30',
        className
      )}
    >
      {/* Header with Live Status */}
      <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 px-6 py-5 overflow-hidden">
        {/* Animated shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />

        <div className="relative">
          {/* Top row: Title and Show all button */}
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-xl text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Live Match Updates
            </h3>
            {/* Toggle read/unread - top right corner */}
            <button
              onClick={() => setShowRead(!showRead)}
              className="text-xs font-medium text-white/80 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm transition-colors"
            >
              {showRead ? (
                <>
                  <EyeOff className="w-3 h-3" />
                  Unread only
                </>
              ) : (
                <>
                  <Eye className="w-3 h-3" />
                  Show all
                </>
              )}
            </button>
          </div>

          {/* Bottom row: Subtitle and Live badge */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-white/90 text-sm font-medium">
              Real-time opportunities for you
            </p>

            <div className="flex items-center gap-2">
              {/* Live Status Badge */}
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm',
                  isConnected
                    ? 'bg-green-500/20 text-white'
                    : 'bg-red-500/20 text-white'
                )}
              >
                {isConnected ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <Wifi className="h-3.5 w-3.5" />
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3.5 w-3.5" />
                    <span>Offline</span>
                    <button
                      onClick={reconnect}
                      className="ml-1 p-0.5 hover:bg-white/20 rounded transition-colors"
                      title="Reconnect"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>

              {/* Unread Count */}
              {unreadCount > 0 && (
                <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-white font-bold">{unreadCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-100">
          <p className="text-sm text-red-600">{connectionError}</p>
        </div>
      )}

      {/* Matches List */}
      <div className="divide-y divide-orange-100/30 max-h-[400px] overflow-y-auto">
        {displayedNotifications.length === 0 ? (
          <div className="py-10 px-6">
            <EmptyState
              variant="simple"
              icon={<Target className="w-10 h-10 text-gray-400" />}
              title={showRead ? 'No matches yet' : 'All caught up!'}
              description={
                showRead
                  ? "We'll notify you in real-time when new opportunities match your profile"
                  : 'No unread match notifications'
              }
            />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedNotifications.map((notification, index) => {
              const tierConfig = getMatchTierConfig(notification.matchTier);

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4, backgroundColor: 'rgba(249, 115, 22, 0.03)' }}
                  onClick={() => handleMatchClick(notification)}
                  className={cn(
                    'px-6 py-4 cursor-pointer transition-all',
                    !notification.read && 'bg-gradient-to-r from-orange-50/50 to-transparent'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Match Score Circle */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center bg-gradient-to-br shadow-lg',
                        tierConfig.gradient,
                        !notification.read && 'ring-2 ring-offset-2 ring-orange-300'
                      )}
                    >
                      <span className="text-white font-bold text-lg">
                        {notification.matchScore}%
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r',
                            tierConfig.gradient
                          )}
                        >
                          {tierConfig.label}
                        </span>
                        {!notification.read && (
                          <span className="flex items-center gap-1 text-xs font-bold text-orange-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                            NEW
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-gray-900 truncate">
                        {notification.type === 'campaign_match'
                          ? notification.campaignName
                          : notification.athleteName}
                      </h4>

                      <p className="text-sm text-gray-600 line-clamp-1 mt-0.5">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {notification.type === 'campaign_match'
                            ? 'Campaign Match'
                            : 'Athlete Match'}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-orange-100/30 px-6 py-4 bg-gradient-to-br from-orange-50/20 to-amber-50/15 flex items-center justify-between">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Mark all as read
            </button>
          )}

          <button
            onClick={() => router.push('/opportunities')}
            className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors ml-auto"
          >
            View All Matches →
          </button>
        </div>
      )}
    </Card>
  );
}

export default LiveMatchUpdatesWidget;
