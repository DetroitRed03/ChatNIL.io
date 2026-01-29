// Discovery Through Conversation - Question Bank
// Each pillar has 5 days of questions that guide students through discovery

export type PillarType = 'identity' | 'business' | 'money' | 'legacy';

export interface DiscoveryQuestion {
  id: string;
  pillar: PillarType;
  day: number;
  questionNumber: number;
  question: string;
  followUp?: string; // Optional follow-up based on answer
  dataField: string; // Field in student_discovery_profiles to update
  extractionPrompt: string; // How to extract structured data from response
  responseType: 'text' | 'choice' | 'scale' | 'multiselect';
  choices?: string[]; // For choice/multiselect types
}

export interface PillarInfo {
  id: PillarType;
  name: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  chapterTitle: string;
  totalDays: number;
  questionsPerDay: number;
}

// Pillar definitions
export const PILLARS: Record<PillarType, PillarInfo> = {
  identity: {
    id: 'identity',
    name: 'Identity',
    title: 'Who You Are',
    description: 'Discover your personal brand and what makes you unique',
    icon: '🎯',
    color: 'blue',
    chapterTitle: 'The Identity Chapter',
    totalDays: 5,
    questionsPerDay: 3,
  },
  business: {
    id: 'business',
    name: 'Business',
    title: 'The Rules',
    description: 'Learn NIL rules through real scenarios',
    icon: '📋',
    color: 'purple',
    chapterTitle: 'The Business Chapter',
    totalDays: 5,
    questionsPerDay: 3,
  },
  money: {
    id: 'money',
    name: 'Money',
    title: 'Financial Foundations',
    description: 'Build financial literacy and smart money habits',
    icon: '💰',
    color: 'green',
    chapterTitle: 'The Money Chapter',
    totalDays: 5,
    questionsPerDay: 3,
  },
  legacy: {
    id: 'legacy',
    name: 'Legacy',
    title: 'Your Future',
    description: 'Plan for the impact you want to make',
    icon: '🌟',
    color: 'orange',
    chapterTitle: 'The Legacy Chapter',
    totalDays: 5,
    questionsPerDay: 3,
  },
};

export const PILLAR_ORDER: PillarType[] = ['identity', 'business', 'money', 'legacy'];

// ============================================
// IDENTITY PILLAR QUESTIONS (Week 1)
// ============================================
export const IDENTITY_QUESTIONS: DiscoveryQuestion[] = [
  // Day 1: Sport & Position
  {
    id: 'identity-1-1',
    pillar: 'identity',
    day: 1,
    questionNumber: 1,
    question: "Hey! I'm excited to get to know you better. Let's start with the basics - what sport do you play? 🏆",
    dataField: 'sport',
    extractionPrompt: 'Extract the sport name from the response',
    responseType: 'text',
  },
  {
    id: 'identity-1-2',
    pillar: 'identity',
    day: 1,
    questionNumber: 2,
    question: "Nice! What position do you play? Or if it's an individual sport, what's your specialty or event?",
    dataField: 'position',
    extractionPrompt: 'Extract the position or specialty from the response',
    responseType: 'text',
  },
  {
    id: 'identity-1-3',
    pillar: 'identity',
    day: 1,
    questionNumber: 3,
    question: "How long have you been playing? And what got you started in this sport?",
    dataField: 'years_playing',
    extractionPrompt: 'Extract years of experience as a number and origin story as text',
    responseType: 'text',
  },

  // Day 2: Social Media & Content
  {
    id: 'identity-2-1',
    pillar: 'identity',
    day: 2,
    questionNumber: 1,
    question: "Let's talk about your online presence! What social media platforms do you use? (Instagram, TikTok, Twitter, YouTube, etc.)",
    dataField: 'social_platforms',
    extractionPrompt: 'Extract list of social media platforms mentioned',
    responseType: 'multiselect',
    choices: ['Instagram', 'TikTok', 'Twitter/X', 'YouTube', 'Snapchat', 'None yet'],
  },
  {
    id: 'identity-2-2',
    pillar: 'identity',
    day: 2,
    questionNumber: 2,
    question: "What kind of content do you like posting? Game highlights, training videos, day-in-the-life, funny stuff, or something else?",
    dataField: 'content_type',
    extractionPrompt: 'Categorize the content type preferences',
    responseType: 'text',
  },
  {
    id: 'identity-2-3',
    pillar: 'identity',
    day: 2,
    questionNumber: 3,
    question: "If you had 10,000 more followers tomorrow, what would you want to be known for on social media?",
    dataField: 'social_identity_goal',
    extractionPrompt: 'Extract the aspirational social media identity',
    responseType: 'text',
  },

  // Day 3: Leadership & Personality
  {
    id: 'identity-3-1',
    pillar: 'identity',
    day: 3,
    questionNumber: 1,
    question: "How would you describe your leadership style on your team? Are you the vocal leader, lead-by-example type, the hype person, or something else?",
    dataField: 'leadership_style',
    extractionPrompt: 'Categorize leadership style: vocal, example, hype, supportive, quiet, emerging',
    responseType: 'choice',
    choices: ['Vocal Leader', 'Lead by Example', 'The Hype Person', 'Supportive Teammate', 'Quiet Contributor', 'Still Finding My Voice'],
  },
  {
    id: 'identity-3-2',
    pillar: 'identity',
    day: 3,
    questionNumber: 2,
    question: "Think about your teammates for a sec - if they had to describe you in 3 words, what would they say?",
    dataField: 'peer_perception',
    extractionPrompt: 'Extract 3 personality descriptors',
    responseType: 'text',
  },
  {
    id: 'identity-3-3',
    pillar: 'identity',
    day: 3,
    questionNumber: 3,
    question: "What's your biggest strength as an athlete? Not just skills, but what makes you YOU on the field/court?",
    dataField: 'unique_strength',
    extractionPrompt: 'Extract the unique athletic strength or quality',
    responseType: 'text',
  },

  // Day 4: Values & Interests
  {
    id: 'identity-4-1',
    pillar: 'identity',
    day: 4,
    questionNumber: 1,
    question: "Outside of sports, what are you into? Hobbies, interests, things you're passionate about?",
    dataField: 'hobbies_interests',
    extractionPrompt: 'Extract list of hobbies and interests',
    responseType: 'text',
  },
  {
    id: 'identity-4-2',
    pillar: 'identity',
    day: 4,
    questionNumber: 2,
    question: "If a brand wanted to partner with you, what type of brand would feel most authentic? (Sports gear, food, tech, fashion, gaming, local business, etc.)",
    dataField: 'brand_alignment',
    extractionPrompt: 'Extract preferred brand categories for partnerships',
    responseType: 'text',
  },
  {
    id: 'identity-4-3',
    pillar: 'identity',
    day: 4,
    questionNumber: 3,
    question: "Is there anything you'd NEVER promote or partner with, no matter how much they paid?",
    dataField: 'brand_boundaries',
    extractionPrompt: 'Extract deal-breaker categories or values',
    responseType: 'text',
  },

  // Day 5: Personal Brand Summary
  {
    id: 'identity-5-1',
    pillar: 'identity',
    day: 5,
    questionNumber: 1,
    question: "We've learned a lot about you! If you had to describe your personal brand in one sentence - who are you as an athlete and person?",
    dataField: 'personal_brand_statement',
    extractionPrompt: 'Extract the personal brand statement',
    responseType: 'text',
  },
  {
    id: 'identity-5-2',
    pillar: 'identity',
    day: 5,
    questionNumber: 2,
    question: "What's one thing that makes you different from other athletes in your sport?",
    dataField: 'differentiator',
    extractionPrompt: 'Extract the unique differentiating factor',
    responseType: 'text',
  },
  {
    id: 'identity-5-3',
    pillar: 'identity',
    day: 5,
    questionNumber: 3,
    question: "On a scale of 1-10, how confident do you feel about your personal brand right now? (1 = no clue, 10 = crystal clear)",
    dataField: 'brand_confidence_score',
    extractionPrompt: 'Extract numerical score 1-10',
    responseType: 'scale',
    choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  },
];

// ============================================
// BUSINESS PILLAR QUESTIONS (Week 2)
// ============================================
export const BUSINESS_QUESTIONS: DiscoveryQuestion[] = [
  // Day 1: State Rules Awareness
  {
    id: 'business-1-1',
    pillar: 'business',
    day: 1,
    questionNumber: 1,
    question: "Time to talk business! First - do you know if your state allows high school athletes to do NIL deals? (Yes, No, Not Sure)",
    dataField: 'state_nil_awareness',
    extractionPrompt: 'Extract awareness level: yes, no, unsure',
    responseType: 'choice',
    choices: ['Yes, it\'s allowed', 'No, it\'s not allowed', 'Not sure'],
  },
  {
    id: 'business-1-2',
    pillar: 'business',
    day: 1,
    questionNumber: 2,
    question: "Has anyone ever approached you about a sponsorship, promotion, or paid opportunity?",
    dataField: 'previous_approaches',
    extractionPrompt: 'Extract boolean and any details about past approaches',
    responseType: 'text',
  },
  {
    id: 'business-1-3',
    pillar: 'business',
    day: 1,
    questionNumber: 3,
    question: "Quick scenario: A local gym wants to give you free membership in exchange for posting about them on Instagram. Is this an NIL deal? 🤔",
    dataField: 'nil_understanding_1',
    extractionPrompt: 'Assess if they correctly identify this as NIL (yes)',
    responseType: 'text',
  },

  // Day 2: Compliance Scenarios
  {
    id: 'business-2-1',
    pillar: 'business',
    day: 2,
    questionNumber: 1,
    question: "Scenario time! Your coach's friend owns a car dealership and offers you $200 to appear in a commercial. What should you do first?",
    dataField: 'compliance_scenario_1',
    extractionPrompt: 'Assess understanding of checking state rules and school policy first',
    responseType: 'text',
  },
  {
    id: 'business-2-2',
    pillar: 'business',
    day: 2,
    questionNumber: 2,
    question: "True or False: You can use your school's logo or uniform in your personal NIL deals.",
    dataField: 'logo_usage_understanding',
    extractionPrompt: 'Assess if they know this is generally FALSE',
    responseType: 'choice',
    choices: ['True', 'False', 'It depends'],
  },
  {
    id: 'business-2-3',
    pillar: 'business',
    day: 2,
    questionNumber: 3,
    question: "A company DMs you offering $500 for one sponsored post. What questions would you ask before saying yes?",
    dataField: 'deal_evaluation_skills',
    extractionPrompt: 'Extract the types of questions they would ask',
    responseType: 'text',
  },

  // Day 3: Red Flags & Contracts
  {
    id: 'business-3-1',
    pillar: 'business',
    day: 3,
    questionNumber: 1,
    question: "What would be a red flag that a deal might not be legit? What would make you suspicious?",
    dataField: 'red_flag_awareness',
    extractionPrompt: 'Extract red flags they identify',
    responseType: 'text',
  },
  {
    id: 'business-3-2',
    pillar: 'business',
    day: 3,
    questionNumber: 2,
    question: "Should you ever sign a contract without having someone else (parent, lawyer, coach) look at it first?",
    dataField: 'contract_review_understanding',
    extractionPrompt: 'Assess if they know to always get contracts reviewed',
    responseType: 'choice',
    choices: ['Yes, if it looks simple', 'No, always get it reviewed', 'Only for big deals'],
  },
  {
    id: 'business-3-3',
    pillar: 'business',
    day: 3,
    questionNumber: 3,
    question: "Who in your life would you talk to before accepting an NIL deal?",
    dataField: 'support_network',
    extractionPrompt: 'Extract their support network for NIL decisions',
    responseType: 'text',
  },

  // Day 4: Categories & Restrictions
  {
    id: 'business-4-1',
    pillar: 'business',
    day: 4,
    questionNumber: 1,
    question: "Some product categories are often restricted for athlete endorsements. Can you guess which ones might be off-limits for high schoolers?",
    dataField: 'restricted_categories_awareness',
    extractionPrompt: 'Extract their awareness of restricted categories',
    responseType: 'text',
  },
  {
    id: 'business-4-2',
    pillar: 'business',
    day: 4,
    questionNumber: 2,
    question: "Scenario: A vape company offers you $1000. What do you do?",
    dataField: 'ethics_scenario',
    extractionPrompt: 'Assess ethical decision-making - should decline',
    responseType: 'text',
  },
  {
    id: 'business-4-3',
    pillar: 'business',
    day: 4,
    questionNumber: 3,
    question: "What types of NIL activities interest you most? (Social media posts, appearances, camps, merchandise, autographs, etc.)",
    dataField: 'nil_interests',
    extractionPrompt: 'Extract preferred NIL activity types',
    responseType: 'text',
  },

  // Day 5: Business Knowledge Summary
  {
    id: 'business-5-1',
    pillar: 'business',
    day: 5,
    questionNumber: 1,
    question: "After this week, what's the #1 thing you learned about NIL that surprised you?",
    dataField: 'key_learning',
    extractionPrompt: 'Extract the key insight or learning',
    responseType: 'text',
  },
  {
    id: 'business-5-2',
    pillar: 'business',
    day: 5,
    questionNumber: 2,
    question: "On a scale of 1-10, how confident do you feel about understanding NIL rules now?",
    dataField: 'compliance_confidence_score',
    extractionPrompt: 'Extract numerical score 1-10',
    responseType: 'scale',
    choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  },
  {
    id: 'business-5-3',
    pillar: 'business',
    day: 5,
    questionNumber: 3,
    question: "What's one NIL topic you'd like to learn more about?",
    dataField: 'learning_gaps',
    extractionPrompt: 'Extract topics they want to explore further',
    responseType: 'text',
  },
];

// ============================================
// MONEY PILLAR QUESTIONS (Week 3)
// ============================================
export const MONEY_QUESTIONS: DiscoveryQuestion[] = [
  // Day 1: Current Financial Situation
  {
    id: 'money-1-1',
    pillar: 'money',
    day: 1,
    questionNumber: 1,
    question: "Let's talk money! 💰 Do you have any work experience - job, side hustle, or helping with a family business?",
    dataField: 'work_experience',
    extractionPrompt: 'Extract work experience details',
    responseType: 'text',
  },
  {
    id: 'money-1-2',
    pillar: 'money',
    day: 1,
    questionNumber: 2,
    question: "Do you have your own bank account?",
    dataField: 'has_bank_account',
    extractionPrompt: 'Extract boolean: yes or no',
    responseType: 'choice',
    choices: ['Yes, my own account', 'Shared with parent/guardian', 'No, not yet'],
  },
  {
    id: 'money-1-3',
    pillar: 'money',
    day: 1,
    questionNumber: 3,
    question: "When you get money (birthday, work, etc.), what do you usually do with it?",
    dataField: 'spending_habits',
    extractionPrompt: 'Categorize: save, spend, mix',
    responseType: 'text',
  },

  // Day 2: Financial Scenarios
  {
    id: 'money-2-1',
    pillar: 'money',
    day: 2,
    questionNumber: 1,
    question: "Imagine you just made $500 from an NIL deal. How would you split it up?",
    dataField: 'money_allocation',
    extractionPrompt: 'Extract allocation percentages or categories',
    responseType: 'text',
  },
  {
    id: 'money-2-2',
    pillar: 'money',
    day: 2,
    questionNumber: 2,
    question: "Do you know what taxes are and that you might have to pay them on NIL income?",
    dataField: 'tax_awareness',
    extractionPrompt: 'Assess tax awareness level',
    responseType: 'choice',
    choices: ['Yes, I understand taxes', 'Kind of, need to learn more', 'Wait, I have to pay taxes?!'],
  },
  {
    id: 'money-2-3',
    pillar: 'money',
    day: 2,
    questionNumber: 3,
    question: "If you made $1000 in NIL deals, roughly how much should you set aside for taxes? (Take your best guess!)",
    dataField: 'tax_knowledge',
    extractionPrompt: 'Extract their estimate and assess accuracy (should be 20-30%)',
    responseType: 'text',
  },

  // Day 3: Saving & Goals
  {
    id: 'money-3-1',
    pillar: 'money',
    day: 3,
    questionNumber: 1,
    question: "What's something you're saving up for right now, or would want to save for?",
    dataField: 'savings_goals',
    extractionPrompt: 'Extract savings goals',
    responseType: 'text',
  },
  {
    id: 'money-3-2',
    pillar: 'money',
    day: 3,
    questionNumber: 2,
    question: "Have you heard of the 50/30/20 rule for budgeting? (50% needs, 30% wants, 20% savings)",
    dataField: 'budgeting_knowledge',
    extractionPrompt: 'Assess prior budgeting knowledge',
    responseType: 'choice',
    choices: ['Yes, I use it', 'Heard of it', 'No, tell me more'],
  },
  {
    id: 'money-3-3',
    pillar: 'money',
    day: 3,
    questionNumber: 3,
    question: "What do you think is the difference between spending on something you WANT vs. something you NEED?",
    dataField: 'needs_vs_wants',
    extractionPrompt: 'Assess understanding of needs vs wants',
    responseType: 'text',
  },

  // Day 4: Smart Money Decisions
  {
    id: 'money-4-1',
    pillar: 'money',
    day: 4,
    questionNumber: 1,
    question: "Scenario: You get offered two deals - $200 cash OR $400 in store credit at a clothing store. Which do you take and why?",
    dataField: 'value_assessment',
    extractionPrompt: 'Assess their reasoning about value',
    responseType: 'text',
  },
  {
    id: 'money-4-2',
    pillar: 'money',
    day: 4,
    questionNumber: 2,
    question: "What's something you've bought that you regretted? What did you learn from it?",
    dataField: 'money_lessons',
    extractionPrompt: 'Extract financial lessons learned',
    responseType: 'text',
  },
  {
    id: 'money-4-3',
    pillar: 'money',
    day: 4,
    questionNumber: 3,
    question: "Do you track your spending at all? (App, notes, mental math, not at all)",
    dataField: 'expense_tracking',
    extractionPrompt: 'Categorize their tracking method',
    responseType: 'choice',
    choices: ['Yes, I use an app', 'I keep notes', 'Mental math', 'Not really'],
  },

  // Day 5: Financial Confidence
  {
    id: 'money-5-1',
    pillar: 'money',
    day: 5,
    questionNumber: 1,
    question: "After this week, what's the most important money habit you want to build?",
    dataField: 'target_money_habit',
    extractionPrompt: 'Extract the financial habit they want to develop',
    responseType: 'text',
  },
  {
    id: 'money-5-2',
    pillar: 'money',
    day: 5,
    questionNumber: 2,
    question: "On a scale of 1-10, how confident do you feel about managing money from NIL deals?",
    dataField: 'financial_confidence_score',
    extractionPrompt: 'Extract numerical score 1-10',
    responseType: 'scale',
    choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  },
  {
    id: 'money-5-3',
    pillar: 'money',
    day: 5,
    questionNumber: 3,
    question: "Who helps you with money decisions in your life?",
    dataField: 'financial_mentors',
    extractionPrompt: 'Extract financial support network',
    responseType: 'text',
  },
];

// ============================================
// LEGACY PILLAR QUESTIONS (Week 4)
// ============================================
export const LEGACY_QUESTIONS: DiscoveryQuestion[] = [
  // Day 1: Future Vision
  {
    id: 'legacy-1-1',
    pillar: 'legacy',
    day: 1,
    questionNumber: 1,
    question: "Let's dream big! 🌟 Where do you see yourself at 25? What does life look like?",
    dataField: 'vision_at_25',
    extractionPrompt: 'Extract life vision details',
    responseType: 'text',
  },
  {
    id: 'legacy-1-2',
    pillar: 'legacy',
    day: 1,
    questionNumber: 2,
    question: "Is playing your sport professionally a goal? Or is sports a vehicle to something else?",
    dataField: 'athletic_aspirations',
    extractionPrompt: 'Extract professional sports aspirations',
    responseType: 'text',
  },
  {
    id: 'legacy-1-3',
    pillar: 'legacy',
    day: 1,
    questionNumber: 3,
    question: "What do you want to study in college or what career interests you outside of sports?",
    dataField: 'academic_career_interests',
    extractionPrompt: 'Extract academic and career interests',
    responseType: 'text',
  },

  // Day 2: Impact & Influence
  {
    id: 'legacy-2-1',
    pillar: 'legacy',
    day: 2,
    questionNumber: 1,
    question: "What cause or issue do you care deeply about? (Could be anything - environment, mental health, community, education, etc.)",
    dataField: 'causes_passionate_about',
    extractionPrompt: 'Extract causes they care about',
    responseType: 'text',
  },
  {
    id: 'legacy-2-2',
    pillar: 'legacy',
    day: 2,
    questionNumber: 2,
    question: "If you had a big platform, what message would you want to share with young athletes?",
    dataField: 'platform_message',
    extractionPrompt: 'Extract their core message',
    responseType: 'text',
  },
  {
    id: 'legacy-2-3',
    pillar: 'legacy',
    day: 2,
    questionNumber: 3,
    question: "Is there a professional athlete or public figure whose impact you admire? Who and why?",
    dataField: 'role_models',
    extractionPrompt: 'Extract role models and admired qualities',
    responseType: 'text',
  },

  // Day 3: Giving Back
  {
    id: 'legacy-3-1',
    pillar: 'legacy',
    day: 3,
    questionNumber: 1,
    question: "Do you do any volunteer work or community service? If so, what?",
    dataField: 'volunteer_experience',
    extractionPrompt: 'Extract volunteer activities',
    responseType: 'text',
  },
  {
    id: 'legacy-3-2',
    pillar: 'legacy',
    day: 3,
    questionNumber: 2,
    question: "If you could start a foundation or charity one day, what would it focus on?",
    dataField: 'philanthropy_vision',
    extractionPrompt: 'Extract charitable focus area',
    responseType: 'text',
  },
  {
    id: 'legacy-3-3',
    pillar: 'legacy',
    day: 3,
    questionNumber: 3,
    question: "What's one way you could use your platform as an athlete to help others, even now?",
    dataField: 'current_impact_ideas',
    extractionPrompt: 'Extract current impact opportunities',
    responseType: 'text',
  },

  // Day 4: Personal Growth
  {
    id: 'legacy-4-1',
    pillar: 'legacy',
    day: 4,
    questionNumber: 1,
    question: "What's the biggest challenge you've overcome in your life or sports career so far?",
    dataField: 'overcome_challenges',
    extractionPrompt: 'Extract challenge and growth story',
    responseType: 'text',
  },
  {
    id: 'legacy-4-2',
    pillar: 'legacy',
    day: 4,
    questionNumber: 2,
    question: "What skill or quality do you want to develop in the next year?",
    dataField: 'growth_areas',
    extractionPrompt: 'Extract growth goals',
    responseType: 'text',
  },
  {
    id: 'legacy-4-3',
    pillar: 'legacy',
    day: 4,
    questionNumber: 3,
    question: "Imagine you're 40 looking back. What do you hope you'll be proud of?",
    dataField: 'long_term_pride',
    extractionPrompt: 'Extract long-term values and goals',
    responseType: 'text',
  },

  // Day 5: Legacy Summary
  {
    id: 'legacy-5-1',
    pillar: 'legacy',
    day: 5,
    questionNumber: 1,
    question: "In one sentence, what do you want your legacy to be? What do you want to be remembered for?",
    dataField: 'legacy_statement',
    extractionPrompt: 'Extract the legacy statement',
    responseType: 'text',
  },
  {
    id: 'legacy-5-2',
    pillar: 'legacy',
    day: 5,
    questionNumber: 2,
    question: "What's one action you can take THIS MONTH to start building toward that legacy?",
    dataField: 'immediate_action',
    extractionPrompt: 'Extract actionable next step',
    responseType: 'text',
  },
  {
    id: 'legacy-5-3',
    pillar: 'legacy',
    day: 5,
    questionNumber: 3,
    question: "On a scale of 1-10, how clear is your vision for your future?",
    dataField: 'vision_clarity_score',
    extractionPrompt: 'Extract numerical score 1-10',
    responseType: 'scale',
    choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  },
];

// All questions combined
export const ALL_QUESTIONS: DiscoveryQuestion[] = [
  ...IDENTITY_QUESTIONS,
  ...BUSINESS_QUESTIONS,
  ...MONEY_QUESTIONS,
  ...LEGACY_QUESTIONS,
];

// Helper function to get questions for a specific pillar and day
export function getQuestionsForDay(pillar: PillarType, day: number): DiscoveryQuestion[] {
  return ALL_QUESTIONS.filter(q => q.pillar === pillar && q.day === day);
}

// Helper function to get the next question
export function getNextQuestion(
  pillar: PillarType,
  day: number,
  questionNumber: number
): DiscoveryQuestion | null {
  const currentDayQuestions = getQuestionsForDay(pillar, day);
  const nextInDay = currentDayQuestions.find(q => q.questionNumber === questionNumber + 1);

  if (nextInDay) return nextInDay;

  // Move to next day
  const nextDayQuestions = getQuestionsForDay(pillar, day + 1);
  if (nextDayQuestions.length > 0) return nextDayQuestions[0];

  // Move to next pillar
  const currentPillarIndex = PILLAR_ORDER.indexOf(pillar);
  if (currentPillarIndex < PILLAR_ORDER.length - 1) {
    const nextPillar = PILLAR_ORDER[currentPillarIndex + 1];
    const firstQuestion = getQuestionsForDay(nextPillar, 1);
    return firstQuestion[0] || null;
  }

  return null; // Discovery complete
}

// Get total progress percentage
export function getProgressPercentage(pillar: PillarType, day: number, questionNumber: number): number {
  const pillarIndex = PILLAR_ORDER.indexOf(pillar);
  const totalQuestions = ALL_QUESTIONS.length;
  let completedQuestions = 0;

  // Count questions from completed pillars
  for (let i = 0; i < pillarIndex; i++) {
    const pillarQuestions = ALL_QUESTIONS.filter(q => q.pillar === PILLAR_ORDER[i]);
    completedQuestions += pillarQuestions.length;
  }

  // Count questions from current pillar
  const currentPillarQuestions = ALL_QUESTIONS.filter(q => q.pillar === pillar);
  for (const q of currentPillarQuestions) {
    if (q.day < day || (q.day === day && q.questionNumber < questionNumber)) {
      completedQuestions++;
    }
  }

  return Math.round((completedQuestions / totalQuestions) * 100);
}

// Get pillar progress percentage
export function getPillarProgress(pillar: PillarType, day: number, questionNumber: number): number {
  const pillarQuestions = ALL_QUESTIONS.filter(q => q.pillar === pillar);
  let completedQuestions = 0;

  for (const q of pillarQuestions) {
    if (q.day < day || (q.day === day && q.questionNumber < questionNumber)) {
      completedQuestions++;
    }
  }

  return Math.round((completedQuestions / pillarQuestions.length) * 100);
}
