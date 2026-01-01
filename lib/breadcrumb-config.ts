/**
 * Breadcrumb Configuration
 *
 * Centralized configuration for breadcrumb navigation across the app.
 * Each route maps to a label and optional parent route.
 */

export interface BreadcrumbConfig {
  label: string;
  parent?: string;
  icon?: string;
}

// Static breadcrumb configuration for known routes
export const BREADCRUMB_CONFIG: Record<string, BreadcrumbConfig> = {
  // Athlete routes
  '/dashboard': { label: 'Dashboard' },
  '/profile': { label: 'Profile', parent: '/dashboard' },
  '/profile/edit': { label: 'Edit Profile', parent: '/profile' },
  '/opportunities': { label: 'Opportunities', parent: '/dashboard' },
  '/messages': { label: 'Messages', parent: '/dashboard' },
  '/quizzes': { label: 'Quizzes', parent: '/dashboard' },
  '/nil-deals': { label: 'Deals', parent: '/dashboard' },
  '/badges': { label: 'Badges', parent: '/dashboard' },
  '/assessment': { label: 'Assessment', parent: '/dashboard' },
  '/assessment/take': { label: 'Take Assessment', parent: '/assessment' },
  '/assessment/results': { label: 'Results', parent: '/assessment' },
  '/chat': { label: 'AI Coach', parent: '/dashboard' },
  '/settings': { label: 'Settings', parent: '/dashboard' },
  '/library': { label: 'Library', parent: '/dashboard' },

  // Public profile (when authenticated user views it)
  '/athletes': { label: 'Public Profile', parent: '/dashboard' },

  // Agency routes (for agency users)
  '/agency/dashboard': { label: 'Dashboard' },
  '/agency/discover': { label: 'Discover', parent: '/agency/dashboard' },
  '/agency/campaigns': { label: 'Campaigns', parent: '/agency/dashboard' },
  '/agency/campaigns/new': { label: 'New Campaign', parent: '/agency/campaigns' },
  '/agency/athletes': { label: 'My Athletes', parent: '/agency/dashboard' },
  '/agency/messages': { label: 'Messages', parent: '/agency/dashboard' },
  '/agency/profile': { label: 'Profile', parent: '/agency/dashboard' },
};

// Routes that should NOT show breadcrumbs
export const NO_BREADCRUMB_ROUTES = [
  '/',
  '/chat',
  '/login',
  '/signup',
  '/onboarding',
  '/welcome',
  '/auth/callback',
  '/auth/confirm',
  '/reset-password',
  '/forgot-password',
];

// Routes where breadcrumb is the dashboard root (no parent shown)
export const ROOT_ROUTES = [
  '/dashboard',
  '/agency/dashboard',
];

/**
 * Build breadcrumb trail from current pathname
 */
export function buildBreadcrumbs(
  pathname: string,
  userRole?: string
): { label: string; href?: string; active?: boolean }[] {
  // Check if this route should show breadcrumbs
  if (NO_BREADCRUMB_ROUTES.some(route => pathname === route || pathname.startsWith(route + '?'))) {
    return [];
  }

  // Check if this is a root route (dashboard)
  if (ROOT_ROUTES.includes(pathname)) {
    return [];
  }

  const breadcrumbs: { label: string; href?: string; active?: boolean }[] = [];

  // Normalize pathname (remove trailing slash, handle dynamic segments)
  let normalizedPath = pathname.replace(/\/$/, '');

  // Handle dynamic route segments like /athletes/[username]
  // Match the base path for config lookup
  let configPath = normalizedPath;

  // Check for /athletes/[username] pattern
  if (normalizedPath.match(/^\/athletes\/[^\/]+$/)) {
    configPath = '/athletes';
  }

  // Check for /agency/campaigns/[id] pattern
  if (normalizedPath.match(/^\/agency\/campaigns\/[^\/]+$/) && !normalizedPath.endsWith('/new')) {
    configPath = '/agency/campaigns';
    // Add campaign detail breadcrumb
    breadcrumbs.push({ label: 'Campaign Details', active: true });
  }

  // Check for /agency/athletes/[id] pattern
  if (normalizedPath.match(/^\/agency\/athletes\/[^\/]+$/)) {
    configPath = '/agency/athletes';
    breadcrumbs.push({ label: 'Athlete Details', active: true });
  }

  // Build the trail by walking up the parent chain
  let currentPath: string | undefined = configPath;
  const trail: { label: string; href: string }[] = [];

  while (currentPath) {
    const config = BREADCRUMB_CONFIG[currentPath];
    if (!config) break;

    trail.unshift({
      label: config.label,
      href: currentPath,
    });

    currentPath = config.parent;
  }

  // Convert trail to breadcrumb format
  // All items except the last one get href, last one is active
  const result = trail.map((item, index) => ({
    label: item.label,
    href: index < trail.length - 1 ? item.href : undefined,
    active: index === trail.length - 1,
  }));

  // Add any additional dynamic breadcrumbs we collected earlier
  if (breadcrumbs.length > 0) {
    // Remove active from the last static item
    if (result.length > 0) {
      result[result.length - 1].active = false;
      result[result.length - 1].href = result[result.length - 1].href || configPath;
    }
    // Add dynamic items
    result.push(...breadcrumbs);
  }

  return result;
}

/**
 * Get the appropriate dashboard route based on user role
 */
export function getDashboardRoute(userRole?: string): string {
  if (userRole === 'agency') {
    return '/agency/dashboard';
  }
  return '/dashboard';
}
