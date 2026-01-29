'use client';

import { ChevronRight, DollarSign, Calendar, FileText } from 'lucide-react';

export interface DealBasicsData {
  thirdPartyName: string;
  dealType: 'social_post' | 'appearance' | 'endorsement' | 'brand_ambassador' | 'merchandise' | 'other';
  compensation: number | string;
  deliverables: string;
  startDate?: string;
  endDate?: string;
}

interface DealBasicsStepProps {
  data: DealBasicsData;
  onUpdate: (field: keyof DealBasicsData, value: any) => void;
  onNext: () => void;
}

const dealTypeOptions = [
  { value: 'social_post', label: 'Social Media Post' },
  { value: 'appearance', label: 'Personal Appearance' },
  { value: 'endorsement', label: 'Brand Endorsement' },
  { value: 'brand_ambassador', label: 'Brand Ambassador' },
  { value: 'merchandise', label: 'Merchandise/Licensing' },
  { value: 'other', label: 'Other' },
];

export function DealBasicsStep({ data, onUpdate, onNext }: DealBasicsStepProps) {
  const isValid = () => {
    const compensation = typeof data.compensation === 'string'
      ? parseFloat(data.compensation)
      : data.compensation;

    return (
      data.thirdPartyName.trim().length > 0 &&
      data.dealType &&
      compensation > 0 &&
      data.deliverables.trim().length >= 20
    );
  };

  return (
    <div data-testid="deal-basics-step" className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Deal Basics</h2>
        <p className="text-gray-600 mt-2">Tell us about the NIL opportunity</p>
      </div>

      {/* Third Party Name */}
      <div>
        <label htmlFor="thirdPartyName" className="block text-sm font-medium text-gray-700 mb-1">
          Third Party Name <span className="text-red-500">*</span>
        </label>
        <input
          id="thirdPartyName"
          data-testid="third-party-input"
          type="text"
          value={data.thirdPartyName}
          onChange={(e) => onUpdate('thirdPartyName', e.target.value)}
          placeholder="e.g., Nike, Local Auto Dealer, Restaurant"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        />
        <p className="mt-1 text-xs text-gray-500">The company or individual paying you</p>
      </div>

      {/* Deal Type */}
      <div>
        <label htmlFor="dealType" className="block text-sm font-medium text-gray-700 mb-1">
          Deal Type <span className="text-red-500">*</span>
        </label>
        <select
          id="dealType"
          data-testid="deal-type-select"
          value={data.dealType}
          onChange={(e) => onUpdate('dealType', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all bg-white"
        >
          {dealTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Compensation */}
      <div>
        <label htmlFor="compensation" className="block text-sm font-medium text-gray-700 mb-1">
          Compensation Amount <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <DollarSign className="w-5 h-5" />
          </div>
          <input
            id="compensation"
            data-testid="compensation-input"
            type="number"
            value={data.compensation}
            onChange={(e) => onUpdate('compensation', e.target.value)}
            placeholder="5000"
            min="0"
            step="0.01"
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">Total value including cash and products</p>
      </div>

      {/* Deliverables */}
      <div>
        <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700 mb-1">
          Deliverables <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id="deliverables"
            data-testid="deliverables-input"
            value={data.deliverables}
            onChange={(e) => onUpdate('deliverables', e.target.value)}
            placeholder="Describe what you're providing (e.g., 3 Instagram posts, 1 appearance at store opening)"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
          />
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            {data.deliverables.length}/20 min
          </div>
        </div>
        {data.deliverables.length > 0 && data.deliverables.length < 20 && (
          <p className="mt-1 text-xs text-amber-600">
            Please provide more detail (at least 20 characters)
          </p>
        )}
      </div>

      {/* Date Range (Optional) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              id="startDate"
              type="date"
              value={data.startDate || ''}
              onChange={(e) => onUpdate('startDate', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              id="endDate"
              type="date"
              value={data.endDate || ''}
              onChange={(e) => onUpdate('endDate', e.target.value)}
              min={data.startDate}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Next Button */}
      <div className="pt-4">
        <button
          data-testid="next-button"
          onClick={onNext}
          disabled={!isValid()}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
        >
          Continue to Verification
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
