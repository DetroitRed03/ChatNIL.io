'use client';

import { useState } from 'react';
import { Globe, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { checkProfileVisibility, getConnectedPlatforms } from '@/lib/profile/visibility';
import { supabase } from '@/lib/supabase';

interface ProfileVisibilityToggleProps {
  profile: {
    avatar_url?: string | null;
    profile_photo_url?: string | null;
    bio?: string | null;
    sport?: string | null;
    primary_sport?: string | null;
    school?: string | null;
    school_name?: string | null;
    social_media_stats?: any;
    is_public?: boolean;
    role?: string;
    athlete_type?: string;
    parent_consent_given?: boolean;
    username?: string;
  };
  onUpdate?: (isPublic: boolean) => void;
}

export function ProfileVisibilityToggle({ profile, onUpdate }: ProfileVisibilityToggleProps) {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isPublic, setIsPublic] = useState(profile.is_public || false);
  const [error, setError] = useState<string | null>(null);

  const visibility = checkProfileVisibility(profile);
  const connectedPlatforms = getConnectedPlatforms(profile.social_media_stats);

  const handleToggle = async () => {
    if (!visibility.canBePublic && !isPublic) {
      setError(`Complete missing requirements before going public: ${visibility.missingRequirements.join(', ')}`);
      setShowDetails(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/profile/visibility', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.missingRequirements) {
          setError(`Missing: ${data.missingRequirements.join(', ')}`);
          setShowDetails(true);
        } else {
          setError(data.error || 'Failed to update');
        }
        return;
      }

      setIsPublic(!isPublic);
      onUpdate?.(!isPublic);
    } catch {
      setError('Failed to update visibility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isPublic ? (
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-gray-600" />
            </div>
          )}
          <div>
            <h3 className="font-semibold">
              {isPublic ? 'Public Profile' : 'Private Profile'}
            </h3>
            <p className="text-sm text-gray-500">
              {isPublic
                ? 'Brands can discover you'
                : 'Only you can see your profile'
              }
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          title={!visibility.canBePublic && !isPublic ? 'Complete profile requirements first' : undefined}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isPublic ? 'bg-green-500' : 'bg-gray-300'}
            ${loading ? 'opacity-50' : ''}
            ${!visibility.canBePublic && !isPublic ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isPublic ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* View public profile link */}
      {isPublic && profile.username && (
        <a
          href={`/athletes/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm text-orange-600 hover:underline"
        >
          <Globe className="w-3.5 h-3.5" />
          View public profile
        </a>
      )}

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Requirements info */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-3 text-sm text-orange-600 hover:underline"
      >
        {showDetails ? 'Hide requirements' : 'View requirements'}
      </button>

      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Public Profile Requirements</h4>

          <div className="space-y-2">
            <RequirementRow
              label="Profile photo"
              met={!!(profile.avatar_url || profile.profile_photo_url)}
            />
            <RequirementRow
              label="Bio (20+ characters)"
              met={!!profile.bio && profile.bio.length >= 20}
            />
            <RequirementRow
              label="Sport selected"
              met={!!(profile.sport || profile.primary_sport)}
            />
            <RequirementRow
              label="School added"
              met={!!(profile.school || profile.school_name)}
            />
            <RequirementRow
              label="Social media connected"
              met={connectedPlatforms.length > 0}
              detail={connectedPlatforms.length > 0 ? connectedPlatforms.join(', ') : undefined}
            />
            {(profile.role === 'hs_student' || profile.athlete_type === 'hs_athlete') && (
              <RequirementRow
                label="Parent/guardian consent"
                met={!!profile.parent_consent_given}
              />
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Profile completion</span>
              <span className="font-semibold">{visibility.completionPercent}%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  visibility.completionPercent >= 100 ? 'bg-green-500' :
                  visibility.completionPercent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${visibility.completionPercent}%` }}
              />
            </div>
          </div>

          {!visibility.canBePublic && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Complete your profile to go public
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Missing: {visibility.missingRequirements.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* What goes public */}
      {isPublic && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">What brands can see:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>Your name, photo, and bio</li>
            <li>Sport and school</li>
            <li>Social media follower counts</li>
            <li>Public social media posts</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            Your contact info and deal history remain private.
          </p>
        </div>
      )}
    </div>
  );
}

function RequirementRow({
  label,
  met,
  detail,
}: {
  label: string;
  met: boolean;
  detail?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${met ? 'text-gray-700' : 'text-gray-500'}`}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-xs text-gray-500">{detail}</span>}
        {met ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
        )}
      </div>
    </div>
  );
}
