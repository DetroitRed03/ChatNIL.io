'use client';

import { useState, useEffect } from 'react';
import { Target, Building, TrendingUp, Calendar, Star, DollarSign, ChevronRight, Filter, Search, Loader2, AlertCircle, Sparkles, Mail, Check, X, Users, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AthleteOnlyGuard } from '@/components/guards/AthleteOnlyGuard';
import { useCampaignOpportunities } from '@/hooks/useDashboardData';
import { OpportunityList } from '@/components/matches/OpportunityList';
import { MatchResponseModal } from '@/components/matches/MatchResponseModal';

interface CampaignInvite {
  id: string;
  campaign_id: string;
  status: string;
  invited_at: string;
  campaign: {
    id: string;
    name: string;
    description?: string;
    budget: number;
    campaign_type?: string;
  } | null;
  agency: {
    id: string;
    name: string;
    logo_url?: string;
  } | null;
}

interface CampaignOpportunity {
  campaign_id: string;
  campaign_name: string;
  brand_name: string;
  match_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  recommended_offer_low: number;
  recommended_offer_high: number;
  strengths: string[];
  concerns: string[];
  match_breakdown: {
    brand_values: number;
    interests: number;
    campaign_fit: number;
    budget: number;
    geography: number;
    demographics: number;
    engagement: number;
  };
}

interface AgencyMatch {
  id: string;
  agency_id: string;
  athlete_id: string;
  match_score: number;
  match_tier?: string;
  match_reasons?: string[];
  score_breakdown?: Record<string, number>;
  status: string;
  contacted_at?: string;
  created_at: string;
  deal_id?: string;
  athlete_response_status?: string;
  agency_name?: string;
  agency_email?: string;
  agency_first_name?: string;
  agency_last_name?: string;
}

export default function OpportunitiesPage() {
  return (
    <AthleteOnlyGuard>
      <OpportunitiesPageContent />
    </AthleteOnlyGuard>
  );
}

function OpportunitiesPageContent() {
  const { user } = useAuth();
  const { data, error, isLoading } = useCampaignOpportunities(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');

  // Tab state
  const [activeTab, setActiveTab] = useState<'agency' | 'campaigns'>('agency');

  // Agency matches state
  const [agencyMatches, setAgencyMatches] = useState<AgencyMatch[]>([]);
  const [agencyMatchesLoading, setAgencyMatchesLoading] = useState(true);
  const [agencyMatchesError, setAgencyMatchesError] = useState<string | null>(null);
  const [agencyFilterStatus, setAgencyFilterStatus] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<AgencyMatch | null>(null);

  // Pending invites state
  const [invites, setInvites] = useState<CampaignInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  // Success feedback state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Campaign detail modal state
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignOpportunity | null>(null);

  // Fetch agency matches
  useEffect(() => {
    if (!user?.id) return;

    async function fetchAgencyMatches() {
      try {
        setAgencyMatchesLoading(true);
        setAgencyMatchesError(null);

        const statusParam = agencyFilterStatus !== 'all' ? `?status=${agencyFilterStatus}` : '';
        const response = await fetch(`/api/matches/athlete${statusParam}`, {
          headers: {
            'X-User-ID': user?.id || '',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAgencyMatches(data.opportunities || []);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setAgencyMatchesError(errorData.error || 'Failed to load agency opportunities');
        }
      } catch (err) {
        console.error('Error fetching agency matches:', err);
        setAgencyMatchesError('Failed to load agency opportunities');
      } finally {
        setAgencyMatchesLoading(false);
      }
    }

    fetchAgencyMatches();
  }, [user?.id, agencyFilterStatus]);

  // Fetch pending invites
  useEffect(() => {
    if (!user?.id) return;

    async function fetchInvites() {
      try {
        setInvitesLoading(true);
        const response = await fetch('/api/athlete/invites', {
          headers: {
            'X-User-ID': user?.id || '',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setInvites(data.invites || []);
        }
      } catch (err) {
        console.error('Error fetching invites:', err);
      } finally {
        setInvitesLoading(false);
      }
    }

    fetchInvites();
  }, [user?.id]);

  // Handle invite response (accept/decline)
  const handleInviteResponse = async (inviteId: string, action: 'accept' | 'decline') => {
    console.log('🎯 handleInviteResponse called:', { inviteId, action, userId: user?.id });

    if (!user?.id) {
      console.log('❌ No user ID, returning early');
      return;
    }

    // Find the invite to get campaign name for feedback
    const invite = invites.find(inv => inv.id === inviteId);
    const campaignName = invite?.campaign?.name || 'Campaign';
    console.log('📋 Found invite:', { campaignName, inviteStatus: invite?.status });

    setRespondingTo(inviteId);
    try {
      const response = await fetch(`/api/athlete/invites/${inviteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user.id,
        },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      console.log('📡 API Response:', { ok: response.ok, status: response.status });

      if (response.ok) {
        console.log('✅ Success! Removing invite and showing toast');
        // Remove the invite from the list
        setInvites(prev => prev.filter(inv => inv.id !== inviteId));

        // Show success feedback
        const actionText = action === 'accept' ? 'accepted' : 'declined';
        setSuccessMessage(`Successfully ${actionText} invite from ${campaignName}!`);
        console.log('🔔 Success message set:', `Successfully ${actionText} invite from ${campaignName}!`);

        // Auto-hide success message after 4 seconds
        setTimeout(() => setSuccessMessage(null), 4000);

        // Refresh agency matches to update stats (in case status changed)
        const statusParam = agencyFilterStatus !== 'all' ? `?status=${agencyFilterStatus}` : '';
        const matchesRes = await fetch(`/api/matches/athlete${statusParam}`, {
          headers: { 'X-User-ID': user.id },
          credentials: 'include',
        });
        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setAgencyMatches(matchesData.opportunities || []);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to respond to invite');
      }
    } catch (err) {
      console.error('Error responding to invite:', err);
      alert('Failed to respond to invite');
    } finally {
      setRespondingTo(null);
    }
  };

  // Handle agency match response - refresh data after response
  const handleMatchResponseSuccess = async () => {
    // The modal handles the API call, we just need to refresh the data
    const statusParam = agencyFilterStatus !== 'all' ? `?status=${agencyFilterStatus}` : '';
    const res = await fetch(`/api/matches/athlete${statusParam}`, {
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      setAgencyMatches(data.opportunities || []);
    }
  };

  // Calculate agency match stats
  const agencyStats = {
    total: agencyMatches.length,
    pending: agencyMatches.filter(m => m.status === 'pending').length,
    contacted: agencyMatches.filter(m => m.status === 'contacted').length,
    interested: agencyMatches.filter(m => m.status === 'interested').length,
    partnered: agencyMatches.filter(m => m.status === 'partnered').length,
  };

  if (!user) {
    return null;
  }

  const campaigns: CampaignOpportunity[] = data?.campaigns || [];

  // Filter campaigns based on search and confidence filter
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchQuery === '' ||
      campaign.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brand_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesConfidence = filterConfidence === 'all' ||
      campaign.confidence_level === filterConfidence;

    return matchesSearch && matchesConfidence;
  });

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className="flex flex-col overflow-y-auto bg-background py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full">
        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className="flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg">
              <Check className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-2 text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              NIL Opportunities
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            Discover agency matches and AI-recommended campaigns tailored to your profile
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('agency')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'agency'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
              Agency Matches
              {agencyStats.total > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                  {agencyStats.total}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'campaigns'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Campaign Opportunities
              {data?.total > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold">
                  {data.total}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pending Campaign Invites */}
        {!invitesLoading && invites.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900">
                Pending Invites ({invites.length})
              </h2>
            </div>
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {invite.campaign?.name || 'Campaign'}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {invite.agency?.name || 'Agency'} wants to work with you
                          </p>
                          {invite.campaign?.budget && (
                            <p className="text-sm text-green-600 font-medium mt-1">
                              Budget: ${(invite.campaign.budget / 1000).toFixed(0)}K
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Invited {new Date(invite.invited_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleInviteResponse(invite.id, 'decline')}
                        disabled={respondingTo === invite.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </button>
                      <button
                        onClick={() => handleInviteResponse(invite.id, 'accept')}
                        disabled={respondingTo === invite.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50"
                      >
                        {respondingTo === invite.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Accept
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agency Matches Tab */}
        {activeTab === 'agency' && (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{agencyStats.total}</div>
                <div className="text-sm text-gray-600">Total Matches</div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 p-4">
                <div className="text-2xl font-bold text-orange-600">{invites.length}</div>
                <div className="text-sm text-orange-700 font-medium">Campaign Invites</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-600">{agencyStats.pending}</div>
                <div className="text-sm text-gray-600">Pending Matches</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-orange-600">{agencyStats.contacted}</div>
                <div className="text-sm text-gray-600">Contacted</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600">{agencyStats.interested}</div>
                <div className="text-sm text-gray-600">Interested</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-green-600">{agencyStats.partnered}</div>
                <div className="text-sm text-gray-600">Partnered</div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { value: 'all', label: 'All', count: agencyStats.total },
                { value: 'pending', label: 'Pending', count: agencyStats.pending },
                { value: 'contacted', label: 'Contacted', count: agencyStats.contacted },
                { value: 'interested', label: 'Interested', count: agencyStats.interested },
                { value: 'partnered', label: 'Partnered', count: agencyStats.partnered },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setAgencyFilterStatus(filter.value)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                    agencyFilterStatus === filter.value
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                  {filter.count > 0 && (
                    <span className="ml-1.5">({filter.count})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Opportunities List */}
            <OpportunityList
              opportunities={agencyMatches}
              isLoading={agencyMatchesLoading}
              error={agencyMatchesError}
              onViewDetails={(opportunity) => setSelectedOpportunity(opportunity)}
              viewMode="grid"
            />
          </>
        )}

        {/* Campaign Opportunities Tab */}
        {activeTab === 'campaigns' && (
          <>
            {/* Stats Summary */}
        {data?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{data.total}</div>
              <div className="text-sm text-gray-600">Total Matches</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">{data.summary.highConfidence}</div>
              <div className="text-sm text-gray-600">High Confidence</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-yellow-600">{data.summary.mediumConfidence}</div>
              <div className="text-sm text-gray-600">Medium Confidence</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-orange-600">{data.summary.avgMatchScore}%</div>
              <div className="text-sm text-gray-600">Avg Match Score</div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterConfidence}
              onChange={(e) => setFilterConfidence(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            >
              <option value="all">All Confidence</option>
              <option value="high">High Confidence</option>
              <option value="medium">Medium Confidence</option>
              <option value="low">Low Confidence</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600">Finding opportunities for you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to load opportunities</h3>
            <p className="text-red-600 text-sm">Please try refreshing the page or check back later.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCampaigns.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filterConfidence !== 'all'
                ? 'No matching opportunities found'
                : 'No opportunities yet'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {searchQuery || filterConfidence !== 'all'
                ? 'Try adjusting your search or filters to find more matches.'
                : 'Complete your profile to get matched with relevant brand campaigns. The more details you add, the better matches you\'ll receive.'}
            </p>
            {!searchQuery && filterConfidence === 'all' && (
              <button
                onClick={() => window.location.href = '/profile/edit'}
                className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-700 transition-colors"
              >
                Complete Your Profile
              </button>
            )}
          </div>
        )}

        {/* Campaign Cards */}
        {!isLoading && !error && filteredCampaigns.length > 0 && (
          <div className="space-y-4">
            {filteredCampaigns.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Left: Campaign Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.campaign_name}</h3>
                        <p className="text-gray-600 text-sm">{campaign.brand_name}</p>
                      </div>
                    </div>

                    {/* Strengths */}
                    {campaign.strengths && campaign.strengths.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1.5">Why you're a great fit:</p>
                        <div className="flex flex-wrap gap-2">
                          {campaign.strengths.slice(0, 3).map((strength, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                            >
                              <Star className="h-3 w-3 mr-1" />
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Estimated Compensation */}
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">Est. Offer:</span>
                      <span className="font-semibold text-gray-900">
                        ${campaign.recommended_offer_low.toLocaleString()} - ${campaign.recommended_offer_high.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Right: Match Score & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3">
                    {/* Match Score */}
                    <div className="text-center sm:text-right">
                      <div className={`text-3xl font-bold ${getMatchScoreColor(campaign.match_score)}`}>
                        {campaign.match_score}%
                      </div>
                      <div className="text-xs text-gray-500">Match Score</div>
                    </div>

                    {/* Confidence Badge */}
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getConfidenceBadgeColor(campaign.confidence_level)}`}>
                      {campaign.confidence_level.charAt(0).toUpperCase() + campaign.confidence_level.slice(1)} Confidence
                    </span>

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedCampaign(campaign)}
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Match Breakdown (Collapsed by default, could be expandable) */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center">
                    {Object.entries(campaign.match_breakdown).map(([key, value]) => (
                      <div key={key} className="p-2">
                        <div className="text-sm font-semibold text-gray-900">{value}%</div>
                        <div className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {data?.pagination && data.pagination.total > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Showing {Math.min(data.pagination.offset + data.pagination.limit, data.pagination.total)} of {data.pagination.total} opportunities
            {data.pagination.hasMore && (
              <button className="ml-4 text-orange-600 hover:text-orange-700 font-medium">
                Load More
              </button>
            )}
          </div>
        )}
          </>
        )}

        {/* Match Response Modal */}
        {selectedOpportunity && user?.id && (
          <MatchResponseModal
            opportunity={selectedOpportunity}
            userId={user.id}
            onClose={() => setSelectedOpportunity(null)}
            onSuccess={handleMatchResponseSuccess}
          />
        )}

        {/* Campaign Detail Modal */}
        {selectedCampaign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedCampaign.campaign_name}</h2>
                      <p className="text-gray-600">{selectedCampaign.brand_name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Match Score Section */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Your Match Score</p>
                    <div className={`text-4xl font-bold ${getMatchScoreColor(selectedCampaign.match_score)}`}>
                      {selectedCampaign.match_score}%
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border ${getConfidenceBadgeColor(selectedCampaign.confidence_level)}`}>
                    {selectedCampaign.confidence_level.charAt(0).toUpperCase() + selectedCampaign.confidence_level.slice(1)} Confidence
                  </span>
                </div>

                {/* Estimated Compensation */}
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Estimated Compensation</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    ${selectedCampaign.recommended_offer_low.toLocaleString()} - ${selectedCampaign.recommended_offer_high.toLocaleString()}
                  </p>
                </div>

                {/* Why You're a Great Fit */}
                {selectedCampaign.strengths && selectedCampaign.strengths.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Why You're a Great Fit
                    </h3>
                    <ul className="space-y-2">
                      {selectedCampaign.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas to Consider */}
                {selectedCampaign.concerns && selectedCampaign.concerns.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      Areas to Consider
                    </h3>
                    <ul className="space-y-2">
                      {selectedCampaign.concerns.map((concern, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600">
                          <span className="w-5 h-5 flex items-center justify-center text-amber-500 flex-shrink-0">•</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Match Breakdown */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Match Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(selectedCampaign.match_breakdown).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg text-center">
                        <div className="text-lg font-bold text-gray-900">{value}%</div>
                        <div className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedCampaign(null)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Close
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        // TODO: Implement express interest functionality
                        alert('Express Interest feature coming soon! This will notify the brand of your interest.');
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-700 transition-all shadow-md"
                    >
                      Express Interest
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
