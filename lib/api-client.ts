/**
 * Enhanced API client with retry logic, error handling, and network resilience
 */

export interface ApiOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  useExponentialBackoff?: boolean;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: any;

  constructor(message: string, status: number, statusText: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Check if the user is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Wait for a specified amount of time
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempt: number, baseDelay: number): number {
  return Math.min(baseDelay * Math.pow(2, attempt - 1), 30000); // Max 30 seconds
}

/**
 * Create a timeout promise that rejects after the specified time
 */
function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError()), timeoutMs);
  });
}

/**
 * Enhanced fetch with timeout support
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const fetchPromise = fetch(url, options);
  const timeoutPromise = createTimeoutPromise(timeoutMs);

  return Promise.race([fetchPromise, timeoutPromise]);
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors are retryable
  if (error instanceof NetworkError || error.name === 'TypeError') {
    return true;
  }

  // Timeout errors are retryable
  if (error instanceof TimeoutError) {
    return true;
  }

  // Some HTTP status codes are retryable
  if (error instanceof ApiError) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  return false;
}

/**
 * Enhanced API call with retry logic and error handling
 */
export async function apiCall<T = any>(
  url: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    useExponentialBackoff = true,
    ...fetchOptions
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌐 API call attempt ${attempt}/${retries}: ${url}`);

      // Check if we're online
      if (!isOnline()) {
        throw new NetworkError('You appear to be offline. Please check your internet connection.');
      }

      // Make the request with timeout
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      }, timeout);

      // Handle HTTP errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          // If we can't parse JSON, use status text
          errorData = { error: response.statusText };
        }

        const apiError = new ApiError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          errorData
        );

        // Log the error for debugging
        console.error(`❌ API Error ${response.status}:`, apiError);

        throw apiError;
      }

      // Parse and return successful response
      const data = await response.json();
      console.log(`✅ API call successful: ${url}`);
      return data;

    } catch (error: any) {
      lastError = error;

      // Log the error
      console.error(`💥 API call failed (attempt ${attempt}/${retries}):`, error);

      // If this is the last attempt or error is not retryable, throw
      if (attempt === retries || !isRetryableError(error)) {
        throw error;
      }

      // Calculate delay for next attempt
      const delayMs = useExponentialBackoff
        ? calculateBackoffDelay(attempt, retryDelay)
        : retryDelay;

      console.log(`⏳ Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = any>(url: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, data?: any, options?: Omit<ApiOptions, 'method'>) =>
    apiCall<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(url: string, data?: any, options?: Omit<ApiOptions, 'method'>) =>
    apiCall<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(url: string, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    apiCall<T>(url, { ...options, method: 'DELETE' }),
};

/**
 * React hook for online status
 */
export function useOnlineStatus() {
  const [isOnlineStatus, setIsOnlineStatus] = React.useState(isOnline);

  React.useEffect(() => {
    function handleOnline() {
      setIsOnlineStatus(true);
      console.log('🌐 Back online');
    }

    function handleOffline() {
      setIsOnlineStatus(false);
      console.log('📡 Gone offline');
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return isOnlineStatus;
}

// Note: Need to import React for the hook
import React from 'react';