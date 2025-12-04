'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Mail, Lock, User, MessageSquare, Loader2 } from 'lucide-react';
import { UserRole } from '@/types';
import { NeumorphicButton, ToggleGroup } from '@/components/ui';
import type { ToggleOption } from '@/components/ui';

// Form validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['athlete', 'parent', 'agency'] as const),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

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

  // Login form
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Signup form
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'athlete',
    },
  });

  if (!isOpen) return null;

  // Prevent closing modal during submission
  const handleClose = () => {
    if (isSubmitting) {
      console.log('Cannot close modal while submitting');
      return;
    }
    onClose();
  };

  const handleLoginSubmit = async (data: LoginFormData) => {
    if (isSubmitting) {
      console.log('🚫 Form already submitting, ignoring duplicate submission');
      return;
    }

    setIsSubmitting(true);
    console.log('🔐 Calling onLogin with:', data.email);

    try {
      await onLogin(data.email, data.password);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (data: SignupFormData) => {
    if (isSubmitting) {
      console.log('🚫 Form already submitting, ignoring duplicate submission');
      return;
    }

    setIsSubmitting(true);
    console.log('📝 Calling onSignup with:', {
      name: data.name,
      email: data.email,
      role: data.role
    });

    try {
      await onSignup(data.name, data.email, data.password, data.role);
    } catch (error) {
      console.error('❌ Signup error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login';
    setMode(newMode);
    loginForm.reset();
    signupForm.reset();
  };

  const roleOptions: ToggleOption[] = [
    {
      value: 'athlete',
      label: 'Athlete',
      icon: '🏆',
    },
    {
      value: 'parent',
      label: 'Parent',
      icon: '👥',
    },
    {
      value: 'agency',
      label: 'Agency',
      icon: '💼',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col p-4 sm:p-5 relative shadow-2xl border border-gray-100">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-xl transition-colors z-10 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-gray-600">
            {mode === 'login'
              ? 'Sign in to continue to ChatNIL'
              : 'Join ChatNIL to get started'
            }
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 flex flex-col">
          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4 flex-1">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 via-accent-500 to-primary-600 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative bg-white rounded-2xl">
                    <div className="flex items-center">
                      <div className="absolute left-4 pointer-events-none text-gray-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        type="email"
                        autoComplete="username"
                        {...loginForm.register('email')}
                        placeholder="your.email@example.com"
                        className="w-full pl-12 pr-4 py-3 bg-transparent rounded-2xl text-gray-900 placeholder-gray-400 outline-none border-2 border-gray-200 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 px-4">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 via-accent-500 to-primary-600 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative bg-white rounded-2xl">
                    <div className="flex items-center">
                      <div className="absolute left-4 pointer-events-none text-gray-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        autoComplete="current-password"
                        {...loginForm.register('password')}
                        placeholder="Enter your password"
                        className="w-full pl-12 pr-4 py-3 bg-transparent rounded-2xl text-gray-900 placeholder-gray-400 outline-none border-2 border-gray-200 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600 px-4">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <NeumorphicButton
                type="submit"
                disabled={isSubmitting}
                variant="flat"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                leftIcon={isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : undefined}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </NeumorphicButton>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4 flex-1">
              {/* Use simple working input styled with gradient border */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Full Name
                </label>
                <div className="relative group">
                  {/* Gradient border effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 via-accent-500 to-primary-600 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />

                  {/* Input container */}
                  <div className="relative bg-white rounded-2xl">
                    <div className="flex items-center">
                      {/* Icon */}
                      <div className="absolute left-4 pointer-events-none text-gray-400">
                        <User className="h-5 w-5" />
                      </div>

                      {/* Input */}
                      <input
                        type="text"
                        autoComplete="name"
                        {...signupForm.register('name')}
                        placeholder="Enter your full name"
                        className="w-full pl-12 pr-4 py-3 bg-transparent rounded-2xl text-gray-900 placeholder-gray-400 outline-none border-2 border-gray-200 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                {signupForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600 px-4">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">I am a:</label>
                <Controller
                  name="role"
                  control={signupForm.control}
                  render={({ field }) => (
                    <ToggleGroup
                      value={field.value}
                      onChange={field.onChange}
                      options={roleOptions}
                      variant="pills"
                      size="sm"
                    />
                  )}
                />
                {signupForm.formState.errors.role && (
                  <p className="mt-1 text-sm text-red-600 px-4">
                    {signupForm.formState.errors.role.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 via-accent-500 to-primary-600 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative bg-white rounded-2xl">
                    <div className="flex items-center">
                      <div className="absolute left-4 pointer-events-none text-gray-400">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        type="email"
                        autoComplete="email"
                        {...signupForm.register('email')}
                        placeholder="your.email@example.com"
                        className="w-full pl-12 pr-4 py-3 bg-transparent rounded-2xl text-gray-900 placeholder-gray-400 outline-none border-2 border-gray-200 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                {signupForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 px-4">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 via-accent-500 to-primary-600 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                  <div className="relative bg-white rounded-2xl">
                    <div className="flex items-center">
                      <div className="absolute left-4 pointer-events-none text-gray-400">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        type="password"
                        autoComplete="new-password"
                        {...signupForm.register('password')}
                        placeholder="Min. 6 characters"
                        className="w-full pl-12 pr-4 py-3 bg-transparent rounded-2xl text-gray-900 placeholder-gray-400 outline-none border-2 border-gray-200 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600 px-4">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <NeumorphicButton
                type="submit"
                disabled={isSubmitting}
                variant="flat"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                leftIcon={isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : undefined}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </NeumorphicButton>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          {/* Switch Mode */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={switchMode}
                disabled={isSubmitting}
                className="ml-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors disabled:opacity-50"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-gray-200"></div>
            <div className="px-4 text-xs text-gray-500 font-medium">or</div>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Login */}
          <button
            disabled={isSubmitting}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center space-x-3 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Loading Overlay during signup */}
        {isSubmitting && mode === 'signup' && (
          <div className="absolute inset-0 bg-white bg-opacity-95 rounded-2xl sm:rounded-3xl flex items-center justify-center z-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating your account...</h3>
              <p className="text-sm text-gray-600">Setting up your profile</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
