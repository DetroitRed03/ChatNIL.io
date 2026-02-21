'use client';

import { motion } from 'framer-motion';
import { Activity, Award, BookOpen, FileText, Zap, MessageCircle } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

const ACTIVITY_ICONS: Record<string, typeof Activity> = {
  quiz_completed: BookOpen,
  quiz_started: BookOpen,
  badge_earned: Award,
  achievement_earned: Award,
  deal_submitted: FileText,
  deal_approved: FileText,
  xp_earned: Zap,
  level_up: Zap,
  chapter_completed: BookOpen,
  chapter_started: BookOpen,
  question_answered: MessageCircle,
  login: Activity,
};

function getIcon(type: string) {
  return ACTIVITY_ICONS[type] || Activity;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
    >
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <Activity className="w-5 h-5 text-orange-500" />
        Recent Activity
      </h2>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, i) => {
            const Icon = getIcon(activity.type);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className="flex items-start gap-3"
              >
                <div className="p-2 bg-orange-50 rounded-full mt-0.5 flex-shrink-0">
                  <Icon className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{activity.title || activity.description}</p>
                  {activity.title && activity.description && activity.description !== activity.title && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(activity.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No activity yet</p>
          <p className="text-xs mt-1">Complete quizzes and explore chapters to see your progress here</p>
        </div>
      )}
    </motion.div>
  );
}
