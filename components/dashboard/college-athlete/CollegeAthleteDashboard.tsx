'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ComplianceStatusBanner } from './ComplianceStatusBanner';
import { DealValidationCTA } from './DealValidationCTA';
import { DealsListCard } from './DealsListCard';
import { TaxTrackerCard } from './TaxTrackerCard';
import { CollegeStateRulesCard } from './CollegeStateRulesCard';
import { RecentActivityFeed } from './RecentActivityFeed';
import { ValidateDealModal } from './ValidateDealModal';

interface DashboardData {
  user: {
    id: string;
    fullName: string;
    sport: string;
    school: string;
    state: string;
    avatar?: string;
  };
  compliance: {
    status: 'green' | 'yellow' | 'red';
    activeDeals: number;
    totalEarnings: number;
    issueCount: number;
  };
  deals: Array<{
    id: string;
    brandName: string;
    dealType: string;
    compensation: number;
    complianceScore: number;
    status: 'active' | 'completed' | 'pending' | 'review';
    issues?: string[];
  }>;
  tax: {
    ytdEarnings: number;
    estimatedTax: number;
    nextQuarterlyDue: string;
  };
  stateRules: {
    stateCode: string;
    stateName: string;
    nilAllowed: boolean;
    disclosureDeadlineDays: number;
    prohibitedCategories: string[];
  };
  recentActivity: Array<{
    id: string;
    type: 'validation' | 'tax_reminder' | 'deal_update';
    message: string;
    timestamp: string;
  }>;
}

export function CollegeAthleteDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get access token for API auth
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/dashboard/college-athlete', {
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
    }
  };

  const handleValidationComplete = () => {
    setIsValidateModalOpen(false);
    fetchDashboardData(); // Refresh data after validation
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-gray-200 rounded-xl" />
            <div className="h-32 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-200 rounded-xl w-48" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-48 bg-gray-200 rounded-xl" />
              <div className="h-48 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const firstName = data.user.fullName?.split(' ')[0] || 'Athlete';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {firstName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {firstName}
              </h1>
              <p className="text-gray-500">
                {data.user.school} • {data.user.sport} • {data.user.state}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Compliance Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ComplianceStatusBanner
            status={data.compliance.status}
            activeDeals={data.compliance.activeDeals}
            totalEarnings={data.compliance.totalEarnings}
            issueCount={data.compliance.issueCount}
          />
        </motion.div>

        {/* Validate New Deal CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DealValidationCTA onClick={() => setIsValidateModalOpen(true)} />
        </motion.div>

        {/* Deals List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DealsListCard
            deals={data.deals}
            onDealClick={(dealId) => console.log('View deal:', dealId)}
          />
        </motion.div>

        {/* Two Column: Tax Tracker + State Rules */}
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TaxTrackerCard
              ytdEarnings={data.tax.ytdEarnings}
              estimatedTax={data.tax.estimatedTax}
              nextQuarterlyDue={data.tax.nextQuarterlyDue}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CollegeStateRulesCard
              stateCode={data.stateRules.stateCode}
              stateName={data.stateRules.stateName}
              nilAllowed={data.stateRules.nilAllowed}
              disclosureDeadlineDays={data.stateRules.disclosureDeadlineDays}
              prohibitedCategories={data.stateRules.prohibitedCategories}
            />
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <RecentActivityFeed activities={data.recentActivity} />
        </motion.div>
      </div>

      {/* Validate Deal Modal */}
      <ValidateDealModal
        isOpen={isValidateModalOpen}
        onClose={() => setIsValidateModalOpen(false)}
        onValidationComplete={handleValidationComplete}
        athleteId={data.user.id}
        athleteState={data.user.state}
      />
    </div>
  );
}
