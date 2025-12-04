import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Get cookie from document.cookie
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) {
              return decodeURIComponent(value);
            }
          }
          return null;
        },
        set(name: string, value: string, options: any) {
          // Set cookie in document.cookie
          let cookieString = `${name}=${encodeURIComponent(value)}`;
          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`;
          }
          if (options?.path) {
            cookieString += `; path=${options.path}`;
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`;
          }
          if (options?.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
          }
          if (options?.secure) {
            cookieString += '; secure';
          }
          document.cookie = cookieString;
        },
        remove(name: string, options: any) {
          // Remove cookie by setting max-age to 0
          let cookieString = `${name}=; max-age=0`;
          if (options?.path) {
            cookieString += `; path=${options.path}`;
          }
          document.cookie = cookieString;
        },
      },
    }
  );
}