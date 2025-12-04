export interface FilterOptions {
  sport?: string;
  minScore?: number;
  tier?: string;
}

export function searchAthletes<T extends { name: string; sport?: string; school?: string }>(
  athletes: T[],
  query: string
): T[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return athletes;

  return athletes.filter(athlete => {
    return (
      athlete.name.toLowerCase().includes(lowerQuery) ||
      athlete.sport?.toLowerCase().includes(lowerQuery) ||
      athlete.school?.toLowerCase().includes(lowerQuery)
    );
  });
}

export function filterAthletes<T extends { sport?: string; fmv_score?: number; fmv_tier?: string }>(
  athletes: T[],
  options: FilterOptions
): T[] {
  let result = [...athletes];

  if (options.sport) {
    result = result.filter(a => a.sport === options.sport);
  }

  if (options.minScore !== undefined) {
    const minScore = options.minScore;
    result = result.filter(a => (a.fmv_score || 0) >= minScore);
  }

  if (options.tier) {
    result = result.filter(a => a.fmv_tier === options.tier);
  }

  return result;
}

export function searchCampaigns<T extends { name: string; brand: string; targetSports?: string[] }>(
  campaigns: T[],
  query: string
): T[] {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) return campaigns;

  return campaigns.filter(campaign => {
    return (
      campaign.name.toLowerCase().includes(lowerQuery) ||
      campaign.brand.toLowerCase().includes(lowerQuery) ||
      campaign.targetSports?.some(sport => sport.toLowerCase().includes(lowerQuery))
    );
  });
}
