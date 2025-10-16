'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Sparkles, Tag, Users } from 'lucide-react';
import {
  HOBBIES,
  LIFESTYLE_INTERESTS,
  CAUSES,
  BRAND_AFFINITY_OPTIONS,
  CONTENT_CREATION_INTERESTS,
} from '@/lib/athlete-data';
import { useState } from 'react';

const schema = z.object({
  hobbies: z.array(z.string()),
  lifestyle_interests: z.array(z.string()),
  content_creation_interests: z.array(z.string()),
  brand_affinity: z.array(z.string()).optional(),
  causes_care_about: z.array(z.string()).optional(),
  skip_for_now: z.boolean().default(false),
}).refine((data) => {
  // If skipping, no validation needed
  if (data.skip_for_now) return true;
  // If not skipping, require at least one selection in each required category
  return data.hobbies.length > 0 && data.lifestyle_interests.length > 0 && data.content_creation_interests.length > 0;
}, {
  message: "Please make selections in all required categories or check 'Skip for now'",
});

export type AthleteInterestsData = z.infer<typeof schema>;

interface AthleteInterestsStepProps {
  onNext: (data: AthleteInterestsData) => void;
  onBack?: () => void;
  initialData?: Partial<AthleteInterestsData>;
}

export default function AthleteInterestsStep({
  onNext,
  onBack,
  initialData,
}: AthleteInterestsStepProps) {
  const [activeTab, setActiveTab] = useState<'hobbies' | 'lifestyle' | 'content' | 'brands' | 'causes'>('hobbies');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<AthleteInterestsData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      hobbies: [],
      lifestyle_interests: [],
      content_creation_interests: [],
      brand_affinity: [],
      causes_care_about: [],
      skip_for_now: false,
    },
  });

  const hobbies = watch('hobbies') || [];
  const lifestyleInterests = watch('lifestyle_interests') || [];
  const contentInterests = watch('content_creation_interests') || [];
  const brandAffinity = watch('brand_affinity') || [];
  const causes = watch('causes_care_about') || [];
  const skipForNow = watch('skip_for_now');

  const toggleSelection = (field: keyof AthleteInterestsData, value: string) => {
    const currentValues = watch(field) as string[] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setValue(field, newValues, { shouldValidate: true });
  };

  const tabs = [
    { id: 'hobbies' as const, label: 'Hobbies', icon: Heart, count: hobbies.length, required: true },
    { id: 'lifestyle' as const, label: 'Lifestyle', icon: Sparkles, count: lifestyleInterests.length, required: true },
    { id: 'content' as const, label: 'Content', icon: Users, count: contentInterests.length, required: true },
    { id: 'brands' as const, label: 'Brands', icon: Tag, count: brandAffinity.length, required: false },
    { id: 'causes' as const, label: 'Causes', icon: Heart, count: causes.length, required: false },
  ];

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Interests & Passions</h2>
        <p className="text-gray-600">Help brands find authentic partnership opportunities that match who you are</p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Why this matters</h3>
            <p className="text-sm text-gray-600">
              Brands look for athletes with authentic connections to their products. Your interests help us match you with brands you genuinely care about, leading to more meaningful partnerships.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto pb-px">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasError = tab.required && tab.count === 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-purple-500 text-purple-600'
                    : hasError
                    ? 'border-transparent text-red-500 hover:text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.required && <span className="text-red-500">*</span>}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Hobbies Tab */}
        {activeTab === 'hobbies' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What are your hobbies? <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">Select all that apply (minimum 1 required)</p>
              {errors.hobbies && (
                <p className="text-sm text-red-600 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {errors.hobbies.message}
                </p>
              )}
            </div>

            {/* Group by category */}
            {['creative', 'active', 'tech', 'social', 'lifestyle'].map(category => {
              const categoryHobbies = HOBBIES.filter(h => h.category === category);
              if (categoryHobbies.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 capitalize">{category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categoryHobbies.map(hobby => {
                      const isSelected = hobbies.includes(hobby.value);
                      return (
                        <button
                          key={hobby.value}
                          type="button"
                          onClick={() => toggleSelection('hobbies', hobby.value)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 shadow-md'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{hobby.emoji}</span>
                            <span className={`font-medium text-sm ${
                              isSelected ? 'text-purple-700' : 'text-gray-700'
                            }`}>
                              {hobby.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lifestyle Interests Tab */}
        {activeTab === 'lifestyle' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lifestyle Interests <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">What lifestyle topics are you passionate about? (minimum 1 required)</p>
              {errors.lifestyle_interests && (
                <p className="text-sm text-red-600 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {errors.lifestyle_interests.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LIFESTYLE_INTERESTS.map(interest => {
                const isSelected = lifestyleInterests.includes(interest.value);
                return (
                  <button
                    key={interest.value}
                    type="button"
                    onClick={() => toggleSelection('lifestyle_interests', interest.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{interest.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${
                          isSelected ? 'text-purple-700' : 'text-gray-900'
                        }`}>
                          {interest.label}
                        </p>
                        <p className="text-xs text-gray-500">{interest.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Creation Interests Tab */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Content You Love Creating <span className="text-red-500">*</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">What types of content do you enjoy making? (minimum 1 required)</p>
              {errors.content_creation_interests && (
                <p className="text-sm text-red-600 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  {errors.content_creation_interests.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CONTENT_CREATION_INTERESTS.map(content => {
                const isSelected = contentInterests.includes(content.value);
                return (
                  <button
                    key={content.value}
                    type="button"
                    onClick={() => toggleSelection('content_creation_interests', content.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{content.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${
                          isSelected ? 'text-purple-700' : 'text-gray-900'
                        }`}>
                          {content.label}
                        </p>
                        <p className="text-xs text-gray-500">{content.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Brand Affinity Tab */}
        {activeTab === 'brands' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Brands You Love <span className="text-gray-400 font-normal">(Optional)</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">What brands do you already use and love? This helps match you with authentic partnerships.</p>
            </div>

            {/* Group by category */}
            {['sports', 'tech', 'fashion', 'lifestyle', 'food'].map(category => {
              const categoryBrands = BRAND_AFFINITY_OPTIONS.filter(b => b.category === category);
              if (categoryBrands.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 capitalize">{category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categoryBrands.map(brand => {
                      const isSelected = brandAffinity.includes(brand.value);
                      return (
                        <button
                          key={brand.value}
                          type="button"
                          onClick={() => toggleSelection('brand_affinity', brand.value)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 shadow-md'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                          }`}
                        >
                          <span className={`font-medium text-sm ${
                            isSelected ? 'text-purple-700' : 'text-gray-700'
                          }`}>
                            {brand.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-xs text-gray-600">
                <strong>Tip:</strong> Don't see a brand you love? You can add custom brands later in your profile.
              </p>
            </div>
          </div>
        )}

        {/* Causes Tab */}
        {activeTab === 'causes' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Causes You Care About <span className="text-gray-400 font-normal">(Optional)</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">What social causes or charitable work are important to you?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CAUSES.map(cause => {
                const isSelected = causes.includes(cause.value);
                return (
                  <button
                    key={cause.value}
                    type="button"
                    onClick={() => toggleSelection('causes_care_about', cause.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{cause.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${
                          isSelected ? 'text-purple-700' : 'text-gray-900'
                        }`}>
                          {cause.label}
                        </p>
                        <p className="text-xs text-gray-500">{cause.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-xs text-gray-600">
                <strong>Impact:</strong> Brands increasingly partner with athletes who champion causes aligned with their values. This can lead to purpose-driven partnerships.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 p-6">
        <h3 className="font-medium text-gray-900 mb-3">Your Selection Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <div key={tab.id} className="bg-white rounded-lg p-3 border border-purple-200">
                <Icon className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-600">{tab.count}</p>
                <p className="text-xs text-gray-600">{tab.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skip Option */}
      <div className="bg-yellow-50 rounded-xl border-2 border-yellow-200 p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="skip_for_now"
            {...register('skip_for_now')}
            className="mt-1 w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
          />
          <label htmlFor="skip_for_now" className="flex-1 cursor-pointer">
            <p className="text-sm font-medium text-gray-900">Skip for now</p>
            <p className="text-xs text-gray-600 mt-1">
              You can add your interests later. Note: Completing this helps us match you with relevant brand partnerships.
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
          disabled={!isValid && !skipForNow}
          className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all ${
            isValid || skipForNow
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {skipForNow ? 'Skip for Now' : 'Continue'}
        </button>
      </div>

      {/* Progress Hint */}
      <p className="text-center text-sm text-gray-500">
        Enhanced Step 2 of 4 • Interests & Passions
      </p>
    </form>
  );
}
