'use client';

import { Plus, Search, FolderOpen, BookOpen, MessageSquare, ChevronLeft, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/lib/stores/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isAthleteRole } from '@/types/common';

/**
 * SidebarHeader Component
 *
 * Logo, collapse toggle, and quick action buttons.
 * Handles both expanded and collapsed states.
 */

interface SidebarHeaderProps {
  onNewChat: () => void;
  onSearchClick: () => void;
}

export default function SidebarHeader({ onNewChat, onSearchClick }: SidebarHeaderProps) {
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar } = useNavigation();
  const { user } = useAuth();

  if (sidebarCollapsed) {
    return (
      <div className="sticky top-0 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col items-center py-3 space-y-2">
          {/* Logo Icon - Starts new chat */}
          <button onClick={onNewChat} title="Start new chat">
            <div className="p-2 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
              <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
            </div>
          </button>

          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Expand sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="w-full h-px bg-gray-200 my-1"></div>

          {/* Control Icons */}
          <button
            onClick={onNewChat}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            title="New Chat"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onSearchClick}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
            title="Search Chats"
          >
            <Search className="w-4 h-4" />
          </button>
          {/* Athlete-only features */}
          {isAthleteRole(user?.role || '') && (
            <>
              <button
                onClick={() => router.push('/library')}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                title="Library"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => router.push('/quizzes')}
                className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                title="Quizzes"
              >
                <BookOpen className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 bg-gray-50 border-b border-gray-200 flex-shrink-0">
      <div className="p-3">
        {/* Logo Section - Starts new chat */}
        <div className="flex items-center mb-3">
          <button onClick={onNewChat} className="flex-1">
            <div className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">ChatNIL</span>
            </div>
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Control Buttons */}
        <div className="space-y-1">
          {/* New Chat */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors text-left"
          >
            <Plus className="w-4 h-4 text-gray-700" />
            <span className="text-sm text-gray-900">Start New Conversation</span>
          </button>

          {/* Search Chats */}
          <button
            onClick={onSearchClick}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors text-left"
          >
            <Search className="w-4 h-4 text-gray-700" />
            <span className="text-sm text-gray-900">Find Past Conversations</span>
          </button>

          {/* Athlete-only features */}
          {isAthleteRole(user?.role || '') && (
            <>
              {/* Library */}
              <button
                onClick={() => router.push('/library')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <FolderOpen className="w-4 h-4 text-gray-700" />
                <span className="text-sm text-gray-900">Library</span>
              </button>

              {/* Quizzes */}
              <button
                onClick={() => router.push('/quizzes')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <BookOpen className="w-4 h-4 text-gray-700" />
                <span className="text-sm text-gray-900">Quizzes</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
