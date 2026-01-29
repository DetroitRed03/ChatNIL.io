'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ChildCard, ChildSummary } from './ChildCard';
import { ParentActivityFeed, ActivityItem } from './ParentActivityFeed';
import { NotificationSettings, NotificationPrefs } from './NotificationSettings';
import { AboutChatNIL } from './AboutChatNIL';
import { ConsentManager } from './ConsentManager';
import { ChildProgressView } from './ChildProgressView';

interface ParentDashboardData {
  parent: {
    id: string;
    fullName: string;
    email: string;
  };
  children: ChildSummary[];
  recentActivity: ActivityItem[];
  notificationPreferences: NotificationPrefs;
}

export function ParentDashboard() {
  const [data, setData] = useState<ParentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildForConsent, setSelectedChildForConsent] = useState<ChildSummary | null>(null);
  const [selectedChildForProgress, setSelectedChildForProgress] = useState<ChildSummary | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const response = await fetch('/api/parent/dashboard', {
        credentials: 'include',
        headers: accessToken ? {
          'Authorization': `Bearer ${accessToken}`,
        } : {},
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. This dashboard is for parents only.');
          return;
        }
        throw new Error('Failed to load dashboard');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async (preferences: NotificationPrefs) => {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const response = await fetch('/api/parent/notifications', {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to save preferences');
    }

    setData(prev => prev ? { ...prev, notificationPreferences: preferences } : null);
  };

  const handleConsentAction = async (childId: string, action: 'approve' | 'deny' | 'revoke') => {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const response = await fetch('/api/parent/consent', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ childId, action }),
    });

    if (!response.ok) {
      throw new Error('Failed to update consent');
    }

    // Refresh data
    await fetchDashboardData();
  };

  // Generate detailed progress for a child (in production, fetch from API)
  const getDetailedProgress = (child: ChildSummary) => {
    const pillars = ['identity', 'business', 'money', 'legacy'];
    return {
      pillars: pillars.map(name => ({
        name,
        status: child.learningProgress.pillarsCompleted.includes(name)
          ? 'completed' as const
          : child.learningProgress.currentPillar === name
          ? 'in_progress' as const
          : 'locked' as const,
        progress: child.learningProgress.pillarsCompleted.includes(name)
          ? 100
          : child.learningProgress.currentPillar === name
          ? Math.round((child.learningProgress.percentage % 25) * 4)
          : 0,
        quizScore: child.learningProgress.pillarsCompleted.includes(name) ? 85 : undefined,
      })),
      badges: child.learningProgress.badgesEarned > 0
        ? [
            { id: '1', name: 'Identity Explorer', icon: '🎯', earnedAt: new Date().toISOString() },
            { id: '2', name: 'First Steps', icon: '🏅', earnedAt: new Date().toISOString() },
          ].slice(0, child.learningProgress.badgesEarned)
        : [],
      streakHistory: [true, true, true, true, true, false, false].slice(0, 7),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <span className="text-5xl">😕</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">Oops!</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div data-testid="parent-dashboard" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-gray-500 mb-1">Parent Dashboard</p>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {data.parent.fullName}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Children Section */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Children</h2>
          <div className="space-y-4">
            {data.children.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-500">No children linked to your account yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Children will appear here once they add your email as their parent.
                </p>
              </div>
            ) : (
              data.children.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ChildCard
                    child={child}
                    onViewProgress={() => setSelectedChildForProgress(child)}
                    onManageConsent={() => setSelectedChildForConsent(child)}
                  />
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <ParentActivityFeed
            activities={data.recentActivity}
            onViewAll={() => console.log('View all activity')}
          />

          {/* Notification Settings */}
          <NotificationSettings
            preferences={data.notificationPreferences}
            onSave={handleSaveNotifications}
          />
        </div>

        {/* About Section */}
        <AboutChatNIL
          onLearnMore={() => window.open('https://chatnil.com/about', '_blank')}
        />
      </main>

      {/* Consent Manager Modal */}
      {selectedChildForConsent && (
        <ConsentManager
          child={selectedChildForConsent}
          onApprove={() => handleConsentAction(selectedChildForConsent.id, 'approve')}
          onDeny={() => handleConsentAction(selectedChildForConsent.id, 'deny')}
          onRevoke={() => handleConsentAction(selectedChildForConsent.id, 'revoke')}
          onClose={() => setSelectedChildForConsent(null)}
        />
      )}

      {/* Child Progress View */}
      {selectedChildForProgress && (
        <ChildProgressView
          child={selectedChildForProgress}
          detailedProgress={getDetailedProgress(selectedChildForProgress)}
          onClose={() => setSelectedChildForProgress(null)}
        />
      )}
    </div>
  );
}
