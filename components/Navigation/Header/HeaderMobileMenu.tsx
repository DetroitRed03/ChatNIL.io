'use client';

import { Menu, X, LayoutDashboard, User, Settings, LogOut, BookOpen, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * HeaderMobileMenu Component
 *
 * Mobile hamburger menu for authenticated users.
 * Shows navigation links in a drawer layout.
 *
 * PAUSED FEATURES (Marketplace/Messaging) - Intentionally removed:
 * - Messages link and unread badge (messaging is paused)
 * - Opportunities link for athletes (marketplace matching is paused)
 *
 * These can be re-enabled when marketplace features are activated.
 */

export default function HeaderMobileMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowMobileMenu(false);
  };

  if (!user) return null;

  // Role-specific menu items
  const isHSStudent = user.role === 'hs_student';
  const isCollegeAthlete = user.role === 'athlete' || user.role === 'college_athlete';
  const isParent = user.role === 'parent';
  const isComplianceOfficer = user.role === 'compliance_officer';

  // Get role-specific settings path
  const getSettingsPath = () => {
    if (isComplianceOfficer) return '/compliance/settings';
    if (isHSStudent) return '/dashboard/hs-student/settings';
    if (isCollegeAthlete) return '/dashboard/college-athlete/settings';
    if (isParent) return '/parent/settings';
    return '/settings';
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors relative"
        aria-label="Mobile menu"
        aria-expanded={showMobileMenu}
      >
        {showMobileMenu ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
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

              {/* HS Student: Library & Quizzes */}
              {isHSStudent && (
                <>
                  <button
                    onClick={() => {
                      router.push('/library');
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <BookOpen className="h-5 w-5 mr-3" />
                    Library
                  </button>
                  <button
                    onClick={() => {
                      router.push('/quizzes');
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <GraduationCap className="h-5 w-5 mr-3" />
                    Quizzes
                  </button>
                </>
              )}

              {/* College Athlete: Deals */}
              {isCollegeAthlete && (
                <>
                  <button
                    onClick={() => {
                      router.push('/deals');
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <BookOpen className="h-5 w-5 mr-3" />
                    My Deals
                  </button>
                  <button
                    onClick={() => {
                      router.push('/deals/validate');
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <BookOpen className="h-5 w-5 mr-3" />
                    Validate Deal
                  </button>
                </>
              )}

              <div className="border-t border-gray-200 my-3" />

              {/* Profile and Settings */}
              <button
                onClick={() => {
                  if (isHSStudent) {
                    router.push('/dashboard/hs-student');
                  } else {
                    router.push('/profile');
                  }
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User className="h-5 w-5 mr-3 text-gray-500" />
                {isHSStudent ? 'My Progress' : 'Profile'}
              </button>

              <button
                onClick={() => {
                  router.push(getSettingsPath());
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5 mr-3 text-gray-500" />
                Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                See You Later
              </button>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
