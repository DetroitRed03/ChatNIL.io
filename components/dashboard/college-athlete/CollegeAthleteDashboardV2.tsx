'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Protection Hero
import { ProtectionHero } from './protection-hero';

// Urgent Deals
import { UrgentDealsSection } from './urgent-deals';

// Protected Deals
import { ProtectedDealsSection } from './protected-deals';

// Action Center
import { ActionCenterSection } from './action-center';

// Tax Tracker
import { TaxTrackerSection } from './tax-tracker';

// Reminders
import { RemindersSection } from './reminders';

// Compliance Submission
import { SubmissionWorkflow } from './compliance-submission';

// Modals
import {
  ScoreBreakdownModal,
  UploadContractModal,
  ComplianceSubmissionModal,
  FMVExplanationModal,
  SchoolGuidelinesModal,
  SetReminderModal,
} from './modals';

// Types matching the v2 API response
interface DimensionData {
  score: number;
  weight: number;
  status: 'good' | 'warning' | 'critical';
  issues?: string[];
}

interface DealIssue {
  id: string;
  dimension: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  actionLabel: string;
  actionUrl?: string;
}

interface Deal {
  id: string;
  brandName: string;
  brandLogo?: string;
  value: number;
  dealType: string;
  overallScore: number;
  dimensions: {
    policyFit: DimensionData;
    documentHygiene: DimensionData;
    fmvVerification: DimensionData;
    taxReadiness: DimensionData;
    brandSafety: DimensionData;
    guardianConsent: DimensionData;
  };
  issues: DealIssue[];
  submissionStatus: 'not_submitted' | 'pending_review' | 'approved' | 'needs_revision' | 'rejected' | 'response_submitted' | 'conditions_completed';
  submissionDeadline?: string;
  submittedAt?: string;
  reviewedAt?: string;
  athleteNotes?: string;
  startDate?: string;
  endDate?: string;
  supersededByDealId?: string | null;
  resubmittedFromDealId?: string | null;
}

interface ApiTodo {
  id: string;
  title: string;
  description?: string;
  urgency: 'urgent' | 'soon' | 'later';
  completed: boolean;
  dueDate?: string;
  actionLabel: string;
  actionUrl?: string;
  relatedDealId?: string;
}

interface DashboardData {
  user: {
    id: string;
    firstName: string;
    fullName: string;
    sport: string;
    position?: string;
    school: {
      name: string;
      state: string;
      stateCode: string;
      complianceEmail?: string;
    };
    year?: string;
    avatar?: string;
    isMinor: boolean;
  };
  protection: {
    score: number;
    status: 'protected' | 'attention_needed' | 'at_risk';
    activeDeals: number;
    protectedDeals: number;
    issuesCount: number;
    totalEarnings: number;
  };
  urgentDeals: Deal[];
  protectedDeals: Deal[];
  allDeals: Deal[];
  todos: ApiTodo[];
  tax: {
    currentYear: number;
    totalIncome: number;
    estimatedTax: number;
    quarters: Array<{
      quarter: number;
      quarterName: string;
      dueDate: string;
      estimatedTax: number;
      paymentStatus: 'upcoming' | 'due_soon' | 'overdue' | 'paid' | 'partial';
      amountPaid?: number;
    }>;
    setAsidePerDeal: number;
    nextDueDate: string;
    nextDueAmount: number;
  };
  stateRules: {
    stateCode: string;
    stateName: string;
    nilAllowed: boolean;
    disclosureDeadlineDays: number;
    prohibitedCategories: string[];
  };
  reminders: Array<{
    id: string;
    title: string;
    description?: string;
    reminderDate: string;
    reminderType: string;
    relatedDealId?: string;
  }>;
  notificationBadge: {
    unreadNotifications: number;
    pendingReminders: number;
    total: number;
  };
}

// Transform API deal to UrgentDealsSection format
function transformToUrgentDeal(deal: Deal, stateRules: DashboardData['stateRules']) {
  const deadline = deal.submissionDeadline ? new Date(deal.submissionDeadline) : undefined;
  const now = new Date();
  const daysRemaining = deadline
    ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : 7;

  return {
    id: deal.id,
    brandName: deal.brandName,
    brandLogo: deal.brandLogo,
    value: deal.value,
    overallScore: deal.overallScore,
    dimensions: deal.dimensions,
    issues: deal.issues.map(issue => ({
      id: issue.id,
      dimension: issue.dimension,
      severity: issue.severity,
      title: issue.title,
      description: issue.description,
      fixAction: {
        label: issue.actionLabel,
        type: 'modal' as const,
        url: issue.actionUrl,
      },
    })),
    submission: deal.submissionStatus === 'not_submitted' && deadline ? {
      status: 'not_submitted' as const,
      deadline: deal.submissionDeadline!,
      daysRemaining,
    } : undefined,
  };
}

// Transform API deal to ProtectedDealsSection format
function transformToProtectedDeal(deal: Deal) {
  return {
    id: deal.id,
    brandName: deal.brandName,
    brandLogo: deal.brandLogo,
    value: deal.value,
    overallScore: deal.overallScore,
    dealType: deal.dealType,
    startDate: deal.startDate,
    endDate: deal.endDate,
    dimensions: deal.dimensions,
    submissionStatus: deal.submissionStatus === 'approved' ? 'approved' as const : 'submitted' as const,
  };
}

// Transform API todo to ActionCenterSection format
function transformToActionTodo(todo: ApiTodo) {
  return {
    id: todo.id,
    priority: todo.urgency as 'urgent' | 'soon' | 'later',
    type: todo.relatedDealId ? 'deal' as const : 'submission' as const,
    title: todo.title,
    description: todo.description,
    dueDate: todo.dueDate,
    action: {
      label: todo.actionLabel,
      type: 'action',
      url: todo.actionUrl,
      dealId: todo.relatedDealId,
    },
  };
}

// Modal state types
interface SelectedDeal {
  id: string;
  brandName: string;
  value: number;
  overallScore: number;
  dimensions?: any;
  issues?: any[];
}

export function CollegeAthleteDashboardV2() {
  const router = useRouter();
  const { user, isLoading: authLoading, isLoadingProfile, isReady: authReady } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'reporting'>('overview');
  const [fetchAttempted, setFetchAttempted] = useState(false);

  // Prevent hydration flash - only render content after client mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal states
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showUploadContract, setShowUploadContract] = useState(false);
  const [showComplianceSubmit, setShowComplianceSubmit] = useState(false);
  const [showFMVExplanation, setShowFMVExplanation] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  // Selected deal for modals
  const [selectedDeal, setSelectedDeal] = useState<SelectedDeal | null>(null);

  // Reminder state
  const [reminderData, setReminderData] = useState<{
    type?: string;
    title?: string;
    date?: string;
    dealId?: string;
  }>({});

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Get access token for API auth
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/dashboard/college-athlete/v2', {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. This dashboard is for college athletes.');
          return;
        }
        throw new Error('Failed to load dashboard');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setFetchAttempted(true);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to complete before fetching
    if (authLoading) return;

    // If no user after auth completes, stop loading
    if (!user) {
      setLoading(false);
      setFetchAttempted(true);
      return;
    }

    // User is available, fetch dashboard
    fetchDashboardData();
  }, [user, authLoading, fetchDashboardData]);

  // Transform data for components
  const transformedData = useMemo(() => {
    if (!data) return null;

    const criticalCount = data.urgentDeals.reduce((count, deal) =>
      count + deal.issues.filter(i => i.severity === 'critical').length, 0
    );

    return {
      protectionStatus: {
        overall: data.protection.status,
        score: data.protection.score,
        summary: data.protection.status === 'protected'
          ? 'All your deals look good!'
          : data.protection.status === 'attention_needed'
          ? 'Some deals need your attention'
          : 'Critical issues need fixing',
        issueCount: data.protection.issuesCount,
        criticalCount,
      },
      quickStats: {
        activeDeals: data.protection.activeDeals,
        totalValue: data.protection.totalEarnings,
        pendingIssues: data.protection.issuesCount,
        submissionsDue: data.allDeals.filter(d => d.submissionStatus === 'not_submitted').length,
      },
      urgentDeals: data.urgentDeals.map(d => transformToUrgentDeal(d, data.stateRules)),
      protectedDeals: data.protectedDeals.map(d => transformToProtectedDeal(d)),
      todos: data.todos.map(t => transformToActionTodo(t)),
    };
  }, [data]);

  // Handle fix issue - opens appropriate modal based on issue type
  const handleFixIssue = useCallback((dealId: string, issue: any) => {
    const deal = data?.allDeals.find(d => d.id === dealId);
    if (!deal) return;

    setSelectedDeal({
      id: deal.id,
      brandName: deal.brandName,
      value: deal.value,
      overallScore: deal.overallScore,
      dimensions: deal.dimensions,
      issues: deal.issues,
    });

    // Determine which modal to open based on issue action label
    const actionLabel = issue.fixAction?.label?.toLowerCase() || issue.actionLabel?.toLowerCase() || '';

    if (actionLabel.includes('upload') || actionLabel.includes('contract')) {
      setShowUploadContract(true);
    } else if (actionLabel.includes('fmv') || actionLabel.includes('value')) {
      setShowFMVExplanation(true);
    } else if (actionLabel.includes('guideline') || actionLabel.includes('rule')) {
      setShowGuidelines(true);
    } else if (actionLabel.includes('submit') || actionLabel.includes('report')) {
      setShowComplianceSubmit(true);
    } else {
      // Default: show score breakdown
      setShowScoreBreakdown(true);
    }
  }, [data]);

  // Handle view deal details - navigate to deal page or open score breakdown
  const handleViewDealDetails = useCallback((dealId: string) => {
    const deal = data?.allDeals.find(d => d.id === dealId);
    if (!deal) return;

    setSelectedDeal({
      id: deal.id,
      brandName: deal.brandName,
      value: deal.value,
      overallScore: deal.overallScore,
      dimensions: deal.dimensions,
      issues: deal.issues,
    });
    setShowScoreBreakdown(true);
  }, [data]);

  // Handle todo action - opens appropriate modal or navigates
  const handleTodoAction = useCallback((todoId: string, action: any) => {
    const actionLabel = action?.label?.toLowerCase() || '';
    const dealId = action?.dealId;

    if (dealId) {
      const deal = data?.allDeals.find(d => d.id === dealId);
      if (deal) {
        setSelectedDeal({
          id: deal.id,
          brandName: deal.brandName,
          value: deal.value,
          overallScore: deal.overallScore,
          dimensions: deal.dimensions,
          issues: deal.issues,
        });
      }
    }

    if (actionLabel.includes('review contract') || actionLabel.includes('review deal')) {
      if (dealId) {
        router.push(`/deals/${dealId}`);
      }
    } else if (actionLabel.includes('report') || actionLabel.includes('submit')) {
      if (dealId && selectedDeal) {
        setShowComplianceSubmit(true);
      }
    } else if (actionLabel.includes('reminder') || actionLabel.includes('tax')) {
      const todo = data?.todos.find(t => t.id === todoId);
      setReminderData({
        type: 'tax_payment',
        title: todo?.title || 'Tax payment reminder',
        date: todo?.dueDate,
        dealId,
      });
      setShowReminder(true);
    } else if (actionLabel.includes('guideline')) {
      setShowGuidelines(true);
    } else if (dealId) {
      // Fallback: any unrecognized action with a dealId navigates to the deal
      router.push(`/deals/${dealId}`);
    }
  }, [data, selectedDeal, router]);

  // Handle dismiss todo
  const handleDismissTodo = useCallback(async (todoId: string) => {
    try {
      const response = await fetch(`/api/todos/${todoId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        await fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to dismiss todo:', err);
    }
  }, [fetchDashboardData]);

  // Handle complete reminder
  const handleCompleteReminder = useCallback(async (reminderId: string) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_id: reminderId, action: 'complete' }),
      });
      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to complete reminder:', err);
    }
  }, [fetchDashboardData]);

  // Handle dismiss reminder
  const handleDismissReminder = useCallback(async (reminderId: string) => {
    try {
      const response = await fetch('/api/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_id: reminderId, action: 'dismiss' }),
      });
      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to dismiss reminder:', err);
    }
  }, [fetchDashboardData]);

  // Handle deal submission
  const handleSubmitDeal = useCallback(async (dealId: string) => {
    const deal = data?.allDeals.find(d => d.id === dealId);
    if (!deal) return;

    setSelectedDeal({
      id: deal.id,
      brandName: deal.brandName,
      value: deal.value,
      overallScore: deal.overallScore,
    });
    setShowComplianceSubmit(true);
  }, [data]);

  // Handle check new deal button
  const handleCheckNewDeal = useCallback(() => {
    router.push('/deals/validate');
  }, [router]);

  // Handle modal close and refresh
  const handleModalClose = useCallback(() => {
    setShowScoreBreakdown(false);
    setShowUploadContract(false);
    setShowComplianceSubmit(false);
    setShowFMVExplanation(false);
    setShowGuidelines(false);
    setShowReminder(false);
    setSelectedDeal(null);
    setReminderData({});
  }, []);

  // Handle modal success and refresh data
  const handleModalSuccess = useCallback(async () => {
    handleModalClose();
    await fetchDashboardData();
  }, [handleModalClose, fetchDashboardData]);

  // Handle stat card clicks
  const handleStatCardClick = useCallback((type: string) => {
    switch (type) {
      case 'deals':
        setActiveTab('deals');
        break;
      case 'value':
        // Scroll to tax tracker
        document.getElementById('tax-tracker')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'issues':
        // Scroll to urgent deals section
        document.getElementById('urgent-deals')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'submissions':
        setActiveTab('reporting');
        break;
    }
  }, []);

  // Show loading while:
  // - Component hasn't mounted yet (prevents hydration flash)
  // - Auth is still initializing (!authReady)
  // - Auth is loading (authLoading)
  // - Profile is still loading (isLoadingProfile)
  // - Dashboard data is loading (loading)
  // - Auth finished but we haven't attempted to fetch yet
  if (!mounted || !authReady || authLoading || isLoadingProfile || loading || (!user && !fetchAttempted)) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Hero skeleton */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full" />
                <div className="flex-grow space-y-3">
                  <div className="h-8 bg-gray-200 rounded w-48" />
                  <div className="h-4 bg-gray-200 rounded w-64" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
              </div>
            </div>
            {/* Content skeleton */}
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="grid md:grid-cols-2 gap-4">
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-48 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only show login prompt when mounted, auth is fully ready, profile done loading, and user is confirmed null
  if (!user && mounted && authReady && !isLoadingProfile && fetchAttempted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-500">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-md text-center shadow-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !transformedData) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {/* Protection Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProtectionHero
            userName={data.user.fullName}
            protectionStatus={transformedData.protectionStatus}
            quickStats={transformedData.quickStats}
            onCheckNewDeal={handleCheckNewDeal}
            onStatClick={handleStatCardClick}
          />
        </motion.div>

        {/* Tab Navigation (Mobile-friendly) */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'deals', label: 'My Deals', icon: '📋' },
            { id: 'reporting', label: 'School Reporting', icon: '🏫' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }
              `}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Urgent Deals (if any) */}
            {transformedData.urgentDeals.length > 0 && (
              <motion.div
                id="urgent-deals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <UrgentDealsSection
                  deals={transformedData.urgentDeals}
                  onFixIssue={handleFixIssue}
                  onViewDetails={handleViewDealDetails}
                  onSubmitToCompliance={handleSubmitDeal}
                />
              </motion.div>
            )}

            {/* Action Center (To-Do List) */}
            {transformedData.todos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ActionCenterSection
                  todos={transformedData.todos}
                  onAction={handleTodoAction}
                  onDismiss={handleDismissTodo}
                />
              </motion.div>
            )}

            {/* My Reminders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <RemindersSection
                reminders={data.reminders || []}
                onComplete={handleCompleteReminder}
                onDismiss={handleDismissReminder}
                onSetReminder={() => setShowReminder(true)}
              />
            </motion.div>

            {/* Two Column: Tax Tracker + Quick Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                id="tax-tracker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <TaxTrackerSection
                  taxData={data.tax}
                  onSetReminder={(data) => {
                    setReminderData(data);
                    setShowReminder(true);
                  }}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {/* State Rules Quick Card */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">{data.stateRules.stateName} Rules</h2>
                        <p className="text-sm text-white/80">What you need to know</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">NIL Allowed</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        data.stateRules.nilAllowed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {data.stateRules.nilAllowed ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Reporting Deadline</span>
                      <span className="text-sm font-medium text-gray-900">
                        {data.stateRules.disclosureDeadlineDays} days
                      </span>
                    </div>
                    <div className="py-2">
                      <span className="text-sm text-gray-600 block mb-2">Off-Limits Categories</span>
                      <div className="flex flex-wrap gap-1">
                        {data.stateRules.prohibitedCategories.map(cat => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full capitalize"
                          >
                            {cat.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Protected Deals */}
            {transformedData.protectedDeals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <ProtectedDealsSection
                  deals={transformedData.protectedDeals}
                  onViewDetails={handleViewDealDetails}
                />
              </motion.div>
            )}

            {/* Empty State for no deals */}
            {data.allDeals.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 p-8 text-center"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deals Yet</h3>
                <p className="text-gray-500 mb-6">
                  When you get NIL deals, ChatNIL will help you stay protected and compliant.
                </p>
                <button
                  onClick={handleCheckNewDeal}
                  className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  Validate Your First Deal
                </button>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="space-y-6">
            {/* All Deals List */}
            {transformedData.urgentDeals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <UrgentDealsSection
                  deals={transformedData.urgentDeals}
                  onFixIssue={handleFixIssue}
                  onViewDetails={handleViewDealDetails}
                  onSubmitToCompliance={handleSubmitDeal}
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProtectedDealsSection
                deals={transformedData.protectedDeals}
                onViewDetails={handleViewDealDetails}
              />
            </motion.div>
          </div>
        )}

        {activeTab === 'reporting' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SubmissionWorkflow
              deals={data.allDeals.map(d => ({
                id: d.id,
                brandName: d.brandName,
                brandLogo: d.brandLogo,
                value: d.value,
                dealType: d.dealType,
                overallScore: d.overallScore,
                submissionStatus: d.submissionStatus,
                submissionDeadline: d.submissionDeadline,
                submittedAt: d.submittedAt,
                reviewedAt: d.reviewedAt,
                athleteNotes: d.athleteNotes,
                supersededByDealId: d.supersededByDealId,
              }))}
              school={{
                name: data.user.school.name,
                state: data.user.school.state,
                complianceEmail: data.user.school.complianceEmail,
              }}
              onSubmitDeal={handleSubmitDeal}
            />
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showScoreBreakdown && selectedDeal && (
        <ScoreBreakdownModal
          dealId={selectedDeal.id}
          deal={{
            id: selectedDeal.id,
            brandName: selectedDeal.brandName,
            value: selectedDeal.value,
            overallScore: selectedDeal.overallScore,
            dimensions: selectedDeal.dimensions,
            issues: selectedDeal.issues,
          }}
          onClose={handleModalClose}
        />
      )}

      {showUploadContract && selectedDeal && (
        <UploadContractModal
          dealId={selectedDeal.id}
          brandName={selectedDeal.brandName}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {showComplianceSubmit && selectedDeal && (
        <ComplianceSubmissionModal
          dealId={selectedDeal.id}
          brandName={selectedDeal.brandName}
          value={selectedDeal.value}
          disclosureDeadlineDays={data.stateRules.disclosureDeadlineDays}
          stateName={data.stateRules.stateName}
          schoolName={data.user.school.name}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {showFMVExplanation && selectedDeal && (
        <FMVExplanationModal
          dealId={selectedDeal.id}
          brandName={selectedDeal.brandName}
          onClose={handleModalClose}
        />
      )}

      {showGuidelines && (
        <SchoolGuidelinesModal
          stateRules={{
            schoolName: data.user.school.name,
            state: data.stateRules.stateName,
            stateCode: data.stateRules.stateCode,
            disclosureDeadlineDays: data.stateRules.disclosureDeadlineDays,
            nilAllowed: data.stateRules.nilAllowed,
            prohibitedCategories: data.stateRules.prohibitedCategories,
            complianceEmail: data.user.school.complianceEmail,
          }}
          onClose={handleModalClose}
        />
      )}

      {showReminder && (
        <SetReminderModal
          defaultType={reminderData.type as any}
          defaultTitle={reminderData.title}
          defaultDate={reminderData.date}
          relatedDealId={reminderData.dealId}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
