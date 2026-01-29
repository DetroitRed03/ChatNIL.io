import type { Page, APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Test helper utilities for E2E testing
 * ChatNIL High School Student Experience
 *
 * Note: Supabase stores auth tokens in localStorage, not cookies.
 * For API requests in tests, we need to extract the access_token from localStorage
 * and pass it as a Bearer token or ensure the middleware handles it.
 */

/**
 * Wait for dashboard content to be fully loaded
 */
export async function waitForDashboard(page: Page, timeout = 15000): Promise<boolean> {
  try {
    // Wait for any dashboard indicator
    await page.waitForSelector(
      '[data-testid="hs-student-dashboard"], [data-testid="journey-progress"], main, .dashboard',
      { timeout }
    );

    // Additional wait for dynamic content
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for specific content to appear on page
 */
export async function waitForContent(
  page: Page,
  patterns: RegExp | string,
  timeout = 10000
): Promise<boolean> {
  const startTime = Date.now();
  const regex = typeof patterns === 'string' ? new RegExp(patterns, 'i') : patterns;

  while (Date.now() - startTime < timeout) {
    const pageContent = await page.textContent('body') || '';
    if (regex.test(pageContent)) {
      return true;
    }
    await page.waitForTimeout(500);
  }

  return false;
}

/**
 * Retry an action with exponential backoff
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      const delay = initialDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Make authenticated API request using page cookies
 */
export async function makeAuthenticatedRequest(
  page: Page,
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: unknown
): Promise<{ status: number; body: unknown }> {
  const cookies = await page.context().cookies();
  const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  const options: Parameters<typeof request.get>[1] = {
    headers: {
      Cookie: cookieHeader,
      'Content-Type': 'application/json',
    },
  };

  if (data && method !== 'GET') {
    (options as { data?: unknown }).data = data;
  }

  let response;
  switch (method) {
    case 'GET':
      response = await request.get(url, options);
      break;
    case 'POST':
      response = await request.post(url, { ...options, data });
      break;
    case 'PUT':
      response = await request.put(url, { ...options, data });
      break;
    case 'DELETE':
      response = await request.delete(url, options);
      break;
  }

  let body;
  try {
    body = await response.json();
  } catch {
    body = await response.text();
  }

  return { status: response.status(), body };
}

/**
 * Check if element is visible with fallback
 */
export async function isElementVisible(
  page: Page,
  selectors: string[],
  timeout = 5000
): Promise<boolean> {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      const isVisible = await element.isVisible({ timeout });
      if (isVisible) return true;
    } catch {
      // Continue to next selector
    }
  }
  return false;
}

/**
 * Get authenticated cookies from page context
 */
export async function getAuthCookies(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  return cookies.map(c => `${c.name}=${c.value}`).join('; ');
}

/**
 * Get Supabase auth token from localStorage
 * Supabase stores auth tokens in localStorage with pattern: sb-{project-ref}-auth-token
 */
export async function getSupabaseAuthToken(page: Page): Promise<string | null> {
  try {
    const token = await page.evaluate(() => {
      // Find the Supabase auth token in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('supabase') && key.includes('auth-token')) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const parsed = JSON.parse(value);
              return parsed.access_token || null;
            } catch {
              return null;
            }
          }
        }
      }
      // Alternative: look for sb-*-auth-token pattern
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const parsed = JSON.parse(value);
              return parsed.access_token || null;
            } catch {
              return null;
            }
          }
        }
      }
      return null;
    });
    return token;
  } catch {
    return null;
  }
}

/**
 * Get auth headers for API requests
 * Combines cookies and Bearer token for comprehensive auth
 */
export async function getAuthHeaders(page: Page): Promise<Record<string, string>> {
  const cookies = await getAuthCookies(page);
  const token = await getSupabaseAuthToken(page);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (cookies) {
    headers['Cookie'] = cookies;
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Wait for API response with retry
 */
export async function waitForApiResponse(
  page: Page,
  request: APIRequestContext,
  url: string,
  expectedStatus: number[] = [200],
  maxRetries = 3
): Promise<{ ok: boolean; status: number; data?: unknown }> {
  const cookies = await getAuthCookies(page);

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await request.get(url, {
        headers: { Cookie: cookies },
      });

      const status = response.status();
      if (expectedStatus.includes(status)) {
        const data = await response.json().catch(() => null);
        return { ok: true, status, data };
      }

      if (i < maxRetries - 1) {
        await page.waitForTimeout(1000 * (i + 1));
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        return { ok: false, status: 0 };
      }
      await page.waitForTimeout(1000 * (i + 1));
    }
  }

  return { ok: false, status: 0 };
}

/**
 * Verify user is authenticated
 */
export async function verifyAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(c =>
    c.name.includes('supabase') ||
    c.name.includes('sb-') ||
    c.name.includes('auth')
  );
}

/**
 * Wait for page to be ready (loaded + dynamic content)
 */
export async function waitForPageReady(page: Page, timeout = 15000): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000); // Allow React hydration
}

/**
 * Check page content matches any of the provided patterns
 */
export async function pageContentMatches(
  page: Page,
  patterns: RegExp[]
): Promise<boolean> {
  const content = await page.textContent('body') || '';
  return patterns.some(pattern => pattern.test(content));
}
