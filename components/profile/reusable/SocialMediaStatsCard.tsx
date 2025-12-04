'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Instagram, Twitter, Video, Youtube, Check, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NumberStepper } from '@/components/ui/NumberStepper';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { CreativeSlider } from '@/components/ui/CreativeSlider';

type Platform = 'instagram' | 'tiktok' | 'twitter' | 'youtube';

interface SocialMediaData {
  handle?: string;
  followers?: number;
  engagementRate?: number;
  verified?: boolean;
}

interface SocialMediaStatsCardProps {
  platform: Platform;
  data: SocialMediaData;
  onChange: (data: Partial<SocialMediaData>) => void;
  onRemove?: () => void;
  isEditable?: boolean;
  showLastUpdated?: boolean;
  lastUpdated?: string;
}

const PLATFORM_CONFIG = {
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    placeholder: '@username',
  },
  tiktok: {
    name: 'TikTok',
    icon: Video,
    color: 'from-gray-900 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-gray-50 to-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    placeholder: '@username',
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    color: 'from-blue-400 to-blue-600',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    placeholder: '@username',
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-gradient-to-br from-red-50 to-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    placeholder: '@channelname',
  },
};

export function SocialMediaStatsCard({
  platform,
  data,
  onChange,
  onRemove,
  isEditable = true,
  showLastUpdated = true,
  lastUpdated,
}: SocialMediaStatsCardProps) {
  const config = PLATFORM_CONFIG[platform];
  const PlatformIcon = config.icon;

  const [handleError, setHandleError] = React.useState<string>('');

  // Validate handle format
  const validateHandle = (handle: string): boolean => {
    if (!handle) {
      setHandleError('');
      return true;
    }

    // Must start with @
    if (!handle.startsWith('@')) {
      setHandleError('Handle must start with @');
      return false;
    }

    // No spaces allowed
    if (handle.includes(' ')) {
      setHandleError('Handle cannot contain spaces');
      return false;
    }

    // Minimum length
    if (handle.length < 2) {
      setHandleError('Handle is too short');
      return false;
    }

    setHandleError('');
    return true;
  };

  const handleHandleChange = (value: string) => {
    // Auto-add @ if not present
    const formattedValue = value.startsWith('@') ? value : `@${value}`;
    validateHandle(formattedValue);
    onChange({ handle: formattedValue });
  };

  const formatFollowerCount = (count?: number): string => {
    if (!count || count === 0) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Card className={cn('overflow-hidden border-2', config.borderColor)}>
      <CardHeader className={cn('pb-3', config.bgColor)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg bg-gradient-to-br', config.color)}>
              <PlatformIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className={config.textColor}>{config.name}</CardTitle>
              {data.handle && (
                <p className="text-sm text-text-tertiary mt-0.5">{data.handle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.verified && (
              <Badge variant="primary" size="sm">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {isEditable && onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-1 rounded-md text-error-600 hover:bg-error-50 transition-colors"
                aria-label={`Remove ${config.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {isEditable ? (
          <>
            {/* Handle Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Username/Handle
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={data.handle || ''}
                  onChange={(e) => handleHandleChange(e.target.value)}
                  placeholder={config.placeholder}
                  className={cn(
                    'w-full px-4 py-2 rounded-lg border transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    handleError
                      ? 'border-error-500 bg-error-50'
                      : 'border-border bg-background-card'
                  )}
                />
                {handleError && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <AlertCircle className="h-4 w-4 text-error-500" />
                  </div>
                )}
              </div>
              {handleError && (
                <p className="mt-1 text-xs text-error-600">{handleError}</p>
              )}
            </div>

            {/* Followers Count */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Follower Count
              </label>
              <NumberStepper
                value={data.followers || 0}
                onChange={(value) => onChange({ followers: value })}
                min={0}
                max={10000000}
                step={100}
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Current: {formatFollowerCount(data.followers)}
              </p>
            </div>

            {/* Engagement Rate */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Engagement Rate
              </label>
              <CreativeSlider
                value={data.engagementRate || 0}
                onChange={(value) => onChange({ engagementRate: typeof value === 'number' ? value : value[0] })}
                min={0}
                max={100}
                step={0.1}
                showValue
                label="Engagement Rate"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-text-tertiary">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Verified Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Verified Account
                </label>
                <p className="text-xs text-text-tertiary mt-0.5">
                  Do you have a verified badge on {config.name}?
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ verified: !data.verified })}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  data.verified ? 'bg-primary-500' : 'bg-gray-300'
                )}
                role="switch"
                aria-checked={data.verified}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    data.verified ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Read-only Display */}
            <div className="space-y-3">
              {data.handle && (
                <div>
                  <p className="text-xs text-text-tertiary">Handle</p>
                  <p className="text-lg font-semibold text-text-primary">{data.handle}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-tertiary mb-1">Followers</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {formatFollowerCount(data.followers)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text-tertiary mb-1">Engagement</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {data.engagementRate?.toFixed(1) || '0.0'}%
                  </p>
                </div>
              </div>

              {/* Engagement Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
                  <span>Engagement Rate</span>
                  <span>{data.engagementRate?.toFixed(1) || '0.0'}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full bg-gradient-to-r', config.color)}
                    style={{ width: `${Math.min(data.engagementRate || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Last Updated */}
        {showLastUpdated && lastUpdated && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-text-tertiary">
              Last updated: {new Date(lastUpdated).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
