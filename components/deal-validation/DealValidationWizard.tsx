'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ComplianceResult } from '@/lib/compliance/types';
import { WizardProgress } from './WizardProgress';
import { DealBasicsStep, DealBasicsData } from './steps/DealBasicsStep';
import { VerificationStep, VerificationData } from './steps/VerificationStep';
import { ResultsStep } from './steps/ResultsStep';

interface WizardState {
  currentStep: 1 | 2 | 3;
  dealData: DealBasicsData & VerificationData;
  result: ComplianceResult | null;
  isLoading: boolean;
  isSaving: boolean;
  isSaved: boolean;
  error: string | null;
}

interface ResubmissionContext {
  originalDealId: string;
  originalDealName: string;
  rejectionReason?: string;
  rejectedAt?: string;
}

interface DealValidationWizardProps {
  athleteId: string;
  athleteState: string;
  onComplete?: () => void;
  onClose?: () => void;
  isModal?: boolean;
  initialData?: Partial<WizardState['dealData']>;
  resubmission?: ResubmissionContext;
}

const initialDealData: WizardState['dealData'] = {
  thirdPartyName: '',
  dealType: 'social_post',
  compensation: '',
  deliverables: '',
  startDate: '',
  endDate: '',
  isSchoolAffiliated: false,
  isBoosterConnected: false,
  performanceBased: false,
  confirmLegitimate: false,
  contractFile: undefined,
  contractText: '',
};

export function DealValidationWizard({
  athleteId,
  athleteState,
  onComplete,
  onClose,
  isModal = false,
  initialData,
  resubmission,
}: DealValidationWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    dealData: initialData ? { ...initialDealData, ...initialData } : initialDealData,
    result: null,
    isLoading: false,
    isSaving: false,
    isSaved: false,
    error: null,
  });

  const updateDealData = (field: keyof WizardState['dealData'], value: any) => {
    setState((prev) => ({
      ...prev,
      dealData: { ...prev.dealData, [field]: value },
    }));
  };

  const handleNext = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 3) as 1 | 2 | 3,
    }));
  };

  const handleBack = () => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1) as 1 | 2 | 3,
    }));
  };

  const handleValidate = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const compensation = typeof state.dealData.compensation === 'string'
        ? parseFloat(state.dealData.compensation)
        : state.dealData.compensation;

      const response = await fetch('/api/deals/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          athleteId,
          thirdPartyName: state.dealData.thirdPartyName,
          thirdPartyType: 'unknown', // Will be inferred
          dealType: state.dealData.dealType,
          compensation,
          deliverables: state.dealData.deliverables,
          contractText: state.dealData.contractText,
          state: athleteState,
          startDate: state.dealData.startDate,
          endDate: state.dealData.endDate,
          isSchoolAffiliated: state.dealData.isSchoolAffiliated,
          isBoosterConnected: state.dealData.isBoosterConnected,
          performanceBased: state.dealData.performanceBased,
        }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const result = await response.json();
      setState((prev) => ({
        ...prev,
        result,
        currentStep: 3,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Validation error:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to validate deal. Please try again.',
        isLoading: false,
      }));
    }
  };

  const handleSave = async () => {
    if (!state.result) return;

    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const compensation = typeof state.dealData.compensation === 'string'
        ? parseFloat(state.dealData.compensation)
        : state.dealData.compensation;

      const response = await fetch('/api/deals/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          thirdPartyName: state.dealData.thirdPartyName,
          thirdPartyType: 'unknown',
          dealType: state.dealData.dealType,
          compensation,
          deliverables: state.dealData.deliverables,
          contractText: state.dealData.contractText,
          state: athleteState,
          isSchoolAffiliated: state.dealData.isSchoolAffiliated,
          isBoosterConnected: state.dealData.isBoosterConnected,
          performanceBased: state.dealData.performanceBased,
          complianceScore: state.result,
          resubmittedFromDealId: resubmission?.originalDealId || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save deal');
      }

      setState((prev) => ({ ...prev, isSaved: true, isSaving: false }));

      // Wait a moment then complete
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      setState((prev) => ({
        ...prev,
        error: 'Failed to save deal. Please try again.',
        isSaving: false,
      }));
    }
  };

  const handleStartOver = () => {
    setState({
      currentStep: 1,
      dealData: initialDealData,
      result: null,
      isLoading: false,
      isSaving: false,
      isSaved: false,
      error: null,
    });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div
      data-testid="deal-validation-wizard"
      className={`
        w-full max-w-2xl mx-auto
        ${isModal ? '' : 'min-h-screen py-8'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {!isModal && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {resubmission ? 'Modify & Resubmit Deal' : 'Validate Deal'}
              </h1>
              <p className="text-sm text-gray-500">
                {resubmission
                  ? 'Update the deal details and submit for review again'
                  : 'Check compliance before signing'}
              </p>
            </div>
          </div>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="mb-8">
        <WizardProgress currentStep={state.currentStep} />
      </div>

      {/* Resubmission Context Banner */}
      {resubmission && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-800">
                Resubmitting: {resubmission.originalDealName}
              </h3>
              <p className="text-sm text-red-700 mt-1 font-medium">Rejection Reason:</p>
              <p className="text-sm text-red-600 mt-1 p-2 bg-white/60 rounded-lg border border-red-200">
                &ldquo;{resubmission.rejectionReason || 'No specific reason provided'}&rdquo;
              </p>
              {resubmission.rejectedAt && (
                <p className="text-xs text-red-500 mt-2">
                  Rejected on {new Date(resubmission.rejectedAt).toLocaleDateString()}
                </p>
              )}
              <p className="text-xs text-red-500 mt-1">
                Please address this feedback before resubmitting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {state.currentStep === 1 && (
              <DealBasicsStep
                data={state.dealData}
                onUpdate={updateDealData}
                onNext={handleNext}
              />
            )}

            {state.currentStep === 2 && (
              <VerificationStep
                data={state.dealData}
                onUpdate={updateDealData}
                onBack={handleBack}
                onSubmit={handleValidate}
                isLoading={state.isLoading}
              />
            )}

            {state.currentStep === 3 && state.result && (
              <ResultsStep
                result={state.result}
                onSave={handleSave}
                onStartOver={handleStartOver}
                isSaving={state.isSaving}
                isSaved={state.isSaved}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
