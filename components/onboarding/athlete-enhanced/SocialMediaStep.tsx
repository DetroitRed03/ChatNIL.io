'use client';

import { useState } from 'react';
import { X, Plus, CheckCircle } from 'lucide-react';

interface SocialMediaStat {
  platform: 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'twitch';
  handle: string;
  followers: number;
  engagement_rate: number;
  verified: boolean;
}

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-gradient-to-br from-black to-cyan-500' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'bg-gradient-to-br from-blue-400 to-blue-600' },
  { id: 'youtube', name: 'YouTube', icon: '📹', color: 'bg-gradient-to-br from-red-500 to-red-600' },
  { id: 'twitch', name: 'Twitch', icon: '🎮', color: 'bg-gradient-to-br from-purple-600 to-purple-700' }
];

interface SocialMediaStepProps {
  onComplete: (data: { social_media_stats: SocialMediaStat[] }) => void;
  initialData?: { social_media_stats?: SocialMediaStat[] };
}

export function SocialMediaStep({ onComplete, initialData }: SocialMediaStepProps) {
  const [stats, setStats] = useState<SocialMediaStat[]>(initialData?.social_media_stats || []);

  function addPlatform(platformId: string) {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    setStats(prev => [...prev, {
      platform: platformId as any,
      handle: '',
      followers: 0,
      engagement_rate: 0,
      verified: false
    }]);
  }

  function updateStat(index: number, field: keyof SocialMediaStat, value: any) {
    setStats(prev => prev.map((stat, i) =>
      i === index ? { ...stat, [field]: value } : stat
    ));
  }

  function removeStat(index: number) {
    setStats(prev => prev.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    onComplete({ social_media_stats: stats });
  }

  const addedPlatforms = stats.map(s => s.platform);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Connect your social media</h1>
        <p className="text-gray-600 text-lg">
          Add your social media accounts to help brands understand your reach and engagement.
        </p>
      </div>

      {/* Platform Selection */}
      <div className="mb-8">
        <div className="text-sm font-semibold text-gray-700 mb-3">Select platforms to add:</div>
        <div className="flex flex-wrap gap-3">
          {PLATFORMS.map(platform => {
            const isAdded = addedPlatforms.includes(platform.id as any);
            return (
              <button
                key={platform.id}
                onClick={() => !isAdded && addPlatform(platform.id)}
                disabled={isAdded}
                className={`px-6 py-3 rounded-lg text-white font-medium transition-all ${platform.color} ${
                  isAdded
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{platform.icon}</span>
                  <span>{platform.name}</span>
                  {isAdded && <CheckCircle className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Input */}
      <div className="space-y-6 mb-8">
        {stats.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-3">📱</div>
            <p className="text-gray-600">No platforms added yet</p>
            <p className="text-sm text-gray-500 mt-2">Click a platform above to get started</p>
          </div>
        ) : (
          stats.map((stat, index) => {
            const platform = PLATFORMS.find(p => p.id === stat.platform);
            return (
              <div key={index} className="p-6 border-2 border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${platform?.color} rounded-lg flex items-center justify-center text-2xl`}>
                      {platform?.icon}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{platform?.name}</div>
                      <div className="text-sm text-gray-500">Platform {index + 1}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStat(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Handle *</label>
                    <input
                      type="text"
                      value={stat.handle}
                      onChange={e => updateStat(index, 'handle', e.target.value)}
                      placeholder="@username"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Followers</label>
                    <input
                      type="number"
                      value={stat.followers || ''}
                      onChange={e => updateStat(index, 'followers', parseInt(e.target.value) || 0)}
                      placeholder="5000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Engagement Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={stat.engagement_rate || ''}
                      onChange={e => updateStat(index, 'engagement_rate', parseFloat(e.target.value) || 0)}
                      placeholder="3.5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={stat.verified}
                        onChange={e => updateStat(index, 'verified', e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Verified Account</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          onClick={() => onComplete({ social_media_stats: [] })}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
        >
          <span>Continue</span>
          {stats.length > 0 && (
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
              {stats.length} {stats.length === 1 ? 'platform' : 'platforms'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
