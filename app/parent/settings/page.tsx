'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface NotificationPrefs {
  weekly_digest: boolean;
  inactivity_alerts: boolean;
  milestone_notifications: boolean;
  deal_alerts: boolean;
  urgent_only: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
}

export default function ParentSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    weekly_digest: true,
    inactivity_alerts: true,
    milestone_notifications: true,
    deal_alerts: true,
    urgent_only: false,
    email_enabled: true,
    push_enabled: false,
    sms_enabled: false
  });

  const fetchPreferences = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const headers: HeadersInit = accessToken
        ? { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      const res = await fetch('/api/parent/settings/notifications', {
        credentials: 'include',
        headers
      });

      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPrefs(data.preferences);
        }
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const headers: HeadersInit = accessToken
        ? { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' };

      const res = await fetch('/api/parent/settings/notifications', {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify(prefs)
      });

      if (res.ok) {
        alert('Settings saved successfully');
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">Parent Settings</h1>
          <p className="text-gray-500">Manage your notifications and privacy</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Notification Types */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">🔔 Notification Types</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">Weekly Digest</span>
                <p className="text-sm text-gray-500">Summary of your child&apos;s weekly progress</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.weekly_digest}
                onChange={() => togglePref('weekly_digest')}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">Inactivity Alerts</span>
                <p className="text-sm text-gray-500">Alert when your child hasn&apos;t logged in for 3+ days</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.inactivity_alerts}
                onChange={() => togglePref('inactivity_alerts')}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">Milestone Notifications</span>
                <p className="text-sm text-gray-500">Celebrate badges, streaks, and chapter completions</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.milestone_notifications}
                onChange={() => togglePref('milestone_notifications')}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">Deal Alerts</span>
                <p className="text-sm text-gray-500">Notify when new NIL opportunities match your child</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.deal_alerts}
                onChange={() => togglePref('deal_alerts')}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">Urgent Only Mode</span>
                <p className="text-sm text-gray-500">Only receive critical notifications</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.urgent_only}
                onChange={() => togglePref('urgent_only')}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Delivery Methods */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">📬 Delivery Methods</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">Email</span>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.email_enabled}
                onChange={() => togglePref('email_enabled')}
                className="w-5 h-5 text-purple-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">Push Notifications</span>
                <p className="text-sm text-gray-500">Browser push notifications (coming soon)</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.push_enabled}
                onChange={() => togglePref('push_enabled')}
                disabled
                className="w-5 h-5 text-gray-300 rounded"
              />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="font-medium">SMS</span>
                <p className="text-sm text-gray-500">Text message alerts (coming soon)</p>
              </div>
              <input
                type="checkbox"
                checked={prefs.sms_enabled}
                onChange={() => togglePref('sms_enabled')}
                disabled
                className="w-5 h-5 text-gray-300 rounded"
              />
            </label>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">🔒 Privacy</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">Data Protection</p>
              <p className="text-sm text-gray-500 mt-1">
                Your data and your child&apos;s data are protected and never shared with third parties
                without explicit consent. Read our{' '}
                <a href="/privacy" className="text-purple-600 hover:underline">
                  Privacy Policy
                </a>{' '}
                for more details.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">COPPA Compliance</p>
              <p className="text-sm text-gray-500 mt-1">
                ChatNIL is fully compliant with COPPA regulations for protecting children&apos;s
                online privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push('/parent/dashboard')}
            className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={savePreferences}
            disabled={saving}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
