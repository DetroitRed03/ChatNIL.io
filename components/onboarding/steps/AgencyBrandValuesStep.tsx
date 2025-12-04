'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Sparkles } from 'lucide-react';
import { BRAND_VALUES } from '@/lib/agency-data';

const schema = z.object({
  brand_values: z.array(z.string()).min(1, 'Select at least one brand value'),
});

export type AgencyBrandValuesData = z.infer<typeof schema>;

interface AgencyBrandValuesStepProps {
  onNext: (data: AgencyBrandValuesData) => void;
  onBack?: () => void;
  initialData?: Partial<AgencyBrandValuesData>;
}

export default function AgencyBrandValuesStep({
  onNext,
  onBack,
  initialData,
}: AgencyBrandValuesStepProps) {
  const {
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<AgencyBrandValuesData>({
    resolver: zodResolver(schema) as any,
    mode: 'onChange',
    defaultValues: initialData || {
      brand_values: [],
    },
  });

  const brandValues = watch('brand_values');

  const toggleValue = (value: string) => {
    const current = brandValues || [];
    if (current.includes(value)) {
      setValue('brand_values', current.filter(v => v !== value), { shouldValidate: true });
    } else {
      setValue('brand_values', [...current, value], { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Values</h2>
        <p className="text-gray-600">What does your brand stand for?</p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 text-pink-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Why this matters</h3>
            <p className="text-sm text-gray-600">
              Athletes want to partner with brands that align with their personal values. Sharing your brand values helps create authentic, meaningful partnerships.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Values Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Your Brand Values <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Choose values that best represent your brand (select at least one)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BRAND_VALUES.map((value) => (
            <button
              key={value.value}
              type="button"
              onClick={() => toggleValue(value.value)}
              className={`group relative p-4 border-2 rounded-xl text-left transition-all ${
                brandValues?.includes(value.value)
                  ? 'border-pink-500 bg-gradient-to-br from-pink-50 to-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  brandValues?.includes(value.value)
                    ? 'border-pink-500 bg-pink-500'
                    : 'border-gray-300 group-hover:border-gray-400'
                }`}>
                  {brandValues?.includes(value.value) && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Emoji */}
                <span className="text-2xl" role="img" aria-label={value.label}>
                  {value.emoji}
                </span>

                {/* Label */}
                <span className={`flex-1 font-medium transition-colors ${
                  brandValues?.includes(value.value)
                    ? 'text-pink-900'
                    : 'text-gray-900'
                }`}>
                  {value.label}
                </span>

                {/* Selected Badge */}
                {brandValues?.includes(value.value) && (
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-500 text-white">
                      Selected
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {errors.brand_values && (
          <p className="mt-2 text-sm text-red-600">{errors.brand_values.message}</p>
        )}

        {/* Selection Counter */}
        {brandValues && brandValues.length > 0 && (
          <div className="mt-4 p-3 bg-pink-50 rounded-lg border border-pink-100">
            <p className="text-sm text-pink-800">
              <span className="font-semibold">{brandValues.length}</span> value{brandValues.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>

      {/* Selected Values Preview */}
      {brandValues && brandValues.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-pink-100 p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Your Brand Values:</h3>
          <div className="flex flex-wrap gap-2">
            {brandValues.map((valueKey) => {
              const value = BRAND_VALUES.find(v => v.value === valueKey);
              return value ? (
                <span
                  key={valueKey}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-sm font-medium"
                >
                  <span role="img" aria-label={value.label}>{value.emoji}</span>
                  {value.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

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
              ? 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>

      {/* Progress Hint */}
      <p className="text-center text-sm text-gray-500">
        Step 3 of 4 • Brand Values
      </p>
    </form>
  );
}
