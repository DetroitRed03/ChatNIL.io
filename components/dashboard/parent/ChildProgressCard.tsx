'use client';

import { motion } from 'framer-motion';
import { User, MapPin, Trophy, Flame, Calendar, ChevronRight, Shield } from 'lucide-react';

interface ChildProgress {
  id: string;
  fullName: string;
  school: string;
  sport: string;
  state: string;
  avatar?: string;
  progress: {
    percentage: number;
    currentChapter: string;
    badgesEarned: number;
    currentStreak: number;
    lastActive: string;
  };
  consent: {
    status: 'pending' | 'approved' | 'denied' | 'revoked';
    grantedAt?: string;
  };
}

interface ChildProgressCardProps {
  child: ChildProgress;
  onViewProgress: () => void;
  onManageConsent: () => void;
}

export function ChildProgressCard({ child, onViewProgress, onManageConsent }: ChildProgressCardProps) {
  const getConsentBadge = () => {
    switch (child.consent.status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <Shield className="w-3 h-3" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <Shield className="w-3 h-3" />
            Pending
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <Shield className="w-3 h-3" />
            Denied
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <Shield className="w-3 h-3" />
            Revoked
          </span>
        );
    }
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      data-testid="child-progress-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      {/* Child Header */}
      <div className="flex items-start gap-4 mb-6">
        {child.avatar ? (
          <img
            src={child.avatar}
            alt={child.fullName}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="w-7 h-7 text-purple-600" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{child.fullName}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {child.school} • {child.sport} • {child.state}
          </p>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Learning Progress</span>
          <span className="text-sm font-semibold text-purple-600">{child.progress.percentage}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${child.progress.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Current Chapter</p>
          <p className="font-medium text-gray-900">{child.progress.currentChapter}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Badges Earned</p>
          <p className="font-medium text-gray-900 flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            {child.progress.badgesEarned}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Current Streak</p>
          <p className="font-medium text-gray-900 flex items-center gap-1">
            {child.progress.currentStreak} days
            {child.progress.currentStreak >= 3 && <Flame className="w-4 h-4 text-orange-500" />}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Last Active</p>
          <p className="font-medium text-gray-900 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatLastActive(child.progress.lastActive)}
          </p>
        </div>
      </div>

      {/* Consent Status */}
      <div className="flex items-center justify-between py-3 border-t border-gray-100">
        <span className="text-sm text-gray-600">Consent Status:</span>
        {getConsentBadge()}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onViewProgress}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 font-medium rounded-xl hover:bg-purple-100 transition-colors"
        >
          View Full Progress
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onManageConsent}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Shield className="w-4 h-4" />
          Manage Consent
        </button>
      </div>
    </motion.div>
  );
}
