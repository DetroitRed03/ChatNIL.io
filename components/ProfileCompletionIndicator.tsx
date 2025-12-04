'use client';

import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProfileSection {
  id: string;
  label: string;
  completed: boolean;
  weight: number; // Contribution to overall score
}

interface ProfileCompletionIndicatorProps {
  profileData: {
    // Core fields
    full_name?: string;
    email?: string;
    bio?: string;
    profile_photo_url?: string;
    profile_video_url?: string;

    // Athlete-specific
    school_name?: string;
    primary_sport?: string;
    position?: string;
    graduation_year?: number;
    achievements?: any[];

    // Interests
    hobbies?: string[];
    lifestyle_interests?: string[];
    brand_affinity?: string[];
    causes_care_about?: string[];
    content_creation_interests?: string[];

    // Social media
    social_media_stats?: any[];
    content_samples?: any[];

    // NIL preferences
    nil_preferences?: any;
  };
  userRole?: 'athlete' | 'parent' | 'agency' | 'school' | 'business';
  className?: string;
}

export default function ProfileCompletionIndicator({
  profileData,
  userRole = 'athlete',
  className = '',
}: ProfileCompletionIndicatorProps) {
  const [sections, setSections] = useState<ProfileSection[]>([]);
  const [completionScore, setCompletionScore] = useState(0);

  useEffect(() => {
    if (userRole !== 'athlete') return;

    const athleteSections: ProfileSection[] = [
      {
        id: 'basics',
        label: 'Basic Information',
        completed: !!(profileData.full_name && profileData.email && profileData.profile_photo_url),
        weight: 10,
      },
      {
        id: 'bio',
        label: 'Biography',
        completed: !!(profileData.bio && profileData.bio.length >= 50),
        weight: 5,
      },
      {
        id: 'video',
        label: 'Profile Video',
        completed: !!profileData.profile_video_url,
        weight: 5,
      },
      {
        id: 'sport_info',
        label: 'Sport Information',
        completed: !!(
          profileData.school_name &&
          profileData.primary_sport &&
          profileData.position &&
          profileData.graduation_year
        ),
        weight: 15,
      },
      {
        id: 'achievements',
        label: 'Achievements',
        completed: !!(profileData.achievements && profileData.achievements.length > 0),
        weight: 10,
      },
      {
        id: 'hobbies',
        label: 'Hobbies & Interests',
        completed: !!(
          profileData.hobbies &&
          profileData.hobbies.length > 0 &&
          profileData.lifestyle_interests &&
          profileData.lifestyle_interests.length > 0
        ),
        weight: 10,
      },
      {
        id: 'brand_affinity',
        label: 'Brand Preferences',
        completed: !!(profileData.brand_affinity && profileData.brand_affinity.length > 0),
        weight: 5,
      },
      {
        id: 'causes',
        label: 'Social Causes',
        completed: !!(profileData.causes_care_about && profileData.causes_care_about.length > 0),
        weight: 5,
      },
      {
        id: 'content_interests',
        label: 'Content Creation Interests',
        completed: !!(
          profileData.content_creation_interests &&
          profileData.content_creation_interests.length > 0
        ),
        weight: 10,
      },
      {
        id: 'social_media',
        label: 'Social Media Stats',
        completed: !!(profileData.social_media_stats && profileData.social_media_stats.length > 0),
        weight: 15,
      },
      {
        id: 'content_samples',
        label: 'Content Samples',
        completed: !!(profileData.content_samples && profileData.content_samples.length > 0),
        weight: 5,
      },
      {
        id: 'nil_preferences',
        label: 'NIL Preferences',
        completed: !!(
          profileData.nil_preferences &&
          Object.keys(profileData.nil_preferences).length > 0
        ),
        weight: 5,
      },
    ];

    setSections(athleteSections);

    // Calculate completion score
    const totalWeight = athleteSections.reduce((sum, section) => sum + section.weight, 0);
    const completedWeight = athleteSections
      .filter(section => section.completed)
      .reduce((sum, section) => sum + section.weight, 0);

    const score = Math.round((completedWeight / totalWeight) * 100);
    setCompletionScore(score);
  }, [profileData, userRole]);

  if (userRole !== 'athlete') return null;

  const completedCount = sections.filter(s => s.completed).length;
  const totalCount = sections.length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 50) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
        <div className={`px-4 py-2 rounded-full border-2 ${getScoreBgColor(completionScore)}`}>
          <span className={`text-2xl font-bold ${getScoreColor(completionScore)}`}>
            {completionScore}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor(completionScore)} transition-all duration-500 rounded-full`}
            style={{ width: `${completionScore}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {completedCount} of {totalCount} sections completed
        </p>
      </div>

      {/* Message Based on Score */}
      {completionScore < 50 && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Improve Your Profile</p>
              <p className="text-xs text-red-700 mt-1">
                Complete more sections to increase your visibility to brands. Profiles above 80% get 3x more opportunities!
              </p>
            </div>
          </div>
        </div>
      )}

      {completionScore >= 50 && completionScore < 80 && (
        <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900">You're Getting There!</p>
              <p className="text-xs text-yellow-700 mt-1">
                Complete a few more sections to maximize your profile's potential and attract premium brand partnerships.
              </p>
            </div>
          </div>
        </div>
      )}

      {completionScore >= 80 && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900">Excellent Profile!</p>
              <p className="text-xs text-green-700 mt-1">
                Your profile is highly complete and optimized for brand partnerships. Great work!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Checklist */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700 mb-3">Profile Sections</p>
        {sections.map(section => (
          <div
            key={section.id}
            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {section.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${section.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                {section.label}
              </span>
            </div>
            <span className="text-xs text-gray-400">{section.weight}pts</span>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      {completionScore < 100 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg">
            Complete Missing Sections
          </button>
        </div>
      )}
    </div>
  );
}
