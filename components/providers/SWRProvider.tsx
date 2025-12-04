/**
 * SWR Provider Component
 *
 * Wraps the application with SWR configuration for global data fetching behavior.
 */

'use client';

import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/lib/swr-config';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
