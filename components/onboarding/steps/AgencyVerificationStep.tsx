'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  terms_accepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  ready_for_verification: z.boolean().default(false),
});

export type AgencyVerificationData = z.infer<typeof schema>;

interface AgencyVerificationStepProps {
  onNext: (data: AgencyVerificationData) => void;
  onBack?: () => void;
  initialData?: Partial<AgencyVerificationData>;
}

export default function AgencyVerificationStep({
  onNext,
  onBack,
  initialData,
}: AgencyVerificationStepProps) {
  const [showTerms, setShowTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<AgencyVerificationData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      terms_accepted: false,
      ready_for_verification: false,
    },
  });

  const termsAccepted = watch('terms_accepted');

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ShieldCheck className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification</h2>
        <p className="text-gray-600">One last step to get started</p>
      </div>

      {/* Verification Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-2">About Agency Verification</h3>
            <p className="text-sm text-gray-600 mb-3">
              To ensure the safety and trust of our athlete community, all agencies and brands go through a verification process before being able to connect with athletes.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>You can browse athlete profiles while pending verification</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Verification typically takes 1-3 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>You'll receive an email when your verification is complete</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* What We Verify */}
      <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-green-500" />
          What We Verify
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Business Legitimacy</p>
              <p className="text-sm text-gray-600">Verify your company exists and is in good standing</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Contact Information</p>
              <p className="text-sm text-gray-600">Ensure we can reach you for important updates</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Compliance Standards</p>
              <p className="text-sm text-gray-600">Review NIL compliance requirements and best practices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Terms & Conditions</h3>

        {/* Terms Preview */}
        {!showTerms && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-3">
              By creating an agency account, you agree to our terms of service, privacy policy, and NIL partnership guidelines.
            </p>
            <button
              type="button"
              onClick={() => setShowTerms(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Read full terms →
            </button>
          </div>
        )}

        {/* Full Terms (Expandable) */}
        {showTerms && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
            <div className="prose prose-sm max-w-none text-gray-700">
              <h4 className="font-semibold text-gray-900 mb-2">Agency Partnership Terms</h4>

              <h5 className="font-medium text-gray-900 mt-4 mb-2">1. Eligibility</h5>
              <p className="text-sm">
                You represent that you are authorized to enter into partnerships on behalf of your organization and that all information provided is accurate and truthful.
              </p>

              <h5 className="font-medium text-gray-900 mt-4 mb-2">2. NIL Compliance</h5>
              <p className="text-sm">
                All partnerships must comply with NCAA regulations, state NIL laws, and institutional policies. You agree to conduct appropriate due diligence before entering agreements.
              </p>

              <h5 className="font-medium text-gray-900 mt-4 mb-2">3. Prohibited Activities</h5>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Pay-for-play arrangements</li>
                <li>Inducements to transfer or recruit</li>
                <li>Inappropriate or exploitative offers</li>
                <li>Misrepresentation of brand or offers</li>
              </ul>

              <h5 className="font-medium text-gray-900 mt-4 mb-2">4. Data Privacy</h5>
              <p className="text-sm">
                You agree to respect athlete privacy and use contact information only for legitimate NIL partnership discussions. Athlete data may not be shared with third parties.
              </p>

              <h5 className="font-medium text-gray-900 mt-4 mb-2">5. Verification & Suspension</h5>
              <p className="text-sm">
                ChatNIL reserves the right to verify your business information, suspend or terminate accounts, and remove users who violate these terms.
              </p>

              <p className="text-xs text-gray-500 mt-4">
                Last updated: October 15, 2025
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTerms(false)}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Hide terms
            </button>
          </div>
        )}

        {/* Accept Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms_accepted"
            {...register('terms_accepted')}
            className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <label htmlFor="terms_accepted" className="text-sm text-gray-700 cursor-pointer">
            I accept the terms and conditions, and certify that I am authorized to represent my organization in NIL partnerships
            <span className="text-red-500 ml-1">*</span>
          </label>
        </div>
        {errors.terms_accepted && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.terms_accepted.message}
          </p>
        )}
      </div>

      {/* Ready for Verification Checkbox */}
      <div className="bg-green-50 rounded-xl border-2 border-green-100 p-6">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="ready_for_verification"
            {...register('ready_for_verification')}
            className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
          />
          <label htmlFor="ready_for_verification" className="text-sm text-gray-700 cursor-pointer">
            <span className="font-medium">I'm ready to submit my profile for verification</span>
            <p className="text-xs text-gray-600 mt-1">
              Our team will review your information and contact you if additional details are needed.
            </p>
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all ${
            isValid
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {termsAccepted ? 'Complete Setup' : 'Accept & Continue'}
        </button>
      </div>

      {/* Progress Hint */}
      <p className="text-center text-sm text-gray-500">
        Step 4 of 4 • Verification
      </p>
    </form>
  );
}
