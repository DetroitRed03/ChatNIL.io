'use client';

import { motion } from 'framer-motion';
import { Scale, Clock, XCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface CollegeStateRulesCardProps {
  stateCode: string;
  stateName: string;
  nilAllowed: boolean;
  disclosureDeadlineDays: number;
  prohibitedCategories: string[];
}

export function CollegeStateRulesCard({
  stateCode,
  stateName,
  nilAllowed,
  disclosureDeadlineDays,
  prohibitedCategories,
}: CollegeStateRulesCardProps) {
  return (
    <motion.div
      data-testid="college-state-rules-card"
      className="bg-white rounded-xl border border-gray-200 p-5 h-full"
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{stateName} Rules</h3>
            <p className="text-xs text-gray-500">College NIL Regulations</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-blue-600">{stateCode}</span>
      </div>

      <div className="space-y-3">
        {/* NIL Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">NIL Allowed</span>
          <span className={`font-medium ${nilAllowed ? 'text-green-600' : 'text-red-600'}`}>
            {nilAllowed ? '✓ Yes' : '✕ No'}
          </span>
        </div>

        {/* Disclosure Deadline */}
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <Clock className="w-4 h-4 text-amber-600" />
          <div className="text-sm">
            <span className="text-amber-800 font-medium">
              Report within {disclosureDeadlineDays} days
            </span>
            <p className="text-xs text-amber-700">
              Disclose new deals to your school compliance office
            </p>
          </div>
        </div>

        {/* Prohibited Categories */}
        {prohibitedCategories.length > 0 && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Prohibited Categories</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {prohibitedCategories.map((category) => (
                <span
                  key={category}
                  className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full capitalize"
                >
                  {category.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link
        href={`/learn/state-rules/${stateCode.toLowerCase()}`}
        className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
      >
        View Full {stateName} Rules
        <ExternalLink className="w-3 h-3" />
      </Link>
    </motion.div>
  );
}
