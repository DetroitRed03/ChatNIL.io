/**
 * useMatchNotifications Hook
 *
 * Subscribes to real-time match notifications using Server-Sent Events (SSE).
 * Provides live updates when new matches are found for the current user.
 *
 * Usage:
 * ```tsx
 * const { notifications, isConnected, clearNotifications } = useMatchNotifications(userId);
 *
 * // Display notifications
 * {notifications.map(notif => (
 *   <div key={notif.id}>{notif.message}</div>
 * ))}
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface MatchNotification {
  id: string;
  type: 'campaign_match' | 'athlete_match';
  matchId?: string;
  campaignId?: string;
  campaignName?: string;
  athleteId?: string;
  athleteUsername?: string;
  athleteName?: string;
  matchScore: number;
  matchTier: 'excellent' | 'good' | 'fair' | 'low';
  message: string;
  timestamp: string;
  read: boolean;
}

interface UseMatchNotificationsResult {
  notifications: MatchNotification[];
  isConnected: boolean;
  connectionError: string | null;
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  reconnect: () => void;
}

export function useMatchNotifications(userId: string | null): UseMatchNotificationsResult {
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!userId) return;

    // Clean up existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource(`/api/matches/notifications?userId=${userId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('Match notifications connected');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
      };

      eventSource.addEventListener('connected', (event) => {
        const data = JSON.parse(event.data);
        console.log('Connected to match notifications:', data);
      });

      eventSource.addEventListener('new_match', (event) => {
        const data = JSON.parse(event.data);
        console.log('New match notification:', data);

        setNotifications(prev => [{
          id: data.matchId || `notif_${Date.now()}`,
          type: data.type,
          matchId: data.matchId,
          campaignId: data.campaignId,
          campaignName: data.campaignName,
          athleteId: data.athleteId,
          athleteUsername: data.athleteUsername,
          athleteName: data.athleteName,
          matchScore: data.matchScore,
          matchTier: data.matchTier,
          message: data.message,
          timestamp: data.timestamp,
          read: false
        }, ...prev]);

        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Match Found!', {
            body: data.message,
            tag: data.matchId
          });
        }
      });

      eventSource.addEventListener('heartbeat', () => {
        // Connection is alive
      });

      eventSource.addEventListener('error', (event) => {
        const data = JSON.parse((event as any).data || '{}');
        console.error('Match notification error:', data);
        setConnectionError(data.message || 'Connection error');
      });

      eventSource.onerror = () => {
        // Only log first error and periodically after that to reduce console noise
        if (reconnectAttempts.current === 0 || reconnectAttempts.current % 5 === 0) {
          console.warn('Match notifications: connection interrupted, reconnecting...');
        }
        setIsConnected(false);
        eventSource.close();

        // Exponential backoff reconnection (max 30 seconds)
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

    } catch (error) {
      console.error('Failed to connect to match notifications:', error);
      setConnectionError('Failed to connect');
    }
  }, [userId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [connect, disconnect]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (userId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    isConnected,
    connectionError,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    reconnect
  };
}

export default useMatchNotifications;
