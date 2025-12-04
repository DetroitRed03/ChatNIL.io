'use client';

import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

/**
 * HeaderLogo Component
 *
 * Displays the ChatNIL logo and brand name in the header.
 * Clickable to return to home/dashboard.
 */

export default function HeaderLogo() {
  return (
    <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 rounded-lg flex items-center justify-center">
        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
      <span className="text-lg sm:text-xl font-semibold text-gray-900">ChatNIL</span>
    </Link>
  );
}
