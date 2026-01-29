'use client';

import { motion } from 'framer-motion';
import { User, MapPin, Trophy, Flame, Calendar, ChevronRight, Shield, CheckCircle, Clock, XCircle } from 'lucide-react';

export interface ChildSummary {
  id: string;
  fullName: string;
  school: string;
  sport: string;
  state: string;
  avatar?: string;
  consentStatus: 'pending' | 'approved' | 'denied' | 'revoked';
  consentGivenAt?: string;
  learningProgress: {
    percentage: number;
    currentPillar: string;
    pillarsCompleted: string[];
    badgesEarned: number;
    currentStreak: number;
    lastActiveAt: string;
  };
}

interface ChildCardProps {
  child: ChildSummary;
  onViewProgress: () => void;
  onManageConsent: () => void;
}

export function ChildCard({ child, onViewProgress, onManageConsent }: ChildCardProps) {
  // Default values for learningProgress if undefined
  const progress = child.learningProgress || {
    percentage: 0,
    currentPillar: 'identity',
    pillarsCompleted: [],
    badgesEarned: 0,
    currentStreak: 0,
    lastActiveAt: new Date().toISOString()
  };

  const getConsentBadge = () => {
    switch (child.consentStatus) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <XCircle className="w-3.5 h-3.5" />
            Denied
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <XCircle className="w-3.5 h-3.5" />
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
      data-testid={`child-card-${child.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      {/* Header */}
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
            <MapPin className="w-3.5 h-3.5" />
            {child.school} • {child.sport} • {child.state}
          </p>
        </div>
        {getConsentBadge()}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Learning Progress</span>
          <span className="text-sm font-semibold text-purple-600">{progress.percentage}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Current Chapter</p>
          <p className="font-medium text-gray-900 capitalize">{progress.currentPillar}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Badges Earned</p>
          <p className="font-medium text-gray-900 flex items-center gap-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            {progress.badgesEarned}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Current Streak</p>
          <p className="font-medium text-gray-900 flex items-center gap-1">
            {progress.currentStreak} days
            {progress.currentStreak >= 3 && <Flame className="w-4 h-4 text-orange-500" />}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-1">Last Active</p>
          <p className="font-medium text-gray-900 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatLastActive(progress.lastActiveAt)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onViewProgress}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-700 font-medium rounded-xl hover:bg-purple-100 transition-colors"
        >
          View Full Progress
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onManageConsent}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Shield className="w-4 h-4" />
          Manage Consent
        </button>
      </div>
    </motion.div>
  );
}
