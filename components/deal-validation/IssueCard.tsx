'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, XCircle } from 'lucide-react';

interface IssueCardProps {
  type: 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  delay?: number;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    colors: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-500',
  },
  error: {
    icon: AlertCircle,
    colors: 'bg-orange-50 border-orange-200 text-orange-800',
    iconColor: 'text-orange-500',
  },
  critical: {
    icon: XCircle,
    colors: 'bg-red-50 border-red-200 text-red-800',
    iconColor: 'text-red-500',
  },
};

export function IssueCard({ type, title, description, delay = 0 }: IssueCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      data-testid="issue-card"
      className={`p-4 rounded-xl border ${config.colors}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm mt-1 opacity-80">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
