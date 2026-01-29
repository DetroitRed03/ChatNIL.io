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
  DollarSign,
  Shield,
  ArrowLeft,
  Save,
  Check,
  AlertCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  Briefcase
} from 'lucide-react';

type TabId = 'profile' | 'nil' | 'notifications' | 'privacy';

export default function CollegeAthleteSettingsPage() {
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

  const toggleArrayItem = (key: 'nil_interests' | 'excluded_categories', item: string) => {
    const current = settings[key] || [];
    const updated = current.includes(item)
      ? current.filter(i => i !== item)
      : [...current, item];
    updateSetting(key, updated);
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user || !['college_athlete', 'athlete'].includes(user.role || '')) {
    return (
      <div className="min-h-screen bg-[#FAF6F1] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500 mt-2">This page is for college athletes only.</p>
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
    { id: 'nil', label: 'NIL Preferences', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/dashboard/college-athlete')}
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
              <p className="text-gray-500 mt-1">Manage your NIL preferences</p>
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
                  <option value="public">Public - Visible to brands</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Show Follower Counts</p>
                  <p className="text-sm text-gray-500">Display your social media follower counts on your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_follower_counts ?? true}
                  onChange={e => updateSetting('show_follower_counts', e.target.checked)}
                  className="w-5 h-5 rounded text-primary-600"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Show Contact Information</p>
                  <p className="text-sm text-gray-500">Allow brands to see your contact details</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_contact_info ?? false}
                  onChange={e => updateSetting('show_contact_info', e.target.checked)}
                  className="w-5 h-5 rounded text-primary-600"
                />
              </label>
            </div>
          </div>
        )}

        {/* NIL Preferences Tab */}
        {activeTab === 'nil' && (
          <div className="space-y-6">
            {/* Interests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">NIL Interests</h2>
              <p className="text-sm text-gray-500 mb-4">Select categories you&apos;re interested in for brand partnerships</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {nilInterestCategories.map(category => {
                  const isSelected = settings.nil_interests?.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleArrayItem('nil_interests', category.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Excluded Categories */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">Categories to Exclude</h2>
              <p className="text-sm text-gray-500 mb-4">Select categories you don&apos;t want to be approached for</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {excludedCategories.map(category => {
                  const isSelected = settings.excluded_categories?.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleArrayItem('excluded_categories', category.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${
                        isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Deal Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold">Deal Preferences</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Deal Value ($)
                </label>
                <input
                  type="number"
                  value={settings.min_deal_value || ''}
                  onChange={e => updateSetting('min_deal_value', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="No minimum"
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Only show opportunities above this value</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appearance Availability
                </label>
                <select
                  value={settings.appearance_availability || ''}
                  onChange={e => updateSetting('appearance_availability', e.target.value as any)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Not specified</option>
                  <option value="weekends">Weekends only</option>
                  <option value="flexible">Flexible schedule</option>
                  <option value="limited">Very limited availability</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Time Goal
                </label>
                <select
                  value={settings.response_time_goal || ''}
                  onChange={e => updateSetting('response_time_goal', e.target.value as any)}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Not specified</option>
                  <option value="24_hours">Within 24 hours</option>
                  <option value="48_hours">Within 48 hours</option>
                  <option value="week">Within a week</option>
                </select>
              </div>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Willing to Travel</p>
                    <p className="text-sm text-gray-500">Open to in-person events outside your area</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.willing_to_travel ?? false}
                  onChange={e => updateSetting('willing_to_travel', e.target.checked)}
                  className="w-5 h-5 rounded text-primary-600"
                />
              </label>

              {settings.willing_to_travel && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Travel Radius (miles)
                  </label>
                  <input
                    type="number"
                    value={settings.travel_radius_miles || ''}
                    onChange={e => updateSetting('travel_radius_miles', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Enter miles"
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Notification Preferences</h2>

            <div className="space-y-3">
              {[
                { key: 'notify_new_opportunity' as const, label: 'New opportunities', desc: 'When brands show interest or send offers' },
                { key: 'notify_brand_viewed_profile' as const, label: 'Profile views', desc: 'When brands view your profile' },
                { key: 'notify_deal_status_changed' as const, label: 'Deal updates', desc: 'When your deals are approved or rejected' },
                { key: 'notify_payment_received' as const, label: 'Payment received', desc: 'When you receive a payment' },
                { key: 'notify_compliance_update' as const, label: 'Compliance updates', desc: 'Important NIL rule changes' },
                { key: 'notify_learning_content' as const, label: 'Learning content', desc: 'New educational resources' }
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
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.sms_enabled ?? false}
                    onChange={e => updateSetting('sms_enabled', e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span>SMS</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold">Privacy Settings</h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Allow Brand Contact</p>
                  <p className="text-sm text-gray-500">Let brands message you directly about opportunities</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_brand_contact ?? false}
                  onChange={e => updateSetting('allow_brand_contact', e.target.checked)}
                  className="w-5 h-5 rounded text-primary-600"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium">Show Contact Information</p>
                  <p className="text-sm text-gray-500">Display your email and phone on your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_contact_info ?? false}
                  onChange={e => updateSetting('show_contact_info', e.target.checked)}
                  className="w-5 h-5 rounded text-primary-600"
                />
              </label>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800">Your Data is Protected</p>
                    <p className="text-sm text-orange-700 mt-1">
                      We never share your personal information without your consent.
                      All NIL deals are reviewed by your school&apos;s compliance office.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
