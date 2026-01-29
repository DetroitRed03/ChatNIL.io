'use client';

import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle2 } from 'lucide-react';

interface RecommendationListProps {
  recommendations: string[];
  title?: string;
}

export function RecommendationList({ recommendations, title = 'Recommendations' }: RecommendationListProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      data-testid="recommendation-list"
      className="bg-blue-50 border border-blue-200 rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">{title}</h3>
      </div>

      <ul className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
            className="flex items-start gap-3 text-sm text-blue-800"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>{recommendation}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
