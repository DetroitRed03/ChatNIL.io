'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, User, Mail, Phone, Calendar, Users, SkipForward, Save } from 'lucide-react';
import { athletePersonalInfoSchema, AthletePersonalInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';

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
    formState: { errors, isValid }
  } = useForm<AthletePersonalInfo>({
    resolver: zodResolver(athletePersonalInfoSchema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      dateOfBirth: data.dateOfBirth || '',
      email: data.email || user?.email || '', // Auto-populate from authenticated user
      phone: data.phone || '',
      parentEmail: data.parentEmail || '',
    },
    mode: 'onChange'
  });

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Introduction */}
      <div className="mb-6 p-5 bg-orange-50 rounded-xl border border-orange-200">
        <div className="flex items-start">
          <div className="p-2 bg-orange-100 rounded-lg mr-4">
            <User className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              Let's start with your basic information
            </h3>
            <p className="text-orange-700 leading-relaxed">
              This helps us create your personalized NIL profile and ensure you receive
              age-appropriate guidance and opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            First Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('firstName')}
              type="text"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.firstName
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="Enter your first name"
            />
          </div>
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Last Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('lastName')}
              type="text"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.lastName
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="Enter your last name"
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Date of Birth *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            {...register('dateOfBirth')}
            type="date"
            max={new Date().toISOString().split('T')[0]}
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
              errors.dateOfBirth
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
            }`}
          />
        </div>
        {errors.dateOfBirth && (
          <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
        )}
        {isUnder18 && (
          <p className="mt-1 text-sm text-orange-600 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            As a minor, we'll need parent/guardian contact information
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('email')}
              type="email"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : user?.email
                  ? 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 bg-gray-50'
                  : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="your.email@example.com"
              readOnly={!!user?.email}
              title={user?.email ? 'Email from your account (cannot be changed here)' : ''}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('phone')}
              type="tel"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              placeholder="(555) 123-4567"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Optional, but recommended for opportunities</p>
        </div>
      </div>

      {/* Parent Email (if under 18) */}
      {isUnder18 && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Parent/Guardian Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              {...register('parentEmail', {
                required: isUnder18 ? 'Parent email is required for minors' : false
              })}
              type="email"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.parentEmail
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'
              }`}
              placeholder="parent@example.com"
            />
          </div>
          {errors.parentEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.parentEmail.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-600">
            We'll keep your parent/guardian informed about your NIL activities and opportunities
          </p>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Privacy & Security</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Your personal information is protected and will only be used to provide personalized
          NIL guidance and opportunities. We follow all applicable privacy laws and regulations.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
        {/* Left side - Skip and Save buttons */}
        <div className="flex gap-3">
          {allowSkip && (
            <button
              type="button"
              onClick={() => {
                updateFormData(getValues());
                onSkip ? onSkip() : skipStep();
              }}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip for now
            </button>
          )}

          <button
            type="button"
            onClick={async () => {
              updateFormData(getValues());
              onSaveAndExit ? await onSaveAndExit() : await saveAndExit();
            }}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save & continue later
          </button>
        </div>

        {/* Right side - Continue button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
            !isLoading
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

      {/* Optional field indicator */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          * Required fields only. You can skip optional fields and complete them later.
        </p>
      </div>
    </form>
  );
}