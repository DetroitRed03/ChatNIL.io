/**
 * Campaign Review Step
 * Final review before submission
 */

'use client';

import { Check, Loader2 } from 'lucide-react';

interface CampaignReviewStepProps {
  campaignData: any;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function CampaignReviewStep({ campaignData, onBack, onSubmit, isSubmitting }: CampaignReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Create</h2>
        <p className="text-gray-600">Review your campaign details before creating</p>
      </div>

      {/* Campaign Summary */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border-2 border-orange-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{campaignData.name || 'Untitled Campaign'}</h3>
        <p className="text-gray-700 mb-6">{campaignData.description || 'No description'}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 font-semibold">Campaign Type:</span>
            <p className="text-gray-900 font-bold mt-1">{campaignData.campaign_type || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Total Budget:</span>
            <p className="text-gray-900 font-bold mt-1">${(campaignData.total_budget || 0).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Budget Per Athlete:</span>
            <p className="text-gray-900 font-bold mt-1">${(campaignData.budget_per_athlete || 0).toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-600 font-semibold">Est. Athletes:</span>
            <p className="text-gray-900 font-bold mt-1">
              {Math.floor((campaignData.total_budget || 0) / (campaignData.budget_per_athlete || 1))}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Campaign...
            </>
          ) : (
            <>
              <Check className="w-5 h-5" />
              Create Campaign
            </>
          )}
        </button>
      </div>
    </div>
  );
}
