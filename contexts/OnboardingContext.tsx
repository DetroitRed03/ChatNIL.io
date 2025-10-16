'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserRole } from '@/lib/types';
import { OnboardingState, OnboardingData, calculateProfileCompletionPercentage } from '@/lib/onboarding-types';
import {
  getStepsForRole,
  getNextStepIndex,
  getPreviousStepIndex,
  validateStepData,
  ONBOARDING_STORAGE_KEYS
} from '@/lib/onboarding-registry';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { logger } from '@/lib/logger';
import { debugUtils } from '@/lib/debug-utils';
import {
  setOnboardingState,
  getOnboardingState,
  setFormData,
  getFormData,
  removeVersionedLocalStorage,
  clearOutdatedVersionedData
} from '@/lib/auth-storage';
import { trackEvent } from '@/lib/analytics';

// Action types
type OnboardingAction =
  | { type: 'SET_ROLE'; payload: UserRole }
  | { type: 'NEXT_STEP'; payload?: any }
  | { type: 'SKIP_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GOTO_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: Partial<OnboardingData> }
  | { type: 'UPDATE_COMPLETION_PERCENTAGE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'START_ONBOARDING' }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'RESTORE_STATE'; payload: Partial<OnboardingState> };

// Initial state
const initialState: OnboardingState = {
  role: null,
  currentStepIndex: 0,
  formData: {},
  completedSteps: [],
  isLoading: false,
  hasStarted: false,
  profileCompletionPercentage: 0,
};

// Reducer
function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_ROLE':
      return {
        ...state,
        role: action.payload,
        currentStepIndex: 0,
        completedSteps: [],
        hasStarted: false,
      };

    case 'NEXT_STEP':
      if (!state.role) return state;

      const steps = getStepsForRole(state.role);
      const nextIndex = getNextStepIndex(state.role, state.currentStepIndex);
      const currentStepId = steps[state.currentStepIndex]?.id;

      console.log('🎬 NEXT_STEP reducer:', {
        currentStepIndex: state.currentStepIndex,
        nextIndex,
        totalSteps: steps.length,
        currentStepId
      });

      // Mark current step as completed
      const updatedCompletedSteps = currentStepId && !state.completedSteps.includes(currentStepId)
        ? [...state.completedSteps, currentStepId]
        : state.completedSteps;

      // If nextIndex is null, we're on the final step - advance beyond total steps to trigger completion
      const finalStepIndex = nextIndex !== null ? nextIndex : state.currentStepIndex + 1;

      console.log('📈 Step progression:', {
        from: state.currentStepIndex,
        to: finalStepIndex,
        completedSteps: updatedCompletedSteps,
        willTriggerCompletion: finalStepIndex >= steps.length
      });

      return {
        ...state,
        currentStepIndex: finalStepIndex,
        completedSteps: updatedCompletedSteps,
        formData: action.payload ? { ...state.formData, ...action.payload } : state.formData,
      };

    case 'SKIP_STEP':
      if (!state.role) return state;

      const skipSteps = getStepsForRole(state.role);
      const skipNextIndex = getNextStepIndex(state.role, state.currentStepIndex);
      const skipFinalStepIndex = skipNextIndex !== null ? skipNextIndex : state.currentStepIndex + 1;

      console.log('⏭️ SKIP_STEP reducer:', {
        currentStepIndex: state.currentStepIndex,
        skipToIndex: skipFinalStepIndex,
        totalSteps: skipSteps.length
      });

      return {
        ...state,
        currentStepIndex: skipFinalStepIndex,
      };

    case 'PREVIOUS_STEP':
      const prevIndex = getPreviousStepIndex(state.currentStepIndex);
      if (prevIndex === null) return state;

      return {
        ...state,
        currentStepIndex: prevIndex,
      };

    case 'GOTO_STEP':
      if (!state.role) return state;
      const roleSteps = getStepsForRole(state.role);
      if (action.payload < 0 || action.payload >= roleSteps.length) return state;

      return {
        ...state,
        currentStepIndex: action.payload,
      };

    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };

    case 'UPDATE_COMPLETION_PERCENTAGE':
      return {
        ...state,
        profileCompletionPercentage: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'START_ONBOARDING':
      return {
        ...state,
        hasStarted: true,
      };

    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        isLoading: false,
        hasStarted: false,
      };

    case 'RESET_ONBOARDING':
      return initialState;

    case 'RESTORE_STATE':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

// Context interface
interface OnboardingContextType {
  state: OnboardingState;
  setRole: (role: UserRole) => void;
  nextStep: (data?: any) => Promise<boolean>;
  skipStep: () => void;
  previousStep: () => void;
  gotoStep: (index: number) => void;
  updateFormData: (data: Partial<OnboardingData>) => void;
  updateCompletionPercentage: () => void;
  saveAndExit: () => Promise<void>;
  startOnboarding: () => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
  validateCurrentStep: (data: any) => { success: boolean; errors?: any };
  saveProgress: () => void;
  restoreProgress: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Provider component
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const { user, isLoading: isAuthLoading, refreshUserProfile } = useAuth();

  // Auto-update completion percentage when form data or role changes
  useEffect(() => {
    if (state.role && state.formData) {
      const percentage = calculateProfileCompletionPercentage(state.role, state.formData);
      if (percentage !== state.profileCompletionPercentage) {
        dispatch({ type: 'UPDATE_COMPLETION_PERCENTAGE', payload: percentage });
      }
    }
  }, [state.role, state.formData, state.profileCompletionPercentage]);

  // Auto-save progress to versioned localStorage
  useEffect(() => {
    if (state.hasStarted) {
      setOnboardingState({
        role: state.role,
        currentStepIndex: state.currentStepIndex,
        completedSteps: state.completedSteps,
        hasStarted: state.hasStarted,
      });
      setFormData('onboarding', state.formData);
    }
  }, [state]);

  // Restore progress on mount with version checking
  useEffect(() => {
    console.log('🔄 OnboardingContext: Attempting to restore saved progress with version checking...');

    // Clear any outdated versioned data first
    clearOutdatedVersionedData();

    const savedState = getOnboardingState();
    const savedFormData = getFormData('onboarding');

    console.log('💾 Versioned state found:', {
      hasState: !!savedState,
      hasFormData: !!savedFormData
    });

    if (savedState && savedFormData) {
      try {
        console.log('📋 Restoring onboarding state:', savedState);
        console.log('📝 Restoring form data:', savedFormData);

        dispatch({
          type: 'RESTORE_STATE',
          payload: {
            ...savedState,
            formData: savedFormData,
            isLoading: false, // Never restore loading state
          },
        });

        console.log('✅ Onboarding state restored successfully from versioned storage');
      } catch (error) {
        console.warn('❌ Failed to restore onboarding progress:', error);
      }
    } else {
      console.log('ℹ️ No valid versioned onboarding state found - starting fresh');
    }
  }, []);

  const setRole = (role: UserRole) => {
    dispatch({ type: 'SET_ROLE', payload: role });
  };

  const nextStep = async (data?: any): Promise<boolean> => {
    if (!state.role) return false;

    console.log('🔄 OnboardingContext.nextStep: Starting step progression');
    console.log('📊 Current state:', {
      role: state.role,
      currentStepIndex: state.currentStepIndex,
      isLoading: state.isLoading
    });

    // Validate current step data if provided
    if (data) {
      const steps = getStepsForRole(state.role);
      const currentStep = steps[state.currentStepIndex];

      console.log('✅ Validating step data for step:', currentStep?.id);
      console.log('📝 Data to validate:', data);

      if (currentStep) {
        const validation = validateStepData(state.role, currentStep.id, data);
        if (!validation.success) {
          console.log('❌ Step validation failed:', validation.errors);
          return false;
        }
        console.log('✅ Step validation passed');
      }
    }

    // Check if we're on the final step
    const steps = getStepsForRole(state.role);
    const isOnFinalStep = state.currentStepIndex === steps.length - 1;

    console.log('🎯 Step analysis:', {
      totalSteps: steps.length,
      currentStepIndex: state.currentStepIndex,
      isOnFinalStep,
      nextStepWouldBe: state.currentStepIndex + 1
    });

    if (isOnFinalStep) {
      console.log('🏁 On final step - advancing to trigger completion screen');
    }

    // Track step completion
    if (user && state.role) {
      const currentStep = steps[state.currentStepIndex];
      trackEvent('onboarding_step_completed', {
        user_id: user.id,
        role: state.role,
        step_id: currentStep?.id || 'unknown',
        step_index: state.currentStepIndex,
        total_steps: steps.length,
        profile_completion_percentage: state.profileCompletionPercentage,
      });
    }

    dispatch({ type: 'NEXT_STEP', payload: data });
    console.log('✅ Dispatched NEXT_STEP action');
    return true;
  };

  const previousStep = () => {
    dispatch({ type: 'PREVIOUS_STEP' });
  };

  const gotoStep = (index: number) => {
    dispatch({ type: 'GOTO_STEP', payload: index });
  };

  const updateFormData = (data: Partial<OnboardingData>) => {
    dispatch({ type: 'UPDATE_FORM_DATA', payload: data });
  };

  const skipStep = () => {
    dispatch({ type: 'SKIP_STEP' });
  };

  const updateCompletionPercentage = () => {
    if (state.role) {
      const percentage = calculateProfileCompletionPercentage(state.role, state.formData);
      dispatch({ type: 'UPDATE_COMPLETION_PERCENTAGE', payload: percentage });
    }
  };

  const saveAndExit = async (): Promise<void> => {
    console.log('💾 SaveAndExit: Saving partial progress and exiting onboarding');

    // Save current progress to localStorage
    saveProgress();

    // If user is authenticated, also save to database as partial completion via API
    if (user) {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        console.log('📤 Saving partial progress via API...');

        // Use API route instead of direct Supabase call to avoid RLS issues
        const { api } = await import('@/lib/api-client');

        await api.post('/api/auth/save-partial-progress', {
          userId: user.id,
          partialData: {
            onboarding_partial: true,
            onboarding_data: state.formData,
            profile_completion_percentage: state.profileCompletionPercentage,
            last_updated: new Date().toISOString(),
          }
        }, {
          timeout: 10000, // 10 second timeout for partial saves
          retries: 1 // Single retry for partial saves
        });

        console.log('✅ Partial progress saved to database via API');
      } catch (error: any) {
        console.log('⚠️ Failed to save partial progress via API:', error.message || error);
        // Don't throw error - localStorage save still works
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    console.log('💾 Partial progress saved successfully');
  };

  const startOnboarding = () => {
    dispatch({ type: 'START_ONBOARDING' });

    // Track onboarding started
    if (user && state.role) {
      trackEvent('onboarding_started', {
        user_id: user.id,
        role: state.role,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const waitForUserAuthentication = async (timeoutMs: number = 10000): Promise<boolean> => {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkAuth = () => {
        // If auth is still loading, keep waiting
        if (isAuthLoading) {
          if (Date.now() - startTime < timeoutMs) {
            setTimeout(checkAuth, 100);
          } else {
            console.log('⏰ Timeout waiting for auth to finish loading');
            resolve(false);
          }
          return;
        }

        // Auth finished loading - check if user is available
        if (user) {
          console.log('✅ User authentication confirmed:', user.id);
          resolve(true);
        } else {
          console.log('❌ Auth finished loading but no user found');
          resolve(false);
        }
      };

      checkAuth();
    });
  };

  const completeOnboarding = async (): Promise<void> => {
    console.log('🎯 OnboardingContext.completeOnboarding: Starting completion process');
    console.log('👤 Current user:', user?.id);
    console.log('🔄 Auth loading state:', isAuthLoading);
    console.log('📋 Form data to save:', state.formData);

    dispatch({ type: 'SET_LOADING', payload: true });

    // Set a maximum timeout for the entire completion process
    const COMPLETION_TIMEOUT = 30000; // 30 seconds
    const completionPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Completion process timed out. Your data has been saved locally.'));
      }, COMPLETION_TIMEOUT);

      // Store timeout reference for cleanup
      (resolve as any).timeout = timeout;
    });

    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    const attemptSave = async (attempt: number): Promise<void> => {
      try {
        // Wait for user authentication to be confirmed
        console.log(`🕒 Attempt ${attempt}/${MAX_RETRIES}: Waiting for user authentication...`);
        const isAuthenticated = await waitForUserAuthentication(5000);

        if (!isAuthenticated) {
          console.log('❌ User authentication could not be confirmed');
          throw new Error('User must be authenticated to complete onboarding');
        }

        console.log(`✅ User authenticated, proceeding with database save (attempt ${attempt}/${MAX_RETRIES})`);

        // Create a backup of form data in versioned localStorage before attempting save
        console.log('💾 Creating backup of form data in versioned localStorage');
        setFormData('onboarding-backup', {
          timestamp: new Date().toISOString(),
          userId: user!.id, // Non-null assertion safe after authentication check
          formData: state.formData
        });


        // Call API to complete onboarding with service role privileges using enhanced API client
        console.log('📤 Calling complete-onboarding API with form data...');

        const { api } = await import('@/lib/api-client');

        const result = await api.post('/api/auth/complete-onboarding', {
          userId: user!.id,
          onboardingData: state.formData
        }, {
          retries: 2, // Fewer retries since we already have outer retry logic
          timeout: 15000, // 15 second timeout
          useExponentialBackoff: true
        });

        console.log(`✅ Onboarding completed successfully (attempt ${attempt}):`, result);

        // Track onboarding completion
        if (user && state.role) {
          trackEvent('onboarding_completed', {
            user_id: user.id,
            role: state.role,
            profile_completion_percentage: state.profileCompletionPercentage,
            total_steps_completed: state.completedSteps.length,
            timestamp: new Date().toISOString(),
          });
        }

        // Refresh user profile to sync latest onboarding data
        console.log('🔄 Refreshing user profile to sync onboarding completion...');
        await refreshUserProfile();

        // Award "First Steps" badge for completing onboarding
        try {
          console.log('🎖️ Checking badge eligibility for onboarding completion...');
          const badgeResponse = await fetch('/api/badges/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user!.id,
              action: 'onboarding_complete'
            })
          });

          if (badgeResponse.ok) {
            const badgeResult = await badgeResponse.json();
            if (badgeResult.awardedBadge) {
              console.log('🎉 Badge awarded for onboarding completion:', badgeResult.badge?.name);
            } else {
              console.log('ℹ️ No new badge awarded (may already be earned)');
            }
          }
        } catch (badgeError) {
          // Don't fail onboarding if badge award fails
          console.warn('⚠️ Failed to award badge, but onboarding succeeded:', badgeError);
        }

        // Clear saved progress and backup only on success
        console.log('🧹 Clearing versioned localStorage onboarding data and backup');
        removeVersionedLocalStorage('chatnil-onboarding-state');
        removeVersionedLocalStorage('chatnil-onboarding-data');
        removeVersionedLocalStorage('chatnil-onboarding-backup-data');

        dispatch({ type: 'COMPLETE_ONBOARDING' });
        console.log('🎉 Onboarding completion process finished successfully');

        // Clear timeout on success
        if ((completionPromise as any).timeout) {
          clearTimeout((completionPromise as any).timeout);
        }

      } catch (error: any) {
        console.error(`💥 Attempt ${attempt} failed:`, error);

        // If this isn't the last attempt, retry after delay
        if (attempt < MAX_RETRIES) {
          console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return attemptSave(attempt + 1);
        }

        // Last attempt failed, throw the error
        throw error;
      }
    };

    try {
      await Promise.race([
        attemptSave(1),
        completionPromise
      ]);
    } catch (error: any) {
      console.error('🚨 All retry attempts failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });

      // Clear timeout if it exists
      if ((completionPromise as any).timeout) {
        clearTimeout((completionPromise as any).timeout);
      }

      // Enhanced error handling with fallback strategies
      let shouldAttemptFallbackRedirect = false;
      let userFriendlyError = '';

      if (error.message.includes('timeout') || error.message.includes('timed out')) {
        userFriendlyError = 'The process is taking longer than expected. Your data has been saved locally.';
        shouldAttemptFallbackRedirect = true;
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userFriendlyError = 'Network connection issue. Your data has been saved locally. Please check your connection.';
        shouldAttemptFallbackRedirect = true;
      } else if (error.message.includes('auth') || error.message.includes('permission')) {
        userFriendlyError = 'Authentication issue. Please refresh the page and try again.';
        shouldAttemptFallbackRedirect = false;
      } else {
        userFriendlyError = 'Unable to save your information right now. Your progress has been backed up.';
        shouldAttemptFallbackRedirect = true;
      }

      // If appropriate, still mark onboarding as completed locally for fallback redirect
      if (shouldAttemptFallbackRedirect) {
        console.log('🔄 Attempting fallback completion for user experience...');
        dispatch({ type: 'COMPLETE_ONBOARDING' });

        // Add fallback flag to localStorage for recovery
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('chatnil-onboarding-fallback', JSON.stringify({
              userId: user?.id,
              timestamp: new Date().toISOString(),
              formData: state.formData,
              error: error.message
            }));
          }
        } catch (storageError) {
          console.warn('⚠️ Could not save fallback data:', storageError);
        }

        console.log('✅ Fallback completion set - user will be redirected');
        return; // Don't throw error for fallback cases
      }

      throw new Error(userFriendlyError);
    }
  };

  const resetOnboarding = () => {
    removeVersionedLocalStorage('chatnil-onboarding-state');
    removeVersionedLocalStorage('chatnil-onboarding-data');
    dispatch({ type: 'RESET_ONBOARDING' });
  };

  const validateCurrentStep = (data: any) => {
    if (!state.role) return { success: false, errors: 'No role selected' };

    const steps = getStepsForRole(state.role);
    const currentStep = steps[state.currentStepIndex];

    if (!currentStep) return { success: false, errors: 'Invalid step' };

    return validateStepData(state.role, currentStep.id, data);
  };

  const saveProgress = () => {
    setOnboardingState({
      role: state.role,
      currentStepIndex: state.currentStepIndex,
      completedSteps: state.completedSteps,
      hasStarted: state.hasStarted,
    });
    setFormData('onboarding', state.formData);
  };

  const restoreProgress = () => {
    const savedState = getOnboardingState();
    const savedFormData = getFormData('onboarding');

    if (savedState && savedFormData) {
      try {
        dispatch({
          type: 'RESTORE_STATE',
          payload: {
            ...savedState,
            formData: savedFormData,
            isLoading: false,
          },
        });
      } catch (error) {
        console.warn('Failed to restore onboarding progress:', error);
      }
    }
  };

  const value: OnboardingContextType = {
    state,
    setRole,
    nextStep,
    skipStep,
    previousStep,
    gotoStep,
    updateFormData,
    updateCompletionPercentage,
    saveAndExit,
    startOnboarding,
    completeOnboarding,
    resetOnboarding,
    validateCurrentStep,
    saveProgress,
    restoreProgress,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook to use onboarding context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}