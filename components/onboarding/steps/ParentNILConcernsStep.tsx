'use client';

import { useState } from 'react';
import { OnboardingStepProps } from '@/lib/onboarding-types';

const NIL_CONCERNS = [
  { id: 'understanding_rules', label: 'Understanding NIL rules and regulations' },
  { id: 'tax_implications', label: 'Tax implications of NIL income' },
  { id: 'contract_review', label: 'How to review and negotiate contracts' },
  { id: 'brand_safety', label: 'Protecting my athlete\'s personal brand' },
  { id: 'academic_balance', label: 'Balancing NIL with academics and athletics' },
  { id: 'scam_protection', label: 'Avoiding scams and bad deals' },
  { id: 'social_media', label: 'Managing social media presence' },
  { id: 'agent_selection', label: 'Whether to hire an agent or advisor' },
  { id: 'fair_compensation', label: 'Ensuring fair market value compensation' },
  { id: 'long_term_planning', label: 'Long-term financial planning' },
];

export default function ParentNILConcernsStep({ data, onNext, onBack, isFirst, isLast, isLoading }: OnboardingStepProps) {
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>(
    data?.nil_concerns || []
  );
  const [additionalConcerns, setAdditionalConcerns] = useState<string>(
    data?.additional_concerns || ''
  );
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    data?.primary_goal || ''
  );

  const toggleConcern = (concernId: string) => {
    setSelectedConcerns(prev =>
      prev.includes(concernId)
        ? prev.filter(id => id !== concernId)
        : [...prev, concernId]
    );
  };

  const handleSubmit = () => {
    onNext({
      nil_concerns: selectedConcerns,
      additional_concerns: additionalConcerns.trim() || null,
      primary_goal: primaryGoal || null,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          NIL Concerns & Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Help us understand your concerns so we can provide relevant resources and guidance.
        </p>
      </div>

      {/* NIL Concerns Checkboxes */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          What are your main concerns about NIL? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {NIL_CONCERNS.map(concern => (
            <label
              key={concern.id}
              className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                selectedConcerns.includes(concern.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedConcerns.includes(concern.id)}
                onChange={() => toggleConcern(concern.id)}
                className="mt-0.5 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                {concern.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Primary Goal */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What is your primary goal for your athlete's NIL journey?
        </label>
        <select
          value={primaryGoal}
          onChange={(e) => setPrimaryGoal(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select a goal...</option>
          <option value="education">Learn about NIL opportunities</option>
          <option value="preparation">Prepare for future NIL deals</option>
          <option value="active_deals">Find active NIL opportunities</option>
          <option value="brand_building">Build my athlete's personal brand</option>
          <option value="financial_planning">Financial planning and management</option>
        </select>
      </div>

      {/* Additional Concerns */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Any other concerns or questions? (Optional)
        </label>
        <textarea
          value={additionalConcerns}
          onChange={(e) => setAdditionalConcerns(e.target.value)}
          placeholder="Share any specific questions or concerns you have about NIL..."
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        {!isFirst && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 ${
            isFirst ? 'w-full' : 'flex-1'
          }`}
        >
          {isLoading ? 'Saving...' : isLast ? 'Complete' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
