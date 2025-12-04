/**
 * Campaign Detail and Edit Page
 *
 * View and edit individual campaign details
 * Features campaign stats, assigned athletes, and edit form
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Save, X, Trash2, Users, TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/AuthGuard';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import MatchedAthletes from '@/components/campaigns/MatchedAthletes';
import { CampaignAthletes } from '@/components/campaigns/CampaignAthletes';
import { useAuth } from '@/contexts/AuthContext';

interface Campaign {
  id: string;
  name: string;
  description: string;
  campaignType?: 'social_media' | 'endorsement' | 'event' | 'product_launch';
  status: 'pending' | 'active' | 'completed';
  startDate: string | null;
  endDate: string | null;
  budget: number;
  spent: number;
  targetSports: string[];
  createdAt: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    dotBg: 'bg-amber-500',
  },
  active: {
    label: 'Active',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-300',
    dotBg: 'bg-green-500',
  },
  completed: {
    label: 'Completed',
    color: 'text-gray-700',
    bg: 'bg-gray-50',
    border: 'border-gray-300',
    dotBg: 'bg-gray-500',
  },
};

const campaignTypeLabels = {
  social_media: 'Social Media',
  endorsement: 'Endorsement',
  event: 'Event',
  product_launch: 'Product Launch',
};

function CampaignDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Campaign>>({});

  useEffect(() => {
    async function fetchCampaign() {
      if (!user?.id) {
        // Wait for user to be available
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        // Fetch campaign from dashboard API and find the matching one
        const response = await fetch('/api/agency/dashboard', {
          credentials: 'include',
          headers: {
            'X-User-ID': user.id,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch campaign');
        const result = await response.json();

        // Find the campaign in the flat campaigns array
        const foundCampaign = result.campaigns?.find((c: Campaign) => c.id === campaignId);

        if (!foundCampaign) {
          throw new Error('Campaign not found');
        }

        setCampaign(foundCampaign);
        setEditData(foundCampaign);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCampaign();
  }, [campaignId, user?.id]);

  const handleSave = async () => {
    if (!campaign) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/agency/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update campaign');
      }

      const result = await response.json();
      setCampaign(result.campaign);
      setEditData(result.campaign);
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(campaign || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
        <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-12">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 flex items-center justify-center">
        <Card className="p-12 bg-white border-2 border-red-100 max-w-md">
          <div className="text-center">
            <p className="text-red-600 font-semibold text-lg mb-4">{error || 'Campaign not found'}</p>
            <Link
              href="/agencies/campaigns"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const config = statusConfig[campaign.status];
  const budgetSpent = campaign.budget > 0
    ? ((campaign.spent || 0) / campaign.budget) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Back Link */}
          <Link
            href="/agencies/campaigns"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white font-semibold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="text-4xl font-bold text-white bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:border-white/50 mb-2 w-full"
                />
              ) : (
                <h1 className="text-4xl font-bold text-white mb-2">{campaign.name}</h1>
              )}

              {isEditing ? (
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={2}
                  className="text-white/90 text-lg font-medium bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl px-4 py-2 focus:outline-none focus:border-white/50 w-full resize-none"
                />
              ) : (
                <p className="text-white/90 text-lg font-medium max-w-3xl">{campaign.description}</p>
              )}

              <div className="flex items-center gap-3 mt-4">
                <div
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2',
                    'bg-white/20 border-white/30'
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full', config.dotBg)}></div>
                  <span className="text-xs font-bold text-white">{config.label}</span>
                </div>
                <div className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full">
                  <span className="text-xs font-bold text-white">
                    {campaign.campaignType ? campaignTypeLabels[campaign.campaignType] || campaign.campaignType : 'Campaign'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 rounded-xl text-orange-600 font-bold text-sm shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 rounded-xl text-orange-600 font-bold text-sm shadow-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Campaign
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 bg-white border-2 border-orange-100/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-600">Budget</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${(campaign.budget / 1000).toFixed(0)}K
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium mb-2">
                ${(campaign.spent / 1000).toFixed(1)}K spent ({budgetSpent.toFixed(1)}%)
              </div>
              <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                  style={{ width: `${Math.min(budgetSpent, 100)}%` }}
                ></div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="p-6 bg-white border-2 border-orange-100/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-600">Created</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Campaign start date
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Campaign Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card className="p-6 bg-white border-2 border-orange-100/50">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Campaign Details</h2>

              <div className="space-y-4">
                {/* Dates */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">Campaign Period</span>
                  </div>
                  {campaign.startDate || campaign.endDate ? (
                    <div className="text-sm text-gray-900 font-medium">
                      {campaign.startDate && new Date(campaign.startDate).toLocaleDateString()}
                      {campaign.startDate && campaign.endDate && ' → '}
                      {campaign.endDate && new Date(campaign.endDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 font-medium">No dates set</div>
                  )}
                </div>

                {/* Target Sports */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-bold text-gray-700">Target Sports</span>
                  </div>
                  {campaign.targetSports.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {campaign.targetSports.map((sport) => (
                        <div
                          key={sport}
                          className="px-3 py-1 bg-orange-50 border border-orange-200/50 rounded-full"
                        >
                          <span className="text-xs font-bold text-orange-700">{sport}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 font-medium">All sports</div>
                  )}
                </div>

                {/* Campaign Type */}
                <div>
                  <span className="text-sm font-bold text-gray-700 block mb-2">Campaign Type</span>
                  <div className="px-3 py-1.5 bg-orange-50 border border-orange-200/50 rounded-lg inline-block">
                    <span className="text-sm font-bold text-orange-700">
                      {campaign.campaignType ? campaignTypeLabels[campaign.campaignType] || campaign.campaignType : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>

        {/* Athlete Invites Section - Shows accepted/pending/declined invites */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.30 }}
          className="mt-6"
        >
          <CampaignAthletes
            campaignId={campaignId}
            onStartDeal={(athleteId) => {
              // Navigate to deal creation or open modal
              console.log('Start deal with athlete:', athleteId);
            }}
            onSendMessage={(athleteId) => {
              // Navigate to messaging or open chat
              console.log('Send message to athlete:', athleteId);
            }}
          />
        </motion.div>

        {/* Matched Athletes Section - For finding new athletes to invite */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-6"
        >
          <MatchedAthletes
            campaignId={campaignId}
            campaignBudgetPerAthlete={campaign.budget}
          />
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-6"
        >
          <Card className="p-6 bg-white border-2 border-red-100">
            <h2 className="text-xl font-bold text-red-700 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Delete this campaign</p>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
              <button className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-700 font-bold rounded-xl text-sm transition-all inline-flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Campaign
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <ProtectedRoute>
      <CampaignDetailContent />
    </ProtectedRoute>
  );
}
