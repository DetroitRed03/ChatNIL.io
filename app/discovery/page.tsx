'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiscoveryChat } from '@/components/discovery/DiscoveryChat';
import { Loader2 } from 'lucide-react';

export default function DiscoveryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const response = await fetch('/api/discovery/current-state');

      if (response.status === 401) {
        // Not authenticated, redirect to login
        router.push('/login?redirect=/discovery');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to check authorization');
      }

      const data = await response.json();

      // Check if discovery is complete
      if (data.state?.isComplete) {
        // Redirect to profile/dashboard
        router.push('/dashboard');
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Authorization check failed:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading your discovery journey...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  return (
    <div className="h-screen">
      <DiscoveryChat />
    </div>
  );
}
