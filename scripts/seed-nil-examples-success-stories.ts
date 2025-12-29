#!/usr/bin/env npx tsx
/**
 * Seed NIL Deal Examples and Athlete Success Stories
 *
 * This script adds:
 * - Real-world NIL deal examples across different sports
 * - Athlete success stories showing various NIL paths
 * - Common deal types and structures
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface KnowledgeEntry {
  title: string;
  content: string;
  summary: string;
  content_type: 'deal_example' | 'educational_article' | 'branding_tip';
  category: string;
  tags: string[];
  target_roles: string[];
  difficulty_level: string;
  is_published: boolean;
  is_featured: boolean;
}

const dealExamplesAndStories: KnowledgeEntry[] = [
  // NIL Deal Examples by Type
  {
    title: "NIL Deal Types: Social Media Sponsorships Explained",
    content: `Social media sponsorships are the most common type of NIL deal. Here's how they work and what to expect.

## What Is a Social Media Sponsorship?

A brand pays you to promote their product or service on your social media platforms (Instagram, TikTok, Twitter/X, YouTube).

## Common Deal Structures

### Per-Post Deals
- One-time payment for a single post
- Typical range: $50 - $5,000+ depending on follower count
- Quick turnaround, minimal commitment

### Monthly Retainers
- Fixed monthly payment for ongoing content
- Usually 2-4 posts per month
- Range: $500 - $10,000+ monthly
- Provides steady income

### Performance-Based
- Base payment plus bonuses for engagement
- May include affiliate links with commission
- Higher earning potential, more risk

## What Brands Expect

### Content Requirements
- High-quality photos/videos
- Authentic product integration
- Proper FTC disclosure (#ad, #sponsored)
- Posting at optimal times

### Engagement Metrics
- Minimum likes/comments/shares
- Story views for Instagram
- Video completion rates

## Payment Rates by Follower Count

| Followers | Per-Post Rate |
|-----------|--------------|
| 5K-10K | $100-300 |
| 10K-50K | $300-1,000 |
| 50K-100K | $1,000-2,500 |
| 100K-500K | $2,500-7,500 |
| 500K+ | $7,500+ |

*Rates vary by sport, engagement rate, and brand budget*

## Red Flags to Avoid

- No written contract
- Payment after posting only
- Asking for exclusivity without premium
- Requiring content rights in perpetuity
- Vague deliverable requirements`,
    summary: "Complete guide to social media sponsorship deals including rates, structures, and what to expect.",
    content_type: 'deal_example',
    category: 'deal_types',
    tags: ['social media', 'sponsorship', 'instagram', 'tiktok', 'rates'],
    target_roles: ['athlete', 'parent', 'agency'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: true
  },
  {
    title: "NIL Deal Types: Appearance Fees and Autograph Signings",
    content: `Appearance deals and autograph signings are popular NIL opportunities, especially for high-profile athletes. Here's what to know.

## Appearance Fees

### What Qualifies as an Appearance?
- Store grand openings
- Corporate events
- Charity functions
- Sports camps and clinics
- Trade shows and conventions

### Typical Fee Ranges

| Athlete Level | Appearance Fee |
|---------------|----------------|
| Local star | $500-2,000 |
| Regional recognition | $2,000-5,000 |
| National recognition | $5,000-25,000 |
| Heisman/All-American | $25,000+ |

### What's Usually Included
- 1-3 hours of your time
- Photos with attendees
- Brief speaking/Q&A
- Social media mention

## Autograph Signings

### Types of Signings
1. **Public signings**: Open events at card shops, conventions
2. **Private signings**: Items sent to you for signing
3. **Exclusive signings**: One brand/company owns all your autographs

### Autograph Pricing

| Item Type | Typical Range |
|-----------|--------------|
| Trading cards | $20-100 |
| Footballs/Basketballs | $75-250 |
| Jerseys | $150-400 |
| Premium items | $300+ |

### Key Contract Terms to Negotiate
- Number of items to sign
- Time limits
- Inscription requirements
- Exclusivity period
- Cancellation terms

## Tax Considerations

- All fees are taxable income
- Track expenses (travel, supplies)
- Get payment in writing
- Request 1099 forms from organizers

## Tips for Success

1. Be professional and on time
2. Practice your signature for consistency
3. Set clear boundaries on photo requests
4. Have an agent or parent handle logistics
5. Document everything for tax purposes`,
    summary: "Guide to appearance fees and autograph signing opportunities including typical rates and contract terms.",
    content_type: 'deal_example',
    category: 'deal_types',
    tags: ['appearances', 'autographs', 'signings', 'events', 'fees'],
    target_roles: ['athlete', 'parent', 'agency'],
    difficulty_level: 'intermediate',
    is_published: true,
    is_featured: false
  },
  {
    title: "NIL Deal Types: Local Business Partnerships",
    content: `Local business partnerships are accessible NIL opportunities for athletes at any level. Here's how to land and maximize them.

## Why Local Businesses?

### Benefits for Athletes
- Easier to land than national deals
- Build relationships in your community
- Often more flexible terms
- Can lead to larger opportunities

### Benefits for Businesses
- Connect with local fanbase
- Affordable marketing
- Authentic community connection
- Support local athletes

## Common Local Partners

- Car dealerships
- Restaurants and bars
- Gyms and fitness centers
- Real estate agencies
- Medical/dental practices
- Local retailers
- Insurance agencies

## Deal Examples

### Car Dealership Deal
- **What you get**: Free car use, monthly payment
- **What they get**: Social posts, commercials, appearances
- **Typical value**: $500-3,000/month + vehicle

### Restaurant Partnership
- **What you get**: Free meals, gift cards, payment
- **What they get**: Social posts, dine-in appearances
- **Typical value**: $200-1,000/month + perks

### Gym Ambassador
- **What you get**: Free membership, payment
- **What they get**: Training content, member referrals
- **Typical value**: $100-500/month + membership

## How to Approach Local Businesses

### 1. Research First
- Find businesses that align with your brand
- Look for existing sports sponsorships
- Check if they sponsor your team/school

### 2. Create a Media Kit
- Your bio and achievements
- Social media stats
- Sample content you'd create
- Proposed partnership ideas

### 3. Make the Pitch
- Email or visit in person
- Be professional and prepared
- Focus on value you provide
- Have specific ideas ready

### 4. Start Small
- Offer a trial period
- Prove your value first
- Build the relationship
- Expand over time

## Contract Essentials

- Clear deliverables
- Payment schedule
- Content approval process
- Exclusivity limitations
- Termination clauses`,
    summary: "How to secure and maximize local business partnerships for NIL income.",
    content_type: 'deal_example',
    category: 'deal_types',
    tags: ['local business', 'partnerships', 'car deals', 'restaurants'],
    target_roles: ['athlete', 'parent'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: false
  },
  {
    title: "NIL Deal Types: NIL Collectives and How They Work",
    content: `NIL collectives have become a major source of athlete compensation. Here's everything you need to know about how they work.

## What Is an NIL Collective?

An NIL collective is a group of boosters, fans, or businesses that pool money to pay athletes for NIL activities. They're typically independent from schools but support athletes at specific universities.

## How Collectives Operate

### Funding Sources
- Booster donations
- Business sponsorships
- Subscription services
- Merchandise sales

### Payment Methods
- Monthly stipends
- Per-appearance fees
- Social media payments
- Camp/clinic participation

## Types of Collectives

### 1. Subscription-Based
- Fans pay monthly fee
- Athletes create exclusive content
- Direct fan-to-athlete connection
- Examples: The Twelves (Texas A&M)

### 2. Charitable Collectives
- Donations are tax-deductible
- Athletes do community service
- Focus on charitable activities
- Must follow 501(c)(3) rules

### 3. Business Collectives
- Companies pool resources
- Traditional NIL deal structure
- Athletes promote businesses
- Not tax-deductible for donors

## Important Changes in 2025

Under the House settlement:
- Schools CANNOT promise collective deals during recruiting
- Deals must have "valid business purpose"
- College Sports Commission monitors for pay-for-play
- Transparency requirements increased

## Red Flags with Collectives

- Promises of guaranteed amounts
- No clear business purpose
- Pressure to join quickly
- Lack of written contracts
- Vague deliverable requirements

## How to Work with Collectives

### Do's
- Get everything in writing
- Understand your obligations
- Report deals over $600 to NIL Go
- Consult with compliance office
- Keep records of all activities

### Don'ts
- Accept verbal promises only
- Sign exclusivity without premium
- Ignore your school's policies
- Forget to report properly
- Mix collective $ with school $ confusion`,
    summary: "Understanding NIL collectives, how they work, and how to safely partner with them post-settlement.",
    content_type: 'deal_example',
    category: 'deal_types',
    tags: ['collectives', 'boosters', 'funding', 'collective deals'],
    target_roles: ['athlete', 'parent', 'coach', 'school_admin'],
    difficulty_level: 'intermediate',
    is_published: true,
    is_featured: true
  },
  // Athlete Success Stories
  {
    title: "Success Story: Olympic Sport Athlete Building a Personal Brand",
    content: `Not a football or basketball star? Here's how athletes in Olympic sports are successfully building NIL income.

## The Challenge

Olympic sport athletes often have:
- Smaller social media followings
- Less media coverage
- Fewer national brand opportunities
- But dedicated, passionate fanbases

## Strategies That Work

### 1. Niche Down Your Audience

**Case Example**: A college swimmer with 8,000 Instagram followers
- Focused on swim gear and training content
- Partnered with swimwear brands, goggles companies
- Created training guides and technique videos
- Earned $1,500-2,500/month from niche sponsors

**Key Insight**: Smaller, targeted audiences can be more valuable than large general ones.

### 2. Leverage Your Sport's Community

**Case Example**: A college gymnast
- Connected with local gymnastics clubs
- Offered camps and clinics during off-season
- Partnered with leotard companies
- Created tutorials for young gymnasts
- Generated $20,000+ in first year

### 3. Build Coaching/Training Brand

**Case Example**: A college track athlete
- Started social media showing training routines
- Developed online coaching program
- Partnered with running shoe brand
- Sold training plans ($30-100 each)
- Income: $2,000-4,000/month

### 4. Local Business Focus

Olympic sport athletes often have strong local ties:
- Youth program partnerships
- Local gym/facility deals
- Community appearances
- School clinic programs

## What Makes This Work

1. **Authenticity**: Passion for your sport shows
2. **Education**: Sharing knowledge builds trust
3. **Community**: Smaller sports = tighter communities
4. **Consistency**: Regular content over time
5. **Patience**: Building takes longer but lasts

## Action Steps

1. Define your unique expertise
2. Identify brands in your sport's ecosystem
3. Create valuable content consistently
4. Engage with your community genuinely
5. Start local, expand gradually`,
    summary: "How athletes in non-revenue sports successfully build NIL income through niche branding and community focus.",
    content_type: 'educational_article',
    category: 'success_stories',
    tags: ['olympic sports', 'niche', 'personal brand', 'success story'],
    target_roles: ['athlete', 'parent', 'coach'],
    difficulty_level: 'intermediate',
    is_published: true,
    is_featured: true
  },
  {
    title: "Success Story: Walk-On Athlete Maximizing NIL Without Fame",
    content: `You don't need to be a starter or scholarship athlete to earn NIL income. Here's how walk-ons and lesser-known athletes are finding success.

## The Reality

Most college athletes are NOT household names:
- 180,000+ Division I athletes
- Only a fraction get major media coverage
- But opportunities exist for everyone

## Walk-On Success Strategies

### 1. The Micro-Influencer Approach

**Case Example**: Football walk-on, 3,000 followers
- Documented his walk-on journey on TikTok
- Content about earning respect, hard work
- Resonated with aspiring athletes
- Grew to 50,000 followers in one season
- Signed deals with workout supplement brand

**Result**: $800/month in NIL + products

### 2. The Hometown Hero

**Case Example**: Softball player from small town
- Only D1 athlete from her high school in years
- Local newspaper featured her story
- Local businesses eager to support
- Car dealership, restaurant, insurance agent deals

**Result**: $1,200/month + car use

### 3. The Content Creator

**Case Example**: Men's soccer backup goalkeeper
- Started "Day in the Life" YouTube series
- Behind-the-scenes team content (with permission)
- Training and nutrition content
- Grew consistent audience

**Result**: YouTube ad revenue + brand deals = $500-1,000/month

### 4. The Community Builder

**Case Example**: Track walk-on
- Organized youth track camps
- Partnered with local running store
- Built email list of parents
- Sold training programs

**Result**: $3,000-5,000 per camp season

## Key Takeaways

### It's About Value, Not Fame
- Find your unique story
- Create genuine content
- Serve a specific audience
- Build real relationships

### Start Local
- Your hometown supports you
- Local businesses want local heroes
- Community connection = authenticity

### Be Patient
- NIL takes time to build
- Consistency beats virality
- Relationships compound over time

### Leverage Your Journey
- Walk-on stories inspire
- Underdog narratives resonate
- Hard work is compelling content`,
    summary: "How walk-on and lesser-known athletes build successful NIL income through creativity and local connections.",
    content_type: 'educational_article',
    category: 'success_stories',
    tags: ['walk-on', 'micro-influencer', 'local', 'success story'],
    target_roles: ['athlete', 'parent', 'coach'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: true
  },
  {
    title: "Success Story: Female Athlete Leveraging Equal Opportunity",
    content: `Women's sports NIL is growing rapidly. Here's how female athletes are capitalizing on changing dynamics.

## The Opportunity

Female athletes often have advantages in NIL:
- Higher engagement rates on social media
- Growing interest in women's sports
- Brand diversity opportunities
- Authentic storytelling resonates

## Success Strategies

### 1. The Multi-Platform Approach

**Case Example**: Women's basketball player
- Instagram for polished brand content
- TikTok for personality and trends
- YouTube for longer training content
- Twitter for fan engagement

**Result**: Different sponsors for each platform, $3,000-5,000/month total

### 2. The Lifestyle Brand

**Case Example**: Women's volleyball player
- Built content beyond just volleyball
- Fashion, fitness, college life
- Appealed to broader audience
- Attracted non-sports brands

**Partners**: Clothing brands, beauty products, lifestyle apps
**Result**: Diversified income, less sport-dependent

### 3. The Advocate Platform

**Case Example**: Women's soccer goalkeeper
- Spoke publicly about mental health
- Partnered with therapy/wellness brands
- Created content about athlete mental wellness
- Built authentic mission-driven brand

**Result**: Purpose-aligned deals, speaking fees, $50K+ annual NIL

### 4. The Pioneer Storyteller

**Case Example**: Women's hockey player
- Documented growing her sport's visibility
- Content about being a female athlete
- Partnered with equipment brands expanding women's lines
- Became brand ambassador for women in sports

**Result**: Long-term partnerships, media opportunities

## The Numbers

- Women's college athletes: 47% of D1 athletes
- But historically less NIL money
- Gap closing rapidly since 2023
- Top women's NIL deals now rival men's

## Key Strategies

### Authenticity Wins
- Be genuine, not performative
- Share real stories
- Connect with audience personally

### Diversify Platforms
- Don't rely on one social channel
- Different content for different audiences
- Multiple revenue streams

### Mission Matters
- Stand for something
- Brands want authentic advocates
- Purpose attracts partnerships

### Community Building
- Female athlete networks growing
- Collaboration over competition
- Shared audience benefits all`,
    summary: "How female athletes are building successful NIL brands through authenticity, advocacy, and multi-platform presence.",
    content_type: 'educational_article',
    category: 'success_stories',
    tags: ['womens sports', 'female athletes', 'brand building', 'success story'],
    target_roles: ['athlete', 'parent', 'coach'],
    difficulty_level: 'intermediate',
    is_published: true,
    is_featured: false
  },
  {
    title: "Common NIL Deal Structures: What's in the Contract?",
    content: `Understanding contract structures helps you negotiate better deals. Here are the most common NIL deal components.

## Payment Structures

### 1. Flat Fee
- One-time payment for specific deliverable
- Example: $500 for one Instagram post
- Simple, clear expectations

### 2. Monthly Retainer
- Fixed monthly payment
- Set number of deliverables per month
- Example: $2,000/month for 4 posts + 2 appearances

### 3. Performance-Based
- Base payment + bonuses
- Tied to metrics (views, sales, engagement)
- Example: $1,000 base + $100 per 10K views

### 4. Revenue Share
- Percentage of sales generated
- Usually through affiliate links or codes
- Example: 10-20% of sales from your code

### 5. Hybrid
- Combination of above
- Example: $500/month retainer + 5% of sales

## Key Contract Terms

### Deliverables
- Exactly what content you must create
- Posting schedule and platforms
- Approval process for content

### Term Length
- Start and end dates
- Renewal options
- Early termination clauses

### Exclusivity
- Can you work with competitors?
- Category exclusivity (all energy drinks)
- Brand exclusivity (just that brand)
- Geographic limitations

### Usage Rights
- How can they use your content?
- Duration of usage rights
- Platforms they can use it on
- Can they edit or modify?

### Payment Terms
- When you get paid
- Payment method
- What triggers payment
- Expense reimbursement

## Red Flags in Contracts

- Perpetual content rights
- Overly broad exclusivity
- Payment only after posting (escrow is safer)
- Vague deliverable requirements
- No termination clause
- Unreasonable non-compete terms

## Negotiation Tips

1. **Everything is negotiable** - especially exclusivity and rights
2. **Get it in writing** - verbal agreements aren't enforceable
3. **Understand your value** - research comparable deals
4. **Don't sign immediately** - take time to review
5. **Ask questions** - unclear terms should be clarified`,
    summary: "Understanding common NIL contract structures, terms, and what to negotiate.",
    content_type: 'deal_example',
    category: 'contracts',
    tags: ['contracts', 'deal structure', 'negotiation', 'terms'],
    target_roles: ['athlete', 'parent', 'agency'],
    difficulty_level: 'intermediate',
    is_published: true,
    is_featured: false
  },
  // Practical Examples
  {
    title: "First NIL Deal Checklist: Questions to Ask Before Signing",
    content: `Before signing your first NIL deal, make sure you can answer these questions.

## About the Brand

- [ ] What does the company actually sell?
- [ ] Is this a legitimate business?
- [ ] Do they have other athlete partnerships?
- [ ] Does this brand align with my values?
- [ ] Would I use this product anyway?

## About the Deal

- [ ] What exactly am I required to do?
- [ ] How many posts/appearances/activities?
- [ ] What's the timeline?
- [ ] When and how do I get paid?
- [ ] What's the total compensation value?

## About the Contract

- [ ] Have I read the entire contract?
- [ ] Do I understand every term?
- [ ] What are the exclusivity restrictions?
- [ ] How long do they own my content?
- [ ] Can I terminate if needed?

## About Compliance

- [ ] Is this deal legal in my state?
- [ ] Have I checked with my school's compliance office?
- [ ] Does this need to be reported (over $600)?
- [ ] Does this conflict with team/school sponsors?

## About Taxes

- [ ] Do I understand this is taxable income?
- [ ] Am I tracking expenses properly?
- [ ] Will I receive a 1099?
- [ ] Have I set aside money for taxes?

## Questions to Ask the Brand

1. "Can you send me the full contract before we discuss further?"
2. "What's your approval process for content?"
3. "Are there performance bonuses available?"
4. "What happens if I can't fulfill a deliverable due to injury or team obligations?"
5. "Can we discuss the exclusivity terms?"
6. "When exactly would I receive payment?"

## Who Should Review Your Contract

Before signing, consider having these people review:
- Parent/guardian
- School compliance officer
- Agent (if you have one)
- Attorney (for significant deals)

## Don't Be Afraid to

- Ask for changes to the contract
- Walk away from bad deals
- Take time to decide
- Consult with others
- Negotiate for more

Remember: No deal is better than a bad deal.`,
    summary: "Essential checklist of questions to answer before signing your first NIL deal.",
    content_type: 'compliance_guide',
    category: 'contracts',
    tags: ['first deal', 'checklist', 'questions', 'signing'],
    target_roles: ['athlete', 'parent'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: true
  }
];

async function seedContent() {
  console.log('='.repeat(60));
  console.log('Seeding NIL Deal Examples & Success Stories');
  console.log('='.repeat(60));
  console.log(`Total entries to seed: ${dealExamplesAndStories.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const entry of dealExamplesAndStories) {
    const { error } = await supabase
      .from('knowledge_base')
      .insert({
        ...entry,
        metadata: {
          source: 'nil_examples_success_stories',
          last_verified: new Date().toISOString()
        }
      });

    if (error) {
      console.error(`✗ Failed: ${entry.title.substring(0, 50)}... - ${error.message}`);
      errorCount++;
    } else {
      console.log(`✓ ${entry.title.substring(0, 55)}...`);
      successCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('COMPLETE');
  console.log('='.repeat(60));
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${errorCount}`);

  // Check total count
  const { count } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal knowledge_base entries: ${count}`);
}

seedContent().catch(console.error);
