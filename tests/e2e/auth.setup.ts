import { test as setup, expect } from '@playwright/test';
import { existingTestUser, loginWithModal } from '../fixtures/test-users';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.join(__dirname, '../../playwright/.auth/user.json');

/**
 * Auth Setup - Run once before all tests
 * Creates persistent authentication state to avoid login per test
 *
 * Note: Supabase stores auth tokens in localStorage, but API routes need cookies.
 * After login, we need to make an API call to trigger the middleware which
 * syncs the auth state and sets the proper cookies.
 */
setup('authenticate', async ({ page }) => {
  // Ensure auth directory exists
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Login using modal-based auth
  await loginWithModal(page, existingTestUser.email, existingTestUser.password);

  // Verify login was successful by checking for dashboard or discovery
  await expect(page).toHaveURL(/\/(dashboard|discovery|onboarding)/);

  // Wait for page to fully load and trigger cookie sync
  await page.waitForLoadState('networkidle');

  // Navigate to HS student dashboard to trigger the full auth flow
  // This ensures middleware runs and cookies are properly set
  await page.goto('/dashboard/hs-student');
  await page.waitForLoadState('networkidle');

  // Wait for cookies to be set by Supabase SSR
  // The middleware and API calls will trigger cookie creation
  await page.waitForTimeout(3000);

  // Verify we have auth cookies now
  const cookies = await page.context().cookies();
  const hasAuthCookies = cookies.some(c =>
    c.name.includes('supabase') ||
    c.name.includes('sb-') ||
    c.name.includes('auth')
  );

  if (!hasAuthCookies) {
    console.log('Warning: No auth cookies found after login. Cookies:', cookies.map(c => c.name));
    // Try to trigger cookie creation by making an API call through the page
    await page.evaluate(async () => {
      await fetch('/api/dashboard/hs-student', { credentials: 'include' });
    });
    await page.waitForTimeout(1000);
  }

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });

  // Log the saved cookies for debugging
  const savedCookies = await page.context().cookies();
  console.log('Auth state saved. Cookies:', savedCookies.map(c => c.name).join(', ') || 'none');
  console.log('Auth state saved to:', AUTH_FILE);
});
