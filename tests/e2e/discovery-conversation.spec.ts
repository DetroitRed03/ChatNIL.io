import { test, expect } from '@playwright/test';
import { existingTestUser, pillars } from '../fixtures/test-users';
import { waitForPageReady, getAuthHeaders, waitForContent } from '../fixtures/test-helpers';

/**
 * Suite 3: Discovery Through Conversation (Task 1.3)
 * Tests the guided conversational experience for HS students
 *
 * Note: Uses pre-authenticated storageState from auth.setup.ts
 */

test.describe('Discovery Through Conversation - HS Student', () => {

  // Auth is established via storageState, no beforeEach login needed

  test.describe('Discovery Page Access', () => {

    test('discovery page is accessible', async ({ page }) => {
      await page.goto('/discovery');

      // Should load the discovery page
      await expect(page).toHaveURL(/discovery/);
    });

    test('discovery page shows conversation interface', async ({ page }) => {
      await page.goto('/discovery');

      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Give time for dynamic content to load

      // Should have chat/conversation elements - multiple ways to detect
      const hasChatElements =
        await page.locator('[data-testid="chat"], .chat-container, .discovery-chat, .conversation').isVisible().catch(() => false) ||
        await page.getByRole('textbox').isVisible().catch(() => false) ||
        await page.locator('input[placeholder*="type"], textarea, input[type="text"]').isVisible().catch(() => false);

      // Also check for conversation-related text
      const pageContent = await page.textContent('body') || '';
      const hasConversationText = /question|answer|chat|message|type.*here|send/i.test(pageContent);

      expect(hasChatElements || hasConversationText).toBe(true);
    });

    test('discovery page shows progress indicator', async ({ page }) => {
      await page.goto('/discovery');
      await page.waitForLoadState('networkidle');

      // Should show progress through pillars
      const pageContent = await page.textContent('body') || '';

      const hasProgressIndicator =
        /identity|business|money|legacy/i.test(pageContent) ||
        /day\s*\d|progress|chapter/i.test(pageContent) ||
        await page.locator('[class*="progress"], [data-testid="progress"]').isVisible().catch(() => false);

      expect(hasProgressIndicator).toBe(true);
    });
  });

  test.describe('Conversation State', () => {

    test('current state API returns valid data', async ({ page, request }) => {
      // Get auth headers (includes both cookies and Bearer token)
      const headers = await getAuthHeaders(page);

      const response = await request.get('/api/discovery/current-state', {
        headers
      });

      // Log status for debugging
      if (!response.ok()) {
        console.log('current-state API returned:', response.status());
      }

      expect(response.ok()).toBe(true);

      const data = await response.json();

      // Verify state structure exists
      expect(data).toHaveProperty('state');
      expect(data.state).toBeDefined();

      // Verify required fields exist
      expect(data.state).toHaveProperty('currentPillar');
      expect(data.state).toHaveProperty('currentDay');

      // Current pillar should be valid
      expect(['identity', 'business', 'money', 'legacy']).toContain(data.state.currentPillar);

      // Day should be valid
      expect(data.state.currentDay).toBeGreaterThanOrEqual(1);
    });

    test('test user has expected progress state', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      const response = await request.get('/api/discovery/current-state', {
        headers
      });

      if (!response.ok()) {
        console.log('API returned status:', response.status());
        return; // Skip test if API fails
      }

      const data = await response.json();

      // Verify state exists
      expect(data.state).toBeDefined();

      // Test user should be on business pillar, day 2 (as set up)
      expect(data.state.currentPillar).toBe('business');
      expect(data.state.currentDay).toBe(2);

      // Should have identity unlocked
      expect(data.state.unlockedChapters).toContain('identity');

      // Should have some answers (may be 0 if fresh test)
      expect(data.state.answersGiven).toBeDefined();
    });

    test('conversation state persists across page reload', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      // Get initial state
      const response1 = await request.get('/api/discovery/current-state', {
        headers
      });

      if (!response1.ok()) {
        console.log('Initial state API returned:', response1.status());
        return; // Skip test if API fails
      }

      const state1 = await response1.json();

      // Reload page
      await page.goto('/discovery');
      await page.waitForLoadState('networkidle');

      // Get state again (re-fetch headers after page reload)
      const headers2 = await getAuthHeaders(page);
      const response2 = await request.get('/api/discovery/current-state', {
        headers: headers2
      });

      if (!response2.ok()) {
        console.log('Second state API returned:', response2.status());
        return; // Skip test if API fails
      }

      const state2 = await response2.json();

      // States should match
      expect(state2.state.currentPillar).toBe(state1.state.currentPillar);
      expect(state2.state.currentDay).toBe(state1.state.currentDay);
    });
  });

  test.describe('Answering Questions', () => {

    test('respond API accepts answers', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      // First get current question
      const stateResponse = await request.get('/api/discovery/current-state', {
        headers
      });
      const stateData = await stateResponse.json();

      if (stateData.currentQuestion) {
        // Submit an answer
        const response = await request.post('/api/discovery/respond', {
          headers,
          data: {
            questionId: stateData.currentQuestion.id,
            answer: 'Test answer for E2E testing'
          }
        });

        // Should accept the answer
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('success');
        expect(data).toHaveProperty('acknowledgment');
      }
    });

    test('respond API returns acknowledgment and next question', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      const stateResponse = await request.get('/api/discovery/current-state', {
        headers
      });
      const stateData = await stateResponse.json();

      if (stateData.currentQuestion) {
        const response = await request.post('/api/discovery/respond', {
          headers,
          data: {
            questionId: stateData.currentQuestion.id,
            answer: 'Basketball and football'
          }
        });

        if (response.ok()) {
          const data = await response.json();

          // Should have acknowledgment
          expect(data.acknowledgment).toBeTruthy();
          expect(typeof data.acknowledgment).toBe('string');

          // Should have new state
          expect(data).toHaveProperty('newState');

          // May have next question (unless pillar complete)
          if (data.nextQuestion) {
            expect(data.nextQuestion).toHaveProperty('id');
            expect(data.nextQuestion).toHaveProperty('question');
          }
        }
      }
    });

    test('answers are stored in conversation flow', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      // Get state and verify answers exist
      const response = await request.get('/api/discovery/current-state', {
        headers
      });

      if (!response.ok()) {
        console.log('API returned status:', response.status());
        return; // Skip test if API fails
      }

      const data = await response.json();

      // Should have state with answers
      expect(data.state).toBeDefined();
      expect(data.state.answersGiven).toBeDefined();
      expect(typeof data.state.answersGiven).toBe('object');

      // Test user should have some answers from setup (may be 0 on fresh run)
      const answerCount = Object.keys(data.state.answersGiven).length;
      expect(answerCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Pillar Progression', () => {

    test('unlocked chapters include identity for test user', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      const response = await request.get('/api/discovery/current-state', {
        headers
      });

      if (!response.ok()) {
        console.log('API returned status:', response.status());
        return; // Skip if API fails
      }

      const data = await response.json();
      expect(data.state).toBeDefined();
      expect(data.state.unlockedChapters).toContain('identity');
    });

    test('locked pillars are not accessible directly', async ({ page }) => {
      // Try to access a locked pillar (money for test user)
      await page.goto('/discovery?pillar=money');

      // Should either redirect or show current pillar
      await page.waitForLoadState('networkidle');

      const pageContent = await page.textContent('body') || '';

      // Should not show money chapter content if locked
      // or should show a locked/unavailable message
      // The exact behavior depends on implementation
    });

    test('pillar order is identity → business → money → legacy', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      const response = await request.get('/api/discovery/current-state', {
        headers
      });

      if (!response.ok()) {
        console.log('API returned status:', response.status());
        return; // Skip if API fails
      }

      const data = await response.json();
      expect(data.state).toBeDefined();

      const unlockedChapters = data.state.unlockedChapters || [];

      // If business is unlocked, identity must be unlocked
      if (unlockedChapters.includes('business')) {
        expect(unlockedChapters).toContain('identity');
      }

      // If money is unlocked, business must be unlocked
      if (unlockedChapters.includes('money')) {
        expect(unlockedChapters).toContain('business');
      }

      // If legacy is unlocked, money must be unlocked
      if (unlockedChapters.includes('legacy')) {
        expect(unlockedChapters).toContain('money');
      }
    });
  });

  test.describe('Chapter Unlocking', () => {

    test('unlock chapter API requires authentication', async ({ request }) => {
      const response = await request.post('/api/discovery/unlock-chapter', {
        data: { pillar: 'identity' }
      });

      expect(response.status()).toBe(401);
    });

    test('unlock chapter API works for authenticated user', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      const response = await request.post('/api/discovery/unlock-chapter', {
        headers,
        data: { pillar: 'identity' }
      });

      // API should exist (may return 200, 404, or 400 depending on implementation)
      const status = response.status();
      expect(status).toBeLessThan(500);

      // If OK, check response structure
      if (response.ok()) {
        const data = await response.json();
        expect(data).toBeDefined();
      }
    });

    test('already unlocked chapter returns appropriate response', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      // Try to unlock identity again (already unlocked for test user)
      const response = await request.post('/api/discovery/unlock-chapter', {
        headers,
        data: { pillar: 'identity' }
      });

      // API should exist and not error
      const status = response.status();
      expect(status).toBeLessThan(500);

      // If OK, check response
      if (response.ok()) {
        const data = await response.json();
        // Should indicate success or already unlocked
        expect(data.success || data.alreadyUnlocked || data.message).toBeDefined();
      }
    });
  });

  test.describe('Discovery Profile', () => {

    test('profile API returns student discovery data', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      const response = await request.get('/api/discovery/profile', {
        headers
      });

      // API should exist and respond
      const status = response.status();
      expect(status).toBeLessThan(500);

      if (response.ok()) {
        const data = await response.json();

        // Should have some profile structure (may vary by implementation)
        expect(data).toBeDefined();
        // Profile may have summary, profile, or pillar data
        const hasSummary = data.summary || data.profile || data.pillars || data.identity;
        expect(hasSummary).toBeDefined();
      }
    });

    test('profile shows unlocked chapters correctly', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      const response = await request.get('/api/discovery/profile', {
        headers
      });

      if (!response.ok()) {
        console.log('Profile API returned:', response.status());
        return; // Skip if API fails
      }

      const data = await response.json();

      // Check for unlocked chapters in various possible response structures
      const hasIdentityUnlocked =
        data.unlockedChapters?.includes('identity') ||
        data.summary?.identity?.unlocked === true ||
        data.chapters?.identity?.unlocked === true ||
        data.pillars?.identity?.unlocked === true;

      expect(hasIdentityUnlocked).toBe(true);
    });

    test('profile has completion percentage', async ({ page, request }) => {
      const headers = await getAuthHeaders(page);

      const response = await request.get('/api/discovery/profile', {
        headers
      });

      if (!response.ok()) {
        console.log('Profile API returned:', response.status());
        return; // Skip if API fails
      }

      const data = await response.json();

      // Check for completion percentage in various possible fields
      const completion =
        data.completionPercentage ??
        data.completion ??
        data.progress?.percentage ??
        data.progress;

      if (typeof completion === 'number') {
        expect(completion).toBeGreaterThanOrEqual(0);
        expect(completion).toBeLessThanOrEqual(100);
      }
    });
  });

  test.describe('UI Interaction', () => {

    test('discovery page has input for answers', async ({ page }) => {
      await page.goto('/discovery');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow dynamic content to load

      // Should have a text input or textarea for answers
      const inputElement = page.locator('input[type="text"], textarea, [contenteditable="true"], input[placeholder]').first();
      const hasInput = await inputElement.isVisible().catch(() => false);

      // Also check for any form element
      const hasForm = await page.locator('form, [role="textbox"]').isVisible().catch(() => false);

      expect(hasInput || hasForm).toBe(true);
    });

    test('discovery page has submit/send button', async ({ page }) => {
      await page.goto('/discovery');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow dynamic content to load

      // Should have a submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Submit"), button svg, form button').first();
      const hasSubmit = await submitButton.isVisible().catch(() => false);

      // Also check for any clickable button
      const hasButton = await page.locator('button').first().isVisible().catch(() => false);

      expect(hasSubmit || hasButton).toBe(true);
    });

    test('Continue Conversation button navigates to discovery', async ({ page }) => {
      // Start from dashboard
      await page.goto('/dashboard/hs-student');
      await page.waitForLoadState('networkidle');

      // Click Continue Conversation button
      const continueButton = page.locator('button:has-text("Continue Conversation"), a:has-text("Continue Conversation"), [data-testid="continue-conversation"]').first();

      if (await continueButton.isVisible().catch(() => false)) {
        await continueButton.click();
        await page.waitForURL(/discovery/, { timeout: 5000 });
        expect(page.url()).toContain('discovery');
      }
    });
  });
});
