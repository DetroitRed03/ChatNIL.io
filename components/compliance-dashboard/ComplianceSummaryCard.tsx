'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle, DollarSign, FileText, TrendingUp } from 'lucide-react';

interface ComplianceSummaryCardProps {
  overallStatus: 'green' | 'yellow' | 'red' | null;
  worstScore: number | null;
  riskLevel: 'low' | 'medium' | 'high' | null;
  totalDeals: number;
  totalEarnings: number;
  issueCount: number;
}

export function ComplianceSummaryCard({
  overallStatus,
  worstScore,
  riskLevel,
  totalDeals,
  totalEarnings,
  issueCount
}: ComplianceSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = () => {
    switch (overallStatus) {
      case 'red':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'yellow':
        return <AlertCircle className="w-6 h-6 text-amber-500" />;
      case 'green':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <FileText className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (overallStatus) {
      case 'red':
        return 'Critical Issues';
      case 'yellow':
        return 'Needs Review';
      case 'green':
        return 'Fully Compliant';
      default:
        return totalDeals > 0 ? 'Pending Score' : 'No Deals';
    }
  };

  const getStatusColor = () => {
    switch (overallStatus) {
      case 'red':
        return 'bg-red-50 border-red-200';
      case 'yellow':
        return 'bg-amber-50 border-amber-200';
      case 'green':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getRiskBadge = () => {
    if (!riskLevel || riskLevel === 'low') return null;

    return (
      <div className={`mt-3 p-3 rounded-lg ${riskLevel === 'high' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 ${riskLevel === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
          <span className={`text-sm font-medium ${riskLevel === 'high' ? 'text-red-700' : 'text-amber-700'}`}>
            {riskLevel === 'high' ? 'High' : 'Medium'} Pay-for-Play Risk
          </span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      data-testid="compliance-summary-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance Summary</h2>

      {/* Status Card */}
      <div className={`p-4 rounded-xl border ${getStatusColor()}`}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium text-gray-900">{getStatusText()}</p>
            {worstScore !== null && (
              <p className="text-sm text-gray-600">Lowest Score: {worstScore}</p>
            )}
          </div>
        </div>
        {getRiskBadge()}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalDeals}</p>
          <p className="text-xs text-gray-500">Total Deals</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {totalEarnings > 0 ? formatCurrency(totalEarnings).replace('$', '') : '0'}
          </p>
          <p className="text-xs text-gray-500">Total Earnings</p>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className={`w-5 h-5 ${issueCount > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <p className={`text-2xl font-bold ${issueCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {issueCount}
          </p>
          <p className="text-xs text-gray-500">Issues</p>
        </div>
      </div>
    </motion.div>
  );
}
