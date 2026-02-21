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
    <nav className={`flex items-center text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 mx-1 text-gray-300" />
            )}

            {index === 0 && showHomeIcon && (
              <Home className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            )}

            {item.href && !item.active ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-orange-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={item.active ? 'text-gray-800 font-medium' : 'text-gray-500'}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}