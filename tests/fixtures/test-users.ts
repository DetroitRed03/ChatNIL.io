import type { Page } from '@playwright/test';

/**
 * Test user fixtures for E2E testing
 * ChatNIL High School Student Experience
 */

/**
 * Login helper - handles the modal-based auth flow
 * ChatNIL uses an AuthModal on the home page, not a dedicated /login route
 */
export async function loginWithModal(page: Page, email: string, password: string) {
  // Navigate to home page
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Wait for the Log in button to be visible
  const loginButton = page.locator('button:has-text("Log in")');
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // Wait for the auth modal to appear
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });

  // Fill in email
  await emailInput.fill(email);

  // Fill in password
  await page.fill('input[type="password"]', password);

  // Click sign in button and wait for navigation
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();

  // Wait for redirect to dashboard or discovery with longer timeout
  await page.waitForURL(/\/(dashboard|discovery|onboarding)/, { timeout: 30000 });

  // Ensure we're fully loaded before continuing
  await page.waitForLoadState('networkidle');
}

export const testUsers = {
  // Basic HS student - new user
  hsStudent: {
    email: 'hs.student.test@chatnil.test',
    password: 'TestPassword123!',
    role: 'hs_student',
    name: 'Test HS Student',
    firstName: 'Test',
    lastName: 'Student',
    state: 'KY',
    sport: 'Basketball',
    dateOfBirth: '2008-05-15', // 16-17 years old
    parentEmail: 'parent.test@chatnil.test',
    school: 'Test High School',
  },

  // HS student with progress through Discovery
  hsStudentWithProgress: {
    email: 'hs.progress.test@chatnil.test',
    password: 'TestPassword123!',
    role: 'hs_student',
    name: 'Progress Student',
    firstName: 'Progress',
    lastName: 'Student',
    state: 'CA',
    sport: 'Football',
    dateOfBirth: '2007-03-20',
    parentEmail: 'progress.parent@chatnil.test',
    school: 'Progress High School',
    currentPillar: 'business',
    currentDay: 2,
    pillarsCompleted: { identity: true },
    chaptersUnlocked: ['identity'],
    badges: ['identity-complete', 'streak-3'],
    streak: 5,
    consentStatus: 'approved',
  },

  // HS student with pending parent consent
  hsStudentPendingConsent: {
    email: 'hs.pending.test@chatnil.test',
    password: 'TestPassword123!',
    role: 'hs_student',
    name: 'Pending Student',
    firstName: 'Pending',
    lastName: 'Student',
    state: 'TX',
    sport: 'Soccer',
    dateOfBirth: '2009-08-10',
    parentEmail: 'pending.parent@chatnil.test',
    school: 'Pending High School',
    consentStatus: 'pending',
  },

  // HS student with approved consent
  hsStudentApprovedConsent: {
    email: 'hs.approved.test@chatnil.test',
    password: 'TestPassword123!',
    role: 'hs_student',
    name: 'Approved Student',
    firstName: 'Approved',
    lastName: 'Student',
    state: 'FL',
    sport: 'Baseball',
    dateOfBirth: '2008-11-25',
    parentEmail: 'approved.parent@chatnil.test',
    school: 'Approved High School',
    consentStatus: 'approved',
  },

  // HS student who completed all pillars
  hsStudentComplete: {
    email: 'hs.complete.test@chatnil.test',
    password: 'TestPassword123!',
    role: 'hs_student',
    name: 'Complete Student',
    firstName: 'Complete',
    lastName: 'Student',
    state: 'OH',
    sport: 'Swimming',
    dateOfBirth: '2007-06-15',
    parentEmail: 'complete.parent@chatnil.test',
    school: 'Complete High School',
    currentPillar: 'legacy',
    currentDay: 5,
    pillarsCompleted: { identity: true, business: true, money: true, legacy: true },
    chaptersUnlocked: ['identity', 'business', 'money', 'legacy'],
    badges: ['identity-complete', 'business-complete', 'money-complete', 'legacy-complete', 'all-chapters', 'streak-7'],
    streak: 14,
    consentStatus: 'approved',
  },

  // College athlete (for access control testing)
  collegeAthlete: {
    email: 'college.athlete.test@chatnil.test',
    password: 'TestPassword123!',
    role: 'college_athlete',
    name: 'College Athlete',
    firstName: 'College',
    lastName: 'Athlete',
    state: 'NC',
    sport: 'Basketball',
    dateOfBirth: '2003-02-14', // 21+ years old
    institution: 'Test University',
  },

  // Parent user
  parent: {
    email: 'parent.user.test@chatnil.test',
    password: 'TestPassword123!',
    role: 'parent',
    name: 'Parent User',
    firstName: 'Parent',
    lastName: 'User',
    childEmail: 'child.athlete@chatnil.test',
  },

  // Compliance officer
  complianceOfficer: {
    email: 'compliance.officer.test@chatnil.test',
    password: 'TestPassword123!',
    role: 'compliance_officer',
    name: 'Compliance Officer',
    firstName: 'Compliance',
    lastName: 'Officer',
    institution: 'Test University',
    institutionId: 'test-institution-id',
  },
};

// Existing test user from create-test-hs-student.ts script
export const existingTestUser = {
  email: 'test.athlete@chatnil.dev',
  password: 'TestAthlete123!',
  id: '869d6ee8-ec4c-4764-8eef-d5f58819d992',
  role: 'hs_student',
  name: 'Marcus Johnson',
  sport: 'Basketball',
  position: 'Point Guard',
  school: 'Lincoln High School',
  state: 'CA',
  currentPillar: 'business',
  currentDay: 2,
  chaptersUnlocked: ['identity'],
};

// State rules test data
export const stateRules = {
  CA: {
    name: 'California',
    hsNilAllowed: true,
    requiresParentConsent: true,
    summary: 'HS athletes can earn from NIL with parental consent',
  },
  TX: {
    name: 'Texas',
    hsNilAllowed: true,
    requiresParentConsent: true,
    summary: 'HS athletes can earn from NIL',
  },
  FL: {
    name: 'Florida',
    hsNilAllowed: true,
    requiresParentConsent: true,
    summary: 'HS athletes have full NIL rights',
  },
  KY: {
    name: 'Kentucky',
    hsNilAllowed: false,
    requiresParentConsent: true,
    summary: 'HS NIL is restricted in Kentucky',
  },
};

// Pillar data for testing
export const pillars = {
  identity: {
    name: 'Identity',
    days: 5,
    questionsPerDay: 3,
    totalQuestions: 15,
  },
  business: {
    name: 'Business',
    days: 5,
    questionsPerDay: 3,
    totalQuestions: 15,
  },
  money: {
    name: 'Money',
    days: 5,
    questionsPerDay: 3,
    totalQuestions: 15,
  },
  legacy: {
    name: 'Legacy',
    days: 5,
    questionsPerDay: 3,
    totalQuestions: 15,
  },
};

// Badge definitions for testing
export const badges = {
  discovery: [
    { id: 'identity-complete', name: 'Identity Explorer', icon: '🎯' },
    { id: 'business-complete', name: 'Business Basics', icon: '📋' },
    { id: 'money-complete', name: 'Money Minded', icon: '💰' },
    { id: 'legacy-complete', name: 'Legacy Builder', icon: '🌟' },
    { id: 'all-chapters', name: 'NIL Scholar', icon: '🎓' },
  ],
  streak: [
    { id: 'streak-3', name: 'Getting Started', icon: '🔥' },
    { id: 'streak-7', name: 'Week Warrior', icon: '⚡' },
    { id: 'streak-30', name: 'Monthly Champion', icon: '👑' },
  ],
  quiz: [
    { id: 'first-quiz', name: 'Quiz Taker', icon: '📝' },
    { id: 'perfect-quiz', name: 'Perfect Score', icon: '💯' },
    { id: 'quiz-master', name: 'Quiz Master', icon: '🏆' },
  ],
};
