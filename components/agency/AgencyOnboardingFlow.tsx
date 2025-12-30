'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Building2,
  Heart,
  Target,
  Mail,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from 'lucide-react';
import { INDUSTRIES, AGENCY_ONBOARDING_STEPS, type CompanySize } from '@/types/agency';
import { COMPANY_SIZE_LABELS } from '@/types/agency';
import { US_STATES, SPORTS, SCHOOL_LEVELS } from '@/lib/agency/target-criteria-service';

interface OnboardingData {
  // Step 1: Company Info
  company_name: string;
  industry: string;
  company_size: CompanySize | '';
  description: string;
  tagline: string;
  website: string;
  founded_year: string;
  headquarters_city: string;
  headquarters_state: string;

  // Step 2: Brand Values
  brand_values: { trait_id: string; priority: number }[];

  // Step 3: Target Criteria
  target_sports: string[];
  min_followers: number;
  target_states: string[];
  target_school_levels: string[];

  // Step 4: Contact & Social
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  linkedin_url: string;
  instagram_url: string;
  twitter_url: string;
}

const initialData: OnboardingData = {
  company_name: '',
  industry: '',
  company_size: '',
  description: '',
  tagline: '',
  website: '',
  founded_year: '',
  headquarters_city: '',
  headquarters_state: '',
  brand_values: [],
  target_sports: [],
  min_followers: 0,
  target_states: [],
  target_school_levels: [],
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  linkedin_url: '',
  instagram_url: '',
  twitter_url: '',
};

export function AgencyOnboardingFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [availableTraits, setAvailableTraits] = useState<
    { id: string; name: string; display_name: string; category: string }[]
  >([]);

  // Get session on mount
  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }
    }
    getSession();
  }, []);

  // Fetch available traits for brand values
  useEffect(() => {
    async function fetchTraits() {
      if (!accessToken) return;
      try {
        const response = await fetch('/api/agency/brand-values?available=true', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const result = await response.json();
        if (result.success && result.data) {
          setAvailableTraits(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch traits:', err);
      }
    }

    fetchTraits();
  }, [accessToken]);

  // Pre-fill contact email
  useEffect(() => {
    if (user?.email && !data.contact_email) {
      setData(prev => ({ ...prev, contact_email: user.email || '' }));
    }
  }, [user?.email, data.contact_email]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < AGENCY_ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create agency profile
      const profileResponse = await fetch('/api/agency/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          company_name: data.company_name,
          industry: data.industry,
          company_size: data.company_size || undefined,
          description: data.description || undefined,
          tagline: data.tagline || undefined,
          website: data.website || undefined,
          founded_year: data.founded_year ? parseInt(data.founded_year) : undefined,
          headquarters_city: data.headquarters_city || undefined,
          headquarters_state: data.headquarters_state || undefined,
          contact_name: data.contact_name || undefined,
          contact_email: data.contact_email || undefined,
          contact_phone: data.contact_phone || undefined,
          linkedin_url: data.linkedin_url || undefined,
          instagram_url: data.instagram_url || undefined,
          twitter_url: data.twitter_url || undefined,
        }),
      });

      const profileResult = await profileResponse.json();

      if (!profileResult.success) {
        throw new Error(profileResult.error || 'Failed to create profile');
      }

      // Step 2: Set brand values
      if (data.brand_values.length > 0) {
        await fetch('/api/agency/brand-values', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            values: data.brand_values,
          }),
        });
      }

      // Step 3: Set target criteria
      await fetch('/api/agency/target-criteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          target_sports: data.target_sports,
          min_followers: data.min_followers,
          target_states: data.target_states,
          target_school_levels: data.target_school_levels,
        }),
      });

      // Step 4: Mark onboarding complete
      await fetch('/api/agency/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action: 'complete_onboarding',
        }),
      });

      // Redirect to agency dashboard
      router.push('/agency/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
      setIsLoading(false);
    }
  };

  const stepIcons = [Building2, Heart, Target, Mail];

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return data.company_name.trim() !== '' && data.industry !== '';
      case 1:
        return true; // Brand values are optional
      case 2:
        return true; // Target criteria are optional
      case 3:
        return true; // Contact info is optional
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-accent-50/20">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {AGENCY_ONBOARDING_STEPS.map((step, index) => {
              const Icon = stepIcons[index];
              const isActive = index === currentStep;
              const isComplete = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center transition-all
                      ${isComplete ? 'bg-primary-500 text-white' : ''}
                      ${isActive ? 'bg-primary-500 text-white ring-4 ring-primary-100' : ''}
                      ${!isComplete && !isActive ? 'bg-gray-100 text-gray-400' : ''}
                    `}
                  >
                    {isComplete ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  {index < AGENCY_ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                        isComplete ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {AGENCY_ONBOARDING_STEPS[currentStep].title}
            </h2>
            <p className="text-gray-600 mt-1">
              {AGENCY_ONBOARDING_STEPS[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 0: Company Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={data.company_name}
                  onChange={e => updateData({ company_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <select
                  value={data.industry}
                  onChange={e => updateData({ industry: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map(industry => (
                    <option key={industry.name} value={industry.name}>
                      {industry.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={data.company_size}
                    onChange={e => updateData({ company_size: e.target.value as CompanySize })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select size</option>
                    {(Object.keys(COMPANY_SIZE_LABELS) as CompanySize[]).map(size => (
                      <option key={size} value={size}>
                        {COMPANY_SIZE_LABELS[size]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={data.founded_year}
                    onChange={e => updateData({ founded_year: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2020"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={data.website}
                  onChange={e => updateData({ website: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={data.tagline}
                  onChange={e => updateData({ tagline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="A brief slogan for your company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={data.description}
                  onChange={e => updateData({ description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell athletes about your company and what you're looking for..."
                />
              </div>
            </div>
          )}

          {/* Step 1: Brand Values */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Select up to 5 values that best represent your brand. These will be used to match you with athletes who share similar values.
              </p>

              {availableTraits.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                  <p className="text-gray-500 mt-2">Loading values...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableTraits.map(trait => {
                    const isSelected = data.brand_values.some(v => v.trait_id === trait.id);
                    const selectionIndex = data.brand_values.findIndex(v => v.trait_id === trait.id);

                    return (
                      <button
                        key={trait.id}
                        onClick={() => {
                          if (isSelected) {
                            updateData({
                              brand_values: data.brand_values.filter(v => v.trait_id !== trait.id),
                            });
                          } else if (data.brand_values.length < 5) {
                            updateData({
                              brand_values: [
                                ...data.brand_values,
                                { trait_id: trait.id, priority: data.brand_values.length + 1 },
                              ],
                            });
                          }
                        }}
                        disabled={!isSelected && data.brand_values.length >= 5}
                        className={`
                          p-4 rounded-xl border-2 text-left transition-all relative
                          ${isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'}
                          ${!isSelected && data.brand_values.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {selectionIndex + 1}
                          </span>
                        )}
                        <span className="font-medium text-gray-900">{trait.display_name}</span>
                        <span className="block text-xs text-gray-500 capitalize mt-1">
                          {trait.category.replace('_', ' ')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-sm text-gray-500">
                Selected: {data.brand_values.length}/5 values
              </p>
            </div>
          )}

          {/* Step 2: Target Criteria */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Define what you're looking for in athlete partners. This helps us show you the most relevant matches.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Sports
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPORTS.slice(0, 12).map(sport => (
                    <button
                      key={sport}
                      onClick={() => {
                        if (data.target_sports.includes(sport)) {
                          updateData({
                            target_sports: data.target_sports.filter(s => s !== sport),
                          });
                        } else {
                          updateData({
                            target_sports: [...data.target_sports, sport],
                          });
                        }
                      }}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${data.target_sports.includes(sport)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Followers
                </label>
                <select
                  value={data.min_followers}
                  onChange={e => updateData({ min_followers: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={0}>Any</option>
                  <option value={1000}>1,000+</option>
                  <option value={5000}>5,000+</option>
                  <option value={10000}>10,000+</option>
                  <option value={25000}>25,000+</option>
                  <option value={50000}>50,000+</option>
                  <option value={100000}>100,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {SCHOOL_LEVELS.map(level => (
                    <button
                      key={level.value}
                      onClick={() => {
                        if (data.target_school_levels.includes(level.value)) {
                          updateData({
                            target_school_levels: data.target_school_levels.filter(
                              l => l !== level.value
                            ),
                          });
                        } else {
                          updateData({
                            target_school_levels: [...data.target_school_levels, level.value],
                          });
                        }
                      }}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${data.target_school_levels.includes(level.value)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target States (optional)
                </label>
                <select
                  multiple
                  value={data.target_states}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    updateData({ target_states: selected });
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent h-32"
                >
                  {US_STATES.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Hold Ctrl/Cmd to select multiple states
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Contact & Social */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={data.contact_name}
                    onChange={e => updateData({ contact_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={data.contact_phone}
                    onChange={e => updateData({ contact_phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={data.contact_email}
                  onChange={e => updateData({ contact_email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="contact@company.com"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Social Media Links</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={data.linkedin_url}
                      onChange={e => updateData({ linkedin_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={data.instagram_url}
                      onChange={e => updateData({ instagram_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://instagram.com/yourcompany"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter/X
                    </label>
                    <input
                      type="url"
                      value={data.twitter_url}
                      onChange={e => updateData({ twitter_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://twitter.com/yourcompany"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                ${currentStep === 0
                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                  : 'text-gray-600 hover:bg-gray-100'}
              `}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {currentStep < AGENCY_ONBOARDING_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                  ${isStepValid()
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                `}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-primary-500 text-white hover:bg-primary-600 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
