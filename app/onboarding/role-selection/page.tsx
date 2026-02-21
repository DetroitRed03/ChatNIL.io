'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Shield, Building2, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/brand/Logo';
import type { UserRole } from '@/lib/types/onboarding';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  features: string[];
  route: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'hs_student',
    title: 'High School Athlete',
    description: 'Learn about NIL and prepare for your future',
    icon: <GraduationCap className="h-6 w-6" />,
    emoji: '\u{1F3C8}',
    features: [
      'AI-powered NIL education',
      'Build your athlete profile',
      "Understand your state's rules",
      'Parent/guardian oversight',
    ],
    route: '/onboarding/hs-student',
  },
  {
    id: 'college_athlete',
    title: 'College Athlete',
    description: 'Manage deals and maximize your NIL potential',
    icon: <Users className="h-6 w-6" />,
    emoji: '\u{1F393}',
    features: [
      'Deal tracking & analysis',
      'Fair market value estimates',
      'Compliance auto-check',
      'Earnings dashboard',
    ],
    route: '/onboarding/college-athlete',
  },
  {
    id: 'parent',
    title: 'Parent / Guardian',
    description: 'Support and protect your young athlete',
    icon: <Shield className="h-6 w-6" />,
    emoji: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}',
    features: [
      "Monitor your athlete's activity",
      'Approve deals before signing',
      'Receive compliance alerts',
      'Educational resources',
    ],
    route: '/onboarding/parent',
  },
  {
    id: 'compliance_officer',
    title: 'Compliance Officer',
    description: 'Streamline NIL oversight for your institution',
    icon: <Building2 className="h-6 w-6" />,
    emoji: '\u{1F4CB}',
    features: [
      'AI-powered deal review',
      'Risk scoring & alerts',
      'Team management',
      'Audit-ready reports',
    ],
    route: '/onboarding/compliance-officer',
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    const role = roleOptions.find(r => r.id === selectedRole);
    if (!role) return;

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/onboarding/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ role: role.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to set role');
      }

      router.push(role.route);
    } catch (error) {
      console.error('Error setting role:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="p-6">
        <Logo size="md" variant="full" href="/" />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ChatNIL
          </h1>
          <p className="text-xl text-gray-600">
            Tell us about yourself so we can personalize your experience
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {roleOptions.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => !isLoading && setSelectedRole(role.id)}
              className={`
                relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200
                ${selectedRole === role.id
                  ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                }
              `}
            >
              {selectedRole === role.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-orange-500" />
                </div>
              )}

              <div className="text-4xl mb-4">{role.emoji}</div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {role.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {role.description}
              </p>

              <ul className="space-y-2">
                {role.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      selectedRole === role.id ? 'bg-orange-500' : 'bg-gray-300'
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className={`
              inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg
              transition-all duration-200
              ${selectedRole
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-gray-500 text-sm"
          >
            You can change your role later in settings if needed
          </motion.p>
        </div>
      </main>
    </div>
  );
}
