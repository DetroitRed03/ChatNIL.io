# ChatNIL Showcase Copy Polish - Recommendations

## Executive Summary

This document provides comprehensive copy improvements for all three showcase versions (Clean & Modern, Energetic & Bold, Premium & Sophisticated) to align with ChatNIL's brand voice: **empowering, knowledgeable, supportive, clear, and authentic**.

**Target Audience**: College athletes navigating NIL opportunities, agencies discovering talent, brands seeking partnerships

**Brand Voice Principles**:
- Empowering, not overwhelming
- Knowledgeable, not condescending
- Supportive, not parental
- Clear, not technical
- Authentic and relatable

---

## HIGH PRIORITY Changes

### 1. Main Showcase Pages - Header Copy

#### **File**: `/app/showcase/page.tsx`
**Line**: 66-70
**Current**:
```tsx
<h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
  ChatNIL Component Library
</h1>
<p className="text-sm text-secondary-600">
  V1: Clean & Modern • Interactive Design System
</p>
```

**Suggested**:
```tsx
<h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
  ChatNIL Design Showcase
</h1>
<p className="text-sm text-secondary-600">
  See how we help athletes navigate their NIL journey
</p>
```

**Rationale**: "Component Library" is technical jargon. "Design Showcase" is clearer and the tagline connects directly to user benefit. **Priority: HIGH**

---

#### **File**: `/app/showcase/page.tsx`
**Line**: 75-76
**Current**:
```tsx
<Badge variant="success">50+ Components</Badge>
<Badge variant="secondary">Live Examples</Badge>
```

**Suggested**:
```tsx
<Badge variant="success">Built for Athletes</Badge>
<Badge variant="secondary">See It in Action</Badge>
```

**Rationale**: Focus on audience value rather than technical counts. "See It in Action" is more inviting than "Live Examples". **Priority: HIGH**

---

### 2. Component Section Descriptions

#### **File**: `/app/showcase/page.tsx`
**Line**: 126-150
**Current**:
```tsx
<ComponentDemo title="Athlete Profile Card" description="Agency discovery athlete showcase">
<ComponentDemo title="NIL Deal Card" description="Active deal information display">
<ComponentDemo title="Metric Card" description="Dashboard statistics with trends">
<ComponentDemo title="Opportunity Card" description="Matched opportunities with scoring">
<ComponentDemo title="Quiz Card" description="Educational content cards">
<ComponentDemo title="Badge Showcase Card" description="Achievement and rarity display">
```

**Suggested**:
```tsx
<ComponentDemo title="Athlete Profile Card" description="Show your value to potential brand partners">
<ComponentDemo title="NIL Deal Card" description="Track your partnerships and earnings in one place">
<ComponentDemo title="Metric Card" description="See your growth at a glance">
<ComponentDemo title="Opportunity Card" description="Discover deals that match your brand">
<ComponentDemo title="Quiz Card" description="Learn NIL rules while earning rewards">
<ComponentDemo title="Badge Showcase Card" description="Celebrate your achievements">
```

**Rationale**: Transform technical descriptions into benefit-driven copy that speaks directly to athletes. Uses "you/your" and focuses on outcomes. **Priority: HIGH**

---

### 3. AthleteCardExample - Content Polish

#### **File**: `/app/showcase/_examples/AthleteCardExample.tsx`
**Line**: 69-72
**Current**:
```tsx
<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
<span className="text-xs font-bold text-slate-800">Verified</span>
```

**Suggested**:
```tsx
<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
<span className="text-xs font-bold text-slate-800">Verified Athlete</span>
```

**Rationale**: Add context for what's verified. **Priority: MEDIUM**

---

#### **File**: `/app/showcase/_examples/AthleteCardExample.tsx`
**Line**: 153-155
**Current**:
```tsx
<div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
  💰 Estimated FMV Range
</div>
```

**Suggested**:
```tsx
<div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
  💰 Your Estimated Value
</div>
```

**Rationale**: "FMV" is jargon. Per brand voice: "Your Fair Market Value (FMV) is what brands might pay for a partnership." Use simpler language first, can explain in tooltip. **Priority: HIGH**

---

#### **File**: `/app/showcase/_examples/AthleteCardExample.tsx`
**Line**: 120-123
**Current**:
```tsx
<span className="text-xs font-semibold">Followers</span>
...
<div className="text-xs text-blue-600 mt-1">+12% this month</div>
```

**Suggested**:
```tsx
<span className="text-xs font-semibold">Followers</span>
...
<div className="text-xs text-blue-600 mt-1">Growing strong 📈</div>
```

**Rationale**: Make growth feel encouraging rather than just reporting data. **Priority: MEDIUM**

---

### 4. DealCardExample - Progress Language

#### **File**: `/app/showcase/_examples/DealCardExample.tsx`
**Line**: 75-76
**Current**:
```tsx
<span className="font-semibold text-gray-900">Campaign Progress</span>
<span className="text-gray-600">6 of 10 deliverables</span>
```

**Suggested**:
```tsx
<span className="font-semibold text-gray-900">You're Making Progress</span>
<span className="text-gray-600">6 of 10 completed</span>
```

**Rationale**: Make it personal and encouraging. "Deliverables" is corporate jargon. **Priority: HIGH**

---

#### **File**: `/app/showcase/_examples/DealCardExample.tsx`
**Line**: 96-98
**Current**:
```tsx
<h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
  <Package className="w-4 h-4" />
  Deliverables
</h4>
```

**Suggested**:
```tsx
<h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
  <Package className="w-4 h-4" />
  What You Need to Do
</h4>
```

**Rationale**: Plain language instead of corporate speak. **Priority: HIGH**

---

#### **File**: `/app/showcase/_examples/DealCardExample.tsx`
**Line**: 171
**Current**:
```tsx
View Full Campaign
```

**Suggested**:
```tsx
View Deal Details
```

**Rationale**: "Campaign" is brand-side language. Athletes think in terms of "deals" or "partnerships". **Priority: MEDIUM**

---

### 5. OpportunityCardExample - Match Score Clarity

#### **File**: `/app/showcase/_examples/OpportunityCardExample.tsx`
**Line**: 31-32
**Current**:
```tsx
<span className="text-white font-bold">High Match</span>
```

**Suggested**:
```tsx
<span className="text-white font-bold">Great Fit for You</span>
```

**Rationale**: More personal and clear about what "match" means. **Priority: HIGH**

---

#### **File**: `/app/showcase/_examples/OpportunityCardExample.tsx`
**Line**: 56-57
**Current**:
```tsx
94% Match Score
```

**Suggested**:
```tsx
94% Match - This is Perfect for You!
```

**Rationale**: Explain what the score means in encouraging terms. **Priority: HIGH**

---

#### **File**: `/app/showcase/_examples/OpportunityCardExample.tsx`
**Line**: 92-93
**Current**:
```tsx
<div className="text-xs text-gray-600">Compensation Range</div>
<div className="font-bold text-emerald-700">$18,000 - $25,000</div>
```

**Suggested**:
```tsx
<div className="text-xs text-gray-600">What You Could Earn</div>
<div className="font-bold text-emerald-700">$18,000 - $25,000</div>
```

**Rationale**: Direct benefit language. "Compensation" is corporate. **Priority: HIGH**

---

#### **File**: `/app/showcase/_examples/OpportunityCardExample.tsx`
**Line**: 122
**Current**:
```tsx
<h4 className="font-semibold text-gray-900 text-sm mb-3">Why You're a Great Match</h4>
```

**Suggested**:
```tsx
<h4 className="font-semibold text-gray-900 text-sm mb-3">Why This Works for You</h4>
```

**Rationale**: Slightly more natural while still clear. **Priority: MEDIUM**

---

#### **File**: `/app/showcase/_examples/OpportunityCardExample.tsx`
**Line**: 124-128
**Current**:
```tsx
'Your engagement rate exceeds campaign average by 45%',
'Strong track record with athletic brands',
'Audience demographics align perfectly',
```

**Suggested**:
```tsx
'Your engagement crushes the average by 45%',
'You've nailed partnerships with athletic brands before',
'Your followers are exactly who this brand wants to reach',
```

**Rationale**: More conversational and encouraging tone. Avoids jargon like "demographics align". **Priority: HIGH**

---

### 6. QuizCardExample - Learning Motivation

#### **File**: `/app/showcase/_examples/QuizCardExample.tsx`
**Line**: 49-50
**Current**:
```tsx
<h3 className="text-xl font-bold mb-2">Understanding NIL Rights</h3>
<p className="text-indigo-100 text-sm">Learn the fundamentals of Name, Image, and Likeness</p>
```

**Suggested**:
```tsx
<h3 className="text-xl font-bold mb-2">Know Your NIL Rights</h3>
<p className="text-indigo-100 text-sm">Master the basics and protect your brand</p>
```

**Rationale**: More action-oriented and benefit-focused. "Fundamentals" is textbook language. **Priority: HIGH**

---

#### **File**: `/app/showcase/_examples/QuizCardExample.tsx`
**Line**: 85-86
**Current**:
```tsx
<span className="font-semibold text-gray-900">Your Progress</span>
<span className="text-gray-600">3 of 10 completed</span>
```

**Suggested**:
```tsx
<span className="font-semibold text-gray-900">You're Getting There</span>
<span className="text-gray-600">3 of 10 done</span>
```

**Rationale**: Encouraging tone. Keep it conversational. **Priority: MEDIUM**

---

#### **File**: `/app/showcase/_examples/QuizCardExample.tsx`
**Line**: 122
**Current**:
```tsx
Just 3 more deals to unlock this badge!
```

**Suggested**:
```tsx
You're close! Just 3 more to go.
```

**Rationale**: More conversational and encouraging. **Priority: MEDIUM**

---

#### **File**: `/app/showcase/_examples/QuizCardExample.tsx`
**Line**: 145-146
**Current**:
```tsx
<div className="text-xs text-gray-600 mb-1">Complete to unlock</div>
<div className="font-bold text-amber-700">Scholar Badge + 50 XP</div>
```

**Suggested**:
```tsx
<div className="text-xs text-gray-600 mb-1">Finish to earn</div>
<div className="font-bold text-amber-700">Scholar Badge + 50 Points</div>
```

**Rationale**: "Complete to unlock" is gaming jargon. "XP" (experience points) may not be clear to all athletes. **Priority: MEDIUM**

---

### 7. BadgeCardExample - Achievement Language

#### **File**: `/app/showcase/_examples/BadgeCardExample.tsx`
**Line**: 48-49
**Current**:
```tsx
<h3 className="text-2xl font-bold text-white mb-1">NIL Pioneer</h3>
<p className="text-amber-100 text-sm">Complete your first 10 NIL deals</p>
```

**Suggested**:
```tsx
<h3 className="text-2xl font-bold text-white mb-1">NIL Pioneer</h3>
<p className="text-amber-100 text-sm">Close your first 10 NIL partnerships</p>
```

**Rationale**: "Complete" feels like a checkbox. "Close" is more active. "Partnerships" sounds more prestigious than "deals". **Priority: MEDIUM**

---

#### **File**: `/app/showcase/_examples/BadgeCardExample.tsx`
**Line**: 156-158
**Current**:
```tsx
<div className="text-xs text-gray-600 mb-1">Badge Rarity</div>
<div className="font-bold text-amber-700 flex items-center gap-2">
  <Sparkles className="w-4 h-4" />
  Legendary (0.8%)
</div>
```

**Suggested**:
```tsx
<div className="text-xs text-gray-600 mb-1">How Rare Is This?</div>
<div className="font-bold text-amber-700 flex items-center gap-2">
  <Sparkles className="w-4 h-4" />
  Super Rare - Only 0.8% of athletes earn this!
</div>
```

**Rationale**: Make "rarity" concept clear and exciting. **Priority: HIGH**

---

### 8. ButtonExamples - Section Descriptions

#### **File**: `/app/showcase/_examples/ButtonExamples.tsx`
**Line**: 31-32, 63-64, 85-86
**Current**:
```tsx
<Section title="Primary Buttons" description="Main call-to-action buttons">
<Section title="Secondary Buttons" description="Alternative actions">
<Section title="Destructive Buttons" description="Dangerous or irreversible actions">
```

**Suggested**:
```tsx
<Section title="Primary Buttons" description="Your main action buttons">
<Section title="Secondary Buttons" description="Alternative choices">
<Section title="Destructive Buttons" description="Delete and remove actions (use carefully!)">
```

**Rationale**: Remove UX jargon, make descriptions more practical. **Priority: MEDIUM**

---

### 9. FormExamples - Field Labels

#### **File**: `/app/showcase/_examples/FormExamples.tsx`
**Line**: 164-165
**Current**:
```tsx
<label className="block text-sm font-semibold text-gray-900 mb-3">
  Account Type
</label>
```

**Suggested**:
```tsx
<label className="block text-sm font-semibold text-gray-900 mb-3">
  I'm a...
</label>
```

**Rationale**: More conversational, matches the "you/your" voice. **Priority: MEDIUM**

---

#### **File**: `/app/showcase/_examples/FormExamples.tsx`
**Line**: 168-170
**Current**:
```tsx
{ value: 'athlete', label: 'Athlete', description: 'For student athletes' },
{ value: 'brand', label: 'Brand', description: 'For companies and sponsors' },
{ value: 'agency', label: 'Agency', description: 'For NIL agencies' },
```

**Suggested**:
```tsx
{ value: 'athlete', label: 'Student Athlete', description: 'Navigate your NIL opportunities' },
{ value: 'brand', label: 'Brand', description: 'Find athletes to partner with' },
{ value: 'agency', label: 'Agency', description: 'Manage athlete partnerships' },
```

**Rationale**: Add benefit-focused descriptions instead of just restating the label. **Priority: MEDIUM**

---

#### **File**: `/app/showcase/_examples/FormExamples.tsx`
**Line**: 201-202
**Current**:
```tsx
<label className="block text-sm font-semibold text-gray-900 mb-3">
  Interests
</label>
```

**Suggested**:
```tsx
<label className="block text-sm font-semibold text-gray-900 mb-3">
  What interests you?
</label>
```

**Rationale**: Question format is more engaging. **Priority: LOW**

---

#### **File**: `/app/showcase/_examples/FormExamples.tsx`
**Line**: 224-225, 232-233
**Current**:
```tsx
<div className="font-semibold text-gray-900">Email Notifications</div>
<div className="text-sm text-gray-600">Receive email updates about your deals</div>

<div className="font-semibold text-gray-900">Public Profile</div>
<div className="text-sm text-gray-600">Make your profile visible to brands</div>
```

**Suggested**:
```tsx
<div className="font-semibold text-gray-900">Email Notifications</div>
<div className="text-sm text-gray-600">Get updates about your opportunities</div>

<div className="font-semibold text-gray-900">Public Profile</div>
<div className="text-sm text-gray-600">Let brands discover you</div>
```

**Rationale**: More benefit-focused. "Deals" becomes "opportunities" (more positive). **Priority: MEDIUM**

---

### 10. MetricCardExample - Metric Labels

#### **File**: `/app/showcase/_examples/MetricCardExample.tsx`
**Line**: 9-34
**Current**:
```tsx
{
  label: 'Total Revenue',
  label: 'Active Deals',
  label: 'Total Impressions',
```

**Suggested**:
```tsx
{
  label: 'Your Earnings',
  label: 'Active Partnerships',
  label: 'People Reached',
```

**Rationale**: More personal ("Your"), simpler language ("Partnerships" vs "Deals", "People Reached" vs "Impressions"). **Priority: HIGH**

---

## MEDIUM PRIORITY Changes

### 11. Version Switcher Descriptions

#### **File**: `/components/ui/VersionSwitcher.tsx`
**Line**: 15-16, 22-23, 29-30
**Current**:
```tsx
description: 'Professional and accessible',
description: 'High energy sports focus',
description: 'Elegant luxury experience',
```

**Suggested**:
```tsx
description: 'Clean, clear, and easy to use',
description: 'Bold and energetic for athletes',
description: 'Premium feel for high-value deals',
```

**Rationale**: More concrete and benefit-oriented descriptions. **Priority: MEDIUM**

---

### 12. Showcase V2 (Energetic) - Tone Adjustments

#### **File**: `/app/showcase-v2/page.tsx`
**Line**: 125-128
**Current**:
```tsx
<h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 via-primary-500 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
  ChatNIL ENERGETIC
</h1>
<p className="text-sm text-primary-300 font-bold tracking-wide">
  V2.0 • BOLD & POWERFUL
</p>
```

**Suggested**:
```tsx
<h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 via-primary-500 to-accent-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
  ChatNIL UNLEASHED
</h1>
<p className="text-sm text-primary-300 font-bold tracking-wide">
  BOLD DESIGN FOR BOLD ATHLETES
</p>
```

**Rationale**: "ENERGETIC" is descriptive; "UNLEASHED" is empowering. Tagline connects to audience. **Priority: MEDIUM**

---

#### **File**: `/app/showcase-v2/page.tsx`
**Line**: 219-243
**Current (descriptions are ALL CAPS)**:
```tsx
description="HIGH-ENERGY CONTENT DISPLAYS"
description="ELITE ATHLETE SHOWCASE"
description="ACTIVE PARTNERSHIP DISPLAY"
```

**Suggested**:
```tsx
description="Cards that command attention"
description="Showcase your elite status"
description="Track your partnerships in style"
```

**Rationale**: Even in energetic version, descriptions should be readable and benefit-focused, not just shouty. **Priority: MEDIUM**

---

### 13. Showcase V3 (Premium) - Sophistication Balance

#### **File**: `/app/showcase-v3/page.tsx`
**Line**: 73-77
**Current**:
```tsx
<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#92400e] bg-clip-text text-transparent">
  ChatNIL Premium Collection
</h1>
<p className="text-sm text-[#6c757d] mt-1 tracking-wide">
  Version 3.0 • Sophisticated & Elegant Design System
</p>
```

**Suggested**:
```tsx
<h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-[#ea580c] via-[#c2410c] to-[#92400e] bg-clip-text text-transparent">
  ChatNIL Premier Experience
</h1>
<p className="text-sm text-[#6c757d] mt-1 tracking-wide">
  Premium design for high-value partnerships
</p>
```

**Rationale**: "Premier" is sophisticated but not pretentious. Focus on value for athlete. **Priority: MEDIUM**

---

#### **File**: `/app/showcase-v3/page.tsx**
**Line**: 167-210
**Current descriptions are overly technical**:
```tsx
description="Exquisite cards with neumorphic depth and premium materials"
description="Business card styling with embossed elegance"
description="Invoice aesthetic with sophisticated details"
```

**Suggested**:
```tsx
description="Beautiful cards that feel premium"
description="Professional athlete showcase with polish"
description="Partnership tracking with executive style"
```

**Rationale**: Technical design terms (neumorphic, embossed, invoice aesthetic) don't resonate with athletes. Keep it benefit-focused. **Priority: HIGH**

---

## LOW PRIORITY Changes (Polish)

### 14. Footer Copy

#### **File**: `/app/showcase/page.tsx`
**Line**: 191-196
**Current**:
```tsx
<p className="text-gray-600">
  Built with Next.js 14, Tailwind CSS, and Framer Motion
</p>
<p className="text-sm text-gray-500 mt-2">
  ChatNIL Design System v2.0
</p>
```

**Suggested**:
```tsx
<p className="text-gray-600">
  Designed for student-athletes, built with care
</p>
<p className="text-sm text-gray-500 mt-2">
  ChatNIL • Empowering Your NIL Journey
</p>
```

**Rationale**: Footer should reinforce brand purpose, not list tech stack. **Priority: LOW**

---

### 15. Code Display Placeholder Text

#### **File**: `/app/showcase/page.tsx`
**Line**: 278-280
**Current**:
```tsx
<code>{`// Component code will be displayed here
// This is a placeholder for the actual component code`}</code>
```

**Suggested**:
```tsx
<code>{`// Component code available in our design system
// Want to build with ChatNIL? Contact us for docs`}</code>
```

**Rationale**: Make placeholder text useful. **Priority: LOW**

---

## Microcopy Consistency Rules

Apply these principles across all showcase versions:

1. **FMV → Your Value**: Always explain "Fair Market Value" in plain terms
2. **Deal vs Partnership**: Use "partnership" for high-value contexts, "deal" casually
3. **Campaign → Partnership/Deal**: Avoid brand-side language
4. **Deliverables → What You Need to Do**: Plain language
5. **Compensation → What You Earn**: Benefit-focused
6. **Engagement Rate → Engagement**: Skip jargon when possible
7. **Match Score → Match Percentage**: Add context like "Great fit!"
8. **Complete → Finish/Close**: More natural language
9. **Progress bars**: Always add encouraging context ("You're getting there!")
10. **Error messages**: Not shown in showcase, but should follow: "Oops! [What went wrong]. [How to fix it]"

---

## Cross-Version Consistency

Maintain version personality while keeping core copy consistent:

| Element | V1 (Clean) | V2 (Energetic) | V3 (Premium) |
|---------|-----------|----------------|--------------|
| Athlete Card Title | "Show your value to partners" | "Show off your stats!" | "Present your professional profile" |
| Deal Progress | "You're making progress" | "Keep crushing it!" | "Your partnership progress" |
| Opportunity Match | "Great fit for you" | "This is YOUR deal!" | "Exceptional alignment" |
| Quiz Progress | "You're getting there" | "You're on fire!" | "Building your expertise" |

---

## Implementation Priority

**Immediate (HIGH)**:
- Lines with jargon (FMV, deliverables, compensation, match score)
- Component descriptions that are technical vs benefit-focused
- Showcase V3 design terminology

**Next Sprint (MEDIUM)**:
- Form field labels and descriptions
- Button section descriptions
- Version switcher copy
- Energetic version ALL CAPS descriptions

**Polish Pass (LOW)**:
- Footer text
- Placeholder code messages
- Minor wording refinements

---

## Testing Recommendations

After implementing copy changes:

1. **Athlete User Test**: Have 3-5 college athletes review each version and note:
   - Which phrases feel empowering vs confusing
   - Where they need tooltips/help text
   - Which version resonates most with their experience

2. **Readability Check**: Run copy through Hemingway Editor
   - Target: Grade 8-10 reading level
   - Zero "very hard to read" sentences
   - Minimize passive voice

3. **Voice Consistency Audit**:
   - Spot check 10 random pieces of copy
   - All should pass: Personal (you/your)? Clear? Empowering?

---

## Brand Voice Examples Reference

From `/docs/BRAND_VOICE.md`:

✅ **Good**: "You've got this. Let's break it down together."
❌ **Bad**: "This is complicated, but we'll try to help."

✅ **Good**: "Your Fair Market Value (FMV) is what brands might pay for a partnership."
❌ **Bad**: "Your FMV is calculated using algorithmic analysis of engagement metrics."

✅ **Good**: "Great progress! You've completed 5 quizzes this week."
❌ **Bad**: "User has completed 5 educational modules."

---

## Questions for Stakeholder Review

Before finalizing:

1. **Badge/XP naming**: Should we keep gaming terms (XP, badges) or use "points" and "achievements"?
2. **"Deal" vs "Partnership"**: Which term should be primary? (Rec: Partnership for formal contexts, deal for casual)
3. **Metric names**: "Your Earnings" vs "Total Revenue" - okay to make everything first-person?
4. **Showcase purpose**: Are these showcases for athletes to see the platform, or for designers/developers? (Affects how technical we can be)

---

## Files Requiring Updates

### High Priority:
- `/app/showcase/page.tsx`
- `/app/showcase-v3/page.tsx`
- `/app/showcase/_examples/AthleteCardExample.tsx`
- `/app/showcase/_examples/DealCardExample.tsx`
- `/app/showcase/_examples/OpportunityCardExample.tsx`
- `/app/showcase/_examples/QuizCardExample.tsx`
- `/app/showcase/_examples/BadgeCardExample.tsx`
- `/app/showcase/_examples/MetricCardExample.tsx`

### Medium Priority:
- `/app/showcase-v2/page.tsx`
- `/components/ui/VersionSwitcher.tsx`
- `/app/showcase/_examples/ButtonExamples.tsx`
- `/app/showcase/_examples/FormExamples.tsx`

### Low Priority:
- Footer text in all 3 showcase pages
- Code placeholder text

---

## Next Steps

1. ✅ Review this document with product/design team
2. ⬜ Get stakeholder approval on high-priority changes
3. ⬜ Implement HIGH priority changes (estimate: 2-3 hours)
4. ⬜ Implement MEDIUM priority changes (estimate: 1-2 hours)
5. ⬜ Test with 3-5 athletes for feedback
6. ⬜ Refine based on user feedback
7. ⬜ Update brand voice guide with any new learnings
8. ⬜ Create copy template for future components

---

**Document Version**: 1.0
**Date**: 2025-10-27
**Author**: Brand Copywriter Agent
**Status**: Ready for Review
