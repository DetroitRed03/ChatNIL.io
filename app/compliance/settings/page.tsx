'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ComplianceSettings,
  ComplianceTeamMember,
  ComplianceTeamInvite,
  defaultComplianceSettings
} from '@/types/settings';
import {
  Settings,
  User,
  Zap,
  Bell,
  Users,
  Shield,
  ArrowLeft,
  Save,
  Plus,
  X,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

type TabId = 'profile' | 'workflow' | 'notifications' | 'team' | 'security';

export default function ComplianceSettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Partial<ComplianceSettings>>(defaultComplianceSettings);
  const [institution, setInstitution] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<ComplianceTeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<ComplianceTeamInvite[]>([]);

  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Get auth token for API calls
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const headers: HeadersInit = accessToken
        ? { 'Authorization': `Bearer ${accessToken}` }
        : {};

      const [settingsRes, teamRes] = await Promise.all([
        fetch('/api/compliance/settings', {
          credentials: 'include',
          headers
        }),
        fetch('/api/compliance/team/members', {
          credentials: 'include',
          headers
        })
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings || defaultComplianceSettings);
        setInstitution(settingsData.institution);
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData.members || []);
        setPendingInvites(teamData.invites || []);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, fetchData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
      };

      const res = await fetch('/api/compliance/settings', {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(settings)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof ComplianceSettings>(key: K, value: ComplianceSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };


  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!user || user.role !== 'compliance_officer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500 mt-2">This page is for compliance officers only.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-orange-600 hover:text-orange-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'workflow', label: 'Workflow', icon: <Zap className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/compliance/dashboard')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Settings
              </h1>
              {institution && (
                <p className="text-gray-500 mt-1">{institution.name}</p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  value={institution?.name || 'Not set'}
                  disabled
                  className="w-full p-3 bg-gray-100 border rounded-xl text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Contact admin to change institution</p>
              </div>

              {institution && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conference
                    </label>
                    <input
                      type="text"
                      value={institution?.conference || 'N/A'}
                      disabled
                      className="w-full p-3 bg-gray-100 border rounded-xl text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={institution?.state || 'N/A'}
                      disabled
                      className="w-full p-3 bg-gray-100 border rounded-xl text-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workflow Tab */}
        {activeTab === 'workflow' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Workflow Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Deal Review Deadline (days)
                </label>
                <select
                  value={settings.default_review_deadline_days || 3}
                  onChange={e => updateSetting('default_review_deadline_days', parseInt(e.target.value))}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  <option value={1}>1 day</option>
                  <option value={2}>2 days</option>
                  <option value={3}>3 days</option>
                  <option value={5}>5 days</option>
                  <option value={7}>7 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-flag deals above ($)
                </label>
                <input
                  type="number"
                  value={settings.auto_flag_deal_threshold || 5000}
                  onChange={e => updateSetting('auto_flag_deal_threshold', parseFloat(e.target.value))}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">Deals above this value will be automatically flagged for review</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Require second approval above ($)
                </label>
                <input
                  type="number"
                  value={settings.require_second_approval_threshold || 10000}
                  onChange={e => updateSetting('require_second_approval_threshold', parseFloat(e.target.value))}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Enable AI Deal Analysis</p>
                  <p className="text-sm text-gray-500">AI will analyze deals for potential compliance issues</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable_ai_deal_analysis ?? true}
                  onChange={e => updateSetting('enable_ai_deal_analysis', e.target.checked)}
                  className="w-5 h-5 rounded text-orange-600"
                />
              </label>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Notification Preferences</h2>

            <div className="space-y-3">
              {[
                { key: 'notify_new_deal_submitted' as const, label: 'New deal submitted for review', desc: 'When an athlete submits a deal' },
                { key: 'notify_deal_deadline_approaching' as const, label: 'Deal deadline approaching', desc: '24 hours before review deadline' },
                { key: 'notify_athlete_flagged' as const, label: 'Athlete flagged by system', desc: 'When AI detects potential issues' },
                { key: 'notify_weekly_summary' as const, label: 'Weekly compliance summary', desc: 'Summary every Monday morning' },
                { key: 'notify_state_rule_changes' as const, label: 'State rule changes', desc: 'When NIL rules change in your state' },
                { key: 'notify_team_activity' as const, label: 'Team member activity', desc: 'When team members take actions' }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings[item.key] ?? true}
                    onChange={e => updateSetting(item.key, e.target.checked)}
                    className="w-5 h-5 rounded text-orange-600"
                  />
                </label>
              ))}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Delivery Methods</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.email_enabled ?? true}
                    onChange={e => updateSetting('email_enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.push_enabled ?? true}
                    onChange={e => updateSetting('push_enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600"
                  />
                  <span>Push Notifications</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Compliance Team</h2>
                <p className="text-sm text-gray-500">
                  {teamMembers.length} active member{teamMembers.length !== 1 ? 's' : ''}
                  {pendingInvites.length > 0 && ` · ${pendingInvites.length} pending invite${pendingInvites.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Manage your compliance team, invite new members, view workload distribution, and track assignments from the dedicated team management page.
            </p>

            <button
              onClick={() => router.push('/compliance/team')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-medium transition-colors"
            >
              Manage Team
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Security Settings</h2>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-3">Add an extra layer of security to your account</p>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  Enable 2FA
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium mb-2">Session Management</h3>
                <p className="text-sm text-gray-500 mb-3">View and manage active sessions</p>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  View Sessions
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <h3 className="font-medium mb-2">Change Password</h3>
                <p className="text-sm text-gray-500 mb-3">Update your account password</p>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
