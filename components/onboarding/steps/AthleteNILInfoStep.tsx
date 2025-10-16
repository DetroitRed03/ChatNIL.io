'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Target, Instagram, Twitter, Youtube, Hash, User, Briefcase, Shield, CheckCircle, AlertCircle, DollarSign, Loader2, Info } from 'lucide-react';
import { athleteNILInfoSchema, AthleteNILInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';

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
  isFirst,
  isLast,
  isLoading
}: OnboardingStepProps) {
  const { nextStep, updateFormData } = useOnboarding();
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
    formState: { errors, isValid }
  } = useForm<AthleteNILInfo>({
    resolver: zodResolver(athleteNILInfoSchema),
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

  // Validate social media handle format
  const validateHandle = (handle: string, platform: string) => {
    if (!handle) return true;
    const cleanHandle = handle.replace('@', '');
    const validFormat = /^[a-zA-Z0-9_.]+$/.test(cleanHandle);
    return validFormat;
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

    console.log('🎯 AthleteNILInfoStep: Starting form submission');
    console.log('📋 Form data:', formData);

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

      console.log('✅ Cleaned form data:', cleanedData);

      // Update form data in context
      updateFormData(cleanedData);

      // Attempt to progress to next step
      console.log('⏭️ Calling nextStep to trigger completion flow');
      const success = await nextStep(cleanedData);

      if (success) {
        console.log('🎉 Form submission successful, showing success message');
        setShowSuccessMessage(true);

        // Call onNext after brief delay to show success message
        setTimeout(() => {
          onNext(cleanedData);
        }, 500);
      } else {
        console.warn('⚠️ Step progression failed, but data was saved locally');
        setSubmitError('Unable to advance to the next step right now, but your data has been saved. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Form submission failed:', error);
      // Still update form data locally as fallback
      updateFormData(cleanedData);
      setSubmitError(
        error.message || 'An unexpected error occurred while saving your information. Your progress has been saved locally.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Introduction */}
      <div className="mb-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
        <div className="flex items-start">
          <div className="p-2 bg-orange-100 rounded-lg mr-4">
            <Target className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Build your NIL brand and opportunities
            </h3>
            <p className="text-orange-700 leading-relaxed">
              This information helps us match you with the most relevant NIL opportunities
              and ensures you're compliant with all regulations.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-start">
            <div className="p-1 bg-red-100 rounded-lg mr-3">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-red-900 mb-1">Submission Failed</h4>
              <p className="text-xs text-red-700">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-start">
            <div className="p-1 bg-green-100 rounded-lg mr-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-900 mb-1">Success!</h4>
              <p className="text-xs text-green-700">Your information has been saved. Taking you to the completion screen...</p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Personal Bio (Optional)
        </label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            {...register('bio')}
            rows={4}
            maxLength={500}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            placeholder="Tell brands and fans about yourself, your journey, and what makes you unique as an athlete..."
          />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-500">This helps brands understand your personality and story</p>
          <p className="text-xs text-gray-400">{watchedBio?.length || 0}/500</p>
        </div>
      </div>

      {/* Social Media Handles */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Social Media Handles (Optional)</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Instagram</label>
            <div className="relative">
              <Instagram className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                {...register('socialMediaHandles.instagram')}
                type="text"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="@username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Twitter/X</label>
            <div className="relative">
              <Twitter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                {...register('socialMediaHandles.twitter')}
                type="text"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="@username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">TikTok</label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                {...register('socialMediaHandles.tiktok')}
                type="text"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="@username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">YouTube</label>
            <div className="relative">
              <Youtube className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                {...register('socialMediaHandles.youtube')}
                type="text"
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="@channelname"
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Social media followers help determine sponsorship values and opportunities
        </p>
      </div>

      {/* Brand Interests */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">Brand Partnership Interests</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BRAND_CATEGORIES.map(({ id, label, icon: Icon, color }) => {
            const isSelected = selectedBrands.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleBrandInterest(id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 text-orange-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 mb-2 ${
                  isSelected ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <div className="text-sm font-medium">{label}</div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Select categories you're interested in for brand partnerships
        </p>
      </div>

      {/* NIL Goals with Educational Tooltips */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">NIL Goals & Interests</h4>
        <p className="text-xs text-gray-600 mb-4">
          Select the types of NIL opportunities you're interested in. Click the info icon to learn more about each option.
        </p>
        <div className="space-y-3">
          {NIL_GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            const isTooltipActive = activeTooltip === goal.id;

            return (
              <div key={goal.id} className="relative" data-tooltip-container>
                <label className="relative flex items-center group">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleNILGoal(goal.id)}
                    className="sr-only"
                  />
                  <div className={`flex items-center justify-between w-full p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 text-orange-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center flex-1">
                      <div className={`w-5 h-5 rounded border-2 mr-4 flex items-center justify-center ${
                        isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-semibold">{goal.label}</span>
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(goal.difficulty)}`}>
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
                  </div>
                </label>

                {/* Educational Tooltip */}
                {isTooltipActive && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-20">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 max-w-md mx-auto">
                      {/* Close button for mobile */}
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold text-gray-900">{goal.label}</h5>
                        <button
                          onClick={() => setActiveTooltip(null)}
                          className="text-gray-400 hover:text-gray-600 lg:hidden"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {/* Details */}
                        <div>
                          <p className="text-sm text-gray-700 leading-relaxed">{goal.details}</p>
                        </div>

                        {/* Key Info */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-green-50 p-2 rounded-lg">
                            <p className="font-medium text-green-800">Potential Earnings</p>
                            <p className="text-green-700">{goal.potentialEarnings}</p>
                          </div>
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <p className="font-medium text-blue-800">Time Commitment</p>
                            <p className="text-blue-700">{goal.timeCommitment}</p>
                          </div>
                        </div>

                        {/* Examples */}
                        <div>
                          <h6 className="text-xs font-semibold text-gray-900 mb-2">Real Examples:</h6>
                          <ul className="space-y-1">
                            {goal.examples.map((example, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-start">
                                <span className="w-1 h-1 bg-orange-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                <span>{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Getting Started Tip */}
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-orange-800 mb-1">💡 Getting Started Tip</p>
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
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start">
            <Target className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-medium text-blue-900 mb-1">New to NIL?</h5>
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
        <h4 className="text-sm font-medium text-gray-900 mb-4">Representation</h4>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              {...register('hasAgent')}
              type="checkbox"
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              I currently have an agent or NIL representation
            </span>
          </label>

          {watchedHasAgent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent/Representative Information
              </label>
              <textarea
                {...register('agentInfo')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Name, agency, contact information..."
              />
            </div>
          )}
        </div>
      </div>

      {/* Compliance Acknowledgment */}
      <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">NIL Compliance Requirements</h4>
            <div className="space-y-2 text-xs text-blue-800">
              <p>• All NIL activities must comply with NCAA, state, and institutional rules</p>
              <p>• You must report NIL activities to your school's compliance office as required</p>
              <p>• NIL deals cannot be used as recruiting inducements</p>
              <p>• School logos/marks require institutional permission</p>
            </div>

            <label className="flex items-center mt-4">
              <input
                type="checkbox"
                checked={acknowledgedCompliance}
                onChange={(e) => setAcknowledgedCompliance(e.target.checked)}
                className="rounded border-blue-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-blue-900">
                I understand and agree to comply with all NIL regulations
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={!acknowledgedCompliance || isLoading || isSubmitting || showSuccessMessage}
          className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
            acknowledgedCompliance && !isLoading && !isSubmitting && !showSuccessMessage
              ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading || isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving Information...' : 'Loading...'}
            </>
          ) : showSuccessMessage ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Redirecting...
            </>
          ) : (
            <>
              Complete Onboarding
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}