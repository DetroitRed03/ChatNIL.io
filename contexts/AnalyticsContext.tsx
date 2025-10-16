'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { initializePostHog, identifyUser, resetUser, trackEvent } from '@/lib/analytics';

interface AnalyticsContextType {
  // Context will primarily use the global analytics functions
  // We expose them here for convenience and type safety
  trackEvent: typeof trackEvent;
  isInitialized: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize PostHog on mount
  useEffect(() => {
    const ph = initializePostHog();
    if (ph) {
      setIsInitialized(true);
      console.log('📊 Analytics initialized');
    }
  }, []);

  // Identify user when authenticated
  useEffect(() => {
    if (user && isInitialized) {
      // Identify user in PostHog
      identifyUser(user.id, {
        email: user.email,
        name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        onboardingCompleted: user.onboarding_completed,
      });

      console.log('📊 User identified:', user.id, user.role);
    } else if (!user && isInitialized) {
      // Reset on logout
      resetUser();
      console.log('📊 User reset (logged out)');
    }
  }, [user, isInitialized]);

  const contextValue: AnalyticsContextType = {
    trackEvent,
    isInitialized,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextType {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }

  return context;
}
