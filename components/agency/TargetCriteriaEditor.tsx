'use client';

import { useState, useEffect } from 'react';
import { Target, Loader2, Save, Users, MapPin, GraduationCap } from 'lucide-react';
import { SPORTS, SCHOOL_LEVELS, US_STATES } from '@/lib/agency/target-criteria-service';

interface TargetCriteria {
  target_sports: string[];
  min_followers: number;
  max_followers?: number;
  target_states: string[];
  target_school_levels: string[];
  min_engagement_rate?: number;
  graduation_years?: number[];
}

interface TargetCriteriaEditorProps {
  accessToken: string;
  initialCriteria?: TargetCriteria;
  onSave?: (criteria: TargetCriteria) => void;
}

const FOLLOWER_OPTIONS = [
  { value: 0, label: 'Any' },
  { value: 1000, label: '1,000+' },
  { value: 5000, label: '5,000+' },
  { value: 10000, label: '10,000+' },
  { value: 25000, label: '25,000+' },
  { value: 50000, label: '50,000+' },
  { value: 100000, label: '100,000+' },
];

export function TargetCriteriaEditor({
  accessToken,
  initialCriteria,
  onSave,
}: TargetCriteriaEditorProps) {
  const [criteria, setCriteria] = useState<TargetCriteria>({
    target_sports: [],
    min_followers: 0,
    target_states: [],
    target_school_levels: [],
    ...initialCriteria,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch current criteria if not provided
  useEffect(() => {
    async function fetchCriteria() {
      if (initialCriteria) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/agency/target-criteria', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();

        if (result.success && result.data) {
          setCriteria({
            target_sports: result.data.target_sports || [],
            min_followers: result.data.min_followers || 0,
            max_followers: result.data.max_followers,
            target_states: result.data.target_states || [],
            target_school_levels: result.data.target_school_levels || [],
            min_engagement_rate: result.data.min_engagement_rate,
            graduation_years: result.data.graduation_years,
          });
        }
      } catch (err) {
        console.error('Failed to fetch criteria:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (accessToken) {
      fetchCriteria();
    }
  }, [accessToken, initialCriteria]);

  const toggleSport = (sport: string) => {
    setCriteria(prev => ({
      ...prev,
      target_sports: prev.target_sports.includes(sport)
        ? prev.target_sports.filter(s => s !== sport)
        : [...prev.target_sports, sport],
    }));
    setError(null);
    setSuccess(false);
  };

  const toggleSchoolLevel = (level: string) => {
    setCriteria(prev => ({
      ...prev,
      target_school_levels: prev.target_school_levels.includes(level)
        ? prev.target_school_levels.filter(l => l !== level)
        : [...prev.target_school_levels, level],
    }));
    setError(null);
    setSuccess(false);
  };

  const toggleState = (stateCode: string) => {
    setCriteria(prev => ({
      ...prev,
      target_states: prev.target_states.includes(stateCode)
        ? prev.target_states.filter(s => s !== stateCode)
        : [...prev.target_states, stateCode],
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/agency/target-criteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(criteria),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save target criteria');
      }

      setSuccess(true);
      onSave?.(criteria);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Target Criteria</h2>
            <p className="text-sm text-gray-500">Define what you're looking for in athlete partners</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Criteria
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Target criteria saved successfully!
        </div>
      )}

      <div className="space-y-8">
        {/* Sports */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-gray-500" />
            <h3 className="font-medium text-gray-900">Target Sports</h3>
            {criteria.target_sports.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                {criteria.target_sports.length} selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map(sport => (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition
                  ${criteria.target_sports.includes(sport)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Followers */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-500" />
            <h3 className="font-medium text-gray-900">Minimum Followers</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {FOLLOWER_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  setCriteria(prev => ({ ...prev, min_followers: option.value }));
                  setError(null);
                  setSuccess(false);
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition
                  ${criteria.min_followers === option.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* School Levels */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-gray-500" />
            <h3 className="font-medium text-gray-900">School Levels</h3>
            {criteria.target_school_levels.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                {criteria.target_school_levels.length} selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {SCHOOL_LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => toggleSchoolLevel(level.value)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition
                  ${criteria.target_school_levels.includes(level.value)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target States */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-500" />
            <h3 className="font-medium text-gray-900">Target States (Optional)</h3>
            {criteria.target_states.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                {criteria.target_states.length} selected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-3">
            Leave empty to target all states
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-xl">
            {US_STATES.map(state => (
              <button
                key={state.code}
                onClick={() => toggleState(state.code)}
                className={`
                  px-2.5 py-1 rounded text-xs font-medium transition
                  ${criteria.target_states.includes(state.code)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
                title={state.name}
              >
                {state.code}
              </button>
            ))}
          </div>
          {criteria.target_states.length > 0 && (
            <button
              onClick={() => setCriteria(prev => ({ ...prev, target_states: [] }))}
              className="mt-2 text-sm text-primary-500 hover:text-primary-600"
            >
              Clear all states
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
