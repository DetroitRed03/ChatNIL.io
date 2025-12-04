import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'simple';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className
}: EmptyStateProps) {
  if (variant === 'simple') {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-text-secondary mb-4">{description}</p>
        {action && (
          action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 h-10 px-4 text-base bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 active:scale-[0.98]"
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 h-10 px-4 text-base bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 active:scale-[0.98]"
            >
              {action.label}
            </button>
          )
        )}
      </div>
    );
  }

  // Safely render icon - handle both component types and React elements
  const renderIcon = () => {
    if (!icon) return null;

    // If it's already a valid React element (JSX), render it directly
    if (React.isValidElement(icon)) {
      return icon;
    }

    // If it's a component (function or object with render method), render it as JSX
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-8 h-8" />;
    }

    // Otherwise, render it directly (string, number, etc.)
    return icon;
  };

  return (
    <div className={cn("text-center py-12 px-6", className)}>
      {icon && (
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 text-primary-600 flex items-center justify-center">
            {renderIcon()}
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary max-w-md mx-auto mb-6 leading-relaxed">{description}</p>

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 h-12 px-6 text-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 active:scale-[0.98]"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 h-12 px-6 text-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 active:scale-[0.98]"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
