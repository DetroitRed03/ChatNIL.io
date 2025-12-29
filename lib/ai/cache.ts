/**
 * AI Response Cache
 *
 * Caches common AI responses to reduce API costs and improve response time.
 * Uses Supabase for persistent storage with TTL-based expiration.
 */

import { supabaseAdmin } from '../supabase';
import crypto from 'crypto';

export interface CacheEntry {
  id: string;
  query_hash: string;
  query_text: string;
  response_text: string;
  user_role: string;
  hit_count: number;
  created_at: string;
  expires_at: string;
  metadata: Record<string, any>;
}

export interface CacheConfig {
  enabled: boolean;
  ttlHours: number;
  minQueryLength: number;
  maxCacheSize: number;
}

// Default cache configuration
const DEFAULT_CONFIG: CacheConfig = {
  enabled: true,
  ttlHours: 24, // Cache responses for 24 hours
  minQueryLength: 10, // Don't cache very short queries
  maxCacheSize: 1000, // Maximum number of cached entries
};

/**
 * Generate a hash for the query to use as cache key
 * Normalizes the query to improve cache hit rate
 */
export function generateQueryHash(query: string, userRole: string): string {
  // Normalize query: lowercase, trim, remove extra spaces
  const normalizedQuery = query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s?]/g, ''); // Remove punctuation except ?

  const hashInput = `${normalizedQuery}:${userRole}`;
  return crypto.createHash('sha256').update(hashInput).digest('hex').substring(0, 32);
}

/**
 * Check if a query is cacheable
 */
export function isCacheable(query: string, config: CacheConfig = DEFAULT_CONFIG): boolean {
  if (!config.enabled) return false;
  if (query.length < config.minQueryLength) return false;

  // Don't cache queries with personal pronouns (likely personal questions)
  const personalPatterns = [
    /\bmy\b/i,
    /\bmine\b/i,
    /\bi am\b/i,
    /\bi'm\b/i,
    /\bi have\b/i,
    /\bi've\b/i,
  ];

  if (personalPatterns.some(pattern => pattern.test(query))) {
    return false;
  }

  // Don't cache queries asking about specific people/athletes
  const specificPatterns = [
    /who is/i,
    /tell me about \w+/i,
    /what about \w+/i,
  ];

  if (specificPatterns.some(pattern => pattern.test(query))) {
    return false;
  }

  return true;
}

/**
 * Get cached response for a query
 */
export async function getCachedResponse(
  query: string,
  userRole: string
): Promise<CacheEntry | null> {
  if (!supabaseAdmin) {
    console.log('Cache: Supabase not available');
    return null;
  }

  const queryHash = generateQueryHash(query, userRole);

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_response_cache')
      .select('*')
      .eq('query_hash', queryHash)
      .eq('user_role', userRole)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return null;
    }

    // Increment hit count in background
    supabaseAdmin
      .from('ai_response_cache')
      .update({ hit_count: (data.hit_count || 0) + 1 })
      .eq('id', data.id)
      .then(() => {
        console.log(`Cache hit for query hash: ${queryHash.substring(0, 8)}...`);
      });

    return data as CacheEntry;
  } catch (error) {
    console.error('Cache lookup error:', error);
    return null;
  }
}

/**
 * Store a response in the cache
 */
export async function cacheResponse(
  query: string,
  response: string,
  userRole: string,
  metadata: Record<string, any> = {},
  config: CacheConfig = DEFAULT_CONFIG
): Promise<boolean> {
  if (!supabaseAdmin) {
    console.log('Cache: Supabase not available');
    return false;
  }

  if (!isCacheable(query, config)) {
    console.log('Cache: Query not cacheable');
    return false;
  }

  const queryHash = generateQueryHash(query, userRole);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + config.ttlHours);

  try {
    const { error } = await supabaseAdmin
      .from('ai_response_cache')
      .upsert({
        query_hash: queryHash,
        query_text: query.substring(0, 500), // Truncate for storage
        response_text: response,
        user_role: userRole,
        hit_count: 0,
        expires_at: expiresAt.toISOString(),
        metadata,
      }, {
        onConflict: 'query_hash,user_role'
      });

    if (error) {
      console.error('Cache store error:', error);
      return false;
    }

    console.log(`Cached response for query hash: ${queryHash.substring(0, 8)}...`);
    return true;
  } catch (error) {
    console.error('Cache store error:', error);
    return false;
  }
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  if (!supabaseAdmin) return 0;

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_response_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }

    const count = data?.length || 0;
    console.log(`Cleared ${count} expired cache entries`);
    return count;
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalHits: number;
  avgHitsPerEntry: number;
  oldestEntry: string | null;
  newestEntry: string | null;
}> {
  if (!supabaseAdmin) {
    return {
      totalEntries: 0,
      totalHits: 0,
      avgHitsPerEntry: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('ai_response_cache')
      .select('hit_count, created_at')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (error || !data) {
      return {
        totalEntries: 0,
        totalHits: 0,
        avgHitsPerEntry: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }

    const totalHits = data.reduce((sum, entry) => sum + (entry.hit_count || 0), 0);

    return {
      totalEntries: data.length,
      totalHits,
      avgHitsPerEntry: data.length > 0 ? totalHits / data.length : 0,
      oldestEntry: data.length > 0 ? data[0].created_at : null,
      newestEntry: data.length > 0 ? data[data.length - 1].created_at : null,
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return {
      totalEntries: 0,
      totalHits: 0,
      avgHitsPerEntry: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }
}

/**
 * Pre-warm cache with common NIL questions
 * Run this periodically to ensure fast responses for common queries
 */
export const COMMON_NIL_QUERIES = [
  'What is NIL?',
  'How does NIL work for college athletes?',
  'What are NIL rules?',
  'Can high school athletes do NIL deals?',
  'How do I get started with NIL?',
  'What is a fair NIL deal?',
  'Do I need an agent for NIL?',
  'How are NIL deals taxed?',
  'What is NIL compliance?',
  'Can I lose eligibility from NIL?',
];
