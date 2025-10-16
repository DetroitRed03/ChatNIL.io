'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, MessageSquare, Users, Trophy, UserCheck, Loader2, Briefcase } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onLogin,
  onSignup
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'athlete' as UserRole
  });

  if (!isOpen) return null;

  // Prevent closing modal during signup
  const handleClose = () => {
    if (isSubmitting) {
      console.log('Cannot close modal while submitting');
      return;
    }
    onClose();
  };

  const resetFormState = () => {
    console.log('🔄 Resetting AuthModal form state');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'athlete' as UserRole
    });
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      console.log('🚫 Form already submitting, ignoring duplicate submission');
      return;
    }

    setIsSubmitting(true);
    console.log('🎯 AuthModal handleSubmit called, mode:', mode);
    console.log('📝 Form data:', formData);

    try {
      if (mode === 'login') {
        console.log('🔐 Calling onLogin with:', formData.email);
        await onLogin(formData.email, formData.password);
      } else {
        console.log('📝 Calling onSignup with:', {
          name: formData.name,
          email: formData.email,
          role: formData.role
        });
        await onSignup(formData.name, formData.email, formData.password, formData.role);
      }
    } catch (error) {
      console.error('❌ AuthModal form submission error:', error);
      // Reset form state on error to ensure clean retry
      resetFormState();
      // Re-throw to let parent components handle the error display
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setFormData({ name: '', email: '', password: '', role: 'athlete' as UserRole });
  };

  const roleOptions = [
    {
      value: 'athlete' as UserRole,
      label: 'Student-Athlete',
      description: 'High school or college athlete seeking NIL guidance',
      icon: Trophy
    },
    {
      value: 'parent' as UserRole,
      label: 'Parent/Guardian',
      description: 'Parent or guardian of a student-athlete',
      icon: Users
    },
    {
      value: 'coach' as UserRole,
      label: 'Coach/Educator',
      description: 'Coach, advisor, or athletic department staff',
      icon: UserCheck
    },
    {
      value: 'agency' as UserRole,
      label: 'Agency/Brand',
      description: 'Brand or company seeking athlete partnerships',
      icon: Briefcase
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[100vh] flex flex-col p-4 sm:p-6 relative shadow-2xl border border-gray-100">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl transition-colors ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 shadow-lg">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1 sm:mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {mode === 'login'
              ? 'Sign in to continue to ChatNIL'
              : 'Join ChatNIL to get started'
            }
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 flex-1">
          {mode === 'signup' && (
            <>
              <div className="relative">
                <User className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all text-sm sm:text-base"
                  required
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-900 mb-1">I am a:</label>
                <div className="space-y-1">
                  {roleOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <label
                        key={option.value}
                        className={`relative flex items-start p-2 sm:p-2.5 cursor-pointer rounded-xl border-2 transition-all ${
                          formData.role === option.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={option.value}
                          checked={formData.role === option.value}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                          className="sr-only"
                        />
                        <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 mr-2.5 mt-0.5 ${
                          formData.role === option.value ? 'text-orange-600' : 'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium leading-tight ${
                            formData.role === option.value ? 'text-orange-900' : 'text-gray-900'
                          }`}>
                            {option.label}
                          </div>
                          <div className={`text-xs mt-0.5 leading-tight ${
                            formData.role === option.value ? 'text-orange-700' : 'text-gray-500'
                          }`}>
                            {option.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all text-sm sm:text-base"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 sm:left-4 top-3 sm:top-4 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all text-sm sm:text-base"
              required
              minLength={6}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 sm:py-4 px-4 rounded-xl sm:rounded-2xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base ${
              isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isSubmitting
              ? (mode === 'login' ? 'Signing In...' : 'Creating Account...')
              : (mode === 'login' ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        {/* Footer */}
        <div className="mt-auto pt-3 sm:pt-4">
          {/* Switch Mode */}
          <div className="text-center mb-3 sm:mb-4">
            <p className="text-sm sm:text-base text-gray-600">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={switchMode}
                className="ml-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center mb-3 sm:mb-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-3 sm:px-4 text-xs sm:text-sm text-gray-500 font-medium">or</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Login */}
          <button className="w-full bg-white border border-gray-200 text-gray-700 py-3 sm:py-4 px-4 rounded-xl sm:rounded-2xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center space-x-2 sm:space-x-3 shadow-sm hover:shadow-md text-sm sm:text-base">
            <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
        </div>

        {/* Loading Overlay during signup */}
        {isSubmitting && mode === 'signup' && (
          <div className="absolute inset-0 bg-white bg-opacity-95 rounded-2xl sm:rounded-3xl flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating your account...</h3>
              <p className="text-sm text-gray-600">Setting up your profile</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}