'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ChevronDown, Settings, LogOut, UserCircle, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingHeaderProps {
  className?: string;
}

export default function OnboardingHeader({ className = '' }: OnboardingHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const handleViewProfile = () => {
    setShowUserMenu(false);
    router.push('/profile');
  };

  if (!user) {
    return null; // Don't show header if no user
  }

  return (
    <div className={`bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Onboarding indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Setting up your profile</span>
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="relative">
            <button
              onClick={() => {
                console.log('👆 Onboarding user menu clicked, current state:', showUserMenu);
                setShowUserMenu(!showUserMenu);
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-sm font-medium text-white">
                  {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              {/* User Info */}
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                  {user.name || 'User'}
                </div>
                <div className="text-xs text-gray-600 truncate max-w-[150px]">
                  {user.email}
                </div>
              </div>

              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />

                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
                  <div className="py-2">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-orange-600 font-medium mt-1">
                            Profile setup in progress
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={handleViewProfile}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">View Profile</div>
                        <div className="text-xs text-gray-500">See your current progress</div>
                      </div>
                    </button>

                    <button
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setShowUserMenu(false);
                        // Could add settings modal here later
                      }}
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">Settings</div>
                        <div className="text-xs text-gray-500">Available after setup</div>
                      </div>
                    </button>

                    <div className="border-t border-gray-100 my-2" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">Sign out</div>
                        <div className="text-xs text-gray-500">Save progress and exit</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}