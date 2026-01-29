'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a Tabs component');
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

function Tabs({ defaultValue, value, onValueChange, children, className, ...props }: TabsProps) {
  const [internalTab, setInternalTab] = React.useState(defaultValue || value || '');

  // Support controlled mode
  const selectedTab = value !== undefined ? value : internalTab;
  const setSelectedTab = (newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue);
    }
    if (value === undefined) {
      setInternalTab(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-gray-200 p-1',
        className
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { selectedTab, setSelectedTab } = useTabs();
  const isSelected = selectedTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-background-card text-text-primary shadow-sm'
          : 'text-text-tertiary hover:text-text-secondary',
        className
      )}
      onClick={() => setSelectedTab(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { selectedTab } = useTabs();

  if (selectedTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn('mt-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
