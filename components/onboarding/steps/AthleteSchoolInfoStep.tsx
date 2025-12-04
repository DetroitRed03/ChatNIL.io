'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, School, GraduationCap, MapPin, BookOpen, Award, SkipForward, Save } from 'lucide-react';
import { athleteSchoolInfoSchema, AthleteSchoolInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  OnboardingInput,
  OnboardingButton,
} from '@/components/ui/OnboardingInput';

// Common US states for location selector
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

// Popular majors for suggestions
const POPULAR_MAJORS = [
  'Business Administration',
  'Communications',
  'Psychology',
  'Exercise Science',
  'Marketing',
  'Finance',
  'Computer Science',
  'Pre-Medicine',
  'Education',
  'Criminal Justice',
  'Nursing',
  'Engineering',
  'Sports Management',
  'Kinesiology',
  'Undeclared/Undecided'
];

export default function AthleteSchoolInfoStep({
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
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [majorSuggestions, setMajorSuggestions] = useState<string[]>([]);
  const [showMajorSuggestions, setShowMajorSuggestions] = useState(false);
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);

  // Refs for outside click detection
  const schoolInputRef = useRef<HTMLDivElement>(null);
  const majorInputRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors, isValid }
  } = useForm<AthleteSchoolInfo>({
    resolver: zodResolver(athleteSchoolInfoSchema) as any,
    defaultValues: {
      schoolName: data.schoolName || '',
      schoolLevel: data.schoolLevel || undefined,
      graduationYear: data.graduationYear || new Date().getFullYear() + 1,
      major: data.major || '',
      gpa: data.gpa || undefined,
    },
    mode: 'onChange'
  });

  const watchedSchoolLevel = watch('schoolLevel');
  const watchedMajor = watch('major');

  // Outside click detection for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (schoolInputRef.current && !schoolInputRef.current.contains(event.target as Node)) {
        setSchoolSuggestions([]);
        setShowSchoolSuggestions(false);
      }
      if (majorInputRef.current && !majorInputRef.current.contains(event.target as Node)) {
        setMajorSuggestions([]);
        setShowMajorSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle school name suggestions (simplified - in production would use an API)
  const handleSchoolNameChange = (value: string) => {
    if (value.length > 2) {
      // Simple mock suggestions - in production would call school API
      const suggestions = [
        `${value} High School`,
        `${value} University`,
        `${value} State University`,
        `University of ${value}`,
        `${value} College`
      ];
      setSchoolSuggestions(suggestions);
      setShowSchoolSuggestions(suggestions.length > 0);
    } else {
      setSchoolSuggestions([]);
      setShowSchoolSuggestions(false);
    }
  };

  const selectSchool = (school: string) => {
    setValue('schoolName', school);
    setSchoolSuggestions([]);
    setShowSchoolSuggestions(false);
  };

  // Handle major suggestions
  const handleMajorChange = (value: string) => {
    if (value.length > 1) {
      const filtered = POPULAR_MAJORS.filter(major =>
        major.toLowerCase().includes(value.toLowerCase())
      );
      setMajorSuggestions(filtered.slice(0, 5));
      setShowMajorSuggestions(filtered.length > 0);
    } else {
      setMajorSuggestions([]);
      setShowMajorSuggestions(false);
    }
  };

  const selectMajor = (major: string) => {
    setValue('major', major);
    setShowMajorSuggestions(false);
  };

  const onSubmit = async (formData: AthleteSchoolInfo) => {
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
      {/* School Name */}
      <div className="relative" ref={schoolInputRef}>
        <Controller
          name="schoolName"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="School Name"
              required
              error={errors.schoolName?.message}
              placeholder="e.g., Jefferson High School, UCLA"
              onChange={(e) => {
                field.onChange(e);
                handleSchoolNameChange(e.target.value);
              }}
              onFocus={() => {
                const currentValue = watch('schoolName');
                if (currentValue && currentValue.length > 2) {
                  handleSchoolNameChange(currentValue);
                }
              }}
            />
          )}
        />

        {/* School suggestions dropdown */}
        {showSchoolSuggestions && schoolSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border-2 border-orange-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
            {schoolSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSchool(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="text-gray-700 font-medium">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Academic Level - Visual Selector */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Academic Level <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'high-school', label: 'High School', icon: BookOpen, description: 'Grades 9-12' },
            { value: 'college', label: 'College', icon: GraduationCap, description: 'Community or junior college' },
            { value: 'university', label: 'University', icon: School, description: '4-year institution' }
          ].map(({ value, label, icon: Icon, description }) => (
            <label key={value} className="relative cursor-pointer">
              <input
                {...register('schoolLevel')}
                type="radio"
                value={value}
                className="sr-only"
              />
              <div className={`rounded-xl border-2 p-4 transition-all text-center ${
                watchedSchoolLevel === value
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-orange-200/50 hover:border-orange-300 hover:bg-orange-50/50'
              }`}>
                <Icon className={`h-8 w-8 mx-auto mb-2 ${
                  watchedSchoolLevel === value ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <div className={`font-bold ${
                  watchedSchoolLevel === value ? 'text-orange-900' : 'text-gray-700'
                }`}>{label}</div>
                <div className="text-xs text-gray-500 mt-1">{description}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.schoolLevel && (
          <p className="mt-2 text-xs text-red-500 font-medium">{errors.schoolLevel.message}</p>
        )}
      </div>

      {/* Graduation Year and GPA Row */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Controller
          name="graduationYear"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="Graduation Year"
              required
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 10}
              placeholder="2025"
              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              error={errors.graduationYear?.message}
            />
          )}
        />

        <Controller
          name="gpa"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="GPA"
              type="number"
              step="0.01"
              min={0}
              max={4.0}
              placeholder="3.75"
              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              helperText="Scale of 0.0 - 4.0 (optional)"
            />
          )}
        />
      </div>

      {/* Major (only show for college/university) */}
      {(watchedSchoolLevel === 'college' || watchedSchoolLevel === 'university') && (
        <div className="relative" ref={majorInputRef}>
          <Controller
            name="major"
            control={control}
            render={({ field }) => (
              <OnboardingInput
                {...field}
                label="Major / Field of Study"
                placeholder="e.g., Business, Communications, Exercise Science"
                helperText="Your major can unlock specialized NIL opportunities"
                onChange={(e) => {
                  field.onChange(e);
                  handleMajorChange(e.target.value);
                }}
                onFocus={() => {
                  if (watchedMajor && watchedMajor.length > 1) {
                    handleMajorChange(watchedMajor);
                  }
                }}
              />
            )}
          />

          {/* Major suggestions dropdown */}
          {showMajorSuggestions && majorSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border-2 border-orange-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
              {majorSuggestions.map((major, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectMajor(major)}
                  className="w-full px-4 py-3 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <span className="text-gray-700 font-medium">{major}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NIL Education Note */}
      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <School className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1">Academic NIL Opportunities</h4>
            <p className="text-sm text-blue-700 leading-relaxed">
              Your academic level and major can unlock unique opportunities like tutoring partnerships,
              educational content creation, and academic performance bonuses from local businesses.
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
