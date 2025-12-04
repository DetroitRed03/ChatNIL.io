import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const questions = [
  {
    question: 'You already have two long-term NIL deals and receive a third offer that overlaps with them. What is your FIRST step?',
    options: ['Accept all three and see what happens', 'Ask compliance and a legal advisor to check for conflicts or exclusivity issues', 'Cancel the old deals without reading them', 'Flip a coin'],
    correct_answer: 1,
    difficulty: 'advanced',
    points: 50,
    category: 'contracts'
  },
  {
    question: 'A company wants to pay partly in products and partly in money, with complex deliverables. What should you focus on most when reviewing the agreement?',
    options: ['The color of their logo', 'Whether the deliverables, timeline, and compensation are clearly defined', 'The number of emojis used', 'How many followers the brand has'],
    correct_answer: 1,
    difficulty: 'advanced',
    points: 50,
    category: 'contracts'
  },
  {
    question: 'You get NIL offers from two competing brands in the same product category. What strategic question should you ask yourself?',
    options: ['Which one has the shortest name?', 'Which deal best supports my long-term brand and relationships, not just short-term perks?', 'Which one will upset my coach most?', 'Which one has the brightest colors?'],
    correct_answer: 1,
    difficulty: 'advanced',
    points: 50,
    category: 'branding'
  },
  {
    question: 'Your NIL activities are generating steady income from multiple small deals. Which strategic step will help you most long-term?',
    options: ['Hiding the income from everyone', 'Ignoring taxes until later', 'Organizing your activities like a small business, with tracking and professional advice', 'Refusing all new work'],
    correct_answer: 2,
    difficulty: 'advanced',
    points: 50,
    category: 'taxes'
  },
  {
    question: 'A brand wants you to speak publicly about a controversial topic tied to their campaign. What should you consider first?',
    options: ['Whether your teammates will like it', 'Whether it fits your values, your audience, and your long-term reputation', 'Whether you can post it at midnight', 'How many hashtags you can use'],
    correct_answer: 1,
    difficulty: 'advanced',
    points: 50,
    category: 'branding'
  },
  {
    question: 'A potential representative suggests a contract that automatically renews with no clear end date. What is the main concern?',
    options: ['Too much social media exposure', 'It could lock you in for longer than you want without a clear exit', 'It is printed in color', 'It mentions your sport'],
    correct_answer: 1,
    difficulty: 'advanced',
    points: 50,
    category: 'safety'
  },
  {
    question: 'You are planning a personal training camp as part of your NIL activities. What is a key compliance question?',
    options: ['What snacks to bring', 'Whether you can charge your coaches', 'Whether running the camp is allowed under your level rules and how it must be reported', 'What music to play'],
    correct_answer: 2,
    difficulty: 'advanced',
    points: 50,
    category: 'compliance'
  },
  {
    question: 'A brand asks for permission to edit your photos and videos for future use. How do you protect yourself?',
    options: ['Let them use anything forever', 'Refuse all editing', 'Set clear limits on how, where, and for how long your content can be used', 'Ask them not to credit you'],
    correct_answer: 2,
    difficulty: 'advanced',
    points: 50,
    category: 'contracts'
  },
  {
    question: 'You notice your NIL work is starting to hurt your sleep and school performance. What is the best strategic move?',
    options: ['Add more deals to increase income', 'Ignore it and push harder', 'Reevaluate your commitments and possibly scale back or renegotiate', 'Quit your sport'],
    correct_answer: 2,
    difficulty: 'advanced',
    points: 50,
    category: 'safety'
  },
  {
    question: 'A company wants to feature you alongside several other athletes from different schools in a joint campaign. What is a key issue to confirm?',
    options: ['Your teammates favorite songs', 'How many cameras they will use', 'That each athlete school and rules allow participation and any group agreements', 'The exact color of the backdrop'],
    correct_answer: 2,
    difficulty: 'advanced',
    points: 50,
    category: 'compliance'
  }
];

async function main() {
  console.log('🚀 BATCH 4C: Advanced Quiz Questions (10 questions)\n');

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

  console.log(`\n📊 Batch 4C: ${inserted}/10 inserted\n`);

  const { count: totalQuiz } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true });
  const { count: advancedCount } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('difficulty', 'advanced');

  console.log('📊 Total quiz questions:', totalQuiz);
  console.log('📊 Advanced questions:', advancedCount);
}

main();
