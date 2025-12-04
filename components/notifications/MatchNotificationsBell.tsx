/**
 * Match Notifications Bell Component
 *
 * A notification bell icon for the header that shows real-time match
 * notifications using Server-Sent Events. Displays unread count badge
 * and dropdown list of recent matches.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles, Target, Check, ExternalLink, Wifi, WifiOff } from 'lucide-react';
import { useMatchNotifications } from '@/hooks/useMatchNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MatchNotificationsBellProps {
  className?: string;
}

export function MatchNotificationsBell({ className }: MatchNotificationsBellProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useMatchNotifications(user?.id || null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render if not authenticated
  if (!user) return null;

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    markAsRead(notification.id);
    setIsOpen(false);

    // Navigate based on notification type
    if (notification.type === 'campaign_match' && notification.campaignId) {
      router.push(`/opportunities?campaign=${notification.campaignId}`);
    } else if (notification.type === 'athlete_match') {
      // Use athleteUsername (preferred) or athleteId as fallback for profile URL
      const profileIdentifier = notification.athleteUsername || notification.athleteId;
      if (profileIdentifier) {
        router.push(`/athletes/${profileIdentifier}`);
      }
    }
  };

  const getMatchTierColor = (tier: string) => {
    switch (tier) {
      case 'excellent':
        return 'from-green-500 to-emerald-500';
      case 'good':
        return 'from-orange-500 to-amber-500';
      case 'fair':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getMatchTierLabel = (tier: string) => {
    switch (tier) {
      case 'excellent':
        return 'Excellent Match';
      case 'good':
        return 'Good Match';
      case 'fair':
        return 'Fair Match';
      default:
        return 'Match';
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5 text-gray-600" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-md"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}

        {/* Connection Status Indicator */}
        <span
          className={cn(
            'absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          )}
          title={isConnected ? 'Connected to live updates' : 'Disconnected'}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 px-4 py-4 overflow-hidden">
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              />

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-white" />
                  <h3 className="font-bold text-lg text-white">Match Updates</h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Connection Status */}
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    isConnected
                      ? 'bg-green-500/20 text-white'
                      : 'bg-red-500/20 text-white'
                  )}>
                    {isConnected ? (
                      <>
                        <Wifi className="h-3 w-3" />
                        <span>Live</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3" />
                        <span>Offline</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              {unreadCount > 0 && (
                <p className="relative text-white/90 text-sm mt-1">
                  {unreadCount} new match{unreadCount > 1 ? 'es' : ''} found!
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center">
                  <Target className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No match notifications yet</p>
                  <p className="text-gray-400 text-sm mt-1">
                    We'll notify you when new opportunities match your profile
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 10).map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-colors',
                        !notification.read && 'bg-orange-50/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {/* Match Score Badge */}
                        <div className={cn(
                          'flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-gradient-to-br shadow-md',
                          getMatchTierColor(notification.matchTier)
                        )}>
                          <span className="text-white font-bold text-sm">
                            {notification.matchScore}%
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              'text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r',
                              getMatchTierColor(notification.matchTier)
                            )}>
                              {getMatchTierLabel(notification.matchTier)}
                            </span>
                            {!notification.read && (
                              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                            )}
                          </div>

                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.type === 'campaign_match'
                              ? notification.campaignName
                              : notification.athleteName}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {notification.message}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 flex items-center justify-between">
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Mark all read
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/opportunities');
                  }}
                  className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  View All Matches →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MatchNotificationsBell;
