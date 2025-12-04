/**
 * SWR Configuration
 *
 * Global configuration for SWR data fetching including:
 * - Custom fetcher with error handling
 * - Revalidation intervals
 * - Error retry logic
 * - Cache configuration
 */

import { SWRConfiguration } from 'swr';

/**
 * Custom fetcher for SWR that handles authentication and errors
 */
export const fetcher = async <T = any>(url: string): Promise<T> => {
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');

    try {
      const errorData = await response.json();
      (error as any).info = errorData;
      (error as any).status = response.status;
    } catch {
      // Response body is not JSON
      (error as any).status = response.status;
    }

    throw error;
  }

  return response.json();
};

/**
 * Global SWR configuration
 *
 * Based on our three-tier caching strategy:
 * - Database: Materialized views refresh every 5 minutes
 * - Server: Not implemented yet (could add Next.js cache)
 * - Client: SWR cache with 30s revalidation
 */
export const swrConfig: SWRConfiguration = {
  fetcher,

  // Revalidation
  revalidateOnFocus: true,           // Revalidate when window regains focus
  revalidateOnReconnect: true,       // Revalidate when browser regains network connection
  revalidateIfStale: true,           // Revalidate if data is stale
  dedupingInterval: 2000,            // Dedupe requests within 2 seconds

  // Polling intervals (in milliseconds)
  refreshInterval: 30000,            // Auto-refresh every 30 seconds (client cache)

  // Error retry
  errorRetryCount: 3,                // Retry failed requests 3 times
  errorRetryInterval: 5000,          // Wait 5s between retries
  shouldRetryOnError: true,

  // Loading timeout
  loadingTimeout: 3000,              // Show error if loading takes > 3s

  // Keep previous data while revalidating
  keepPreviousData: true,

  // Success/Error handlers
  onSuccess: (data, key, config) => {
    // Could add analytics tracking here
    // console.log('SWR success:', key);
  },

  onError: (error, key) => {
    // Could add error reporting here (e.g., Sentry)
    console.error('SWR error:', key, error);

    // Special handling for authentication errors
    if ((error as any).status === 401) {
      // Redirect to login or show auth modal
      // window.location.href = '/login';
    }
  },
};

/**
 * Custom SWR config for high-frequency data (notifications, messages)
 * Revalidates more frequently than the default config
 */
export const swrRealTimeConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 10000,            // Refresh every 10 seconds
  revalidateOnFocus: true,
  dedupingInterval: 1000,
};

/**
 * Custom SWR config for low-frequency data (settings, profile)
 * Revalidates less frequently to reduce API calls
 */
export const swrLowFrequencyConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 300000,           // Refresh every 5 minutes
  revalidateOnFocus: false,
  dedupingInterval: 10000,
};
