'use client';

import { Instagram, Twitter, Youtube, Music2, Facebook, Twitch, Hash } from 'lucide-react';

interface SocialMediaInputProps {
  value: any; // Can be object or string
  onChange: (value: any) => void;
}

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: '@username', prefix: '@' },
  { key: 'twitter', label: 'Twitter/X', icon: Twitter, placeholder: '@username', prefix: '@' },
  { key: 'tiktok', label: 'TikTok', icon: Music2, placeholder: '@username', prefix: '@' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'Channel name or @handle', prefix: '' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'Profile name', prefix: '' },
  { key: 'twitch', label: 'Twitch', icon: Twitch, placeholder: 'username', prefix: '' },
  { key: 'other', label: 'Other', icon: Hash, placeholder: 'Platform: handle', prefix: '' }
];

export default function SocialMediaInput({ value, onChange }: SocialMediaInputProps) {
  // Parse value - it could be a string (legacy) or object (new format)
  const parseValue = (): Record<string, string> => {
    if (!value) return {};

    // If it's already an object, use it
    if (typeof value === 'object' && !Array.isArray(value)) {
      return value;
    }

    // If it's a string, try to parse as JSON
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === 'object') return parsed;
      } catch {
        // Not JSON, might be comma-separated legacy format
        return {};
      }
    }

    return {};
  };

  const socialData = parseValue();

  const handleChange = (platform: string, handle: string) => {
    const updated = { ...socialData, [platform]: handle };

    // Remove empty values
    Object.keys(updated).forEach(key => {
      if (!updated[key] || updated[key].trim() === '') {
        delete updated[key];
      }
    });

    onChange(updated);
  };

  const formatDisplayValue = (platform: string, rawValue: string): string => {
    if (!rawValue) return '';

    const platformConfig = SOCIAL_PLATFORMS.find(p => p.key === platform);
    if (!platformConfig) return rawValue;

    // If it already starts with the prefix, return as-is
    if (platformConfig.prefix && rawValue.startsWith(platformConfig.prefix)) {
      return rawValue;
    }

    // Otherwise, add the prefix
    return platformConfig.prefix ? `${platformConfig.prefix}${rawValue}` : rawValue;
  };

  const getInputValue = (platform: string): string => {
    const val = socialData[platform] || '';
    const platformConfig = SOCIAL_PLATFORMS.find(p => p.key === platform);

    // Remove prefix for editing
    if (platformConfig?.prefix && val.startsWith(platformConfig.prefix)) {
      return val.substring(platformConfig.prefix.length);
    }

    return val;
  };

  const baseInputClasses = "w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-all duration-200 hover:border-orange-300";

  return (
    <div className="space-y-3">
      {SOCIAL_PLATFORMS.map((platform) => {
        const Icon = platform.icon;
        const hasValue = !!socialData[platform.key];

        return (
          <div key={platform.key} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {platform.label}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon className="w-4 h-4" />
              </div>
              {platform.prefix && (
                <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
                  {platform.prefix}
                </div>
              )}
              <input
                type="text"
                value={getInputValue(platform.key)}
                onChange={(e) => {
                  const inputVal = e.target.value;
                  const fullValue = platform.prefix ? `${platform.prefix}${inputVal}` : inputVal;
                  handleChange(platform.key, fullValue);
                }}
                placeholder={platform.placeholder}
                className={`${baseInputClasses} ${platform.prefix ? 'pl-14' : ''}`}
              />
              {hasValue && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-green-500 text-sm">✓</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Summary of filled platforms */}
      {Object.keys(socialData).length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 font-medium">Your Social Media:</p>
          <div className="space-y-1">
            {Object.entries(socialData).map(([platform, handle]) => {
              const platformConfig = SOCIAL_PLATFORMS.find(p => p.key === platform);
              const Icon = platformConfig?.icon || Hash;

              return (
                <div key={platform} className="flex items-center gap-2 text-sm">
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-gray-700 font-medium capitalize">{platform}:</span>
                  <span className="text-gray-600">{formatDisplayValue(platform, handle as string)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
