'use client';

import { ChevronDown, User, Settings, LogOut, LayoutDashboard, BookOpen, GraduationCap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

/**
 * HeaderUserMenu Component
 *
 * User profile dropdown menu in the header.
 * Displays avatar, user info, and navigation links.
 *
 * PAUSED FEATURES (Marketplace/Messaging) - Intentionally removed:
 * - Messages link and unread badge (messaging is paused)
 * - Opportunities link for athletes (marketplace matching is paused)
 *
 * These can be re-enabled when marketplace features are activated.
 */

export default function HeaderUserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    // Redirect to home page after logout
    router.push('/');
  };

  if (!user) return null;

  // Role-specific menu items
  const isHSStudent = user.role === 'hs_student';
  const isCollegeAthlete = user.role === 'athlete' || user.role === 'college_athlete';
  const isParent = user.role === 'parent';
  const isComplianceOfficer = user.role === 'compliance_officer';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowUserMenu(!showUserMenu)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors relative"
        aria-label="User menu"
        aria-expanded={showUserMenu}
        aria-haspopup="true"
      >
        <div className="relative">
          <Avatar
            src={(user.profile as any)?.profile_photo_url}
            alt={`${user.name}'s profile`}
            fallback={user.name}
            size="sm"
            className="w-7 h-7 sm:w-9 sm:h-9"
          />
        </div>
        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" aria-hidden="true" />
      </button>

      {/* Dropdown Menu */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="py-2">
            {/* User Info Header */}
            <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{user.email}</p>
            </div>

            {/* Dashboard - role-specific routing */}
            <button
              onClick={() => {
                setShowUserMenu(false);
                if (isComplianceOfficer) {
                  router.push('/compliance/dashboard');
                } else if (isParent) {
                  router.push('/parent/children');
                } else {
                  router.push('/dashboard');
                }
              }}
              className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 mr-3 text-gray-500" />
              Dashboard
            </button>

            {/* HS Student: Library & Quizzes */}
            {isHSStudent && (
              <>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/library');
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-3 text-gray-500" />
                  Library
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/quizzes');
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <GraduationCap className="h-4 w-4 mr-3 text-gray-500" />
                  Quizzes
                </button>
              </>
            )}

            {/* College Athlete: Deals */}
            {isCollegeAthlete && (
              <>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/deals');
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-3 text-gray-500" />
                  My Deals
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/deals/validate');
                  }}
                  className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-3 text-gray-500" />
                  Validate Deal
                </button>
              </>
            )}

            <div className="border-t border-gray-100 my-1" />

            {/* Profile / My Account */}
            <button
              onClick={() => {
                setShowUserMenu(false);
                if (isComplianceOfficer) {
                  router.push('/compliance/settings');
                } else if (isParent) {
                  router.push('/parent/settings');
                } else if (isHSStudent) {
                  router.push('/dashboard/hs-student');
                } else {
                  router.push('/profile');
                }
              }}
              className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="h-4 w-4 mr-3 text-gray-500" />
              {isComplianceOfficer || isParent ? 'My Account' : isHSStudent ? 'My Progress' : 'Profile'}
            </button>

            <button
              onClick={() => {
                setShowUserMenu(false);
                if (isComplianceOfficer) {
                  router.push('/compliance/settings');
                } else if (isHSStudent) {
                  router.push('/dashboard/hs-student/settings');
                } else if (isCollegeAthlete) {
                  router.push('/dashboard/college-athlete/settings');
                } else if (isParent) {
                  router.push('/parent/settings');
                } else {
                  router.push('/settings');
                }
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
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
