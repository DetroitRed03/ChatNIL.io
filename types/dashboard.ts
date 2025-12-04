/**
 * Dashboard Types
 * Dashboard metrics, widgets, opportunities, and learning stats
 */

/**
 * Dashboard Metrics - Aggregated stats for athlete dashboard
 */
export interface DashboardMetrics {
  totalEarnings: number;
  earningsChange: number;
  activeDeals: number;
  completedDeals: number;
  profileViews: number;
  viewsChange: number;
  fmvScore: number;
  fmvChange: number;
}

/**
 * NIL Deal - Complete deal information (Dashboard view)
 * This is a dashboard-specific view with joined data
 * For the full type, see campaign.ts
 */
export interface DashboardNILDeal {
  id: string;
  athlete_id: string;
  agency_id: string;
  deal_title: string;
  deal_type: string;
  description?: string;
  compensation_amount?: number;
  compensation_type?: string;
  payment_terms?: string;
  start_date: string;
  end_date?: string;
  status: 'draft' | 'pending' | 'active' | 'completed' | 'cancelled';
  deliverables?: any[];
  payment_schedule?: any[];
  performance_metrics?: any;
  school_approved?: boolean;
  parent_approved?: boolean;
  compliance_checked?: boolean;
  contract_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;

  // Joined data
  agency?: {
    id: string;
    company_name?: string;
    email?: string;
    website_url?: string;
  };
  athlete?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    school_name?: string;
    primary_sport?: string;
    graduation_year?: number;
  };

  // Calculated fields
  next_deliverable?: {
    type: string;
    deadline: string;
    count: number;
  };
  brand_name?: string;
  brand_logo?: string;
}

/**
 * Opportunity - Matched brand opportunity
 */
export interface Opportunity {
  id: string;
  title: string;
  brand_name: string;
  description: string;
  compensation_min: number;
  compensation_max: number;
  deadline: string;
  match_score: number;
  status: 'open' | 'applied' | 'closed';
}

/**
 * Notification - User notification
 */
export interface Notification {
  id: string;
  user_id: string;
  type: 'deal' | 'message' | 'fmv' | 'profile' | 'payment' | 'match';
  message: string;
  url: string;
  read: boolean;
  created_at: string;
}

/**
 * Event - Calendar event from deal deliverables
 */
export interface Event {
  id: string;
  title: string;
  type: 'deliverable' | 'payment' | 'meeting' | 'event';
  date: string;
  deal_id?: string;
  deal_title?: string;
}

/**
 * Quick Stats - Performance metrics
 */
export interface QuickStats {
  responseRate: number;
  avgResponseTime: string;
  dealSuccessRate: number;
  profileGrowth: number;
}

// Education & Learning Dashboard Types
export interface QuizAttempt {
  id: string;
  category: string;
  score: number;
  completedAt: string;
  questionsCorrect: number;
  questionsTotal: number;
}

export interface QuizProgress {
  recentQuizzes: QuizAttempt[];  // renamed from recentAttempts for widget compatibility
  totalQuizzes: number;
  averageScore: number;
  categoriesCompleted: number;
  nextRecommended: string;
  // Gamification fields
  currentStreak: number;
  totalPoints: number;
  nextBadgeProgress: number;
  nextBadgeName: string;
  quizzesUntilBadge: number;
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  iconUrl?: string;
  rarity: string;
  points: number;
  earnedAt: string;
}

export interface BadgeProgress {
  recentBadges: BadgeInfo[];
  totalBadges: number;
  earnedCount: number;
  totalPoints: number;
  completionPercentage: number;
}

export interface RecentChat {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
}

export interface LearningStats {
  knowledgeLevel: string;
  averageScore: number;
  badgesEarned: number;
  quizStreak: number;
  scoreChange: number;
}
