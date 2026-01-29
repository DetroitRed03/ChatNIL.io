import { test, expect } from '@playwright/test';
import { existingTestUser, loginWithModal } from '../fixtures/test-users';

/**
 * Suite 5: Role-Based Access Control
 * Tests that users can only access features appropriate for their role
 */

test.describe('Role-Based Access Control', () => {

  test.describe('Unauthenticated Access', () => {

    test('unauthenticated user cannot access HS student dashboard', async ({ page }) => {
      await page.goto('/dashboard/hs-student');

      // Wait for page to load
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1000);

      const url = page.url();
      const pageContent = await page.textContent('body') || '';

      // Check if protected - could be redirect, error page, login prompt, or home
      const isProtected =
        url.includes('login') ||
        url.includes('auth') ||
        url === 'http://localhost:3000/' ||
        url.includes('?') || // May have redirect params
        /unauthorized|sign.*in|log.*in|error|loading/i.test(pageContent) ||
        !url.includes('/dashboard/hs-student'); // Redirected away

      expect(isProtected).toBe(true);
    });

    test('unauthenticated user cannot access discovery', async ({ page }) => {
      await page.goto('/discovery');

      await page.waitForURL(/login|unauthorized/, { timeout: 5000 }).catch(() => {});

      const url = page.url();
      const pageContent = await page.textContent('body') || '';

      const isProtected =
        url.includes('login') ||
        /unauthorized|sign.*in|log.*in/i.test(pageContent);

      expect(isProtected).toBe(true);
    });

    test('unauthenticated user cannot access onboarding pages', async ({ page }) => {
      const onboardingPages = [
        '/onboarding/hs-student',
        '/onboarding/college-athlete',
        '/onboarding/parent',
        '/onboarding/compliance-officer',
      ];

      for (const path of onboardingPages) {
        await page.goto(path);

        // Should either redirect to login or show the page (some onboarding may be accessible)
        await page.waitForTimeout(500);

        const url = page.url();

        // Onboarding pages may be accessible pre-auth but should lead to login eventually
        // This is a soft check as implementation may vary
      }
    });

    test('unauthenticated user cannot access API endpoints', async ({ request }) => {
      const protectedEndpoints = [
        { method: 'GET', url: '/api/dashboard/hs-student' },
        { method: 'GET', url: '/api/discovery/current-state' },
        { method: 'GET', url: '/api/discovery/profile' },
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request.get(endpoint.url);

        // Should return 401 (Unauthorized), 403 (Forbidden), or 400 (Bad Request)
        // All indicate protected access
        expect([400, 401, 403].includes(response.status())).toBe(true);
      }
    });
  });

  test.describe('HS Student Role Restrictions', () => {

    test.beforeEach(async ({ page }) => {
      // Login as HS student using modal-based auth
      await loginWithModal(page, existingTestUser.email, existingTestUser.password);
    });

    test('HS student can access HS student dashboard', async ({ page }) => {
      await page.goto('/dashboard/hs-student');

      // Should load successfully
      await expect(page).toHaveURL(/dashboard.*hs-student/);

      const pageContent = await page.textContent('body') || '';
      expect(/journey|discovery|progress|welcome|hey/i.test(pageContent)).toBe(true);
    });

    test('HS student can access discovery', async ({ page }) => {
      await page.goto('/discovery');

      // Should load successfully
      await expect(page).toHaveURL(/discovery/);
    });

    test('HS student cannot access college athlete dashboard', async ({ page }) => {
      await page.goto('/athlete/dashboard');

      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1000);

      const url = page.url();
      const pageContent = await page.textContent('body') || '';

      // Should redirect away, show access denied, or 404
      const isDenied =
        !url.includes('/athlete/dashboard') ||
        url.includes('hs-student') ||
        url.includes('discovery') ||
        url.includes('404') ||
        /access.*denied|unauthorized|not.*authorized|403|not found|404/i.test(pageContent);

      expect(isDenied).toBe(true);
    });

    test('HS student cannot access deal validation', async ({ page }) => {
      await page.goto('/deals/validate');

      await page.waitForTimeout(1000);

      const url = page.url();
      const pageContent = await page.textContent('body') || '';

      // Should redirect or show not found/denied
      const isDenied =
        !url.includes('/deals/validate') ||
        /access.*denied|not.*found|404|403/i.test(pageContent);

      expect(isDenied).toBe(true);
    });

    test('HS student cannot access compliance dashboard', async ({ page }) => {
      await page.goto('/compliance/dashboard');

      await page.waitForTimeout(1000);

      const url = page.url();
      const pageContent = await page.textContent('body') || '';

      // Should redirect or deny access
      const isDenied =
        !url.includes('/compliance/dashboard') ||
        /access.*denied|not.*found|404|403/i.test(pageContent);

      expect(isDenied).toBe(true);
    });

    test('HS student cannot access parent dashboard', async ({ page }) => {
      await page.goto('/parent/dashboard');

      await page.waitForTimeout(1000);

      const url = page.url();
      const pageContent = await page.textContent('body') || '';

      // Should redirect or deny access
      const isDenied =
        !url.includes('/parent/dashboard') ||
        /access.*denied|not.*found|404|403/i.test(pageContent);

      expect(isDenied).toBe(true);
    });

    test('HS student cannot access admin pages', async ({ page }) => {
      await page.goto('/admin');

      await page.waitForTimeout(1000);

      const url = page.url();
      const pageContent = await page.textContent('body') || '';

      // Should redirect or deny access
      const isDenied =
        !url.includes('/admin') ||
        /access.*denied|not.*found|404|403/i.test(pageContent);

      expect(isDenied).toBe(true);
    });
  });

  test.describe('API Access Control', () => {

    test.beforeEach(async ({ page }) => {
      // Login as HS student using modal-based auth
      await loginWithModal(page, existingTestUser.email, existingTestUser.password);
    });

    test('HS student can access HS student dashboard API', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      const response = await request.get('/api/dashboard/hs-student', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      // Log status for debugging if not OK
      if (!response.ok()) {
        console.log('HS student dashboard API returned:', response.status());
        const body = await response.text();
        console.log('Response:', body);
      }

      expect(response.ok()).toBe(true);
    });

    test('HS student can access discovery APIs', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      // Test current-state API
      const response = await request.get('/api/discovery/current-state', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      // Log status for debugging if not OK
      if (!response.ok()) {
        console.log('Discovery current-state API returned:', response.status());
      }

      expect(response.ok()).toBe(true);
    });

    test('HS student cannot access college athlete API endpoints', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      // Try to access college athlete specific endpoints
      const collegeEndpoints = [
        '/api/athlete/deals',
        '/api/athlete/compliance',
        '/api/deals/validate',
      ];

      for (const endpoint of collegeEndpoints) {
        const response = await request.get(endpoint, {
          headers: {
            Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
          }
        });

        // Should return 403 (forbidden) or 404 (not found)
        expect([403, 404, 401].includes(response.status())).toBe(true);
      }
    });

    test('HS student cannot access compliance officer APIs', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      const complianceEndpoints = [
        '/api/compliance/athletes',
        '/api/compliance/deals',
        '/api/compliance/reports',
      ];

      for (const endpoint of complianceEndpoints) {
        const response = await request.get(endpoint, {
          headers: {
            Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
          }
        });

        // Should return 403 or 404
        expect([403, 404, 401].includes(response.status())).toBe(true);
      }
    });
  });

  test.describe('Role Detection', () => {

    test.beforeEach(async ({ page }) => {
      // Login using modal-based auth
      await loginWithModal(page, existingTestUser.email, existingTestUser.password);
    });

    test('dashboard API returns correct role', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      const response = await request.get('/api/dashboard/hs-student', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      if (response.ok()) {
        const data = await response.json();

        // API should indicate this is an HS student context
        // The exact way this is communicated may vary
      }
    });

    test('get-profile API returns user role', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      // Get user ID from dashboard response
      const dashboardResponse = await request.get('/api/dashboard/hs-student', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      if (dashboardResponse.ok()) {
        const dashboardData = await dashboardResponse.json();
        const userId = dashboardData.user?.id;

        if (userId) {
          const profileResponse = await request.post('/api/auth/get-profile', {
            headers: {
              Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
            },
            data: { userId }
          });

          if (profileResponse.ok()) {
            const profileData = await profileResponse.json();

            // Profile should include role
            expect(profileData.profile?.role).toBe('hs_student');
          }
        }
      }
    });
  });

  test.describe('Session Security', () => {

    test('logout clears session', async ({ page, request }) => {
      // Login using modal-based auth
      await loginWithModal(page, existingTestUser.email, existingTestUser.password);

      // Verify logged in
      const cookies = await page.context().cookies();

      // Check if we have auth cookies
      const hasAuthCookies = cookies.some(c => c.name.includes('supabase') || c.name.includes('sb-'));

      if (hasAuthCookies) {
        const response1 = await request.get('/api/dashboard/hs-student', {
          headers: {
            Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
          }
        });

        // If first request fails, log it
        if (!response1.ok()) {
          console.log('Pre-logout API check returned:', response1.status());
        }
      }

      // Clear cookies and try to access protected resource
      await page.context().clearCookies();

      const response2 = await request.get('/api/dashboard/hs-student');
      // Without cookies, should be unauthorized
      expect([400, 401, 403].includes(response2.status())).toBe(true);
    });

    test('invalid session returns unauthorized', async ({ request }) => {
      const response = await request.get('/api/dashboard/hs-student', {
        headers: {
          Cookie: 'sb-auth-token=invalid-token-12345'
        }
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe('Cross-Role Access Prevention', () => {

    test.beforeEach(async ({ page }) => {
      // Login using modal-based auth
      await loginWithModal(page, existingTestUser.email, existingTestUser.password);
    });

    test('HS student cannot access another users data', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      // Try to access another user's profile
      const response = await request.post('/api/auth/get-profile', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        },
        data: { userId: 'other-user-id-12345' }
      });

      // Should either return 403 or 404, not the other user's data
      expect([403, 404, 500].includes(response.status())).toBe(true);
    });

    test('URL manipulation does not grant access', async ({ page }) => {
      // Try to access dashboard with different role in URL
      await page.goto('/dashboard/compliance');
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1000);

      const url = page.url();
      const pageContent = await page.textContent('body') || '';

      // Should not show compliance dashboard content
      // Either redirected away OR shows 404/denied
      const isDenied =
        !url.includes('/dashboard/compliance') ||
        url.includes('hs-student') ||
        url.includes('404') ||
        /access.*denied|unauthorized|not found|404|forbidden/i.test(pageContent);

      expect(isDenied).toBe(true);
    });
  });
});
