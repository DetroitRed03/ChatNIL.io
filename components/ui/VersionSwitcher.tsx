'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Zap, Award, Gem } from 'lucide-react';

const versions = [
  {
    id: 'v1',
    label: 'Clean & Modern',
    path: '/showcase',
    icon: Sparkles,
    color: 'from-primary-500 to-accent-500',
    description: 'Professional and accessible',
  },
  {
    id: 'v2',
    label: 'Energetic & Bold',
    path: '/showcase-v2',
    icon: Zap,
    color: 'from-primary-600 to-secondary-700',
    description: 'High energy sports focus',
  },
  {
    id: 'v3',
    label: 'Premium & Sophisticated',
    path: '/showcase-v3',
    icon: Award,
    color: 'from-primary-700 to-accent-600',
    description: 'Elegant luxury experience',
  },
  {
    id: 'v4',
    label: 'Refined & Professional',
    path: '/showcase-v4',
    icon: Gem,
    color: 'from-orange-500 to-orange-600',
    description: 'Production-ready polish',
  },
];

export function VersionSwitcher() {
  const pathname = usePathname();

  return (
    <div className="bg-white/90 backdrop-blur-lg border-2 border-primary-200 rounded-2xl p-6 shadow-2xl">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-secondary-700 mb-1">Design Versions</h3>
        <p className="text-sm text-secondary-500">Explore different design styles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {versions.map((version) => {
          const Icon = version.icon;
          const isActive = pathname === version.path;

          return (
            <Link key={version.id} href={version.path}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-accent-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                }`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeVersion"
                    className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-accent-100/50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="relative">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                      isActive
                        ? `bg-gradient-to-br ${version.color}`
                        : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isActive ? 'text-white' : 'text-gray-600'
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <h4
                    className={`font-bold mb-1 ${
                      isActive ? 'text-primary-700' : 'text-secondary-700'
                    }`}
                  >
                    {version.label}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-secondary-500">
                    {version.description}
                  </p>

                  {/* Active Badge */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
