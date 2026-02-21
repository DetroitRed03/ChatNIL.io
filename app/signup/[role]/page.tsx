'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { US_STATES, SPORTS } from '@/lib/types/onboarding';

const roleConfig: Record<string, {
  title: string;
  fields: string[];
  dbRole: string;
}> = {
  hs_athlete: {
    title: 'High School Athlete',
    fields: ['name', 'email', 'password', 'sport', 'school', 'graduationYear', 'state', 'parentEmail'],
    dbRole: 'hs_student',
  },
  college_athlete: {
    title: 'College Athlete',
    fields: ['name', 'email', 'password', 'sport', 'school', 'state'],
    dbRole: 'college_athlete',
  },
  parent: {
    title: 'Parent / Guardian',
    fields: ['name', 'email', 'password'],
    dbRole: 'parent',
  },
  compliance_officer: {
    title: 'Compliance Officer',
    fields: ['name', 'email', 'password', 'institution', 'jobTitle'],
    dbRole: 'compliance_officer',
  },
};

const currentYear = new Date().getFullYear();
const gradYears = Array.from({ length: 5 }, (_, i) => currentYear + i);

export default function RoleSignUpPage() {
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    sport: '',
    school: '',
    graduationYear: '',
    state: '',
    parentEmail: '',
    institution: '',
    jobTitle: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const config = roleConfig[role];

  if (!config) {
    router.push('/signup');
    return null;
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Create auth user with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: config.dbRole,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw authError;

      // 2. Send welcome email via our API
      try {
        await fetch('/api/auth/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            role: config.dbRole,
          }),
        });
      } catch {
        // Non-critical: welcome email failure shouldn't block signup
      }

      // 3. Redirect to verification page
      router.push(`/signup/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const hasField = (field: string) => config.fields.includes(field);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">CN</span>
          </div>
          <span className="text-xl font-bold text-gray-900">ChatNIL</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to role selection
        </Link>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 mb-8">
            Signing up as: <span className="font-medium text-orange-600">{config.title}</span>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="John Smith"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-12 outline-none"
                  placeholder="Minimum 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Sport */}
            {hasField('sport') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sport
                </label>
                <select
                  required
                  value={formData.sport}
                  onChange={(e) => handleChange('sport', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  <option value="">Select your sport</option>
                  {SPORTS.map(sport => (
                    <option key={sport} value={sport.toLowerCase()}>{sport}</option>
                  ))}
                </select>
              </div>
            )}

            {/* School */}
            {hasField('school') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School
                </label>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => handleChange('school', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Enter your school name"
                />
              </div>
            )}

            {/* State */}
            {hasField('state') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  <option value="">Select your state</option>
                  {US_STATES.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Graduation Year */}
            {hasField('graduationYear') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Graduation Year
                </label>
                <select
                  required
                  value={formData.graduationYear}
                  onChange={(e) => handleChange('graduationYear', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                >
                  <option value="">Select year</option>
                  {gradYears.map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Parent Email */}
            {hasField('parentEmail') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent/Guardian Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.parentEmail}
                  onChange={(e) => handleChange('parentEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="parent@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Required for athletes under 18
                </p>
              </div>
            )}

            {/* Institution */}
            {hasField('institution') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="University name"
                />
              </div>
            )}

            {/* Job Title */}
            {hasField('jobTitle') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => handleChange('jobTitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="e.g. Associate Athletic Director"
                />
              </div>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="text-orange-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-orange-600 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-500">
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
