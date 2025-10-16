'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Share2, Plus, Trash2, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { SOCIAL_PLATFORMS } from '@/lib/athlete-data';
import type { SocialMediaStat } from '@/lib/types';
import { useState } from 'react';

const socialStatSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'twitter', 'youtube', 'facebook', 'linkedin', 'twitch', 'snapchat']),
  handle: z.string().min(1, 'Handle is required').regex(/^@?[a-zA-Z0-9_.]{1,}$/, 'Invalid handle format'),
  followers: z.number().min(0, 'Followers must be positive').max(100000000, 'Value seems too high'),
  engagement_rate: z.number().min(0, 'Rate must be positive').max(100, 'Rate cannot exceed 100%'),
  verified: z.boolean().default(false),
});

const schema = z.object({
  social_media_stats: z.array(socialStatSchema).min(0).max(8),
  skip_for_now: z.boolean().default(false),
}).refine((data) => {
  // If skipping, don't validate social media stats
  if (data.skip_for_now) return true;
  // If not skipping, validate that fields are properly filled if any exist
  return true;
}, {
  message: "Please add at least one platform or check 'Skip for now'",
});

export type AthleteSocialMediaData = z.infer<typeof schema>;

interface AthleteSocialMediaStepProps {
  onNext: (data: AthleteSocialMediaData) => void;
  onBack?: () => void;
  initialData?: Partial<AthleteSocialMediaData>;
}

export default function AthleteSocialMediaStep({
  onNext,
  onBack,
  initialData,
}: AthleteSocialMediaStepProps) {
  const [showTips, setShowTips] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<AthleteSocialMediaData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      social_media_stats: [],
      skip_for_now: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'social_media_stats',
  });

  const socialStats = watch('social_media_stats');
  const skipForNow = watch('skip_for_now');

  const addPlatform = () => {
    if (fields.length < 8) {
      append({
        platform: 'instagram',
        handle: '',
        followers: 0,
        engagement_rate: 0,
        verified: false,
      });
    }
  };

  const getPlatformInfo = (platformValue: string) => {
    return SOCIAL_PLATFORMS.find(p => p.value === platformValue);
  };

  const calculateTotalFollowers = () => {
    return socialStats?.reduce((sum, stat) => sum + (stat.followers || 0), 0) || 0;
  };

  const calculateAvgEngagement = () => {
    if (!socialStats || socialStats.length === 0) return 0;
    const sum = socialStats.reduce((sum, stat) => sum + (stat.engagement_rate || 0), 0);
    return (sum / socialStats.length).toFixed(1);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Share2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Social Media Presence</h2>
        <p className="text-gray-600">Share your social media stats to showcase your reach</p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Why share your stats?</h3>
            <p className="text-sm text-gray-600 mb-2">
              Brands use social media metrics to find athletes who align with their target audience. Sharing your stats helps brands understand your reach and engagement.
            </p>
            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showTips ? 'Hide tips' : 'Show tips for finding your stats →'}
            </button>
          </div>
        </div>

        {/* Tips Section */}
        {showTips && (
          <div className="mt-4 pt-4 border-t border-blue-200 space-y-2 text-sm text-gray-700">
            <p className="font-medium">How to find your stats:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Instagram:</strong> Go to your profile → Settings → Account → Insights</li>
              <li><strong>TikTok:</strong> Switch to Creator account → Analytics</li>
              <li><strong>Twitter:</strong> Twitter Analytics (analytics.twitter.com)</li>
              <li><strong>YouTube:</strong> YouTube Studio → Analytics</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Engagement rate = (Likes + Comments) / Followers × 100. A good engagement rate is 2-5%.
            </p>
          </div>
        )}
      </div>

      {/* Social Media Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Your Social Media Platforms
            <span className="text-gray-400 font-normal ml-2">(Optional - Add up to 8)</span>
          </label>
          {fields.length < 8 && (
            <button
              type="button"
              onClick={addPlatform}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Platform
            </button>
          )}
        </div>

        {fields.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-2">No platforms added yet</p>
            <p className="text-sm text-gray-500 mb-4">Add your social media platforms to showcase your reach</p>
            <button
              type="button"
              onClick={addPlatform}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Your First Platform
            </button>
          </div>
        )}

        {/* Platform Cards */}
        <div className="space-y-4">
          {fields.map((field, index) => {
            const platformInfo = getPlatformInfo(watch(`social_media_stats.${index}.platform`));

            return (
              <div key={field.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platformInfo?.emoji}</span>
                    <div>
                      <p className="font-medium text-gray-900">Platform {index + 1}</p>
                      <p className="text-sm text-gray-500">{platformInfo?.label}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Remove platform"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`social_media_stats.${index}.platform`)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {SOCIAL_PLATFORMS.map(platform => (
                        <option key={platform.value} value={platform.value}>
                          {platform.emoji} {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Handle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Handle/Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register(`social_media_stats.${index}.handle`)}
                      placeholder="@username"
                      className={`block w-full px-3 py-2 border ${
                        errors.social_media_stats?.[index]?.handle ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.social_media_stats?.[index]?.handle && (
                      <p className="mt-1 text-xs text-red-600">{errors.social_media_stats[index]?.handle?.message}</p>
                    )}
                  </div>

                  {/* Followers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Followers <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      {...register(`social_media_stats.${index}.followers`, { valueAsNumber: true })}
                      placeholder="10000"
                      className={`block w-full px-3 py-2 border ${
                        errors.social_media_stats?.[index]?.followers ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.social_media_stats?.[index]?.followers && (
                      <p className="mt-1 text-xs text-red-600">{errors.social_media_stats[index]?.followers?.message}</p>
                    )}
                  </div>

                  {/* Engagement Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engagement Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      {...register(`social_media_stats.${index}.engagement_rate`, { valueAsNumber: true })}
                      placeholder="3.5"
                      className={`block w-full px-3 py-2 border ${
                        errors.social_media_stats?.[index]?.engagement_rate ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                    {errors.social_media_stats?.[index]?.engagement_rate && (
                      <p className="mt-1 text-xs text-red-600">{errors.social_media_stats[index]?.engagement_rate?.message}</p>
                    )}
                  </div>
                </div>

                {/* Verified Checkbox */}
                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`verified-${index}`}
                    {...register(`social_media_stats.${index}.verified`)}
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor={`verified-${index}`} className="text-sm text-gray-700 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Verified account
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      {fields.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-100 p-6">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Your Combined Reach
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Followers</p>
              <p className="text-2xl font-bold text-green-600">{formatNumber(calculateTotalFollowers())}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Avg. Engagement</p>
              <p className="text-2xl font-bold text-green-600">{calculateAvgEngagement()}%</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            These metrics help brands understand your audience reach and engagement quality.
          </p>
        </div>
      )}

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
              You can add your social media stats later in your profile settings. Note: Skipping may limit partnership opportunities.
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
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {skipForNow ? 'Skip for Now' : 'Continue'}
        </button>
      </div>

      {/* Progress Hint */}
      <p className="text-center text-sm text-gray-500">
        Enhanced Step 1 of 4 • Social Media
      </p>
    </form>
  );
}
