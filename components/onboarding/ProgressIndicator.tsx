'use client';

import { Check, Clock } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { getStepsForRole, calculateProgress, calculateProgressFromData } from '@/lib/onboarding-registry';
import Tooltip from '@/components/ui/Tooltip';

interface ProgressIndicatorProps {
  role: UserRole;
  currentStepIndex: number;
  completedSteps: string[];
  formData?: Record<string, any>;
  profileCompletionPercentage?: number;
  className?: string;
}

export default function ProgressIndicator({
  role,
  currentStepIndex,
  completedSteps,
  formData,
  profileCompletionPercentage,
  className = ''
}: ProgressIndicatorProps) {
  const steps = getStepsForRole(role);

  // Use field-based progress if available, otherwise fall back to step-based
  const progress = profileCompletionPercentage !== undefined
    ? profileCompletionPercentage
    : formData
    ? calculateProgressFromData(role, formData)
    : calculateProgress(role, currentStepIndex);

  if (steps.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar - Always Visible */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <div className="flex items-center gap-2">
            <span>{progress}% Complete</span>
            {progress > 0 && progress < 100 && (
              <Clock className="h-3 w-3 text-blue-500" />
            )}
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Desktop Step Indicators - Hidden on mobile/tablet to prevent overflow */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = index === currentStepIndex;
            const isPast = index < currentStepIndex;
            const isAccessible = index <= currentStepIndex;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg'
                        : isPast
                        ? 'bg-orange-100 border-orange-300 text-orange-600'
                        : isAccessible
                        ? 'bg-white border-orange-200 text-orange-400'
                        : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Current Step Pulse */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-25"></div>
                  )}
                </div>

                {/* Step Label */}
                <div className="ml-3 min-w-0 flex-1">
                  <Tooltip
                    content={
                      <div className="text-center">
                        <div className="font-semibold">{step.fullTitle || step.title}</div>
                        {(step.fullDescription || step.description) && (
                          <div className="text-xs mt-1 opacity-90">
                            {step.fullDescription || step.description}
                          </div>
                        )}
                      </div>
                    }
                    position="bottom"
                  >
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          isCompleted || isCurrent
                            ? 'text-gray-900'
                            : isAccessible
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </div>
                      {step.description && (
                        <div
                          className={`text-xs ${
                            isCompleted || isCurrent
                              ? 'text-gray-600'
                              : isAccessible
                              ? 'text-gray-500'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.description}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="mx-4 flex-1 max-w-16 h-px bg-gray-200 relative">
                    <div
                      className={`absolute left-0 top-0 h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 ${
                        index < currentStepIndex ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet Step Info - Shows current step only */}
      <div className="lg:hidden">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">
            {steps[currentStepIndex]?.title}
          </div>
          {steps[currentStepIndex]?.description && (
            <div className="text-xs text-gray-600 mt-1">
              {steps[currentStepIndex].description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simplified mini progress indicator for headers/navigation
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
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="flex-1 bg-gray-200 rounded-full h-1 overflow-hidden">
        <div
          className="bg-orange-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 min-w-0">
        {currentStepIndex + 1}/{steps.length}
      </span>
    </div>
  );
}