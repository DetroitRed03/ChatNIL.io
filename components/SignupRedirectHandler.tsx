'use client';

import { useEffect } from 'react';
import { useOnboardingGate } from '@/hooks/useOnboardingGate';
import {
  cleanupExpiredSessions,
  clearRedirectStorage,
  clearOutdatedVersionedData
} from '@/lib/auth-storage';
import { logger } from '@/lib/logger';

/**
 * Simplified signup redirect handler that cleans up stale storage
 * and relies on useOnboardingGate for server-truth routing
 */
export default function SignupRedirectHandler() {
  // Use the centralized onboarding gate (will handle routing automatically)
  const { isChecking, needsOnboarding, error } = useOnboardingGate();

  useEffect(() => {
    const cleanup = () => {
      logger.debug('SignupRedirectHandler: Cleaning up stale storage', 'signup-redirect');

      // Clean up expired sessions
      cleanupExpiredSessions();

      // Clean up any legacy redirect flags that might interfere
      clearRedirectStorage();

      // Clean up outdated versioned data
      clearOutdatedVersionedData();

      // Don't interfere if user is already in onboarding
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      if (currentPath.includes('/onboarding')) {
        logger.debug('User already in onboarding, skipping cleanup', 'signup-redirect');
        return;
      }

      logger.debug('Storage cleanup complete', 'signup-redirect');
    };

    // Run cleanup on mount
    cleanup();

    // Run cleanup periodically to prevent stale data buildup
    const cleanupInterval = setInterval(cleanup, 30000); // Every 30 seconds

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  // Log status for debugging
  useEffect(() => {
    if (error) {
      logger.error('Onboarding gate error', 'signup-redirect', { error });
    } else if (!isChecking && needsOnboarding !== null) {
      logger.debug('Onboarding gate status', 'signup-redirect', {
        needsOnboarding,
        isChecking
      });
    }
  }, [isChecking, needsOnboarding, error]);

  // This component doesn't render anything
  return null;
}