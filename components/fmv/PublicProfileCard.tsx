'use client';

import { TierBadge, TierBadgeGradient } from './TierBadge';
import { ScoreBreakdownCompact } from './ScoreBreakdownChart';
import { ScoreHistoryMini } from './ScoreHistoryChart';
import { Users, MapPin, GraduationCap, Trophy, TrendingUp } from 'lucide-react';
import { AthleteFMVData, User } from '@/types';

interface PublicProfileCardProps {
  athlete: User;
  fmvData: AthleteFMVData;
  compact?: boolean;
}

export function PublicProfileCard({ athlete, fmvData, compact = false }: PublicProfileCardProps) {
  // Only show if score is public
  if (!fmvData.is_public_score) {
    return (
      <div className="bg-gray-100 border-2 border-gray-200 rounded-lg p-8 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h4 className="font-semibold text-gray-700 mb-2">FMV Score Private</h4>
        <p className="text-sm text-gray-600">
          This athlete has chosen to keep their FMV score private.
        </p>
      </div>
    );
  }

  if (compact) {
    return <PublicProfileCardCompact athlete={athlete} fmvData={fmvData} />;
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            {(athlete as any).profile_image_url || athlete.avatar ? (
              <img
                src={(athlete as any).profile_image_url || athlete.avatar}
                alt={`${athlete.first_name} ${athlete.last_name}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
            )}

            {/* Name & Info */}
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {athlete.first_name} {athlete.last_name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-blue-100">
                {athlete.primary_sport && (
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    {athlete.primary_sport}
                  </div>
                )}
                {(athlete as any).position && <span>• {(athlete as any).position}</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-blue-100 mt-1">
                {athlete.school_name && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {athlete.school_name}
                  </div>
                )}
                {(athlete as any).state && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {(athlete as any).state}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tier Badge */}
          <TierBadgeGradient tier={fmvData.fmv_tier} size="large" />
        </div>

        {/* FMV Score Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-5xl font-bold">{fmvData.fmv_score}</span>
            <span className="text-lg text-blue-100">/ 100</span>
          </div>
          <div className="text-sm text-blue-100">Fair Market Value Score</div>
          {fmvData.percentile_rank !== null && (
            <div className="text-sm text-blue-100 mt-1">
              {fmvData.percentile_rank}th percentile in {athlete.primary_sport}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Score Breakdown */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Score Breakdown
          </h4>
          <ScoreBreakdownCompact
            social={fmvData.social_score}
            athletic={fmvData.athletic_score}
            market={fmvData.market_score}
            brand={fmvData.brand_score}
          />
        </div>

        {/* Score History */}
        {fmvData.score_history && fmvData.score_history.length > 1 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Score Trend</h4>
            <ScoreHistoryMini history={fmvData.score_history} />
          </div>
        )}

        {/* Strengths */}
        {fmvData.strengths && fmvData.strengths.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Top Strengths</h4>
            <div className="flex flex-wrap gap-2">
              {fmvData.strengths.slice(0, 3).map((strength, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                >
                  {strength}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social Stats */}
        {(athlete as any).total_followers > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Social Reach</h4>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-lg font-bold text-gray-900">
                {(athlete as any).total_followers >= 1000
                  ? `${((athlete as any).total_followers / 1000).toFixed(1)}K`
                  : (athlete as any).total_followers}
              </span>
              <span className="text-sm text-gray-600">Total Followers</span>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          Score last updated: {new Date(fmvData.last_calculation_date || (fmvData as any).last_calculated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact card for lists/grids
 */
export function PublicProfileCardCompact({ athlete, fmvData }: { athlete: User; fmvData: AthleteFMVData }) {
  if (!fmvData.is_public_score) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {/* Profile Image */}
        {(athlete as any).profile_image_url || athlete.avatar ? (
          <img
            src={(athlete as any).profile_image_url || athlete.avatar}
            alt={`${athlete.first_name} ${athlete.last_name}`}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate">
              {athlete.first_name} {athlete.last_name}
            </h4>
            <TierBadge tier={fmvData.fmv_tier} size="small" showLabel={false} />
          </div>

          <p className="text-xs text-gray-600 truncate mb-2">
            {athlete.primary_sport} • {athlete.school_name}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{fmvData.fmv_score}</div>
              <div className="text-xs text-gray-500">FMV Score</div>
            </div>

            {fmvData.score_history && fmvData.score_history.length > 1 && (
              <ScoreHistoryMini history={fmvData.score_history} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Shareable card for social media
 */
export function PublicProfileCardSocial({ athlete, fmvData }: { athlete: User; fmvData: AthleteFMVData }) {
  if (!fmvData.is_public_score) return null;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white max-w-md mx-auto shadow-2xl">
      <div className="text-center mb-6">
        {(athlete as any).profile_image_url || athlete.avatar ? (
          <img
            src={(athlete as any).profile_image_url || athlete.avatar}
            alt={`${athlete.first_name} ${athlete.last_name}`}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-white" />
          </div>
        )}

        <h3 className="text-3xl font-bold mb-1">
          {athlete.first_name} {athlete.last_name}
        </h3>
        <p className="text-blue-100 mb-4">
          {athlete.primary_sport} • {athlete.school_name}
        </p>

        <TierBadgeGradient tier={fmvData.fmv_tier} size="large" />
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{fmvData.fmv_score}</div>
          <div className="text-xl text-blue-100">NIL Fair Market Value</div>
          {fmvData.percentile_rank != null && (
            <div className="text-sm text-blue-100 mt-2">
              Top {100 - fmvData.percentile_rank}% in {athlete.primary_sport}
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-blue-100">
        Powered by ChatNIL.io
      </div>
    </div>
  );
}
