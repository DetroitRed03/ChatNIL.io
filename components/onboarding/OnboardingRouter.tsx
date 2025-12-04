'use client';

import { useEffect } from 'react';
import { ArrowLeft, X, MessageSquare, ChevronLeft, User, GraduationCap, Trophy, Target, Share2, Heart, DollarSign, Image, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { getStepsForRole, getStepByIndex, getOnboardingFlow } from '@/lib/onboarding-registry';
import RoleSelectionScreen from './RoleSelectionScreen';
import ProgressIndicator, { MiniProgressIndicator } from './ProgressIndicator';
import OnboardingComplete from './OnboardingComplete';
import OnboardingHeader from './OnboardingHeader';
import { cn } from '@/lib/utils';

// Step Icons - Maps step IDs to lucide-react icons
const STEP_ICONS: Record<string, LucideIcon> = {
  'athlete-personal-info': User,
  'athlete-school-info': GraduationCap,
  'athlete-sports-info': Trophy,
  'athlete-nil-info': Target,
  'athlete-social-media': Share2,
  'athlete-interests': Heart,
  'athlete-nil-preferences': DollarSign,
  'athlete-content-samples': Image,
};

const getStepIcon = (stepId: string): LucideIcon => {
  return STEP_ICONS[stepId] || User;
};

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
  const {
    state,
    nextStep,
    previousStep,
    gotoStep,
    completeOnboarding,
    resetOnboarding,
    setMode,
    setPrefillData,
    setRole,
    startOnboarding
  } = useOnboarding();

  // Handler for clicking on step in progress indicator
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= state.currentStepIndex) {
      gotoStep(stepIndex);
    }
  };

  // Handler for going back to role selection
  const handleBackToRoleSelection = () => {
    setRole(null as any);
    resetOnboarding();
  };

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

  // Phase 6B: Detect school-created accounts and switch to completion mode
  useEffect(() => {
    console.log('🔍 Phase 6B Detection - User object:', user);
    console.log('🔍 School fields check:', {
      has_user: !!user,
      school_created: user?.school_created,
      profile_completion_tier: user?.profile_completion_tier,
      home_completion_required: user?.home_completion_required,
      first_name: user?.first_name,
      last_name: user?.last_name,
      current_mode: state.mode
    });

    // Only set completion mode if we're not already in it (prevent infinite loop)
    if (
      user &&
      user.school_created &&
      user.profile_completion_tier === 'basic' &&
      user.home_completion_required &&
      state.mode !== 'completion' // Guard: only switch if not already in completion mode
    ) {
      console.log('🏫 School-created account detected - switching to completion mode');
      console.log('📋 User data:', {
        school_created: user.school_created,
        profile_completion_tier: user.profile_completion_tier,
        home_completion_required: user.home_completion_required,
        school_name: user.school_name,
        current_role: user.role
      });

      // Switch to completion mode
      setMode('completion');

      // Set the user's role (we know they're an athlete from school signup)
      setRole(user.role as any); // Type assertion since we know it's valid

      // Prefill data that was already collected at school
      setPrefillData({
        first_name: user.first_name,
        firstName: user.first_name,
        last_name: user.last_name,
        lastName: user.last_name,
        email: user.email,  // Include email for validation
        primary_sport: user.primary_sport,
        primarySport: user.primary_sport,
        graduation_year: user.graduation_year,
        graduationYear: user.graduation_year,
        school_name: user.school_name,
        schoolName: user.school_name,
      });

      // Start the onboarding flow with the prefilled data
      startOnboarding();

      console.log('✅ Completion mode activated with prefilled data and flow started');
    }
  }, [user, state.mode, setMode, setPrefillData, setRole, startOnboarding]);

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

  // Phase 6B: Use getOnboardingFlow to respect completion mode
  const steps = getOnboardingFlow(state.role, state.mode);
  const currentStep = steps[state.currentStepIndex];

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
  const StepIcon = getStepIcon(currentStep.id);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
      {/* User Navigation Header */}
      <OnboardingHeader className="flex-shrink-0 z-20" />

      {/* Header with Progress */}
      <div className="flex-shrink-0 z-10 bg-white/80 backdrop-blur-sm border-b border-orange-100/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {/* Back Navigation - Shows "Back" or "Change Role" */}
            <div className="flex items-center gap-2">
              {isFirst ? (
                <button
                  onClick={handleBackToRoleSelection}
                  disabled={state.isLoading}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    state.isLoading
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Change Role
                </button>
              ) : (
                <button
                  onClick={previousStep}
                  disabled={state.isLoading}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    state.isLoading
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}
            </div>

            {/* Exit Button */}
            {showExitButton && (
              <button
                onClick={handleExit}
                disabled={state.isLoading}
                className={cn(
                  'p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors',
                  state.isLoading && 'cursor-not-allowed opacity-50'
                )}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Progress Indicator with Clickable Steps */}
          <ProgressIndicator
            role={state.role}
            currentStepIndex={state.currentStepIndex}
            completedSteps={state.completedSteps}
            formData={state.formData}
            profileCompletionPercentage={state.profileCompletionPercentage}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Step Content - Scrollable Area with Animations */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="bg-white rounded-2xl border-2 border-orange-100/50 shadow-xl p-8 onboarding-container"
              id="onboarding-content"
              role="main"
              tabIndex={-1}
            >
              {/* Step Header with Icon */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200/50"
                >
                  <StepIcon className="h-8 w-8 text-white" />
                </motion.div>
                <motion.h1
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
                >
                  {currentStep.title}
                </motion.h1>
                {currentStep.description && (
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="text-gray-600 leading-relaxed max-w-lg mx-auto"
                  >
                    {currentStep.description}
                  </motion.p>
                )}
              </div>

              {/* Step Content */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="onboarding-step-content"
              >
                <StepComponent
                  data={state.formData}
                  onNext={async (data) => {
                    console.log('📤 OnboardingRouter: Step submitted with data:', data);
                    const success = await nextStep(data);
                    if (!success) {
                      console.error('❌ OnboardingRouter: Step validation failed, staying on current step');
                    } else {
                      console.log('✅ OnboardingRouter: Step progression successful');
                    }
                  }}
                  onBack={previousStep}
                  isFirst={isFirst}
                  isLast={isLast}
                  isLoading={state.isLoading}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Mini Progress (Mobile) */}
          <div className="lg:hidden mt-6 pb-8">
            <MiniProgressIndicator
              role={state.role}
              currentStepIndex={state.currentStepIndex}
              formData={state.formData}
              profileCompletionPercentage={state.profileCompletionPercentage}
              className="bg-white rounded-xl p-4 shadow-sm border-2 border-orange-100/50"
            />
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {state.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 border-2 border-orange-100/50"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Saving your profile...</div>
                  <div className="text-sm text-gray-600 mt-1">This will only take a moment</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}