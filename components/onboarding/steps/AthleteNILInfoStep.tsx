'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, Target, Instagram, Twitter, Youtube, Hash, User, Briefcase, Shield, CheckCircle, AlertCircle, DollarSign, Loader2, Info, SkipForward, Save } from 'lucide-react';
import { athleteNILInfoSchema, AthleteNILInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import {
  OnboardingInput,
  OnboardingTextarea,
  OnboardingButton,
} from '@/components/ui/OnboardingInput';

// Brand categories for interests
const BRAND_CATEGORIES = [
  { id: 'sports-equipment', label: 'Sports Equipment', icon: Target, color: 'orange' },
  { id: 'apparel', label: 'Apparel & Fashion', icon: User, color: 'purple' },
  { id: 'food-beverage', label: 'Food & Beverage', icon: DollarSign, color: 'green' },
  { id: 'technology', label: 'Technology', icon: Briefcase, color: 'blue' },
  { id: 'health-fitness', label: 'Health & Fitness', icon: Target, color: 'red' },
  { id: 'education', label: 'Education & Tutoring', icon: User, color: 'indigo' },
  { id: 'automotive', label: 'Automotive', icon: DollarSign, color: 'gray' },
  { id: 'gaming', label: 'Gaming', icon: Briefcase, color: 'green' },
  { id: 'local-business', label: 'Local Businesses', icon: Target, color: 'yellow' },
  { id: 'social-media', label: 'Social Media Platforms', icon: Instagram, color: 'pink' }
];

// Enhanced NIL goal options with educational information
const NIL_GOALS = [
  {
    id: 'social-media',
    label: 'Social Media Partnerships',
    description: 'Promote brands on Instagram, TikTok, etc.',
    details: 'Partner with brands to create sponsored posts, stories, and videos on your social media platforms. Perfect for athletes with growing followers.',
    examples: [
      'LSU gymnast Livvy Dunne earned $2M+ through Instagram partnerships',
      'UConn basketball players promoting sports drinks on TikTok',
      'Track athletes partnering with athletic wear brands for post content'
    ],
    difficulty: 'easy',
    potentialEarnings: '$100 - $10,000+ per post',
    timeCommitment: '1-3 hours per week'
  },
  {
    id: 'merchandise',
    label: 'Personal Merchandise Sales',
    description: 'Sell branded clothing, equipment with your name/image',
    details: 'Create and sell your own merchandise like t-shirts, hoodies, water bottles, or sports equipment featuring your name, number, or personal brand.',
    examples: [
      'Stanford basketball player selling custom jerseys with their number',
      'Softball players creating signature bat wraps and gloves',
      'Swimmers launching swimwear lines with their personal logos'
    ],
    difficulty: 'moderate',
    potentialEarnings: '$500 - $50,000+ annually',
    timeCommitment: '5-10 hours per week'
  },
  {
    id: 'appearances',
    label: 'Paid Appearances & Events',
    description: 'Attend grand openings, signings, speaking events',
    details: 'Show up to business events, grand openings, autograph signings, youth camps, and community events as a paid guest or speaker.',
    examples: [
      'Football players attending car dealership grand openings ($500-2000)',
      'Basketball stars signing autographs at sports memorabilia stores',
      'Soccer players speaking at youth soccer league banquets'
    ],
    difficulty: 'easy',
    potentialEarnings: '$250 - $5,000+ per event',
    timeCommitment: '2-8 hours per event'
  },
  {
    id: 'camps-coaching',
    label: 'Sports Camps & Coaching',
    description: 'Teach skills at camps or private lessons',
    details: 'Share your athletic expertise by coaching at summer camps, giving private lessons, or hosting clinics for younger athletes in your sport.',
    examples: [
      'Tennis players offering private lessons at $75-150/hour',
      'Football players coaching at youth summer camps',
      'Gymnasts hosting weekend training clinics for beginners'
    ],
    difficulty: 'easy',
    potentialEarnings: '$25 - $200+ per hour',
    timeCommitment: '3-15 hours per week'
  },
  {
    id: 'content-creation',
    label: 'Content Creation',
    description: 'YouTube videos, podcasts, blog posts',
    details: 'Create educational or entertaining content about your sport, training routines, day-in-the-life videos, or collaborations with brands.',
    examples: [
      'Volleyball players creating training tip YouTube channels',
      'Track athletes starting "Race Day Prep" podcast series',
      'Swimmers blogging about training nutrition and recovery'
    ],
    difficulty: 'moderate',
    potentialEarnings: '$200 - $15,000+ per month',
    timeCommitment: '8-20 hours per week'
  },
  {
    id: 'local-endorsements',
    label: 'Local Business Endorsements',
    description: 'Partner with restaurants, gyms, local companies',
    details: 'Represent local businesses in your college town or hometown through social media posts, in-store appearances, or promotional materials.',
    examples: [
      'Basketball players partnering with local pizza shops for free meals + pay',
      'Runners endorsing local running stores and gear shops',
      'Softball players promoting local sports medicine clinics'
    ],
    difficulty: 'easy',
    potentialEarnings: '$100 - $5,000+ per partnership',
    timeCommitment: '1-5 hours per week'
  },
  {
    id: 'brand-partnerships',
    label: 'Major Brand Partnership Deals',
    description: 'Formal contracts with established companies',
    details: 'Long-term partnerships with major brands involving exclusive agreements, product endorsements, and comprehensive marketing campaigns.',
    examples: [
      'Top college football players signing with Nike or Adidas',
      'Elite gymnasts partnering with athletic wear companies',
      'Star basketball players becoming faces of sports drink brands'
    ],
    difficulty: 'hard',
    potentialEarnings: '$5,000 - $1M+ annually',
    timeCommitment: '10-25 hours per week'
  },
  {
    id: 'autographs',
    label: 'Autograph Signings',
    description: 'Paid autograph sessions and memorabilia',
    details: 'Sign autographs on photos, jerseys, equipment, or trading cards at organized events or through online platforms and memorabilia companies.',
    examples: [
      'Football stars signing helmets and jerseys at sports card shows',
      'Baseball players doing signing sessions at local sports stores',
      'Basketball players signing shoes and posters for fans'
    ],
    difficulty: 'easy',
    potentialEarnings: '$200 - $3,000+ per session',
    timeCommitment: '2-6 hours per session'
  }
];

export default function AthleteNILInfoStep({
  data,
  onNext,
  onBack,
  onSkip,
  onSaveAndExit,
  isFirst,
  isLast,
  isLoading,
  allowSkip = false // This is the final step, so skip should be disabled by default
}: OnboardingStepProps) {
  const { nextStep, previousStep, skipStep, saveAndExit, updateFormData } = useOnboarding();
  const [selectedBrands, setSelectedBrands] = useState<string[]>(data.brandInterests || []);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(data.nilGoals || []);
  const [acknowledgedCompliance, setAcknowledgedCompliance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors, isValid }
  } = useForm<AthleteNILInfo>({
    resolver: zodResolver(athleteNILInfoSchema) as any,
    defaultValues: {
      bio: data.bio || '',
      socialMediaHandles: {
        instagram: data.socialMediaHandles?.instagram || '',
        twitter: data.socialMediaHandles?.twitter || '',
        tiktok: data.socialMediaHandles?.tiktok || '',
        youtube: data.socialMediaHandles?.youtube || '',
      },
      brandInterests: data.brandInterests || [],
      nilGoals: data.nilGoals || [],
      hasAgent: data.hasAgent || false,
      agentInfo: data.agentInfo || '',
    },
    mode: 'onChange'
  });

  const watchedBio = watch('bio');
  const watchedHasAgent = watch('hasAgent');

  const toggleBrandInterest = (brandId: string) => {
    const updated = selectedBrands.includes(brandId)
      ? selectedBrands.filter(id => id !== brandId)
      : [...selectedBrands, brandId];
    setSelectedBrands(updated);
    setValue('brandInterests', updated);
  };

  const toggleNILGoal = (goalId: string) => {
    const updated = selectedGoals.includes(goalId)
      ? selectedGoals.filter(id => id !== goalId)
      : [...selectedGoals, goalId];
    setSelectedGoals(updated);
    setValue('nilGoals', updated);
  };

  const formatHandle = (handle: string) => {
    if (!handle) return '';
    return handle.startsWith('@') ? handle : `@${handle}`;
  };

  // Get difficulty color classes
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Toggle tooltip visibility
  const toggleTooltip = (goalId: string) => {
    setActiveTooltip(activeTooltip === goalId ? null : goalId);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (activeTooltip && !target.closest('[data-tooltip-container]')) {
        setActiveTooltip(null);
      }
    };

    if (activeTooltip) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeTooltip]);

  const onSubmit = async (formData: AthleteNILInfo) => {
    if (!acknowledgedCompliance) {
      setSubmitError('Please acknowledge the compliance requirements before proceeding.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setShowSuccessMessage(false);

    // Clean and format social media handles
    const cleanedData = {
      ...formData,
      socialMediaHandles: {
        instagram: formData.socialMediaHandles?.instagram ? formatHandle(formData.socialMediaHandles.instagram) : '',
        twitter: formData.socialMediaHandles?.twitter ? formatHandle(formData.socialMediaHandles.twitter) : '',
        tiktok: formData.socialMediaHandles?.tiktok ? formatHandle(formData.socialMediaHandles.tiktok) : '',
        youtube: formData.socialMediaHandles?.youtube ? formatHandle(formData.socialMediaHandles.youtube) : '',
      },
      brandInterests: selectedBrands,
      nilGoals: selectedGoals,
    };

    try {
      updateFormData(cleanedData);
      const success = await nextStep(cleanedData);

      if (success) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          onNext(cleanedData);
        }, 500);
      } else {
        console.warn('Step progression failed, but data was saved locally');
        setSubmitError('Unable to advance to the next step right now, but your data has been saved. Please try again.');
      }
    } catch (error: any) {
      console.error('Form submission failed:', error);
      updateFormData(cleanedData);
      setSubmitError(
        error.message || 'An unexpected error occurred while saving your information. Your progress has been saved locally.'
      );
    } finally {
      setIsSubmitting(false);
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
            <Target className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-orange-900 mb-1">
              Build your NIL brand and opportunities
            </h3>
            <p className="text-sm text-orange-700 leading-relaxed">
              This information helps us match you with the most relevant NIL opportunities
              and ensures you're compliant with all regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900 mb-1">Submission Failed</h4>
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-green-900 mb-1">Success!</h4>
              <p className="text-sm text-green-700">Your information has been saved. Taking you to the completion screen...</p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Bio */}
      <Controller
        name="bio"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <OnboardingTextarea
              {...field}
              label="Personal Bio"
              placeholder="Tell brands and fans about yourself, your journey, and what makes you unique as an athlete..."
              helperText="This helps brands understand your personality and story (optional)"
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-end">
              <span className="text-xs text-gray-400">{watchedBio?.length || 0}/500</span>
            </div>
          </div>
        )}
      />

      {/* Social Media Handles */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-4">Social Media Handles</label>
        <div className="grid sm:grid-cols-2 gap-4">
          <Controller
            name="socialMediaHandles.instagram"
            control={control}
            render={({ field }) => (
              <OnboardingInput
                {...field}
                label="Instagram"
                placeholder="@username"
              />
            )}
          />

          <Controller
            name="socialMediaHandles.twitter"
            control={control}
            render={({ field }) => (
              <OnboardingInput
                {...field}
                label="Twitter/X"
                placeholder="@username"
              />
            )}
          />

          <Controller
            name="socialMediaHandles.tiktok"
            control={control}
            render={({ field }) => (
              <OnboardingInput
                {...field}
                label="TikTok"
                placeholder="@username"
              />
            )}
          />

          <Controller
            name="socialMediaHandles.youtube"
            control={control}
            render={({ field }) => (
              <OnboardingInput
                {...field}
                label="YouTube"
                placeholder="@channelname"
              />
            )}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Social media followers help determine sponsorship values and opportunities (optional)
        </p>
      </div>

      {/* Brand Interests */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-4">Brand Partnership Interests</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BRAND_CATEGORIES.map(({ id, label, icon: Icon }) => {
            const isSelected = selectedBrands.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleBrandInterest(id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 shadow-md'
                    : 'border-orange-200/50 hover:border-orange-300 hover:bg-orange-50/50'
                }`}
              >
                <Icon className={`h-5 w-5 mb-2 ${
                  isSelected ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-semibold ${isSelected ? 'text-orange-900' : 'text-gray-700'}`}>{label}</div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select categories you're interested in for brand partnerships (optional)
        </p>
      </div>

      {/* NIL Goals with Educational Tooltips */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">NIL Goals & Interests</label>
        <p className="text-xs text-gray-600 mb-4">
          Select the types of NIL opportunities you're interested in. Click the info icon to learn more.
        </p>
        <div className="space-y-3">
          {NIL_GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            const isTooltipActive = activeTooltip === goal.id;

            return (
              <div key={goal.id} className="relative" data-tooltip-container>
                <button
                  type="button"
                  onClick={() => toggleNILGoal(goal.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-orange-200/50 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <div className={`w-5 h-5 rounded-md border-2 mr-4 flex items-center justify-center ${
                      isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}>
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isSelected ? 'text-orange-900' : 'text-gray-700'}`}>{goal.label}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getDifficultyColor(goal.difficulty)}`}>
                          {goal.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{goal.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleTooltip(goal.id);
                    }}
                    className={`ml-3 p-2 rounded-full transition-colors ${
                      isTooltipActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600'
                    }`}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </button>

                {/* Educational Tooltip */}
                {isTooltipActive && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-20">
                    <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-gray-900">{goal.label}</h5>
                        <button
                          type="button"
                          onClick={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm text-gray-700 leading-relaxed">{goal.details}</p>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="font-bold text-green-800">Potential Earnings</p>
                            <p className="text-green-700">{goal.potentialEarnings}</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="font-bold text-blue-800">Time Commitment</p>
                            <p className="text-blue-700">{goal.timeCommitment}</p>
                          </div>
                        </div>

                        <div>
                          <h6 className="text-xs font-bold text-gray-900 mb-2">Real Examples:</h6>
                          <ul className="space-y-1">
                            {goal.examples.map((example, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-start">
                                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs font-bold text-orange-800 mb-1">Getting Started Tip</p>
                          <p className="text-xs text-orange-700">
                            {goal.difficulty === 'easy' && "Perfect for beginners! Start building your personal brand and connecting with local businesses."}
                            {goal.difficulty === 'moderate' && "Build your social media presence first, then explore these opportunities as you gain followers."}
                            {goal.difficulty === 'hard' && "Focus on excelling in your sport and building a strong personal brand before pursuing these high-level partnerships."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Educational note */}
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200/50">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-bold text-blue-900 mb-1">New to NIL?</h5>
              <p className="text-xs text-blue-800 leading-relaxed">
                Start with "easy" opportunities like local endorsements and social media partnerships.
                Build your personal brand and follower count before pursuing major brand deals.
                Remember, authenticity and compliance are key to long-term success.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Information */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-4">Representation</label>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              {...register('hasAgent')}
              type="checkbox"
              className="w-5 h-5 rounded border-2 border-orange-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">
              I currently have an agent or NIL representation
            </span>
          </label>

          {watchedHasAgent && (
            <Controller
              name="agentInfo"
              control={control}
              render={({ field }) => (
                <OnboardingTextarea
                  {...field}
                  label="Agent/Representative Information"
                  placeholder="Name, agency, contact information..."
                  rows={3}
                />
              )}
            />
          )}
        </div>
      </div>

      {/* Compliance Acknowledgment */}
      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-blue-900 mb-3">NIL Compliance Requirements</h4>
            <div className="space-y-2 text-sm text-blue-800 mb-4">
              <p>• All NIL activities must comply with NCAA, state, and institutional rules</p>
              <p>• You must report NIL activities to your school's compliance office as required</p>
              <p>• NIL deals cannot be used as recruiting inducements</p>
              <p>• School logos/marks require institutional permission</p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedCompliance}
                onChange={(e) => setAcknowledgedCompliance(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-blue-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-blue-900">
                I understand and agree to comply with all NIL regulations <span className="text-red-500">*</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
        {/* Left side - Back and Save buttons */}
        <div className="flex gap-3">
          {!isFirst && (
            <OnboardingButton
              type="button"
              variant="secondary"
              size="md"
              onClick={handleBack}
              disabled={isLoading || isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
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
            disabled={isLoading || isSubmitting}
          >
            <Save className="h-4 w-4" />
            Save & Exit
          </OnboardingButton>
        </div>

        {/* Right side - Complete button */}
        <OnboardingButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={!acknowledgedCompliance || isLoading || isSubmitting || showSuccessMessage}
          isLoading={isLoading || isSubmitting}
        >
          {showSuccessMessage ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Redirecting...
            </>
          ) : (
            <>
              Complete Onboarding
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </OnboardingButton>
      </div>

      {/* Required field indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Fields marked with <span className="text-red-500">*</span> are required
        </p>
      </div>
    </form>
  );
}
