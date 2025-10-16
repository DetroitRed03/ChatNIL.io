'use client';

import { useEffect } from 'react';
import { ArrowLeft, X, MessageSquare } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { getStepsForRole, getStepByIndex } from '@/lib/onboarding-registry';
import RoleSelectionScreen from './RoleSelectionScreen';
import ProgressIndicator, { MiniProgressIndicator } from './ProgressIndicator';
import OnboardingComplete from './OnboardingComplete';
import OnboardingHeader from './OnboardingHeader';

interface OnboardingRouterProps {
  onComplete?: () => void;
  onExit?: () => void;
  showExitButton?: boolean;
}

export default function OnboardingRouter({
  onComplete,
  onExit,
  showExitButton = true
}: OnboardingRouterProps) {
  const { user } = useAuth();
  const { state, previousStep, completeOnboarding, resetOnboarding } = useOnboarding();

  // Auto-scroll to top when step changes
  useEffect(() => {
    console.log('🔝 Auto-scrolling to top for step:', state.currentStepIndex);

    // Use requestAnimationFrame to ensure scroll happens after DOM updates
    requestAnimationFrame(() => {
      // Scroll window to top with smooth animation
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      // Also scroll any scrollable containers to top
      const scrollableContainers = [
        '.onboarding-container',
        '.onboarding-step-content',
        '.onboarding-form',
        '[data-scrollable]'
      ];

      scrollableContainers.forEach(selector => {
        const container = document.querySelector(selector);
        if (container) {
          console.log('🔝 Scrolling container to top:', selector);
          container.scrollTop = 0;
        }
      });

      // Also scroll the main scrollable content area
      const mainScrollArea = document.querySelector('.flex-1.overflow-y-auto');
      if (mainScrollArea) {
        mainScrollArea.scrollTop = 0;
      }

      // Focus the main content area for better accessibility
      const mainContent = document.querySelector('[role="main"], .onboarding-step-content, #onboarding-content');
      if (mainContent && typeof (mainContent as HTMLElement).focus === 'function') {
        (mainContent as HTMLElement).focus({ preventScroll: true });
      }
    });
  }, [state.currentStepIndex]); // Trigger on step change

  // Only skip onboarding if user has completed it
  useEffect(() => {
    console.log('🎯 OnboardingRouter: Checking if should skip onboarding...');
    console.log('👤 User profile:', user?.profile);
    console.log('✅ Onboarding completed:', user?.profile?.onboarding_completed);

    // Only skip if user has profile AND onboarding is actually completed
    if (user?.profile && user.profile.onboarding_completed && onComplete) {
      console.log('⏭️ Onboarding already completed, redirecting to complete handler');
      onComplete();
    } else if (user?.profile && !user.profile.onboarding_completed) {
      console.log('🎯 User has profile but onboarding not completed - showing onboarding flow');
    } else {
      console.log('👤 No user profile yet, waiting...');
    }
  }, [user, onComplete]);

  // Handle onboarding completion with enhanced fallback logic
  const handleComplete = async () => {
    const REDIRECT_TIMEOUT = 10000; // 10 seconds max wait time
    let redirectTimer: NodeJS.Timeout | null = null;

    try {
      console.log('🎁 OnboardingRouter: Starting completion with fallback redirect...');

      // Set a fallback redirect timer
      redirectTimer = setTimeout(() => {
        console.log('⏰ Fallback redirect triggered due to timeout');
        if (onComplete) {
          onComplete();
        } else {
          // Direct fallback redirect if no onComplete handler
          console.log('🔄 Direct fallback: redirecting to /profile');
          window.location.href = '/profile';
        }
      }, REDIRECT_TIMEOUT);

      await completeOnboarding();

      // Clear timeout on successful completion
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }

      console.log('✅ Completion successful, calling onComplete handler');
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('❌ Failed to complete onboarding:', error);

      // Clear timeout
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }

      // Check if this is a fallback completion (data saved locally)
      const errorMessage = error.message || '';
      const isFallbackCase = errorMessage.includes('saved locally') ||
                            errorMessage.includes('backed up') ||
                            errorMessage.includes('timed out');

      if (isFallbackCase) {
        console.log('🛡️ Fallback case detected - proceeding with redirect despite error');
        // Show a brief message then redirect anyway
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          } else {
            window.location.href = '/profile';
          }
        }, 2000); // 2 second delay to show any error message
      } else {
        // Real error - don't redirect
        console.error('🚨 Real error occurred, not redirecting:', error);
        // Could show an error toast or modal here
      }
    }
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      resetOnboarding();
    }
  };

  // Show loading state if still initializing
  if (state.isLoading && !state.hasStarted) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center animate-pulse mx-auto mb-4">
              <MessageSquare className="h-7 w-7 text-white" />
            </div>
            <p className="text-gray-600 text-sm">Loading onboarding...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show role selection if no role is selected or onboarding hasn't started
  console.log('🔍 OnboardingRouter: Checking if should show role selection...');
  console.log('📋 Onboarding state:', {
    role: state.role,
    hasStarted: state.hasStarted,
    currentStepIndex: state.currentStepIndex,
    completedSteps: state.completedSteps
  });

  if (!state.role || !state.hasStarted) {
    console.log('✅ Showing RoleSelectionScreen - no role or not started');
    return <RoleSelectionScreen />;
  }

  const steps = getStepsForRole(state.role);
  const currentStep = getStepByIndex(state.role, state.currentStepIndex);

  console.log('🎯 OnboardingRouter: Checking completion condition');
  console.log('📊 Router state:', {
    role: state.role,
    currentStepIndex: state.currentStepIndex,
    totalSteps: steps.length,
    hasCurrentStep: !!currentStep,
    shouldShowCompletion: !currentStep || state.currentStepIndex >= steps.length
  });

  // Show completion screen if all steps are done
  if (!currentStep || state.currentStepIndex >= steps.length) {
    console.log('🎉 Showing OnboardingComplete screen');
    return (
      <OnboardingComplete
        role={state.role}
        formData={state.formData}
        onComplete={handleComplete}
        isLoading={state.isLoading}
      />
    );
  }

  const StepComponent = currentStep.component;
  const isFirst = state.currentStepIndex === 0;
  const isLast = state.currentStepIndex === steps.length - 1;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* User Navigation Header */}
      <OnboardingHeader className="flex-shrink-0 z-20" />

      {/* Header with Progress */}
      <div className="flex-shrink-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            {/* Back Button */}
            <button
              onClick={previousStep}
              disabled={isFirst || state.isLoading}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isFirst || state.isLoading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>

            {/* Exit Button */}
            {showExitButton && (
              <button
                onClick={handleExit}
                disabled={state.isLoading}
                className={`p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${
                  state.isLoading ? 'cursor-not-allowed' : ''
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <ProgressIndicator
            role={state.role}
            currentStepIndex={state.currentStepIndex}
            completedSteps={state.completedSteps}
            formData={state.formData}
            profileCompletionPercentage={state.profileCompletionPercentage}
          />
        </div>
      </div>

      {/* Step Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 min-h-full">
          <div
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 onboarding-container"
            id="onboarding-content"
            role="main"
            tabIndex={-1}
          >
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                {currentStep.title}
              </h1>
              {currentStep.description && (
                <p className="text-gray-600 leading-relaxed">
                  {currentStep.description}
                </p>
              )}
            </div>

            <div className="onboarding-step-content">
              <StepComponent
                data={state.formData}
                onNext={(data) => {
                  // Handle next step logic in the component
                  console.log('Step data:', data);
                }}
                onBack={previousStep}
                isFirst={isFirst}
                isLast={isLast}
                isLoading={state.isLoading}
              />
            </div>
          </div>

          {/* Bottom Mini Progress (Mobile) */}
          <div className="lg:hidden mt-6 pb-8">
            <MiniProgressIndicator
              role={state.role}
              currentStepIndex={state.currentStepIndex}
              formData={state.formData}
              profileCompletionPercentage={state.profileCompletionPercentage}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {state.isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent"></div>
              <div>
                <div className="font-medium text-gray-900">Saving your profile...</div>
                <div className="text-sm text-gray-600 mt-1">This will only take a moment</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}