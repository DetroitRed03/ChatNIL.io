'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, FileText, Shield, MapPin, Clock, AlertTriangle } from 'lucide-react';
import {
  DEAL_TYPES,
  CONTENT_TYPES,
  BLACKLIST_CATEGORIES,
  BRAND_SIZES,
  PARTNERSHIP_LENGTHS,
  NEGOTIATION_FLEXIBILITY,
  USAGE_RIGHTS,
} from '@/lib/athlete-data';
import { useState } from 'react';

const schema = z.object({
  nil_preferences: z.object({
    // Deal preferences
    preferred_deal_types: z.array(z.string()).min(1, 'Select at least one deal type'),
    min_compensation: z.number().min(0, 'Must be positive').optional(),
    max_compensation: z.number().min(0, 'Must be positive').optional(),
    preferred_partnership_length: z.string().optional(),

    // Content preferences
    content_types_willing: z.array(z.string()).min(1, 'Select at least one content type'),

    // Restrictions
    blacklist_categories: z.array(z.string()).optional(),

    // Brand preferences
    preferred_brand_sizes: z.array(z.string()).optional(),

    // Flexibility
    negotiation_flexibility: z.enum(['firm', 'somewhat_flexible', 'very_flexible']).optional(),

    // Approvals
    requires_agent_approval: z.boolean().default(false),
    requires_parent_approval: z.boolean().default(false),

    // Additional terms
    exclusivity_willing: z.boolean().default(false),
    usage_rights_consideration: z.enum(['limited', 'standard', 'extended', 'perpetual']).optional(),
    travel_willing: z.boolean().default(false),
    max_travel_distance_miles: z.number().min(0).max(10000).optional(),
    typical_response_time_hours: z.number().min(1).max(168).optional(),

    // Notes
    additional_notes: z.string().max(500).optional(),
  }),
});

export type AthleteNILPreferencesData = z.infer<typeof schema>;

interface AthleteNILPreferencesStepProps {
  onNext: (data: AthleteNILPreferencesData) => void;
  onBack?: () => void;
  initialData?: Partial<AthleteNILPreferencesData>;
}

export default function AthleteNILPreferencesStep({
  onNext,
  onBack,
  initialData,
}: AthleteNILPreferencesStepProps) {
  const [activeSection, setActiveSection] = useState<'deals' | 'content' | 'restrictions' | 'terms'>('deals');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<AthleteNILPreferencesData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      nil_preferences: {
        preferred_deal_types: [],
        content_types_willing: [],
        blacklist_categories: [],
        preferred_brand_sizes: [],
        requires_agent_approval: false,
        requires_parent_approval: false,
        exclusivity_willing: false,
        travel_willing: false,
      },
    },
  });

  const preferences = watch('nil_preferences');

  const toggleArrayValue = (field: string, value: string) => {
    const currentValues = (preferences[field as keyof typeof preferences] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];
    setValue(`nil_preferences.${field}` as any, newValues, { shouldValidate: true });
  };

  const sections = [
    { id: 'deals' as const, label: 'Deal Types', icon: DollarSign, required: true },
    { id: 'content' as const, label: 'Content', icon: FileText, required: true },
    { id: 'restrictions' as const, label: 'Restrictions', icon: Shield, required: false },
    { id: 'terms' as const, label: 'Terms', icon: Clock, required: false },
  ];

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <DollarSign className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">NIL Partnership Preferences</h2>
        <p className="text-gray-600">Set your preferences for brand partnerships and deals</p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-start gap-3">
          <Shield className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Smart Matching</h3>
            <p className="text-sm text-gray-600">
              Your preferences help us filter partnership opportunities to only show deals that match your interests, budget expectations, and boundaries. You can always update these later.
            </p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-px">
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
                {section.required && <span className="text-red-500">*</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Content */}
      <div className="min-h-[500px]">
        {/* Deal Types Section */}
        {activeSection === 'deals' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Deal Types You're Interested In <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">What types of NIL partnerships would you like to explore?</p>
              {errors.nil_preferences?.preferred_deal_types && (
                <p className="text-sm text-red-600 mb-3">{errors.nil_preferences.preferred_deal_types.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEAL_TYPES.map(deal => {
                const isSelected = preferences.preferred_deal_types?.includes(deal.value);
                return (
                  <button
                    key={deal.value}
                    type="button"
                    onClick={() => toggleArrayValue('preferred_deal_types', deal.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{deal.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                          {deal.label}
                        </p>
                        <p className="text-xs text-gray-500">{deal.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Compensation Range */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                Compensation Range (Optional)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Compensation (USD)
                  </label>
                  <input
                    type="number"
                    {...register('nil_preferences.min_compensation', { valueAsNumber: true })}
                    placeholder="e.g., 500"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lowest deal value you'll consider</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Compensation (USD)
                  </label>
                  <input
                    type="number"
                    {...register('nil_preferences.max_compensation', { valueAsNumber: true })}
                    placeholder="e.g., 10000"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your target deal ceiling</p>
                </div>
              </div>
            </div>

            {/* Partnership Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Partnership Length
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PARTNERSHIP_LENGTHS.map(length => {
                  const isSelected = preferences.preferred_partnership_length === length.value;
                  return (
                    <button
                      key={length.value}
                      type="button"
                      onClick={() => setValue('nil_preferences.preferred_partnership_length', length.value, { shouldValidate: true })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <p className={`font-medium text-sm mb-1 ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                        {length.label}
                      </p>
                      <p className="text-xs text-gray-500">{length.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Size Preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Brand Sizes (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BRAND_SIZES.map(size => {
                  const isSelected = preferences.preferred_brand_sizes?.includes(size.value);
                  return (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => toggleArrayValue('preferred_brand_sizes', size.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <span className="text-xl mb-1 block">{size.emoji}</span>
                      <p className={`font-medium text-xs ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                        {size.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        {activeSection === 'content' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Content Types You're Willing to Create <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">Select all content formats you're comfortable creating for brand partnerships</p>
              {errors.nil_preferences?.content_types_willing && (
                <p className="text-sm text-red-600 mb-3">{errors.nil_preferences.content_types_willing.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONTENT_TYPES.map(content => {
                const isSelected = preferences.content_types_willing?.includes(content.value);
                return (
                  <button
                    key={content.value}
                    type="button"
                    onClick={() => toggleArrayValue('content_types_willing', content.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{content.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-medium ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                          {content.label}
                        </p>
                        <p className="text-xs text-gray-500">{content.platform}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Usage Rights */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-3">Usage Rights Consideration</h4>
              <p className="text-sm text-gray-600 mb-4">How long should brands be able to use your content?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {USAGE_RIGHTS.map(right => {
                  const isSelected = preferences.usage_rights_consideration === right.value;
                  return (
                    <button
                      key={right.value}
                      type="button"
                      onClick={() => setValue('nil_preferences.usage_rights_consideration', right.value as any, { shouldValidate: true })}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <p className={`font-medium text-sm mb-1 ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                        {right.label}
                      </p>
                      <p className="text-xs text-gray-500">{right.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Restrictions Section */}
        {activeSection === 'restrictions' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Categories to Avoid
              </h3>
              <p className="text-sm text-gray-600 mb-4">Select any brand categories you prefer not to work with</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BLACKLIST_CATEGORIES.map(category => {
                const isSelected = preferences.blacklist_categories?.includes(category.value);
                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => toggleArrayValue('blacklist_categories', category.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50 shadow-md'
                        : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{category.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${isSelected ? 'text-red-700' : 'text-gray-900'}`}>
                          {category.label}
                        </p>
                        <p className="text-xs text-gray-500">{category.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">NCAA Compliance Note</p>
                  <p className="text-xs text-gray-600">
                    Some categories may be restricted by your school's NIL policies or NCAA regulations. Always verify with your compliance office before accepting deals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Terms Section */}
        {activeSection === 'terms' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Additional Terms & Preferences</h3>
              <p className="text-sm text-gray-600 mb-4">Set additional preferences for your partnerships</p>
            </div>

            {/* Negotiation Flexibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Negotiation Flexibility
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {NEGOTIATION_FLEXIBILITY.map(flex => {
                  const isSelected = preferences.negotiation_flexibility === flex.value;
                  return (
                    <button
                      key={flex.value}
                      type="button"
                      onClick={() => setValue('nil_preferences.negotiation_flexibility', flex.value, { shouldValidate: true })}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{flex.emoji}</span>
                      <p className={`font-medium text-sm mb-1 ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                        {flex.label}
                      </p>
                      <p className="text-xs text-gray-500">{flex.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Approval Requirements */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
              <h4 className="font-medium text-gray-900">Approval Requirements</h4>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="requires_parent_approval"
                  {...register('nil_preferences.requires_parent_approval')}
                  className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="requires_parent_approval" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium text-gray-900">Requires Parent/Guardian Approval</p>
                  <p className="text-xs text-gray-500 mt-0.5">All deals must be approved by parent or guardian before acceptance</p>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="requires_agent_approval"
                  {...register('nil_preferences.requires_agent_approval')}
                  className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="requires_agent_approval" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium text-gray-900">Requires Agent Approval</p>
                  <p className="text-xs text-gray-500 mt-0.5">All deals must be reviewed by my agent or representative</p>
                </label>
              </div>
            </div>

            {/* Other Preferences */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
              <h4 className="font-medium text-gray-900">Other Preferences</h4>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="exclusivity_willing"
                  {...register('nil_preferences.exclusivity_willing')}
                  className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="exclusivity_willing" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium text-gray-900">Open to Exclusivity Deals</p>
                  <p className="text-xs text-gray-500 mt-0.5">Willing to exclusively represent a brand in their category</p>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="travel_willing"
                  {...register('nil_preferences.travel_willing')}
                  className="mt-1 w-5 h-5 text-green-500 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="travel_willing" className="flex-1 cursor-pointer">
                  <p className="text-sm font-medium text-gray-900">Willing to Travel for Events</p>
                  <p className="text-xs text-gray-500 mt-0.5">Open to traveling for brand appearances and events</p>
                </label>
              </div>

              {preferences.travel_willing && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Travel Distance (miles)
                  </label>
                  <input
                    type="number"
                    {...register('nil_preferences.max_travel_distance_miles', { valueAsNumber: true })}
                    placeholder="e.g., 500"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Response Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typical Response Time (hours)
              </label>
              <input
                type="number"
                {...register('nil_preferences.typical_response_time_hours', { valueAsNumber: true })}
                placeholder="e.g., 24"
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">How quickly you typically respond to partnership inquiries</p>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                {...register('nil_preferences.additional_notes')}
                rows={4}
                placeholder="Any other preferences or requirements for brand partnerships..."
                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">0/500 characters</p>
            </div>
          </div>
        )}
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
          Continue
        </button>
      </div>

      {/* Progress Hint */}
      <p className="text-center text-sm text-gray-500">
        Enhanced Step 3 of 4 • NIL Preferences
      </p>
    </form>
  );
}
