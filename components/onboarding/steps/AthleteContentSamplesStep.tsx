'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Image, Plus, Trash2, ExternalLink, TrendingUp, Star, Calendar } from 'lucide-react';
import { useState } from 'react';

const contentSampleSchema = z.object({
  type: z.enum(['instagram_post', 'instagram_story', 'tiktok_video', 'youtube_video', 'twitter_post', 'blog_post', 'other']),
  url: z.string().url('Must be a valid URL'),
  description: z.string().max(200).optional(),

  // Engagement metrics (all optional)
  likes: z.number().min(0).optional(),
  comments: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  views: z.number().min(0).optional(),

  date: z.string(), // ISO date string
  sponsored: z.boolean().default(false),
  brand: z.string().optional(),
  featured: z.boolean().default(false),
});

const schema = z.object({
  content_samples: z.array(contentSampleSchema).max(10),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters'),
  profile_video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  skip_samples: z.boolean().default(false),
}).refine((data) => {
  // If not skipping, bio must be at least 50 characters
  if (!data.skip_samples && data.bio.length < 50) {
    return false;
  }
  return true;
}, {
  message: "Bio must be at least 50 characters or check 'Skip for now'",
  path: ['bio'],
});

export type AthleteContentSamplesData = z.infer<typeof schema>;

interface AthleteContentSamplesStepProps {
  onNext: (data: AthleteContentSamplesData) => void;
  onBack?: () => void;
  initialData?: Partial<AthleteContentSamplesData>;
}

const CONTENT_TYPES = [
  { value: 'instagram_post', label: 'Instagram Post', emoji: '📷' },
  { value: 'instagram_story', label: 'Instagram Story', emoji: '📸' },
  { value: 'tiktok_video', label: 'TikTok Video', emoji: '🎵' },
  { value: 'youtube_video', label: 'YouTube Video', emoji: '📺' },
  { value: 'twitter_post', label: 'Twitter/X Post', emoji: '🐦' },
  { value: 'blog_post', label: 'Blog Post', emoji: '✍️' },
  { value: 'other', label: 'Other', emoji: '📄' },
];

export default function AthleteContentSamplesStep({
  onNext,
  onBack,
  initialData,
}: AthleteContentSamplesStepProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<AthleteContentSamplesData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      content_samples: [],
      bio: '',
      profile_video_url: '',
      skip_samples: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'content_samples',
  });

  const contentSamples = watch('content_samples');
  const bio = watch('bio');
  const skipSamples = watch('skip_samples');

  const addSample = () => {
    if (fields.length < 10) {
      append({
        type: 'instagram_post',
        url: '',
        description: '',
        sponsored: false,
        featured: false,
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const calculateEngagement = (sample: any) => {
    const total = (sample.likes || 0) + (sample.comments || 0) + (sample.shares || 0);
    return total;
  };

  const getTypeInfo = (type: string) => {
    return CONTENT_TYPES.find(t => t.value === type) || CONTENT_TYPES[0];
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Image className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Portfolio & Bio</h2>
        <p className="text-gray-600">Showcase your best content and tell your story</p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
        <div className="flex items-start gap-3">
          <Star className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-gray-900 mb-1">Stand Out to Brands</h3>
            <p className="text-sm text-gray-600">
              Your bio and content samples help brands understand your unique voice and content quality. Showcase work you're proud of to attract better partnership opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          About You <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">Write a short bio that showcases your personality and what makes you unique</p>

        <textarea
          {...register('bio')}
          rows={5}
          placeholder="I'm a student-athlete who's passionate about... When I'm not on the field, you can find me... I love partnering with brands that..."
          className={`block w-full px-4 py-3 border-2 ${
            errors.bio ? 'border-red-300' : 'border-gray-300'
          } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none`}
        />

        <div className="flex items-center justify-between mt-2">
          {errors.bio && (
            <p className="text-sm text-red-600">{errors.bio.message}</p>
          )}
          <p className={`text-sm ml-auto ${
            bio.length < 50 ? 'text-red-500' : bio.length > 500 ? 'text-red-500' : 'text-gray-500'
          }`}>
            {bio.length}/500 characters
          </p>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-gray-600">
            <strong>Tips:</strong> Mention your sport, year, major, career goals, hobbies, and what type of brands you'd love to work with.
          </p>
        </div>
      </div>

      {/* Profile Video (Optional) */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Introduction Video <span className="text-gray-400 font-normal">(Optional)</span>
        </h3>
        <p className="text-sm text-gray-600 mb-4">Share a link to an introduction video or highlight reel</p>

        <input
          type="url"
          {...register('profile_video_url')}
          placeholder="https://youtube.com/watch?v=..."
          className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        {errors.profile_video_url && (
          <p className="text-sm text-red-600 mt-2">{errors.profile_video_url.message}</p>
        )}

        <p className="text-xs text-gray-500 mt-2">
          Accepts: YouTube, Vimeo, or any video hosting platform URL
        </p>
      </div>

      {/* Content Samples */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Content Samples <span className="text-gray-400 font-normal">(Optional - Up to 10)</span>
            </h3>
            <p className="text-sm text-gray-600">Add links to your best content to showcase your work</p>
          </div>
          {fields.length < 10 && (
            <button
              type="button"
              onClick={addSample}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Sample
            </button>
          )}
        </div>

        {fields.length === 0 && !skipSamples && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <Image className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium mb-2">No content samples added yet</p>
            <p className="text-sm text-gray-500 mb-4">Showcase your best posts, videos, or campaigns</p>
            <button
              type="button"
              onClick={addSample}
              className="inline-flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Your First Sample
            </button>
          </div>
        )}

        {/* Sample Cards */}
        <div className="space-y-4">
          {fields.map((field, index) => {
            const typeInfo = getTypeInfo(watch(`content_samples.${index}.type`));
            const engagement = calculateEngagement(watch(`content_samples.${index}`));

            return (
              <div key={field.id} className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeInfo.emoji}</span>
                    <div>
                      <p className="font-medium text-gray-900">Sample {index + 1}</p>
                      <p className="text-sm text-gray-500">{typeInfo.label}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Remove sample"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register(`content_samples.${index}.type`)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {CONTENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.emoji} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        {...register(`content_samples.${index}.url`)}
                        placeholder="https://..."
                        className={`block w-full px-3 py-2 pr-10 border ${
                          errors.content_samples?.[index]?.url ? 'border-red-300' : 'border-gray-300'
                        } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      />
                      <ExternalLink className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.content_samples?.[index]?.url && (
                      <p className="mt-1 text-xs text-red-600">{errors.content_samples[index]?.url?.message}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date Posted <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register(`content_samples.${index}.date`)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      {...register(`content_samples.${index}.description`)}
                      placeholder="Brief description..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    Engagement Metrics (Optional)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Likes</label>
                      <input
                        type="number"
                        {...register(`content_samples.${index}.likes`, { valueAsNumber: true })}
                        placeholder="0"
                        className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Comments</label>
                      <input
                        type="number"
                        {...register(`content_samples.${index}.comments`, { valueAsNumber: true })}
                        placeholder="0"
                        className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Shares</label>
                      <input
                        type="number"
                        {...register(`content_samples.${index}.shares`, { valueAsNumber: true })}
                        placeholder="0"
                        className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Views</label>
                      <input
                        type="number"
                        {...register(`content_samples.${index}.views`, { valueAsNumber: true })}
                        placeholder="0"
                        className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  {engagement > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      Total engagement: <strong className="text-orange-600">{engagement.toLocaleString()}</strong>
                    </p>
                  )}
                </div>

                {/* Flags */}
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`sponsored-${index}`}
                      {...register(`content_samples.${index}.sponsored`)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <label htmlFor={`sponsored-${index}`} className="text-sm text-gray-700">
                      Sponsored content
                    </label>
                  </div>

                  {watch(`content_samples.${index}.sponsored`) && (
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        {...register(`content_samples.${index}.brand`)}
                        placeholder="Brand name"
                        className="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`featured-${index}`}
                      {...register(`content_samples.${index}.featured`)}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <label htmlFor={`featured-${index}`} className="text-sm text-gray-700 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Featured (show prominently)
                    </label>
                  </div>
                </div>
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
            id="skip_samples"
            {...register('skip_samples')}
            className="mt-1 w-5 h-5 text-yellow-500 border-gray-300 rounded focus:ring-2 focus:ring-yellow-500"
          />
          <label htmlFor="skip_samples" className="flex-1 cursor-pointer">
            <p className="text-sm font-medium text-gray-900">Skip content samples for now</p>
            <p className="text-xs text-gray-600 mt-1">
              You can add content samples later. Note: Profiles with samples get 40% more partnership inquiries.
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
          disabled={!isValid}
          className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all ${
            isValid
              ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Complete Profile Setup
        </button>
      </div>

      {/* Progress Hint */}
      <p className="text-center text-sm text-gray-500">
        Enhanced Step 4 of 4 • Portfolio & Bio
      </p>
    </form>
  );
}
