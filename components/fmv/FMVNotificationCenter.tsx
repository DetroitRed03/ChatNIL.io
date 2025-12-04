'use client';

import { useEffect, useState } from 'react';
import { Bell, TrendingUp, AlertCircle, Info, Star, X } from 'lucide-react';

interface FMVNotification {
  id: string;
  type: 'achievement' | 'reminder' | 'suggestion' | 'info' | 'action_required';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  data?: any;
  action?: {
    label: string;
    endpoint: string;
    method: string;
    payload?: any;
  };
  created_at: string;
}

const NOTIFICATION_CONFIG = {
  achievement: {
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  reminder: {
    icon: AlertCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  suggestion: {
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  info: {
    icon: Info,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  action_required: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export function FMVNotificationCenter() {
  const [notifications, setNotifications] = useState<FMVNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fmv/notifications');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notifications');
      }

      setNotifications(data.notifications || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (notification: FMVNotification) => {
    if (!notification.action) return;

    try {
      const response = await fetch(notification.action.endpoint, {
        method: notification.action.method,
        headers: notification.action.payload ? { 'Content-Type': 'application/json' } : undefined,
        body: notification.action.payload ? JSON.stringify(notification.action.payload) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Action failed');
      }

      // Show success message
      alert(data.message || 'Action completed successfully!');

      // Refresh notifications
      await fetchNotifications();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleDismiss = (notificationId: string) => {
    setDismissedIds(prev => new Set([...Array.from(prev), notificationId]));
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id));
  const highPriorityCount = visibleNotifications.filter(n => n.priority === 'high').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 text-sm mb-2">{error}</p>
        <button
          onClick={fetchNotifications}
          className="text-sm text-red-600 hover:text-red-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (visibleNotifications.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No FMV notifications</p>
        <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">
            FMV Notifications ({visibleNotifications.length})
          </h3>
          {highPriorityCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
              {highPriorityCount} urgent
            </span>
          )}
        </div>
        {visibleNotifications.length > 0 && (
          <button
            onClick={() => setDismissedIds(new Set(notifications.map(n => n.id)))}
            className="text-sm text-gray-600 hover:text-gray-700 underline"
          >
            Dismiss All
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {visibleNotifications
          .sort((a, b) => {
            // Sort by priority (high > medium > low)
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })
          .map((notification) => {
            const config = NOTIFICATION_CONFIG[notification.type];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`relative border-2 ${config.borderColor} ${config.bgColor} rounded-lg p-4 hover:shadow-md transition-shadow`}
              >
                {/* Dismiss Button */}
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded transition"
                  title="Dismiss"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>

                {/* Content */}
                <div className="flex items-start gap-3 pr-6">
                  <div className={`p-2 rounded-lg ${config.color.replace('text', 'bg').replace('600', '100')}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h4 className={`font-semibold ${config.color} mb-1`}>
                      {notification.title}
                    </h4>

                    {/* Message */}
                    <p className="text-sm text-gray-700 mb-3">
                      {notification.message}
                    </p>

                    {/* Action Button */}
                    {notification.action && (
                      <button
                        onClick={() => handleAction(notification)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 ${config.color.replace('text', 'bg')} text-white rounded-lg hover:opacity-90 transition text-sm font-medium`}
                      >
                        {notification.action.label}
                      </button>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/**
 * Compact notification badge for headers/navbars
 */
export function FMVNotificationBadge() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificationCount();
    // Refresh every minute
    const interval = setInterval(fetchNotificationCount, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('/api/fmv/notifications');
      const data = await response.json();

      if (response.ok) {
        setCount(data.meta?.total_notifications || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || count === 0) return null;

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-700" />
      <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
        {count > 9 ? '9+' : count}
      </span>
    </div>
  );
}
