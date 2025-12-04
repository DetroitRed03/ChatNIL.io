/**
 * Athlete Targeting Step
 * Captures: sports, geography, school levels, divisions
 */

'use client';

import { useState } from 'react';
import { Target, X } from 'lucide-react';
import { INTEREST_CATEGORIES, US_REGIONS, US_STATES } from '@/lib/agency-data';

interface AthleteTargetingStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const SPORTS_OPTIONS = INTEREST_CATEGORIES.filter(cat =>
  ['basketball', 'football', 'baseball', 'soccer', 'track_field', 'swimming', 'tennis', 'golf', 'volleyball', 'wrestling', 'gymnastics'].includes(cat.value)
);

const SCHOOL_LEVELS = [
  { value: 'high_school', label: 'High School' },
  { value: 'college', label: 'College/University' },
];

const DIVISIONS = [
  { value: 'division_1', label: 'Division I' },
  { value: 'division_2', label: 'Division II' },
  { value: 'division_3', label: 'Division III' },
  { value: 'naia', label: 'NAIA' },
  { value: 'juco', label: 'Junior College' },
];

export default function AthleteTargetingStep({ onNext, onBack, initialData }: AthleteTargetingStepProps) {
  const [formData, setFormData] = useState({
    target_sports: initialData?.target_sports || [],
    target_states: initialData?.target_states || [],
    target_regions: initialData?.target_regions || [],
    target_school_levels: initialData?.target_school_levels || [],
    target_divisions: initialData?.target_divisions || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleArrayItem = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item: string) => item !== value)
        : [...prev[field], value]
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.target_sports.length === 0) {
      newErrors.target_sports = 'Select at least one sport';
    }

    if (formData.target_regions.length === 0 && formData.target_states.length === 0) {
      newErrors.geography = 'Select at least one region or state';
    }

    if (formData.target_school_levels.length === 0) {
      newErrors.target_school_levels = 'Select at least one school level';
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
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Target className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Athlete Targeting</h2>
        <p className="text-gray-600">Define who you want to reach</p>
      </div>

      {/* Target Sports */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Target Sports <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SPORTS_OPTIONS.map(sport => (
            <button
              key={sport.value}
              type="button"
              onClick={() => toggleArrayItem('target_sports', sport.value)}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                formData.target_sports.includes(sport.value)
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
              }`}
            >
              <span className="mr-2">{sport.icon}</span>
              {sport.label}
            </button>
          ))}
        </div>
        {errors.target_sports && (
          <p className="mt-2 text-sm text-red-500">{errors.target_sports}</p>
        )}
      </div>

      {/* Geographic Targeting */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Geographic Focus <span className="text-red-500">*</span>
        </label>

        {/* Regions */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">REGIONS</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {US_REGIONS.map(region => (
              <button
                key={region.value}
                type="button"
                onClick={() => toggleArrayItem('target_regions', region.value)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all border ${
                  formData.target_regions.includes(region.value)
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                }`}
              >
                {region.label}
              </button>
            ))}
          </div>
        </div>

        {/* States */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">SPECIFIC STATES (Optional)</p>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {US_STATES.map(state => (
                <button
                  key={state.value}
                  type="button"
                  onClick={() => toggleArrayItem('target_states', state.value)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    formData.target_states.includes(state.value)
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  {state.value}
                </button>
              ))}
            </div>
          </div>
          {formData.target_states.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.target_states.map((state: string) => (
                <span key={state} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                  {state}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-purple-900"
                    onClick={() => toggleArrayItem('target_states', state)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
        {errors.geography && (
          <p className="mt-2 text-sm text-red-500">{errors.geography}</p>
        )}
      </div>

      {/* School Levels */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          School Levels <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {SCHOOL_LEVELS.map(level => (
            <button
              key={level.value}
              type="button"
              onClick={() => toggleArrayItem('target_school_levels', level.value)}
              className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 ${
                formData.target_school_levels.includes(level.value)
                  ? 'bg-purple-500 text-white border-purple-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
        {errors.target_school_levels && (
          <p className="mt-2 text-sm text-red-500">{errors.target_school_levels}</p>
        )}
      </div>

      {/* Divisions (only if college selected) */}
      {formData.target_school_levels.includes('college') && (
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Target Divisions (Optional)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DIVISIONS.map(division => (
              <button
                key={division.value}
                type="button"
                onClick={() => toggleArrayItem('target_divisions', division.value)}
                className={`px-4 py-3 rounded-xl font-semibold transition-all border-2 ${
                  formData.target_divisions.includes(division.value)
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300'
                }`}
              >
                {division.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
          className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
