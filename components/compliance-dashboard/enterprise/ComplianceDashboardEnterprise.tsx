'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Existing components
import { ProgramHealthCard } from '../ProgramHealthCard';
import { ThisWeekCard } from '../ThisWeekCard';
import { AuditReadinessCard } from '../AuditReadinessCard';
import { DeadlineTimeline } from '../DeadlineTimeline';
import { RecentActivityFeed } from '../RecentActivityFeed';
import { EmptyStateOnboarding } from '../EmptyStateOnboarding';

// Enterprise components
import { ActionRequiredFilters, FilterConfig } from './ActionRequiredFilters';
import { ActionRequiredTable } from './ActionRequiredTable';
import { BulkActionBar } from './BulkActionBar';
import { QuickFilters } from './QuickFilters';
import { TeamWorkloadPanel } from './TeamWorkloadPanel';
import { ComplianceBySportV2 } from './ComplianceBySportV2';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { AssignmentModal } from './AssignmentModal';
import { SearchCommand } from './SearchCommand';
import { DecisionHistoryTab } from './DecisionHistoryTab';
import { AppealsQueueTab } from './AppealsQueueTab';

// Audit Log Export
import { AuditLogExport } from '@/components/compliance/AuditLogExport';

// Types
interface DashboardData {
  institution: { id: string; name: string; logoUrl?: string };
  officer: { id: string; name: string };
  programHealth: { percentage: number; trend: number; totalAthletes: number; totalDeals: number };
  thisWeek: { submitted: number; reviewed: number; pending: number; pastDeadline: number; avgReviewTime: number };
  auditReadiness: { documented: number; missedDeadlines: number; overridesLogged: number };
  deadlines: { overdue?: number; today: number; tomorrow: number; thisWeek: number; nextWeek: number; overdueItems?: any[]; todayItems: any[]; tomorrowItems: any[] };
  bySport: any[];
  recentActivity: any[];
  isEmpty: boolean;
}

interface ActionItem {
  id: string;
  athleteId: string;
  athleteName: string;
  dealId: string;
  dealTitle: string;
  severity: 'critical' | 'warning';
  issue: string;
  amount: number;
  action: string;
  sport: string;
  dueDate?: string;
  assignedTo?: string;
  assignedToName?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  openItems: number;
  completedThisWeek: number;
  overdueItems: number;
}

const defaultFilters: FilterConfig = {
  severity: ['critical', 'warning'],
  sport: [],
  status: [],
  assignee: null,
  dateRange: null,
  sortBy: 'severity',
  sortOrder: 'desc'
};

export function ComplianceDashboardEnterprise() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deadlineFilter = searchParams.get('deadline');
  const filterParam = searchParams.get('filter');

  // Core data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [totalOpenItems, setTotalOpenItems] = useState(0);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skipOnboarding, setSkipOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('compliance_skip_onboarding') === 'true';
    }
    return false;
  });

  // Enterprise feature state
  const [filters, setFilters] = useState<FilterConfig>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [activeFilterId, setActiveFilterId] = useState<string | null>('all');
  const [savedFilters, setSavedFilters] = useState<any[]>([]);

  // Modal state
  const [showSearchCommand, setShowSearchCommand] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentItemId, setAssignmentItemId] = useState<string | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  // Tab state
  type DashboardTab = 'action_required' | 'decision_history' | 'appeals_queue';
  const [activeTab, setActiveTab] = useState<DashboardTab>('action_required');
  const [appealsCount, setAppealsCount] = useState(0);

  // Get access token helper
  const getAccessToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  // Fetch dashboard summary
  const fetchDashboard = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/compliance/dashboard-v2', {
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/onboarding/role-selection');
          return;
        }
        if (response.status === 403) {
          setError('Access denied. This dashboard is for compliance officers only.');
          return;
        }
        throw new Error('Failed to fetch dashboard');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard');
    }
  }, [router]);

  // Fetch action items with filters/pagination
  const fetchActionItems = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      if (filters.severity.length > 0 && filters.severity.length < 2) {
        params.set('severity', filters.severity.join(','));
      }
      if (filters.sport.length > 0) {
        params.set('sport', filters.sport.join(','));
      }
      if (filters.assignee) {
        params.set('assignee', filters.assignee);
      }
      if (filters.dateRange) {
        params.set('dateFrom', filters.dateRange.from);
        params.set('dateTo', filters.dateRange.to);
      }
      if (deadlineFilter) {
        params.set('deadline', deadlineFilter);
      }

      const response = await fetch(`/api/compliance/action-items?${params}`, {
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setActionItems(data.items);
        setTotalItems(data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching action items:', err);
    }
  }, [page, pageSize, filters, deadlineFilter]);

  // Fetch team data
  const fetchTeam = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/compliance/team', {
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members);
        setTotalOpenItems(data.totalOpenItems);
      }
    } catch (err) {
      console.error('Error fetching team:', err);
    }
  }, []);

  // Fetch appeals count for badge
  const fetchAppealsCount = useCallback(async () => {
    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/compliance/appeals', {
        credentials: 'include',
        headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setAppealsCount(data.summary?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching appeals count:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchDashboard(), fetchActionItems(), fetchTeam(), fetchAppealsCount()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchDashboard, fetchActionItems, fetchTeam, fetchAppealsCount]);

  // Refetch action items when filters change
  useEffect(() => {
    if (!loading) {
      fetchActionItems();
    }
  }, [filters, page, pageSize, deadlineFilter]);

  // Handle ?filter= query param from sidebar links
  useEffect(() => {
    if (filterParam === 'action') {
      setActiveTab('action_required');
    } else if (filterParam === 'appeals') {
      setActiveTab('appeals_queue');
    } else if (filterParam === 'history') {
      setActiveTab('decision_history');
    }
  }, [filterParam]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // ? = Show shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcutsModal(true);
      }

      // ⌘K = Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchCommand(true);
      }

      // Esc = Clear selection
      if (e.key === 'Escape') {
        setSelectedIds(new Set());
        setShowSearchCommand(false);
        setShowShortcutsModal(false);
        setShowAssignmentModal(false);
      }

      // Bulk actions with selection
      if (selectedIds.size > 0) {
        if (e.key === 'a' && !e.metaKey) {
          e.preventDefault();
          handleBulkApprove();
        }
        if (e.key === 'r' && !e.metaKey) {
          e.preventDefault();
          handleBulkReject();
        }
        if (e.key === 's' && !e.metaKey) {
          e.preventDefault();
          setShowAssignmentModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  // Handlers
  const handleSkipOnboarding = () => {
    localStorage.setItem('compliance_skip_onboarding', 'true');
    setSkipOnboarding(true);
  };

  const handleFilterChange = (newFilters: FilterConfig) => {
    setFilters(newFilters);
    setPage(1);
    setActiveFilterId(null);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
    setActiveFilterId('all');
  };

  const handleQuickFilterSelect = (filter: any) => {
    setFilters(filter.filterConfig);
    setActiveFilterId(filter.id);
    setPage(1);
  };

  const handleBulkAction = async (action: string, extra?: any) => {
    if (selectedIds.size === 0) return;

    setIsProcessingBulk(true);
    try {
      const accessToken = await getAccessToken();
      const response = await fetch('/api/compliance/action-items', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          action,
          itemIds: Array.from(selectedIds),
          ...extra
        })
      });

      if (response.ok) {
        setSelectedIds(new Set());
        await fetchActionItems();
        await fetchDashboard();
      }
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleBulkApprove = () => handleBulkAction('approve');
  const handleBulkReject = () => handleBulkAction('reject');
  const handleBulkAssign = (memberId: string, notes?: string, priority?: string) => {
    handleBulkAction('assign', { assignTo: memberId, notes, priority });
  };

  const handleSearch = async (query: string) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`/api/compliance/search?q=${encodeURIComponent(query)}`, {
      credentials: 'include',
      headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}
    });
    if (response.ok) {
      const data = await response.json();
      return data.results;
    }
    return [];
  };

  const handleSearchSelect = (result: any) => {
    if (result.type === 'athlete') {
      router.push(`/compliance/athlete/${result.id}`);
    } else if (result.type === 'deal') {
      router.push(`/compliance/deals/${result.id}/review`);
    } else if (result.type === 'action' && result.id.startsWith('filter-')) {
      // Apply filter
      const parts = result.id.split('-');
      if (parts[1] === 'severity') {
        handleFilterChange({ ...filters, severity: [parts[2] as 'critical' | 'warning'] });
      } else if (parts[1] === 'assignee') {
        handleFilterChange({ ...filters, assignee: parts[2] === 'none' ? 'unassigned' : parts[2] });
      }
    }
    setShowSearchCommand(false);
  };

  // Sports list from data
  const sports = useMemo(() => {
    const sportSet = new Set(dashboardData?.bySport?.map(s => s.sport) || []);
    return Array.from(sportSet);
  }, [dashboardData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  // Empty state
  if (dashboardData.isEmpty && !skipOnboarding) {
    return (
      <EmptyStateOnboarding
        institutionName={dashboardData.institution.name}
        onDownloadTemplate={() => window.open('/api/compliance/import/template', '_blank')}
        onImportAthletes={() => router.push('/compliance/import')}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="compliance-dashboard-enterprise">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dashboardData.institution.name}</h1>
            <p className="text-sm text-gray-500">Compliance Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setShowSearchCommand(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">⌘K</kbd>
            </button>
            <AuditLogExport />
            <button
              onClick={() => router.push('/compliance/athletes')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              View All Athletes
            </button>
            <button
              onClick={() => router.push('/compliance/import')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Import Athletes
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <ProgramHealthCard
            percentage={dashboardData.programHealth.percentage}
            trend={dashboardData.programHealth.trend}
            totalAthletes={dashboardData.programHealth.totalAthletes}
            totalDeals={dashboardData.programHealth.totalDeals}
          />
          <ThisWeekCard
            submitted={dashboardData.thisWeek.submitted}
            reviewed={dashboardData.thisWeek.reviewed}
            pending={dashboardData.thisWeek.pending}
            pastDeadline={dashboardData.thisWeek.pastDeadline}
            avgReviewTime={dashboardData.thisWeek.avgReviewTime}
          />
          <AuditReadinessCard
            documented={dashboardData.auditReadiness.documented}
            missedDeadlines={dashboardData.auditReadiness.missedDeadlines}
            overridesLogged={dashboardData.auditReadiness.overridesLogged}
            onGeneratePackage={() => router.push('/compliance/reports?generate=audit')}
          />
          <DeadlineTimeline
            overdue={dashboardData.deadlines.overdue || 0}
            today={dashboardData.deadlines.today}
            tomorrow={dashboardData.deadlines.tomorrow}
            thisWeek={dashboardData.deadlines.thisWeek}
            nextWeek={dashboardData.deadlines.nextWeek}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Action Items (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('action_required')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'action_required'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Action Required
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                    activeTab === 'action_required'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {totalItems}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('decision_history')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'decision_history'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Decision History
                </button>
                <button
                  onClick={() => setActiveTab('appeals_queue')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'appeals_queue'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Appeals Queue
                  {appealsCount > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                      activeTab === 'appeals_queue'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {appealsCount}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 pb-3"
              >
                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs">?</kbd>
                Shortcuts
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'action_required' && (
              <>
                {/* Quick Filters */}
                <QuickFilters
                  savedFilters={savedFilters}
                  activeFilterId={activeFilterId}
                  onFilterSelect={handleQuickFilterSelect}
                  onSaveCurrentFilter={(name, isShared) => {
                    // TODO: Implement save filter API call
                    const newFilter = {
                      id: Date.now().toString(),
                      name,
                      filterConfig: filters,
                      isShared
                    };
                    setSavedFilters([...savedFilters, newFilter]);
                  }}
                  onDeleteFilter={(id) => {
                    setSavedFilters(savedFilters.filter(f => f.id !== id));
                  }}
                  currentFilters={filters}
                />

                {/* Filters */}
                <ActionRequiredFilters
                  sports={sports}
                  teamMembers={teamMembers.map(m => ({ id: m.id, name: m.name }))}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />

                {/* Action Items Table */}
                <ActionRequiredTable
                  items={actionItems}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  onItemClick={(item) => router.push(`/compliance/deals/${item.dealId}/review`)}
                  onAssign={(itemId) => {
                    setAssignmentItemId(itemId);
                    setSelectedIds(new Set([itemId]));
                    setShowAssignmentModal(true);
                  }}
                  page={page}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              </>
            )}

            {activeTab === 'decision_history' && (
              <DecisionHistoryTab
                onViewDeal={(dealId) => router.push(`/compliance/deals/${dealId}/review`)}
              />
            )}

            {activeTab === 'appeals_queue' && (
              <AppealsQueueTab
                onRefreshDashboard={() => {
                  fetchDashboard();
                  fetchAppealsCount();
                }}
              />
            )}
          </div>

          {/* Right Column - Sidebar (1 col) */}
          <div className="space-y-6">
            {/* Team Workload */}
            {teamMembers.length > 0 && (
              <TeamWorkloadPanel
                members={teamMembers}
                totalOpenItems={totalOpenItems}
                onMemberClick={(memberId) => handleFilterChange({ ...filters, assignee: memberId })}
              />
            )}

            {/* Compliance by Sport */}
            <ComplianceBySportV2
              sports={dashboardData.bySport.map(s => ({
                ...s,
                greenCount: s.totalAthletes - s.yellowCount - s.redCount,
                pendingReviews: 0
              }))}
              onSportClick={(sport) => router.push(`/compliance/athletes?sport=${encodeURIComponent(sport)}`)}
              onAthleteClick={(athleteId) => router.push(`/compliance/athlete/${athleteId}`)}
              onViewAll={() => router.push('/compliance/athletes?view=by_sport')}
            />

            {/* Recent Activity */}
            <RecentActivityFeed
              activities={dashboardData.recentActivity}
              onViewAll={() => router.push('/compliance/activity')}
            />
          </div>
        </div>
      </main>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onApprove={handleBulkApprove}
        onReject={handleBulkReject}
        onAssign={() => setShowAssignmentModal(true)}
        onExport={() => {/* TODO: Export selected */}}
        onClearSelection={() => setSelectedIds(new Set())}
        isProcessing={isProcessingBulk}
      />

      {/* Modals */}
      <SearchCommand
        isOpen={showSearchCommand}
        onClose={() => setShowSearchCommand(false)}
        onSearch={handleSearch}
        onSelect={handleSearchSelect}
      />

      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setAssignmentItemId(null);
        }}
        onAssign={handleBulkAssign}
        teamMembers={teamMembers}
        selectedItemsCount={selectedIds.size}
        itemDescription={assignmentItemId ? actionItems.find(i => i.id === assignmentItemId)?.dealTitle : undefined}
      />
    </div>
  );
}
