# Complete NIL Educational Content Seeding

## Quick Start - Copy/Paste SQL Below

Open your Supabase SQL Editor:
https://supabase.com/dashboard/project/lqskiijspudfocddhkqs/sql/new

Then paste and run the complete SQL from the markdown file you provided.

The SQL includes:
- 22 knowledge base articles (8 core education + 7 compliance + 7 high school)
- 50 quiz questions (15 beginner + 20 intermediate + 15 advanced/expert)

## Verification After Running

Run this to check counts:
```sql
SELECT category, COUNT(*) 
FROM knowledge_base 
GROUP BY category;

SELECT difficulty, COUNT(*), SUM(points) as total_points
FROM quiz_questions 
GROUP BY difficulty;
```

Expected results:
- knowledge_base: 22+ new articles
- quiz_questions: 50+ new questions
