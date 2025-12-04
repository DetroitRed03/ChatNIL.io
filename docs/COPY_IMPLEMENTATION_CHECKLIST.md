# Copy Implementation Checklist

This document provides a step-by-step implementation guide with exact line numbers and changes. Work through in priority order.

---

## 🔴 HIGH PRIORITY - Implement First (Est. 2-3 hours)

### 1. Main Showcase Header (V1)
**File**: `/app/showcase/page.tsx`

- [ ] **Lines 66-70**: Change header title and subtitle
  ```tsx
  // CURRENT
  <h1>ChatNIL Component Library</h1>
  <p>V1: Clean & Modern • Interactive Design System</p>

  // CHANGE TO
  <h1>ChatNIL Design Showcase</h1>
  <p>See how we help athletes navigate their NIL journey</p>
  ```

- [ ] **Lines 75-76**: Update badges
  ```tsx
  // CURRENT
  <Badge variant="success">50+ Components</Badge>
  <Badge variant="secondary">Live Examples</Badge>

  // CHANGE TO
  <Badge variant="success">Built for Athletes</Badge>
  <Badge variant="secondary">See It in Action</Badge>
  ```

---

### 2. Component Demo Descriptions (V1)
**File**: `/app/showcase/page.tsx`

- [ ] **Line 127**: Athlete card description
  ```tsx
  // CURRENT: description="Agency discovery athlete showcase"
  // CHANGE TO: description="Show your value to potential brand partners"
  ```

- [ ] **Line 131**: Deal card description
  ```tsx
  // CURRENT: description="Active deal information display"
  // CHANGE TO: description="Track your partnerships and earnings in one place"
  ```

- [ ] **Line 135**: Metric card description
  ```tsx
  // CURRENT: description="Dashboard statistics with trends"
  // CHANGE TO: description="See your growth at a glance"
  ```

- [ ] **Line 139**: Opportunity card description
  ```tsx
  // CURRENT: description="Matched opportunities with scoring"
  // CHANGE TO: description="Discover deals that match your brand"
  ```

- [ ] **Line 143**: Quiz card description
  ```tsx
  // CURRENT: description="Educational content cards"
  // CHANGE TO: description="Learn NIL rules while earning rewards"
  ```

- [ ] **Line 147**: Badge card description
  ```tsx
  // CURRENT: description="Achievement and rarity display"
  // CHANGE TO: description="Celebrate your achievements"
  ```

---

### 3. Athlete Card Example
**File**: `/app/showcase/_examples/AthleteCardExample.tsx`

- [ ] **Line 72**: Add "Athlete" to verified badge
  ```tsx
  // CURRENT: <span className="text-xs font-bold text-slate-800">Verified</span>
  // CHANGE TO: <span className="text-xs font-bold text-slate-800">Verified Athlete</span>
  ```

- [ ] **Lines 153-155**: Simplify FMV label
  ```tsx
  // CURRENT
  <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
    💰 Estimated FMV Range
  </div>

  // CHANGE TO
  <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
    💰 Your Estimated Value
  </div>
  ```

---

### 4. Deal Card Example
**File**: `/app/showcase/_examples/DealCardExample.tsx`

- [ ] **Line 75**: Make progress personal
  ```tsx
  // CURRENT: <span className="font-semibold text-gray-900">Campaign Progress</span>
  // CHANGE TO: <span className="font-semibold text-gray-900">You're Making Progress</span>
  ```

- [ ] **Line 76**: Simplify deliverables count
  ```tsx
  // CURRENT: <span className="text-gray-600">6 of 10 deliverables</span>
  // CHANGE TO: <span className="text-gray-600">6 of 10 completed</span>
  ```

- [ ] **Lines 96-98**: Change deliverables header
  ```tsx
  // CURRENT
  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
    <Package className="w-4 h-4" />
    Deliverables
  </h4>

  // CHANGE TO
  <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
    <Package className="w-4 h-4" />
    What You Need to Do
  </h4>
  ```

- [ ] **Line 171**: Change button text
  ```tsx
  // CURRENT: View Full Campaign
  // CHANGE TO: View Deal Details
  ```

---

### 5. Opportunity Card Example
**File**: `/app/showcase/_examples/OpportunityCardExample.tsx`

- [ ] **Line 31**: Change "High Match" text
  ```tsx
  // CURRENT: <span className="text-white font-bold">High Match</span>
  // CHANGE TO: <span className="text-white font-bold">Great Fit for You</span>
  ```

- [ ] **Lines 56-57**: Expand match score meaning
  ```tsx
  // CURRENT: 94% Match Score
  // CHANGE TO: 94% Match - This is Perfect for You!
  ```

- [ ] **Lines 92-93**: Change compensation label
  ```tsx
  // CURRENT
  <div className="text-xs text-gray-600">Compensation Range</div>
  <div className="font-bold text-emerald-700">$18,000 - $25,000</div>

  // CHANGE TO
  <div className="text-xs text-gray-600">What You Could Earn</div>
  <div className="font-bold text-emerald-700">$18,000 - $25,000</div>
  ```

- [ ] **Line 122**: Rephrase match section header
  ```tsx
  // CURRENT: <h4 className="font-semibold text-gray-900 text-sm mb-3">Why You're a Great Match</h4>
  // CHANGE TO: <h4 className="font-semibold text-gray-900 text-sm mb-3">Why This Works for You</h4>
  ```

- [ ] **Lines 124-128**: Rewrite match reasons (conversational tone)
  ```tsx
  // CURRENT
  'Your engagement rate exceeds campaign average by 45%',
  'Strong track record with athletic brands',
  'Audience demographics align perfectly',

  // CHANGE TO
  'Your engagement crushes the average by 45%',
  'You've nailed partnerships with athletic brands before',
  'Your followers are exactly who this brand wants to reach',
  ```

---

### 6. Quiz Card Example
**File**: `/app/showcase/_examples/QuizCardExample.tsx`

- [ ] **Lines 49-50**: Make quiz title action-oriented
  ```tsx
  // CURRENT
  <h3 className="text-xl font-bold mb-2">Understanding NIL Rights</h3>
  <p className="text-indigo-100 text-sm">Learn the fundamentals of Name, Image, and Likeness</p>

  // CHANGE TO
  <h3 className="text-xl font-bold mb-2">Know Your NIL Rights</h3>
  <p className="text-indigo-100 text-sm">Master the basics and protect your brand</p>
  ```

---

### 7. Badge Card Example
**File**: `/app/showcase/_examples/BadgeCardExample.tsx`

- [ ] **Lines 156-159**: Expand rarity explanation
  ```tsx
  // CURRENT
  <div className="text-xs text-gray-600 mb-1">Badge Rarity</div>
  <div className="font-bold text-amber-700 flex items-center gap-2">
    <Sparkles className="w-4 h-4" />
    Legendary (0.8%)
  </div>

  // CHANGE TO
  <div className="text-xs text-gray-600 mb-1">How Rare Is This?</div>
  <div className="font-bold text-amber-700 flex items-center gap-2">
    <Sparkles className="w-4 h-4" />
    Super Rare - Only 0.8% of athletes earn this!
  </div>
  ```

---

### 8. Metric Card Example
**File**: `/app/showcase/_examples/MetricCardExample.tsx`

- [ ] **Lines 9, 18, 27**: Update metric labels
  ```tsx
  // CURRENT
  label: 'Total Revenue',
  label: 'Active Deals',
  label: 'Total Impressions',

  // CHANGE TO
  label: 'Your Earnings',
  label: 'Active Partnerships',
  label: 'People Reached',
  ```

---

### 9. Showcase V3 Component Descriptions
**File**: `/app/showcase-v3/page.tsx`

- [ ] **Line 167**: Card components description
  ```tsx
  // CURRENT: description="Exquisite cards with neumorphic depth and premium materials"
  // CHANGE TO: description="Beautiful cards that feel premium"
  ```

- [ ] **Line 172**: Athlete card description
  ```tsx
  // CURRENT: description="Business card styling with embossed elegance"
  // CHANGE TO: description="Professional athlete showcase with polish"
  ```

- [ ] **Line 178**: Deal card description
  ```tsx
  // CURRENT: description="Invoice aesthetic with sophisticated details"
  // CHANGE TO: description="Partnership tracking with executive style"
  ```

- [ ] **Line 184**: Metric card description
  ```tsx
  // CURRENT: description="Luxury dashboard with raised surfaces"
  // CHANGE TO: description="Premium performance metrics"
  ```

- [ ] **Line 190**: Opportunity card description
  ```tsx
  // CURRENT: description="Premium opportunities with wax seal styling"
  // CHANGE TO: description="High-value partnerships presented beautifully"
  ```

- [ ] **Line 196**: Quiz card description
  ```tsx
  // CURRENT: description="Sophisticated interface with paper texture"
  // CHANGE TO: description="Elegant learning experience"
  ```

- [ ] **Line 202**: Badge card description
  ```tsx
  // CURRENT: description="Gold foil effects with luxury materials"
  // CHANGE TO: description="Achievements that feel prestigious"
  ```

---

## 🟡 MEDIUM PRIORITY - Implement Next (Est. 1-2 hours)

### 10. Button Examples Sections
**File**: `/app/showcase/_examples/ButtonExamples.tsx`

- [ ] **Line 31**: Primary buttons description
  ```tsx
  // CURRENT: description="Main call-to-action buttons"
  // CHANGE TO: description="Your main action buttons"
  ```

- [ ] **Line 63**: Secondary buttons description
  ```tsx
  // CURRENT: description="Alternative actions"
  // CHANGE TO: description="Alternative choices"
  ```

- [ ] **Line 85**: Destructive buttons description
  ```tsx
  // CURRENT: description="Dangerous or irreversible actions"
  // CHANGE TO: description="Delete and remove actions (use carefully!)"
  ```

---

### 11. Form Examples
**File**: `/app/showcase/_examples/FormExamples.tsx`

- [ ] **Line 165**: Account type label
  ```tsx
  // CURRENT: Account Type
  // CHANGE TO: I'm a...
  ```

- [ ] **Lines 168-170**: Account type descriptions
  ```tsx
  // CURRENT
  { value: 'athlete', label: 'Athlete', description: 'For student athletes' },
  { value: 'brand', label: 'Brand', description: 'For companies and sponsors' },
  { value: 'agency', label: 'Agency', description: 'For NIL agencies' },

  // CHANGE TO
  { value: 'athlete', label: 'Student Athlete', description: 'Navigate your NIL opportunities' },
  { value: 'brand', label: 'Brand', description: 'Find athletes to partner with' },
  { value: 'agency', label: 'Agency', description: 'Manage athlete partnerships' },
  ```

- [ ] **Line 202**: Interests label
  ```tsx
  // CURRENT: Interests
  // CHANGE TO: What interests you?
  ```

- [ ] **Line 224-225**: Email notifications description
  ```tsx
  // CURRENT
  <div className="font-semibold text-gray-900">Email Notifications</div>
  <div className="text-sm text-gray-600">Receive email updates about your deals</div>

  // CHANGE TO
  <div className="font-semibold text-gray-900">Email Notifications</div>
  <div className="text-sm text-gray-600">Get updates about your opportunities</div>
  ```

- [ ] **Line 232-233**: Public profile description
  ```tsx
  // CURRENT
  <div className="font-semibold text-gray-900">Public Profile</div>
  <div className="text-sm text-gray-600">Make your profile visible to brands</div>

  // CHANGE TO
  <div className="font-semibold text-gray-900">Public Profile</div>
  <div className="text-sm text-gray-600">Let brands discover you</div>
  ```

---

### 12. Version Switcher
**File**: `/components/ui/VersionSwitcher.tsx`

- [ ] **Lines 15, 22, 29**: Update version descriptions
  ```tsx
  // CURRENT
  description: 'Professional and accessible',
  description: 'High energy sports focus',
  description: 'Elegant luxury experience',

  // CHANGE TO
  description: 'Clean, clear, and easy to use',
  description: 'Bold and energetic for athletes',
  description: 'Premium feel for high-value deals',
  ```

---

### 13. Showcase V2 Header
**File**: `/app/showcase-v2/page.tsx`

- [ ] **Lines 124-129**: Update energetic header
  ```tsx
  // CURRENT
  <h1>ChatNIL ENERGETIC</h1>
  <p>V2.0 • BOLD & POWERFUL</p>

  // CHANGE TO
  <h1>ChatNIL UNLEASHED</h1>
  <p>BOLD DESIGN FOR BOLD ATHLETES</p>
  ```

- [ ] **Lines 219-243**: Soften ALL CAPS descriptions (make them readable but energetic)
  ```tsx
  // CURRENT (examples)
  description="HIGH-ENERGY CONTENT DISPLAYS"
  description="ELITE ATHLETE SHOWCASE"

  // CHANGE TO
  description="Cards that command attention"
  description="Showcase your elite status"
  ```

---

### 14. Showcase V3 Header
**File**: `/app/showcase-v3/page.tsx`

- [ ] **Lines 73-77**: Update premium header
  ```tsx
  // CURRENT
  <h1>ChatNIL Premium Collection</h1>
  <p>Version 3.0 • Sophisticated & Elegant Design System</p>

  // CHANGE TO
  <h1>ChatNIL Premier Experience</h1>
  <p>Premium design for high-value partnerships</p>
  ```

---

## 🟢 LOW PRIORITY - Polish Pass (Est. 30 min)

### 15. Footer Text (All 3 Showcases)

**Files**:
- `/app/showcase/page.tsx` (lines 191-196)
- `/app/showcase-v2/page.tsx` (lines 285-293)
- `/app/showcase-v3/page.tsx` (lines 270-285)

- [ ] Update all footer text
  ```tsx
  // CURRENT
  <p className="text-gray-600">
    Built with Next.js 14, Tailwind CSS, and Framer Motion
  </p>
  <p className="text-sm text-gray-500 mt-2">
    ChatNIL Design System v2.0
  </p>

  // CHANGE TO
  <p className="text-gray-600">
    Designed for student-athletes, built with care
  </p>
  <p className="text-sm text-gray-500 mt-2">
    ChatNIL • Empowering Your NIL Journey
  </p>
  ```

---

### 16. Code Placeholder Text (All 3 Showcases)

**Files**: All showcase pages in ComponentDemo component

- [ ] Update code placeholder
  ```tsx
  // CURRENT
  <code>{`// Component code will be displayed here
  // This is a placeholder for the actual component code`}</code>

  // CHANGE TO
  <code>{`// Component code available in our design system
  // Want to build with ChatNIL? Contact us for docs`}</code>
  ```

---

## Progress Tracking

### HIGH PRIORITY (Must Complete)
- [ ] 1. Main Showcase Header (V1)
- [ ] 2. Component Demo Descriptions (V1)
- [ ] 3. Athlete Card Example
- [ ] 4. Deal Card Example
- [ ] 5. Opportunity Card Example
- [ ] 6. Quiz Card Example
- [ ] 7. Badge Card Example
- [ ] 8. Metric Card Example
- [ ] 9. Showcase V3 Component Descriptions

**Total HIGH Priority Items**: 9 sections
**Estimated Time**: 2-3 hours

---

### MEDIUM PRIORITY (Should Complete)
- [ ] 10. Button Examples Sections
- [ ] 11. Form Examples
- [ ] 12. Version Switcher
- [ ] 13. Showcase V2 Header
- [ ] 14. Showcase V3 Header

**Total MEDIUM Priority Items**: 5 sections
**Estimated Time**: 1-2 hours

---

### LOW PRIORITY (Nice to Have)
- [ ] 15. Footer Text (All 3 Showcases)
- [ ] 16. Code Placeholder Text

**Total LOW Priority Items**: 2 sections
**Estimated Time**: 30 minutes

---

## Testing Checklist

After implementing changes:

- [ ] **Visual Check**: Review all 3 showcase versions in browser
- [ ] **Consistency Check**: Verify similar components have similar copy across versions
- [ ] **Tone Check**: Does each version maintain its personality (Clean vs Energetic vs Premium)?
- [ ] **Readability**: Can you understand each description in 3 seconds or less?
- [ ] **Personal Language**: Did you use "you/your" wherever appropriate?
- [ ] **Jargon Check**: Is FMV explained? Are technical terms removed or clarified?
- [ ] **Mobile Review**: Check copy length on mobile breakpoints
- [ ] **Accessibility**: Can descriptions work with screen readers?

---

## Copy Files to Reference

While implementing:
1. **Brand Voice Guide**: `/docs/BRAND_VOICE.md`
2. **Quick Reference**: `/docs/COPY_QUICK_REFERENCE.md`
3. **Detailed Improvements**: `/docs/SHOWCASE_COPY_IMPROVEMENTS.md`

---

## Questions During Implementation?

Ask yourself:
1. Would a college athlete understand this?
2. Does it sound empowering or overwhelming?
3. Is it benefit-focused (why should they care)?
4. Would I say this to a friend?

If the answer is "no" to any, revise.

---

## After Implementation

- [ ] Create pull request with title: "feat: Polish showcase copy for athlete-focused voice"
- [ ] Link to `/docs/SHOWCASE_COPY_IMPROVEMENTS.md` in PR description
- [ ] Request review from product/design team
- [ ] Schedule user testing with 3-5 athletes if possible
- [ ] Update this checklist with any learnings for next time

---

**Document Version**: 1.0
**Created**: 2025-10-27
**Status**: Ready to implement
