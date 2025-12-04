/**
 * Database-Driven Rate Limiting
 *
 * Uses Supabase database functions for rate limiting without external dependencies.
 * Pattern matches the FMV rate limiting approach.
 */

import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Rate limit configurations
export const RATE_LIMITS = {
  // Chat AI endpoint - most critical for cost protection
  CHAT_AI: {
    maxRequests: 20,      // 20 requests
    windowMinutes: 1,      // per minute
    endpoint: 'chat_ai'
  },
  // Auth endpoints - prevent brute force
  AUTH_SIGNUP: {
    maxRequests: 5,        // 5 signup attempts
    windowMinutes: 60,     // per hour
    endpoint: 'auth_signup'
  },
  AUTH_LOGIN: {
    maxRequests: 10,       // 10 login attempts
    windowMinutes: 15,     // per 15 minutes
    endpoint: 'auth_login'
  },
  // Onboarding - prevent spam accounts
  ONBOARDING: {
    maxRequests: 3,        // 3 attempts
    windowMinutes: 60,     // per hour
    endpoint: 'onboarding'
  },
  // Quiz submission - prevent gaming
  QUIZ: {
    maxRequests: 30,       // 30 submissions
    windowMinutes: 5,      // per 5 minutes
    endpoint: 'quiz'
  },
  // FMV calculation - already limited in DB, this is backup
  FMV: {
    maxRequests: 3,        // 3 calculations
    windowMinutes: 1440,   // per day (24 hours)
    endpoint: 'fmv'
  }
} as const;

export type RateLimitConfig = typeof RATE_LIMITS[keyof typeof RATE_LIMITS];

interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  limit?: number;
  resetAt?: Date;
  error?: string;
}

/**
 * Create a Supabase admin client for rate limiting
 */
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[RateLimit] Missing Supabase credentials');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(): string {
  try {
    const headersList = headers();
    // Check various headers for IP
    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIP = headersList.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const cfIP = headersList.get('cf-connecting-ip');
    if (cfIP) {
      return cfIP;
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Hash IP address for privacy
 */
export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.RATE_LIMIT_SALT || 'chatnil')).digest('hex').substring(0, 32);
}

/**
 * Check rate limit for authenticated user
 */
export async function checkRateLimit(
  userId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabase = getAdminClient();

  if (!supabase) {
    // Fail open if no database connection (but log it)
    console.warn('[RateLimit] No database connection, allowing request');
    return { allowed: true };
  }

  try {
    const { data, error } = await supabase.rpc('check_api_rate_limit', {
      p_user_id: userId,
      p_endpoint: config.endpoint,
      p_max_requests: config.maxRequests,
      p_window_minutes: config.windowMinutes
    });

    if (error) {
      console.error('[RateLimit] Database error:', error);
      // Fail open on error
      return { allowed: true, error: error.message };
    }

    const allowed = data === true;

    // Get remaining info if rate limited
    if (!allowed) {
      const { data: remainingData } = await supabase.rpc('get_rate_limit_remaining', {
        p_user_id: userId,
        p_endpoint: config.endpoint,
        p_max_requests: config.maxRequests,
        p_window_minutes: config.windowMinutes
      });

      return {
        allowed: false,
        remaining: 0,
        limit: config.maxRequests,
        resetAt: remainingData?.reset_at ? new Date(remainingData.reset_at) : undefined
      };
    }

    return { allowed: true };
  } catch (err) {
    console.error('[RateLimit] Unexpected error:', err);
    // Fail open on unexpected error
    return { allowed: true, error: String(err) };
  }
}

/**
 * Check rate limit for anonymous user (by IP)
 */
export async function checkAnonRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabase = getAdminClient();

  if (!supabase) {
    console.warn('[RateLimit] No database connection, allowing request');
    return { allowed: true };
  }

  const ip = getClientIP();
  const identifier = hashIP(ip);

  try {
    const { data, error } = await supabase.rpc('check_anon_rate_limit', {
      p_identifier: identifier,
      p_endpoint: config.endpoint,
      p_max_requests: config.maxRequests,
      p_window_minutes: config.windowMinutes
    });

    if (error) {
      console.error('[RateLimit] Database error:', error);
      return { allowed: true, error: error.message };
    }

    return { allowed: data === true };
  } catch (err) {
    console.error('[RateLimit] Unexpected error:', err);
    return { allowed: true, error: String(err) };
  }
}

/**
 * Create rate limit error response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  const resetAt = result.resetAt ? result.resetAt.toISOString() : undefined;

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: resetAt,
      limit: result.limit
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(result.limit || 0),
        'X-RateLimit-Remaining': '0',
        ...(resetAt && { 'X-RateLimit-Reset': resetAt }),
        'Retry-After': result.resetAt
          ? String(Math.ceil((result.resetAt.getTime() - Date.now()) / 1000))
          : '60'
      }
    }
  );
}

/**
 * Rate limit middleware wrapper for API routes
 *
 * Usage:
 * ```ts
 * export async function POST(req: Request) {
 *   // For authenticated endpoints
 *   const limitResult = await withRateLimit(userId, RATE_LIMITS.CHAT_AI);
 *   if (!limitResult.allowed) {
 *     return rateLimitResponse(limitResult);
 *   }
 *   // ... rest of handler
 * }
 * ```
 */
export async function withRateLimit(
  userId: string | null,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (userId) {
    return checkRateLimit(userId, config);
  } else {
    return checkAnonRateLimit(config);
  }
}
