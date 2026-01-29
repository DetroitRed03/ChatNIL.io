'use client';

import { useState, useEffect } from 'react';

interface Child {
  id: string;
  name: string;
}

interface ParentalControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  onUpdate: () => void;
}

export function ParentalControlsModal({ isOpen, onClose, child, onUpdate }: ParentalControlsModalProps) {
  const [settings, setSettings] = useState({
    weeklyDigest: true,
    chapterComplete: true,
    badgeEarned: true,
    inactivityAlert: true,
    inactivityDays: 7,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && child) {
      // Load current settings
      fetch(`/api/parent/settings/notifications?childId=${child.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            setSettings(data.settings);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, child]);

  if (!isOpen || !child) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/parent/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: child.id,
          settings
        })
      });
      onUpdate();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-5 text-white">
          <h2 className="text-xl font-bold">Parental Controls</h2>
          <p className="text-white/80 text-sm">
            Settings for {child.name}
          </p>
        </div>

        <div className="p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Notification Preferences</h3>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-sm">Weekly Summary</p>
              <p className="text-xs text-gray-500">Get a weekly email about progress</p>
            </div>
            <input
              type="checkbox"
              checked={settings.weeklyDigest}
              onChange={e => setSettings(s => ({ ...s, weeklyDigest: e.target.checked }))}
              className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-sm">Chapter Completed</p>
              <p className="text-xs text-gray-500">Notify when a chapter is finished</p>
            </div>
            <input
              type="checkbox"
              checked={settings.chapterComplete}
              onChange={e => setSettings(s => ({ ...s, chapterComplete: e.target.checked }))}
              className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-sm">Badge Earned</p>
              <p className="text-xs text-gray-500">Celebrate achievements together</p>
            </div>
            <input
              type="checkbox"
              checked={settings.badgeEarned}
              onChange={e => setSettings(s => ({ ...s, badgeEarned: e.target.checked }))}
              className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-sm">Inactivity Alert</p>
              <p className="text-xs text-gray-500">
                Alert if inactive for {settings.inactivityDays}+ days
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.inactivityAlert}
              onChange={e => setSettings(s => ({ ...s, inactivityAlert: e.target.checked }))}
              className="w-5 h-5 text-purple-500 rounded focus:ring-purple-500"
            />
          </label>

          {settings.inactivityAlert && (
            <div className="pl-4">
              <label className="text-sm text-gray-600">Days before alert:</label>
              <select
                value={settings.inactivityDays}
                onChange={e => setSettings(s => ({ ...s, inactivityDays: parseInt(e.target.value) }))}
                className="ml-2 p-2 border rounded-lg text-sm"
              >
                <option value={3}>3 days</option>
                <option value={5}>5 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border rounded-xl font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParentalControlsModal;
