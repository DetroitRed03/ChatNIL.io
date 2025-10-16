'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, User, Mail, Phone, Heart, SkipForward, Save } from 'lucide-react';
import { parentPersonalInfoSchema, ParentPersonalInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ParentPersonalInfoStep({
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

  // Enhanced auth debugging for onboarding
  useEffect(() => {
    console.log('🔔 ParentPersonalInfoStep: Auth state check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      isAuthLoading,
      timestamp: new Date().toISOString()
    });

    if (!user && !isAuthLoading) {
      console.warn('⚠️ ParentPersonalInfoStep: No authenticated user found during onboarding!');
    }
  }, [user, isAuthLoading]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid }
  } = useForm<ParentPersonalInfo>({
    resolver: zodResolver(parentPersonalInfoSchema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || user?.email || '', // Auto-populate from authenticated user
      phone: data.phone || '',
      relationToAthlete: data.relationToAthlete || undefined,
      otherRelation: data.otherRelation || '',
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

  const watchedRelation = watch('relationToAthlete');

  const onSubmit = async (formData: ParentPersonalInfo) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Introduction */}
      <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <Heart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Welcome, Parent/Guardian!
            </h3>
            <p className="text-blue-700 leading-relaxed">
              Help us understand your role in your athlete's NIL journey. Your involvement
              and support are crucial for their success in navigating Name, Image, and Likeness opportunities.
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
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
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
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
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Enter your last name"
            />
          </div>
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
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
                  ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-50'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="(555) 123-4567"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Optional, but recommended for updates</p>
        </div>
      </div>

      {/* Relationship to Athlete */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Relationship to Athlete
        </label>
        <select
          {...register('relationToAthlete')}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
            errors.relationToAthlete
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        >
          <option value="">Select relationship</option>
          <option value="mother">Mother</option>
          <option value="father">Father</option>
          <option value="guardian">Legal Guardian</option>
          <option value="other">Other</option>
        </select>
        {errors.relationToAthlete && (
          <p className="mt-1 text-sm text-red-600">{errors.relationToAthlete.message}</p>
        )}
      </div>

      {/* Other Relationship (if selected) */}
      {watchedRelation === 'other' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Please specify your relationship
          </label>
          <input
            {...register('otherRelation')}
            type="text"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
              errors.otherRelation
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="e.g., Aunt, Uncle, Coach, etc."
          />
          {errors.otherRelation && (
            <p className="mt-1 text-sm text-red-600">{errors.otherRelation.message}</p>
          )}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Privacy & Communication</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          Your contact information will be used to keep you informed about your athlete's NIL activities,
          opportunities, and compliance requirements. We respect your privacy and follow all applicable laws.
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
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
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