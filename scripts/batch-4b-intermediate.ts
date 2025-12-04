import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const questions = [
  {
    question: 'A local business offers you free products in exchange for a couple of posts. What is your best first move?',
    options: ['Accept and post immediately', 'Tell no one and hope it is okay', 'Ask your compliance office if this counts as NIL and whether it must be reported', 'Refuse all free products'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'compliance'
  },
  {
    question: 'You are reviewing an NIL contract and see language allowing the company to use your photos forever in all ways. What is the main concern?',
    options: ['Too many followers', 'Too few deliverables', 'Usage rights may be overly broad and long-lasting', 'The contract is too short'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'contracts'
  },
  {
    question: 'A brand pushes you to sign a contract today only and refuses to let you show it to anyone. What should you recognize?',
    options: ['It must be a great deal', 'This is normal', 'These are major red flags that require you to slow down and seek help', 'You should sign and ask questions later'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'safety'
  },
  {
    question: 'From a tax perspective, why is it helpful to keep NIL income in a separate bank account?',
    options: ['So your coach can see it', 'To hide money from your parents', 'To separate business and personal spending and make tracking easier', 'To avoid ever paying taxes'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'taxes'
  },
  {
    question: 'A company asks you to promote its product, but you are unsure if that type of business is allowed at your school. What should you do?',
    options: ['Accept and hope for the best', 'Ask your followers in a poll', 'Check your school NIL policy and ask compliance before agreeing', 'Ask the company if they think it is okay'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'compliance'
  },
  {
    question: 'Which is the BEST example of a contract red flag?',
    options: ['Clear payment schedule', 'Short, easy-to-read terms', 'Clause saying the company can change terms anytime without your consent', 'Reasonable end date'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'contracts'
  },
  {
    question: 'Why might a long-term exclusive deal with a single clothing brand be risky for a developing athlete?',
    options: ['It guarantees too many followers', 'It may block future deals with better brands or terms', 'It makes taxes easier', 'It keeps your schedule free'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 25,
    category: 'contracts'
  },
  {
    question: 'When evaluating if an NIL deal is good for you, which question is MOST important?',
    options: ['Will this impress my teammates?', 'Does this fit my values, schedule, and long-term goals?', 'Is the logo cool?', 'Will it get the most likes?'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 25,
    category: 'branding'
  },
  {
    question: 'You post sponsored content but forget to mention it is sponsored. What is the main risk?',
    options: ['Losing followers to teammates', 'Violating advertising and school guidelines on disclosure', 'Getting fewer comments', 'Getting more practice time'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 25,
    category: 'social_media'
  },
  {
    question: 'Why is it smart to review your school NIL policy at least once each semester?',
    options: ['The font changes often', 'Rules and interpretations can change over time', 'It replaces your textbooks', 'It affects ticket prices'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 25,
    category: 'compliance'
  },
  {
    question: 'A representative offers to handle everything and says you do not need to read the contracts. What is the BEST response?',
    options: ['Agree, to save time', 'Sign quickly', 'Insist on reading and understanding every contract yourself and seek independent advice', 'Let teammates decide'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'contracts'
  },
  {
    question: 'Why might a tax professional be especially helpful for an athlete with multiple NIL deals?',
    options: ['They can renegotiate contracts', 'They design logos', 'They help you report income correctly and identify legitimate deductions', 'They control your playing time'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'taxes'
  },
  {
    question: 'Which social media habit is MOST likely to help your NIL opportunities?',
    options: ['Posting inconsistent, random content', 'Regular, positive content that matches your values and interacts with followers', 'Starting arguments online', 'Ignoring all messages'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 25,
    category: 'social_media'
  },
  {
    question: 'Before working with a new representative or agency, which question is MOST important?',
    options: ['Can you guarantee me a huge deal?', 'What is your experience with athletes like me, and how do you charge?', 'How many followers do you have?', 'Can you promise I will start?'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 25,
    category: 'safety'
  },
  {
    question: 'A brand asks you not to tell your school about your NIL agreement. What should you do?',
    options: ['Agree to keep it secret', 'Only tell your friends', 'Refuse and contact your compliance office immediately', 'Post about the deal without tagging the school'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'safety'
  },
  {
    question: 'You sign a contract but later realize one part conflicts with your team rules. What is the BEST next step?',
    options: ['Ignore it and hope no one notices', 'Quit the team', 'Contact compliance and a legal advisor to discuss options', 'Delete your social media'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'compliance'
  },
  {
    question: 'Why is quality over quantity important when building a social media audience for NIL?',
    options: ['Brands only look at number of accounts you follow', 'High-quality engagement shows real influence, not just raw numbers', 'Fewer followers always means more money', 'It keeps your posts hidden'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 25,
    category: 'branding'
  },
  {
    question: 'Which situation most clearly requires you to double-check with compliance?',
    options: ['Buying new shoes for practice', 'Posting a highlight clip', 'Being offered an NIL deal by someone closely tied to boosters or donors', 'Studying in the library'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'compliance'
  },
  {
    question: 'Why is it risky to rely only on what you see other athletes do on social media to judge what is allowed?',
    options: ['All posts are sponsored', 'Algorithms hide the rules', 'Their situation, school, or state may have different rules than yours', 'Social media is always wrong'],
    correct_answer: 2,
    difficulty: 'intermediate',
    points: 25,
    category: 'basics'
  },
  {
    question: 'When considering an NIL opportunity, which combination shows the BEST decision-making?',
    options: ['Fast money, no questions asked', 'Fits your values, confirmed with compliance, realistic time commitment', 'Long contract you do not read', 'Hidden from your school'],
    correct_answer: 1,
    difficulty: 'intermediate',
    points: 25,
    category: 'safety'
  }
];

async function main() {
  console.log('🚀 BATCH 4B: Intermediate Quiz Questions (20 questions)\n');

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

  console.log(`\n📊 Batch 4B: ${inserted}/20 inserted\n`);

  const { count: totalQuiz } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true });
  const { count: intermediateCount } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('difficulty', 'intermediate');

  console.log('📊 Total quiz questions:', totalQuiz);
  console.log('📊 Intermediate questions:', intermediateCount);
}

main();
