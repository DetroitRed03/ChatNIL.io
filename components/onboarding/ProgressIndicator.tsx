'use client';

import { Check, Clock, User, GraduationCap, Trophy, Target, Share2, Heart, DollarSign, Image, LucideIcon } from 'lucide-react';
import { UserRole } from '@/types';
import { getStepsForRole, calculateProgress, calculateProgressFromData } from '@/lib/onboarding-registry';
import Tooltip from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

// ============================================================================
// Step Icons - Maps step IDs to lucide-react icons
// ============================================================================

const STEP_ICONS: Record<string, LucideIcon> = {
  // Athlete steps
  'athlete-personal-info': User,
  'athlete-school-info': GraduationCap,
  'athlete-sports-info': Trophy,
  'athlete-nil-info': Target,
  'athlete-social-media': Share2,
  'athlete-interests': Heart,
  'athlete-nil-preferences': DollarSign,
  'athlete-content-samples': Image,
  // Agency steps
  'agency-info': User,
  'agency-team': User,
  // Parent steps
  'parent-info': User,
  'parent-athlete-connection': User,
};

const getStepIcon = (stepId: string): LucideIcon => {
  return STEP_ICONS[stepId] || User;
};

// ============================================================================
// Progress Indicator Props
// ============================================================================

interface ProgressIndicatorProps {
  role: UserRole;
  currentStepIndex: number;
  completedSteps: string[];
  formData?: Record<string, any>;
  profileCompletionPercentage?: number;
  className?: string;
  onStepClick?: (stepIndex: number) => void; // NEW: Clickable navigation
}

export default function ProgressIndicator({
  role,
  currentStepIndex,
  completedSteps,
  formData,
  profileCompletionPercentage,
  className = '',
  onStepClick,
}: ProgressIndicatorProps) {
  const steps = getStepsForRole(role);

  // Use field-based progress if available, otherwise fall back to step-based
  const progress = profileCompletionPercentage !== undefined
    ? profileCompletionPercentage
    : formData
    ? calculateProgressFromData(role, formData)
    : calculateProgress(role, currentStepIndex);

  // Helper: Can navigate to this step (any step that's current or earlier)
  const canNavigateTo = (index: number) => index <= currentStepIndex;

  if (steps.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar - Always Visible */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">Step {currentStepIndex + 1} of {steps.length}</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{progress}% Complete</span>
            {progress > 0 && progress < 100 && (
              <Clock className="h-3 w-3 text-orange-500" />
            )}
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Indicators - Wizard Style with Icons */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = index === currentStepIndex;
            const isAccessible = canNavigateTo(index);
            const StepIcon = getStepIcon(step.id);

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle with Icon */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => isAccessible && onStepClick?.(index)}
                    disabled={!isAccessible || !onStepClick}
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                      isCompleted
                        ? 'bg-green-500 text-white shadow-lg shadow-green-200/50 hover:bg-green-600'
                        : isCurrent
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-200/50'
                        : isAccessible
                        ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed',
                      isAccessible && onStepClick && 'hover:scale-105'
                    )}
                    title={isAccessible ? `Go to ${step.title}` : step.title}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </button>

                  {/* Current Step Pulse Animation */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-xl bg-orange-500 animate-ping opacity-20" />
                  )}
                </div>

                {/* Step Label */}
                <div className="ml-3 min-w-0 flex-1">
                  <Tooltip
                    content={
                      <div className="text-center max-w-xs">
                        <div className="font-semibold">{step.fullTitle || step.title}</div>
                        {(step.fullDescription || step.description) && (
                          <div className="text-xs mt-1 opacity-90">
                            {step.fullDescription || step.description}
                          </div>
                        )}
                        {isAccessible && onStepClick && (
                          <div className="text-xs mt-2 text-orange-300 font-medium">
                            Click to navigate
                          </div>
                        )}
                      </div>
                    }
                    position="bottom"
                  >
                    <button
                      onClick={() => isAccessible && onStepClick?.(index)}
                      disabled={!isAccessible || !onStepClick}
                      className={cn(
                        'text-left transition-colors',
                        isAccessible && onStepClick && 'hover:text-orange-600 cursor-pointer'
                      )}
                    >
                      <div
                        className={cn(
                          'text-sm font-bold',
                          isCompleted || isCurrent
                            ? 'text-gray-900'
                            : isAccessible
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        )}
                      >
                        {step.title}
                      </div>
                      {step.description && (
                        <div
                          className={cn(
                            'text-xs',
                            isCompleted || isCurrent
                              ? 'text-gray-600'
                              : isAccessible
                              ? 'text-gray-500'
                              : 'text-gray-400'
                          )}
                        >
                          {step.description}
                        </div>
                      )}
                    </button>
                  </Tooltip>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="mx-4 flex-1 max-w-16 h-1 bg-gray-100 rounded-full relative overflow-hidden">
                    <div
                      className={cn(
                        'absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500',
                        index < currentStepIndex ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tablet Step Indicators - Compact Icons */}
      <div className="hidden md:block lg:hidden">
        <div className="flex items-center justify-center gap-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = index === currentStepIndex;
            const isAccessible = canNavigateTo(index);
            const StepIcon = getStepIcon(step.id);

            return (
              <div key={step.id} className="flex items-center">
                <Tooltip
                  content={
                    <div className="text-center">
                      <div className="font-semibold">{step.title}</div>
                      {isAccessible && onStepClick && (
                        <div className="text-xs mt-1 text-orange-300">Click to navigate</div>
                      )}
                    </div>
                  }
                  position="bottom"
                >
                  <button
                    onClick={() => isAccessible && onStepClick?.(index)}
                    disabled={!isAccessible || !onStepClick}
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                      isCompleted
                        ? 'bg-green-500 text-white shadow-md'
                        : isCurrent
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg'
                        : isAccessible
                        ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                        : 'bg-gray-100 text-gray-400',
                      isAccessible && onStepClick && 'hover:scale-105 cursor-pointer'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </button>
                </Tooltip>

                {/* Connector */}
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-200 mx-1">
                    <div
                      className={cn(
                        'h-full bg-orange-500 transition-all duration-500',
                        index < currentStepIndex ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Step Info - Shows current step with navigation dots */}
      <div className="md:hidden">
        <div className="flex flex-col items-center">
          {/* Current Step Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            {(() => {
              const currentStep = steps[currentStepIndex];
              const StepIcon = currentStep ? getStepIcon(currentStep.id) : User;
              return <StepIcon className="h-7 w-7 text-white" />;
            })()}
          </div>

          {/* Current Step Title */}
          <div className="text-center mb-4">
            <div className="text-base font-bold text-gray-900">
              {steps[currentStepIndex]?.title}
            </div>
            {steps[currentStepIndex]?.description && (
              <div className="text-sm text-gray-600 mt-1">
                {steps[currentStepIndex].description}
              </div>
            )}
          </div>

          {/* Navigation Dots */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = index === currentStepIndex;
              const isAccessible = canNavigateTo(index);

              return (
                <button
                  key={step.id}
                  onClick={() => isAccessible && onStepClick?.(index)}
                  disabled={!isAccessible || !onStepClick}
                  className={cn(
                    'transition-all duration-300',
                    isCurrent
                      ? 'w-8 h-2 rounded-full bg-orange-500'
                      : isCompleted
                      ? 'w-2 h-2 rounded-full bg-green-500'
                      : isAccessible
                      ? 'w-2 h-2 rounded-full bg-orange-300 hover:bg-orange-400'
                      : 'w-2 h-2 rounded-full bg-gray-300',
                    isAccessible && onStepClick && 'cursor-pointer'
                  )}
                  title={step.title}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Mini Progress Indicator - For headers/navigation
// ============================================================================

export function MiniProgressIndicator({
  role,
  currentStepIndex,
  formData,
  profileCompletionPercentage,
  className = ''
}: {
  role: UserRole;
  currentStepIndex: number;
  formData?: Record<string, any>;
  profileCompletionPercentage?: number;
  className?: string;
}) {
  const steps = getStepsForRole(role);

  // Use field-based progress if available, otherwise fall back to step-based
  const progress = profileCompletionPercentage !== undefined
    ? profileCompletionPercentage
    : formData
    ? calculateProgressFromData(role, formData)
    : calculateProgress(role, currentStepIndex);

  if (steps.length === 0) return null;

  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 min-w-0">
        {currentStepIndex + 1}/{steps.length}
      </span>
    </div>
  );
}
