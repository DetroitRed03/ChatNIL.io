'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Shield, AlertTriangle, Loader2, CheckCircle, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ValidateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidationComplete: () => void;
  athleteId: string;
  athleteState: string;
}

interface DealFormData {
  thirdPartyName: string;
  thirdPartyType: 'brand' | 'agency' | 'local_business' | 'individual' | 'unknown';
  dealType: 'social_post' | 'appearance' | 'endorsement' | 'brand_ambassador' | 'merchandise' | 'other';
  compensation: string;
  deliverables: string;
  contractText: string;
  isSchoolAffiliated: boolean;
  isBoosterConnected: boolean;
  performanceBased: boolean;
}

interface DimensionResult {
  score: number;
  weightedScore: number;
  weight: number;
  notes: string;
  reasonCodes: string[];
  recommendations: string[];
}

interface ValidationResult {
  totalScore: number;
  status: 'green' | 'yellow' | 'red';
  payForPlayRisk: 'low' | 'medium' | 'high';
  dimensions: {
    policyFit: DimensionResult;
    documentHygiene: DimensionResult;
    fmvVerification: DimensionResult;
    taxReadiness: DimensionResult;
    brandSafety: DimensionResult;
    guardianConsent: DimensionResult;
  };
  overallRecommendations: string[];
  overallReasonCodes: string[];
}

const STEPS = ['Deal Info', 'Compliance', 'Documents', 'Results'];

const dealTypes = [
  { value: 'social_post', label: 'Social Media Post' },
  { value: 'appearance', label: 'Personal Appearance' },
  { value: 'endorsement', label: 'Brand Endorsement' },
  { value: 'brand_ambassador', label: 'Brand Ambassador' },
  { value: 'merchandise', label: 'Merchandise/Licensing' },
  { value: 'other', label: 'Other' },
];

const thirdPartyTypes = [
  { value: 'brand', label: 'Established Brand' },
  { value: 'agency', label: 'Agency/Collective' },
  { value: 'local_business', label: 'Local Business' },
  { value: 'individual', label: 'Individual' },
  { value: 'unknown', label: 'Unknown/Other' },
];

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
}

export function ValidateDealModal({
  isOpen,
  onClose,
  onValidationComplete,
  athleteId,
  athleteState,
}: ValidateDealModalProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [formData, setFormData] = useState<DealFormData>({
    thirdPartyName: '',
    thirdPartyType: 'brand',
    dealType: 'social_post',
    compensation: '',
    deliverables: '',
    contractText: '',
    isSchoolAffiliated: false,
    isBoosterConnected: false,
    performanceBased: false,
  });

  const handleClose = () => {
    setStep(0);
    setResult(null);
    setSaved(false);
    setFormData({
      thirdPartyName: '',
      thirdPartyType: 'brand',
      dealType: 'social_post',
      compensation: '',
      deliverables: '',
      contractText: '',
      isSchoolAffiliated: false,
      isBoosterConnected: false,
      performanceBased: false,
    });
    onClose();
  };

  const handleSaveDeal = async () => {
    if (!result) return;

    setSaving(true);
    try {
      // Get access token for API auth
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/deals/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          thirdPartyName: formData.thirdPartyName,
          thirdPartyType: formData.thirdPartyType,
          dealType: formData.dealType,
          compensation: parseFloat(formData.compensation) || 0,
          deliverables: formData.deliverables,
          contractText: formData.contractText,
          state: athleteState,
          isSchoolAffiliated: formData.isSchoolAffiliated,
          isBoosterConnected: formData.isBoosterConnected,
          performanceBased: formData.performanceBased,
          complianceScore: result,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save deal');
      }

      setSaved(true);
      // Wait a moment to show success state, then complete
      setTimeout(() => {
        onValidationComplete();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save deal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    setLoading(true);
    try {
      // Get access token for API auth
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/deals/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          athleteId,
          thirdPartyName: formData.thirdPartyName,
          thirdPartyType: formData.thirdPartyType,
          dealType: formData.dealType,
          compensation: parseFloat(formData.compensation) || 0,
          deliverables: formData.deliverables,
          contractText: formData.contractText,
          state: athleteState,
          isSchoolAffiliated: formData.isSchoolAffiliated,
          isBoosterConnected: formData.isBoosterConnected,
          performanceBased: formData.performanceBased,
        }),
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const data = await response.json();
      setResult(data);
      setStep(3);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 0) {
      return formData.thirdPartyName && formData.compensation && parseFloat(formData.compensation) > 0;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Validate Deal</h2>
                <p className="text-sm text-gray-500">Step {step + 1} of {STEPS.length}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-4">
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${i < step ? 'bg-green-500 text-white' :
                        i === step ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-500'}`}
                  >
                    {i < step ? '✓' : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 rounded ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {STEPS.map((s) => (
                <span key={s} className="text-xs text-gray-500">{s}</span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand/Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.thirdPartyName}
                    onChange={(e) => setFormData({ ...formData, thirdPartyName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="e.g., Nike, Local Gym, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Third Party Type
                  </label>
                  <select
                    value={formData.thirdPartyType}
                    onChange={(e) => setFormData({ ...formData, thirdPartyType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {thirdPartyTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deal Type
                  </label>
                  <select
                    value={formData.dealType}
                    onChange={(e) => setFormData({ ...formData, dealType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {dealTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compensation Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.compensation}
                      onChange={(e) => setFormData({ ...formData, compensation: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deliverables Description
                  </label>
                  <textarea
                    value={formData.deliverables}
                    onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe what you'll deliver (e.g., 2 Instagram posts, 1 appearance event...)"
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Answer these questions to check for compliance issues:
                </p>

                <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSchoolAffiliated}
                    onChange={(e) => setFormData({ ...formData, isSchoolAffiliated: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Is this deal affiliated with your school?</p>
                    <p className="text-sm text-gray-500">
                      The brand has connections to your university or athletic program
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBoosterConnected}
                    onChange={(e) => setFormData({ ...formData, isBoosterConnected: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">Is this connected to a booster?</p>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <p className="text-sm text-red-600">
                      Warning: Booster-connected deals are high-risk for pay-for-play violations
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border border-yellow-200 rounded-lg hover:bg-yellow-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.performanceBased}
                    onChange={(e) => setFormData({ ...formData, performanceBased: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">Is compensation tied to athletic performance?</p>
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    </div>
                    <p className="text-sm text-yellow-700">
                      Bonuses for wins, stats, or playing time are prohibited
                    </p>
                  </div>
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Optionally paste the contract text to check for prohibited terms:
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Text (Optional)
                  </label>
                  <textarea
                    value={formData.contractText}
                    onChange={(e) => setFormData({ ...formData, contractText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                    rows={10}
                    placeholder="Paste the contract text here for compliance scanning..."
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Including the contract text helps detect prohibited terms like
                    enrollment requirements, perpetual rights, or performance bonuses.
                  </p>
                </div>
              </div>
            )}

            {step === 3 && result && (
              <div className="space-y-6">
                {/* Score Summary */}
                <div className={`p-6 rounded-xl ${getScoreBg(result.totalScore)} text-center`}>
                  <p className="text-sm text-gray-600 mb-1">Compliance Score</p>
                  <p className={`text-5xl font-bold ${getScoreColor(result.totalScore)}`}>
                    {result.totalScore}/100
                  </p>
                  <p className="text-lg font-medium mt-2">
                    {result.status === 'green' ? '🟢 Compliant' :
                     result.status === 'yellow' ? '🟡 Review Required' :
                     '🔴 Issues Detected'}
                  </p>
                  {result.payForPlayRisk !== 'low' && (
                    <div className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm
                      ${result.payForPlayRisk === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                      <AlertTriangle className="w-4 h-4" />
                      Pay-for-Play Risk: {result.payForPlayRisk}
                    </div>
                  )}
                </div>

                {/* Dimension Breakdown */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Score Breakdown</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(result.dimensions).map(([key, dim]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className={`text-lg font-bold ${getScoreColor(dim.score)}`}>{dim.score}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {result.overallRecommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {result.overallRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-orange-500 mt-0.5">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => step === 3 ? handleClose() : setStep(Math.max(0, step - 1))}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              {step > 0 && step < 3 && <ChevronLeft className="w-4 h-4" />}
              {step === 3 ? 'Close' : step === 0 ? 'Cancel' : 'Back'}
            </button>

            {step < 3 && (
              <button
                onClick={() => {
                  if (step === 2) {
                    handleValidate();
                  } else {
                    setStep(step + 1);
                  }
                }}
                disabled={!canProceed() || loading}
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    {step === 2 ? 'Validate Deal' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {step === 3 && result && !saved && (result.status === 'green' || result.status === 'yellow') && (
              <button
                onClick={handleSaveDeal}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-colors
                  ${result.status === 'green'
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'}
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {result.status === 'green' ? 'Save Deal' : 'Save Anyway'}
                  </>
                )}
              </button>
            )}

            {step === 3 && saved && (
              <div className="flex items-center gap-2 px-6 py-2 bg-green-100 text-green-700 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                Deal Saved!
              </div>
            )}

            {step === 3 && result && result.status === 'red' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4" />
                Cannot save - address issues first
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
