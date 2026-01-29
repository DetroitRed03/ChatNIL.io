'use client';

import { motion } from 'framer-motion';
import { Users, FileText, Download, Search, Upload } from 'lucide-react';

interface QuickActionsProps {
  onViewAllAthletes: () => void;
  onGenerateReport: () => void;
  onExportData: () => void;
  onSearch: () => void;
  onImportAthletes?: () => void;
}

export function QuickActions({
  onViewAllAthletes,
  onGenerateReport,
  onExportData,
  onSearch,
  onImportAthletes
}: QuickActionsProps) {
  const actions = [
    {
      icon: Users,
      label: 'View All Athletes',
      description: 'Browse athlete roster',
      onClick: onViewAllAthletes,
      color: 'purple'
    },
    {
      icon: Upload,
      label: 'Import Athletes',
      description: 'Bulk CSV import',
      onClick: onImportAthletes,
      color: 'orange'
    },
    {
      icon: Search,
      label: 'Search Athletes',
      description: 'Find specific athlete',
      onClick: onSearch,
      color: 'blue'
    },
    {
      icon: FileText,
      label: 'NCAA Report',
      description: 'Generate compliance report',
      onClick: onGenerateReport,
      color: 'green'
    },
    {
      icon: Download,
      label: 'Export Data',
      description: 'Download CSV',
      onClick: onExportData,
      color: 'gray'
    }
  ].filter(action => action.onClick !== undefined);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple':
        return 'bg-purple-50 text-purple-600 group-hover:bg-purple-100';
      case 'blue':
        return 'bg-blue-50 text-blue-600 group-hover:bg-blue-100';
      case 'green':
        return 'bg-green-50 text-green-600 group-hover:bg-green-100';
      case 'orange':
        return 'bg-orange-50 text-orange-600 group-hover:bg-orange-100';
      default:
        return 'bg-gray-50 text-gray-600 group-hover:bg-gray-100';
    }
  };

  return (
    <motion.div
      data-testid="quick-actions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
            onClick={action.onClick}
            className="group p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${getColorClasses(action.color)}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-gray-900 text-sm">{action.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
