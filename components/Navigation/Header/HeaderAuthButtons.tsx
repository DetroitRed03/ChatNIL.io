'use client';

import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

/**
 * HeaderAuthButtons Component
 *
 * Displays login and signup buttons for non-authenticated users.
 * Handles the authentication modal and user signup/login flow.
 */

export default function HeaderAuthButtons() {
  const { login, signup } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });

  const handleLogin = async (email: string, password: string) => {
    console.log('🔐 Login attempt for:', email);
    const result = await login(email, password);
    if (result.error) {
      console.error('❌ Login failed:', result.error);
      alert('Login failed: ' + result.error);
    } else {
      console.log('✅ Login successful');
      setAuthModal({ isOpen: false, mode: 'login' });
    }
  };

  const handleSignup = async (name: string, email: string, password: string, role: UserRole) => {
    console.log('🚀 Signup attempt:', { name, email, role });

    try {
      const result = await signup({
        name,
        email,
        password,
        role,
        profileData: {}
      });

      if (result.error) {
        console.error('❌ Signup failed:', result.error);

        // Provide specific guidance based on error type
        if (result.error.includes('check your email')) {
          alert('🔧 Setup Issue: Email confirmation is enabled in Supabase.\n\nTo fix this:\n1. Go to your Supabase dashboard\n2. Navigate to Authentication → Settings\n3. Find "Email Auth" section\n4. Set "Confirm email" to OFF\n5. Save and try again\n\nThe form has been reset for a fresh attempt.');
        } else if (result.error.includes('already registered')) {
          alert('⚠️ This email is already registered. Try logging in instead or use a different email.\n\nThe form has been reset for a fresh attempt.');
        } else if (result.error.includes('Password')) {
          alert('❌ Password error: ' + result.error + '\n\nPlease try again with a different password.');
        } else {
          alert('❌ Signup failed: ' + result.error + '\n\nThe form has been reset for a fresh attempt.');
        }
      } else {
        console.log('✅ Signup successful');
        setAuthModal({ isOpen: false, mode: 'signup' });
      }
    } catch (error) {
      console.error('💥 Unexpected error during signup:', error);
      alert('💥 An unexpected error occurred during signup.\n\nPlease try again. If the problem persists, try refreshing the page or using an incognito window.');
    }
  };

  return (
    <>
      <button
        onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
      >
        Welcome Back
      </button>
      <button
        onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-primary-500 text-white rounded-lg sm:rounded-xl hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
      >
        Get Started
      </button>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        initialMode={authModal.mode}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    </>
  );
}
