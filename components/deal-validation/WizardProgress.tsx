'use client';

import { CheckCircle } from 'lucide-react';

interface WizardProgressProps {
  currentStep: 1 | 2 | 3;
  steps?: { number: number; label: string }[];
}

const defaultSteps = [
  { number: 1, label: 'Basics' },
  { number: 2, label: 'Verify' },
  { number: 3, label: 'Results' },
];

export function WizardProgress({ currentStep, steps = defaultSteps }: WizardProgressProps) {
  return (
    <div data-testid="wizard-progress" className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isUpcoming = step.number > currentStep;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-orange-500 text-white ring-4 ring-orange-100' : ''}
                    ${isUpcoming ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isCurrent ? 'text-orange-600' : ''}
                    ${isUpcoming ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 mb-6">
                  <div
                    className={`
                      h-1 rounded-full transition-all duration-300
                      ${step.number < currentStep ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
