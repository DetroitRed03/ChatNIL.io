'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, Trophy, Target, Users, Award, Plus, X, Star, Hash, SkipForward, Save } from 'lucide-react';
import { athleteSportsInfoSchema, AthleteSportsInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { searchSports, getPositionsForSport } from '@/lib/sports-data';
import {
  OnboardingInput,
  OnboardingTextarea,
  OnboardingButton,
} from '@/components/ui/OnboardingInput';

export default function AthleteSportsInfoStep({
  data,
  onNext,
  onBack,
  onSkip,
  onSaveAndExit,
  isFirst,
  isLast,
  isLoading,
  allowSkip = true
}: OnboardingStepProps) {
  const { nextStep, previousStep, skipStep, saveAndExit, updateFormData } = useOnboarding();
  const [sportSuggestions, setSportSuggestions] = useState<string[]>([]);
  const [showSportSuggestions, setShowSportSuggestions] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [isCustomPosition, setIsCustomPosition] = useState(false);

  // Ref for outside click detection
  const sportInputRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors, isValid }
  } = useForm<AthleteSportsInfo>({
    resolver: zodResolver(athleteSportsInfoSchema) as any,
    defaultValues: {
      primarySport: data.primarySport || '',
      position: data.position || '',
      jerseyNumber: data.jerseyNumber || undefined,
      secondarySports: data.secondarySports || [],
      achievements: data.achievements || '',
      stats: data.stats || {},
      coachName: data.coachName || '',
      coachEmail: data.coachEmail || '',
    },
    mode: 'onChange'
  });

  const { fields: secondarySports, append: addSecondarySport, remove: removeSecondarySport } = useFieldArray({
    control: control as any,
    name: 'secondarySports'
  });

  const watchedPrimarySport = watch('primarySport');
  const watchedPosition = watch('position');
  const watchedAchievements = watch('achievements');

  // Outside click detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sportInputRef.current && !sportInputRef.current.contains(event.target as Node)) {
        setShowSportSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize positions if primary sport is already set
  useEffect(() => {
    if (watchedPrimarySport) {
      const positions = getPositionsForSport(watchedPrimarySport);
      setSelectedPositions(positions);
    }
  }, []);

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
        console.warn('Step progression failed, but data was saved locally');
      }
    } catch (error) {
      console.error('Error during step submission:', error);
      updateFormData(formData);
    }
  };

  const handleBack = () => {
    updateFormData(getValues());
    previousStep();
    if (onBack) onBack();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Introduction Card */}
      <div className="p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-orange-900 mb-1">
              Share your athletic achievements
            </h3>
            <p className="text-sm text-orange-700 leading-relaxed">
              Your sports information helps us match you with relevant brand partnerships,
              equipment deals, and sport-specific NIL opportunities.
            </p>
          </div>
        </div>
      </div>

      {/* Primary Sport with autocomplete */}
      <div className="relative" ref={sportInputRef}>
        <Controller
          name="primarySport"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="Primary Sport"
              required
              error={errors.primarySport?.message}
              placeholder="e.g., Basketball, Football, Tennis"
              onChange={(e) => {
                field.onChange(e);
                handleSportChange(e.target.value);
              }}
              onFocus={() => {
                if (field.value && field.value.length > 1) {
                  handleSportChange(field.value);
                }
              }}
            />
          )}
        />

        {/* Sport suggestions dropdown */}
        {showSportSuggestions && sportSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border-2 border-orange-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {sportSuggestions.map((sport, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSport(sport)}
                className="w-full px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors first:rounded-t-xl last:rounded-b-xl flex items-center gap-3"
              >
                <Trophy className="h-4 w-4 text-orange-500" />
                <span className="text-gray-700 font-medium">{sport}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Position (if sport has positions) */}
      {selectedPositions.length > 0 && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Position / Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedPositions.map((position) => (
              <button
                key={position}
                type="button"
                onClick={() => {
                  setValue('position', position);
                  setIsCustomPosition(false);
                }}
                className={`rounded-xl border-2 p-3 text-center text-sm font-medium transition-all ${
                  watchedPosition === position && !isCustomPosition
                    ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-md'
                    : 'border-orange-200/50 hover:border-orange-300 hover:bg-orange-50/50 text-gray-700'
                }`}
              >
                {position}
              </button>
            ))}
          </div>

          {/* Custom position input */}
          <div className="mt-3">
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <OnboardingInput
                  {...field}
                  label=""
                  placeholder="Or enter a custom position"
                  helperText={isCustomPosition && field.value ? `Using custom position: "${field.value}"` : undefined}
                  onChange={(e) => {
                    field.onChange(e);
                    setIsCustomPosition(!!e.target.value);
                  }}
                  className={isCustomPosition ? 'border-orange-500 ring-2 ring-orange-100' : ''}
                />
              )}
            />
          </div>
        </div>
      )}

      {/* Jersey Number */}
      <div className="max-w-xs">
        <Controller
          name="jerseyNumber"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="Jersey Number"
              type="number"
              min={0}
              max={99}
              placeholder="e.g., 23"
              helperText="Your team jersey number (optional)"
              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          )}
        />
      </div>

      {/* Secondary Sports */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-gray-700">
            Secondary Sports
          </label>
          {secondarySports.length < 3 && (
            <button
              type="button"
              onClick={addSecondarySportField}
              className="inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Sport
            </button>
          )}
        </div>
        <div className="space-y-3">
          {secondarySports.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    {...register(`secondarySports.${index}` as const)}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white text-gray-900 font-medium placeholder:text-gray-400 transition-colors"
                    placeholder="Secondary sport"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSecondarySportField(index)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">Add sports you also play competitively (optional)</p>
      </div>

      {/* Achievements */}
      <Controller
        name="achievements"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <OnboardingTextarea
              {...field}
              label="Achievements & Honors"
              placeholder="List your awards, championships, records, or notable achievements..."
              helperText="Help brands understand your athletic accomplishments (optional)"
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-end">
              <span className="text-xs text-gray-400">{watchedAchievements?.length || 0}/500</span>
            </div>
          </div>
        )}
      />

      {/* Coach Information */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Controller
          name="coachName"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="Coach Name"
              placeholder="Coach's full name"
              helperText="Optional - for verification purposes"
            />
          )}
        />

        <Controller
          name="coachEmail"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="Coach Email"
              type="email"
              placeholder="coach@school.edu"
              error={errors.coachEmail?.message}
            />
          )}
        />
      </div>

      {/* Athletic NIL Note */}
      <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Star className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-green-900 mb-1">Athletic NIL Opportunities</h4>
            <p className="text-sm text-green-700 leading-relaxed">
              Your athletic achievements and sport can unlock equipment deals, training partnerships,
              sports camps, performance-based bonuses, and sport-specific brand endorsements.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
        {/* Left side - Back, Skip and Save buttons */}
        <div className="flex gap-3">
          {!isFirst && (
            <OnboardingButton
              type="button"
              variant="secondary"
              size="md"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </OnboardingButton>
          )}

          {allowSkip && (
            <OnboardingButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                updateFormData(getValues());
                onSkip ? onSkip() : skipStep();
              }}
              disabled={isLoading}
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </OnboardingButton>
          )}

          <OnboardingButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={async () => {
              updateFormData(getValues());
              onSaveAndExit ? await onSaveAndExit() : await saveAndExit();
            }}
            disabled={isLoading}
          >
            <Save className="h-4 w-4" />
            Save & Exit
          </OnboardingButton>
        </div>

        {/* Right side - Continue button */}
        <OnboardingButton
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
        >
          Continue
          <ArrowRight className="h-5 w-5" />
        </OnboardingButton>
      </div>

      {/* Optional field indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are required
        </p>
      </div>
    </form>
  );
}
