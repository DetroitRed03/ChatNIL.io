'use client';

import { OnboardingStep } from './OnboardingStep';

interface EmptyStateOnboardingProps {
  institutionName: string;
  onDownloadTemplate: () => void;
  onImportAthletes: () => void;
  onSkip?: () => void;
}

export function EmptyStateOnboarding({
  institutionName,
  onDownloadTemplate,
  onImportAthletes,
  onSkip
}: EmptyStateOnboardingProps) {
  return (
    <div
      data-testid="empty-state-onboarding"
      className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
    >
      <div className="max-w-2xl w-full text-center">
        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to ChatNIL Compliance
          </h1>
          <p className="text-gray-600">
            {institutionName}
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Get started in 3 steps
          </h2>

          <div className="flex items-start justify-center gap-4 mb-8">
            <OnboardingStep
              number={1}
              title="Import Roster"
              description="Upload your athlete roster via CSV"
              isActive={true}
            />
            <div className="flex-shrink-0 w-8 h-0.5 bg-gray-200 mt-6" />
            <OnboardingStep
              number={2}
              title="Athletes Validate"
              description="Athletes submit their NIL deals"
              isActive={false}
            />
            <div className="flex-shrink-0 w-8 h-0.5 bg-gray-200 mt-6" />
            <OnboardingStep
              number={3}
              title="You Monitor"
              description="Review compliance from dashboard"
              isActive={false}
            />
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onDownloadTemplate}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Download CSV Template
            </button>
            <button
              onClick={onImportAthletes}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
            >
              Import Athletes Now
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Help Link */}
        <p className="text-sm text-gray-500">
          Need help getting started?{' '}
          <a
            href="mailto:support@chatnil.io"
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Contact support
          </a>
        </p>

        {/* Skip Option */}
        {onSkip && (
          <button
            onClick={onSkip}
            className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            Skip for now, I'll come back later
          </button>
        )}
      </div>
    </div>
  );
}
