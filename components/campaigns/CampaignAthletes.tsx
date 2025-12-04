'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  FileText,
  Loader2,
  ChevronRight,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Athlete {
  id: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  primary_sport: string | null;
  school_name: string | null;
  total_followers: number | null;
}

interface Invite {
  id: string;
  campaign_id: string;
  athlete_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'active' | 'completed';
  invited_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  responded_at: string | null;
  athlete: Athlete | null;
}

interface Summary {
  total: number;
  invited: number;
  accepted: number;
  declined: number;
  active: number;
  completed: number;
  response_rate: string;
  acceptance_rate: string;
}

interface CampaignAthletesProps {
  campaignId: string;
  onStartDeal?: (athleteId: string) => void;
  onSendMessage?: (athleteId: string) => void;
}

const statusConfig = {
  invited: {
    label: 'Pending',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dotBg: 'bg-amber-500'
  },
  accepted: {
    label: 'Accepted',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    dotBg: 'bg-green-500'
  },
  declined: {
    label: 'Declined',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dotBg: 'bg-red-500'
  },
  active: {
    label: 'Active',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    dotBg: 'bg-blue-500'
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    dotBg: 'bg-gray-500'
  }
};

type TabType = 'all' | 'accepted' | 'invited' | 'declined';

export function CampaignAthletes({ campaignId, onStartDeal, onSendMessage }: CampaignAthletesProps) {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  useEffect(() => {
    async function fetchInvites() {
      if (!user?.id) {
        // Wait for user to be available
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/agency/campaigns/${campaignId}/invites`, {
          credentials: 'include',
          headers: {
            'X-User-ID': user.id
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch invites');
        }

        const data = await response.json();
        setInvites(data.invites || []);
        setSummary(data.summary || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    if (campaignId && user?.id) {
      fetchInvites();
    }
  }, [campaignId, user?.id]);

  // Filter invites based on active tab
  const filteredInvites = activeTab === 'all'
    ? invites
    : invites.filter(i => i.status === activeTab);

  const tabs = [
    { id: 'all' as TabType, label: 'All', count: summary?.total || 0 },
    { id: 'accepted' as TabType, label: 'Accepted', count: summary?.accepted || 0 },
    { id: 'invited' as TabType, label: 'Pending', count: summary?.invited || 0 },
    { id: 'declined' as TabType, label: 'Declined', count: summary?.declined || 0 }
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-orange-100/50 p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          <span className="text-gray-600 font-medium">Loading athlete invites...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border-2 border-red-100 p-8">
        <p className="text-red-600 text-center font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-orange-100/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-orange-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Athlete Invites</h2>
              <p className="text-sm text-gray-600">Track your campaign invite responses</p>
            </div>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{summary.response_rate}%</div>
                <div className="text-xs text-gray-500 font-medium">Response Rate</div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.acceptance_rate}%</div>
                <div className="text-xs text-gray-500 font-medium">Acceptance Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2',
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {tab.label}
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold',
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-700'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Athlete List */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence mode="wait">
          {filteredInvites.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeTab === 'all' ? '' : activeTab} invites
              </h3>
              <p className="text-gray-600 text-sm">
                {activeTab === 'accepted'
                  ? 'No athletes have accepted your invites yet'
                  : activeTab === 'invited'
                    ? 'No pending invites'
                    : activeTab === 'declined'
                      ? 'No athletes have declined'
                      : 'Invite athletes from the Matched Athletes section'}
              </p>
            </motion.div>
          ) : (
            filteredInvites.map((invite, index) => {
              const config = statusConfig[invite.status];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-orange-50/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {invite.athlete?.avatar_url ? (
                        <img
                          src={invite.athlete.avatar_url}
                          alt={invite.athlete.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Athlete Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 truncate">
                          {invite.athlete?.full_name || 'Unknown Athlete'}
                        </h4>
                        {invite.athlete?.username && (
                          <span className="text-xs text-gray-500 font-medium">
                            @{invite.athlete.username}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {invite.athlete?.primary_sport && (
                          <span>{invite.athlete.primary_sport}</span>
                        )}
                        {invite.athlete?.school_name && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>{invite.athlete.school_name}</span>
                          </>
                        )}
                        {invite.athlete?.total_followers && invite.athlete.total_followers > 0 && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span>{(invite.athlete.total_followers / 1000).toFixed(1)}K followers</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full border',
                      config.bg,
                      config.border
                    )}>
                      <StatusIcon className={cn('w-4 h-4', config.color)} />
                      <span className={cn('text-sm font-semibold', config.color)}>
                        {config.label}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {invite.status === 'accepted' && (
                      <div className="flex items-center gap-2">
                        {onSendMessage && (
                          <button
                            onClick={() => onSendMessage(invite.athlete_id)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                            title="Send Message"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        {onStartDeal && (
                          <button
                            onClick={() => onStartDeal(invite.athlete_id)}
                            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Start Deal
                          </button>
                        )}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-right text-xs text-gray-500 min-w-[80px]">
                      {invite.status === 'accepted' && invite.accepted_at ? (
                        <>
                          <div className="font-medium text-green-600">Accepted</div>
                          <div>{new Date(invite.accepted_at).toLocaleDateString()}</div>
                        </>
                      ) : invite.responded_at ? (
                        <>
                          <div>Responded</div>
                          <div>{new Date(invite.responded_at).toLocaleDateString()}</div>
                        </>
                      ) : (
                        <>
                          <div>Invited</div>
                          <div>{new Date(invite.invited_at).toLocaleDateString()}</div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer with view all link */}
      {invites.length > 5 && activeTab === 'all' && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button className="w-full flex items-center justify-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm transition-colors">
            View All {invites.length} Athletes
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default CampaignAthletes;
