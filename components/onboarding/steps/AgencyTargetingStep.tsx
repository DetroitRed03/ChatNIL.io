'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, MapPin, DollarSign, Megaphone } from 'lucide-react';
import { BUDGET_RANGES, CAMPAIGN_TYPES, US_REGIONS, US_STATES, AGE_RANGES, GENDER_OPTIONS } from '@/lib/agency-data';
import { useState } from 'react';

const schema = z.object({
  budget_range: z.string().min(1, 'Please select a budget range'),
  campaign_interests: z.array(z.string()).min(1, 'Select at least one campaign type'),
  geographic_focus: z.array(z.string()).min(1, 'Select at least one geographic area'),
  target_demographics: z.object({
    age_range: z.string().optional(),
    gender: z.array(z.string()).optional(),
  }),
});

export type AgencyTargetingData = z.infer<typeof schema>;

interface AgencyTargetingStepProps {
  onNext: (data: AgencyTargetingData) => void;
  onBack?: () => void;
  initialData?: Partial<AgencyTargetingData>;
}

export default function AgencyTargetingStep({
  onNext,
  onBack,
  initialData,
}: AgencyTargetingStepProps) {
  const [showStateSelector, setShowStateSelector] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<AgencyTargetingData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      budget_range: '',
      campaign_interests: [],
      geographic_focus: [],
      target_demographics: {
        age_range: '',
        gender: [],
      },
    },
  });

  const campaignInterests = watch('campaign_interests');
  const geographicFocus = watch('geographic_focus');
  const targetGender = watch('target_demographics.gender');

  const toggleCampaignInterest = (value: string) => {
    const current = campaignInterests || [];
    if (current.includes(value)) {
      setValue('campaign_interests', current.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue('campaign_interests', [...current, value], { shouldValidate: true });
    }
  };

  const toggleGeographic = (value: string) => {
    const current = geographicFocus || [];
    if (current.includes(value)) {
      setValue('geographic_focus', current.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue('geographic_focus', [...current, value], { shouldValidate: true });
    }
  };

  const toggleGender = (value: string) => {
    const current = targetGender || [];
    if (current.includes(value)) {
      setValue('target_demographics.gender', current.filter(v => v !== value));
    } else {
      setValue('target_demographics.gender', [...current, value]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Target className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Targeting</h2>
        <p className="text-gray-600">Define your ideal partnerships and audience</p>
      </div>

      {/* Budget Range */}
      <div>
        <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700 mb-2">
          Budget Range <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="budget_range"
            {...register('budget_range')}
            className={`block w-full pl-10 pr-3 py-3 border ${
              errors.budget_range ? 'border-red-300' : 'border-gray-300'
            } rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors appearance-none bg-white`}
          >
            <option value="">Select budget range...</option>
            {BUDGET_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label} - {range.description}
              </option>
            ))}
          </select>
        </div>
        {errors.budget_range && (
          <p className="mt-1 text-sm text-red-600">{errors.budget_range.message}</p>
        )}
      </div>

      {/* Campaign Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Campaign Interests <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAMPAIGN_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => toggleCampaignInterest(type.value)}
              className={`p-4 border-2 rounded-xl text-left transition-all ${
                campaignInterests?.includes(type.value)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                  campaignInterests?.includes(type.value)
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-300'
                }`}>
                  {campaignInterests?.includes(type.value) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.campaign_interests && (
          <p className="mt-2 text-sm text-red-600">{errors.campaign_interests.message}</p>
        )}
      </div>

      {/* Geographic Focus */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Geographic Focus <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {/* Regions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {US_REGIONS.map((region) => (
              <button
                key={region.value}
                type="button"
                onClick={() => toggleGeographic(region.value)}
                className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                  geographicFocus?.includes(region.value)
                    ? 'border-purple-500 bg-purple-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {region.label}
              </button>
            ))}
          </div>

          {/* State Selector Toggle */}
          <button
            type="button"
            onClick={() => setShowStateSelector(!showStateSelector)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            {showStateSelector ? 'Hide' : 'Select specific states'}
          </button>

          {/* States Grid */}
          {showStateSelector && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
              {US_STATES.map((state) => (
                <button
                  key={state.value}
                  type="button"
                  onClick={() => toggleGeographic(state.value)}
                  className={`px-2 py-1.5 border rounded text-xs font-medium transition-all ${
                    geographicFocus?.includes(state.value)
                      ? 'border-purple-500 bg-purple-500 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                  }`}
                >
                  {state.value}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.geographic_focus && (
          <p className="mt-2 text-sm text-red-600">{errors.geographic_focus.message}</p>
        )}
      </div>

      {/* Target Demographics (Optional) */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-purple-500" />
          Target Audience <span className="text-gray-400 font-normal text-sm">(Optional)</span>
        </h3>

        {/* Age Range */}
        <div>
          <label htmlFor="age_range" className="block text-sm font-medium text-gray-700 mb-2">
            Age Range
          </label>
          <select
            id="age_range"
            {...register('target_demographics.age_range')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="">All ages</option>
            {AGE_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleGender(option.value)}
                className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                  targetGender?.includes(option.value)
                    ? 'border-purple-500 bg-purple-500 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
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
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>

      {/* Progress Hint */}
      <p className="text-center text-sm text-gray-500">
        Step 2 of 4 • Campaign Targeting
      </p>
    </form>
  );
}
