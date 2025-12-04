/**
 * Quick Actions Widget - Warm & Cohesive Design
 *
 * A cozy, inviting widget that provides quick access to key actions.
 * Uses warm color palette (orange, amber, yellow) to match dashboard aesthetic.
 *
 * Features:
 * - Warm gradient background (orange-50/amber-50)
 * - Soft, rounded corners (rounded-2xl)
 * - Gentle hover effects (subtle scale, warm glow)
 * - Warm icon backgrounds (orange-50, amber-50, yellow-50)
 * - Comfortable spacing and padding
 * - Inviting, not aggressive animations
 */

'use client';

import { motion } from 'framer-motion';
import { Flame, MessageCircle, Upload, Trophy, BarChart3, Briefcase, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  iconBg: string;
  iconColor: string;
}

// Quick actions configuration - WARM & COHESIVE
const quickActions: QuickAction[] = [
  {
    label: 'Browse Deals',
    description: '8 new opportunities waiting',
    icon: Flame,
    href: '/opportunities',
    badge: '8 new',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    label: 'Check Messages',
    description: '2 unread conversations',
    icon: MessageCircle,
    href: '/messages',
    badge: '2 unread',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Upload Content',
    description: 'Share your latest work',
    icon: Upload,
    href: '/content/upload',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    label: 'Take Quiz',
    description: 'Earn +100 points',
    icon: Trophy,
    href: '/quizzes',
    badge: '+100 pts',
    iconBg: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
  {
    label: 'View Analytics',
    description: 'See your performance',
    icon: BarChart3,
    href: '/analytics',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Manage Deals',
    description: '3 active partnerships',
    icon: Briefcase,
    href: '/deals',
    badge: '3 active',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  }
];

export function QuickActionsWidget() {
  return (
    <Card className="bg-gradient-to-br from-orange-50/30 via-white to-amber-50/20 border border-orange-100/50 shadow-sm shadow-orange-100/30 rounded-2xl overflow-hidden">
      {/* Header - Warm & Inviting */}
      <div className="px-6 pt-6 pb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Get Things Done ⚡
        </h3>
        <p className="text-sm text-gray-600 mt-1">Quick access to your most important actions</p>
      </div>

      {/* Action Cards - Clean Vertical List */}
      <div className="px-6 pb-6 space-y-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: 'easeOut'
              }}
            >
              <Link href={action.href}>
                <motion.div
                  whileHover={{ scale: 1.01, y: -2 }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 20
                  }}
                  className="group bg-white/80 backdrop-blur-sm border border-orange-100/40 rounded-xl p-4 hover:bg-gradient-to-br hover:from-orange-50/40 hover:to-amber-50/30 hover:shadow-md hover:shadow-orange-200/40 hover:border-orange-200/60 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Warm Icon Container */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${action.iconBg} flex items-center justify-center group-hover:bg-opacity-80 group-hover:scale-105 transition-all duration-300`}>
                      <Icon className={`w-5 h-5 ${action.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                        {action.label}
                      </h4>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                        {action.description}
                      </p>
                    </div>

                    {/* Badge (if exists) */}
                    {action.badge && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100/70 text-orange-700 group-hover:bg-orange-200/70 transition-colors">
                          {action.badge}
                        </span>
                      </div>
                    )}

                    {/* Subtle Arrow */}
                    <ChevronRight className="flex-shrink-0 w-4 h-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all duration-300" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
