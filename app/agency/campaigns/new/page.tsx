/**
 * Enhanced Campaign Creation Page
 *
 * Multi-step campaign creation that captures all matchmaking criteria:
 * - Campaign basics (name, description, budget)
 * - Athlete targeting (sports, geography, demographics)
 * - Social media requirements (followers, engagement)
 * - NIL preferences (deal types, content types)
 * - Brand values and interests
 *
 * Aligns with the 11-factor matchmaking engine
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket,
  Target,
  Users,
  TrendingUp,
  Heart,
  ArrowLeft,
  ArrowRight,
  Check,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/AuthGuard';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

// Import campaign creation steps
import CampaignBasicsStep from '@/components/campaigns/steps/CampaignBasicsStep';
import AthleteTargetingStep from '@/components/campaigns/steps/AthleteTargetingStep';
import SocialRequirementsStep from '@/components/campaigns/steps/SocialRequirementsStep';
import NILPreferencesStep from '@/components/campaigns/steps/NILPreferencesStep';
import BrandValuesStep from '@/components/campaigns/steps/BrandValuesStep';
import CampaignReviewStep from '@/components/campaigns/steps/CampaignReviewStep';

interface CampaignData {
  // Step 1: Basics
  name: string;
  description: string;
  campaign_type: string;
  total_budget: number;
  budget_per_athlete: number;
  start_date?: string;
  end_date?: string;

  // Step 2: Athlete Targeting
  target_sports: string[];
  target_states: string[];
  target_regions: string[];
  target_school_levels: string[]; // ['high_school', 'college']
  target_divisions: string[]; // ['D1', 'D2', 'D3']

  // Step 3: Social Requirements
  min_followers: number;
  min_engagement_rate: number;
  preferred_platforms: string[];
  content_quality_required: boolean;

  // Step 4: NIL Preferences
  preferred_deal_types: string[];
  content_types_needed: string[];
  partnership_length: string;
  exclusivity_required: boolean;
  travel_required: boolean;
  max_travel_distance: number;

  // Step 5: Brand Values
  brand_values: string[];
  required_interests: string[];
  blacklist_categories: string[];
}

const steps = [
  { id: 1, name: 'Campaign Basics', icon: Rocket, description: 'Name, budget, dates' },
  { id: 2, name: 'Athlete Targeting', icon: Target, description: 'Sports, location, demographics' },
  { id: 3, name: 'Social Requirements', icon: TrendingUp, description: 'Followers, engagement' },
  { id: 4, name: 'NIL Preferences', icon: Users, description: 'Deal types, content' },
  { id: 5, name: 'Brand Values', icon: Heart, description: 'Values, interests' },
  { id: 6, name: 'Review & Create', icon: Check, description: 'Confirm details' },
];

function CampaignCreationContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignData, setCampaignData] = useState<Partial<CampaignData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStepData = (stepData: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...stepData }));
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/agency/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) throw new Error('Failed to create campaign');

      const result = await response.json();
      router.push(`/agency/campaigns/${result.campaign.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CampaignBasicsStep
            onNext={handleStepData}
            initialData={campaignData}
          />
        );
      case 2:
        return (
          <AthleteTargetingStep
            onNext={handleStepData}
            onBack={handleBack}
            initialData={campaignData}
          />
        );
      case 3:
        return (
          <SocialRequirementsStep
            onNext={handleStepData}
            onBack={handleBack}
            initialData={campaignData}
          />
        );
      case 4:
        return (
          <NILPreferencesStep
            onNext={handleStepData}
            onBack={handleBack}
            initialData={campaignData}
          />
        );
      case 5:
        return (
          <BrandValuesStep
            onNext={handleStepData}
            onBack={handleBack}
            initialData={campaignData}
          />
        );
      case 6:
        return (
          <CampaignReviewStep
            campaignData={campaignData}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/agency/campaigns')}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Campaigns
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">Create New Campaign</h1>
            <p className="text-white/90 text-lg font-medium">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-orange-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all',
                        isActive && 'border-orange-500 bg-orange-500 shadow-lg shadow-orange-200/50',
                        isCompleted && 'border-green-500 bg-green-500',
                        !isActive && !isCompleted && 'border-gray-300 bg-white'
                      )}
                    >
                      <StepIcon
                        className={cn(
                          'w-6 h-6',
                          (isActive || isCompleted) && 'text-white',
                          !isActive && !isCompleted && 'text-gray-400'
                        )}
                      />
                    </div>
                    <div className="mt-2 text-center hidden sm:block">
                      <div
                        className={cn(
                          'text-sm font-semibold',
                          isActive && 'text-orange-600',
                          isCompleted && 'text-green-600',
                          !isActive && !isCompleted && 'text-gray-500'
                        )}
                      >
                        {step.name}
                      </div>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 mx-2 transition-all',
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      )}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-white border-2 border-orange-100/50 shadow-lg">
              {renderStep()}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <ProtectedRoute>
      <CampaignCreationContent />
    </ProtectedRoute>
  );
}
