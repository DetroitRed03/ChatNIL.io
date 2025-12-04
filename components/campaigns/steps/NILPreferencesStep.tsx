/**
 * NIL Preferences Step
 * Captures: deal types, content types, partnership terms
 */

'use client';

import { useState } from 'react';
import { Users, Camera, Video, FileText, MapPin, Plane } from 'lucide-react';

interface NILPreferencesStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const DEAL_TYPES = [
  { value: 'social_media', label: 'Social Media Posts', icon: Camera, description: 'Instagram, TikTok, Twitter posts' },
  { value: 'endorsement', label: 'Product Endorsement', icon: Users, description: 'Long-term brand ambassadorship' },
  { value: 'appearance', label: 'Event Appearances', icon: MapPin, description: 'In-person events, meet & greets' },
  { value: 'content_creation', label: 'Content Creation', icon: Video, description: 'Videos, blogs, podcasts' },
  { value: 'autograph', label: 'Autograph Sessions', icon: FileText, description: 'Signing events' },
  { value: 'streaming', label: 'Live Streaming', icon: Video, description: 'Twitch, YouTube Live' },
];

const CONTENT_TYPES = [
  { value: 'photo', label: 'Photos', icon: Camera },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'story', label: 'Stories', icon: Camera },
  { value: 'reel', label: 'Reels/TikToks', icon: Video },
  { value: 'blog', label: 'Blog Posts', icon: FileText },
  { value: 'live', label: 'Live Streams', icon: Video },
];

const PARTNERSHIP_LENGTHS = [
  { value: '1_month', label: '1 Month', description: 'Short-term campaign' },
  { value: '3_months', label: '3 Months', description: 'Standard campaign' },
  { value: '6_months', label: '6 Months', description: 'Extended partnership' },
  { value: '12_months', label: '12 Months', description: 'Annual partnership' },
  { value: 'ongoing', label: 'Ongoing', description: 'Long-term ambassadorship' },
];

export default function NILPreferencesStep({ onNext, onBack, initialData }: NILPreferencesStepProps) {
  const [formData, setFormData] = useState({
    preferred_deal_types: initialData?.preferred_deal_types || [],
    content_types_needed: initialData?.content_types_needed || [],
    partnership_length: initialData?.partnership_length || '3_months',
    exclusivity_required: initialData?.exclusivity_required || false,
    travel_required: initialData?.travel_required || false,
    max_travel_distance: initialData?.max_travel_distance || 100,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleArrayItem = (field: 'preferred_deal_types' | 'content_types_needed', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.preferred_deal_types.length === 0) {
      newErrors.preferred_deal_types = 'Select at least one deal type';
    }

    if (formData.content_types_needed.length === 0) {
      newErrors.content_types_needed = 'Select at least one content type';
    }

    if (formData.travel_required && formData.max_travel_distance < 10) {
      newErrors.max_travel_distance = 'Travel distance must be at least 10 miles';
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
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">NIL Preferences</h2>
        <p className="text-gray-600">Define deal structure and requirements</p>
      </div>

      {/* Preferred Deal Types */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Preferred Deal Types <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DEAL_TYPES.map(deal => {
            const Icon = deal.icon;
            return (
              <button
                key={deal.value}
                type="button"
                onClick={() => toggleArrayItem('preferred_deal_types', deal.value)}
                className={`px-4 py-3 rounded-xl font-semibold text-left transition-all border-2 ${
                  formData.preferred_deal_types.includes(deal.value)
                    ? 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold">{deal.label}</div>
                    <div className={`text-xs mt-1 ${formData.preferred_deal_types.includes(deal.value) ? 'opacity-90' : 'text-gray-500'}`}>
                      {deal.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        {errors.preferred_deal_types && (
          <p className="mt-2 text-sm text-red-500">{errors.preferred_deal_types}</p>
        )}
      </div>

      {/* Content Types Needed */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Content Types Needed <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CONTENT_TYPES.map(content => {
            const Icon = content.icon;
            return (
              <button
                key={content.value}
                type="button"
                onClick={() => toggleArrayItem('content_types_needed', content.value)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 ${
                  formData.content_types_needed.includes(content.value)
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon className="w-5 h-5" />
                  {content.label}
                </div>
              </button>
            );
          })}
        </div>
        {errors.content_types_needed && (
          <p className="mt-2 text-sm text-red-500">{errors.content_types_needed}</p>
        )}
      </div>

      {/* Partnership Length */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Partnership Length <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PARTNERSHIP_LENGTHS.map(length => (
            <button
              key={length.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, partnership_length: length.value }))}
              className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 text-left ${
                formData.partnership_length === length.value
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="font-bold">{length.label}</div>
              <div className={`text-xs mt-1 ${formData.partnership_length === length.value ? 'opacity-90' : 'text-gray-500'}`}>
                {length.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Exclusivity Required */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.exclusivity_required}
            onChange={(e) => setFormData(prev => ({ ...prev, exclusivity_required: e.target.checked }))}
            className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <div>
            <div className="font-bold text-gray-900 mb-1">Require Exclusivity</div>
            <div className="text-sm text-gray-600">
              Athlete cannot promote competing brands during partnership (e.g., if you sell sports drinks, athlete cannot promote other beverages)
            </div>
          </div>
        </label>
      </div>

      {/* Travel Requirements */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200 space-y-4">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.travel_required}
            onChange={(e) => setFormData(prev => ({ ...prev, travel_required: e.target.checked }))}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <div className="font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Plane className="w-5 h-5" />
              Travel Required
            </div>
            <div className="text-sm text-gray-600">
              Campaign requires in-person appearances or events
            </div>
          </div>
        </label>

        {formData.travel_required && (
          <div className="pl-9 pt-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Maximum Travel Distance (miles)
            </label>
            <input
              type="number"
              min="10"
              max="10000"
              value={formData.max_travel_distance}
              onChange={(e) => setFormData(prev => ({ ...prev, max_travel_distance: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="e.g., 500"
            />
            {errors.max_travel_distance && (
              <p className="mt-2 text-sm text-red-500">{errors.max_travel_distance}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Distance from athlete's location they're willing to travel for events
            </p>
          </div>
        )}
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
          className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
