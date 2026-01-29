'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useSessionTracking } from '@/lib/hooks/useSessionTracking';
import { StatusSummary } from './StatusSummary';
import { ChildOverviewCard } from './ChildOverviewCard';
import { ActivityFeed } from './ActivityFeed';
import { ConversationStarters } from './ConversationStarters';
import { NextMilestone } from './NextMilestone';
import { FamilyAccess } from './FamilyAccess';
import { TrustAndSafety } from './TrustAndSafety';
import { InviteCoParentModal } from './modals/InviteCoParentModal';
import { ParentalControlsModal } from './modals/ParentalControlsModal';
import { RevokeAccessModal } from './modals/RevokeAccessModal';

interface Child {
  id: string;
  name: string;
  email: string;
  school: string;
  sport: string;
  grade: string;
  state: string;
  status: 'active' | 'inactive' | 'suspended';
  isOnline: boolean;
  lastActive: string;
  currentChapter: string;
  currentChapterTitle: string;
  progressPercent: number;
  questionsCompleted: number;
  questionsTotal: number;
  badgesEarned: number;
  currentStreak: number;
  nextMilestone: {
    type: string;
    name: string;
    description: string;
    progress: number;
    total: number;
  } | null;
}

interface ActionItem {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
}

interface Activity {
  id: string;
  childId: string;
  childName: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: string;
  role: 'admin' | 'viewer';
  status: 'active' | 'pending';
}

interface DashboardData {
  parent: {
    id: string;
    name: string;
    email: string;
  };
  children: Child[];
  actionItems: ActionItem[];
  recentActivity: Activity[];
  familyMembers: FamilyMember[];
}

export function ParentDashboardV2() {
  const router = useRouter();
  const { user, isLoading: authLoading, isLoadingProfile, isReady: authReady } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // Prevent hydration flash - only render content after client mount
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track session for online status
  useSessionTracking({ enabled: !!user });

  // Modal states
  const [showInviteCoParent, setShowInviteCoParent] = useState(false);
  const [showParentalControls, setShowParentalControls] = useState(false);
  const [showRevokeAccess, setShowRevokeAccess] = useState(false);

  // Define fetchDashboard BEFORE the useEffect that uses it
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      // Get access token from Supabase session (same pattern as HS student dashboard)
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch('/api/parent/dashboard', {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        } : {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.error('Dashboard API error:', res.status, res.statusText);
        setFetchAttempted(true);
        setLoading(false);
        return;
      }

      const json = await res.json();
      if (json.parent) {
        setData(json);
        if (json.children?.length > 0) {
          setSelectedChild(prev => prev || json.children[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
      setFetchAttempted(true);
    }
  }, []);

  useEffect(() => {
    // Wait for auth to complete before fetching
    if (authLoading) return;

    // If no user after auth completes, stop loading
    if (!user) {
      setLoading(false);
      setFetchAttempted(true);
      return;
    }

    // User is available, fetch dashboard
    fetchDashboard();

    // Poll for updates every 60 seconds
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, [user, authLoading, fetchDashboard]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Show loading while:
  // - Component hasn't mounted yet (prevents hydration flash)
  // - Auth is still initializing (!authReady)
  // - Auth is loading (authLoading)
  // - Profile is still loading (isLoadingProfile)
  // - Dashboard data is loading (loading)
  // - Auth finished but we haven't attempted to fetch yet
  if (!mounted || !authReady || authLoading || isLoadingProfile || loading || (!user && !fetchAttempted)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Only show login prompt when mounted, auth is fully ready, profile done loading, and user is confirmed null
  if (!user && mounted && authReady && !isLoadingProfile && fetchAttempted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-gray-500">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

  if (!data || !data.parent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="text-gray-500">Failed to load dashboard</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 text-purple-600 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Ensure required arrays exist with defaults
  const children = data.children || [];
  const actionItems = data.actionItems || [];
  const recentActivity = data.recentActivity || [];
  const familyMembers = data.familyMembers || [];
  const parentName = data.parent.name || 'Parent';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Parent Dashboard</p>
            <h1 className="text-2xl font-bold">{getGreeting()}, {parentName.split(' ')[0]}! 👋</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700">
              <span className="text-xl">⚙️</span>
            </button>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold">
                {parentName.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Status Summary - ALWAYS FIRST */}
        <StatusSummary
          actionItems={actionItems}
          children={children}
        />

        {/* Children Section */}
        <div className="mt-6">
          {children.length > 1 && (
            <div className="flex gap-2 mb-4">
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedChild?.id === child.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {child.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}

          {selectedChild && (
            <ChildOverviewCard
              child={selectedChild}
              onViewProgress={() => router.push(`/parent/children/${selectedChild.id}`)}
              onParentalControls={() => setShowParentalControls(true)}
            />
          )}
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Activity Feed */}
            <ActivityFeed
              activities={recentActivity}
              childName={selectedChild?.name || 'Your child'}
              onViewAll={() => selectedChild && router.push(`/parent/children/${selectedChild.id}/activity`)}
            />

            {/* Next Milestone */}
            {selectedChild?.nextMilestone && (
              <NextMilestone milestone={selectedChild.nextMilestone} />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Conversation Starters */}
            <ConversationStarters
              childName={selectedChild?.name.split(' ')[0] || 'your child'}
              currentChapter={selectedChild?.currentChapter || 'identity'}
            />

            {/* Family Access */}
            <FamilyAccess
              members={familyMembers}
              onInvite={() => setShowInviteCoParent(true)}
            />
          </div>
        </div>

        {/* Trust & Safety - Full Width at Bottom */}
        <div className="mt-6">
          <TrustAndSafety
            onPrivacySettings={() => router.push('/parent/settings')}
            onViewAsChild={() => selectedChild && router.push(`/dashboard/hs-student?preview=${selectedChild.id}`)}
            onRevokeAccess={() => setShowRevokeAccess(true)}
          />
        </div>
      </main>

      {/* Modals */}
      <InviteCoParentModal
        isOpen={showInviteCoParent}
        onClose={() => setShowInviteCoParent(false)}
        childId={selectedChild?.id || ''}
        childName={selectedChild?.name || ''}
        onSuccess={fetchDashboard}
      />

      <ParentalControlsModal
        isOpen={showParentalControls}
        onClose={() => setShowParentalControls(false)}
        child={selectedChild}
        onUpdate={fetchDashboard}
      />

      <RevokeAccessModal
        isOpen={showRevokeAccess}
        onClose={() => setShowRevokeAccess(false)}
        child={selectedChild}
        onRevoke={fetchDashboard}
      />
    </div>
  );
}

export default ParentDashboardV2;
