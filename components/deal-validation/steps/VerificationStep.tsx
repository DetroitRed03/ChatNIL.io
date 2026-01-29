'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Upload, FileText, X, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';

export interface VerificationData {
  isSchoolAffiliated: boolean;
  isBoosterConnected: boolean;
  performanceBased: boolean;
  confirmLegitimate: boolean;
  contractFile?: File;
  contractText?: string;
}

interface VerificationStepProps {
  data: VerificationData;
  onUpdate: (field: keyof VerificationData, value: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function VerificationStep({ data, onUpdate, onBack, onSubmit, isLoading }: VerificationStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const isValid = () => {
    // All risk checkboxes must be unchecked (indicating safe deal)
    // AND legitimate confirmation must be checked
    return (
      !data.isSchoolAffiliated &&
      !data.isBoosterConnected &&
      !data.performanceBased &&
      data.confirmLegitimate
    );
  };

  const hasRiskFactors = data.isSchoolAffiliated || data.isBoosterConnected || data.performanceBased;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    onUpdate('contractFile', file);
  };

  const removeFile = () => {
    onUpdate('contractFile', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div data-testid="verification-step" className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Verification</h2>
        <p className="text-gray-600 mt-2">Confirm this is legitimate third-party NIL</p>
      </div>

      {/* Compliance Confirmations */}
      <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 mb-4">Please confirm the following:</h3>

        {/* School Affiliation */}
        <label
          data-testid="school-affiliated-checkbox"
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            data.isSchoolAffiliated
              ? 'border-amber-300 bg-amber-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={!data.isSchoolAffiliated}
            onChange={(e) => onUpdate('isSchoolAffiliated', !e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">This deal is NOT affiliated with my school</p>
              {data.isSchoolAffiliated && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Not from athletic department, university, or school fund
            </p>
            {data.isSchoolAffiliated && (
              <p className="text-sm text-amber-700 mt-2 font-medium">
                Warning: School-affiliated deals require extra disclosure and may have restrictions.
              </p>
            )}
          </div>
        </label>

        {/* Booster Connection */}
        <label
          data-testid="booster-connected-checkbox"
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            data.isBoosterConnected
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={!data.isBoosterConnected}
            onChange={(e) => onUpdate('isBoosterConnected', !e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">This deal is NOT connected to a booster or collective</p>
              {data.isBoosterConnected && <AlertTriangle className="w-4 h-4 text-red-500" />}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Not from alumni donor, booster club, or NIL collective
            </p>
            {data.isBoosterConnected && (
              <div className="mt-2 p-3 bg-red-100 rounded-lg">
                <p className="text-sm text-red-800 font-semibold">
                  ⚠️ HIGH PAY-FOR-PLAY RISK
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Booster-connected deals are the most common NCAA violation. This deal will likely be flagged as non-compliant.
                </p>
              </div>
            )}
          </div>
        </label>

        {/* Performance Based */}
        <label
          data-testid="performance-based-checkbox"
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            data.performanceBased
              ? 'border-red-400 bg-red-100'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={!data.performanceBased}
            onChange={(e) => onUpdate('performanceBased', !e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">Payment is NOT tied to athletic performance</p>
              {data.performanceBased && <AlertTriangle className="w-4 h-4 text-red-600" />}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Not "bonus for touchdowns" or "payment for wins"
            </p>
            {data.performanceBased && (
              <div className="mt-2 p-3 bg-red-200 rounded-lg border border-red-300">
                <p className="text-sm text-red-900 font-bold">
                  🚫 LIKELY ILLEGAL - DO NOT PROCEED
                </p>
                <p className="text-sm text-red-800 mt-1">
                  Performance-based NIL payments are prohibited under NCAA rules. This structure is almost certainly a violation and could result in loss of eligibility.
                </p>
              </div>
            )}
          </div>
        </label>

        {/* Legitimate Confirmation */}
        <label
          data-testid="confirm-legitimate-checkbox"
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            data.confirmLegitimate
              ? 'border-green-300 bg-green-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <input
            type="checkbox"
            checked={data.confirmLegitimate}
            onChange={(e) => onUpdate('confirmLegitimate', e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">I confirm this is legitimate third-party NIL</p>
              {data.confirmLegitimate && <CheckCircle2 className="w-4 h-4 text-green-500" />}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              A real business paying for my name, image, or likeness
            </p>
          </div>
        </label>
      </div>

      {/* Risk Warnings - Contextual */}
      {data.isSchoolAffiliated && !data.isBoosterConnected && !data.performanceBased && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800">School Affiliation Warning</h4>
              <p className="text-sm text-amber-700 mt-1">
                School-affiliated deals require disclosure to your compliance office. You can proceed, but
                make sure to report this deal within the required timeframe.
              </p>
            </div>
          </div>
        </div>
      )}

      {data.isBoosterConnected && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800">⚠️ High Pay-for-Play Risk</h4>
              <p className="text-sm text-red-700 mt-1">
                Booster-connected deals violate NCAA third-party NIL rules. Proceeding could jeopardize
                your eligibility. Consider declining this deal or restructuring it with a legitimate third party.
              </p>
            </div>
          </div>
        </div>
      )}

      {data.performanceBased && (
        <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900">🚫 Performance-Based Pay is Prohibited</h4>
              <p className="text-sm text-red-800 mt-1">
                Paying athletes for athletic performance (wins, stats, playing time) is explicitly banned
                under NCAA rules. This is the clearest form of pay-for-play violation.
              </p>
              <p className="text-sm text-red-800 mt-2 font-semibold">
                We strongly recommend NOT proceeding with this deal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contract Upload */}
      <div data-testid="contract-upload" className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          Upload Contract
          <span className="text-sm font-normal text-gray-400">(Optional but Recommended)</span>
        </h3>

        {data.contractFile ? (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">{data.contractFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(data.contractFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${dragActive
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              Drop your contract here or <span className="text-orange-500">browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supported: PDF, DOC, DOCX (max 10MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
        />

        <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Having a written contract protects you and improves your compliance score.</p>
        </div>
      </div>

      {/* Contract Text Alternative */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or paste contract text <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          value={data.contractText || ''}
          onChange={(e) => onUpdate('contractText', e.target.value)}
          placeholder="Paste the contract text here for compliance scanning..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <button
          data-testid="submit-button"
          onClick={onSubmit}
          disabled={!isValid() && !hasRiskFactors || isLoading}
          className={`
            flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasRiskFactors
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              {hasRiskFactors ? 'Validate Anyway' : 'Validate Deal'}
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
