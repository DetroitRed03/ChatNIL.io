'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, BookOpen, MessageCircle, GraduationCap, User, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavTab {
  icon: React.ElementType;
  label: string;
  route: string;
  matchRoutes?: string[];
}

const HS_TABS: NavTab[] = [
  { icon: Home, label: 'Home', route: '/dashboard', matchRoutes: ['/dashboard'] },
  { icon: BookOpen, label: 'Learn', route: '/library', matchRoutes: ['/library', '/chapter'] },
  { icon: MessageCircle, label: 'Chat', route: '/chat', matchRoutes: ['/chat', '/'] },
  { icon: GraduationCap, label: 'Quizzes', route: '/quizzes', matchRoutes: ['/quizzes'] },
  { icon: User, label: 'Me', route: '/profile', matchRoutes: ['/profile', '/settings'] },
];

const COLLEGE_TABS: NavTab[] = [
  { icon: Home, label: 'Home', route: '/dashboard', matchRoutes: ['/dashboard'] },
  { icon: FileText, label: 'Deals', route: '/deals', matchRoutes: ['/deals'] },
  { icon: MessageCircle, label: 'Chat', route: '/chat', matchRoutes: ['/chat', '/'] },
  { icon: BookOpen, label: 'Library', route: '/library', matchRoutes: ['/library'] },
  { icon: User, label: 'Me', route: '/profile', matchRoutes: ['/profile', '/settings'] },
];

export function MobileBottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const isHSStudent = user.role === 'hs_student';
  const isCollegeAthlete = user.role === 'athlete' || user.role === 'college_athlete';

  if (!isHSStudent && !isCollegeAthlete) return null;

  const tabs = isHSStudent ? HS_TABS : COLLEGE_TABS;

  const isActive = (tab: NavTab) => {
    if (!pathname) return false;
    return tab.matchRoutes?.some(route => {
      if (route === '/') return pathname === '/';
      return pathname.startsWith(route);
    }) ?? false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;
          return (
            <button
              key={tab.route}
              onClick={() => router.push(tab.route)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-orange-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-0.5 ${active ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
