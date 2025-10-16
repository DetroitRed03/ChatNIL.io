/**
 * Server-side Analytics Library
 * PostHog integration for server-side event tracking
 *
 * IMPORTANT: This file should ONLY be imported in server components, API routes, and server actions.
 * DO NOT import this in client components - use lib/analytics.ts instead.
 */

import { PostHog } from 'posthog-node';
import type { EventName, EventProperties } from '@/types/analytics';

// Server-side PostHog instance
let serverPostHog: PostHog | null = null;

/**
 * Get or create server-side PostHog instance
 */
export function getServerPostHog(): PostHog | null {
  const apiKey = process.env.POSTHOG_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ PostHog API key not configured for server. Server analytics will not be tracked.');
    }
    return null;
  }

  if (!serverPostHog) {
    try {
      serverPostHog = new PostHog(apiKey, {
        host: apiHost,
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Server-side PostHog initialized');
      }
    } catch (error) {
      console.error('Failed to initialize PostHog server instance:', error);
      return null;
    }
  }

  return serverPostHog;
}

/**
 * Track an event from the server
 * @param eventName - Name of the event to track
 * @param properties - Event properties (must match the event type)
 */
export function trackEventServer<T extends EventName>(
  eventName: T,
  properties: EventProperties<T>
): void {
  const ph = getServerPostHog();

  if (!ph) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 [Analytics - Server]', eventName, properties);
    }
    return;
  }

  try {
    // Extract user_id from properties for identification
    const userId = (properties as any).user_id || 'anonymous';

    ph.capture({
      distinctId: userId,
      event: eventName,
      properties: properties as Record<string, any>,
    });
  } catch (error) {
    console.error('Failed to track server event:', eventName, error);
  }
}

/**
 * Shutdown PostHog client gracefully
 * Call this when the server is shutting down to flush any pending events
 */
export async function shutdownServerPostHog(): Promise<void> {
  if (serverPostHog) {
    await serverPostHog.shutdown();
    serverPostHog = null;
  }
}
