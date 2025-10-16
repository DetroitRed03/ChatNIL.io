/**
 * Centralized auth storage management utility with state versioning
 * Handles cleanup of all authentication-related storage to prevent conflicts
 * Includes versioning system to handle cache invalidation
 */

export interface StorageCleanupOptions {
  clearSupabaseAuth?: boolean;
  clearAppState?: boolean;
  clearOnboarding?: boolean;
  clearRedirectFlags?: boolean;
  preserveCurrentSession?: boolean;
  debug?: boolean;
}

export interface VersionedState<T = any> {
  v: number;
  data: T;
  timestamp: number;
}

export interface StorageOptions {
  version?: number;
  maxAge?: number;
}

// State version for cache invalidation
const CURRENT_STATE_VERSION = 1;

// Debug mode configuration
let debugMode = false;

export function setDebugMode(enabled: boolean) {
  debugMode = enabled;
  if (enabled) {
    console.log('🐛 === AUTH STORAGE DEBUG MODE ENABLED ===');
  }
}

export function isDebugMode(): boolean {
  return debugMode;
}

function debugLog(...args: any[]) {
  if (debugMode) {
    console.log('🐛 AUTH-STORAGE:', ...args);
  }
}

// All known storage keys used by the application
const AUTH_STORAGE_KEYS = {
  // Supabase auth keys (these are automatically managed by Supabase)
  supabase: [
    'sb-auth-token',
    'supabase.auth.token',
    'sb-',
  ],

  // Custom app redirect tracking
  redirects: [
    'chatnil_redirect_executed',
    'chatnil_redirect_timestamp',
    'chatnil_signup_success',
    'chatnil_signup_timestamp',
    'chatnil_user_id',
  ],

  // Onboarding state management (using chatnil-prefixed keys only)
  onboarding: [
    'chatnil-onboarding-state',
    'chatnil-onboarding-data',
    'chatnil-onboarding-backup',
  ],

  // Legacy onboarding keys to clean up
  legacyOnboarding: [
    'chatnil_onboarding_state',
    'chatnil_onboarding_form_data',
    'onboarding_state',
    'onboarding_form_data',
    'chatnil_onboarding_backup',
  ],

  // Legacy keys that might exist
  legacy: [
    'auth_token',
    'user_session',
    'signup_data',
    'redirect_data',
  ]
};

/**
 * Clear all authentication-related storage with robust error handling
 */
export function clearAllAuthStorage(options: StorageCleanupOptions = {}) {
  const {
    clearSupabaseAuth = true,
    clearAppState = true,
    clearOnboarding = true,
    clearRedirectFlags = true,
    preserveCurrentSession = false
  } = options;

  console.log('🧹 === COMPREHENSIVE AUTH STORAGE CLEANUP ===');
  console.log('📋 Options:', options);

  let clearedCount = 0;
  let errorCount = 0;

  try {
    // Clear localStorage with error handling
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const localStorage = window.localStorage;
        const keys = Object.keys(localStorage);

        console.log('🔍 Scanning localStorage keys:', keys.length);

        keys.forEach(key => {
          try {
            let shouldClear = false;

            // Check Supabase auth keys
            if (clearSupabaseAuth && !preserveCurrentSession) {
              if (AUTH_STORAGE_KEYS.supabase.some(pattern => key.includes(pattern))) {
                shouldClear = true;
              }
            }

            // Check redirect flags
            if (clearRedirectFlags && AUTH_STORAGE_KEYS.redirects.includes(key)) {
              shouldClear = true;
            }

            // Check onboarding state (current and legacy)
            if (clearOnboarding) {
              if (AUTH_STORAGE_KEYS.onboarding.includes(key) ||
                  AUTH_STORAGE_KEYS.legacyOnboarding.includes(key)) {
                shouldClear = true;
              }
            }

            // Check legacy keys
            if (clearAppState && AUTH_STORAGE_KEYS.legacy.includes(key)) {
              shouldClear = true;
            }

            if (shouldClear) {
              console.log(`🗑️ Clearing localStorage key: ${key}`);
              localStorage.removeItem(key);
              clearedCount++;
            }
          } catch (keyError) {
            console.warn(`⚠️ Error clearing localStorage key ${key}:`, keyError);
            errorCount++;
          }
        });
      } catch (localStorageError) {
        console.warn('⚠️ Error accessing localStorage:', localStorageError);
        errorCount++;
      }
    }

    // Clear sessionStorage with error handling
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const sessionStorage = window.sessionStorage;
        const keys = Object.keys(sessionStorage);

        console.log('🔍 Scanning sessionStorage keys:', keys.length);

        keys.forEach(key => {
          try {
            let shouldClear = false;

            // Check redirect flags in sessionStorage
            if (clearRedirectFlags && AUTH_STORAGE_KEYS.redirects.includes(key)) {
              shouldClear = true;
            }

            if (shouldClear) {
              console.log(`🗑️ Clearing sessionStorage key: ${key}`);
              sessionStorage.removeItem(key);
              clearedCount++;
            }
          } catch (keyError) {
            console.warn(`⚠️ Error clearing sessionStorage key ${key}:`, keyError);
            errorCount++;
          }
        });
      } catch (sessionStorageError) {
        console.warn('⚠️ Error accessing sessionStorage:', sessionStorageError);
        errorCount++;
      }
    }

    console.log(`✅ Cleared ${clearedCount} storage items`);
    if (errorCount > 0) {
      console.warn(`⚠️ Encountered ${errorCount} errors during cleanup (non-fatal)`);
    }
    console.log('🧹 === STORAGE CLEANUP COMPLETE ===');

    return clearedCount;
  } catch (error) {
    console.error('❌ Critical error in storage cleanup:', error);
    console.log('🛡️ Continuing despite storage cleanup error...');
    return 0;
  }
}

/**
 * Clear only redirect-related storage (for fixing failed redirects)
 */
export function clearRedirectStorage() {
  console.log('🔄 Clearing redirect storage only...');

  return clearAllAuthStorage({
    clearSupabaseAuth: false,
    clearAppState: false,
    clearOnboarding: false,
    clearRedirectFlags: true,
    preserveCurrentSession: true
  });
}

/**
 * Clear onboarding state for fresh start
 */
export function clearOnboardingStorage() {
  console.log('📝 Clearing onboarding storage only...');

  return clearAllAuthStorage({
    clearSupabaseAuth: false,
    clearAppState: false,
    clearOnboarding: true,
    clearRedirectFlags: false,
    preserveCurrentSession: true
  });
}

/**
 * Generate unique signup session ID to prevent conflicts
 */
export function generateSignupSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `signup_${timestamp}_${random}`;
}

/**
 * Store signup session data with expiration
 */
export function setSignupSession(sessionId: string, data: any) {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionData = {
        id: sessionId,
        data,
        timestamp: Date.now(),
        expires: Date.now() + (10 * 60 * 1000) // 10 minutes
      };

      window.sessionStorage.setItem(`chatnil_signup_session_${sessionId}`, JSON.stringify(sessionData));
      console.log('💾 Stored signup session:', sessionId);
    }
  } catch (error) {
    console.warn('⚠️ Error storing signup session:', error);
    console.log('🛡️ Continuing without session storage...');
  }
}

/**
 * Get and validate signup session data
 */
export function getSignupSession(sessionId: string): any | null {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const stored = window.sessionStorage.getItem(`chatnil_signup_session_${sessionId}`);

    if (stored) {
      try {
        const sessionData = JSON.parse(stored);

        // Check if expired
        if (Date.now() > sessionData.expires) {
          console.log('⏰ Signup session expired, cleaning up');
          window.sessionStorage.removeItem(`chatnil_signup_session_${sessionId}`);
          return null;
        }

        return sessionData.data;
      } catch (error) {
        console.error('❌ Error parsing signup session data:', error);
        window.sessionStorage.removeItem(`chatnil_signup_session_${sessionId}`);
      }
    }
  }

  return null;
}

/**
 * Clear expired signup sessions with error handling
 */
export function cleanupExpiredSessions() {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const keys = Object.keys(window.sessionStorage);
      let cleaned = 0;

      keys.forEach(key => {
        if (key.startsWith('chatnil_signup_session_')) {
          try {
            const stored = window.sessionStorage.getItem(key);
            if (stored) {
              const sessionData = JSON.parse(stored);
              if (Date.now() > sessionData.expires) {
                window.sessionStorage.removeItem(key);
                cleaned++;
              }
            }
          } catch (error) {
            // Clean up invalid sessions
            try {
              window.sessionStorage.removeItem(key);
              cleaned++;
            } catch (removeError) {
              console.warn(`⚠️ Error removing invalid session ${key}:`, removeError);
            }
          }
        }
      });

      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} expired signup sessions`);
      }
    }
  } catch (error) {
    console.warn('⚠️ Error during session cleanup:', error);
    console.log('🛡️ Continuing despite session cleanup error...');
  }
}

/**
 * Check if we're in a fresh browser session (no conflicting storage)
 */
export function isFreshSession(): boolean {
  if (typeof window === 'undefined') return true;

  // Check for any conflicting storage
  const hasRedirectFlags = AUTH_STORAGE_KEYS.redirects.some(key =>
    window.localStorage?.getItem(key) || window.sessionStorage?.getItem(key)
  );

  const hasOnboardingState = AUTH_STORAGE_KEYS.onboarding.some(key =>
    window.localStorage?.getItem(key)
  ) || AUTH_STORAGE_KEYS.legacyOnboarding.some(key =>
    window.localStorage?.getItem(key)
  );

  console.log('🔍 Session freshness check:', {
    hasRedirectFlags,
    hasOnboardingState,
    isFresh: !hasRedirectFlags && !hasOnboardingState
  });

  return !hasRedirectFlags && !hasOnboardingState;
}

/**
 * Inspect current storage state for debugging
 */
export function inspectStorageState() {
  const report = {
    localStorage: {} as Record<string, string>,
    sessionStorage: {} as Record<string, string>,
    authKeys: 0,
    redirectKeys: 0,
    onboardingKeys: 0,
    signupSessions: 0
  };

  try {
    if (typeof window !== 'undefined') {
      // Inspect localStorage
      if (window.localStorage) {
        const localKeys = Object.keys(window.localStorage);
        localKeys.forEach(key => {
          const value = window.localStorage.getItem(key);
          report.localStorage[key] = value ? `${value.substring(0, 50)}...` : 'null';

          if (AUTH_STORAGE_KEYS.supabase.some(pattern => key.includes(pattern))) {
            report.authKeys++;
          }
          if (AUTH_STORAGE_KEYS.redirects.includes(key)) {
            report.redirectKeys++;
          }
          if (AUTH_STORAGE_KEYS.onboarding.includes(key) ||
              AUTH_STORAGE_KEYS.legacyOnboarding.includes(key)) {
            report.onboardingKeys++;
          }
        });
      }

      // Inspect sessionStorage
      if (window.sessionStorage) {
        const sessionKeys = Object.keys(window.sessionStorage);
        sessionKeys.forEach(key => {
          const value = window.sessionStorage.getItem(key);
          report.sessionStorage[key] = value ? `${value.substring(0, 50)}...` : 'null';

          if (key.startsWith('chatnil_signup_session_')) {
            report.signupSessions++;
          }
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Error inspecting storage:', error);
  }

  return report;
}

/**
 * Prepare for fresh signup by clearing potentially conflicting storage
 */
export function prepareForSignup(options: { debug?: boolean } = {}): string {
  const { debug = debugMode } = options;

  if (debug) {
    console.log('🚀 === PREPARING FOR FRESH SIGNUP ===');
    console.log('📊 Storage state before cleanup:', inspectStorageState());
  }

  // Clean up expired sessions first
  cleanupExpiredSessions();

  // Clear all auth storage for fresh start
  clearAllAuthStorage({
    clearSupabaseAuth: false, // Don't clear current session if user wants to switch accounts
    clearAppState: true,
    clearOnboarding: true,
    clearRedirectFlags: true,
    preserveCurrentSession: false,
    debug
  });

  // Generate unique session ID for this signup attempt
  const signupSessionId = generateSignupSessionId();

  if (debug) {
    console.log('📊 Storage state after cleanup:', inspectStorageState());
    console.log('✅ Ready for fresh signup with session ID:', signupSessionId);
    console.log('🚀 === SIGNUP PREPARATION COMPLETE ===');
  }

  return signupSessionId;
}

/**
 * State versioning system for localStorage
 * Wraps persisted state in { v: NUMBER, data: T, timestamp: number }
 * If version mismatch, ignores stored state and allows rehydration
 */

/**
 * Set versioned data in localStorage
 */
export function setVersionedLocalStorage<T>(
  key: string,
  data: T,
  options: StorageOptions = {}
): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      debugLog('localStorage not available, skipping setVersionedLocalStorage');
      return false;
    }

    const version = options.version ?? CURRENT_STATE_VERSION;
    const versionedData: VersionedState<T> = {
      v: version,
      data,
      timestamp: Date.now()
    };

    window.localStorage.setItem(key, JSON.stringify(versionedData));
    debugLog(`Stored versioned data for key '${key}' with version ${version}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Error storing versioned data for key '${key}':`, error);
    return false;
  }
}

/**
 * Get versioned data from localStorage with version checking
 */
export function getVersionedLocalStorage<T>(
  key: string,
  options: StorageOptions = {}
): T | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      debugLog('localStorage not available, returning null');
      return null;
    }

    const stored = window.localStorage.getItem(key);
    if (!stored) {
      debugLog(`No data found for key '${key}'`);
      return null;
    }

    const versionedData: VersionedState<T> = JSON.parse(stored);
    const expectedVersion = options.version ?? CURRENT_STATE_VERSION;
    const maxAge = options.maxAge;

    // Check version compatibility
    if (versionedData.v !== expectedVersion) {
      debugLog(`Version mismatch for key '${key}': stored=${versionedData.v}, expected=${expectedVersion}. Ignoring stored state.`);

      // Clean up incompatible data
      window.localStorage.removeItem(key);
      return null;
    }

    // Check if data has expired
    if (maxAge && (Date.now() - versionedData.timestamp) > maxAge) {
      debugLog(`Data expired for key '${key}', removing`);
      window.localStorage.removeItem(key);
      return null;
    }

    debugLog(`Retrieved valid versioned data for key '${key}' with version ${versionedData.v}`);
    return versionedData.data;
  } catch (error) {
    console.warn(`⚠️ Error retrieving versioned data for key '${key}':`, error);

    // Clean up corrupted data
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (removeError) {
      console.warn(`⚠️ Error removing corrupted data for key '${key}':`, removeError);
    }

    return null;
  }
}

/**
 * Remove versioned data from localStorage
 */
export function removeVersionedLocalStorage(key: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    window.localStorage.removeItem(key);
    debugLog(`Removed versioned data for key '${key}'`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Error removing versioned data for key '${key}':`, error);
    return false;
  }
}

/**
 * Check if versioned data exists and is valid
 */
export function hasValidVersionedData(
  key: string,
  options: StorageOptions = {}
): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    const stored = window.localStorage.getItem(key);
    if (!stored) {
      return false;
    }

    const versionedData: VersionedState = JSON.parse(stored);
    const expectedVersion = options.version ?? CURRENT_STATE_VERSION;
    const maxAge = options.maxAge;

    // Check version compatibility
    if (versionedData.v !== expectedVersion) {
      return false;
    }

    // Check if data has expired
    if (maxAge && (Date.now() - versionedData.timestamp) > maxAge) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Clear all versioned data that doesn't match current version
 */
export function clearOutdatedVersionedData(
  keys: string[] = [],
  options: StorageOptions = {}
): number {
  let clearedCount = 0;

  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 0;
    }

    const expectedVersion = options.version ?? CURRENT_STATE_VERSION;
    const keysToCheck = keys.length > 0 ? keys : Object.keys(window.localStorage);

    keysToCheck.forEach(key => {
      try {
        const stored = window.localStorage.getItem(key);
        if (!stored) return;

        // Try to parse as versioned data
        const versionedData = JSON.parse(stored);

        // Check if it has version property and is outdated
        if (typeof versionedData === 'object' &&
            versionedData !== null &&
            'v' in versionedData &&
            versionedData.v !== expectedVersion) {

          debugLog(`Clearing outdated versioned data for key '${key}': v${versionedData.v} -> v${expectedVersion}`);
          window.localStorage.removeItem(key);
          clearedCount++;
        }
      } catch (error) {
        // Not versioned data or corrupted, skip
      }
    });

    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} outdated versioned storage items`);
    }
  } catch (error) {
    console.warn('⚠️ Error during versioned data cleanup:', error);
  }

  return clearedCount;
}

/**
 * Utility functions for commonly stored data with versioning
 */

/**
 * Store onboarding state with versioning
 */
export function setOnboardingState<T>(data: T): boolean {
  return setVersionedLocalStorage('chatnil-onboarding-state', data, {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
}

/**
 * Get onboarding state with version checking
 */
export function getOnboardingState<T>(): T | null {
  return getVersionedLocalStorage<T>('chatnil-onboarding-state', {
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
}

/**
 * Store form data with versioning
 */
export function setFormData<T>(formType: string, data: T): boolean {
  return setVersionedLocalStorage(`chatnil-${formType}-data`, data, {
    maxAge: 30 * 60 * 1000 // 30 minutes
  });
}

/**
 * Get form data with version checking
 */
export function getFormData<T>(formType: string): T | null {
  return getVersionedLocalStorage<T>(`chatnil-${formType}-data`, {
    maxAge: 30 * 60 * 1000 // 30 minutes
  });
}

/**
 * Get current state version
 */
export function getCurrentStateVersion(): number {
  return CURRENT_STATE_VERSION;
}