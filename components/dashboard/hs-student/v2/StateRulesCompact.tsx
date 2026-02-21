'use client';

import { motion } from 'framer-motion';

interface StateRulesCompactProps {
  state: string;
  stateCode: string;
  canDo: string[];
  mustDo?: string[];
  watchOut: string[];
  prohibited: string[];
  onLearnMore: () => void;
}

export function StateRulesCompact({
  state,
  stateCode,
  canDo,
  mustDo = [],
  watchOut,
  prohibited,
  onLearnMore,
}: StateRulesCompactProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🏈</span>
        <h3 className="font-bold text-gray-900">{state} NIL Rules</h3>
      </div>

      <div className="space-y-3">
        {/* Can Do */}
        {canDo.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✅</span>
            <p className="text-sm text-gray-600">{canDo[0]}</p>
          </div>
        )}

        {/* Must Do */}
        {mustDo.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">📋</span>
            <p className="text-sm text-gray-600">{mustDo[0]}</p>
          </div>
        )}

        {/* Watch Out */}
        {watchOut.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">⚠️</span>
            <p className="text-sm text-gray-600">{watchOut[0]}</p>
          </div>
        )}

        {/* Prohibited */}
        {prohibited.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">🚫</span>
            <p className="text-sm text-gray-600">{prohibited[0]}</p>
          </div>
        )}
      </div>

      <button
        onClick={onLearnMore}
        className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
      >
        Learn More
        <span>→</span>
      </button>
    </motion.div>
  );
}
