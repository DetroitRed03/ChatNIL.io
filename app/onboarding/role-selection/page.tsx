'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, Users, Shield, Building2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/lib/types/onboarding';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'hs_student',
    title: "I'm a High School Student Athlete",
    description: 'Learn about NIL opportunities and build your personal brand foundation',
    icon: <GraduationCap className="h-8 w-8" />,
    color: 'from-blue-500 to-blue-600',
    route: '/onboarding/hs-student',
  },
  {
    id: 'college_athlete',
    title: "I'm a College Athlete",
    description: 'Manage your NIL deals, track compliance, and maximize opportunities',
    icon: <Users className="h-8 w-8" />,
    color: 'from-purple-500 to-purple-600',
    route: '/onboarding/college-athlete',
  },
  {
    id: 'parent',
    title: "I'm a Parent/Guardian",
    description: 'Support and monitor your student athlete\'s NIL journey',
    icon: <Shield className="h-8 w-8" />,
    color: 'from-green-500 to-green-600',
    route: '/onboarding/parent',
  },
  {
    id: 'compliance_officer',
    title: "I'm a Compliance Officer",
    description: 'Oversee NIL compliance for your institution\'s athletes',
    icon: <Building2 className="h-8 w-8" />,
    color: 'from-orange-500 to-orange-600',
    route: '/onboarding/compliance-officer',
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role: RoleOption) => {
    setSelectedRole(role.id);
    setIsLoading(true);

    try {
      // Get session for Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      // Save initial role selection
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

      // Navigate to role-specific onboarding
      router.push(role.route);
    } catch (error) {
      console.error('Error setting role:', error);
      setIsLoading(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold text-white">Welcome to ChatNIL</h1>
          <p className="text-xl text-gray-400">
            Tell us about yourself so we can personalize your experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roleOptions.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`
                  cursor-pointer transition-all duration-300 border-2
                  ${selectedRole === role.id
                    ? 'border-white bg-gray-800'
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                  }
                `}
                onClick={() => !isLoading && handleRoleSelect(role)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${role.color} text-white`}>
                      {role.icon}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-white">{role.title}</h3>
                      <p className="text-sm text-gray-400">{role.description}</p>
                    </div>
                    {selectedRole === role.id && isLoading ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <ArrowRight className={`h-6 w-6 transition-colors ${
                        selectedRole === role.id ? 'text-white' : 'text-gray-600'
                      }`} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm"
        >
          You can change your role later in settings if needed
        </motion.p>
      </div>
    </div>
  );
}
