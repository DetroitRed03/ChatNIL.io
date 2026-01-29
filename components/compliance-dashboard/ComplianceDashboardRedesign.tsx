'use client';

import { useState, useEffect, useCallback } from 'react';
import { ActionRequiredSection } from './ActionRequiredSection';
import { ProgramHealthCard } from './ProgramHealthCard';
import { ThisWeekCard } from './ThisWeekCard';
import { AuditReadinessCard } from './AuditReadinessCard';
import { DeadlineTimeline } from './DeadlineTimeline';
import { ComplianceBySport } from './ComplianceBySport';
import { RecentActivityFeed } from './RecentActivityFeed';
import { EmptyStateOnboarding } from './EmptyStateOnboarding';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Types
interface ActionItem {
  id: string;
  athleteId: string;
  athleteName: string;
  dealId: string;
  severity: 'critical' | 'warning';
  issue: string;
  amount: number;
  action: string;
  dueDate?: string;
}

interface SportCompliance {
  sport: string;
  totalAthletes: number;
  compliancePercentage: number;
  redCount: number;
  yellowCount: number;
}

interface ActivityItem {
  id: string;
  type: 'deal_submitted' | 'deal_approved' | 'deal_flagged' | 'override_applied' | 'deadline_missed' | 'batch_approved';
  description: string;
  timestamp: string;
  athleteName?: string;
  dealName?: string;
}

interface DeadlineItem {
  id: string;
  athleteId: string;
  athleteName: string;
  dealName: string;
  amount: number;
  deadline: string;
}

interface DashboardData {
  institution: {
    id: string;
    name: string;
    logoUrl?: string;
  };
  officer: {
    id: string;
    name: string;
  };
  actionRequired: ActionItem[];
  programHealth: {
    percentage: number;
    trend: number;
    totalAthletes: number;
    totalDeals: number;
  };
  thisWeek: {
    submitted: number;
    reviewed: number;
    pending: number;
    pastDeadline: number;
    avgReviewTime: number;
  };
  auditReadiness: {
    documented: number;
    missedDeadlines: number;
    overridesLogged: number;
  };
  deadlines: {
    overdue?: number;
    today: number;
    tomorrow: number;
    thisWeek: number;
    nextWeek: number;
    overdueItems?: DeadlineItem[];
    todayItems: DeadlineItem[];
    tomorrowItems: DeadlineItem[];
  };
  bySport: SportCompliance[];
  recentActivity: ActivityItem[];
  isEmpty: boolean;
}

export function ComplianceDashboardRedesign() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [skipOnboarding, setSkipOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('compliance_skip_onboarding') === 'true';
    }
    return false;
  });

  const handleSkipOnboarding = () => {
    localStorage.setItem('compliance_skip_onboarding', 'true');
    setSkipOnboarding(true);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      // Get session for Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/compliance/dashboard-v2', {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          // Redirect to login if unauthorized
          router.push('/onboarding/role-selection');
          return;
        }
        if (response.status === 403) {
          setError('Access denied. This dashboard is for compliance officers only.');
          return;
        }
        throw new Error(errorData.error || 'Failed to fetch dashboard data');
      }
      const result = await response.json();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleViewAllAction = () => {
    // Pass red,yellow status to show all athletes needing attention
    router.push('/compliance/athletes?status=red,yellow');
  };

  const handleActionItemClick = (item: ActionItem) => {
    // Navigate to deal review page for compliance decision
    router.push(`/compliance/deals/${item.dealId}/review`);
  };


  const handleViewAllSports = () => {
    // Navigate to athletes list - sport filter can be selected there
    router.push('/compliance/athletes');
  };

  const handleSportClick = (sport: string) => {
    router.push(`/compliance/athletes?sport=${encodeURIComponent(sport)}`);
  };

  const handleViewAllActivity = () => {
    router.push('/compliance/activity');
  };

  const handleGenerateAuditPackage = () => {
    router.push('/compliance/reports?generate=audit');
  };

  const handleDownloadTemplate = () => {
    window.open('/api/compliance/import/template', '_blank');
  };

  const handleImportAthletes = () => {
    router.push('/compliance/import');
  };

  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return '';
    const minutes = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="compliance-dashboard-v2-loading">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="compliance-dashboard-v2-error">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <p className="text-gray-800 font-medium mb-2">Failed to load dashboard</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Empty state - show onboarding if no athletes and user hasn't skipped
  if (data.isEmpty && !skipOnboarding) {
    return (
      <EmptyStateOnboarding
        institutionName={data.institution.name}
        onDownloadTemplate={handleDownloadTemplate}
        onImportAthletes={handleImportAthletes}
        onSkip={handleSkipOnboarding}
      />
    );
  }

  const hasCriticalItems = data.actionRequired?.some(item => item.severity === 'critical') ?? false;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="compliance-dashboard-v2">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{data.institution.name}</h1>
            <p className="text-sm text-gray-500">
              Compliance Dashboard
              {lastUpdated && (
                <span className="ml-2 text-gray-400">
                  • Updated {getTimeSinceUpdate()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/compliance/athletes')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              View All Athletes
            </button>
            <button
              onClick={() => router.push('/compliance/import')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Import Athletes
            </button>
            <button
              onClick={() => router.push('/compliance/settings')}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Action Required - Full Width Hero */}
        {data.actionRequired.length > 0 && (
          <div className="mb-6">
            <ActionRequiredSection
              items={data.actionRequired}
              totalCount={data.actionRequired.length}
              onViewAll={handleViewAllAction}
              onItemClick={handleActionItemClick}
            />
          </div>
        )}

        {/* Top Row: 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <ProgramHealthCard
            percentage={data.programHealth.percentage}
            trend={data.programHealth.trend}
            totalAthletes={data.programHealth.totalAthletes}
            totalDeals={data.programHealth.totalDeals}
          />
          <ThisWeekCard
            submitted={data.thisWeek.submitted}
            reviewed={data.thisWeek.reviewed}
            pending={data.thisWeek.pending}
            pastDeadline={data.thisWeek.pastDeadline}
            avgReviewTime={data.thisWeek.avgReviewTime}
          />
          <AuditReadinessCard
            documented={data.auditReadiness.documented}
            missedDeadlines={data.auditReadiness.missedDeadlines}
            overridesLogged={data.auditReadiness.overridesLogged}
            onGeneratePackage={handleGenerateAuditPackage}
          />
        </div>

        {/* Deadline Timeline - Full Width */}
        <div className="mb-6">
          <DeadlineTimeline
            overdue={data.deadlines.overdue || 0}
            today={data.deadlines.today}
            tomorrow={data.deadlines.tomorrow}
            thisWeek={data.deadlines.thisWeek}
            nextWeek={data.deadlines.nextWeek}
          />
        </div>

        {/* Bottom Row: Sport Breakdown + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ComplianceBySport
            sports={data.bySport}
            onViewAll={handleViewAllSports}
            onSportClick={handleSportClick}
          />
          <RecentActivityFeed
            activities={data.recentActivity}
            onViewAll={handleViewAllActivity}
          />
        </div>
      </main>
    </div>
  );
}
