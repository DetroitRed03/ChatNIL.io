'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';

type UserRole = 'hs_athlete' | 'college_athlete' | 'parent' | 'compliance_officer';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
  features: string[];
}

const roleOptions: RoleOption[] = [
  {
    id: 'hs_athlete',
    title: 'High School Athlete',
    description: 'Learn about NIL and prepare for your future',
    icon: '\u{1F3C8}',
    features: [
      'AI-powered NIL education',
      'Build your athlete profile',
      "Understand your state's rules",
      'Parent/guardian oversight',
    ],
  },
  {
    id: 'college_athlete',
    title: 'College Athlete',
    description: 'Manage deals and maximize your NIL potential',
    icon: '\u{1F393}',
    features: [
      'Deal tracking & analysis',
      'Fair market value estimates',
      'Compliance auto-check',
      'Earnings dashboard',
    ],
  },
  {
    id: 'parent',
    title: 'Parent / Guardian',
    description: 'Support and protect your young athlete',
    icon: '\u{1F468}\u200D\u{1F469}\u200D\u{1F467}',
    features: [
      "Monitor your athlete's activity",
      'Approve deals before signing',
      'Receive compliance alerts',
      'Educational resources',
    ],
  },
  {
    id: 'compliance_officer',
    title: 'Compliance Officer',
    description: 'Streamline NIL oversight for your institution',
    icon: '\u{1F4CB}',
    features: [
      'AI-powered deal review',
      'Risk scoring & alerts',
      'Team management',
      'Audit-ready reports',
    ],
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    sessionStorage.setItem('selectedRole', selectedRole);
    router.push(`/signup/${selectedRole}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="p-6">
        <Logo size="md" variant="full" href="/" />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ChatNIL
          </h1>
          <p className="text-xl text-gray-600">
            Select your role to get started with a personalized experience
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {roleOptions.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedRole(role.id)}
              className={`
                relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200
                ${selectedRole === role.id
                  ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100'
                  : 'border-gray-200 bg-white hover:border-orange-300 hover:shadow-md'
                }
              `}
            >
              {/* Selected Checkmark */}
              {selectedRole === role.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-orange-500" />
                </div>
              )}

              {/* Icon */}
              <div className="text-4xl mb-4">{role.icon}</div>

              {/* Title & Description */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {role.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {role.description}
              </p>

              {/* Features */}
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
            disabled={!selectedRole}
            className={`
              inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg
              transition-all duration-200
              ${selectedRole
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="mt-6 text-gray-500">
            Already have an account?{' '}
            <Link href="/onboarding" className="text-orange-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
