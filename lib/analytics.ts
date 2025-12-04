/**
 * Analytics Library
 * PostHog integration for tracking user behavior and AI metrics
 */

/**
 * Client-side Analytics Library
 * PostHog integration for browser-side event tracking
 *
 * For server-side tracking, use lib/analytics-server.ts instead
 */

import posthog from 'posthog-js';
import type { AnalyticsEvent, EventName, EventProperties } from '@/types/analytics';
import { UserRole } from './types';

// ============================================================================
// Client-side PostHog Instance
// ============================================================================

let clientPostHog: typeof posthog | null = null;

/**
 * Initialize PostHog client-side
 * Should be called once in the app, typically in AnalyticsProvider
 */
export function initializePostHog(): typeof posthog | null {
  if (typeof window === 'undefined') {
    return null; // Don't initialize on server
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    console.warn('⚠️ PostHog API key not configured. Analytics will not be tracked.');
    return null;
  }

  if (!clientPostHog) {
    posthog.init(apiKey, {
      api_host: apiHost,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 PostHog initialized in development mode');
          posthog.opt_out_capturing(); // Opt out in development by default
        }
      },
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false, // We'll manually track events for better control
    });

    clientPostHog = posthog;
  }

  return clientPostHog;
}

/**
 * Get the client-side PostHog instance
 */
export function getPostHog(): typeof posthog | null {
  return clientPostHog;
}

// ============================================================================
// Event Tracking Functions
// ============================================================================

/**
 * Track an analytics event (client-side)
 * For server-side tracking, import and use trackEventServer from lib/analytics-server.ts
 */
export function trackEvent<T extends EventName>(
  eventName: T,
  properties: EventProperties<T>
): void {
  const ph = getPostHog();

  if (!ph) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [Analytics - Client]', eventName, properties);
    }
    return;
  }

  try {
    ph.capture(eventName, properties as Record<string, any>);
  } catch (error) {
    console.error('Failed to track event:', eventName, error);
  }
}

// ============================================================================
// User Identification
// ============================================================================

/**
 * Identify a user in PostHog
 */
export function identifyUser(userId: string, traits?: {
  email?: string;
  name?: string;
  role?: UserRole;
  [key: string]: any;
}): void {
  const ph = getPostHog();

  if (!ph) {
    return;
  }

  try {
    ph.identify(userId, traits);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
}

/**
 * Reset user identity (on logout)
 */
export function resetUser(): void {
  const ph = getPostHog();

  if (!ph) {
    return;
  }

  try {
    ph.reset();
  } catch (error) {
    console.error('Failed to reset user:', error);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Estimate token count from text
 * Rough estimation: ~4 characters per token for English text
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimate cost based on token count
 * Using approximate OpenAI pricing (adjust based on your actual API costs)
 * GPT-4: ~$0.03/1K input tokens, ~$0.06/1K output tokens
 * Using average of $0.045/1K tokens
 */
export function estimateCost(tokenCount: number): number {
  const costPer1KTokens = 0.045;
  return (tokenCount / 1000) * costPer1KTokens;
}

/**
 * Categorize a prompt based on keywords
 */
export function categorizePrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  const categories: Record<string, string[]> = {
    nil_basics: ['nil', 'name image likeness', 'what is nil', 'explain nil'],
    contracts: ['contract', 'agreement', 'sign', 'terms', 'deal'],
    branding: ['brand', 'marketing', 'promote', 'personal brand'],
    social_media: ['social media', 'instagram', 'twitter', 'tiktok', 'post'],
    compliance: ['compliance', 'rules', 'regulations', 'ncaa', 'legal'],
    tax_finance: ['tax', 'finance', 'money', 'income', 'earnings', 'payment'],
    negotiation: ['negotiate', 'negotiation', 'offer', 'counteroffer'],
    legal: ['legal', 'lawyer', 'attorney', 'law', 'rights'],
    eligibility: ['eligible', 'eligibility', 'qualify', 'requirements'],
    general: ['help', 'question', 'how', 'what', 'why', 'when'],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerPrompt.includes(keyword))) {
      return category;
    }
  }

  return 'uncategorized';
}

/**
 * Calculate session duration in minutes
 */
export function calculateSessionDuration(startTime: Date, endTime: Date = new Date()): number {
  const durationMs = endTime.getTime() - startTime.getTime();
  return Math.round(durationMs / 60000); // Convert to minutes
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Feature Flags (for future use)
// ============================================================================

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagName: string): boolean {
  const ph = getPostHog();

  if (!ph) {
    return false;
  }

  try {
    return ph.isFeatureEnabled(flagName) || false;
  } catch (error) {
    console.error('Failed to check feature flag:', flagName, error);
    return false;
  }
}

// ============================================================================
// Shutdown (for server-side)
// ============================================================================

/**
 * Shutdown client PostHog instance
 * Note: For server-side shutdown, use shutdownAnalytics from lib/analytics-server.ts
 */
export async function shutdownAnalytics(): Promise<void> {
  if (clientPostHog) {
    // Client-side PostHog doesn't have a shutdown method, just clear the reference
    clientPostHog = null;
  }
}
