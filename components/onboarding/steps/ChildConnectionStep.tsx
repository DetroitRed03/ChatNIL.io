'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, User, Mail, School, Bell, BellOff, Check, AlertTriangle, Save, Plus, X, Users } from 'lucide-react';
import { childConnectionSchema, ChildConnection, OnboardingStepProps } from '@/lib/onboarding-types';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function ChildConnectionStep({
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
    control,
    formState: { errors, isValid }
  } = useForm<ChildConnection>({
    resolver: zodResolver(childConnectionSchema) as any,
    defaultValues: {
      athletes: data.athletes?.length > 0 ? data.athletes : [
        { name: '', email: '', school: '', sport: '', gradeLevel: undefined, hasNILDeals: undefined }
      ],
      notificationPreferences: {
        nilActivities: data.notificationPreferences?.nilActivities ?? true,
        contractReviews: data.notificationPreferences?.contractReviews ?? true,
        weeklyReports: data.notificationPreferences?.weeklyReports ?? true,
        emergencyAlerts: data.notificationPreferences?.emergencyAlerts ?? true,
      },
      // Legacy support
      childEmail: data.childEmail || '',
      childName: data.childName || '',
      childSchool: data.childSchool || '',
    },
    mode: 'onChange'
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'athletes'
  });

  const notificationPrefs = watch('notificationPreferences');

  const onSubmit = async (formData: ChildConnection) => {
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

  const toggleNotification = (key: string) => {
    (setValue as any)(`notificationPreferences.${key}`, !(notificationPrefs as any)?.[key]);
  };

  const addAthlete = () => {
    append({ name: '', email: '', school: '', sport: '', gradeLevel: undefined, hasNILDeals: undefined });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Introduction */}
      <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Your Athletes
            </h3>
            <p className="text-blue-700 leading-relaxed">
              Add information about your student-athletes so you can monitor their NIL activities and provide support when needed.
            </p>
          </div>
        </div>
      </div>

      {/* Athletes Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <User className="h-5 w-5 text-gray-600 mr-2" />
            Your Athletes ({fields.length})
          </h3>
          <button
            type="button"
            onClick={addAthlete}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Athlete
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Athlete {index + 1}</h4>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {/* Athlete Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  {...register(`athletes.${index}.name`)}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Athlete's full name"
                />
                {errors.athletes?.[index]?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.athletes[index]?.name?.message}</p>
                )}
              </div>

              {/* Athlete Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  {...register(`athletes.${index}.email`)}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="athlete@email.com"
                />
                {errors.athletes?.[index]?.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.athletes[index]?.email?.message}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* School */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School
                </label>
                <input
                  {...register(`athletes.${index}.school`)}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="School name"
                />
              </div>

              {/* Sport */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Sport
                </label>
                <input
                  {...register(`athletes.${index}.sport`)}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Basketball"
                />
              </div>

              {/* Grade Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level
                </label>
                <select
                  {...register(`athletes.${index}.gradeLevel`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select grade</option>
                  <option value="freshman">Freshman</option>
                  <option value="sophomore">Sophomore</option>
                  <option value="junior">Junior</option>
                  <option value="senior">Senior</option>
                  <option value="graduate">Graduate</option>
                </select>
              </div>
            </div>

            {/* NIL Status */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do they currently have NIL opportunities?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    {...register(`athletes.${index}.hasNILDeals`)}
                    type="radio"
                    value="yes"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Yes</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register(`athletes.${index}.hasNILDeals`)}
                    type="radio"
                    value="no"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">No</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register(`athletes.${index}.hasNILDeals`)}
                    type="radio"
                    value="exploring"
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm">Exploring</span>
                </label>
              </div>
            </div>
          </div>
        ))}

        {errors.athletes && (
          <p className="text-sm text-red-600">{errors.athletes.message}</p>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Choose what types of updates you'd like to receive about your athlete's NIL activities.
        </p>

        <div className="space-y-4">
          {/* NIL Activities */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">NIL Activities</h4>
              <p className="text-sm text-gray-600">Get notified about new NIL opportunities and activities</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification('nilActivities')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs?.nilActivities ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationPrefs?.nilActivities ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Contract Reviews */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Contract Reviews</h4>
              <p className="text-sm text-gray-600">Get alerted when contracts need your review or approval</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification('contractReviews')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs?.contractReviews ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationPrefs?.contractReviews ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Weekly Reports */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="font-medium text-gray-900">Weekly Reports</h4>
              <p className="text-sm text-gray-600">Receive weekly summaries of your athlete's NIL progress</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification('weeklyReports')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs?.weeklyReports ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationPrefs?.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Emergency Alerts */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                Emergency Alerts
              </h4>
              <p className="text-sm text-gray-600">Important compliance issues or urgent matters</p>
            </div>
            <button
              type="button"
              onClick={() => toggleNotification('emergencyAlerts')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationPrefs?.emergencyAlerts ? 'bg-orange-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationPrefs?.emergencyAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
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