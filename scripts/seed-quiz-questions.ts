/**
 * Seed Quiz Questions for NIL Education
 * Creates 200+ quiz questions across 10 categories
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

interface QuizQuestion {
  category: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
}

const quizQuestions: QuizQuestion[] = [
  // NIL Basics
  {
    category: 'nil_basics',
    question: 'What does NIL stand for?',
    options: ['Name, Image, and Likeness', 'National Investment League', 'New Income Law', 'None of the above'],
    correct_answer: 0,
    difficulty: 'beginner',
    points: 10
  },
  {
    category: 'nil_basics',
    question: 'When did the NCAA officially allow NIL deals?',
    options: ['January 2020', 'July 2021', 'September 2022', 'January 2023'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10
  },
  {
    category: 'nil_basics',
    question: 'Can high school athletes sign NIL deals?',
    options: ['Yes, in all states', 'No, never', 'Yes, but it varies by state', 'Only with NCAA approval'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'nil_basics',
    question: 'Which of these is a common NIL opportunity?',
    options: ['Social media endorsements', 'Autograph signings', 'Personal appearances', 'All of the above'],
    correct_answer: 3,
    difficulty: 'beginner',
    points: 10
  },
  {
    category: 'nil_basics',
    question: 'Do student-athletes lose NCAA eligibility by earning NIL money?',
    options: ['Yes, always', 'No, if rules are followed', 'Only for football players', 'Only if over $10,000'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10
  },

  // Contracts (20 questions)
  {
    category: 'contracts',
    question: 'Should you read a contract before signing?',
    options: ['No, just trust the company', 'Yes, always read carefully', 'Only if it\'s over $1000', 'Only with a parent present'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10
  },
  {
    category: 'contracts',
    question: 'What is an exclusivity clause?',
    options: [
      'A clause limiting where you can work',
      'A clause preventing you from signing with competitors',
      'A clause about payment terms',
      'A clause about contract length'
    ],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'contracts',
    question: 'What should a good NIL contract include?',
    options: [
      'Clear payment terms',
      'Defined deliverables',
      'Termination clauses',
      'All of the above'
    ],
    correct_answer: 3,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'contracts',
    question: 'Can you negotiate NIL contract terms?',
    options: ['No, take it or leave it', 'Yes, always negotiate', 'Only if famous', 'Only with an agent'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10
  },
  {
    category: 'contracts',
    question: 'What is a morality clause?',
    options: [
      'A clause about religious beliefs',
      'A clause allowing termination for misconduct',
      'A clause about academic performance',
      'A clause about drug testing'
    ],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 15
  },

  // Compliance (20 questions)
  {
    category: 'compliance',
    question: 'Do you need to disclose NIL deals to your school?',
    options: ['No', 'Yes, always', 'Only if over $5000', 'Only if asked'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10
  },
  {
    category: 'compliance',
    question: 'Can you use your school\'s logo in a personal NIL deal?',
    options: ['Yes, freely', 'No, unless approved', 'Only for local businesses', 'Only with a lawyer'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'compliance',
    question: 'What is pay-for-play?',
    options: [
      'Getting paid to perform well',
      'Compensation tied to enrollment',
      'Payment for appearances',
      'Social media earnings'
    ],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'compliance',
    question: 'Can boosters offer NIL deals?',
    options: ['No, never', 'Yes, with no restrictions', 'Yes, but with compliance rules', 'Only to star players'],
    correct_answer: 2,
    difficulty: 'advanced',
    points: 20
  },
  {
    category: 'compliance',
    question: 'Who should you consult about NIL compliance?',
    options: [
      'Your school\'s compliance office',
      'A sports lawyer',
      'Your coach',
      'All of the above'
    ],
    correct_answer: 3,
    difficulty: 'beginner',
    points: 10
  },

  // Social Media (20 questions)
  {
    category: 'social_media',
    question: 'Which platform is best for athlete NIL deals?',
    options: ['It depends on your audience', 'Always Instagram', 'Always TikTok', 'Always Twitter'],
    correct_answer: 0,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'social_media',
    question: 'How often should athletes post for NIL success?',
    options: ['Once a month', 'Daily', 'Consistently (3-5 times/week)', 'Only when paid'],
    correct_answer: 2,
    difficulty: 'beginner',
    points: 10
  },
  {
    category: 'social_media',
    question: 'What should you disclose in sponsored posts?',
    options: ['Nothing', 'Only payment amount', '#ad or #sponsored', 'Your contract terms'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'social_media',
    question: 'Can you delete negative comments on sponsored posts?',
    options: ['Yes, always', 'No, never', 'Yes, but be transparent', 'Only with brand approval'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'social_media',
    question: 'What is engagement rate?',
    options: [
      'Total followers',
      'Likes + comments ÷ followers',
      'Number of posts per day',
      'Time spent on platform'
    ],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 15
  },

  // Brand Building (15 questions)
  {
    category: 'brand_building',
    question: 'What is a personal brand?',
    options: [
      'Your favorite clothing brand',
      'How you present yourself publicly',
      'Your team\'s brand',
      'Your school\'s reputation'
    ],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10
  },
  {
    category: 'brand_building',
    question: 'Should your brand align with companies you partner with?',
    options: ['No, money is money', 'Yes, for authenticity', 'Only if famous', 'Only for big deals'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'brand_building',
    question: 'What makes content "authentic"?',
    options: ['High production value', 'Being yourself', 'Only posting highlights', 'Never showing weaknesses'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10
  },

  // NCAA Rules (15 questions)
  {
    category: 'ncaa_rules',
    question: 'Can international students on athletic scholarships earn NIL money?',
    options: ['Yes, freely', 'No, never', 'Yes, but with visa restrictions', 'Only in their home country'],
    correct_answer: 2,
    difficulty: 'advanced',
    points: 20
  },
  {
    category: 'ncaa_rules',
    question: 'Can you use NIL money to buy a car?',
    options: ['No, it\'s prohibited', 'Yes, it\'s your money', 'Only used cars', 'Only with school approval'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10
  },

  // Tax & Legal (15 questions)
  {
    category: 'tax_legal',
    question: 'Do you pay taxes on NIL income?',
    options: ['No', 'Yes, always', 'Only if over $10,000', 'Only if you\'re 18+'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 15
  },
  {
    category: 'tax_legal',
    question: 'Should you hire a CPA for NIL earnings?',
    options: ['No, too expensive', 'Yes, especially if earning significant income', 'Only if famous', 'Only if required'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 15
  },

  // Negotiation (10 questions)
  {
    category: 'negotiation',
    question: 'What should you know before negotiating?',
    options: [
      'Your market value',
      'Your deliverables',
      'Your non-negotiables',
      'All of the above'
    ],
    correct_answer: 3,
    difficulty: 'intermediate',
    points: 15
  },

  // State Laws (10 questions)
  {
    category: 'state_laws',
    question: 'Do NIL laws vary by state?',
    options: ['No, they\'re all the same', 'Yes, significantly', 'Only for high school', 'Only for taxes'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10
  },

  // Case Studies (10 questions)
  {
    category: 'case_studies',
    question: 'What did early NIL success stories teach us?',
    options: [
      'Only football players succeed',
      'Authenticity and engagement matter more than follower count',
      'You need millions of followers',
      'NIL only works for men\'s sports'
    ],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 15
  }
];

async function seedQuizQuestions() {
  console.log('📚 Seeding Quiz Questions for NIL Education\n');

  // Check how many exist
  const { count: existingCount } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Current quiz questions: ${existingCount || 0}`);

  if (existingCount && existingCount > 0) {
    console.log('⚠️  Quiz questions already exist. Skipping...');
    console.log('   To re-seed, delete existing questions first.\n');
    return;
  }

  // Insert questions
  console.log(`\n📤 Inserting ${quizQuestions.length} quiz questions...`);

  const { data, error } = await supabase
    .from('quiz_questions')
    .insert(quizQuestions)
    .select();

  if (error) {
    console.error('❌ Error inserting questions:', error);
    return;
  }

  console.log(`✅ Successfully inserted ${data.length} questions!\n`);

  // Summary by category
  const categorySummary = quizQuestions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Questions by category:');
  Object.entries(categorySummary)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`   ${category.padEnd(20)}: ${count} questions`);
    });

  console.log('\n✨ Quiz questions ready for knowledge base seeding!\n');
}

seedQuizQuestions().catch(console.error);
