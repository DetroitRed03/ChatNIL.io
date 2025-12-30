/**
 * Pending Actions Widget - Agency Dashboard
 *
 * Business-focused action items requiring agency attention.
 * Professional warm aesthetic with priority-based organization.
 *
 * Features:
 * - Content approvals, contract reviews, messages
 * - Priority indicators (high, medium, low)
 * - Due date tracking
 * - Quick action buttons
 * - Warm professional design
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, MessageSquare, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface PendingAction {
  id: string;
  type: 'approval' | 'contract' | 'message' | 'review';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  athleteName?: string;
}

interface DashboardData {
  pendingActions: Array<{
    id: string;
    type: 'review';
    title: string;
    description: string;
    priority: 'medium';
  }>;
}

const typeConfig = {
  approval: {
    icon: CheckCircle,
    label: 'Approval',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  contract: {
    icon: FileText,
    label: 'Contract',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  message: {
    icon: MessageSquare,
    label: 'Message',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
  },
  review: {
    icon: ImageIcon,
    label: 'Review',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
  },
};

const priorityConfig = {
  high: {
    label: 'High Priority',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  low: {
    label: 'Low',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
  },
};

function formatDueDate(date?: Date): string {
  if (!date) return '';

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays < 7) return `Due in ${diffDays} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Map action types to navigation destinations
const getActionDestination = (action: PendingAction): string => {
  switch (action.type) {
    case 'message':
      return '/agency/messages';
    case 'approval':
    case 'contract':
    case 'review':
    default:
      return '/agency/campaigns';
  }
};

export function PendingActionsWidget() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!user?.id) {
        // Don't set loading false - wait for user to be available
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/agency/dashboard', {
          credentials: 'include',
          headers: {
            'X-User-ID': user.id,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, [user?.id]);

  // Transform API data into component format
  const actions: PendingAction[] = data?.pendingActions.map(action => ({
    id: action.id,
    type: action.type,
    title: action.title,
    description: action.description,
    priority: action.priority,
  })) || [];

  const highPriorityCount = actions.filter((a) => a.priority === 'high').length;

  // Handle action card click
  const handleActionClick = (action: PendingAction) => {
    router.push(getActionDestination(action));
  };

  // Handle "View all actions" click
  const handleViewAllActions = () => {
    router.push('/agency/campaigns');
  };

  return (
    <Card className="bg-gradient-to-br from-orange-50/15 via-white to-amber-50/10 border border-orange-100/30 overflow-hidden shadow-sm shadow-orange-100/20">
      {/* Professional Header */}
      <div className="relative bg-gradient-to-r from-orange-400/90 via-orange-500/90 to-amber-500/90 px-6 py-5 overflow-hidden">
        {/* Subtle shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />

        {/* Header Content */}
        <div className="relative flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xl text-white">Pending Actions</h3>
            <p className="text-white/85 text-sm font-medium mt-0.5">
              {isLoading ? 'Loading...' : `${actions.length} items require attention`}
            </p>
          </div>
          {!isLoading && highPriorityCount > 0 && (
            <div className="px-3 py-1.5 bg-red-500 rounded-full">
              <span className="text-white font-bold text-sm">{highPriorityCount} Urgent</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions List */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 font-semibold mb-2">Error loading actions</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 font-semibold">No pending actions</p>
            <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action, index) => {
            const typeConf = typeConfig[action.type];
            const priorityConf = priorityConfig[action.priority];
            const TypeIcon = typeConf.icon;

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ x: 4, scale: 1.01 }}
                onClick={() => handleActionClick(action)}
                className={cn(
                  'group p-4 bg-white border-2 rounded-xl transition-all cursor-pointer',
                  action.priority === 'high'
                    ? 'border-red-200 hover:border-red-300 hover:shadow-md hover:shadow-red-100/50'
                    : 'border-orange-100/40 hover:border-orange-200/60 hover:shadow-md hover:shadow-orange-100/40'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', typeConf.bg)}>
                    <TypeIcon className={cn('w-5 h-5', typeConf.color)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title and Priority */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm text-gray-900">{action.title}</h4>
                      <div
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0',
                          priorityConf.bg,
                          priorityConf.color
                        )}
                      >
                        {priorityConf.label}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mb-2 font-medium">{action.description}</p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs">
                      {/* Type Badge */}
                      <div className={cn('px-2 py-1 rounded-md font-bold', typeConf.bg, typeConf.color)}>
                        {typeConf.label}
                      </div>

                      {/* Due Date */}
                      {action.dueDate && (
                        <div className="flex items-center gap-1.5 text-gray-600 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDueDate(action.dueDate)}</span>
                        </div>
                      )}

                      {/* Athlete Name */}
                      {action.athleteName && (
                        <div className="flex items-center gap-1.5 text-gray-600 font-semibold">
                          <span>•</span>
                          <span>{action.athleteName}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button (shown on hover) */}
                    <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionClick(action);
                        }}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors"
                      >
                        Take Action →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          </div>
        )}

        {/* Footer */}
        {!isLoading && !error && actions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-orange-100/40 flex items-center justify-between">
            <button
              onClick={handleViewAllActions}
              className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
            >
              View all actions →
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-sm font-semibold text-gray-700">{highPriorityCount} High Priority</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
