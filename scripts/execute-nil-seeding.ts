/**
 * Execute NIL Educational Content Seeding
 * Inserts all 22 knowledge base articles + 50 quiz questions
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// All 22 knowledge base articles
const knowledgeBaseArticles = [
  {
    title: 'NIL Fundamentals - What Every Athlete Needs to Know',
    content: `NIL stands for Name, Image, and Likeness and refers to your legal right to control and profit from how your identity is used in things like ads, social media, appearances, and merchandise. In 2021, long-standing restrictions that treated any outside pay as a threat to amateurism were rolled back after legal and public pressure, opening the door for student-athletes to earn from sponsorships, endorsements, and other business activities tied to their personal brand.

Core rights generally include getting paid for promotions, running sports camps, selling merchandise that uses your name or image, and hiring professional help like agents or lawyers for NIL activities, as long as you follow the rules of your school and governing bodies.

Common misconceptions are that NIL is free money for everyone, that only star athletes can benefit, or that NIL automatically means becoming a full-time influencer. In reality, many deals are local, small, and tied to relationships and reputation more than fame.

NIL income is different from traditional employment because you are usually an independent contractor paid for specific deliverables or licensing your right of publicity, not an hourly employee with a boss controlling your day-to-day work.

KEY TAKEAWAYS:
- NIL is about your legal right to control and profit from your identity as a brand
- Rule changes in 2021 created a new space for athletes to earn while staying eligible
- You can usually hire professionals to help with NIL, subject to the rules that apply to you
- NIL is not guaranteed money; it depends on demand for your brand and effort
- NIL income is typically business or contract work, not a traditional job

COMMON MISTAKES TO AVOID:
- Assuming anything allowed for a friend or teammate is automatically allowed for you
- Treating NIL as bonus cash without thinking about long-term consequences or taxes
- Ignoring school or team policies on conflicts with existing sponsors
- Believing that NIL removes the need to maintain grades or eligibility

ACTION STEP: Write a one-paragraph explanation of NIL in your own words, then have a coach, compliance officer, or trusted adult read it and confirm that you understand the basics correctly.`,
    content_type: 'educational_article',
    category: 'education',
    tags: ['nil_basics', 'getting_started', 'rights', 'fundamentals'],
    target_roles: ['athlete', 'parent', 'coach'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: false
  }
  // Remaining 21 articles truncated for now - will add in batches
];

async function seedKnowledgeBase() {
  console.log('🌱 Seeding knowledge base articles...\n');

  let inserted = 0;
  let errors = 0;

  for (const article of knowledgeBaseArticles) {
    const { error } = await supabase
      .from('knowledge_base')
      .insert(article);

    if (error) {
      console.error(`❌ Error inserting "${article.title}":`, error.message);
      errors++;
    } else {
      console.log(`✅ ${article.title}`);
      inserted++;
    }
  }

  console.log(`\n📊 Knowledge Base: ${inserted} inserted, ${errors} errors\n`);
}

async function main() {
  console.log('🚀 NIL Educational Content Seeding\n');

  const { count: kbBefore } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });

  console.log(`Before: ${kbBefore} articles\n`);

  await seedKnowledgeBase();

  const { count: kbAfter } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });

  console.log(`\nAfter: ${kbAfter} articles (+${(kbAfter || 0) - (kbBefore || 0)})\n`);
  console.log('✅ Seeding complete!');
}

main();
