import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const questions = [
  {
    question: 'You are considering forming a business entity like a company to manage your NIL activities. What is the main strategic benefit?',
    options: ['It guarantees more playing time', 'It automatically removes all taxes', 'It can help separate personal and business matters and support long-term growth', 'It makes you immune to rules'],
    correct_answer: 2,
    difficulty: 'expert',
    points: 100,
    category: 'taxes'
  },
  {
    question: 'A collective, a local business group, and a national brand all want to be involved in the same NIL project with you. What is your top priority?',
    options: ['Picking the best logo', 'Posting first and sorting details later', 'Making sure roles, payments, and rules for each party are clearly written and compliant', 'Asking your teammates to negotiate'],
    correct_answer: 2,
    difficulty: 'expert',
    points: 100,
    category: 'contracts'
  },
  {
    question: 'You are designing a long-term brand strategy that should last beyond your playing career. Which focus is MOST important?',
    options: ['Chasing every short-term viral trend', 'Staying consistent with your core values, skills, and the audience you want long term', 'Only posting during wins', 'Copying famous athletes exactly'],
    correct_answer: 1,
    difficulty: 'expert',
    points: 100,
    category: 'branding'
  },
  {
    question: 'You are offered an NIL role that blends sponsorship, content creation, and partial ownership in a small company. What kind of support is most important before saying yes?',
    options: ['Choosing your favorite jersey number', 'Asking only your followers', 'Coordinated advice from legal, tax, and compliance professionals', 'Ignoring all feedback'],
    correct_answer: 2,
    difficulty: 'expert',
    points: 100,
    category: 'safety'
  },
  {
    question: 'A complicated NIL opportunity might impact your eligibility, taxes, and future pro opportunities. What mindset best reflects expert-level NIL navigation?',
    options: ['If it pays now, it must be good.', 'If others are doing it, it is safe.', 'Slow down, get full information, consult experts, and decide based on long-term goals.', 'Never ask questions.'],
    correct_answer: 2,
    difficulty: 'expert',
    points: 100,
    category: 'basics'
  }
];

async function main() {
  console.log('🚀 BATCH 4D: Expert Quiz Questions (5 questions)\n');

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

  console.log(`\n📊 Batch 4D: ${inserted}/5 inserted\n`);

  const { count: totalQuiz } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true });
  const { count: expertCount } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('difficulty', 'expert');

  console.log('📊 Total quiz questions:', totalQuiz);
  console.log('📊 Expert questions:', expertCount);
}

main();
