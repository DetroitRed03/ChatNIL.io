import { cn } from '@/lib/utils';

interface CardGridProps {
  children: React.ReactNode;
  columns?: {
    default?: 1 | 2 | 3 | 4;
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4;
    lg?: 1 | 2 | 3 | 4;
    xl?: 1 | 2 | 3 | 4;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gapClasses = {
  sm: 'gap-2 md:gap-3',
  md: 'gap-3 md:gap-4 lg:gap-6',
  lg: 'gap-4 md:gap-6 lg:gap-8',
};

// Static column class map (Tailwind needs full class names for JIT)
const colMap: Record<string, Record<number, string>> = {
  default: { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' },
  sm: { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' },
  md: { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' },
  lg: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' },
  xl: { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4' },
};

export function CardGrid({
  children,
  columns = { default: 1, md: 2, lg: 3 },
  gap = 'md',
  className = '',
}: CardGridProps) {
  const colClasses = Object.entries(columns)
    .map(([bp, cols]) => colMap[bp]?.[cols])
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('grid', colClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
}
