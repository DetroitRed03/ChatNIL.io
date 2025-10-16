'use client';

import { Badge, UserBadge } from '@/lib/types';
import { getBadgeRarityColor } from '@/lib/badges';
import { Trophy, Lock, Calendar, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BadgeCardProps {
  badge: Badge;
  isEarned?: boolean;
  earnedAt?: string;
  showProgress?: boolean;
  progress?: {
    current: number;
    required: number;
    percentage: number;
    description: string;
  };
  onClick?: () => void;
}

export default function BadgeCard({
  badge,
  isEarned = false,
  earnedAt,
  showProgress = false,
  progress,
  onClick
}: BadgeCardProps) {
  const rarityColors = getBadgeRarityColor(badge.rarity);

  return (
    <div
      onClick={onClick}
      className={`
        relative group rounded-xl border-2 p-4 transition-all duration-300 cursor-pointer
        ${isEarned
          ? `${rarityColors.bg} ${rarityColors.border} hover:shadow-lg hover:${rarityColors.glow}`
          : 'bg-gray-50 border-gray-200 opacity-60 hover:opacity-80'
        }
        ${onClick ? 'cursor-pointer' : ''}
        hover:scale-105 transform
      `}
    >
      {/* Rarity indicator */}
      <div className="absolute top-2 right-2">
        <span className={`
          text-xs font-semibold px-2 py-1 rounded-full
          ${isEarned ? rarityColors.text : 'text-gray-400'}
          ${isEarned ? rarityColors.bg : 'bg-gray-100'}
        `}>
          {badge.rarity}
        </span>
      </div>

      {/* Badge Icon/Image */}
      <div className="flex justify-center mb-3">
        <div className={`
          relative w-16 h-16 rounded-full flex items-center justify-center
          ${isEarned ? rarityColors.bg : 'bg-gray-200'}
          ${isEarned ? rarityColors.border : 'border-gray-300'} border-2
        `}>
          {isEarned ? (
            <Trophy className={`w-8 h-8 ${rarityColors.text}`} />
          ) : (
            <Lock className="w-8 h-8 text-gray-400" />
          )}

          {/* Points indicator */}
          {badge.points > 0 && (
            <div className={`
              absolute -bottom-1 -right-1 w-7 h-7 rounded-full
              flex items-center justify-center text-xs font-bold
              ${isEarned ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-300 text-gray-600'}
              border-2 border-white shadow-sm
            `}>
              {badge.points}
            </div>
          )}
        </div>
      </div>

      {/* Badge Name */}
      <h3 className={`
        text-center font-semibold text-sm mb-1
        ${isEarned ? 'text-gray-900' : 'text-gray-500'}
      `}>
        {badge.name}
      </h3>

      {/* Badge Description */}
      <p className={`
        text-center text-xs mb-2 line-clamp-2
        ${isEarned ? 'text-gray-600' : 'text-gray-400'}
      `}>
        {badge.description}
      </p>

      {/* Earned Date */}
      {isEarned && earnedAt && (
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
          <Calendar className="w-3 h-3" />
          <span>
            Earned {formatDistanceToNow(new Date(earnedAt), { addSuffix: true })}
          </span>
        </div>
      )}

      {/* Progress Bar for Locked Badges */}
      {!isEarned && showProgress && progress && progress.percentage > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{progress.current}/{progress.required}</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Hover effect for earned badges */}
      {isEarned && (
        <div className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity
          ${rarityColors.bg}
        `} />
      )}

      {/* Category indicator */}
      <div className="absolute bottom-2 left-2">
        <span className="text-xs text-gray-400 capitalize">
          {badge.category}
        </span>
      </div>
    </div>
  );
}
