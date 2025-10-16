'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
}

export default function Breadcrumbs({
  items,
  className = '',
  showHomeIcon = true
}: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {/* Show separator before each item except the first */}
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            )}

            {/* Show home icon for first item if enabled */}
            {index === 0 && showHomeIcon && (
              <Home className="h-4 w-4 mr-1 text-gray-400" />
            )}

            {/* Render item as link or text */}
            {item.href && !item.active ? (
              <Link
                href={item.href}
                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={item.active ? 'text-gray-900 font-medium' : 'text-gray-600'}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}