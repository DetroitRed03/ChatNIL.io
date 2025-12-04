import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server-Side Supabase Client for Next.js App Router
 *
 * This client is used in:
 * - API routes (app/api/*)
 * - Server Components
 * - Server Actions
 *
 * Features:
 * - Cookie-based session management
 * - Automatic token refresh
 * - Works with Row Level Security (RLS)
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Service Role Client (Admin)
 *
 * Bypasses Row Level Security (RLS)
 * Use only in secure server-side contexts
 *
 * Use cases:
 * - Admin operations
 * - Bulk operations
 * - User management
 * - Data seeding
 *
 * Note: Using @supabase/supabase-js directly (not @supabase/ssr)
 * because the SSR client doesn't properly bypass RLS with service role key
 */
export function createServiceRoleClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  // Use direct createClient from @supabase/supabase-js to ensure RLS is bypassed
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
