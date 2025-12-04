import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const questions = [
  {
    question: 'What does NIL stand for?',
    options: ['Name, Image, and Likeness', 'National Income Limit', 'New Income Law', 'None of the above'],
    correct_answer: 0,
    difficulty: 'beginner',
    points: 10,
    category: 'basics'
  },
  {
    question: 'When did NIL rules officially change to allow college athletes to profit from endorsements?',
    options: ['2019', '2021', '2023', '2025'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10,
    category: 'basics'
  },
  {
    question: 'NIL income is usually classified as what type of work?',
    options: ['Traditional employment', 'Independent contractor work', 'Volunteer service', 'Grant or scholarship'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10,
    category: 'basics'
  },
  {
    question: 'Is NIL income subject to federal income tax?',
    options: ['No, it is tax-free', 'Only if over $50,000', 'Yes, all NIL income must be reported', 'Only state taxes apply'],
    correct_answer: 2,
    difficulty: 'beginner',
    points: 10,
    category: 'taxes'
  },
  {
    question: 'What is the main difference between W-2 and 1099 income?',
    options: ['W-2 is for employees; 1099 is for independent contractors', '1099 is only for large deals', 'W-2 is tax-free', 'There is no difference'],
    correct_answer: 0,
    difficulty: 'beginner',
    points: 10,
    category: 'taxes'
  },
  {
    question: 'Who is ultimately responsible for ensuring you stay compliant with NIL rules?',
    options: ['Your coach', 'Your parents', 'You, the athlete', 'Your school automatically'],
    correct_answer: 2,
    difficulty: 'beginner',
    points: 10,
    category: 'compliance'
  },
  {
    question: 'What should you always check before signing any NIL contract?',
    options: ['If your friends like the brand', 'School compliance rules and state laws', 'Only the payment amount', 'What color the logo is'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10,
    category: 'compliance'
  },
  {
    question: 'What is a key element every NIL contract should include?',
    options: ['Clear payment terms and deliverables', 'Free merchandise', 'Guaranteed renewal', 'Social media passwords'],
    correct_answer: 0,
    difficulty: 'beginner',
    points: 10,
    category: 'contracts'
  },
  {
    question: 'What should you do if a contract term seems unfair or confusing?',
    options: ['Sign it anyway', 'Have a lawyer or trusted adult review it', 'Ignore that section', 'Post about it on social media'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10,
    category: 'contracts'
  },
  {
    question: 'What is the foundation of a strong personal brand?',
    options: ['Expensive clothes', 'Authenticity and consistency', 'Famous friends', 'Viral moments'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10,
    category: 'branding'
  },
  {
    question: 'Which metric is usually more important to brands than raw follower count?',
    options: ['Number of posts', 'Engagement rate (likes, comments, shares)', 'Account age', 'Profile picture quality'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10,
    category: 'branding'
  },
  {
    question: 'What is a major red flag in an NIL opportunity?',
    options: ['They want to meet in person first', 'They ask for money upfront or request personal financial information', 'They offer a written contract', 'They want references'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10,
    category: 'safety'
  },
  {
    question: 'Before posting sponsored content, you should always:',
    options: ['Post immediately for maximum reach', 'Check disclosure requirements and brand guidelines', 'Delete old posts', 'Turn off comments'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10,
    category: 'social_media'
  },
  {
    question: 'What is the best way to handle negative comments on a sponsored post?',
    options: ['Delete all negative comments', 'Argue back publicly', 'Ignore completely', 'Respond professionally or not at all, depending on the situation'],
    correct_answer: 3,
    difficulty: 'beginner',
    points: 10,
    category: 'social_media'
  },
  {
    question: 'Why is maintaining academic eligibility important for NIL?',
    options: ['It is not important at all', 'Brands want athletes who are responsible and represent them well', 'Only for tax reasons', 'Coaches require it but brands do not care'],
    correct_answer: 1,
    difficulty: 'beginner',
    points: 10,
    category: 'basics'
  }
];

async function main() {
  console.log('🚀 BATCH 4A: Beginner Quiz Questions (15 questions)\n');

  let inserted = 0;
  for (const q of questions) {
    const { error } = await supabase.from('quiz_questions').insert(q);
    if (error) {
      console.log('❌', q.question.substring(0, 50), '...', error.message);
    } else {
      console.log('✅', q.question.substring(0, 65));
      inserted++;
    }
  }

  console.log(`\n📊 Batch 4A: ${inserted}/15 inserted\n`);

  const { count: totalQuiz } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true });
  const { count: beginnerCount } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('difficulty', 'beginner');

  console.log('📊 Total quiz questions:', totalQuiz);
  console.log('📊 Beginner questions:', beginnerCount);
}

main();
