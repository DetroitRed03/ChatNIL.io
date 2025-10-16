'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, User, Mail, Phone, Heart, SkipForward, Save } from 'lucide-react';
import { parentInfoSchema, ParentInfo, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ParentInfoStep({
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid }
  } = useForm<ParentInfo>({
    resolver: zodResolver(parentInfoSchema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || user?.email || '',
      phone: data.phone || '',
      relationshipType: data.relationshipType || undefined,
    },
    mode: 'onChange'
  });

  // Auto-populate email from authenticated user
  useEffect(() => {
    if (user?.email && !getValues('email')) {
      setValue('email', user.email);
    }
  }, [user, setValue, getValues]);

  const onSubmit = async (formData: ParentInfo) => {
    try {
      updateFormData(formData);
      const success = await nextStep(formData);
      if (success) {
        onNext(formData);
      }
    } catch (error) {
      console.error('Error during step submission:', error);
      updateFormData(formData);
    }
  };

  const handleSaveAndExit = async () => {
    const currentData = getValues();
    updateFormData(currentData);
    await saveAndExit();
    if (onSaveAndExit) onSaveAndExit();
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
              Tell us about yourself so we can help you support and monitor your athlete's NIL journey effectively.
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
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Enter your email address"
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
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
              errors.phone
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
            placeholder="Enter your phone number"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      {/* Relationship Type */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Relationship to Athlete *
        </label>
        <select
          {...register('relationshipType')}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
            errors.relationshipType
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }`}
        >
          <option value="">Select your relationship</option>
          <option value="mother">Mother</option>
          <option value="father">Father</option>
          <option value="guardian">Guardian</option>
          <option value="step_parent">Step Parent</option>
          <option value="other">Other</option>
        </select>
        {errors.relationshipType && (
          <p className="mt-1 text-sm text-red-600">{errors.relationshipType.message}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        {/* Save and Exit */}
        <button
          type="button"
          onClick={handleSaveAndExit}
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Save className="h-4 w-4 mr-2" />
          Save & Exit
        </button>

        <div className="flex-1" />

        {/* Next Button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-white transition-all ${
            isValid && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-105'
              : 'bg-gray-400 cursor-not-allowed'
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Processing...
            </div>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}