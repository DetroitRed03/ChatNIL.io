'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, User, Mail, Phone, Calendar, Users, SkipForward, Save, Ruler, Weight } from 'lucide-react';
import { athletePersonalInfoSchema, AthletePersonalInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  OnboardingInput,
  OnboardingButton,
} from '@/components/ui/OnboardingInput';

export default function AthletePersonalInfoStep({
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
  const { nextStep, skipStep, saveAndExit, updateFormData } = useOnboarding();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isUnder18, setIsUnder18] = useState(false);

  // Enhanced auth debugging for onboarding
  useEffect(() => {
    console.log('🔔 AthletePersonalInfoStep: Auth state check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      isAuthLoading,
      timestamp: new Date().toISOString()
    });

    if (!user && !isAuthLoading) {
      console.warn('⚠️ AthletePersonalInfoStep: No authenticated user found during onboarding!');
    }
  }, [user, isAuthLoading]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors, isValid }
  } = useForm<AthletePersonalInfo>({
    resolver: zodResolver(athletePersonalInfoSchema) as any,
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      dateOfBirth: data.dateOfBirth || '',
      email: data.email || user?.email || '', // Auto-populate from authenticated user
      phone: data.phone || '',
      parentEmail: data.parentEmail || '',
      heightInches: data.heightInches || undefined,
      weightLbs: data.weightLbs || undefined,
    },
    mode: 'onChange'
  });

  // Phase 6B: Populate fields from prefillData (for school-created accounts)
  useEffect(() => {
    console.log('🏫 Phase 6B Prefill check:', {
      dataKeys: Object.keys(data),
      data: data,
      hasFirstName: !!data.firstName,
      hasLastName: !!data.lastName,
    });

    // Populate firstName if available in data
    if (data.firstName && !getValues('firstName')) {
      console.log('✅ Prefilling firstName:', data.firstName);
      setValue('firstName', data.firstName);
    }

    // Populate lastName if available in data
    if (data.lastName && !getValues('lastName')) {
      console.log('✅ Prefilling lastName:', data.lastName);
      setValue('lastName', data.lastName);
    }
  }, [data, setValue, getValues]);

  // Enhanced email auto-population with fallback mechanisms
  useEffect(() => {
    console.log('📧 Email auto-population check:', {
      dataEmail: data.email,
      userEmail: user?.email,
      currentFormEmail: getValues('email'),
      hasUser: !!user,
      isAuthLoading,
      timestamp: new Date().toISOString()
    });

    // Only update email if user is available and current email field is empty
    if (user?.email && !getValues('email')) {
      console.log('✅ Auto-populating email from authenticated user:', user.email);
      setValue('email', user.email);
    } else if (user?.email && getValues('email') !== user.email && !data.email) {
      // Update email if user email differs from form but no data email is set
      console.log('🔄 Updating email to match authenticated user:', user.email);
      setValue('email', user.email);
    } else if (!user && !isAuthLoading && !getValues('email')) {
      console.warn('⚠️ No authenticated user available for email auto-population');
    }
  }, [user, isAuthLoading, setValue, getValues, data.email]);

  const watchedDOB = watch('dateOfBirth');
  const watchedHeight = watch('heightInches');

  // Check if user is under 18
  useEffect(() => {
    if (watchedDOB) {
      const birthDate = new Date(watchedDOB);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      setIsUnder18(actualAge < 18);

      // Clear parent email if 18 or older
      if (actualAge >= 18) {
        setValue('parentEmail', undefined);
      }
    }
  }, [watchedDOB, setValue]);

  const onSubmit = async (formData: AthletePersonalInfo) => {
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

  // Helper function to convert height to feet'inches"
  const formatHeight = (inches: number | undefined): string => {
    if (!inches || inches <= 0) return '';
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Fields */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="First Name"
              required
              error={errors.firstName?.message}
              placeholder="Enter your first name"
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="Last Name"
              required
              error={errors.lastName?.message}
              placeholder="Enter your last name"
            />
          )}
        />
      </div>

      {/* Date of Birth */}
      <div>
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="Date of Birth"
              type="date"
              required
              error={errors.dateOfBirth?.message}
              max={new Date().toISOString().split('T')[0]}
            />
          )}
        />
        {isUnder18 && (
          <p className="mt-2 text-sm text-orange-600 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            As a minor, we'll need parent/guardian contact information
          </p>
        )}
      </div>

      {/* Contact Information */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="Email Address"
              type="email"
              required
              error={errors.email?.message}
              placeholder="your.email@example.com"
              readOnly={!!user?.email}
              helperText={user?.email ? 'Email from your account' : undefined}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <OnboardingInput
              {...field}
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
              helperText="Recommended for opportunities"
            />
          )}
        />
      </div>

      {/* Physical Stats Section */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border-2 border-blue-200/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Ruler className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900">Physical Stats</h4>
            <p className="text-xs text-blue-700">Optional - helps brands find athletes for their campaigns</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <Controller
              name="heightInches"
              control={control}
              render={({ field }) => (
                <OnboardingInput
                  {...field}
                  label="Height (inches)"
                  type="number"
                  min={48}
                  max={96}
                  placeholder="e.g., 70"
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  error={errors.heightInches?.message}
                  helperText={watchedHeight && watchedHeight > 0 ? formatHeight(watchedHeight) : undefined}
                />
              )}
            />
          </div>

          <Controller
            name="weightLbs"
            control={control}
            render={({ field }) => (
              <OnboardingInput
                {...field}
                label="Weight (lbs)"
                type="number"
                min={80}
                max={400}
                placeholder="e.g., 165"
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                error={errors.weightLbs?.message}
              />
            )}
          />
        </div>
      </div>

      {/* Parent Email (if under 18) */}
      {isUnder18 && (
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-100/50 rounded-2xl border-2 border-amber-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Parent/Guardian Contact</h4>
              <p className="text-xs text-amber-700">Required for athletes under 18</p>
            </div>
          </div>

          <Controller
            name="parentEmail"
            control={control}
            rules={{ required: isUnder18 ? 'Parent email is required for minors' : false }}
            render={({ field }) => (
              <OnboardingInput
                {...field}
                label="Parent/Guardian Email"
                type="email"
                required
                error={errors.parentEmail?.message}
                placeholder="parent@example.com"
                helperText="We'll keep your parent/guardian informed about your NIL activities"
              />
            )}
          />
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="text-sm font-bold text-gray-900 mb-2">Privacy & Security</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Your personal information is protected and will only be used to provide personalized
          NIL guidance and opportunities. We follow all applicable privacy laws and regulations.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
        {/* Left side - Skip and Save buttons */}
        <div className="flex gap-3">
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
              Skip for now
            </OnboardingButton>
          )}

          <OnboardingButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={async () => {
              updateFormData(getValues());
              onSaveAndExit ? await onSaveAndExit() : await saveAndExit();
            }}
            disabled={isLoading}
          >
            <Save className="h-4 w-4" />
            Save & continue later
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
