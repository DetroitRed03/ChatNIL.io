'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

interface OnboardingGateState {
  isChecking: boolean;
  needsOnboarding: boolean | null;
  isReady: boolean;
  error: string | null;
}

interface UseOnboardingGateOptions {
  redirectPath?: string;
  enabled?: boolean;
  timeout?: number;
}

/**
 * Single source of truth for onboarding routing decisions
 * Uses server-side profile data only, no localStorage
 */
export function useOnboardingGate(options: UseOnboardingGateOptions = {}) {
  const {
    redirectPath = '/onboarding',
    enabled = true,
    timeout = 10000
  } = options;

  const { user, isLoading: isAuthLoading, isReady: isAuthReady } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<OnboardingGateState>({
    isChecking: false,
    needsOnboarding: null,
    isReady: false,
    error: null
  });

  const checkTimeoutRef = useRef<NodeJS.Timeout>();
  const hasRedirectedRef = useRef(false);

  // Clear any existing timeout
  const clearCheckTimeout = () => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = undefined;
    }
  };

  // Fetch fresh profile data from server (single source of truth)
  const checkOnboardingStatus = async (): Promise<boolean | null> => {
    if (!user?.id) {
      logger.debug('No user ID, cannot check onboarding status', 'onboarding-gate');
      return null;
    }

    try {
      logger.debug('Fetching fresh profile from server for onboarding check', 'onboarding-gate', {
        userId: user.id
      });

      // Fetch fresh profile directly from our API
      const response = await fetch(`/api/auth/profile?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Ensure fresh data
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();

      console.log('📦 Profile API response:', data);

      if (data.error) {
        console.error('❌ Profile API returned error:', data.error);
        throw new Error(data.error);
      }

      const profile = data.profile;
      const needsOnboarding = !profile?.onboarding_completed;

      console.log('🎯 Onboarding check result:', {
        hasProfile: !!profile,
        onboarding_completed: profile?.onboarding_completed,
        needsOnboarding,
        profileData: profile
      });

      logger.info('Server profile check complete', 'onboarding-gate', {
        userId: user.id,
        hasProfile: !!profile,
        onboardingCompleted: profile?.onboarding_completed,
        needsOnboarding
      });

      return needsOnboarding;

    } catch (error) {
      logger.error('Failed to check onboarding status from server', 'onboarding-gate', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: user.id
      });
      throw error;
    }
  };

  // Main onboarding check effect
  useEffect(() => {
    console.log('🔍 useOnboardingGate useEffect triggered', {
      enabled,
      isAuthLoading,
      isAuthReady,
      hasUser: !!user,
      userId: user?.id,
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    });

    if (!enabled) {
      console.log('⏭️ Onboarding gate is disabled');
      setState(prev => ({ ...prev, isReady: true }));
      return;
    }

    // Don't check if auth is still loading
    if (isAuthLoading || !isAuthReady) {
      console.log('⏳ Auth not ready yet', { isAuthLoading, isAuthReady });
      logger.debug('Auth not ready, waiting...', 'onboarding-gate');
      return;
    }

    // If no user, nothing to check
    if (!user) {
      console.log('🚫 No user logged in, skipping onboarding check');
      setState({
        isChecking: false,
        needsOnboarding: false,
        isReady: true,
        error: null
      });
      return;
    }

    // Don't redirect if already on onboarding path
    if (typeof window !== 'undefined' && window.location.pathname.includes('/onboarding')) {
      console.log('✅ Already on onboarding path, skipping check');
      logger.debug('Already on onboarding path, skipping check', 'onboarding-gate');
      setState({
        isChecking: false,
        needsOnboarding: false,
        isReady: true,
        error: null
      });
      return;
    }

    // Don't redirect if we've already redirected in this session
    if (hasRedirectedRef.current) {
      console.log('🔄 Already redirected in this session, skipping');
      logger.debug('Already redirected in this session, skipping', 'onboarding-gate');
      return;
    }

    console.log('🚀 Starting onboarding status check for user:', user.id);

    setState(prev => ({ ...prev, isChecking: true, error: null }));

    // Set timeout for the check
    clearCheckTimeout();
    checkTimeoutRef.current = setTimeout(() => {
      logger.warn('Onboarding check timed out', 'onboarding-gate', { timeout });
      setState(prev => ({
        ...prev,
        isChecking: false,
        isReady: true,
        error: 'Onboarding check timed out'
      }));
    }, timeout);

    // Perform the server check
    checkOnboardingStatus()
      .then((needsOnboarding) => {
        console.log('✅ Onboarding status check complete:', {
          needsOnboarding,
          userId: user.id
        });

        clearCheckTimeout();

        if (needsOnboarding === null) {
          console.log('⚠️ Could not determine onboarding status');
          // Could not determine status
          setState({
            isChecking: false,
            needsOnboarding: null,
            isReady: true,
            error: 'Could not determine onboarding status'
          });
          return;
        }

        setState({
          isChecking: false,
          needsOnboarding,
          isReady: true,
          error: null
        });

        // Redirect if needed
        if (needsOnboarding && !hasRedirectedRef.current) {
          console.log('🎯 User needs onboarding! Redirecting to:', redirectPath);
          logger.info('User needs onboarding, redirecting', 'onboarding-gate', {
            redirectPath,
            userId: user.id
          });

          hasRedirectedRef.current = true;

          // Immediate redirect without delay for smoother UX
          console.log('🚀 Calling router.push:', redirectPath);
          router.push(redirectPath);
        } else if (!needsOnboarding) {
          console.log('✅ User has completed onboarding, no redirect needed');
        } else if (hasRedirectedRef.current) {
          console.log('🔄 Already redirected, not redirecting again');
        }
      })
      .catch((error) => {
        clearCheckTimeout();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        logger.error('Onboarding check failed', 'onboarding-gate', {
          error: errorMessage,
          userId: user?.id
        });

        setState({
          isChecking: false,
          needsOnboarding: null,
          isReady: true,
          error: errorMessage
        });
      });

    // Cleanup timeout on unmount
    return () => {
      clearCheckTimeout();
    };

  }, [user, isAuthLoading, isAuthReady, enabled, redirectPath, timeout, router]);

  // Manual refresh function
  const refresh = () => {
    hasRedirectedRef.current = false;
    setState(prev => ({ ...prev, isChecking: true, error: null }));
  };

  return {
    ...state,
    refresh
  };
}

/**
 * Simple hook that just checks if user needs onboarding (no redirect)
 */
export function useOnboardingStatus() {
  return useOnboardingGate({ enabled: true, redirectPath: '' });
}