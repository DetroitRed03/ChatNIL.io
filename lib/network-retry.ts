/**
 * Network Retry Logic
 *
 * Production-grade retry utility with exponential backoff for API requests.
 * Handles transient network failures gracefully.
 */

import { chatLogger } from './chat-logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffFactor?: number; // multiplier for exponential backoff
  retryableStatuses?: number[]; // HTTP status codes to retry
  onRetry?: (attempt: number, error: any) => void;
  shouldRetry?: (error: any, attempt: number) => boolean;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
  totalDuration: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'shouldRetry'>> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2, // Double delay each time
  retryableStatuses: [408, 429, 500, 502, 503, 504] // Timeout, Rate limit, Server errors
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'onRetry' | 'shouldRetry'>>): number {
  const exponentialDelay = options.initialDelay * Math.pow(options.backoffFactor, attempt);
  const cappedDelay = Math.min(exponentialDelay, options.maxDelay);

  // Add jitter (random 0-25% variation) to prevent thundering herd
  const jitter = cappedDelay * 0.25 * Math.random();

  return Math.floor(cappedDelay + jitter);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: any, options: Required<Omit<RetryOptions, 'onRetry' | 'shouldRetry'>>): boolean {
  // Network errors
  if (error.name === 'NetworkError' || error.message?.includes('network')) {
    return true;
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.name === 'TimeoutError') {
    return true;
  }

  // HTTP status codes
  if (error.status && options.retryableStatuses.includes(error.status)) {
    return true;
  }

  // Fetch API errors
  if (error instanceof TypeError && error.message?.includes('fetch')) {
    return true;
  }

  return false;
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns Promise with result or throws final error
 *
 * @example
 * ```ts
 * const result = await retryWithBackoff(
 *   () => fetch('/api/chat/sessions'),
 *   { maxRetries: 3, onRetry: (attempt) => console.log(`Retry ${attempt}`) }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const startTime = performance.now();
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      chatLogger.debug('api', `Attempt ${attempt + 1}/${opts.maxRetries + 1}`);

      const result = await fn();

      if (attempt > 0) {
        const duration = performance.now() - startTime;
        chatLogger.info('api', `Request succeeded after ${attempt} retries (${duration.toFixed(0)}ms)`);
      }

      return result;
    } catch (error) {
      lastError = error;

      // Check if we should retry
      const shouldRetry = options.shouldRetry
        ? options.shouldRetry(error, attempt)
        : isRetryableError(error, opts);

      // Check if we've exhausted retries
      if (attempt >= opts.maxRetries || !shouldRetry) {
        const duration = performance.now() - startTime;
        chatLogger.error('api', `Request failed after ${attempt + 1} attempts (${duration.toFixed(0)}ms)`, error);
        throw error;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts);
      const err = error as any;
      chatLogger.warn('api', `Retry ${attempt + 1}/${opts.maxRetries} after ${delay}ms`, {
        error: err?.message || String(error),
        status: err?.status
      });

      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(attempt + 1, error as Error);
      }

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Retry a fetch request with exponential backoff
 *
 * @param url - URL to fetch
 * @param fetchOptions - Fetch options
 * @param retryOptions - Retry configuration
 * @returns Fetch response
 *
 * @example
 * ```ts
 * const response = await fetchWithRetry('/api/chat/sessions', {
 *   method: 'GET',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * ```
 */
export async function fetchWithRetry(
  url: string,
  fetchOptions: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retryWithBackoff(async () => {
    chatLogger.debug('api', `Fetching ${fetchOptions.method || 'GET'} ${url}`);

    const response = await fetch(url, fetchOptions);

    // Treat non-2xx responses as errors for retry logic
    if (!response.ok) {
      const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response;
  }, retryOptions);
}

/**
 * Retry a fetch request and parse JSON with exponential backoff
 *
 * @param url - URL to fetch
 * @param fetchOptions - Fetch options
 * @param retryOptions - Retry configuration
 * @returns Parsed JSON data
 *
 * @example
 * ```ts
 * const data = await fetchJSONWithRetry<ChatSession[]>('/api/chat/sessions?userId=123');
 * ```
 */
export async function fetchJSONWithRetry<T = any>(
  url: string,
  fetchOptions: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const response = await fetchWithRetry(url, fetchOptions, retryOptions);
  const data = await response.json();
  return data as T;
}

/**
 * Create a retry decorator for a function
 *
 * @param fn - Function to wrap with retry logic
 * @param options - Retry configuration
 * @returns Wrapped function with retry logic
 *
 * @example
 * ```ts
 * const loadChatsWithRetry = withRetry(
 *   (userId: string) => fetch(`/api/chat/sessions?userId=${userId}`),
 *   { maxRetries: 3 }
 * );
 *
 * const response = await loadChatsWithRetry('user-123');
 * ```
 */
export function withRetry<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    return retryWithBackoff(() => fn(...args), options);
  };
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Wait for network to come back online
 *
 * @param timeout - Maximum wait time in milliseconds (default: 30 seconds)
 * @returns Promise that resolves when online or rejects on timeout
 */
export function waitForOnline(timeout: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isOnline()) {
      resolve();
      return;
    }

    chatLogger.warn('api', 'Waiting for network connection...');

    const timeoutId = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      reject(new Error('Network timeout: still offline after ' + timeout + 'ms'));
    }, timeout);

    const onlineHandler = () => {
      clearTimeout(timeoutId);
      window.removeEventListener('online', onlineHandler);
      chatLogger.info('api', 'Network connection restored');
      resolve();
    };

    window.addEventListener('online', onlineHandler);
  });
}

/**
 * Retry with online check - waits for network before retrying
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns Promise with result or throws final error
 */
export async function retryWithOnlineCheck<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  return retryWithBackoff(async () => {
    // Wait for network if offline
    if (!isOnline()) {
      chatLogger.warn('api', 'Device is offline, waiting for connection...');
      await waitForOnline();
    }

    return fn();
  }, options);
}

/**
 * Advanced retry strategy for chat API calls
 * - Checks network status before retrying
 * - Uses exponential backoff
 * - Logs all retry attempts
 * - Shows user-friendly error messages
 */
export async function chatAPIRetry<T>(
  operation: string,
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts: RetryOptions = {
    maxRetries: 3,
    initialDelay: 1000,
    onRetry: (attempt) => {
      chatLogger.warn('api', `Retrying ${operation} (attempt ${attempt}/3)`);
    },
    ...options
  };

  try {
    return await retryWithOnlineCheck(fn, opts);
  } catch (error) {
    chatLogger.error('api', `${operation} failed after all retries`, error);
    throw error;
  }
}

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).networkRetry = {
    fetchWithRetry,
    fetchJSONWithRetry,
    retryWithBackoff,
    isOnline,
    waitForOnline
  };
}
