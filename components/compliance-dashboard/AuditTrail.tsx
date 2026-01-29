'use client';

import { motion } from 'framer-motion';
import { Settings, User, Shield, Clock, ChevronRight } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  details: string;
  actor: 'system' | 'athlete' | 'officer';
  actorName?: string;
  timestamp: string;
}

interface AuditTrailProps {
  entries: AuditEntry[];
  limit?: number;
  onViewAll?: () => void;
}

export function AuditTrail({ entries, limit = 10, onViewAll }: AuditTrailProps) {
  const displayedEntries = entries.slice(0, limit);
  const hasMore = entries.length > limit;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getActorIcon = (actor: string) => {
    switch (actor) {
      case 'system':
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Settings className="w-4 h-4 text-gray-500" />
          </div>
        );
      case 'athlete':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-500" />
          </div>
        );
      case 'officer':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Clock className="w-4 h-4 text-gray-500" />
          </div>
        );
    }
  };

  const getActorLabel = (entry: AuditEntry) => {
    switch (entry.actor) {
      case 'system':
        return 'System';
      case 'athlete':
        return entry.actorName || 'Athlete';
      case 'officer':
        return entry.actorName || 'Compliance Officer';
      default:
        return 'Unknown';
    }
  };

  return (
    <motion.div
      data-testid="audit-trail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm"
    >
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
            <p className="text-sm text-gray-500">{entries.length} recorded actions</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {displayedEntries.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No audit entries yet</p>
          </div>
        ) : (
          displayedEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="p-4 flex items-start gap-3"
            >
              {getActorIcon(entry.actor)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {getActorLabel(entry)}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{formatDate(entry.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-600">{entry.details}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {hasMore && onViewAll && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onViewAll}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            View All {entries.length} Entries
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
