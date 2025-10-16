'use client';

import { OnboardingStepProps } from '@/lib/onboarding-types';

export default function ParentAthleteInfoStep({ data, onNext, onBack, isFirst, isLast, isLoading }: OnboardingStepProps) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Athlete's Information</h2>
      <p className="text-gray-600 mb-8">Tell us about your student-athlete.</p>
      <div className="space-y-4">
        <div className="text-sm text-gray-500">Coming soon...</div>
        <button
          onClick={() => onNext({})}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
        >
          Continue (Demo)
        </button>
      </div>
    </div>
  );
}