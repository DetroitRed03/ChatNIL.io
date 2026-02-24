import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
  outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
};

const sizeClasses = {
  sm: 'px-4 py-2.5 text-sm min-h-[40px]',
  md: 'px-5 py-3 text-base min-h-[48px]',
  lg: 'px-6 py-4 text-lg min-h-[56px]',
};

export function TouchButton({
  variant = 'primary',
  size = 'md',
  isLoading,
  fullWidth,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: TouchButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : icon ? (
        <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

export type { TouchButtonProps };
