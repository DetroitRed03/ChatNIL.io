'use client';

import { MessageSquare, User, ChevronDown, Settings, LogOut, LayoutDashboard, Target, Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import AuthModal from './AuthModal';

export default function Header() {
  const { user, login, signup, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

      // Onboarding routing is now handled by useOnboardingGate hook automatically
    }
  };

  const handleSignup = async (name: string, email: string, password: string, role: UserRole) => {
    console.log('🚀 === HEADER SIGNUP HANDLER START ===');
    console.log('📝 Signup data:', { name, email, role });
    console.log('🔧 Router object check:', router);
    console.log('🔧 Router.push function:', typeof router.push);

    try {
      console.log('📞 Calling AuthContext signup function...');

      const result = await signup({
        name,
        email,
        password,
        role,
        profileData: {}
      });

      console.log('📋 === SIGNUP RESULT RECEIVED ===');
      console.log('🔍 Has error:', !!result.error);
      console.log('📊 Full result object:', result);

      if (result.error) {
        console.log('❌ Error message:', result.error);
      }

      if (result.error) {
        console.error('❌ === SIGNUP FAILED IN HEADER ===');
        console.error('💬 Error:', result.error);

        // Keep modal open so user can retry
        console.log('🔄 Keeping modal open for retry attempt');

        // Provide specific guidance based on error type
        if (result.error.includes('check your email')) {
          console.log('📧 This is an email confirmation error');
          console.log('⚙️  Need to disable email confirmation in Supabase dashboard');
          alert('🔧 Setup Issue: Email confirmation is enabled in Supabase.\n\nTo fix this:\n1. Go to your Supabase dashboard\n2. Navigate to Authentication → Settings\n3. Find "Email Auth" section\n4. Set "Confirm email" to OFF\n5. Save and try again\n\nThe form has been reset for a fresh attempt.');
        } else if (result.error.includes('already registered')) {
          alert('⚠️ This email is already registered. Try logging in instead or use a different email.\n\nThe form has been reset for a fresh attempt.');
        } else if (result.error.includes('Password')) {
          alert('❌ Password error: ' + result.error + '\n\nPlease try again with a different password.');
        } else {
          alert('❌ Signup failed: ' + result.error + '\n\nThe form has been reset for a fresh attempt.');
        }

        // Don't close modal on error - let user retry
        console.log('⚠️ Signup failed - modal remains open for retry');

        // Note: Form reset is now handled in AuthModal component's error handling
        // No need to reset state here since AuthContext handles cleanup
      } else {
        console.log('🎉 === SIGNUP SUCCESS ===');
        console.log('✅ No errors - proceeding with redirect');
        console.log('🔍 Current user state at signup success:', user);

        // Clear the form and close modal on success
        console.log('🔄 Closing signup modal...');
        setAuthModal({ isOpen: false, mode: 'signup' });
        console.log('✅ Modal closed successfully');
        console.log('ℹ️  Redirect is now handled in AuthContext - no Header redirect needed');
      }
    } catch (error) {
      console.error('💥 === UNEXPECTED ERROR IN HEADER ===');
      console.error('🚨 Error details:', error);

      // Keep modal open and show user-friendly error message
      console.log('🔄 Keeping modal open after unexpected error');
      alert('💥 An unexpected error occurred during signup.\n\nPlease try again. If the problem persists, try refreshing the page or using an incognito window.');

      // Note: Error cleanup is handled by AuthContext.cleanupFailedAuth
      // which is called automatically in the AuthContext signup function
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <>
      <header className="flex-shrink-0 bg-white border-b border-gray-100 px-3 sm:px-4 py-3 sm:py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold text-gray-900">ChatNIL</span>
          </div>


          {/* Right Side - Auth Buttons or User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Menu Button (only show when logged in) */}
            {user && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
            )}

            {!user ? (
              <>
                {/* Not logged in - Show login/signup buttons */}
                <button
                  onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                >
                  Log in
                </button>
                <button
                  onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-orange-500 text-white rounded-lg sm:rounded-xl hover:bg-orange-600 transition-colors shadow-sm hover:shadow-md"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                {/* Logged in - Show user menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      console.log('👆 User menu clicked, current state:', showUserMenu);
                      setShowUserMenu(!showUserMenu);
                    }}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 sm:w-9 sm:h-9 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                      {(user.profile as any)?.profile_image_url ? (
                        <img
                          src={(user.profile as any).profile_image_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs sm:text-sm font-medium text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                        <div className="py-2">
                          <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{user.email}</p>
                          </div>

                          {/* Navigation Items */}
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/dashboard');
                            }}
                            className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 mr-3 text-gray-500" />
                            Dashboard
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/opportunities');
                            }}
                            className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Target className="h-4 w-4 mr-3 text-gray-500" />
                            Opportunities
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/messages');
                            }}
                            className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Mail className="h-4 w-4 mr-3 text-gray-500" />
                            Messages
                          </button>

                          <div className="border-t border-gray-100 my-1" />

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/profile');
                            }}
                            className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="h-4 w-4 mr-3 text-gray-500" />
                            Profile
                          </button>

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              router.push('/settings');
                            }}
                            className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4 mr-3 text-gray-500" />
                            Settings
                          </button>

                          <div className="border-t border-gray-100 my-1 sm:my-2" />

                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {user && showMobileMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Mobile Menu */}
            <div className="fixed top-[73px] left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 md:hidden">
              <nav className="px-4 py-3 space-y-1">
                {/* Main Navigation */}
                <button
                  onClick={() => {
                    router.push('/dashboard');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    router.push('/opportunities');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Target className="h-5 w-5 mr-3" />
                  Opportunities
                </button>

                <button
                  onClick={() => {
                    router.push('/messages');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Mail className="h-5 w-5 mr-3" />
                  Messages
                </button>

                <div className="border-t border-gray-200 my-3" />

                {/* Profile and Settings */}
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User className="h-5 w-5 mr-3 text-gray-500" />
                  Profile
                </button>

                <button
                  onClick={() => {
                    router.push('/settings');
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 mr-3 text-gray-500" />
                  Settings
                </button>

                <button
                  onClick={async () => {
                    await handleLogout();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                  Sign out
                </button>
              </nav>
            </div>
          </>
        )}
      </header>

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