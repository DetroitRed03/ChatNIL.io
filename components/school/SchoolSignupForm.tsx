'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { School as SchoolType } from '@/types';
import { User, Trophy, Calendar, GraduationCap, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react';

interface SchoolSignupFormProps {
  school: SchoolType;
  primaryColor?: string;
}

interface StudentCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function SchoolSignupForm({ school, primaryColor = '#f97316' }: SchoolSignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    primarySport: '',
    gradeLevel: '',
    graduationYear: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<StudentCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const gradeLevels = ['9', '10', '11', '12', 'Freshman', 'Sophomore', 'Junior', 'Senior'];
  const graduationYears = Array.from({ length: 8 }, (_, i) => currentYear + i);

  // Common sports list
  const commonSports = [
    'Football',
    'Basketball',
    'Baseball',
    'Softball',
    'Soccer',
    'Track & Field',
    'Volleyball',
    'Swimming',
    'Wrestling',
    'Tennis',
    'Golf',
    'Cross Country',
    'Lacrosse',
    'Field Hockey',
    'Gymnastics',
    'Cheerleading',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.primarySport) {
      newErrors.primarySport = 'Please select your sport';
    }

    if (!formData.gradeLevel) {
      newErrors.gradeLevel = 'Please select your grade level';
    }

    if (!formData.graduationYear) {
      newErrors.graduationYear = 'Please select your graduation year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/school/create-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schoolId: school.id,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          primarySport: formData.primarySport,
          gradeLevel: formData.gradeLevel,
          graduationYear: formData.graduationYear,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Show credentials
      setCredentials({
        email: data.credentials.email,
        password: data.credentials.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ submit: error.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Success screen with credentials
  if (credentials) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30"
          >
            <CheckCircle className="h-12 w-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Account Created Successfully!
          </h2>
          <p className="text-gray-600 text-lg mb-1">
            Welcome to ChatNIL, {credentials.firstName} {credentials.lastName}!
          </p>
        </div>

        {/* Credentials Display - Updated to orange */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-bold text-orange-900 mb-1">
                IMPORTANT: Save These Credentials
              </h3>
              <p className="text-xs text-orange-800">
                This is the ONLY time you'll see your password. Write it down or save it somewhere safe!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Email */}
            <div className="bg-white rounded-xl p-4 border-2 border-orange-300 shadow-sm">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Your Email (Username)
              </label>
              <div className="flex items-center justify-between gap-2">
                <code className="text-base font-mono text-gray-900 break-all flex-1">
                  {credentials.email}
                </code>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyToClipboard(credentials.email, 'email')}
                  className="flex-shrink-0 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
                  title="Copy email"
                >
                  {copiedField === 'email' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Password */}
            <div className="bg-white rounded-xl p-4 border-2 border-orange-300 shadow-sm">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Your Password
              </label>
              <div className="flex items-center justify-between gap-2">
                <code className="text-base font-mono text-gray-900 flex-1">
                  {showPassword ? credentials.password : '••••••••••'}
                </code>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex-shrink-0 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => copyToClipboard(credentials.password, 'password')}
                    className="flex-shrink-0 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
                    title="Copy password"
                  >
                    {copiedField === 'password' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps - Updated to orange */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-orange-50 rounded-2xl p-6 mb-6 text-left border-2 border-orange-100"
        >
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-lg">
            <span className="text-orange-600">📋</span>
            Next Steps
          </h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0 text-base">1.</span>
              <span className="leading-relaxed">Save your login credentials in a safe place</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0 text-base">2.</span>
              <span className="leading-relaxed">Go home and visit <strong>chatnil.io</strong> to complete your profile</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0 text-base">3.</span>
              <span className="leading-relaxed">Add your contact information, social media, and NIL interests</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0 text-base">4.</span>
              <span className="leading-relaxed">Start exploring NIL opportunities and connecting with brands!</span>
            </li>
          </ol>
        </motion.div>

        {/* Login Button - Orange gradient */}
        <motion.a
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          href="/"
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-white text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all bg-gradient-to-r from-orange-500 to-orange-600"
        >
          Go to Home Page to Login
        </motion.a>
      </motion.div>
    );
  }

  // Registration form - Updated to Showcase V4
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* First Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
          First Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-offset-0 transition-all ${
              errors.firstName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
            placeholder="Enter your first name"
            disabled={isSubmitting}
          />
        </div>
        {errors.firstName && (
          <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
        )}
      </motion.div>

      {/* Last Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
          Last Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-offset-0 transition-all ${
              errors.lastName
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
            placeholder="Enter your last name"
            disabled={isSubmitting}
          />
        </div>
        {errors.lastName && (
          <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
        )}
      </motion.div>

      {/* Primary Sport */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label htmlFor="primarySport" className="block text-sm font-semibold text-gray-700 mb-2">
          Primary Sport <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Trophy className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="primarySport"
            name="primarySport"
            value={formData.primarySport}
            onChange={handleChange}
            className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-offset-0 transition-all appearance-none cursor-pointer ${
              errors.primarySport
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Select your sport</option>
            {commonSports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
        {errors.primarySport && (
          <p className="mt-2 text-sm text-red-600">{errors.primarySport}</p>
        )}
      </motion.div>

      {/* Grade Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <label htmlFor="gradeLevel" className="block text-sm font-semibold text-gray-700 mb-2">
          Grade Level <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <GraduationCap className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleChange}
            className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-offset-0 transition-all appearance-none cursor-pointer ${
              errors.gradeLevel
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Select your grade</option>
            {gradeLevels.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>
        {errors.gradeLevel && (
          <p className="mt-2 text-sm text-red-600">{errors.gradeLevel}</p>
        )}
      </motion.div>

      {/* Graduation Year */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label htmlFor="graduationYear" className="block text-sm font-semibold text-gray-700 mb-2">
          Graduation Year <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="graduationYear"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            className={`block w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:ring-4 focus:ring-offset-0 transition-all appearance-none cursor-pointer ${
              errors.graduationYear
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 hover:border-gray-400 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Select graduation year</option>
            {graduationYears.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </div>
        {errors.graduationYear && (
          <p className="mt-2 text-sm text-red-600">{errors.graduationYear}</p>
        )}
      </motion.div>

      {/* Submit Error */}
      {errors.submit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
        >
          <p className="text-sm text-red-800 font-medium">{errors.submit}</p>
        </motion.div>
      )}

      {/* Submit Button - Orange gradient with animation */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 px-6 rounded-xl font-semibold text-white text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-orange-600"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          </span>
        ) : (
          'Create Account'
        )}
      </motion.button>

      {/* Privacy Notice */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-gray-500 text-center leading-relaxed"
      >
        By creating an account, you agree to complete your profile at home and comply with
        school and NCAA NIL guidelines. Your information is protected under FERPA.
      </motion.p>
    </form>
  );
}
