'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/lib/stores/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  BarChart3,
  Settings,
  Upload,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface QuickFilterStats {
  critical: number;
  warning: number;
  compliant: number;
}

interface RecentActivity {
  id: string;
  athleteName: string;
  action: string;
  timeAgo: string;
}

export function ComplianceOfficerSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useNavigation();
  const [stats, setStats] = useState<QuickFilterStats>({ critical: 0, warning: 0, compliant: 0 });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [actionItemCount, setActionItemCount] = useState(0);

  // Fetch stats for quick filters
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch('/api/compliance/overview', {
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setStats({
            critical: data.stats?.red || 0,
            warning: data.stats?.yellow || 0,
            compliant: data.stats?.green || 0
          });
          setActionItemCount((data.stats?.red || 0) + (data.stats?.yellow || 0));

          // Extract recent activity from alerts
          if (data.alerts?.athletes) {
            setRecentActivity(
              data.alerts.athletes.slice(0, 3).map((a: any) => ({
                id: a.id,
                athleteName: a.name,
                action: a.status === 'red' ? 'needs urgent review' : 'needs attention',
                timeAgo: 'Recently'
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch compliance stats:', err);
      }
    };

    fetchStats();
  }, []);

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/compliance/dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      label: 'Athletes',
      href: '/compliance/athletes',
      icon: <Users size={20} />
    },
    {
      label: 'Action Items',
      href: '/compliance/dashboard?filter=action',
      icon: <AlertTriangle size={20} />,
      badge: actionItemCount > 0 ? actionItemCount : undefined
    },
    {
      label: 'Reports',
      href: '/compliance/reports',
      icon: <BarChart3 size={20} />
    },
    {
      label: 'Import Athletes',
      href: '/compliance/import',
      icon: <Upload size={20} />
    },
    {
      label: 'Settings',
      href: '/compliance/settings',
      icon: <Settings size={20} />
    },
  ];

  const isActive = (href: string) => {
    if (href.includes('?')) {
      return pathname === href.split('?')[0];
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  // Collapsed sidebar view
  if (sidebarCollapsed) {
    return (
      <aside className="fixed left-0 top-0 w-12 bg-white border-r border-gray-200 min-h-screen flex flex-col z-40 hidden md:flex">
        {/* Logo */}
        <div className="p-2 border-b border-gray-200">
          <Link href="/compliance/dashboard" className="flex items-center justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">CN</span>
            </div>
          </Link>
        </div>

        {/* Collapsed Nav Icons */}
        <nav className="flex-1 py-2">
          <ul className="space-y-1 px-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    relative flex items-center justify-center p-2 rounded-lg
                    transition-colors
                    ${isActive(item.href)
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  title={item.label}
                >
                  {item.icon}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Expand Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={toggleSidebar}
            className="w-full p-2 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center"
            title="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </aside>
    );
  }

  // Expanded sidebar view
  return (
    <aside className="fixed left-0 top-0 w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col z-40 hidden md:flex">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <Link href="/compliance/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CN</span>
          </div>
          <span className="font-semibold text-gray-900">ChatNIL</span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-100 text-gray-500"
          title="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors
                  ${isActive(item.href)
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className={isActive(item.href) ? 'text-orange-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Filters Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Quick Filters
        </div>
        <div className="space-y-1">
          <Link
            href="/compliance/athletes?status=red"
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-gray-700">Critical</span>
            </span>
            <span className="text-gray-500 font-medium">{stats.critical}</span>
          </Link>
          <Link
            href="/compliance/athletes?status=yellow"
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span className="text-gray-700">Warning</span>
            </span>
            <span className="text-gray-500 font-medium">{stats.warning}</span>
          </Link>
          <Link
            href="/compliance/athletes?status=green"
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-gray-700">Compliant</span>
            </span>
            <span className="text-gray-500 font-medium">{stats.compliant}</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            <Activity size={12} />
            <span>Recent Activity</span>
          </div>
          <div className="space-y-3 text-sm">
            {recentActivity.map((activity) => (
              <Link
                key={activity.id}
                href={`/compliance/athlete/${activity.id}`}
                className="block text-gray-600 hover:text-gray-900"
              >
                <span className="font-medium text-gray-900">{activity.athleteName}</span>
                {' '}{activity.action}
                <div className="text-xs text-gray-400 mt-0.5">{activity.timeAgo}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
