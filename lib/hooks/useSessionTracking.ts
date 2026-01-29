'use client';

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSessionTrackingOptions {
  /** Interval in milliseconds between session pings (default: 60000 = 1 minute) */
  interval?: number;
  /** Whether to start tracking immediately (default: true) */
  enabled?: boolean;
  /** Optional device info to include */
  deviceInfo?: string;
}

/**
 * Hook to automatically track user session for online status
 * Pings the server periodically to update last_active timestamp
 */
export function useSessionTracking(options: UseSessionTrackingOptions = {}) {
  const {
    interval = 60000, // 1 minute
    enabled = true,
    deviceInfo
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTrackingRef = useRef(false);

  const trackSession = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/track-session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            device: deviceInfo || getDeviceInfo()
          }
        })
      });

      if (!response.ok) {
        console.warn('Session tracking failed:', response.status);
      }
    } catch (error) {
      // Silently fail - session tracking is non-critical
      console.warn('Session tracking error:', error);
    }
  }, [deviceInfo]);

  // Start tracking when component mounts
  useEffect(() => {
    if (!enabled) return;

    // Don't start if already tracking
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;

    // Track immediately on mount
    trackSession();

    // Then track periodically
    intervalRef.current = setInterval(trackSession, interval);

    // Cleanup on unmount
    return () => {
      isTrackingRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, trackSession]);

  // Track on visibility change (when user comes back to tab)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, trackSession]);

  return { trackSession };
}

/**
 * Get basic device info for tracking
 */
function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'server';

  const ua = navigator.userAgent;

  // Detect device type
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Macintosh/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Linux/i.test(ua)) return 'Linux';

  return 'Web';
}

export default useSessionTracking;
