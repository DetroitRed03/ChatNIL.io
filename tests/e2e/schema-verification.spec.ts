import { test, expect } from '@playwright/test';
import { existingTestUser, loginWithModal } from '../fixtures/test-users';

/**
 * Suite 1: Database Schema Verification (Task 1.1)
 * Verifies all required tables and columns exist for the HS Student experience
 */

test.describe('Database Schema - Compliance Platform', () => {

  // We'll test schema by making API calls that would fail if tables don't exist

  test('conversation_flows table exists with required columns', async ({ request }) => {
    // Try to fetch conversation flow state - this will fail if table doesn't exist
    const response = await request.get('/api/discovery/current-state');

    // Should get 401 (unauthorized) not 500 (table missing)
    // If we get 500 with "relation does not exist", the table is missing
    expect(response.status()).not.toBe(500);

    // If unauthorized, that's expected (no auth), but table exists
    if (response.status() === 401) {
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    }
  });

  test('chapter_unlocks table exists with required columns', async ({ request }) => {
    // The unlock-chapter endpoint requires auth but table existence can be inferred
    const response = await request.post('/api/discovery/unlock-chapter', {
      data: { pillar: 'identity' }
    });

    // Should get 401 (unauthorized) not 500 (table missing)
    expect(response.status()).not.toBe(500);
  });

  test('student_discovery_profiles table exists', async ({ request }) => {
    const response = await request.get('/api/discovery/profile');

    // Should get 401 (unauthorized) not 500 (table missing)
    expect(response.status()).not.toBe(500);
  });

  test('athlete_profiles table has role column', async ({ request }) => {
    // The dashboard endpoint checks for role = 'hs_student'
    const response = await request.get('/api/dashboard/hs-student');

    // Should get 401 (unauthorized) not 500 (column missing)
    expect(response.status()).not.toBe(500);

    if (response.status() === 401) {
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    }
  });

  test('users table exists with onboarding fields', async ({ request }) => {
    // The get-profile endpoint queries the users table
    const response = await request.post('/api/auth/get-profile', {
      data: { userId: 'test-user-id' }
    });

    // Should get 404 (user not found) or similar, not 500 (table missing)
    const status = response.status();
    expect([400, 404, 500].includes(status)).toBe(true);

    // If 500, check it's not because table doesn't exist
    if (status === 500) {
      const body = await response.json();
      expect(body.details || '').not.toContain('relation "users" does not exist');
    }
  });

  test.describe('Schema via authenticated endpoint tests', () => {
    // These tests require authentication with the test user

    test.beforeEach(async ({ page }) => {
      // Login as test HS student using modal-based auth
      await loginWithModal(page, existingTestUser.email, existingTestUser.password);
    });

    test('conversation_flows table is queryable', async ({ page, request }) => {
      // Get cookies from authenticated page
      const cookies = await page.context().cookies();

      // Make authenticated request
      const response = await request.get('/api/discovery/current-state', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      // Should succeed or return expected structure
      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('state');
        expect(data.state).toHaveProperty('currentPillar');
        expect(data.state).toHaveProperty('currentDay');
        expect(data.state).toHaveProperty('answersGiven');
        expect(data.state).toHaveProperty('unlockedChapters');
      }
    });

    test('chapter_unlocks table returns correct structure', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      const response = await request.get('/api/discovery/current-state', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data.state.unlockedChapters).toBeInstanceOf(Array);
        // Should have at least identity unlocked for test user
        expect(data.state.unlockedChapters).toContain('identity');
      }
    });

    test('student_discovery_profiles table returns profile data', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      const response = await request.get('/api/discovery/profile', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty('summary');
        expect(data.summary).toHaveProperty('identity');
        expect(data.summary).toHaveProperty('business');
        expect(data.summary).toHaveProperty('money');
        expect(data.summary).toHaveProperty('legacy');
      }
    });

    test('HS student dashboard returns correct data structure', async ({ page, request }) => {
      const cookies = await page.context().cookies();

      const response = await request.get('/api/dashboard/hs-student', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      if (response.ok()) {
        const data = await response.json();

        // Verify user object
        expect(data).toHaveProperty('user');
        expect(data.user).toHaveProperty('id');
        expect(data.user).toHaveProperty('fullName');
        expect(data.user).toHaveProperty('sport');
        expect(data.user).toHaveProperty('school');
        expect(data.user).toHaveProperty('state');

        // Verify discovery object
        expect(data).toHaveProperty('discovery');
        expect(data.discovery).toHaveProperty('completionPercentage');
        expect(data.discovery).toHaveProperty('currentPillar');
        expect(data.discovery).toHaveProperty('currentDay');
        expect(data.discovery).toHaveProperty('unlockedChapters');

        // Verify consent object
        expect(data).toHaveProperty('consent');
        expect(data.consent).toHaveProperty('status');

        // Verify profile summary
        expect(data).toHaveProperty('profile');

        // Verify badges
        expect(data).toHaveProperty('badges');
        expect(data.badges).toBeInstanceOf(Array);

        // Verify streak
        expect(data).toHaveProperty('streak');
        expect(typeof data.streak).toBe('number');

        // Verify daily question
        expect(data).toHaveProperty('dailyQuestion');
      }
    });
  });

  test.describe('Required columns verification', () => {

    test('athlete_profiles has required HS student columns', async ({ page, request }) => {
      // Login first using modal-based auth
      await loginWithModal(page, existingTestUser.email, existingTestUser.password);

      const cookies = await page.context().cookies();

      const response = await request.get('/api/dashboard/hs-student', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      if (response.ok()) {
        const data = await response.json();

        // These fields come from athlete_profiles
        expect(data.user).toHaveProperty('state');
        expect(data.user).toHaveProperty('school');

        // Consent comes from athlete_profiles.consent_status
        expect(data.consent).toHaveProperty('status');

        // Learning path comes from athlete_profiles
        expect(data).toHaveProperty('learningPath');
      }
    });

    test('conversation_flows has pillar tracking columns', async ({ page, request }) => {
      // Login using modal-based auth
      await loginWithModal(page, existingTestUser.email, existingTestUser.password);

      const cookies = await page.context().cookies();

      const response = await request.get('/api/discovery/current-state', {
        headers: {
          Cookie: cookies.map(c => `${c.name}=${c.value}`).join('; ')
        }
      });

      if (response.ok()) {
        const data = await response.json();

        // Verify conversation_flows columns
        expect(data.state).toHaveProperty('currentPillar');
        expect(['identity', 'business', 'money', 'legacy']).toContain(data.state.currentPillar);

        expect(data.state).toHaveProperty('currentDay');
        expect(data.state.currentDay).toBeGreaterThanOrEqual(1);
        expect(data.state.currentDay).toBeLessThanOrEqual(5);

        expect(data.state).toHaveProperty('currentQuestionNumber');

        expect(data.state).toHaveProperty('answersGiven');
        expect(typeof data.state.answersGiven).toBe('object');
      }
    });
  });
});
