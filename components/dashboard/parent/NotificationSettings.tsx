'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Loader2, Check } from 'lucide-react';

export interface NotificationPreferences {
  weeklyProgress: boolean;
  chapterComplete: boolean;
  badgeEarned: boolean;
  dailyDigest: boolean;
}

interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
}

export function NotificationSettings({ preferences: initialPreferences, onSave }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const options = [
    {
      key: 'weeklyProgress' as const,
      label: 'Weekly progress summary',
      description: 'Get a summary of your child\'s learning each week',
    },
    {
      key: 'chapterComplete' as const,
      label: 'When my child completes a chapter',
      description: 'Be notified when they finish a learning chapter',
    },
    {
      key: 'badgeEarned' as const,
      label: 'When my child earns a badge',
      description: 'Celebrate their achievements with them',
    },
    {
      key: 'dailyDigest' as const,
      label: 'Daily activity digest',
      description: 'Get a daily summary of all activity',
    },
  ];

  return (
    <motion.div
      data-testid="notification-settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
      </div>

      <div className="space-y-4">
        {options.map((option) => (
          <label
            key={option.key}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <div className="pt-0.5">
              <input
                type="checkbox"
                checked={preferences[option.key]}
                onChange={() => handleToggle(option.key)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                {option.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className={`
          w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all
          ${saved
            ? 'bg-green-500 text-white'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            Saved!
          </>
        ) : (
          'Save Preferences'
        )}
      </button>
    </motion.div>
  );
}
