'use client';

import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6 md:mb-8', className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {backHref && (
            <a
              href={backHref}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
            >
              <ChevronLeft className="w-5 h-5" />
            </a>
          )}
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm md:text-base text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 md:gap-3">{actions}</div>
        )}
      </div>
    </div>
  );
}
