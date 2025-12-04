'use client';

import { useState } from 'react';
import { OnboardingStepProps } from '@/lib/onboarding-types';

const SPORTS = [
  'Football', 'Basketball', 'Baseball', 'Soccer', 'Volleyball',
  'Track & Field', 'Swimming', 'Tennis', 'Golf', 'Wrestling',
  'Softball', 'Lacrosse', 'Hockey', 'Gymnastics', 'Cross Country',
  'Rowing', 'Cheerleading', 'Dance', 'Esports', 'Other'
];

const SCHOOL_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'college_d1', label: 'College - Division I' },
  { value: 'college_d2', label: 'College - Division II' },
  { value: 'college_d3', label: 'College - Division III' },
  { value: 'college_naia', label: 'College - NAIA' },
  { value: 'juco', label: 'Junior College' },
];

const CURRENT_YEAR = new Date().getFullYear();
const GRADUATION_YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + i);

export default function ParentAthleteInfoStep({ data, onNext, onBack, isFirst, isLast, isLoading }: OnboardingStepProps) {
  const [athleteFirstName, setAthleteFirstName] = useState<string>(
    data?.athlete_first_name || ''
  );
  const [athleteLastName, setAthleteLastName] = useState<string>(
    data?.athlete_last_name || ''
  );
  const [sport, setSport] = useState<string>(
    data?.athlete_sport || ''
  );
  const [schoolName, setSchoolName] = useState<string>(
    data?.athlete_school || ''
  );
  const [schoolLevel, setSchoolLevel] = useState<string>(
    data?.athlete_school_level || ''
  );
  const [graduationYear, setGraduationYear] = useState<string>(
    data?.athlete_graduation_year?.toString() || ''
  );
  const [state, setState] = useState<string>(
    data?.athlete_state || ''
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!athleteFirstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!athleteLastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!sport) {
      newErrors.sport = 'Please select a sport';
    }
    if (!schoolLevel) {
      newErrors.schoolLevel = 'Please select school level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onNext({
      athlete_first_name: athleteFirstName.trim(),
      athlete_last_name: athleteLastName.trim(),
      athlete_sport: sport,
      athlete_school: schoolName.trim() || null,
      athlete_school_level: schoolLevel,
      athlete_graduation_year: graduationYear ? parseInt(graduationYear) : null,
      athlete_state: state || null,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Your Athlete's Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tell us about your student-athlete so we can personalize their experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Athlete's First Name *
            </label>
            <input
              type="text"
              value={athleteFirstName}
              onChange={(e) => setAthleteFirstName(e.target.value)}
              placeholder="First name"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.firstName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Athlete's Last Name *
            </label>
            <input
              type="text"
              value={athleteLastName}
              onChange={(e) => setAthleteLastName(e.target.value)}
              placeholder="Last name"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.lastName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Sport */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Primary Sport *
          </label>
          <select
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.sport
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
          >
            <option value="">Select a sport...</option>
            {SPORTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.sport && (
            <p className="mt-1 text-sm text-red-500">{errors.sport}</p>
          )}
        </div>

        {/* School Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            School Level *
          </label>
          <select
            value={schoolLevel}
            onChange={(e) => setSchoolLevel(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${
              errors.schoolLevel
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
            } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent`}
          >
            <option value="">Select school level...</option>
            {SCHOOL_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          {errors.schoolLevel && (
            <p className="mt-1 text-sm text-red-500">{errors.schoolLevel}</p>
          )}
        </div>

        {/* School Name and Graduation Year */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              School Name
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g., State University"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expected Graduation Year
            </label>
            <select
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select year...</option>
              {GRADUATION_YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State
          </label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g., California"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            NIL rules vary by state - this helps us show relevant compliance information.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4 mt-8">
        {!isFirst && (
          <button
            onClick={onBack}
            disabled={isLoading}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 ${
            isFirst ? 'w-full' : 'flex-1'
          }`}
        >
          {isLoading ? 'Saving...' : isLast ? 'Complete' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
