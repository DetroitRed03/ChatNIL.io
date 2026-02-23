'use client';

import { cn } from '@/lib/utils';

interface Tab {
  id: string;
  label: string;
  badge?: number;
  icon?: React.ReactNode;
}

interface MobileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabs({ tabs, activeTab, onChange, className = '' }: MobileTabsProps) {
  return (
    <>
      {/* Mobile: Horizontal scroll pills */}
      <div className={cn('md:hidden overflow-x-auto hide-scrollbar -mx-4 px-4', className)}>
        <div className="flex gap-1 min-w-max pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium',
                'whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    activeTab === tab.id ? 'bg-white/20' : 'bg-orange-100 text-orange-600'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Underline tabs */}
      <div className={cn('hidden md:block border-b', className)}>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium',
                'border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-600">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
