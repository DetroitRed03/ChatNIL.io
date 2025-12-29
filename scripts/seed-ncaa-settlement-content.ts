#!/usr/bin/env npx tsx
/**
 * Seed NCAA House v. NCAA Settlement Content (2024-2025)
 *
 * This script adds comprehensive content about:
 * - House v. NCAA Settlement details
 * - Revenue sharing implementation
 * - 2025 NIL rule changes
 * - High school athlete requirements
 * - Roster limits and scholarship changes
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
  content_type: 'nil_regulation' | 'educational_article' | 'compliance_guide' | 'faq';
  category: string;
  tags: string[];
  target_roles: string[];
  difficulty_level: string;
  is_published: boolean;
  is_featured: boolean;
}

const ncaaSettlementContent: KnowledgeEntry[] = [
  // Core Settlement Information
  {
    title: "House v. NCAA Settlement: Complete Guide for Athletes (2025)",
    content: `The House v. NCAA Settlement, approved on June 6, 2025, is the most significant change in college athletics history. Here's everything athletes need to know.

## What Is the House Settlement?

The House v. NCAA settlement is a $2.8 billion class action lawsuit resolution that fundamentally changes how college athletes can be compensated. It creates a system where schools can directly pay athletes through revenue sharing.

## Key Dates to Remember

- **June 6, 2025**: Settlement approved by Judge Claudia Wilken
- **July 1, 2025**: Revenue sharing payments begin; new NIL rules take effect
- **June 11, 2025**: NIL Go portal launched for deal reporting

## What This Means for You

### If You're a Current Athlete
- Your school can now pay you directly up to their revenue sharing cap
- You must report all NIL deals over $600 to NIL Go within 2 weeks of enrollment
- Third-party NIL deals are still allowed alongside institutional payments

### If You're a High School Prospect
- You must disclose NIL deals over $600 starting July 1, 2025 or your junior year
- Schools cannot promise you specific third-party NIL deals as a recruiting incentive
- Revenue sharing eligibility begins when you enroll

## Revenue Sharing Explained

Schools can pay athletes directly up to 22% of their average annual athletic revenue, capped at:
- **2025-26**: $20.5 million per school
- **2034-35**: Projected $32.9 million per school (4% annual increase)

Football and men's basketball receive the largest shares, but all sports are eligible.

## The College Sports Commission

The NCAA no longer directly enforces NIL rules. The new College Sports Commission (CSC) handles:
- Revenue sharing compliance
- NIL deal verification
- Enforcement of new bylaws`,
    summary: "Complete guide to the 2025 House v. NCAA settlement including revenue sharing, key dates, and what athletes need to do.",
    content_type: 'educational_article',
    category: 'ncaa_settlement',
    tags: ['house settlement', 'revenue sharing', '2025 rules', 'ncaa', 'nil'],
    target_roles: ['athlete', 'parent', 'coach', 'school_admin'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: true
  },
  {
    title: "Revenue Sharing 2025: How Schools Pay Athletes Directly",
    content: `Revenue sharing is the new system allowing NCAA Division I schools to pay student-athletes directly from athletic department revenue. Here's how it works.

## The Basics

Starting July 1, 2025, schools that opt into the House settlement can share up to 22% of their athletic revenue directly with student-athletes.

## The Cap

- **Year 1 (2025-26)**: $20.5 million maximum per school
- **Annual Increase**: 4% per year
- **Year 10 (2034-35)**: Projected $32.9 million maximum

## How Money Is Distributed

Schools decide how to allocate their revenue sharing budget. Common approaches:

### By Sport Revenue
- Football: Often receives $13-16 million of the cap
- Men's Basketball: $5-7 million typical allocation
- Women's Basketball: $250K-$500K typical
- Olympic Sports: Smaller shares based on revenue generation

### Per-Athlete Average
- Football (105 roster): ~$120K-150K per player average
- Men's Basketball (15 roster): ~$350K-470K per player average
- Note: Star players may receive significantly more than averages

## Important Rules

1. **Opt-In Required**: Schools must commit to the settlement to offer revenue sharing
2. **Not All Schools Participate**: Some schools cannot afford the maximum cap
3. **Counted Toward Benefits**: Revenue sharing counts toward total benefits cap
4. **Taxable Income**: Revenue sharing payments are taxable as income

## What About NIL?

Revenue sharing is SEPARATE from third-party NIL deals:
- You can receive BOTH revenue sharing AND NIL payments
- Total compensation has no cap (only the school's revenue sharing portion is capped)
- NIL deals still require valid business purpose and disclosure`,
    summary: "How the new revenue sharing system works, including caps, distribution by sport, and how it relates to NIL deals.",
    content_type: 'educational_article',
    category: 'ncaa_settlement',
    tags: ['revenue sharing', 'direct payment', 'compensation', '2025'],
    target_roles: ['athlete', 'parent', 'school_admin'],
    difficulty_level: 'intermediate',
    is_published: true,
    is_featured: true
  },
  {
    title: "NIL Go: The New Reporting System All Athletes Must Use",
    content: `NIL Go is the official clearinghouse for reporting NIL deals under the new House settlement rules. Here's what you need to know.

## What Is NIL Go?

NIL Go is a third-party clearinghouse developed by the College Sports Commission (CSC) where all student-athletes must report NIL deals over $600.

## Who Must Report?

- **Current Division I athletes**: All NIL deals over $600
- **High school prospects**: Deals from July 1, 2025 or start of junior year
- **Junior college prospects**: Deals from July 1, 2025 or initial JUCO enrollment
- **Transfer students**: Must report deals upon enrollment at new school

## Reporting Deadlines

You have **2 weeks from initial enrollment** to report all qualifying NIL deals into NIL Go.

## What Must Be Reported?

Any NIL deal valued at $600 or more, including:
- Cash payments
- Products and services (fair market value)
- Social media sponsorships
- Appearance fees
- Autograph signings
- Camp and clinic payments

## How to Report

1. Create an NIL Go account (link provided by your school)
2. Enter deal details: brand, value, duration, activities required
3. Upload contract documents if available
4. Submit for review

## Consequences of Not Reporting

Failure to properly report NIL deals can result in:
- Loss of eligibility
- School sanctions
- Investigation by College Sports Commission
- Required repayment in some cases

## Privacy Concerns

Deal details reported to NIL Go are shared with:
- Your school's compliance office
- The College Sports Commission
- May be disclosed in investigations

Individual deal amounts are generally not made public, but aggregate data may be published.`,
    summary: "Guide to NIL Go, the mandatory reporting system for all NIL deals over $600, including deadlines and requirements.",
    content_type: 'compliance_guide',
    category: 'ncaa_settlement',
    tags: ['nil go', 'reporting', 'compliance', 'disclosure', 'csc'],
    target_roles: ['athlete', 'parent', 'coach', 'school_admin'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: false
  },
  {
    title: "High School Athletes and NIL: 2025 Disclosure Requirements",
    content: `High school athletes pursuing Division I athletics now have specific NIL disclosure requirements. Here's what you and your parents need to know.

## The New Rules (Effective July 1, 2025)

If you're a high school athlete planning to compete in NCAA Division I, you must disclose all third-party NIL deals over $600 to the College Sports Commission.

## When Does Reporting Begin?

Your disclosure requirement starts on the LATER of:
- July 1, 2025
- The first day of your junior year of high school

## What Must Be Disclosed?

Any NIL agreement that:
- Is worth $600 or more in total value
- Was executed, agreed upon, or includes payments after your disclosure start date
- Includes any form of compensation (cash, products, services)

## Key Differences: High School vs. College NIL

| High School NIL | College NIL |
|-----------------|-------------|
| Governed by state athletic associations | Governed by NCAA/CSC rules |
| Rules vary significantly by state | More uniform national rules |
| Some states have strict limits | More opportunities available |
| Eligibility can be fragile | Clearer guidelines |

## State-by-State Considerations

What's legal for a high school athlete in one state may cost you eligibility in another. Always check:
- Your state high school athletic association rules
- Any state NIL legislation
- Your school's specific policies

## For Parents

As a parent, you should:
1. Track all NIL deals your child enters
2. Keep copies of all contracts
3. Report deals over $600 before the deadline
4. Consult with your school's counselor about state rules
5. Consider consulting an attorney for significant deals

## Recruiting Implications

Important: Under the new rules, colleges CANNOT promise you specific third-party NIL deals as recruiting incentives. Any school that does is violating NCAA rules.

What schools CAN tell you:
- General NIL climate at their school
- Past NIL opportunities available
- Revenue sharing projections
- Support resources available`,
    summary: "What high school athletes need to know about NIL disclosure requirements for Division I recruitment, effective 2025.",
    content_type: 'compliance_guide',
    category: 'high_school_nil',
    tags: ['high school', 'disclosure', 'recruitment', 'juniors', '2025 rules'],
    target_roles: ['athlete', 'parent', 'coach'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: true
  },
  {
    title: "Roster Limits Replace Scholarships: What Changed in 2025",
    content: `The House settlement fundamentally changed how college teams are built. Instead of scholarship limits, schools now have roster limits. Here's what changed.

## The Old System: Scholarship Limits

Previously, the NCAA limited how many full scholarships each sport could offer:
- Football (FBS): 85 scholarships
- Men's Basketball: 13 scholarships
- Baseball: 11.7 scholarships (partial scholarships allowed)
- Women's Basketball: 15 scholarships

## The New System: Roster Limits

For schools that opt into the House settlement:
- **No scholarship limits** - schools can offer unlimited scholarship aid
- **New roster caps** - strict limits on total players

### New Roster Limits by Sport

| Sport | Roster Limit |
|-------|-------------|
| Football | ~105 players |
| Men's Basketball | 15 players |
| Baseball | 34 players |
| Women's Basketball | 15 players |
| Other sports | Adjusted accordingly |

## What This Means for Athletes

### More Opportunity
- Schools can now fully fund more athletes
- Partial scholarships may become full scholarships
- Walk-ons have better chance of getting aid

### Less Roster Spots
- Fewer total players on teams
- More competitive to make the roster
- Transfers may face challenges finding spots

## Compliance Deadlines

Teams must be at or below roster limits by:
- **Fall Sports**: First day of classes or first contest
- **Winter/Spring Sports**: December 1 or first contest

## Existing Player Protections

If you have remaining eligibility, you're generally protected:
- Current players can remain above roster limits temporarily
- Schools must honor existing scholarship agreements
- Exemptions exist for athletes in transition

## Strategic Impact

Coaches are now thinking differently:
- Quality over quantity
- Fewer players, but better funded
- Transfer portal becomes more competitive
- Recruiting focused on immediate contributors`,
    summary: "How roster limits replaced scholarship caps in 2025, including new limits by sport and what it means for athletes.",
    content_type: 'educational_article',
    category: 'ncaa_settlement',
    tags: ['roster limits', 'scholarships', 'house settlement', '2025'],
    target_roles: ['athlete', 'parent', 'coach', 'school_admin'],
    difficulty_level: 'intermediate',
    is_published: true,
    is_featured: false
  },
  {
    title: "The College Sports Commission (CSC): New NIL Enforcement",
    content: `The NCAA is no longer the primary enforcer of NIL rules. Meet the College Sports Commission, the new sheriff in town.

## What Is the CSC?

The College Sports Commission is a new, independent organization created by the House settlement to oversee NIL compliance and revenue sharing enforcement.

## Leadership

The CSC is led by CEO Bryan Seeley, a former MLB executive. His responsibilities include:
- Building investigative and enforcement teams
- Overseeing all CSC operations
- Ensuring schools follow revenue sharing rules
- Verifying NIL deals meet requirements

## CSC Responsibilities

### 1. Revenue Sharing Oversight
- Ensuring schools stay within their caps
- Verifying payments to athletes are accurate
- Monitoring opt-in compliance

### 2. NIL Deal Verification
- Operating the NIL Go clearinghouse
- Reviewing reported deals for validity
- Investigating suspicious arrangements

### 3. Rule Enforcement
- Investigating potential violations
- Issuing penalties for non-compliance
- Publishing guidance on new rules

## "Valid Business Purpose" Standard

The CSC has established that NIL payments must be:
- At rates and terms similar to compensation paid to comparable individuals
- For legitimate promotional or business activities
- NOT "pay-for-play" (paying just for athletic performance)

## What Gets Investigated?

Red flags that may trigger CSC investigation:
- NIL payments significantly above market rates
- Deals with no clear promotional component
- Timing suspicious (around recruitment/transfer)
- Payments from boosters with no business connection

## Penalties

Consequences for violations may include:
- Athlete eligibility issues
- School sanctions
- Required repayment
- Public disclosure of violations

## How This Differs from NCAA Enforcement

| NCAA (Old System) | CSC (New System) |
|-------------------|------------------|
| Part of college sports | Independent organization |
| Broad rule enforcement | NIL/revenue sharing focus |
| Member institution controlled | Professional leadership |
| Often slow investigations | Designed for faster response |`,
    summary: "Understanding the College Sports Commission, the new independent body enforcing NIL rules and revenue sharing compliance.",
    content_type: 'educational_article',
    category: 'ncaa_settlement',
    tags: ['csc', 'enforcement', 'compliance', 'college sports commission'],
    target_roles: ['athlete', 'parent', 'coach', 'school_admin', 'agency'],
    difficulty_level: 'intermediate',
    is_published: true,
    is_featured: false
  },
  {
    title: "Back Pay for Former Athletes: House Settlement Damages",
    content: `The House settlement includes $2.8 billion in back pay for former college athletes. Here's what you need to know.

## Who Is Eligible?

Athletes who competed in NCAA sports between **2016 and June 6, 2025** may be eligible for back pay damages.

## How Much Money?

- Total pool: $2.8 billion
- Payment timeline: Spread over 10 years (2025-2035)
- Individual amounts: Vary significantly based on sport and era

## Sports That Receive the Most

Football and men's basketball players are expected to receive the largest shares because:
- These sports generated the most revenue that athletes couldn't share in
- Broadcast rights and ticket sales were highest
- Greatest financial harm was demonstrated

## How Payments Are Calculated

Factors that determine your share:
- Which sport you played
- When you competed (2016-2025)
- Your school's revenue during that time
- Your contribution to that revenue

## How to Claim

The claims process is administered through the settlement:
1. Former athletes will be notified of eligibility
2. Claims must be submitted through the official process
3. Verification of playing history required
4. Payments distributed over time

## Current Athletes

If you're currently playing AND competed during the 2016-2025 period:
- You may be eligible for back pay
- This is separate from future revenue sharing
- Both can apply to the same athlete

## Tax Implications

Back pay settlements are generally taxable income:
- You'll receive tax documents for payments
- Consider consulting a tax professional
- Set aside money for tax obligations

## Important Notes

- The settlement is final as of June 6, 2025
- Opt-out period has passed
- Individual payment amounts are not yet determined
- Distribution process is still being developed`,
    summary: "Information about the $2.8 billion in back pay damages for athletes who competed between 2016 and 2025.",
    content_type: 'educational_article',
    category: 'ncaa_settlement',
    tags: ['back pay', 'damages', 'settlement', 'former athletes'],
    target_roles: ['athlete', 'parent'],
    difficulty_level: 'intermediate',
    is_published: true,
    is_featured: false
  },
  {
    title: "Schools Cannot Promise NIL Deals in Recruiting (2025 Rule)",
    content: `One of the most important changes from the House settlement: schools can no longer promise recruits specific NIL deals. Here's what this means.

## The New Rule

Effective July 1, 2025, NCAA rules prohibit schools from promising or guaranteeing student-athletes:
- Specific third-party NIL contracts
- Specific payment amounts from NIL collectives
- Any third-party NIL deals as a recruiting incentive

## What Schools CAN Tell You

During recruitment, schools may discuss:
- General NIL opportunities that exist
- Historical NIL deals other athletes have received
- NIL support services available (agents, financial advisors)
- Revenue sharing projections and structure
- The overall NIL climate at their school

## What Schools CANNOT Do

- Promise "you'll get a $X deal from our collective"
- Guarantee specific NIL income amounts
- Coordinate specific deals for recruits
- Use third-party deals as inducements

## Why This Matters

### For Athletes
- More realistic expectations during recruitment
- Focus on education, development, and fit
- Revenue sharing becomes the reliable compensation
- Less "bidding war" pressure

### For Schools
- Clearer compliance guidelines
- Reduced legal liability
- More sustainable recruiting practices
- Focus on program quality over promises

## What About Existing Deals?

NIL deals guaranteed BEFORE July 1, 2025 for the 2025-26 academic year:
- Are still valid and allowed
- Count toward the school's benefits cap
- Must be disclosed properly

## Red Flags to Watch

If a school or coach:
- Promises specific dollar amounts from NIL
- Says a collective "will take care of you"
- Guarantees third-party income
- Connects you with boosters making promises

This may be a violation. Report concerns to your compliance office.

## Questions to Ask Recruiters

Instead of asking about promised NIL:
- "What is your revenue sharing allocation by sport?"
- "What NIL support services do you provide?"
- "What NIL opportunities have past athletes in my position found?"
- "How does your compliance office support NIL activities?"`,
    summary: "The 2025 rule prohibiting schools from promising NIL deals during recruitment, and what athletes should expect.",
    content_type: 'compliance_guide',
    category: 'ncaa_settlement',
    tags: ['recruiting', 'nil promises', '2025 rules', 'compliance'],
    target_roles: ['athlete', 'parent', 'coach'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: true
  },
  // FAQ Content
  {
    title: "What is the House v. NCAA settlement?",
    content: `The House v. NCAA settlement is a landmark $2.8 billion class action resolution approved on June 6, 2025. It allows NCAA Division I schools to directly pay student-athletes through revenue sharing (up to $20.5 million per school in year one) and provides back pay to athletes who competed from 2016-2025. The settlement fundamentally changed college athletics by creating a system for institutional compensation alongside third-party NIL deals.`,
    summary: "Brief explanation of the House v. NCAA settlement and its key provisions.",
    content_type: 'faq',
    category: 'ncaa_settlement',
    tags: ['house settlement', 'ncaa', 'faq'],
    target_roles: ['athlete', 'parent', 'coach', 'school_admin', 'agency'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: false
  },
  {
    title: "How much can schools pay athletes directly under revenue sharing?",
    content: `Schools can pay athletes up to 22% of their average annual athletic revenue from media rights, ticket sales, and sponsorships. This is capped at $20.5 million per school for 2025-26, increasing by approximately 4% annually. By 2034-35, the cap is projected to reach $32.9 million. Most Power 4 schools are expected to max out at the cap. Football and men's basketball typically receive the largest allocations due to revenue generation.`,
    summary: "Revenue sharing caps and how direct payments to athletes work.",
    content_type: 'faq',
    category: 'ncaa_settlement',
    tags: ['revenue sharing', 'cap', 'direct payment', 'faq'],
    target_roles: ['athlete', 'parent', 'coach', 'school_admin'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: false
  },
  {
    title: "Do I have to report my NIL deals?",
    content: `Yes. All NIL deals worth $600 or more must be reported to NIL Go, the official clearinghouse operated by the College Sports Commission. Current athletes must report within 2 weeks of enrollment. High school prospects must begin reporting on July 1, 2025 or the start of their junior year, whichever is later. Failure to report can result in eligibility issues, school sanctions, and required repayment.`,
    summary: "NIL reporting requirements through the NIL Go clearinghouse.",
    content_type: 'faq',
    category: 'ncaa_settlement',
    tags: ['reporting', 'nil go', 'disclosure', 'faq', '$600'],
    target_roles: ['athlete', 'parent', 'coach'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: false
  },
  {
    title: "What is the College Sports Commission (CSC)?",
    content: `The College Sports Commission is an independent organization created by the House settlement to enforce NIL rules and revenue sharing compliance. Led by CEO Bryan Seeley (former MLB executive), the CSC operates the NIL Go clearinghouse, investigates potential violations, and ensures schools follow the new compensation rules. The CSC is separate from the NCAA and focuses specifically on House settlement regulations.`,
    summary: "The new independent body enforcing NIL and revenue sharing rules.",
    content_type: 'faq',
    category: 'ncaa_settlement',
    tags: ['csc', 'enforcement', 'college sports commission', 'faq'],
    target_roles: ['athlete', 'parent', 'coach', 'school_admin', 'agency'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: false
  },
  {
    title: "Can high school athletes do NIL deals?",
    content: `Yes, but with important caveats. High school NIL is governed by state athletic associations, and rules vary significantly by state. What's legal in one state may cost you eligibility in another. If you're pursuing NCAA Division I athletics, you must disclose all NIL deals over $600 to the College Sports Commission starting July 1, 2025 or your junior year. Always check your state's specific rules and your school's policies before signing any deals.`,
    summary: "High school NIL eligibility and disclosure requirements.",
    content_type: 'faq',
    category: 'high_school_nil',
    tags: ['high school', 'state rules', 'eligibility', 'faq'],
    target_roles: ['athlete', 'parent', 'coach'],
    difficulty_level: 'beginner',
    is_published: true,
    is_featured: false
  }
];

async function seedContent() {
  console.log('='.repeat(60));
  console.log('Seeding NCAA Settlement Content (2025)');
  console.log('='.repeat(60));
  console.log(`Total entries to seed: ${ncaaSettlementContent.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const entry of ncaaSettlementContent) {
    const { error } = await supabase
      .from('knowledge_base')
      .insert({
        ...entry,
        metadata: {
          source: 'ncaa_settlement_2025',
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
