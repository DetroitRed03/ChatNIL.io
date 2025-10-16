'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Shield, Eye, Settings, Mail, Phone, MessageSquare, Clock, Save } from 'lucide-react';
import { parentPreferencesSchema, ParentPreferences, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function ParentPreferencesStep({
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid }
  } = useForm<ParentPreferences>({
    resolver: zodResolver(parentPreferencesSchema),
    defaultValues: {
      dashboardAccess: data.dashboardAccess || 'limited',
      involvementLevel: data.involvementLevel || 'occasional_updates',
      approvalSettings: {
        contractApproval: data.approvalSettings?.contractApproval ?? true,
        brandPartnerships: data.approvalSettings?.brandPartnerships ?? true,
        socialMediaPosts: data.approvalSettings?.socialMediaPosts ?? false,
        financialDecisions: data.approvalSettings?.financialDecisions ?? true,
      },
      communicationPrefs: {
        preferredContact: data.communicationPrefs?.preferredContact || 'email',
        frequency: data.communicationPrefs?.frequency || 'daily',
        quietHours: {
          start: data.communicationPrefs?.quietHours?.start || '',
          end: data.communicationPrefs?.quietHours?.end || '',
        }
      },
      supportGoals: {
        primaryConcerns: data.supportGoals?.primaryConcerns || [],
        supportNeeds: data.supportGoals?.supportNeeds || [],
      }
    },
    mode: 'onChange'
  });

  const dashboardAccess = watch('dashboardAccess');
  const involvementLevel = watch('involvementLevel');
  const approvalSettings = watch('approvalSettings');
  const communicationPrefs = watch('communicationPrefs');
  const supportGoals = watch('supportGoals');

  const onSubmit = async (formData: ParentPreferences) => {
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

  const toggleApproval = (key: keyof typeof approvalSettings) => {
    setValue(`approvalSettings.${key}`, !approvalSettings?.[key]);
  };

  const dashboardOptions = [
    {
      value: 'full',
      title: 'Full Access',
      description: 'View all NIL activities, financials, and contracts'
    },
    {
      value: 'limited',
      title: 'Limited Access',
      description: 'View key activities and contracts requiring approval'
    },
    {
      value: 'view_only',
      title: 'View Only',
      description: 'View activities without approval permissions'
    }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Introduction */}
      <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Oversight Preferences
            </h3>
            <p className="text-blue-700 leading-relaxed">
              Configure your dashboard access level, approval settings, and communication preferences to stay informed and involved in your athlete's NIL journey.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Access Level */}
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Eye className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Dashboard Access Level</h3>
        </div>

        <div className="space-y-3">
          {dashboardOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                dashboardAccess === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                {...register('dashboardAccess')}
                type="radio"
                value={option.value}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="ml-3">
                <h4 className="font-medium text-gray-900">{option.title}</h4>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Approval Settings */}
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Approval Settings</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Choose what types of activities require your approval before your athlete can proceed.
        </p>

        <div className="space-y-4">
          {/* Contract Approval */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Contract Approval</h4>
              <p className="text-sm text-gray-600">Require approval for all NIL contracts and agreements</p>
            </div>
            <button
              type="button"
              onClick={() => toggleApproval('contractApproval')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                approvalSettings?.contractApproval ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  approvalSettings?.contractApproval ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Brand Partnerships */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Brand Partnerships</h4>
              <p className="text-sm text-gray-600">Require approval for brand partnerships and sponsorships</p>
            </div>
            <button
              type="button"
              onClick={() => toggleApproval('brandPartnerships')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                approvalSettings?.brandPartnerships ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  approvalSettings?.brandPartnerships ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Social Media Posts */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Social Media Posts</h4>
              <p className="text-sm text-gray-600">Require approval for sponsored social media content</p>
            </div>
            <button
              type="button"
              onClick={() => toggleApproval('socialMediaPosts')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                approvalSettings?.socialMediaPosts ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  approvalSettings?.socialMediaPosts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Financial Decisions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Financial Decisions</h4>
              <p className="text-sm text-gray-600">Require approval for financial decisions above $1,000</p>
            </div>
            <button
              type="button"
              onClick={() => toggleApproval('financialDecisions')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                approvalSettings?.financialDecisions ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  approvalSettings?.financialDecisions ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <MessageSquare className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Communication Preferences</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Preferred Contact Method */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Preferred Contact Method
            </label>
            <select
              {...register('communicationPrefs.preferredContact')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text Message</option>
              <option value="app">In-App Notification</option>
            </select>
          </div>

          {/* Notification Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notification Frequency
            </label>
            <select
              {...register('communicationPrefs.frequency')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>
        </div>

        {/* Quiet Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Quiet Hours (Optional)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Set times when you prefer not to receive non-urgent notifications
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
              <input
                {...register('communicationPrefs.quietHours.start')}
                type="time"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
              <input
                {...register('communicationPrefs.quietHours.end')}
                type="time"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
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

        {/* Complete Button */}
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
              Complete Setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}