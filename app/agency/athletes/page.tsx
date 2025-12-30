/**
 * Agency Athletes Roster Page
 *
 * Full roster management page with:
 * - Athlete card grid display
 * - Filtering by sport and status
 * - Sorting by multiple fields
 * - Real-time data from /api/agency/roster
 *
 * Works in unison with agency agent context
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SortAsc,
  Users,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Mail,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/AuthGuard';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Athlete {
  id: string;
  username?: string | null;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  sport: string;
  school: string;
  position?: string;
  year?: string;
  estimatedFmv?: number;
  bio?: string;
  achievements?: string[];
  followers: {
    total: number;
    instagram: number;
    tiktok: number;
    twitter: number;
  };
  engagement: number;
  status: 'excellent' | 'good' | 'needs-attention';
  savedAt?: string;
}

interface RosterData {
  athletes: Athlete[];
  total: number;
  filters: {
    sport: string | null;
    status: string | null;
    availableSports: string[];
  };
  sort: {
    by: string;
    order: string;
  };
}

const statusConfig = {
  excellent: {
    label: 'On Target',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: TrendingUp,
  },
  good: {
    label: 'Good',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: TrendingUp,
  },
  'needs-attention': {
    label: 'Needs Attention',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertCircle,
  },
};

function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${Math.floor(count / 1000)}K`;
  return count.toString();
}

function AthletesContent() {
  const { user } = useAuth();
  const [data, setData] = useState<RosterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort state
  const [sportFilter, setSportFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchRoster() {
      if (!user?.id) {
        // Don't set loading false - wait for user to be available
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (sportFilter) params.append('sport', sportFilter);
        if (statusFilter) params.append('status', statusFilter);
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);

        const response = await fetch(`/api/agency/roster?${params.toString()}`, {
          credentials: 'include', // Ensure cookies are sent
          headers: {
            'X-User-ID': user.id, // Fallback auth header
          },
        });
        if (!response.ok) throw new Error('Failed to fetch roster data');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoster();
  }, [user?.id, sportFilter, statusFilter, sortBy, sortOrder]);

  // Client-side search filter
  const filteredAthletes = data?.athletes.filter(athlete => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      athlete.name.toLowerCase().includes(query) ||
      athlete.sport.toLowerCase().includes(query) ||
      athlete.school.toLowerCase().includes(query)
    );
  }) || [];

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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Athletes Roster</h1>
              <p className="text-white/90 text-lg font-medium mt-1">
                {isLoading ? 'Loading...' : `${data?.total || 0} athletes under management`}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search athletes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-orange-200/50 rounded-xl focus:outline-none focus:border-orange-400 bg-white text-gray-900 font-medium"
              />
            </div>

            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-3">
              {/* Sport Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={sportFilter}
                  onChange={(e) => setSportFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border-2 border-orange-200/50 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none focus:border-orange-400 appearance-none cursor-pointer"
                >
                  <option value="">All Sports</option>
                  {data?.filters.availableSports.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border-2 border-orange-200/50 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none focus:border-orange-400 appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="excellent">On Target</option>
                <option value="good">Good</option>
                <option value="needs-attention">Needs Attention</option>
              </select>

              {/* Sort By */}
              <div className="relative">
                <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-8 py-3 border-2 border-orange-200/50 rounded-xl bg-white text-gray-900 font-semibold focus:outline-none focus:border-orange-400 appearance-none cursor-pointer"
                >
                  <option value="name">Name</option>
                  <option value="followers">Followers</option>
                  <option value="engagement">Engagement</option>
                  <option value="fmv">Fair Market Value</option>
                  <option value="savedAt">Recently Added</option>
                </select>
              </div>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 border-2 border-orange-200/50 rounded-xl bg-white hover:bg-orange-50 transition-colors font-semibold text-gray-900"
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Roster</h3>
            <p className="text-gray-600 font-medium">{error}</p>
          </Card>
        ) : filteredAthletes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Athletes Found</h3>
            <p className="text-gray-600 font-medium">
              {searchQuery || sportFilter || statusFilter
                ? 'Try adjusting your filters'
                : 'Start discovering athletes to add to your roster'}
            </p>
          </Card>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-700 font-semibold text-lg">
                Showing {filteredAthletes.length} of {data?.total || 0} athletes
              </p>
            </div>

            {/* Athlete Cards Grid */}
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAthletes.map((athlete, index) => {
                  const config = statusConfig[athlete.status];
                  const StatusIcon = config.icon;

                  return (
                    <motion.div
                      key={athlete.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card className="group h-full bg-gradient-to-br from-white to-orange-50/30 border-2 border-orange-100/50 hover:border-orange-300/60 hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300 overflow-hidden">
                        {/* Card Header */}
                        <div className="relative bg-gradient-to-br from-orange-400 to-amber-500 px-6 py-8">
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            <div
                              className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 backdrop-blur-sm',
                                'bg-white/90',
                                config.border
                              )}
                            >
                              <StatusIcon className={cn('w-4 h-4', config.color)} />
                              <span className={cn('text-xs font-bold', config.color)}>
                                {config.label}
                              </span>
                            </div>
                          </div>

                          {/* Avatar and Name */}
                          <div className="flex flex-col items-center">
                            <Avatar
                              src={undefined}
                              alt={athlete.name}
                              size="xl"
                              fallback={`${athlete.firstName[0]}${athlete.lastName[0]}`}
                              className="border-4 border-white/30 shadow-lg mb-4"
                            />
                            <h3 className="text-2xl font-bold text-white text-center mb-1">
                              {athlete.name}
                            </h3>
                            <p className="text-white/90 font-semibold text-sm">{athlete.school}</p>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 space-y-4">
                          {/* Sport and Position */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
                              <span className="text-sm font-bold text-orange-700">
                                {athlete.sport}
                              </span>
                            </div>
                            {athlete.position && (
                              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                                <span className="text-sm font-bold text-amber-700">
                                  {athlete.position}
                                </span>
                              </div>
                            )}
                            {athlete.year && (
                              <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full">
                                <span className="text-sm font-bold text-gray-700">
                                  {athlete.year}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/50 rounded-xl p-3">
                              <p className="text-xs font-bold text-gray-600 mb-1">Followers</p>
                              <p className="text-2xl font-bold text-orange-700">
                                {formatFollowers(athlete.followers.total)}
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/50 rounded-xl p-3">
                              <p className="text-xs font-bold text-gray-600 mb-1">Engagement</p>
                              <p className="text-2xl font-bold text-orange-700">
                                {athlete.engagement.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          {/* Est. FMV */}
                          {athlete.estimatedFmv && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                              <p className="text-xs font-bold text-gray-600 mb-1">
                                Estimated Fair Market Value
                              </p>
                              <p className="text-3xl font-bold text-green-700">
                                ${(athlete.estimatedFmv / 1000).toFixed(0)}K
                              </p>
                            </div>
                          )}

                          {/* Social Breakdown */}
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-gray-600">Social Media</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <p className="text-xs font-semibold text-gray-500">Instagram</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {formatFollowers(athlete.followers.instagram)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500">TikTok</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {formatFollowers(athlete.followers.tiktok)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500">Twitter</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {formatFollowers(athlete.followers.twitter)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Bio */}
                          {athlete.bio && (
                            <div>
                              <p className="text-sm text-gray-700 font-medium line-clamp-3">
                                {athlete.bio}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => {
                                // Navigate to messages page with this athlete
                                window.location.href = `/agency/messages?athleteId=${athlete.id}`;
                              }}
                              className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Message
                            </button>
                            <button
                              onClick={() => {
                                // Navigate to athlete public profile (prefer username, fallback to id)
                                const profilePath = athlete.username || athlete.id;
                                window.location.href = `/athletes/${profilePath}`;
                              }}
                              className="px-4 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-xl transition-colors flex items-center justify-center"
                              title="View Profile"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            {athlete.email && (
                              <a
                                href={`mailto:${athlete.email}`}
                                className="px-4 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-xl transition-colors flex items-center justify-center"
                                title="Send Email"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

export default function AthletesPage() {
  return (
    <ProtectedRoute>
      <AthletesContent />
    </ProtectedRoute>
  );
}
