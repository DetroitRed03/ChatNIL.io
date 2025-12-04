'use client';

import { BookOpen, MessageSquare, User, Calendar, Users, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { TiltCard } from '@/components/ui/TiltCard';
import { Button } from '@/components/ui/Button';

interface EarnMethod {
  icon: React.ReactNode;
  title: string;
  description: string;
  actions: string[];
  link: string;
  linkText: string;
  color: string;
}

const earnMethods: EarnMethod[] = [
  {
    icon: <BookOpen className="w-10 h-10" />,
    title: 'Take Quizzes',
    description: 'Test your knowledge across 10 NIL categories and earn badges based on your performance.',
    actions: [
      'Complete quizzes in NIL Basics, Contracts, Tax & Finance',
      'Score 80% or higher for bonus points',
      'Master all categories to unlock Legendary badges'
    ],
    link: '/quizzes',
    linkText: 'Browse Quizzes',
    color: 'text-blue-600'
  },
  {
    icon: <MessageSquare className="w-10 h-10" />,
    title: 'Use AI Chatbot',
    description: 'Learn by asking questions and having conversations with our AI assistant.',
    actions: [
      'Ask questions about NIL concepts',
      'Complete chat-based learning modules',
      'Engage in meaningful conversations daily'
    ],
    link: '/',
    linkText: 'Start Chatting',
    color: 'text-green-600'
  },
  {
    icon: <User className="w-10 h-10" />,
    title: 'Complete Profile',
    description: 'Fill out your athlete profile and showcase your achievements.',
    actions: [
      'Add your sport and school information',
      'Upload profile photos and bio',
      'Connect your social media accounts'
    ],
    link: '/profile',
    linkText: 'Edit Profile',
    color: 'text-purple-600'
  },
  {
    icon: <Calendar className="w-10 h-10" />,
    title: 'Engage Daily',
    description: 'Build consistency by logging in and participating every day.',
    actions: [
      'Maintain login streaks',
      'Complete daily challenges',
      'Check in regularly to track progress'
    ],
    link: '/',
    linkText: 'Start Today',
    color: 'text-orange-600'
  },
  {
    icon: <Users className="w-10 h-10" />,
    title: 'Help Others',
    description: 'Share your knowledge and support fellow athletes in their NIL journey.',
    actions: [
      'Answer questions in the community',
      'Share helpful resources',
      'Mentor newer platform members'
    ],
    link: '/',
    linkText: 'Join Community',
    color: 'text-pink-600'
  },
  {
    icon: <Target className="w-10 h-10" />,
    title: 'Achieve Milestones',
    description: 'Reach important platform goals and unlock special achievement badges.',
    actions: [
      'Complete your first NIL deal',
      'Reach 1,000 engagement points',
      'Help 10 fellow athletes'
    ],
    link: '/',
    linkText: 'View Goals',
    color: 'text-indigo-600'
  }
];

export function HowToEarnSection() {
  return (
    <div className="mb-12 sm:mb-16">
      {/* Section Header - Centered */}
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          How to Earn Badges
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          There are many paths to earning badges. Choose your favorites and start building your collection!
        </p>
      </div>

      {/* Method Cards - Centered Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto mb-8 sm:mb-12">
        {earnMethods.map((method) => (
          <TiltCard key={method.title} intensity={8} className="group h-full">
            <div className="p-5 sm:p-6 md:p-8 h-full flex flex-col">
              {/* Icon and Title */}
              <div className="mb-4 sm:mb-6">
                <div className={`${method.color} mb-3 sm:mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  {method.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{method.description}</p>
              </div>

              {/* Action Items */}
              <div className="flex-grow mb-4 sm:mb-6">
                <ul className="space-y-2 sm:space-y-3">
                  {method.actions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700">
                      <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${method.color.replace('text-', 'bg-')}`} />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link href={method.link}>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-orange-50 group-hover:border-orange-300 transition-colors text-sm"
                >
                  {method.linkText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Encouragement CTA - Centered */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center max-w-4xl mx-auto">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          Ready to Start Your Badge Collection?
        </h3>
        <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto">
          Begin with a quick quiz or start chatting with our AI assistant. Every step you take brings you closer to mastering NIL!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link href="/quizzes">
            <Button size="lg" className="w-full sm:w-auto sm:min-w-[200px]">
              Take Your First Quiz
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto sm:min-w-[200px]">
              Start Chatting
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
