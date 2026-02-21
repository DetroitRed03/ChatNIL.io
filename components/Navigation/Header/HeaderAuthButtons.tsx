'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

/**
 * HeaderAuthButtons Component
 *
 * Displays login and signup buttons for non-authenticated users.
 * Login opens the auth modal; Sign up redirects to /signup.
 */

export default function HeaderAuthButtons() {
  const router = useRouter();
  const { login } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (result.error) {
      alert('Login failed: ' + result.error);
    } else {
      setAuthModal({ isOpen: false, mode: 'login' });
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
        onClick={() => router.push('/signup')}
        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-primary-500 text-white rounded-lg sm:rounded-xl hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
      >
        Get Started
      </button>

      {/* Auth Modal - Login only */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        initialMode="login"
        onLogin={handleLogin}
        onSignup={async () => { router.push('/signup'); }}
      />
    </>
  );
}
