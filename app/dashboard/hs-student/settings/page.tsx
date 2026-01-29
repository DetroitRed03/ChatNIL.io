'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  AthleteSettings,
  defaultAthleteSettings,
  nilInterestCategories,
  excludedCategories
} from '@/types/settings';
import {
  Settings,
  User,
  Bell,
  BookOpen,
  Shield,
  ArrowLeft,
  Save,
  Check,
  AlertCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  Clock,
  GraduationCap
} from 'lucide-react';

type TabId = 'profile' | 'notifications' | 'learning' | 'privacy';

export default function HSStudentSettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Partial<AthleteSettings>>(defaultAthleteSettings);
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  useEffect(() => {
    if (!authLoading && user) {
      fetchSettings();
    }
  }, [authLoading, user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/athlete/settings');

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || defaultAthleteSettings);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch('/api/athlete/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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

  const updateSetting = <K extends keyof AthleteSettings>(key: K, value: AthleteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user || user.role !== 'hs_student') {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500 mt-2">This page is for high school students only.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'learning', label: 'Learning', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/dashboard/hs-student')}
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
              <p className="text-gray-500 mt-1">Manage your preferences</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
                  ? 'bg-primary-600 text-white'
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
            <h2 className="text-lg font-bold">Profile Settings</h2>

            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">High School Athlete</p>
                    <p className="text-sm text-amber-700 mt-1">
                      As a high school student, some features are limited to protect your privacy.
                      Your parent/guardian can manage additional settings.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Visibility
                </label>
                <select
                  value={settings.profile_visibility || 'private'}
                  onChange={e => updateSetting('profile_visibility', e.target.value as any)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="private">Private - Only you can see</option>
                  <option value="school_only">School Only - Visible to your school</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Public profiles are not available for high school students</p>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Show Follower Counts</p>
                  <p className="text-sm text-gray-500">Display your social media follower counts</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_follower_counts ?? true}
                  onChange={e => updateSetting('show_follower_counts', e.target.checked)}
                  className="w-5 h-5 rounded text-primary-600"
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
                { key: 'notify_learning_content' as const, label: 'New learning content', desc: 'When new lessons or quizzes are available' },
                { key: 'notify_compliance_update' as const, label: 'Compliance updates', desc: 'Important NIL rule updates for your state' }
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
                    className="w-5 h-5 rounded text-primary-600"
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
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.push_enabled ?? true}
                    onChange={e => updateSetting('push_enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span>Push Notifications</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Learning Tab */}
        {activeTab === 'learning' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Learning Preferences</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <select
                  value={settings.difficulty_level || 'standard'}
                  onChange={e => updateSetting('difficulty_level', e.target.value as any)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="easy">Easy - Beginner-friendly content</option>
                  <option value="standard">Standard - Balanced learning</option>
                  <option value="advanced">Advanced - More challenging content</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Reminder Time
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    value={settings.daily_reminder_time || ''}
                    onChange={e => updateSetting('daily_reminder_time', e.target.value)}
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Get a daily reminder to complete your learning</p>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Show Explanations</p>
                  <p className="text-sm text-gray-500">Display detailed explanations after answering quiz questions</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_explanations ?? true}
                  onChange={e => updateSetting('show_explanations', e.target.checked)}
                  className="w-5 h-5 rounded text-primary-600"
                />
              </label>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Privacy Settings</h2>

            <div className="space-y-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">Your Privacy is Protected</p>
                    <p className="text-sm text-orange-700 mt-1">
                      As a minor, brands cannot contact you directly. All NIL opportunities
                      must go through your parent/guardian first.
                    </p>
                  </div>
                </div>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl opacity-50">
                <div>
                  <p className="font-medium">Allow Brand Contact</p>
                  <p className="text-sm text-gray-500">Disabled for high school students</p>
                </div>
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  className="w-5 h-5 rounded text-gray-400"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl opacity-50">
                <div>
                  <p className="font-medium">Show Contact Information</p>
                  <p className="text-sm text-gray-500">Disabled for high school students</p>
                </div>
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  className="w-5 h-5 rounded text-gray-400"
                />
              </label>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
