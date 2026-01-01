'use client';

import { MessageSquare, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface EmptyInboxProps {
  role: 'agency' | 'athlete';
}

/**
 * Empty state for inbox with role-specific messaging
 */
export function EmptyInbox({ role }: EmptyInboxProps) {
  const router = useRouter();

  const config = {
    athlete: {
      icon: MessageSquare,
      title: 'Your Inbox is Empty',
      description: 'When agencies reach out about NIL opportunities, their messages will appear here.',
      ctaText: 'Complete Profile',
      ctaHref: '/profile',
    },
    agency: {
      icon: Users,
      title: 'Start Connecting with Athletes',
      description: 'Discover and message athletes who match your campaign needs.',
      ctaText: 'Discover Athletes',
      ctaHref: '/agency/discover',
    },
  };

  const { icon: Icon, title, description, ctaText, ctaHref } = config[role];

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg">
          <Icon className="w-10 h-10 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-100 rounded-full border-2 border-white" />
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 max-w-sm mb-6">
        {description}
      </p>

      {/* CTA */}
      <Button
        onClick={() => router.push(ctaHref)}
        className="bg-orange-500 hover:bg-orange-600 text-white"
      >
        {ctaText}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      {/* Trust signal */}
      <p className="text-xs text-gray-400 mt-8">
        Messages are encrypted and secure
      </p>
    </div>
  );
}
