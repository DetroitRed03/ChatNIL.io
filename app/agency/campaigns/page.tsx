/**
 * Campaigns Management Page - Agency Dashboard
 *
 * View and manage all agency campaigns
 * Features filtering, sorting, and campaign actions
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Rocket, TrendingUp, Calendar, DollarSign, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/AuthGuard';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
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

interface DashboardData {
  campaigns: Campaign[];
  savedAthletes: {
    count: number;
    athletes: any[];
  };
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

function CampaignsContent() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'budget' | 'startDate'>('name');

  useEffect(() => {
    async function fetchCampaigns() {
      if (!user?.id) {
        // Wait for user to be available
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
        if (!response.ok) throw new Error('Failed to fetch campaigns');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCampaigns();
  }, [user?.id]);

  // Get all campaigns from the flat array
  const allCampaigns: Campaign[] = data?.campaigns || [];

  // Filter campaigns
  const filteredCampaigns = allCampaigns
    .filter((campaign) => {
      // Status filter
      if (statusFilter !== 'all' && campaign.status !== statusFilter) return false;
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          campaign.name.toLowerCase().includes(query) ||
          campaign.description.toLowerCase().includes(query) ||
          (campaign.targetSports || []).some((sport) => sport.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sorting
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'budget') return (b.budget || 0) - (a.budget || 0);
      if (sortBy === 'startDate') {
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return 0;
    });

  const campaignCounts = {
    all: allCampaigns.length,
    pending: allCampaigns.filter(c => c.status === 'pending').length,
    active: allCampaigns.filter(c => c.status === 'active').length,
    completed: allCampaigns.filter(c => c.status === 'completed').length,
  };

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Campaign Management</h1>
                <p className="text-white/90 text-lg font-medium mt-1">
                  {isLoading ? 'Loading...' : `${campaignCounts.all} total campaigns`}
                </p>
              </div>
            </div>
            <Link
              href="/agency/campaigns/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 rounded-xl text-orange-600 font-bold text-sm shadow-lg shadow-black/10 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6 bg-white border-2 border-orange-100/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-bold appearance-none cursor-pointer"
                >
                  <option value="all">All Status ({campaignCounts.all})</option>
                  <option value="pending">Pending ({campaignCounts.pending})</option>
                  <option value="active">Active ({campaignCounts.active})</option>
                  <option value="completed">Completed ({campaignCounts.completed})</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-bold appearance-none cursor-pointer"
                >
                  <option value="name">Sort by Name</option>
                  <option value="budget">Sort by Budget</option>
                  <option value="startDate">Sort by Start Date</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-12 bg-white border-2 border-red-100">
            <div className="text-center">
              <p className="text-red-600 font-semibold text-lg mb-2">Error loading campaigns</p>
              <p className="text-gray-600">{error}</p>
            </div>
          </Card>
        ) : filteredCampaigns.length === 0 ? (
          <Card className="p-12 bg-white border-2 border-orange-100/50">
            <div className="text-center">
              <Rocket className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold text-lg mb-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'No campaigns match your filters'
                  : 'No campaigns yet'}
              </p>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first campaign to get started'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link
                  href="/agency/campaigns/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200/50"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Campaign
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCampaigns.map((campaign, index) => {
              const config = statusConfig[campaign.status];
              const budgetSpent = campaign.budget > 0
                ? ((campaign.spent || 0) / campaign.budget) * 100
                : 0;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="bg-white border-2 border-orange-100/50 hover:shadow-lg hover:shadow-orange-100/30 transition-all overflow-hidden group">
                    {/* Campaign Header */}
                    <div className="p-6 border-b border-orange-100/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                            {campaign.name}
                          </h3>
                          <p className="text-sm text-gray-600 font-medium line-clamp-2">
                            {campaign.description}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ml-4',
                            config.bg,
                            config.border
                          )}
                        >
                          <div className={cn('w-2 h-2 rounded-full', config.dotBg)}></div>
                          <span className={cn('text-xs font-bold', config.color)}>{config.label}</span>
                        </div>
                      </div>

                      {/* Campaign Type */}
                      <div className="flex items-center gap-2 mt-3">
                        {campaign.campaignType && (
                          <div className="px-3 py-1 bg-orange-50 border border-orange-200/50 rounded-full">
                            <span className="text-xs font-bold text-orange-700">
                              {campaignTypeLabels[campaign.campaignType]}
                            </span>
                          </div>
                        )}
                        {campaign.targetSports && campaign.targetSports.length > 0 && (
                          <div className="text-xs text-gray-600 font-medium">
                            · {campaign.targetSports.slice(0, 2).join(', ')}
                            {campaign.targetSports.length > 2 && ` +${campaign.targetSports.length - 2}`}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Campaign Stats */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Budget */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-bold text-gray-600">Budget</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            ${((campaign.budget || 0) / 1000).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            ${((campaign.spent || 0) / 1000).toFixed(1)}K spent
                          </div>
                          {/* Budget Progress */}
                          <div className="mt-2 h-2 bg-orange-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                              style={{ width: `${Math.min(budgetSpent, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-bold text-gray-600">Status</span>
                          </div>
                          <div className="text-lg font-bold text-gray-900 capitalize">
                            {campaign.status}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">
                            {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      {(campaign.startDate || campaign.endDate) && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium mb-4">
                          <Calendar className="w-4 h-4" />
                          {campaign.startDate && (
                            <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                          )}
                          {campaign.startDate && campaign.endDate && <span>→</span>}
                          {campaign.endDate && (
                            <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          href={`/agency/campaigns/${campaign.id}`}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl text-sm text-center transition-all shadow-md shadow-orange-200/50"
                        >
                          View Details
                        </Link>
                        <button className="px-4 py-2.5 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200/50 text-orange-700 font-bold rounded-xl text-sm transition-all">
                          Edit
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <ProtectedRoute>
      <CampaignsContent />
    </ProtectedRoute>
  );
}
