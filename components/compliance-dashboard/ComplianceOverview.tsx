'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { NeedsAttentionList } from './NeedsAttentionList';
import { DeadlineTracker } from './DeadlineTracker';
import { ComplianceStats } from './ComplianceStats';
import { SportBreakdown } from './SportBreakdown';
import { QuickActions } from './QuickActions';
import { Shield, RefreshCw } from 'lucide-react';

interface OverviewData {
  institution: {
    id: string;
    name: string;
    totalAthletes: number;
    lastUpdated: string;
  };
  alerts: {
    redCount: number;
    yellowCount: number;
    athletes: Array<{
      id: string;
      name: string;
      sport: string;
      status: 'red' | 'yellow';
      topIssue: string;
      dealId: string;
      score: number;
    }>;
  };
  deadlines: {
    urgent: number;
    upcoming: number;
    deals: Array<{
      id: string;
      athleteId: string;
      athleteName: string;
      thirdPartyName: string;
      dueInDays: number;
      compensation: number;
    }>;
  };
  stats: {
    green: number;
    yellow: number;
    red: number;
    noDeals: number;
    greenPercent: number;
    yellowPercent: number;
    redPercent: number;
  };
  bySport: Array<{
    sport: string;
    totalAthletes: number;
    greenPercent: number;
    yellowPercent: number;
    redPercent: number;
    hasAlert: boolean;
  }>;
}

export function ComplianceOverview() {
  const router = useRouter();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/compliance/overview', {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. This dashboard is for compliance officers only.');
          return;
        }
        throw new Error('Failed to load dashboard');
      }

      const overviewData = await response.json();
      setData(overviewData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOverviewData();
    setRefreshing(false);
  };

  const handleExportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/compliance/export?format=csv', {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <span className="text-5xl">🛡️</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Access Restricted</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div data-testid="compliance-overview" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Compliance Dashboard</p>
                <h1 className="text-2xl font-bold text-gray-900">{data.institution.name}</h1>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(data.institution.lastUpdated).toLocaleString()}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Alert Banner if there are red issues */}
        {data.alerts.redCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="font-medium text-red-800">
                {data.alerts.redCount} athlete{data.alerts.redCount > 1 ? 's' : ''} with critical compliance issues
              </p>
              <p className="text-sm text-red-600">Immediate review required</p>
            </div>
          </motion.div>
        )}

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Alerts */}
          <div className="lg:col-span-2 space-y-6">
            <NeedsAttentionList
              redCount={data.alerts.redCount}
              yellowCount={data.alerts.yellowCount}
              athletes={data.alerts.athletes}
              onViewAthlete={(id) => router.push(`/compliance/athlete/${id}`)}
              onViewAll={() => router.push('/compliance/athletes')}
            />

            <DeadlineTracker
              urgent={data.deadlines.urgent}
              upcoming={data.deadlines.upcoming}
              deals={data.deadlines.deals}
              onViewDeal={(dealId, athleteId) => router.push(`/compliance/athlete/${athleteId}`)}
            />
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            <ComplianceStats
              green={data.stats.green}
              yellow={data.stats.yellow}
              red={data.stats.red}
              noDeals={data.stats.noDeals}
              greenPercent={data.stats.greenPercent}
              yellowPercent={data.stats.yellowPercent}
              redPercent={data.stats.redPercent}
            />

            <QuickActions
              onViewAllAthletes={() => router.push('/compliance/athletes')}
              onGenerateReport={() => router.push('/compliance/reports')}
              onExportData={handleExportData}
              onSearch={() => router.push('/compliance/athletes?focus=search')}
              onImportAthletes={() => router.push('/compliance/import')}
            />
          </div>
        </div>

        {/* Sport Breakdown */}
        <div className="mt-6">
          <SportBreakdown
            sports={data.bySport}
            onFilterBySport={(sport) => router.push(`/compliance/athletes?sport=${encodeURIComponent(sport)}`)}
          />
        </div>
      </main>
    </div>
  );
}
