'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, CheckCircle, Shield, User, Mail, Clock } from 'lucide-react';

interface AthleteHeaderProps {
  name: string;
  sport: string;
  year: string;
  institution: string;
  athleteId: string;
  email?: string;
  overallStatus: 'green' | 'yellow' | 'red' | null;
  totalDeals?: number;
}

export function AthleteHeader({
  name,
  sport,
  year,
  institution,
  athleteId,
  email,
  overallStatus,
  totalDeals = 0,
}: AthleteHeaderProps) {
  const getStatusBadge = () => {
    if (!overallStatus) {
      if (totalDeals > 0) {
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            <Clock className="w-4 h-4" />
            {totalDeals} Deal{totalDeals !== 1 ? 's' : ''} - Pending Score
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
          <Shield className="w-4 h-4" />
          No Deals
        </span>
      );
    }

    switch (overallStatus) {
      case 'red':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-full">
            <AlertTriangle className="w-4 h-4" />
            CRITICAL
          </span>
        );
      case 'yellow':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
            <AlertCircle className="w-4 h-4" />
            NEEDS REVIEW
          </span>
        );
      case 'green':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-full">
            <CheckCircle className="w-4 h-4" />
            COMPLIANT
          </span>
        );
    }
  };

  const getStatusBorderColor = () => {
    switch (overallStatus) {
      case 'red':
        return 'border-l-red-500';
      case 'yellow':
        return 'border-l-amber-500';
      case 'green':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  return (
    <motion.div
      data-testid="athlete-header"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border border-gray-200 border-l-4 ${getStatusBorderColor()} shadow-sm p-6`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-purple-600" />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              {getStatusBadge()}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600">
              <span>{sport}</span>
              <span className="text-gray-300">•</span>
              <span>{year}</span>
              <span className="text-gray-300">•</span>
              <span>{institution}</span>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                {athleteId}
              </span>
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                >
                  <Mail className="w-4 h-4" />
                  {email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
