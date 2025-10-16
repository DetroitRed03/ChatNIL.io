'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Trophy, Target, Users, Clock, Award, Plus, X, Star } from 'lucide-react';
import { athleteSportsInfoSchema, AthleteSportsInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { SPORTS_DATA, POPULAR_SPORTS, searchSports, getPositionsForSport } from '@/lib/sports-data';

export default function AthleteSportsInfoStep({
  data,
  onNext,
  onBack,
  isFirst,
  isLast,
  isLoading
}: OnboardingStepProps) {
  const { nextStep, updateFormData } = useOnboarding();
  const [sportSuggestions, setSportSuggestions] = useState<string[]>([]);
  const [showSportSuggestions, setShowSportSuggestions] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [isCustomPosition, setIsCustomPosition] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isValid }
  } = useForm<AthleteSportsInfo>({
    resolver: zodResolver(athleteSportsInfoSchema),
    defaultValues: {
      primarySport: data.primarySport || '',
      position: data.position || '',
      secondarySports: data.secondarySports || [],
      achievements: data.achievements || '',
      stats: data.stats || {},
      coachName: data.coachName || '',
      coachEmail: data.coachEmail || '',
    },
    mode: 'onChange'
  });

  const { fields: secondarySports, append: addSecondarySport, remove: removeSecondarySport } = useFieldArray({
    control,
    name: 'secondarySports'
  });

  const watchedPrimarySport = watch('primarySport');

  // Handle sport suggestions
  const handleSportChange = (value: string) => {
    if (value.length > 1) {
      const filtered = searchSports(value, 6);
      setSportSuggestions(filtered);
      setShowSportSuggestions(filtered.length > 0);
    } else {
      setSportSuggestions([]);
      setShowSportSuggestions(false);
    }

    // Update available positions when sport changes
    const positions = getPositionsForSport(value);
    setSelectedPositions(positions);
  };

  const selectSport = (sport: string) => {
    setValue('primarySport', sport);
    setShowSportSuggestions(false);
    const positions = getPositionsForSport(sport);
    setSelectedPositions(positions);
  };

  // Add secondary sport functionality
  const addSecondarySportField = () => {
    if (secondarySports.length < 3) {
      addSecondarySport('');
    }
  };

  const removeSecondarySportField = (index: number) => {
    removeSecondarySport(index);
  };

  const onSubmit = async (formData: AthleteSportsInfo) => {
    try {
      updateFormData(formData);
      const success = await nextStep(formData);
      if (success) {
        onNext(formData);
      } else {
        console.warn('⚠️ Step progression failed, but data was saved locally');
      }
    } catch (error) {
      console.error('❌ Error during step submission:', error);
      // Still update form data locally as fallback
      updateFormData(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Introduction */}
      <div className="mb-6 p-5 bg-orange-50 rounded-xl border border-orange-200">
        <div className="flex items-start">
          <div className="p-2 bg-orange-100 rounded-lg mr-4">
            <Trophy className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Share your athletic achievements
            </h3>
            <p className="text-orange-700 leading-relaxed">
              Your sports information helps us match you with relevant brand partnerships,
              equipment deals, and sport-specific NIL opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Sport */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Primary Sport *
        </label>
        <div className="relative">
          <Trophy className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            {...register('primarySport', {
              onChange: (e) => handleSportChange(e.target.value)
            })}
            type="text"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
              errors.primarySport
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
            }`}
            placeholder="e.g., Basketball, Football, Tennis"
          />
        </div>
        {errors.primarySport && (
          <p className="mt-1 text-sm text-red-600">{errors.primarySport.message}</p>
        )}

        {/* Sport suggestions */}
        {showSportSuggestions && sportSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {sportSuggestions.map((sport, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSport(sport)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center"
              >
                <Trophy className="h-4 w-4 text-gray-400 mr-2" />
                {sport}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Position (if sport has positions) */}
      {selectedPositions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Position / Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {selectedPositions.map((position) => (
              <div key={position}>
                <button
                  type="button"
                  onClick={() => {
                    setValue('position', position);
                    setIsCustomPosition(false);
                  }}
                  className={`w-full cursor-pointer rounded-lg border p-3 text-center text-sm transition-all ${
                    watch('position') === position && !isCustomPosition
                      ? 'border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {position}
                </button>
              </div>
            ))}
          </div>
          {/* Custom position input */}
          <div className="mt-3">
            <input
              {...register('position', {
                onChange: (e) => {
                  if (e.target.value) {
                    setIsCustomPosition(true);
                  } else {
                    setIsCustomPosition(false);
                  }
                }
              })}
              type="text"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                isCustomPosition
                  ? 'border-orange-500 ring-2 ring-orange-200 bg-orange-50'
                  : 'border-gray-300 focus:ring-orange-500'
              }`}
              placeholder="Or enter a custom position (overrides selection above)"
            />
            {isCustomPosition && watch('position') && (
              <p className="mt-1 text-xs text-orange-600 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Using custom position: "{watch('position')}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Secondary Sports */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-900">
            Secondary Sports (Optional)
          </label>
          {secondarySports.length < 3 && (
            <button
              type="button"
              onClick={addSecondarySportField}
              className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Sport
            </button>
          )}
        </div>
        <div className="space-y-2">
          {secondarySports.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  {...register(`secondarySports.${index}` as const)}
                  type="text"
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Secondary sport"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSecondarySportField(index)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-500">Add sports you also play competitively</p>
      </div>

      {/* Achievements */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Achievements & Honors (Optional)
        </label>
        <div className="relative">
          <Award className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            {...register('achievements')}
            rows={4}
            maxLength={500}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="List your awards, championships, records, or notable achievements..."
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">Help brands understand your athletic accomplishments</p>
          <p className="text-xs text-gray-400">{watch('achievements')?.length || 0}/500</p>
        </div>
      </div>

      {/* Coach Information */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Coach Name (Optional)
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('coachName')}
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Coach's full name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Coach Email (Optional)
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('coachEmail')}
              type="email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="coach@school.edu"
            />
          </div>
        </div>
      </div>

      {/* Athletic NIL Note */}
      <div className="p-4 bg-green-50 rounded-xl">
        <div className="flex items-start">
          <div className="p-1 bg-green-100 rounded-lg mr-3">
            <Star className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-900 mb-1">Athletic NIL Opportunities</h4>
            <p className="text-xs text-green-700 leading-relaxed">
              Your athletic achievements and sport can unlock equipment deals, training partnerships,
              sports camps, performance-based bonuses, and sport-specific brand endorsements.
            </p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
            isValid && !isLoading
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}