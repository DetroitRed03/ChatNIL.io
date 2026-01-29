'use client';

import { useState } from 'react';
import { MoneyDisplay } from '../shared/MoneyDisplay';

interface SubmissionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deal: {
    id: string;
    brandName: string;
    brandLogo?: string;
    value: number;
    dealType: string;
    overallScore: number;
  };
  school: {
    name: string;
    complianceEmail?: string;
  };
}

export function SubmissionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  deal,
  school
}: SubmissionConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [step, setStep] = useState<'confirm' | 'submitting' | 'success'>('confirm');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!agreedToTerms) return;

    setIsSubmitting(true);
    setStep('submitting');

    try {
      await onConfirm();
      setStep('success');
    } catch (error) {
      console.error('Submission failed:', error);
      setStep('confirm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setAgreedToTerms(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {step === 'confirm' && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Report This Deal</h2>
                  <p className="text-sm text-white/80">Send to your compliance office</p>
                </div>
              </div>
            </div>

            {/* Deal Summary */}
            <div className="p-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                  {deal.brandLogo ? (
                    <img src={deal.brandLogo} alt={deal.brandName} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-lg font-bold text-gray-500">
                      {deal.brandName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-900">{deal.brandName}</h3>
                  <p className="text-sm text-gray-500">{deal.dealType}</p>
                </div>
                <MoneyDisplay amount={deal.value} size="lg" />
              </div>

              {/* What Happens Next */}
              <div className="space-y-3 mb-6">
                <h4 className="font-medium text-gray-900">What happens next?</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      We'll send your deal info to <span className="font-medium">{school.name}</span>'s compliance office
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      They'll review it (usually within 1-3 business days)
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You'll get notified when it's approved or if they need anything else
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm text-gray-600">
                  I confirm that the deal information is accurate and I want to report it to my school's compliance office
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!agreedToTerms}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  agreedToTerms
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Report Deal
              </button>
            </div>
          </>
        )}

        {step === 'submitting' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
              <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sending to {school.name}...
            </h3>
            <p className="text-sm text-gray-500">This will only take a moment</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Deal Reported Successfully!
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {school.name}'s compliance team has been notified. You'll hear back within 1-3 business days.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
