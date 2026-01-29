'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface StateRule {
  title: string;
  description: string;
  status: 'allowed' | 'restricted' | 'prohibited';
}

interface StateRulesCardProps {
  stateName: string;
  stateCode: string;
  rules?: StateRule[];
  lastUpdated?: string;
}

// Default rules - would be fetched from API based on state
const defaultRules: Record<string, StateRule[]> = {
  CA: [
    { title: 'NIL Deals Allowed', description: 'HS athletes can earn from NIL with parental consent', status: 'allowed' },
    { title: 'School Logos', description: 'Cannot use school logos without permission', status: 'restricted' },
    { title: 'Agent Representation', description: 'Must be licensed agents only', status: 'restricted' },
    { title: 'Academic Requirements', description: 'Must maintain minimum GPA', status: 'restricted' },
  ],
  TX: [
    { title: 'NIL Deals Allowed', description: 'HS athletes can earn from NIL', status: 'allowed' },
    { title: 'No School Involvement', description: 'Schools cannot facilitate deals', status: 'restricted' },
    { title: 'Disclosure Required', description: 'Must disclose deals to school', status: 'restricted' },
  ],
  FL: [
    { title: 'Full NIL Rights', description: 'HS athletes have full NIL rights', status: 'allowed' },
    { title: 'Parent Consent Under 18', description: 'Parental consent required for minors', status: 'restricted' },
  ],
};

const statusColors = {
  allowed: 'bg-green-100 text-green-800 border-green-200',
  restricted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  prohibited: 'bg-red-100 text-red-800 border-red-200',
};

const statusIcons = {
  allowed: '✓',
  restricted: '⚠',
  prohibited: '✕',
};

export function StateRulesCard({
  stateName,
  stateCode,
  rules,
  lastUpdated,
}: StateRulesCardProps) {
  const [expanded, setExpanded] = useState(false);
  const stateRules = rules || defaultRules[stateCode] || defaultRules.CA;
  const displayRules = expanded ? stateRules : stateRules.slice(0, 2);

  return (
    <div data-testid="state-rules-card" className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">📜</span>
          </div>
          <div>
            <h3 data-testid="state-name" className="font-semibold text-gray-900">{stateName} NIL Rules</h3>
            <p className="text-xs text-gray-500">
              {lastUpdated ? `Updated ${lastUpdated}` : 'High School Regulations'}
            </p>
          </div>
        </div>
        <span data-testid="state-code" className="text-2xl font-bold text-blue-600">{stateCode}</span>
      </div>

      <div className="space-y-2">
        {displayRules.map((rule, index) => (
          <motion.div
            key={rule.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg border ${statusColors[rule.status]}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm">{statusIcons[rule.status]}</span>
              <div>
                <p className="font-medium text-sm">{rule.title}</p>
                <p className="text-xs opacity-80">{rule.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {stateRules.length > 2 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {expanded ? 'Show less' : `Show ${stateRules.length - 2} more rules`}
        </button>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <a
          data-testid="learn-more-link"
          href={`/learn/state-rules/${stateCode.toLowerCase()}`}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
        >
          Learn more about {stateName} NIL rules
          <span>→</span>
        </a>
      </div>
    </div>
  );
}
