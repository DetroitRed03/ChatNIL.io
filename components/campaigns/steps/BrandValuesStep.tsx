/**
 * Brand Values Step
 * Captures: brand values, interests, blacklist categories
 */

'use client';

import { useState } from 'react';
import { Heart, X, AlertCircle } from 'lucide-react';
import { BRAND_VALUES, INTEREST_CATEGORIES } from '@/lib/agency-data';

interface BrandValuesStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const BLACKLIST_CATEGORIES = [
  { value: 'alcohol', label: 'Alcohol', emoji: '🍺', description: 'Beer, wine, spirits' },
  { value: 'tobacco', label: 'Tobacco/Vaping', emoji: '🚬', description: 'Cigarettes, vapes, e-cigarettes' },
  { value: 'gambling', label: 'Gambling', emoji: '🎰', description: 'Casinos, betting, lottery' },
  { value: 'cannabis', label: 'Cannabis', emoji: '🌿', description: 'Marijuana, CBD (where not legal)' },
  { value: 'adult_content', label: 'Adult Content', emoji: '🔞', description: 'Adult entertainment, explicit content' },
  { value: 'weapons', label: 'Weapons', emoji: '🔫', description: 'Firearms, ammunition' },
  { value: 'political', label: 'Political Campaigns', emoji: '🗳️', description: 'Political parties, candidates' },
  { value: 'controversial', label: 'Controversial Topics', emoji: '⚠️', description: 'Divisive social/religious issues' },
];

export default function BrandValuesStep({ onNext, onBack, initialData }: BrandValuesStepProps) {
  const [formData, setFormData] = useState({
    brand_values: initialData?.brand_values || [],
    required_interests: initialData?.required_interests || [],
    blacklist_categories: initialData?.blacklist_categories || [],
  });

  const toggleArrayItem = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Heart className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Values</h2>
        <p className="text-gray-600">Define values and interests alignment</p>
      </div>

      {/* Brand Values */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Brand Values <span className="text-gray-500 font-normal">(Optional)</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Select values that are important to your brand. Athletes with matching values will be prioritized in matchmaking.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BRAND_VALUES.map(value => (
            <button
              key={value.value}
              type="button"
              onClick={() => toggleArrayItem('brand_values', value.value)}
              className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 ${
                formData.brand_values.includes(value.value)
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{value.emoji}</span>
                <span className="text-sm">{value.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Required Interests */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Required Interests <span className="text-gray-500 font-normal">(Optional)</span>
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Select interests that athletes should have. This helps ensure brand-athlete alignment beyond sports.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {INTEREST_CATEGORIES.map(interest => (
            <button
              key={interest.value}
              type="button"
              onClick={() => toggleArrayItem('required_interests', interest.value)}
              className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 ${
                formData.required_interests.includes(interest.value)
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{interest.icon}</span>
                <span className="text-sm">{interest.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Blacklist Categories */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              Content Blacklist <span className="text-gray-600 font-normal">(Optional)</span>
            </label>
            <p className="text-sm text-gray-600">
              Exclude athletes who promote these categories. This protects your brand from unwanted associations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BLACKLIST_CATEGORIES.map(category => (
            <button
              key={category.value}
              type="button"
              onClick={() => toggleArrayItem('blacklist_categories', category.value)}
              className={`px-4 py-3 rounded-xl font-semibold text-left transition-all border-2 ${
                formData.blacklist_categories.includes(category.value)
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{category.emoji}</span>
                    <span className="font-bold">{category.label}</span>
                  </div>
                  <div className={`text-xs ${formData.blacklist_categories.includes(category.value) ? 'opacity-90' : 'text-gray-500'}`}>
                    {category.description}
                  </div>
                </div>
                {formData.blacklist_categories.includes(category.value) && (
                  <X className="w-5 h-5 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        {formData.blacklist_categories.length > 0 && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-red-200">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Active Exclusions ({formData.blacklist_categories.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.blacklist_categories.map((cat: string) => {
                const category = BLACKLIST_CATEGORIES.find((c: any) => c.value === cat);
                return (
                  <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                    {category?.emoji} {category?.label}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-900"
                      onClick={() => toggleArrayItem('blacklist_categories', cat)}
                    />
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary Note */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <p className="text-sm text-gray-700">
          <span className="font-bold">💡 Matching Tip:</span> All criteria in this step are optional but help improve match quality. Athletes who align with your brand values and interests will receive higher match scores in our algorithm.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold rounded-xl transition-all shadow-lg"
        >
          Continue to Review
        </button>
      </div>
    </form>
  );
}
