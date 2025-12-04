'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Switch } from '@/components/ui/Switch';
import { supabase } from '@/lib/supabase';
import {
  User,
  Shield,
  Bell,
  Info,
  RefreshCw,
  AlertTriangle,
  Check
} from 'lucide-react';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';

type SettingsSection = 'account' | 'role' | 'privacy' | 'notifications' | 'about';

export default function SettingsPage() {
  const { user, refreshUserProfile, logout } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  // Notification preferences (example state)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleRoleChange = async () => {
    if (!selectedNewRole || !user) return;
    setIsChangingRole(true);

    try {
      const response = await fetch('/api/user/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          newRole: selectedNewRole,
        }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid response from server: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        const errorMessage = data.details
          ? `Failed to change role: ${data.details}${data.hint ? `\nHint: ${data.hint}` : ''}`
          : data.error || 'Failed to change role';
        throw new Error(errorMessage);
      }

      await refreshUserProfile();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('chatnil-onboarding-state-v1');
        localStorage.removeItem('chatnil-onboarding-data-v1');
        localStorage.removeItem('chatnil-onboarding-backup-data-v1');
      }

      router.push(`/onboarding?role=${selectedNewRole}`);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to change role. Please try again.';
      alert(`Role change failed:\n\n${errorMessage}\n\nPlease check the browser console (F12) for detailed error information.`);
    } finally {
      setIsChangingRole(false);
      setShowRoleModal(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'athlete': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'parent': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'coach': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'athlete': return '🏆';
      case 'parent': return '👨‍👩‍👧‍👦';
      case 'coach': return '👨‍🏫';
      default: return '👤';
    }
  };

  const sidebarItems = [
    { id: 'account' as SettingsSection, icon: User, label: 'Account' },
    { id: 'role' as SettingsSection, icon: RefreshCw, label: 'Role' },
    { id: 'privacy' as SettingsSection, icon: Shield, label: 'Privacy' },
    { id: 'notifications' as SettingsSection, icon: Bell, label: 'Notifications' },
    { id: 'about' as SettingsSection, icon: Info, label: 'About' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col overflow-y-auto bg-background">
        <div className="flex-1 flex">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 border-r border-border bg-background-card p-4 hidden md:block">
          <h2 className="text-lg font-semibold text-text-primary mb-4 px-3">Settings</h2>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-text-secondary hover:bg-background-hover hover:text-text-primary'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Section Selector */}
        <div className="md:hidden w-full border-b border-border bg-background-card p-4">
          <label className="text-sm font-medium text-text-secondary mb-2 block">Section</label>
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as SettingsSection)}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {sidebarItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Account Section */}
            {activeSection === 'account' && (
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-6">Account Information</h1>
                <div className="bg-background-card border border-border rounded-xl p-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-text-secondary">Name</label>
                    <p className="text-text-primary mt-1">{user?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text-secondary">Email</label>
                    <p className="text-text-primary mt-1">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-text-secondary">Role</label>
                    <div className="mt-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getRoleBadgeColor(user?.role || '')}`}>
                        {getRoleIcon(user?.role || '')} {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Role Section */}
            {activeSection === 'role' && (
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-6">Role Management</h1>
                <div className="bg-background-card border border-border rounded-xl p-6">
                  <div className="mb-6">
                    <label className="text-sm font-semibold text-text-secondary mb-3 block">Current Role</label>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getRoleIcon(user?.role || '')}</span>
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getRoleBadgeColor(user?.role || '')}`}>
                        {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-warning-900 mb-1">Important Information</h4>
                        <p className="text-sm text-warning-800">
                          Changing your role will reset your profile data and redirect you to onboarding for the new role.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowRoleModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Change Role
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-6">Privacy & Security</h1>
                <div className="bg-background-card border border-border rounded-xl p-6">
                  <p className="text-text-tertiary text-sm">Privacy and security settings coming soon.</p>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-6">Notifications</h1>
                <div className="bg-background-card border border-border rounded-xl p-6 space-y-6">
                  <Switch
                    label="Email Notifications"
                    description="Receive updates and notifications via email"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <Switch
                    label="Push Notifications"
                    description="Receive push notifications on your device"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                  <Switch
                    label="Marketing Emails"
                    description="Receive promotional emails and newsletters"
                    checked={marketingEmails}
                    onChange={(e) => setMarketingEmails(e.target.checked)}
                  />
                </div>
              </div>
            )}

            {/* About Section */}
            {activeSection === 'about' && (
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-6">About ChatNIL</h1>
                <div className="bg-background-card border border-border rounded-xl p-6">
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-semibold text-text-primary">Version:</span>
                      <span className="ml-2 text-text-secondary">1.0.0</span>
                    </div>
                    <div>
                      <span className="font-semibold text-text-primary">Platform:</span>
                      <span className="ml-2 text-text-secondary">ChatNIL.io</span>
                    </div>
                    <div>
                      <span className="font-semibold text-text-primary">Support:</span>
                      <span className="ml-2 text-text-secondary">support@chatnil.io</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
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
            <div className="bg-background-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-border">
              <div className="px-6 py-5 bg-primary-500">
                <h3 className="text-xl font-bold text-white">Change Your Role</h3>
              </div>

              <div className="p-6">
                <p className="text-text-secondary mb-4">
                  Select your new role. Your profile data will be reset and you'll be redirected to onboarding.
                </p>

                <div className="space-y-3 mb-6">
                  {(['athlete', 'parent', 'coach'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedNewRole(role)}
                      disabled={role === user?.role}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        role === user?.role
                          ? 'border-border bg-background cursor-not-allowed opacity-50'
                          : selectedNewRole === role
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-border hover:border-primary-300 hover:bg-primary-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getRoleIcon(role)}</span>
                          <div className="text-left">
                            <p className="font-semibold text-text-primary">
                              {role.charAt(0).toUpperCase()}{role.slice(1)}
                            </p>
                            {role === user?.role && (
                              <p className="text-xs text-text-tertiary">Current role</p>
                            )}
                          </div>
                        </div>
                        {selectedNewRole === role && (
                          <Check className="h-5 w-5 text-primary-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="bg-error-50 border border-error-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-error-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-error-900 mb-1">Warning</h4>
                      <p className="text-sm text-error-800">
                        This will clear your current profile data and cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    disabled={isChangingRole}
                    className="flex-1 px-4 py-3 border border-border text-text-primary rounded-xl font-semibold hover:bg-background-hover transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRoleChange}
                    disabled={!selectedNewRole || isChangingRole}
                    className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingRole ? 'Changing...' : 'Confirm Change'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
