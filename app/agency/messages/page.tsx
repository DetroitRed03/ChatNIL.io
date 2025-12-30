'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Users, Zap, Calendar, Bell, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AgencyMessagesPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect non-agencies
  useEffect(() => {
    if (user && user.role !== 'agency') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Don't render anything while checking role
  if (!user || user.role !== 'agency') {
    return null;
  }

  return (
    <div className="flex flex-col overflow-y-auto bg-background py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Coming Soon Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <MessageSquare className="h-12 w-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <Zap className="h-4 w-4 text-amber-800" />
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Agency Inbox
        </h1>

        <div className="inline-flex items-center px-4 py-2 bg-orange-100 border border-orange-200 rounded-full text-orange-800 font-medium mb-6">
          <Calendar className="h-4 w-4 mr-2" />
          Coming Soon
        </div>

        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          Connect directly with athletes, negotiate deals, and manage all your conversations in one place.
          Your centralized hub for athlete outreach and partnership communications.
        </p>

        {/* Feature Preview */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            What's Coming
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Direct Athlete Messaging</h3>
                <p className="text-gray-600 text-sm">Reach out to athletes directly from the discover page</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Deal Negotiations</h3>
                <p className="text-gray-600 text-sm">Discuss terms, deliverables, and contracts in-thread</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Smart Notifications</h3>
                <p className="text-gray-600 text-sm">Get notified when athletes respond to your outreach</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Response Analytics</h3>
                <p className="text-gray-600 text-sm">Track response rates and optimize your outreach</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-2">Ready to connect?</h3>
          <p className="mb-4 opacity-90">
            While messaging is in development, explore and save athletes from the Discover page!
          </p>
          <button
            onClick={() => router.push('/agency/discover')}
            className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Discover Athletes
          </button>
        </div>
      </div>
    </div>
  );
}
