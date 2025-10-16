'use client';

import { useState, useEffect } from 'react';
import { Trophy, Users, UserCheck, ArrowRight, ArrowLeft, MessageSquare, Briefcase } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserRole } from '@/lib/types';
import { useOnboarding } from '@/contexts/OnboardingContext';
import OnboardingHeader from './OnboardingHeader';

interface RoleOption {
  value: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  benefits: string[];
  color: string;
  steps: number;
  timeEstimate: string;
}

const roleOptions: RoleOption[] = [
  {
    value: 'athlete',
    label: 'Student-Athlete',
    description: 'Build your NIL brand and explore opportunities',
    icon: Trophy,
    benefits: [
      'Personalized NIL strategy development',
      'Brand partnership opportunities',
      'Contract review and negotiation help',
      'Social media optimization guidance'
    ],
    color: 'orange',
    steps: 4,
    timeEstimate: '5-7 minutes'
  },
  {
    value: 'parent',
    label: 'Parent/Guardian',
    description: 'Support and monitor your athlete\'s NIL journey',
    icon: Users,
    benefits: [
      'Connect with your athlete\'s account',
      'Monitor NIL activities and contracts',
      'Set oversight and approval preferences',
      'Receive updates on your athlete\'s progress'
    ],
    color: 'blue',
    steps: 3,
    timeEstimate: '2-3 minutes'
  },
  {
    value: 'agency',
    label: 'Agency/Brand',
    description: 'Connect with athletes for NIL partnerships',
    icon: Briefcase,
    benefits: [
      'Browse and connect with verified athletes',
      'Create targeted partnership campaigns',
      'Manage brand partnerships and contracts',
      'Access compliance and NIL guidance'
    ],
    color: 'purple',
    steps: 4,
    timeEstimate: '4-6 minutes'
  }
];

export default function RoleSelectionScreen() {
  const { setRole, startOnboarding } = useOnboarding();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-start onboarding if role is provided in URL (from role change)
  useEffect(() => {
    const roleParam = searchParams.get('role') as UserRole | null;
    if (roleParam && (roleParam === 'athlete' || roleParam === 'parent' || roleParam === 'agency')) {
      console.log(`🔄 Auto-starting onboarding with role from URL: ${roleParam}`);
      setSelectedRole(roleParam);
      setIsAnimating(true);

      // Automatically start onboarding with the provided role
      setTimeout(() => {
        setRole(roleParam);
        startOnboarding();
      }, 500);
    }
  }, [searchParams, setRole, startOnboarding]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;

    setIsAnimating(true);

    // Smooth transition before starting onboarding
    setTimeout(() => {
      setRole(selectedRole);
      startOnboarding();
    }, 300);
  };

  const handleBack = () => {
    router.back();
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = 'transition-all duration-300';

    if (color === 'orange') {
      return isSelected
        ? `${baseClasses} border-orange-500 bg-orange-50 shadow-lg shadow-orange-100`
        : `${baseClasses} border-gray-200 hover:border-orange-300 hover:bg-orange-25`;
    }
    if (color === 'blue') {
      return isSelected
        ? `${baseClasses} border-blue-500 bg-blue-50 shadow-lg shadow-blue-100`
        : `${baseClasses} border-gray-200 hover:border-blue-300 hover:bg-blue-25`;
    }
    if (color === 'purple') {
      return isSelected
        ? `${baseClasses} border-purple-500 bg-purple-50 shadow-lg shadow-purple-100`
        : `${baseClasses} border-gray-200 hover:border-purple-300 hover:bg-purple-25`;
    }
    return `${baseClasses} border-gray-200 hover:border-gray-300`;
  };

  const getIconClasses = (color: string, isSelected: boolean) => {
    if (color === 'orange') {
      return isSelected ? 'text-orange-600' : 'text-gray-400 group-hover:text-orange-500';
    }
    if (color === 'blue') {
      return isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500';
    }
    if (color === 'purple') {
      return isSelected ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-500';
    }
    return 'text-gray-400';
  };

  const getTextClasses = (color: string, isSelected: boolean) => {
    if (color === 'orange') {
      return isSelected ? 'text-orange-900' : 'text-gray-900';
    }
    if (color === 'blue') {
      return isSelected ? 'text-blue-900' : 'text-gray-900';
    }
    if (color === 'purple') {
      return isSelected ? 'text-purple-900' : 'text-gray-900';
    }
    return 'text-gray-900';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* User Navigation Header */}
      <OnboardingHeader />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/80 rounded-lg transition-all duration-200 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className={`flex items-center justify-center p-4 transition-all duration-500 ${
        isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`} style={{ minHeight: 'calc(100vh - 100px)' }}>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4">
            Welcome to ChatNIL
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get personalized NIL guidance tailored to your role. Select the option that best describes you
            to unlock customized resources and support.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {roleOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedRole === option.value;

            return (
              <button
                key={option.value}
                onClick={() => handleRoleSelect(option.value)}
                className={`group p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-105 ${
                  getColorClasses(option.color, isSelected)
                }`}
              >
                {/* Icon and Title */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${
                      isSelected
                        ? `bg-${option.color}-100`
                        : 'bg-gray-100 group-hover:bg-gray-50'
                    } transition-colors`}>
                      <IconComponent className={`h-6 w-6 ${getIconClasses(option.color, isSelected)}`} />
                    </div>
                    <div className="ml-4">
                      <h3 className={`text-xl font-semibold ${getTextClasses(option.color, isSelected)}`}>
                        {option.label}
                      </h3>
                    </div>
                  </div>

                  {isSelected && (
                    <div className={`w-6 h-6 rounded-full bg-${option.color}-500 flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className={`text-sm mb-4 ${
                  isSelected
                    ? `text-${option.color}-700`
                    : 'text-gray-600 group-hover:text-gray-700'
                }`}>
                  {option.description}
                </p>

                {/* Benefits List */}
                <div className="space-y-2">
                  <p className={`text-xs font-medium uppercase tracking-wider ${
                    isSelected
                      ? `text-${option.color}-600`
                      : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    What you'll get:
                  </p>
                  <ul className="space-y-1">
                    {option.benefits.map((benefit, index) => (
                      <li key={index} className={`text-xs flex items-start ${
                        isSelected
                          ? `text-${option.color}-700`
                          : 'text-gray-600 group-hover:text-gray-700'
                      }`}>
                        <span className={`inline-block w-1 h-1 rounded-full mt-2 mr-2 flex-shrink-0 ${
                          isSelected
                            ? `bg-${option.color}-500`
                            : 'bg-gray-400'
                        }`}></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isAnimating}
            className={`inline-flex items-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              selectedRole && !isAnimating
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Get Started
            <ArrowRight className="ml-3 h-5 w-5" />
          </button>

          {selectedRole && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                You'll complete {roleOptions.find(r => r.value === selectedRole)?.steps} quick steps in about{' '}
                <span className="font-medium text-gray-900">
                  {roleOptions.find(r => r.value === selectedRole)?.timeEstimate}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Focused on {roleOptions.find(r => r.value === selectedRole)?.label.toLowerCase()} needs - no irrelevant questions
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-500">
            Your information is secure and will only be used to provide personalized NIL guidance.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}