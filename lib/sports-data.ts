// Shared sports data for consistent autocomplete across the app
// Used in both onboarding and profile editing

export const SPORTS_DATA = {
  'Football': ['Quarterback', 'Running Back', 'Wide Receiver', 'Tight End', 'Offensive Line', 'Defensive Line', 'Linebacker', 'Cornerback', 'Safety', 'Kicker', 'Punter'],
  'Basketball': ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
  'Soccer': ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker', 'Winger'],
  'Baseball': ['Pitcher', 'Catcher', 'First Base', 'Second Base', 'Third Base', 'Shortstop', 'Left Field', 'Center Field', 'Right Field'],
  'Volleyball': ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero', 'Defensive Specialist'],
  'Tennis': ['Singles Player', 'Doubles Player'],
  'Track & Field': ['Sprinter', 'Distance Runner', 'Jumper', 'Thrower', 'Hurdler', 'Multi-Event'],
  'Swimming': ['Freestyle', 'Backstroke', 'Breaststroke', 'Butterfly', 'Individual Medley', 'Distance'],
  'Wrestling': ['Lightweight', 'Middleweight', 'Heavyweight'],
  'Golf': ['Individual Player'],
  'Cross Country': ['Distance Runner'],
  'Lacrosse': ['Attack', 'Midfield', 'Defense', 'Goalie'],
  'Hockey': ['Forward', 'Defenseman', 'Goalie'],
  'Gymnastics': ['All-Around', 'Event Specialist'],
  'Softball': ['Pitcher', 'Catcher', 'Infielder', 'Outfielder'],
  'Other': []
} as const;

export type SportName = keyof typeof SPORTS_DATA;
export type PositionName = typeof SPORTS_DATA[SportName][number];

export const POPULAR_SPORTS = Object.keys(SPORTS_DATA) as SportName[];

/**
 * Get positions for a specific sport
 */
export function getPositionsForSport(sport: string): string[] {
  const positions = SPORTS_DATA[sport as SportName];
  return positions ? [...positions] : [];
}

/**
 * Check if a sport exists in the data
 */
export function isSportValid(sport: string): boolean {
  return sport in SPORTS_DATA;
}

/**
 * Search for sports matching a query
 */
export function searchSports(query: string, limit: number = 6): SportName[] {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  return POPULAR_SPORTS
    .filter(sport => sport.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
}