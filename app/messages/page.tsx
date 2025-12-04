'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Users, Zap, Calendar, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect agency/business users to their dedicated messaging page
  useEffect(() => {
    if (user?.role === 'agency' || user?.role === 'business') {
      router.replace('/agencies/messages');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  // Don't render anything while checking role or if agency/business (will redirect)
  if (!user || user.role === 'agency' || user.role === 'business') {
    return null;
  }

  return (
    <>
      <div className="flex flex-col overflow-y-auto bg-background py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Coming Soon Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <MessageSquare className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Zap className="h-4 w-4 text-yellow-800" />
            </div>
          </div>

          {/* Main Content */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Inbox Messages
          </h1>

          <div className="inline-flex items-center px-4 py-2 bg-orange-100 border border-orange-200 rounded-full text-orange-800 font-medium mb-6">
            <Calendar className="h-4 w-4 mr-2" />
            Coming Soon
          </div>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Connect directly with fellow athletes, coaches, parents, and businesses.
            Send messages, share opportunities, and build your NIL network.
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
                  <h3 className="font-semibold text-gray-900 mb-1">Direct Messaging</h3>
                  <p className="text-gray-600 text-sm">Send private messages to other users on the platform</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Smart Notifications</h3>
                  <p className="text-gray-600 text-sm">Get notified about new messages and opportunities</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Group Conversations</h3>
                  <p className="text-gray-600 text-sm">Create group chats for team discussions and collaborations</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quick Actions</h3>
                  <p className="text-gray-600 text-sm">Share opportunities, schedule meetings, and more</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-2">Want early access?</h3>
            <p className="mb-4 opacity-90">
              Complete your profile to be notified when messaging launches!
            </p>
            <button
              onClick={() => window.location.href = '/profile'}
              className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}