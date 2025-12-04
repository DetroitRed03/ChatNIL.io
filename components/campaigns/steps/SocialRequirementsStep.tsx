/**
 * Social Requirements Step
 * Captures: min followers, engagement rate, platforms
 */

'use client';

import { useState } from 'react';
import { TrendingUp, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

interface SocialRequirementsStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const SOCIAL_PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { value: 'tiktok', label: 'TikTok', icon: null, color: 'bg-gray-900' },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter, color: 'bg-black' },
  { value: 'facebook', label: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'bg-red-600' },
  { value: 'linkedin', label: 'LinkedIn', icon: null, color: 'bg-blue-700' },
];

const FOLLOWER_TIERS = [
  { value: 500, label: '500+', description: 'Nano-influencers' },
  { value: 1000, label: '1K+', description: 'Micro-influencers' },
  { value: 5000, label: '5K+', description: 'Growing influencers' },
  { value: 10000, label: '10K+', description: 'Mid-tier influencers' },
  { value: 50000, label: '50K+', description: 'Macro-influencers' },
  { value: 100000, label: '100K+', description: 'Major influencers' },
];

const ENGAGEMENT_TIERS = [
  { value: 1.0, label: '1%+', description: 'Minimum acceptable' },
  { value: 2.0, label: '2%+', description: 'Good engagement' },
  { value: 3.0, label: '3%+', description: 'Strong engagement' },
  { value: 5.0, label: '5%+', description: 'Excellent engagement' },
  { value: 7.0, label: '7%+', description: 'Elite engagement' },
];

export default function SocialRequirementsStep({ onNext, onBack, initialData }: SocialRequirementsStepProps) {
  const [formData, setFormData] = useState({
    min_followers: initialData?.min_followers || 1000,
    min_engagement_rate: initialData?.min_engagement_rate || 2.0,
    preferred_platforms: initialData?.preferred_platforms || [],
    content_quality_required: initialData?.content_quality_required || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_platforms: prev.preferred_platforms.includes(platform)
        ? prev.preferred_platforms.filter((p: string) => p !== platform)
        : [...prev.preferred_platforms, platform]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.preferred_platforms.length === 0) {
      newErrors.preferred_platforms = 'Select at least one platform';
    }

    if (formData.min_followers < 100) {
      newErrors.min_followers = 'Minimum followers must be at least 100';
    }

    if (formData.min_engagement_rate < 0.1 || formData.min_engagement_rate > 100) {
      newErrors.min_engagement_rate = 'Engagement rate must be between 0.1% and 100%';
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
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Requirements</h2>
        <p className="text-gray-600">Set minimum social media criteria</p>
      </div>

      {/* Preferred Platforms */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Preferred Platforms <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SOCIAL_PLATFORMS.map(platform => {
            const Icon = platform.icon;
            return (
              <button
                key={platform.value}
                type="button"
                onClick={() => togglePlatform(platform.value)}
                className={`px-4 py-3 rounded-xl font-semibold text-white transition-all border-2 ${
                  formData.preferred_platforms.includes(platform.value)
                    ? `${platform.color} border-white scale-105`
                    : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {Icon && <Icon className="w-5 h-5" />}
                  {platform.label}
                </div>
              </button>
            );
          })}
        </div>
        {errors.preferred_platforms && (
          <p className="mt-2 text-sm text-red-500">{errors.preferred_platforms}</p>
        )}
      </div>

      {/* Minimum Followers */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Minimum Followers <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FOLLOWER_TIERS.map(tier => (
            <button
              key={tier.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, min_followers: tier.value }))}
              className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 text-left ${
                formData.min_followers === tier.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="text-lg font-bold">{tier.label}</div>
              <div className="text-xs opacity-80 mt-1">{tier.description}</div>
            </button>
          ))}
        </div>

        {/* Custom Follower Count */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-600 mb-2 block">CUSTOM COUNT</label>
          <input
            type="number"
            min="100"
            value={formData.min_followers}
            onChange={(e) => setFormData(prev => ({ ...prev, min_followers: parseInt(e.target.value) || 0 }))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter custom follower count"
          />
        </div>
        {errors.min_followers && (
          <p className="mt-2 text-sm text-red-500">{errors.min_followers}</p>
        )}
      </div>

      {/* Minimum Engagement Rate */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Minimum Engagement Rate <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ENGAGEMENT_TIERS.map(tier => (
            <button
              key={tier.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, min_engagement_rate: tier.value }))}
              className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 text-left ${
                formData.min_engagement_rate === tier.value
                  ? 'bg-cyan-500 text-white border-cyan-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-cyan-300'
              }`}
            >
              <div className="text-lg font-bold">{tier.label}</div>
              <div className="text-xs opacity-80 mt-1">{tier.description}</div>
            </button>
          ))}
        </div>

        {/* Custom Engagement Rate */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-600 mb-2 block">CUSTOM RATE (%)</label>
          <input
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            value={formData.min_engagement_rate}
            onChange={(e) => setFormData(prev => ({ ...prev, min_engagement_rate: parseFloat(e.target.value) || 0 }))}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
            placeholder="Enter custom engagement rate"
          />
        </div>
        {errors.min_engagement_rate && (
          <p className="mt-2 text-sm text-red-500">{errors.min_engagement_rate}</p>
        )}
      </div>

      {/* Content Quality Required */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.content_quality_required}
            onChange={(e) => setFormData(prev => ({ ...prev, content_quality_required: e.target.checked }))}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div>
            <div className="font-bold text-gray-900 mb-1">Require High Content Quality</div>
            <div className="text-sm text-gray-600">
              Only match with athletes who demonstrate professional-quality content creation (well-composed photos, edited videos, engaging captions)
            </div>
          </div>
        </label>
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
          className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold rounded-xl transition-all shadow-lg"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
