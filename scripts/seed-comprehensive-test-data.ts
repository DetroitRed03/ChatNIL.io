#!/usr/bin/env tsx

/**
 * Comprehensive Test Data Seed Script
 * ====================================
 * Seeds the database with complete test data for all 4 roles:
 * - 5 High School Students (with parents)
 * - 5 College Athletes (all at Pacific Coast University)
 * - 5 Parents (linked to HS students)
 * - 1 Compliance Officer (for Pacific Coast University)
 *
 * Usage:
 *   npx tsx scripts/seed-comprehensive-test-data.ts
 *   npx tsx scripts/seed-comprehensive-test-data.ts --clean
 *
 * Test Credentials:
 *   All users: TestUser123!
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Parse CLI arguments
const args = process.argv.slice(2);
const shouldClean = args.includes('--clean');

// Default password for all test users
const TEST_PASSWORD = 'TestUser123!';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type UserRole = 'hs_student' | 'college_athlete' | 'parent' | 'compliance_officer';

interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  profile: {
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth?: string;
    sport?: string;
    position?: string;
    school_name?: string;
    school_level?: string;
    graduation_year?: number;
    grade?: string;
    primary_state: string;
    bio?: string;
    hobbies?: string[];
    nil_interests?: string[];
    nil_goals?: string;
    instagram_followers?: number;
    tiktok_followers?: number;
    twitter_followers?: number;
  };
  institution?: string;
  childEmail?: string;
}

interface TestDeal {
  athleteEmail: string;
  deal_title: string;
  brand_name: string;
  third_party_name: string;
  deal_type: string;
  compensation_amount: number;
  description: string;
  status: string;
  expectedScore: {
    total: number;
    status: 'green' | 'yellow' | 'red';
    policyFit: number;
    fmv: number;
    document: number;
    tax: number;
    brandSafety: number;
    guardianConsent: number;
    reason_codes?: string[];
  };
}

// ============================================================================
// TEST DATA DEFINITIONS
// ============================================================================

// Main institution for all college athletes
const PACIFIC_COAST_UNIVERSITY = {
  name: 'Pacific Coast University',
  type: 'university' as const,
  state: 'CA',
  conference: 'Big West Conference',
  division: 'Division I',
};

const testUsers: TestUser[] = [
  // ========== COMPLIANCE OFFICER ==========
  {
    email: 'michael.torres@pcu.edu',
    password: TEST_PASSWORD,
    role: 'compliance_officer',
    profile: {
      first_name: 'Michael',
      last_name: 'Torres',
      full_name: 'Michael Torres',
      primary_state: 'CA',
      bio: 'Director of NIL Compliance at Pacific Coast University. 15 years experience in collegiate athletics administration.',
    },
    institution: 'Pacific Coast University',
  },

  // ========== COLLEGE ATHLETES (5 - all at PCU) ==========
  {
    email: 'marcus.johnson@pcu.edu',
    password: TEST_PASSWORD,
    role: 'college_athlete',
    profile: {
      first_name: 'Marcus',
      last_name: 'Johnson',
      full_name: 'Marcus Johnson',
      date_of_birth: '2002-06-15',
      sport: 'Football',
      position: 'Quarterback',
      school_name: 'Pacific Coast University',
      school_level: 'college',
      graduation_year: 2025,
      primary_state: 'CA',
      bio: 'Starting QB for Pacific Coast. 2-year starter with 6,500+ passing yards. Leading the team to back-to-back bowl games.',
      hobbies: ['Gaming', 'Film Study', 'Community Service'],
      nil_interests: ['Sportswear', 'Automotive', 'Gaming', 'Fast Food'],
      nil_goals: 'Build a sustainable brand while leading PCU to a conference championship.',
      instagram_followers: 45000,
      tiktok_followers: 28000,
      twitter_followers: 12000,
    },
    institution: 'Pacific Coast University',
  },
  {
    email: 'aaliyah.williams@pcu.edu',
    password: TEST_PASSWORD,
    role: 'college_athlete',
    profile: {
      first_name: 'Aaliyah',
      last_name: 'Williams',
      full_name: 'Aaliyah Williams',
      date_of_birth: '2001-11-22',
      sport: "Women's Basketball",
      position: 'Point Guard',
      school_name: 'Pacific Coast University',
      school_level: 'college',
      graduation_year: 2024,
      primary_state: 'CA',
      bio: 'All-Conference point guard. Team captain and 1,000+ point scorer. Passionate about youth mentorship.',
      hobbies: ['Yoga', 'Reading', 'Mentoring'],
      nil_interests: ['Fitness', 'Fashion', 'Health & Wellness', 'Education'],
      nil_goals: 'Create opportunities that extend beyond basketball and inspire young women.',
      instagram_followers: 32000,
      tiktok_followers: 55000,
      twitter_followers: 8500,
    },
    institution: 'Pacific Coast University',
  },
  {
    email: 'diego.martinez@pcu.edu',
    password: TEST_PASSWORD,
    role: 'college_athlete',
    profile: {
      first_name: 'Diego',
      last_name: 'Martinez',
      full_name: 'Diego Martinez',
      date_of_birth: '2003-03-08',
      sport: 'Soccer',
      position: 'Forward',
      school_name: 'Pacific Coast University',
      school_level: 'college',
      graduation_year: 2026,
      primary_state: 'CA',
      bio: 'Rising star forward from San Diego. 15 goals last season. Dreaming of going pro.',
      hobbies: ['Music', 'Cooking', 'Beach Volleyball'],
      nil_interests: ['Sportswear', 'Music', 'Food & Beverage', 'Travel'],
      nil_goals: 'Build my international profile while helping the team succeed.',
      instagram_followers: 18500,
      tiktok_followers: 42000,
      twitter_followers: 5200,
    },
    institution: 'Pacific Coast University',
  },
  {
    email: 'jasmine.chen@pcu.edu',
    password: TEST_PASSWORD,
    role: 'college_athlete',
    profile: {
      first_name: 'Jasmine',
      last_name: 'Chen',
      full_name: 'Jasmine Chen',
      date_of_birth: '2002-09-14',
      sport: 'Volleyball',
      position: 'Outside Hitter',
      school_name: 'Pacific Coast University',
      school_level: 'college',
      graduation_year: 2025,
      primary_state: 'CA',
      bio: 'All-American candidate. 350+ kills. Balancing pre-med studies with athletics.',
      hobbies: ['Studying', 'Hiking', 'Photography'],
      nil_interests: ['Health & Wellness', 'Education', 'Technology', 'Fitness'],
      nil_goals: 'Fund my medical school journey while inspiring Asian-American athletes.',
      instagram_followers: 25000,
      tiktok_followers: 38000,
      twitter_followers: 6800,
    },
    institution: 'Pacific Coast University',
  },
  {
    email: 'tyler.brooks@pcu.edu',
    password: TEST_PASSWORD,
    role: 'college_athlete',
    profile: {
      first_name: 'Tyler',
      last_name: 'Brooks',
      full_name: 'Tyler Brooks',
      date_of_birth: '2001-07-30',
      sport: 'Baseball',
      position: 'Pitcher',
      school_name: 'Pacific Coast University',
      school_level: 'college',
      graduation_year: 2024,
      primary_state: 'CA',
      bio: 'Senior ace. 2.45 ERA, 95+ mph fastball. Projected MLB draft pick.',
      hobbies: ['Fishing', 'Golf', 'Video Games'],
      nil_interests: ['Sportswear', 'Automotive', 'Energy Drinks', 'Gaming'],
      nil_goals: 'Maximize NIL opportunities before the draft while staying focused on the season.',
      instagram_followers: 28000,
      tiktok_followers: 15000,
      twitter_followers: 9500,
    },
    institution: 'Pacific Coast University',
  },

  // ========== HIGH SCHOOL STUDENTS (5) ==========
  {
    email: 'jordan.smith@student.test',
    password: TEST_PASSWORD,
    role: 'hs_student',
    profile: {
      first_name: 'Jordan',
      last_name: 'Smith',
      full_name: 'Jordan Smith',
      date_of_birth: '2008-04-12',
      sport: 'Football',
      position: 'Running Back',
      school_name: 'Westview High School',
      school_level: 'high_school',
      graduation_year: 2026,
      grade: '11th',
      primary_state: 'TX',
      bio: 'Junior RB with 2,500+ rushing yards. 4.5 forty. Multiple D1 offers.',
      hobbies: ['Gaming', 'Music', 'Training'],
      nil_interests: ['Sportswear', 'Gaming', 'Fast Food'],
      nil_goals: 'Learn about NIL before committing to a college program.',
      instagram_followers: 8500,
      tiktok_followers: 12000,
      twitter_followers: 2500,
    },
  },
  {
    email: 'emma.davis@student.test',
    password: TEST_PASSWORD,
    role: 'hs_student',
    profile: {
      first_name: 'Emma',
      last_name: 'Davis',
      full_name: 'Emma Davis',
      date_of_birth: '2007-08-25',
      sport: 'Softball',
      position: 'Pitcher',
      school_name: 'Palm Beach Academy',
      school_level: 'high_school',
      graduation_year: 2025,
      grade: '12th',
      primary_state: 'FL',
      bio: 'Senior pitcher. State champion. Committed to play D1 next fall.',
      hobbies: ['Beach', 'Photography', 'Cooking'],
      nil_interests: ['Fitness', 'Fashion', 'Beach Lifestyle'],
      nil_goals: 'Understand my NIL rights before starting college.',
      instagram_followers: 15000,
      tiktok_followers: 25000,
      twitter_followers: 4200,
    },
  },
  {
    email: 'aiden.washington@student.test',
    password: TEST_PASSWORD,
    role: 'hs_student',
    profile: {
      first_name: 'Aiden',
      last_name: 'Washington',
      full_name: 'Aiden Washington',
      date_of_birth: '2009-01-18',
      sport: 'Basketball',
      position: 'Shooting Guard',
      school_name: 'Atlanta Christian Academy',
      school_level: 'high_school',
      graduation_year: 2027,
      grade: '10th',
      primary_state: 'GA',
      bio: 'Sophomore guard averaging 22 PPG. Top 50 in class nationally.',
      hobbies: ['Sneaker Collecting', 'Gaming', 'Music'],
      nil_interests: ['Sneakers', 'Gaming', 'Music'],
      nil_goals: 'Build my brand foundation for when I reach college.',
      instagram_followers: 22000,
      tiktok_followers: 45000,
      twitter_followers: 8000,
    },
  },
  {
    email: 'sophia.rodriguez@student.test',
    password: TEST_PASSWORD,
    role: 'hs_student',
    profile: {
      first_name: 'Sophia',
      last_name: 'Rodriguez',
      full_name: 'Sophia Rodriguez',
      date_of_birth: '2008-05-30',
      sport: 'Soccer',
      position: 'Midfielder',
      school_name: 'San Diego Prep',
      school_level: 'high_school',
      graduation_year: 2026,
      grade: '11th',
      primary_state: 'CA',
      bio: 'Junior midfielder. Club and varsity captain. Bilingual content creator.',
      hobbies: ['Dance', 'Content Creation', 'Travel'],
      nil_interests: ['Fashion', 'Travel', 'Food & Beverage'],
      nil_goals: 'Create authentic content that connects with young athletes.',
      instagram_followers: 18000,
      tiktok_followers: 65000,
      twitter_followers: 3500,
    },
  },
  {
    email: 'jaylen.thompson@student.test',
    password: TEST_PASSWORD,
    role: 'hs_student',
    profile: {
      first_name: 'Jaylen',
      last_name: 'Thompson',
      full_name: 'Jaylen Thompson',
      date_of_birth: '2007-11-05',
      sport: 'Track & Field',
      position: 'Sprinter',
      school_name: 'Raleigh North High',
      school_level: 'high_school',
      graduation_year: 2025,
      grade: '12th',
      primary_state: 'NC',
      bio: 'Senior sprinter. State record holder in 100m and 200m. Olympic hopeful.',
      hobbies: ['Music Production', 'Fashion', 'Fitness'],
      nil_interests: ['Sportswear', 'Fitness', 'Music'],
      nil_goals: 'Prepare for NIL opportunities at the next level while chasing records.',
      instagram_followers: 35000,
      tiktok_followers: 52000,
      twitter_followers: 12000,
    },
  },

  // ========== PARENTS (5 - one for each HS student) ==========
  {
    email: 'robert.smith@email.com',
    password: TEST_PASSWORD,
    role: 'parent',
    profile: {
      first_name: 'Robert',
      last_name: 'Smith',
      full_name: 'Robert Smith',
      date_of_birth: '1978-02-14',
      primary_state: 'TX',
      bio: "Jordan's father. Former college football player. Wants to help Jordan navigate NIL responsibly.",
    },
    childEmail: 'jordan.smith@student.test',
  },
  {
    email: 'lisa.davis@email.com',
    password: TEST_PASSWORD,
    role: 'parent',
    profile: {
      first_name: 'Lisa',
      last_name: 'Davis',
      full_name: 'Lisa Davis',
      date_of_birth: '1980-06-22',
      primary_state: 'FL',
      bio: "Emma's mother. Small business owner. Helping Emma understand the business side of sports.",
    },
    childEmail: 'emma.davis@student.test',
  },
  {
    email: 'marcus.washington@email.com',
    password: TEST_PASSWORD,
    role: 'parent',
    profile: {
      first_name: 'Marcus',
      last_name: 'Washington',
      full_name: 'Marcus Washington',
      date_of_birth: '1982-09-08',
      primary_state: 'GA',
      bio: "Aiden's father. Financial advisor. Focused on protecting Aiden's long-term interests.",
    },
    childEmail: 'aiden.washington@student.test',
  },
  {
    email: 'maria.rodriguez@email.com',
    password: TEST_PASSWORD,
    role: 'parent',
    profile: {
      first_name: 'Maria',
      last_name: 'Rodriguez',
      full_name: 'Maria Rodriguez',
      date_of_birth: '1979-12-03',
      primary_state: 'CA',
      bio: "Sophia's mother. Marketing professional. Supporting Sophia's content creation journey.",
    },
    childEmail: 'sophia.rodriguez@student.test',
  },
  {
    email: 'denise.thompson@email.com',
    password: TEST_PASSWORD,
    role: 'parent',
    profile: {
      first_name: 'Denise',
      last_name: 'Thompson',
      full_name: 'Denise Thompson',
      date_of_birth: '1981-04-17',
      primary_state: 'NC',
      bio: "Jaylen's mother. Track coach herself. Understanding NIL for her Olympic-hopeful son.",
    },
    childEmail: 'jaylen.thompson@student.test',
  },
];

// Test deals for college athletes with varied compliance statuses
const testDeals: TestDeal[] = [
  // ========== MARCUS JOHNSON (Football QB) - 3 deals ==========
  {
    athleteEmail: 'marcus.johnson@pcu.edu',
    deal_title: 'Under Armour Training Gear Campaign',
    brand_name: 'Under Armour',
    third_party_name: 'Under Armour, Inc.',
    deal_type: 'brand_ambassador',
    compensation_amount: 15000,
    description: 'Quarterly content featuring UA training gear and gameday apparel.',
    status: 'active',
    expectedScore: {
      total: 94,
      status: 'green',
      policyFit: 95,
      fmv: 92,
      document: 95,
      tax: 90,
      brandSafety: 100,
      guardianConsent: 100,
    },
  },
  {
    athleteEmail: 'marcus.johnson@pcu.edu',
    deal_title: 'Local Toyota Dealership Appearance',
    brand_name: 'Pacific Toyota',
    third_party_name: 'Pacific Toyota LLC',
    deal_type: 'appearance',
    compensation_amount: 2500,
    description: 'Grand opening event appearance and social media post.',
    status: 'completed',
    expectedScore: {
      total: 88,
      status: 'green',
      policyFit: 90,
      fmv: 85,
      document: 90,
      tax: 85,
      brandSafety: 95,
      guardianConsent: 100,
    },
  },
  {
    athleteEmail: 'marcus.johnson@pcu.edu',
    deal_title: 'Crypto Exchange Sponsorship',
    brand_name: 'CoinMax',
    third_party_name: 'CoinMax Holdings Ltd',
    deal_type: 'endorsement',
    compensation_amount: 50000,
    description: 'Promote cryptocurrency trading platform on social media.',
    status: 'pending',
    expectedScore: {
      total: 45,
      status: 'red',
      policyFit: 40,
      fmv: 60,
      document: 50,
      tax: 45,
      brandSafety: 30,
      guardianConsent: 100,
      reason_codes: ['Prohibited industry (crypto/gambling)', 'Brand safety concerns', 'Requires additional review'],
    },
  },

  // ========== AALIYAH WILLIAMS (Women's Basketball) - 2 deals ==========
  {
    athleteEmail: 'aaliyah.williams@pcu.edu',
    deal_title: 'Nike Basketball Collection',
    brand_name: 'Nike',
    third_party_name: 'Nike, Inc.',
    deal_type: 'product_gifting',
    compensation_amount: 8000,
    description: 'Annual shoe and apparel package plus one commercial appearance.',
    status: 'active',
    expectedScore: {
      total: 96,
      status: 'green',
      policyFit: 98,
      fmv: 95,
      document: 95,
      tax: 92,
      brandSafety: 100,
      guardianConsent: 100,
    },
  },
  {
    athleteEmail: 'aaliyah.williams@pcu.edu',
    deal_title: 'Youth Basketball Camp Partnership',
    brand_name: 'Hoops Academy',
    third_party_name: 'Hoops Academy Inc.',
    deal_type: 'coaching',
    compensation_amount: 5000,
    description: 'Summer camp instructor and promotional content.',
    status: 'active',
    expectedScore: {
      total: 92,
      status: 'green',
      policyFit: 95,
      fmv: 90,
      document: 90,
      tax: 88,
      brandSafety: 98,
      guardianConsent: 100,
    },
  },

  // ========== DIEGO MARTINEZ (Soccer) - 2 deals ==========
  {
    athleteEmail: 'diego.martinez@pcu.edu',
    deal_title: 'Adidas Soccer Ambassador',
    brand_name: 'Adidas',
    third_party_name: 'Adidas America, Inc.',
    deal_type: 'brand_ambassador',
    compensation_amount: 12000,
    description: 'Monthly content creation featuring Adidas soccer gear.',
    status: 'active',
    expectedScore: {
      total: 90,
      status: 'green',
      policyFit: 92,
      fmv: 88,
      document: 90,
      tax: 88,
      brandSafety: 95,
      guardianConsent: 100,
    },
  },
  {
    athleteEmail: 'diego.martinez@pcu.edu',
    deal_title: 'Energy Drink Sponsorship',
    brand_name: 'PowerSurge',
    third_party_name: 'PowerSurge Beverages LLC',
    deal_type: 'endorsement',
    compensation_amount: 7500,
    description: 'Social media posts promoting energy drink.',
    status: 'pending',
    expectedScore: {
      total: 68,
      status: 'yellow',
      policyFit: 70,
      fmv: 75,
      document: 60,
      tax: 65,
      brandSafety: 70,
      guardianConsent: 100,
      reason_codes: ['Missing contract documentation', 'FMV verification needed'],
    },
  },

  // ========== JASMINE CHEN (Volleyball) - 3 deals ==========
  {
    athleteEmail: 'jasmine.chen@pcu.edu',
    deal_title: 'Mizuno Volleyball Partnership',
    brand_name: 'Mizuno',
    third_party_name: 'Mizuno USA, Inc.',
    deal_type: 'brand_ambassador',
    compensation_amount: 10000,
    description: 'Official gear partner with content obligations.',
    status: 'active',
    expectedScore: {
      total: 91,
      status: 'green',
      policyFit: 93,
      fmv: 90,
      document: 90,
      tax: 88,
      brandSafety: 95,
      guardianConsent: 100,
    },
  },
  {
    athleteEmail: 'jasmine.chen@pcu.edu',
    deal_title: 'Pre-Med Study App Partnership',
    brand_name: 'MedPrep',
    third_party_name: 'MedPrep Education Inc.',
    deal_type: 'endorsement',
    compensation_amount: 3000,
    description: 'Promote medical school prep app to student athletes.',
    status: 'active',
    expectedScore: {
      total: 85,
      status: 'green',
      policyFit: 88,
      fmv: 82,
      document: 85,
      tax: 80,
      brandSafety: 92,
      guardianConsent: 100,
    },
  },
  {
    athleteEmail: 'jasmine.chen@pcu.edu',
    deal_title: 'Supplement Company Deal',
    brand_name: 'VitaBoost',
    third_party_name: 'VitaBoost Nutrition',
    deal_type: 'endorsement',
    compensation_amount: 4000,
    description: 'Promote vitamin supplements on social channels.',
    status: 'pending',
    expectedScore: {
      total: 62,
      status: 'yellow',
      policyFit: 65,
      fmv: 70,
      document: 55,
      tax: 60,
      brandSafety: 65,
      guardianConsent: 100,
      reason_codes: ['Product category requires verification', 'Missing FDA compliance documentation'],
    },
  },

  // ========== TYLER BROOKS (Baseball) - 3 deals ==========
  {
    athleteEmail: 'tyler.brooks@pcu.edu',
    deal_title: 'Louisville Slugger Equipment Deal',
    brand_name: 'Louisville Slugger',
    third_party_name: 'Wilson Sporting Goods Co.',
    deal_type: 'product_gifting',
    compensation_amount: 6000,
    description: 'Bat and glove sponsorship with social content.',
    status: 'active',
    expectedScore: {
      total: 93,
      status: 'green',
      policyFit: 95,
      fmv: 92,
      document: 92,
      tax: 90,
      brandSafety: 98,
      guardianConsent: 100,
    },
  },
  {
    athleteEmail: 'tyler.brooks@pcu.edu',
    deal_title: 'Sports Card Autograph Deal',
    brand_name: 'TopDeck Cards',
    third_party_name: 'TopDeck Collectibles LLC',
    deal_type: 'autograph',
    compensation_amount: 20000,
    description: 'Signed baseball cards and memorabilia deal.',
    status: 'active',
    expectedScore: {
      total: 86,
      status: 'green',
      policyFit: 88,
      fmv: 85,
      document: 85,
      tax: 82,
      brandSafety: 92,
      guardianConsent: 100,
    },
  },
  {
    athleteEmail: 'tyler.brooks@pcu.edu',
    deal_title: 'Online Sports Betting Partnership',
    brand_name: 'BetMax',
    third_party_name: 'BetMax Gaming Inc.',
    deal_type: 'endorsement',
    compensation_amount: 35000,
    description: 'Promote sports betting app on social media.',
    status: 'on_hold',
    expectedScore: {
      total: 25,
      status: 'red',
      policyFit: 15,
      fmv: 50,
      document: 30,
      tax: 35,
      brandSafety: 10,
      guardianConsent: 100,
      reason_codes: ['Prohibited industry (gambling)', 'NCAA policy violation', 'Institutional policy violation', 'MUST BE REJECTED'],
    },
  },
];

// Discovery profile data for HS students
const discoveryData: Record<string, {
  current_pillar: 'identity' | 'business' | 'money';
  current_day: number;
  unlockedChapters: string[];
  pillars_completed: string[];
  profile_completeness: number;
  sport: string;
  position: string;
  social_platforms: string;
  follower_count_total: number;
  engagement_rate: number;
  nil_interest_level: 'curious' | 'interested' | 'ready';
  nil_experience_level: 'none' | 'beginner' | 'some' | 'experienced';
  has_bank_account: boolean;
  understands_tax_obligations: boolean;
  financial_independence_level: 'dependent' | 'partial' | 'independent';
  athletic_aspirations: string;
  career_aspirations: string;
  causes_passionate_about: string[];
}> = {
  'jordan.smith@student.test': {
    current_pillar: 'business',
    current_day: 2,
    unlockedChapters: ['identity', 'business'],
    pillars_completed: ['identity'],
    profile_completeness: 45,
    sport: 'Football',
    position: 'Running Back',
    social_platforms: JSON.stringify(['instagram', 'tiktok', 'twitter']),
    follower_count_total: 23000,
    engagement_rate: 5.2,
    nil_interest_level: 'interested',
    nil_experience_level: 'beginner',
    has_bank_account: true,
    understands_tax_obligations: false,
    financial_independence_level: 'dependent',
    athletic_aspirations: 'Play D1 football and reach the NFL',
    career_aspirations: 'Sports broadcasting or coaching after playing',
    causes_passionate_about: ['Youth football', 'Education access'],
  },
  'emma.davis@student.test': {
    current_pillar: 'money',
    current_day: 1,
    unlockedChapters: ['identity', 'business', 'money'],
    pillars_completed: ['identity', 'business'],
    profile_completeness: 70,
    sport: 'Softball',
    position: 'Pitcher',
    social_platforms: JSON.stringify(['instagram', 'tiktok']),
    follower_count_total: 44200,
    engagement_rate: 6.8,
    nil_interest_level: 'ready',
    nil_experience_level: 'some',
    has_bank_account: true,
    understands_tax_obligations: true,
    financial_independence_level: 'partial',
    athletic_aspirations: 'Play D1 softball and compete internationally',
    career_aspirations: 'Sports medicine or athletic training',
    causes_passionate_about: ['Women in sports', 'Mental health'],
  },
  'aiden.washington@student.test': {
    current_pillar: 'identity',
    current_day: 3,
    unlockedChapters: ['identity'],
    pillars_completed: [],
    profile_completeness: 25,
    sport: 'Basketball',
    position: 'Shooting Guard',
    social_platforms: JSON.stringify(['instagram', 'tiktok', 'twitter', 'youtube']),
    follower_count_total: 75000,
    engagement_rate: 8.5,
    nil_interest_level: 'interested',
    nil_experience_level: 'none',
    has_bank_account: false,
    understands_tax_obligations: false,
    financial_independence_level: 'dependent',
    athletic_aspirations: 'Play D1 basketball and go to the NBA',
    career_aspirations: 'Professional basketball or sports media',
    causes_passionate_about: ['Youth basketball', 'Inner city programs'],
  },
  'sophia.rodriguez@student.test': {
    current_pillar: 'money',
    current_day: 5,
    unlockedChapters: ['identity', 'business', 'money'],
    pillars_completed: ['identity', 'business', 'money'],
    profile_completeness: 85,
    sport: 'Soccer',
    position: 'Midfielder',
    social_platforms: JSON.stringify(['instagram', 'tiktok', 'youtube']),
    follower_count_total: 86500,
    engagement_rate: 7.2,
    nil_interest_level: 'ready',
    nil_experience_level: 'some',
    has_bank_account: true,
    understands_tax_obligations: true,
    financial_independence_level: 'partial',
    athletic_aspirations: 'Play D1 soccer and join national team',
    career_aspirations: 'Content creation and sports marketing',
    causes_passionate_about: ['Latino representation', 'Girls in sports'],
  },
  'jaylen.thompson@student.test': {
    current_pillar: 'business',
    current_day: 4,
    unlockedChapters: ['identity', 'business'],
    pillars_completed: ['identity'],
    profile_completeness: 55,
    sport: 'Track & Field',
    position: 'Sprinter',
    social_platforms: JSON.stringify(['instagram', 'twitter', 'youtube']),
    follower_count_total: 99000,
    engagement_rate: 6.5,
    nil_interest_level: 'ready',
    nil_experience_level: 'beginner',
    has_bank_account: true,
    understands_tax_obligations: false,
    financial_independence_level: 'partial',
    athletic_aspirations: 'Olympic sprinter and world record holder',
    career_aspirations: 'Professional athlete and motivational speaker',
    causes_passionate_about: ['Track & field growth', 'Black excellence'],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function cleanTestData(): Promise<void> {
  console.log('\n🧹 Cleaning existing test data...');

  const testEmails = testUsers.map((u) => u.email);

  // Get user IDs for test users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const users = authUsers?.users || [];
  const testAuthUsers = users.filter((u: { email?: string }) => testEmails.includes(u.email || ''));

  // Delete from auth (cascades to related tables)
  for (const user of testAuthUsers) {
    try {
      // First clean up related data
      await supabase.from('compliance_scores').delete().eq('user_id', user.id);
      await supabase.from('nil_deals').delete().eq('athlete_id', user.id);
      await supabase.from('student_discovery_profiles').delete().eq('user_id', user.id);
      await supabase.from('parent_child_relationships').delete().or(`parent_id.eq.${user.id},child_id.eq.${user.id}`);
      await supabase.from('institution_staff').delete().eq('user_id', user.id);
      await supabase.from('athlete_profiles').delete().eq('user_id', user.id);
      await supabase.from('users').delete().eq('id', user.id);

      // Finally delete auth user
      await supabase.auth.admin.deleteUser(user.id);
      console.log(`  Deleted: ${user.email}`);
    } catch (err) {
      // Ignore if already deleted
    }
  }

  // Clean test institution
  await supabase.from('institutions').delete().eq('name', PACIFIC_COAST_UNIVERSITY.name);

  console.log('✅ Test data cleaned\n');
}

async function createAuthUser(
  email: string,
  password: string
): Promise<{ id: string; email: string } | null> {
  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const users = existingUsers?.users || [];
  const existing = users.find((u: { email?: string; id: string }) => u.email === email);
  if (existing) {
    console.log(`  User already exists: ${email}`);
    return { id: existing.id, email: existing.email || email };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { email_verified: true },
  });

  if (error) {
    console.error(`  ❌ Failed to create auth user ${email}:`, error.message);
    return null;
  }

  return data.user ? { id: data.user.id, email: data.user.email || email } : null;
}

async function seedInstitution(): Promise<string | null> {
  console.log('\n🏫 Seeding Institution...');

  // Check if exists
  const { data: existing } = await supabase
    .from('institutions')
    .select('id')
    .eq('name', PACIFIC_COAST_UNIVERSITY.name)
    .single();

  if (existing) {
    console.log(`  Already exists: ${PACIFIC_COAST_UNIVERSITY.name}`);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('institutions')
    .insert({
      name: PACIFIC_COAST_UNIVERSITY.name,
      type: PACIFIC_COAST_UNIVERSITY.type,
      state: PACIFIC_COAST_UNIVERSITY.state,
      conference: PACIFIC_COAST_UNIVERSITY.conference,
    })
    .select('id')
    .single();

  if (error) {
    console.error(`  ❌ Failed to create institution:`, error.message);
    return null;
  }

  console.log(`  ✅ Created: ${PACIFIC_COAST_UNIVERSITY.name}`);
  return data.id;
}

async function seedUsers(institutionId: string): Promise<Map<string, string>> {
  console.log('\n👤 Seeding Users...');
  const userMap = new Map<string, string>();

  for (const testUser of testUsers) {
    // Create auth user
    const authUser = await createAuthUser(testUser.email, testUser.password);
    if (!authUser) continue;

    userMap.set(testUser.email, authUser.id);

    // Create unique username by combining name parts with random suffix
    const baseUsername = testUser.email.split('@')[0].replace(/\./g, '_');
    const uniqueUsername = `${baseUsername}_${Date.now().toString(36).slice(-4)}`;

    // Upsert into users table
    const userData: Record<string, any> = {
      id: authUser.id,
      email: testUser.email,
      first_name: testUser.profile.first_name,
      last_name: testUser.profile.last_name,
      full_name: testUser.profile.full_name,
      role: testUser.role,
      username: uniqueUsername,
      onboarding_completed: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await supabase.from('users').upsert(userData, { onConflict: 'id' });

    // Create athlete_profiles for athletes and HS students
    if (testUser.role === 'hs_student' || testUser.role === 'college_athlete') {
      const athleteProfile: Record<string, any> = {
        id: authUser.id,
        user_id: authUser.id,
        role: testUser.role,
        username: uniqueUsername,
        sport: testUser.profile.sport,
        position: testUser.profile.position,
        school_name: testUser.profile.school_name,
        school: testUser.profile.school_name,
        school_level: testUser.profile.school_level,
        graduation_year: testUser.profile.graduation_year,
        year: testUser.profile.graduation_year,
        primary_state: testUser.profile.primary_state,
        state: testUser.profile.primary_state,
        bio: testUser.profile.bio,
        nil_interests: testUser.profile.nil_interests,
        nil_goals: testUser.profile.nil_goals ? [testUser.profile.nil_goals] : null,
        onboarding_completed: true,
        institution_id: testUser.role === 'college_athlete' ? institutionId : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (testUser.profile.date_of_birth) {
        athleteProfile.date_of_birth = testUser.profile.date_of_birth;
      }

      // Delete first if exists, then insert
      await supabase.from('athlete_profiles').delete().eq('user_id', authUser.id);
      const { data: insertedProfile, error: profileError } = await supabase
        .from('athlete_profiles')
        .insert(athleteProfile)
        .select('id')
        .single();

      if (profileError) {
        console.error(`  ⚠️ athlete_profiles error for ${testUser.email}:`, profileError.message);
      }
    }

    // Create athlete_profiles for parents too (for role tracking)
    if (testUser.role === 'parent') {
      const parentProfile: Record<string, any> = {
        id: authUser.id,
        user_id: authUser.id,
        role: 'parent',
        username: uniqueUsername,
        primary_state: testUser.profile.primary_state,
        state: testUser.profile.primary_state,
        bio: testUser.profile.bio,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await supabase.from('athlete_profiles').delete().eq('user_id', authUser.id);
      await supabase.from('athlete_profiles').insert(parentProfile);
    }

    // Create institution_staff for compliance officer
    if (testUser.role === 'compliance_officer') {
      // Also create athlete_profiles for legacy compatibility
      const officerProfile: Record<string, any> = {
        id: authUser.id,
        user_id: authUser.id,
        role: 'compliance_officer',
        username: uniqueUsername,
        primary_state: testUser.profile.primary_state,
        state: testUser.profile.primary_state,
        school_name: PACIFIC_COAST_UNIVERSITY.name,
        school: PACIFIC_COAST_UNIVERSITY.name,
        institution_id: institutionId,
        bio: testUser.profile.bio,
        onboarding_completed: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await supabase.from('athlete_profiles').delete().eq('user_id', authUser.id);
      await supabase.from('athlete_profiles').insert(officerProfile);

      // Create compliance_settings record (links officer to institution in settings UI)
      await supabase.from('compliance_settings').upsert(
        {
          user_id: authUser.id,
          institution_id: institutionId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      // Create institution_staff record
      await supabase.from('institution_staff').upsert(
        {
          user_id: authUser.id,
          institution_id: institutionId,
          role: 'compliance_officer',
          title: 'Director of NIL Compliance',
          is_primary_contact: true,
          permissions: {
            can_view_athletes: true,
            can_review_deals: true,
            can_approve_deals: true,
            can_export_data: true,
          },
        },
        { onConflict: 'user_id,institution_id' }
      );
    }

    const roleEmoji = {
      hs_student: '🎓',
      college_athlete: '🏈',
      parent: '👨‍👧',
      compliance_officer: '🛡️',
    };
    console.log(`  ${roleEmoji[testUser.role]} ${testUser.profile.full_name} (${testUser.email})`);
  }

  return userMap;
}

async function seedParentChildRelationships(userMap: Map<string, string>): Promise<void> {
  console.log('\n👨‍👧 Seeding Parent-Child Relationships...');

  const parentUsers = testUsers.filter((u) => u.role === 'parent' && u.childEmail);

  for (const parent of parentUsers) {
    const parentId = userMap.get(parent.email);
    const childId = parent.childEmail ? userMap.get(parent.childEmail) : null;

    if (!parentId || !childId) {
      console.log(`  ⚠️ Missing user for relationship: ${parent.email} -> ${parent.childEmail}`);
      continue;
    }

    const { error } = await supabase.from('parent_child_relationships').upsert(
      {
        parent_id: parentId,
        child_id: childId,
        relationship_type: 'parent',
        consent_status: 'approved',
        consent_given_at: new Date().toISOString(),
        verification_method: 'email',
        verified_at: new Date().toISOString(),
      },
      { onConflict: 'parent_id,child_id' }
    );

    if (error) {
      console.error(`  ❌ Failed to create relationship:`, error.message);
      continue;
    }

    // Update child's consent status
    await supabase
      .from('athlete_profiles')
      .update({ consent_status: 'approved', parent_email: parent.email })
      .eq('user_id', childId);

    const childUser = testUsers.find((u) => u.email === parent.childEmail);
    console.log(`  ✅ ${parent.profile.full_name} → ${childUser?.profile.full_name}`);
  }
}

async function seedDealsAndComplianceScores(userMap: Map<string, string>): Promise<void> {
  console.log('\n💰 Seeding NIL Deals and Compliance Scores...');

  for (const deal of testDeals) {
    const athleteId = userMap.get(deal.athleteEmail);
    if (!athleteId) {
      console.log(`  ⚠️ Athlete not found: ${deal.athleteEmail}`);
      continue;
    }

    // Create the deal
    const { data: dealData, error: dealError } = await supabase
      .from('nil_deals')
      .insert({
        athlete_id: athleteId,
        agency_id: athleteId,
        deal_title: deal.deal_title,
        brand_name: deal.brand_name,
        third_party_name: deal.third_party_name,
        deal_type: deal.deal_type,
        compensation_amount: deal.compensation_amount,
        description: deal.description,
        status: deal.status,
        compliance_status: deal.expectedScore.status,
        is_third_party_verified: deal.expectedScore.status === 'green',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (dealError) {
      console.error(`  ❌ Failed to create deal "${deal.deal_title}":`, dealError.message);
      continue;
    }

    // Create compliance score
    const { error: scoreError } = await supabase.from('compliance_scores').insert({
      deal_id: dealData.id,
      user_id: athleteId,
      policy_fit_score: deal.expectedScore.policyFit,
      fmv_score: deal.expectedScore.fmv,
      fmv_estimated: deal.compensation_amount,
      document_score: deal.expectedScore.document,
      tax_score: deal.expectedScore.tax,
      w9_required: deal.compensation_amount >= 600,
      w9_submitted: deal.expectedScore.tax >= 80,
      brand_safety_score: deal.expectedScore.brandSafety,
      guardian_consent_score: deal.expectedScore.guardianConsent,
      consent_required: false,
      consent_obtained: true,
      total_score: deal.expectedScore.total,
      status: deal.expectedScore.status,
      reason_codes: deal.expectedScore.reason_codes || [],
      scored_at: new Date().toISOString(),
    });

    if (scoreError) {
      console.error(`  ❌ Failed to create compliance score:`, scoreError.message);
      continue;
    }

    // Create deal_submissions record so deals show as "submitted" (not "Report to School Now")
    const dealCreatedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const deadlineDate = new Date(dealCreatedAt);
    deadlineDate.setDate(deadlineDate.getDate() + 7); // CA default: 7 days

    await supabase.from('deal_submissions').upsert({
      deal_id: dealData.id,
      user_id: athleteId,
      submitted_at: dealCreatedAt.toISOString(),
      submission_method: 'platform',
      state_code: 'CA',
      state_deadline_days: 7,
      deadline_at: deadlineDate.toISOString(),
      status: deal.expectedScore.status === 'green' ? 'approved' : 'submitted',
    }, { onConflict: 'deal_id' });

    const statusEmoji = deal.expectedScore.status === 'green' ? '🟢' : deal.expectedScore.status === 'yellow' ? '🟡' : '🔴';
    const athleteName = deal.athleteEmail.split('@')[0].replace(/\./g, ' ');
    console.log(`  ${statusEmoji} ${deal.deal_title} (${deal.expectedScore.total}/100) - ${athleteName}`);
  }
}

async function seedDiscoveryProfiles(userMap: Map<string, string>): Promise<void> {
  console.log('\n📚 Seeding Discovery Profiles for HS Students...');

  for (const [email, data] of Object.entries(discoveryData)) {
    const userId = userMap.get(email);
    if (!userId) {
      console.log(`  ⚠️ User not found: ${email}`);
      continue;
    }

    // Create student_discovery_profiles
    const { error: profileError } = await supabase
      .from('student_discovery_profiles')
      .upsert({
        user_id: userId,
        sport: data.sport,
        position: data.position,
        social_platforms: data.social_platforms,
        follower_count_total: data.follower_count_total,
        engagement_rate: data.engagement_rate,
        nil_interest_level: data.nil_interest_level,
        nil_experience_level: data.nil_experience_level,
        has_bank_account: data.has_bank_account,
        understands_tax_obligations: data.understands_tax_obligations,
        financial_independence_level: data.financial_independence_level,
        athletic_aspirations: data.athletic_aspirations,
        career_aspirations: data.career_aspirations,
        causes_passionate_about: data.causes_passionate_about,
        current_pillar: data.current_pillar,
        pillars_completed: data.pillars_completed,
        profile_completeness: data.profile_completeness,
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error(`  ⚠️ Discovery profile error for ${email}:`, profileError.message);
    }

    const studentName = email.split('@')[0].replace(/\./g, ' ');
    console.log(`  ✅ ${studentName}: ${data.pillars_completed.length}/4 pillars complete, ${data.profile_completeness}% profile`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     ChatNIL Comprehensive Test Data Seed                         ║');
  console.log('║     5 HS Students + 5 Parents + 5 College Athletes + 1 Officer   ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  try {
    // Clean if requested
    if (shouldClean) {
      await cleanTestData();
    }

    // Seed in order
    const institutionId = await seedInstitution();
    if (!institutionId) {
      console.error('❌ Failed to create institution');
      process.exit(1);
    }

    const userMap = await seedUsers(institutionId);
    await seedParentChildRelationships(userMap);
    await seedDealsAndComplianceScores(userMap);
    await seedDiscoveryProfiles(userMap);

    // Print summary
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                      SEEDING COMPLETE                            ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Summary:');
    console.log('┌──────────────────────────────────────────────────────────────────┐');
    console.log('│ Institution: Pacific Coast University (Big West, Division I)    │');
    console.log('├──────────────────────────────────────────────────────────────────┤');
    console.log('│ Role               │ Count │ Example Logins                      │');
    console.log('├──────────────────────────────────────────────────────────────────┤');
    console.log('│ 🛡️ Compliance Officer │   1   │ michael.torres@pcu.edu             │');
    console.log('│ 🏈 College Athlete   │   5   │ marcus.johnson@pcu.edu             │');
    console.log('│                      │       │ aaliyah.williams@pcu.edu           │');
    console.log('│                      │       │ diego.martinez@pcu.edu             │');
    console.log('│                      │       │ jasmine.chen@pcu.edu               │');
    console.log('│                      │       │ tyler.brooks@pcu.edu               │');
    console.log('│ 🎓 HS Student        │   5   │ jordan.smith@student.test          │');
    console.log('│                      │       │ emma.davis@student.test            │');
    console.log('│                      │       │ aiden.washington@student.test      │');
    console.log('│                      │       │ sophia.rodriguez@student.test      │');
    console.log('│                      │       │ jaylen.thompson@student.test       │');
    console.log('│ 👨‍👧 Parent            │   5   │ robert.smith@email.com             │');
    console.log('│                      │       │ lisa.davis@email.com               │');
    console.log('│                      │       │ marcus.washington@email.com        │');
    console.log('│                      │       │ maria.rodriguez@email.com          │');
    console.log('│                      │       │ denise.thompson@email.com          │');
    console.log('└──────────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('🔐 Password for all users: TestUser123!');
    console.log('');
    console.log('💰 NIL Deals Created: 13 total');
    console.log('   🟢 Green (Compliant):     9 deals');
    console.log('   🟡 Yellow (Needs Review): 2 deals');
    console.log('   🔴 Red (Critical):        2 deals');
    console.log('');
    console.log('📋 To verify:');
    console.log('   1. Login as michael.torres@pcu.edu → See 5 athletes on compliance dashboard');
    console.log('   2. Login as marcus.johnson@pcu.edu → See deals and profile');
    console.log('   3. Login as jordan.smith@student.test → See HS student dashboard');
    console.log('   4. Login as robert.smith@email.com → See parent dashboard with linked child');
    console.log('');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
