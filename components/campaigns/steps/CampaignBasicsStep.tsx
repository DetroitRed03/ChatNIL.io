/**
 * Campaign Basics Step
 * Captures: name, description, campaign type, budget, dates
 */

'use client';

import { useState } from 'react';
import { Rocket, DollarSign, Calendar } from 'lucide-react';
import { CAMPAIGN_TYPES } from '@/lib/agency-data';

interface CampaignBasicsStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

export default function CampaignBasicsStep({ onNext, initialData }: CampaignBasicsStepProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    campaign_type: initialData?.campaign_type || 'social_media',
    total_budget: initialData?.total_budget || 10000,
    budget_per_athlete: initialData?.budget_per_athlete || 2500,
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Campaign name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.total_budget < 1000) newErrors.total_budget = 'Budget must be at least $1,000';
    if (formData.budget_per_athlete < 500) newErrors.budget_per_athlete = 'Budget per athlete must be at least $500';

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end < start) newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Rocket className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Basics</h2>
        <p className="text-gray-600">Give your campaign a name and set your budget</p>
      </div>

      {/* Campaign Name */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Campaign Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium"
          placeholder="e.g., Summer Sports Collection 2024"
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium resize-none"
          placeholder="Describe what this campaign is about..."
        />
        {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
      </div>

      {/* Campaign Type */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Campaign Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAMPAIGN_TYPES.slice(0, 4).map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, campaign_type: type.value })}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                formData.campaign_type === type.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-600 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Total Budget <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData.total_budget}
              onChange={(e) => setFormData({ ...formData, total_budget: parseInt(e.target.value) || 0 })}
              className="w-full pl-10 pr-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-bold"
              min="1000"
              step="1000"
            />
          </div>
          {errors.total_budget && <p className="mt-2 text-sm text-red-600">{errors.total_budget}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Budget Per Athlete <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={formData.budget_per_athlete}
              onChange={(e) => setFormData({ ...formData, budget_per_athlete: parseInt(e.target.value) || 0 })}
              className="w-full pl-10 pr-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-bold"
              min="500"
              step="500"
            />
          </div>
          {errors.budget_per_athlete && <p className="mt-2 text-sm text-red-600">{errors.budget_per_athlete}</p>}
          <p className="mt-2 text-sm text-gray-600">
            Estimated athletes: {Math.floor(formData.total_budget / formData.budget_per_athlete || 0)}
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Start Date (Optional)
          </label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium"
          />
          {errors.end_date && <p className="mt-2 text-sm text-red-600">{errors.end_date}</p>}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
      >
        Continue to Athlete Targeting
      </button>
    </form>
  );
}
