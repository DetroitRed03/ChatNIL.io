import useSWR from 'swr';

// Fetcher function for API calls
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('API request failed');
  return res.json();
});

// Hook to fetch complete dashboard data
export function useAgencyDashboard(options?: { refreshInterval?: number }) {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/agency/dashboard/all',
    fetcher,
    {
      refreshInterval: options?.refreshInterval,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Hook to fetch dashboard stats only
export function useAgencyDashboardStats() {
  const { data, error, isLoading } = useSWR(
    '/api/agency/dashboard/stats',
    fetcher
  );

  return {
    stats: data?.overview,
    error,
    isLoading,
  };
}

// Hook to fetch campaigns
export function useAgencyCampaigns() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/agency/dashboard/campaigns',
    fetcher
  );

  return {
    campaigns: data?.campaigns || [],
    error,
    isLoading,
    mutate,
  };
}

// Hook to fetch athletes
export function useAgencyAthletes() {
  const { data, error, isLoading } = useSWR(
    '/api/agency/dashboard/athletes',
    fetcher
  );

  return {
    athletes: data?.athletes || [],
    error,
    isLoading,
  };
}

// Hook to fetch budget
export function useAgencyBudget() {
  const { data, error, isLoading } = useSWR(
    '/api/agency/dashboard/budget',
    fetcher
  );

  return {
    budget: data?.budget,
    error,
    isLoading,
  };
}

// Hook to fetch activity feed
export function useAgencyActivity() {
  const { data, error, isLoading } = useSWR(
    '/api/agency/dashboard/activity',
    fetcher
  );

  return {
    activities: data?.recent_activity || [],
    error,
    isLoading,
  };
}

// Hook to fetch pending actions
export function useAgencyActions() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/agency/dashboard/actions',
    fetcher
  );

  return {
    actions: data?.pending_actions || [],
    error,
    isLoading,
    mutate,
  };
}
