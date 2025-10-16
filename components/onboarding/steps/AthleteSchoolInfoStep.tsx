'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, School, GraduationCap, MapPin, BookOpen, Award } from 'lucide-react';
import { athleteSchoolInfoSchema, AthleteSchoolInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';

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
  isFirst,
  isLast,
  isLoading
}: OnboardingStepProps) {
  const { nextStep, updateFormData } = useOnboarding();
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
    formState: { errors, isValid }
  } = useForm<AthleteSchoolInfo>({
    resolver: zodResolver(athleteSchoolInfoSchema),
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
            <School className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Tell us about your academic journey
            </h3>
            <p className="text-orange-700 leading-relaxed">
              Your academic information helps us understand your NIL eligibility and connect you with
              education-focused opportunities and local brand partnerships.
            </p>
          </div>
        </div>
      </div>

      {/* School Name */}
      <div className="relative" ref={schoolInputRef}>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          School Name *
        </label>
        <div className="relative">
          <School className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            {...register('schoolName', {
              onChange: (e) => handleSchoolNameChange(e.target.value)
            })}
            type="text"
            onFocus={() => {
              const currentValue = watch('schoolName');
              if (currentValue && currentValue.length > 2) {
                handleSchoolNameChange(currentValue);
              }
            }}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
              errors.schoolName
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
            }`}
            placeholder="e.g., Jefferson High School, UCLA, etc."
          />
        </div>
        {errors.schoolName && (
          <p className="mt-1 text-sm text-red-600">{errors.schoolName.message}</p>
        )}

        {/* School suggestions */}
        {showSchoolSuggestions && schoolSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {schoolSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSchool(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Academic Level */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Academic Level *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'high-school', label: 'High School', icon: BookOpen },
            { value: 'college', label: 'College', icon: GraduationCap },
            { value: 'university', label: 'University', icon: School }
          ].map(({ value, label, icon: Icon }) => (
            <label key={value} className="relative">
              <input
                {...register('schoolLevel')}
                type="radio"
                value={value}
                className="sr-only"
              />
              <div className={`cursor-pointer rounded-xl border-2 p-4 transition-all text-center ${
                watchedSchoolLevel === value
                  ? 'border-orange-500 bg-orange-50 text-orange-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}>
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  watchedSchoolLevel === value ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <div className="font-medium">{label}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.schoolLevel && (
          <p className="mt-1 text-sm text-red-600">{errors.schoolLevel.message}</p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Graduation Year */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Graduation Year *
          </label>
          <div className="relative">
            <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('graduationYear', { valueAsNumber: true })}
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 10}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.graduationYear
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="2025"
            />
          </div>
          {errors.graduationYear && (
            <p className="mt-1 text-sm text-red-600">{errors.graduationYear.message}</p>
          )}
        </div>

        {/* GPA */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            GPA (Optional)
          </label>
          <div className="relative">
            <Award className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('gpa', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              max="4.0"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="3.75"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Scale of 0.0 - 4.0 (helps with academic sponsorships)</p>
        </div>
      </div>

      {/* Major (only show for college/university) */}
      {(watchedSchoolLevel === 'college' || watchedSchoolLevel === 'university') && (
        <div className="relative" ref={majorInputRef}>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Major / Field of Study
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('major', {
                onChange: (e) => handleMajorChange(e.target.value)
              })}
              type="text"
              onFocus={() => {
                const currentValue = watchedMajor;
                if (currentValue && currentValue.length > 1) {
                  handleMajorChange(currentValue);
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="e.g., Business, Communications, Exercise Science"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Your major can unlock specialized NIL opportunities</p>

          {/* Major suggestions */}
          {showMajorSuggestions && majorSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {majorSuggestions.map((major, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectMajor(major)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  {major}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NIL Education Note */}
      <div className="p-4 bg-blue-50 rounded-xl">
        <div className="flex items-start">
          <div className="p-1 bg-blue-100 rounded-lg mr-3">
            <School className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Academic NIL Opportunities</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              Your academic level and major can unlock unique opportunities like tutoring partnerships,
              educational content creation, and academic performance bonuses from local businesses.
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