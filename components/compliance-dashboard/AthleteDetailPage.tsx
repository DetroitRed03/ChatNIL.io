'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { AthleteHeader } from './AthleteHeader';
import { ComplianceSummaryCard } from './ComplianceSummaryCard';
import { AthleteDealsList } from './AthleteDealsList';
import { OverridePanel } from './OverridePanel';
import { AuditTrail } from './AuditTrail';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface AIAnalysisResult {
  enabled: boolean;
  analyzed: boolean;
  contractDetected: boolean;
  confidence: number;
  redFlags: Array<{
    issue: string;
    severity: 'critical' | 'warning' | 'info';
    excerpt?: string;
    recommendation: string;
  }>;
  keyTerms: Array<{
    term: string;
    value: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  summary: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  analyzedAt: string;
}

interface AthleteDeal {
  id: string;
  thirdPartyName: string;
  compensation: number;
  score: number | null;
  status: 'green' | 'yellow' | 'red' | 'pending';
  dealStatus: 'active' | 'completed' | 'review';
  topIssue: string | null;
  submittedAt: string;
  hasOverride: boolean;
  aiAnalysis?: AIAnalysisResult | null;
  aiAnalysisEnabled?: boolean;
}

interface AuditEntry {
  id: string;
  action: string;
  details: string;
  actor: 'system' | 'athlete' | 'officer';
  actorName?: string;
  timestamp: string;
}

interface AthleteDetailData {
  athlete: {
    id: string;
    name: string;
    sport: string;
    year: string;
    institution: string;
    athleteId: string;
    email: string;
  };
  compliance: {
    overallStatus: 'green' | 'yellow' | 'red' | null;
    worstScore: number | null;
    riskLevel: 'low' | 'medium' | 'high' | null;
    totalDeals: number;
    totalEarnings: number;
    issueCount: number;
  };
  deals: AthleteDeal[];
  auditTrail: AuditEntry[];
  overrides: Array<{
    id: string;
    dealId: string;
    dealName: string;
    originalStatus: string;
    newStatus: string;
    reason: string;
    officerName: string;
    createdAt: string;
  }>;
}

interface AthleteDetailPageProps {
  athleteId: string;
}

export function AthleteDetailPage({ athleteId }: AthleteDetailPageProps) {
  const router = useRouter();
  const [data, setData] = useState<AthleteDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);

  const fetchAthleteData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch(`/api/compliance/athlete/${athleteId}`, {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. You do not have permission to view this athlete.');
          return;
        }
        if (response.status === 404) {
          setError('Athlete not found.');
          return;
        }
        throw new Error('Failed to load athlete details');
      }

      const athleteData = await response.json();
      setData(athleteData);
    } catch (err) {
      console.error('Fetch athlete error:', err);
      setError('Failed to load athlete details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [athleteId]);

  useEffect(() => {
    fetchAthleteData();
  }, [fetchAthleteData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAthleteData();
    setRefreshing(false);
  };

  const handleOverride = async (overrideData: { dealId: string; newStatus: 'green' | 'yellow'; reason: string }) => {
    try {
      setOverrideSubmitting(true);

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/compliance/override', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          dealId: overrideData.dealId,
          athleteId,
          newStatus: overrideData.newStatus,
          reason: overrideData.reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit override');
      }

      // Refresh data after successful override
      await fetchAthleteData();
    } catch (err) {
      console.error('Override error:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit override');
    } finally {
      setOverrideSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading athlete details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Error</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => router.push('/compliance/athletes')}
            className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Athletes
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div data-testid="athlete-detail-page" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/compliance/athletes')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Athletes
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Athlete Header */}
        <AthleteHeader
          name={data.athlete.name}
          sport={data.athlete.sport}
          year={data.athlete.year}
          institution={data.athlete.institution}
          athleteId={data.athlete.athleteId}
          email={data.athlete.email}
          overallStatus={data.compliance.overallStatus}
          totalDeals={data.compliance.totalDeals}
        />

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Deals */}
          <div className="lg:col-span-2 space-y-6">
            <AthleteDealsList
              deals={data.deals}
              onReviewDeal={(dealId) => router.push(`/compliance/deals/${dealId}/review`)}
            />

            <AuditTrail
              entries={data.auditTrail}
              limit={10}
            />
          </div>

          {/* Right Column - Summary & Override */}
          <div className="space-y-6">
            <ComplianceSummaryCard
              overallStatus={data.compliance.overallStatus}
              worstScore={data.compliance.worstScore}
              riskLevel={data.compliance.riskLevel}
              totalDeals={data.compliance.totalDeals}
              totalEarnings={data.compliance.totalEarnings}
              issueCount={data.compliance.issueCount}
            />

            <OverridePanel
              deals={data.deals}
              onOverride={handleOverride}
              isSubmitting={overrideSubmitting}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
