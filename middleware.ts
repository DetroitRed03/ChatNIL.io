import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Set cookie on both request and response
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          // Remove cookie from both request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired - this updates the cookies
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Define athlete-only routes (routes that only athletes can access)
  const athleteOnlyRoutes = [
    '/dashboard',
    '/badges',
    '/quizzes',
    '/library',
    '/opportunities',
    '/discover',
    '/nil-deals',
  ];

  // Public athlete profile pages (/profile/[id]) are accessible to everyone
  // But the athlete's own profile editor (/profile without ID) is athlete-only
  const isOwnProfileRoute = pathname === '/profile' || pathname === '/profile/edit';

  // Define agency routes
  const isAgencyRoute = pathname.startsWith('/agency');
  const isAthleteOnlyRoute = athleteOnlyRoutes.some(route => pathname.startsWith(route)) || isOwnProfileRoute;

  // If user is logged in, enforce role-based routing
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profile) {
      // CRITICAL: Onboarding guard for non-agency users who haven't completed onboarding
      // This ensures athletes/parents are forced to /onboarding if they haven't completed it
      if (profile.role !== 'agency' && profile.onboarding_completed === false) {
        // Allow access to onboarding-related paths and API routes
        const allowedPaths = ['/onboarding', '/api/auth', '/auth', '/api/user', '/api/badges'];
        const isAllowedPath = allowedPaths.some(path => pathname.startsWith(path));

        if (!isAllowedPath) {
          console.log('🔒 Middleware: User has not completed onboarding, redirecting from', pathname, 'to /onboarding');
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      }

      // Agency users: redirect from athlete-only routes and root to agency dashboard
      if (profile.role === 'agency') {
        if (isAthleteOnlyRoute || pathname === '/') {
          console.log('🔒 Middleware: Redirecting agency from', pathname, 'to /agency/dashboard');
          return NextResponse.redirect(new URL('/agency/dashboard', request.url));
        }
      }
      // Non-agency users: redirect from agency routes to athlete dashboard
      else {
        if (isAgencyRoute) {
          console.log('🔒 Middleware: Redirecting non-agency from', pathname, 'to /dashboard');
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // Redirect root to athlete dashboard (only if onboarding is complete)
        if (pathname === '/' && profile.onboarding_completed !== false) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
