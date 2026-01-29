'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ScoreBadgeProps {
  totalScore: number;
  status: 'green' | 'yellow' | 'red';
  issues?: string[];
}

export function ScoreBadge({ totalScore, status, issues = [] }: ScoreBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
          status === 'green' ? 'bg-green-100 text-green-700' :
          status === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}
      >
        {status === 'green' ? <CheckCircle className="w-3 h-3" /> :
         status === 'yellow' ? <AlertTriangle className="w-3 h-3" /> :
         <XCircle className="w-3 h-3" />}
        {totalScore}/100
      </button>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
            <div className="font-medium mb-2">
              {status === 'green' ? 'Compliant' :
               status === 'yellow' ? 'Needs Review' :
               'Critical Issues'}
            </div>
            {issues.length > 0 ? (
              <>
                {issues.slice(0, 3).map((issue, i) => (
                  <div key={i} className="text-gray-300">• {issue}</div>
                ))}
                {issues.length > 3 && (
                  <div className="text-gray-400 mt-1">+{issues.length - 3} more</div>
                )}
              </>
            ) : (
              <div className="text-gray-300">
                {status === 'green' ? 'All checks passed' : 'Click to view details'}
              </div>
            )}
          </div>
          <div className="w-2 h-2 bg-gray-900 transform rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  );
}
