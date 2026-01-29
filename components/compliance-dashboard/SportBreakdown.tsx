'use client';

import { motion } from 'framer-motion';
import { Trophy, AlertTriangle } from 'lucide-react';

interface SportStat {
  sport: string;
  totalAthletes: number;
  greenPercent: number;
  yellowPercent: number;
  redPercent: number;
  hasAlert: boolean;
}

interface SportBreakdownProps {
  sports: SportStat[];
  onFilterBySport: (sport: string) => void;
}

export function SportBreakdown({ sports, onFilterBySport }: SportBreakdownProps) {
  return (
    <motion.div
      data-testid="sport-breakdown"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">By Sport</h2>
            <p className="text-sm text-gray-500">Compliance breakdown</p>
          </div>
        </div>
      </div>

      {/* Sport List */}
      <div className="divide-y divide-gray-100">
        {sports.length === 0 ? (
          <div className="p-8 text-center">
            <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No sports data available</p>
          </div>
        ) : (
          sports.map((sport, index) => (
            <motion.button
              key={sport.sport}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onFilterBySport(sport.sport)}
              className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{sport.sport}</span>
                  {sport.hasAlert && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <span className="text-sm text-gray-500">{sport.totalAthletes} athletes</span>
              </div>

              {/* Stacked bar */}
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                {sport.greenPercent > 0 && (
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${sport.greenPercent}%` }}
                  />
                )}
                {sport.yellowPercent > 0 && (
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${sport.yellowPercent}%` }}
                  />
                )}
                {sport.redPercent > 0 && (
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${sport.redPercent}%` }}
                  />
                )}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  {sport.greenPercent}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-500 rounded-full" />
                  {sport.yellowPercent}%
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  {sport.redPercent}%
                </span>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
}
