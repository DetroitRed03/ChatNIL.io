'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/AuthGuard';
import AppShell from '@/components/Chat/AppShell';
import Header from '@/components/Header';
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Bell,
  Info,
  RefreshCw,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';

function SettingsPageContent() {
  const { user, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  const handleRoleChange = async () => {
    if (!selectedNewRole || !user) return;

    setIsChangingRole(true);

    try {
      console.log('🔄 === ROLE CHANGE REQUEST STARTING ===');
      console.log('📋 Request details:', {
        userId: user.id,
        currentRole: user.role,
        newRole: selectedNewRole
      });

      // Call API to change role
      const response = await fetch('/api/user/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          newRole: selectedNewRole,
        }),
      });

      console.log('📊 API Response status:', response.status);
      console.log('📊 API Response headers:', Object.fromEntries(response.headers.entries()));

      let data;
      const responseText = await response.text();
      console.log('📄 Raw response text:', responseText);

      try {
        data = JSON.parse(responseText);
        console.log('📊 Parsed response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        console.error('❌ Role change API returned error');
        console.error('❌ Response status:', response.status);
        console.error('❌ Error data:', data);
        console.error('❌ Error details:', data.details);
        console.error('❌ Error hint:', data.hint);

        const errorMessage = data.details
          ? `Failed to change role: ${data.details}${data.hint ? `\nHint: ${data.hint}` : ''}`
          : data.error || 'Failed to change role';

        throw new Error(errorMessage);
      }

      console.log('✅ Role changed successfully:', data);

      // Refresh user profile to load new role data
      console.log('🔄 Refreshing user profile with new role...');
      await refreshUserProfile();
      console.log('✅ User profile refreshed');

      // Clear onboarding localStorage cache to prevent old role from being restored
      console.log('🧹 Clearing onboarding localStorage cache...');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chatnil-onboarding-state-v1');
        localStorage.removeItem('chatnil-onboarding-data-v1');
        localStorage.removeItem('chatnil-onboarding-backup-data-v1');
        console.log('✅ Onboarding cache cleared');
      }

      // Redirect to onboarding with the new role as parameter
      console.log(`🔄 Redirecting to onboarding with role: ${selectedNewRole}`);
      console.log('✅ === ROLE CHANGE COMPLETED SUCCESSFULLY ===');
      router.push(`/onboarding?role=${selectedNewRole}`);
    } catch (error: any) {
      console.error('💥 === ROLE CHANGE FAILED ===');
      console.error('❌ Error type:', error.constructor.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Full error object:', error);

      const errorMessage = error.message || 'Failed to change role. Please try again.';
      alert(`Role change failed:\n\n${errorMessage}\n\nPlease check the browser console (F12) for detailed error information.`);
    } finally {
      setIsChangingRole(false);
      setShowRoleModal(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'athlete':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'parent':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'coach':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'athlete':
        return '🏆';
      case 'parent':
        return '👨‍👩‍👧‍👦';
      case 'coach':
        return '👨‍🏫';
      default:
        return '👤';
    }
  };

  return (
    <AppShell>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-6 px-4 sm:p-6 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Name</label>
                  <p className="text-gray-900 mt-1">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Role Management */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Role Management</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Current Role</label>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{getRoleIcon(user?.role || '')}</span>
                    <div>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getRoleBadgeColor(user?.role || '')}`}>
                        {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-yellow-900 mb-1">Important Information</h4>
                      <p className="text-sm text-yellow-800">
                        Changing your role will reset your profile data and redirect you to onboarding for the new role.
                        This action is useful if you signed up with the wrong role.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowRoleModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Change Role
                </button>
              </div>
            </div>

            {/* Privacy & Security */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm">Privacy and security settings coming soon.</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm">Notification preferences coming soon.</p>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center">
                    <Info className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">About</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Platform:</strong> ChatNIL.io</p>
                  <p><strong>Support:</strong> support@chatnil.io</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => !isChangingRole && setShowRoleModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-orange-400 to-orange-500">
                <h3 className="text-xl font-bold text-white">Change Your Role</h3>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    Select your new role. Your profile data will be reset and you'll be redirected to onboarding.
                  </p>

                  {/* Role Selection */}
                  <div className="space-y-3">
                    {(['athlete', 'parent', 'coach'] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        onClick={() => setSelectedNewRole(role)}
                        disabled={role === user?.role}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          role === user?.role
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                            : selectedNewRole === role
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getRoleIcon(role)}</span>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">
                                {role.charAt(0).toUpperCase()}{role.slice(1)}
                              </p>
                              {role === user?.role && (
                                <p className="text-xs text-gray-500">Current role</p>
                              )}
                            </div>
                          </div>
                          {selectedNewRole === role && (
                            <Check className="h-5 w-5 text-orange-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-1">Warning</h4>
                      <p className="text-sm text-red-800">
                        This will clear your current profile data and cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    disabled={isChangingRole}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRoleChange}
                    disabled={!selectedNewRole || isChangingRole}
                    className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingRole ? 'Changing...' : 'Confirm Change'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  );
}