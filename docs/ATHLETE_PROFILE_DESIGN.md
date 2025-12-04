# ChatNIL Athlete Profile Pages - UI/UX Design Specification

## Overview
This document outlines the comprehensive design system for athlete profile pages on the ChatNIL platform, including both public-facing portfolio views and private edit interfaces.

## Design System Foundation

### Color Palette
- **Primary Orange**: `#f97316` (ChatNIL brand)
- **Accent Gold**: `#f59e0b` (Premium/Achievement)
- **Success Green**: `#10b981` (Positive metrics)
- **Warm Cream Background**: `#FAF6F1`
- **Card White**: `#FFFBF7`
- **Text Primary**: `#1a1d20`
- **Text Secondary**: `#495057`

### Typography Scale
- **Hero Title**: `text-4xl` (36px) - Athlete name
- **Section Headers**: `text-2xl` (24px) - Section titles
- **Subsection Headers**: `text-xl` (20px) - Card titles
- **Body Text**: `text-base` (16px) - Regular content
- **Metadata**: `text-sm` (14px) - Stats labels
- **Micro Copy**: `text-xs` (12px) - Hints, badges

### Spacing System
- **Section Gap**: `space-y-8` (32px)
- **Card Padding**: `p-6` (24px)
- **Element Spacing**: `gap-4` (16px)
- **Tight Spacing**: `gap-2` (8px)

---

## 1. PUBLIC PROFILE PAGE

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    HERO HEADER                          │
│  [Avatar]  Name, School, Sport                          │
│  Stats Cards: Followers | Engagement | FMV | Deals      │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────┬───────────────────────────┐
│                             │                           │
│   MAIN CONTENT              │   SIDEBAR                 │
│   - About                   │   - Quick Actions         │
│   - Athletic Info           │   - Availability          │
│   - Social Presence         │   - FMV Breakdown         │
│   - Interests & Values      │   - Contact CTA           │
│   - Portfolio Gallery       │                           │
│                             │                           │
└─────────────────────────────┴───────────────────────────┘
```

### Hero Header Component

**Desktop (lg+)**
- Full-width gradient background (`bg-gradient-to-br from-primary-50 to-accent-50`)
- Avatar: `h-32 w-32` (128px) with border and shadow
- Name: `text-4xl font-bold`
- Stats cards in 4-column grid

**Tablet (md)**
- 2x2 stats grid
- Avatar: `h-24 w-24` (96px)

**Mobile (sm)**
- Stacked layout
- Avatar: `h-20 w-20` (80px)
- Stats cards in 2x2 grid

```tsx
interface HeroHeaderProps {
  athlete: {
    name: string;
    profilePhoto?: string;
    school: string;
    primarySport: string;
    position?: string;
    totalFollowers: number;
    avgEngagementRate: number;
    fmvScore?: number;
    activeDealCount: number;
  };
}
```

### Stats Card Component

**Visual Treatment**
- White card with subtle shadow
- Icon with gradient background
- Large metric value (`text-3xl font-bold`)
- Label below in muted text
- Hover: Slight scale and shadow increase

**Variants**
1. **Followers**: Users icon, primary gradient
2. **Engagement**: TrendingUp icon, success gradient
3. **FMV**: DollarSign icon, accent gradient
4. **Active Deals**: Handshake icon, secondary gradient

```tsx
interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  variant: 'primary' | 'success' | 'accent' | 'secondary';
  trend?: { value: number; direction: 'up' | 'down' };
}
```

### About Section

**Layout**
- Full-width card
- Bio text with `text-base leading-relaxed`
- Personal details in 2-column grid (mobile: 1-column)
- Graduation year, Major, GPA badges

**Design Details**
- Max width for readability: `max-w-3xl`
- Icons for each detail (School, GraduationCap, BookOpen, Award)
- Subtle dividers between details

### Athletic Information Section

**Card Design**
- Primary sport badge (large, accent color)
- Position with icon
- Division/Team name with shield icon
- Achievements list with trophy icons
- Coach contact (only visible to verified brands)

**Achievement Display**
- Bullet list with custom trophy icon
- Alternating background for visual rhythm
- Expandable if >5 achievements ("Show all" button)

### Social Media Presence Section

**Platform Cards (3-column grid, responsive)**
Each platform card shows:
- Platform icon + name
- Handle (clickable link)
- Follower count (large, bold)
- Engagement rate with Progress bar
- Platform color accent

**Progress Bar Styling**
- Instagram: Purple-pink gradient
- TikTok: Black-cyan gradient
- Twitter: Blue gradient
- Height: `h-3` with rounded ends

```tsx
interface SocialPlatformCardProps {
  platform: 'instagram' | 'tiktok' | 'twitter';
  handle: string;
  followers: number;
  engagementRate: number;
  verified?: boolean;
}
```

### Interests & Values Section

**Layout**
- 3 subsections in responsive grid
- Badge clouds for each category
- Hover effects on badges

**Subsections**
1. **Content Creation Interests**
   - Icons: Video, Camera, Mic
   - Badge variant: primary

2. **Causes Care About**
   - Icons: Heart
   - Badge variant: success

3. **Brand Affinity**
   - Icons: Star
   - Badge variant: accent

### Portfolio Gallery Section

**Grid Layout**
- 3-column grid (lg), 2-column (md), 1-column (sm)
- Equal height cards with aspect ratio
- Masonry layout for visual interest

**Portfolio Item Card**
```tsx
interface PortfolioItemProps {
  type: 'image' | 'video' | 'reel' | 'story';
  url: string;
  thumbnailUrl?: string;
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  sponsored: boolean;
  brand?: string;
}
```

**Card Design**
- Image/video thumbnail with play button overlay (videos)
- Sponsored badge in top-right corner
- Metrics bar at bottom (semi-transparent overlay)
- Click to open lightbox/modal

### Sidebar Components

**Quick Actions Card**
- Primary CTA: "Start Partnership Discussion"
- Secondary: "Download Media Kit"
- Tertiary: "Share Profile"
- Full-width buttons with icons

**Availability Status**
- Visual indicator (green dot = available)
- Text: "Available for partnerships"
- Response time estimate

**FMV Breakdown Card**
- Circular progress indicator showing percentile
- Tier badge (Bronze/Silver/Gold/Platinum)
- Breakdown list:
  - Social Score: X%
  - Engagement Score: Y%
  - Athletic Performance: Z%

**Mobile Behavior**
- Sidebar becomes bottom sheet
- Sticky "Quick Actions" button at bottom
- Slide-up drawer with sidebar content

---

## 2. PRIVATE EDIT PROFILE PAGE

### Layout Structure

**Tabbed Interface**
```
┌─────────────────────────────────────────────────────────┐
│  Profile Completion: [=========>      ] 65%             │
├─────────────────────────────────────────────────────────┤
│  [Personal] [Athletic] [Social] [Interests] [NIL] [Portfolio] │
├────────────────────────────────────────────────────��────┤
│                                                         │
│              ACTIVE TAB CONTENT                         │
│              (Form fields with autosave)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Profile Completion Indicator

**Visual Design**
- Horizontal progress bar with gradient
- Percentage text overlay
- Completion tier badges (Basic: 40%, Full: 80%, Elite: 100%)
- Motivational micro-copy: "X% to unlock Premium features!"

```tsx
interface ProfileCompletionProps {
  completionScore: number;
  missingFields: string[];
  nextMilestone: { percentage: number; reward: string };
}
```

### Autosave Behavior

**Implementation**
- Debounced saves (500ms after last edit)
- Visual indicator: "Saving..." → "Saved ✓"
- Position: Top-right of each section
- Offline: Queue changes, sync when online

### Tab Sections

#### 1. Personal Tab
**Fields**
- Profile photo upload (drag-drop, crop)
- First name, Last name
- Bio (rich text, 500 char limit, counter)
- Date of birth
- Email (read-only if authenticated)
- Phone
- School name (autocomplete)
- Graduation year (dropdown: current year - 6 to current year + 6)
- Major (autocomplete from common majors)
- GPA (slider: 0.0 - 4.0)

#### 2. Athletic Tab
**Components**
- SportsPositionPicker (see below)
- Secondary sports (multi-select)
- Division (dropdown: D1, D2, D3, NAIA, JUCO)
- Team name
- Coach name + email
- Achievements (dynamic list, add/remove)

#### 3. Social Tab
**Design**
- SocialMediaStatsCard for each platform
- Toggle to enable/disable platforms
- Input validation for handles (@required)
- Follower count NumberStepper
- Engagement rate slider (0-100%)

#### 4. Interests Tab
**Components**
- InterestsSelector (multi-category)
- Categories: Hobbies, Content Creation, Lifestyle, Causes, Brand Affinity
- Visual: Checkbox chips with icons
- Search/filter functionality

#### 5. NIL Preferences Tab
**Form Sections**
- Deal types (checkboxes: Sponsored posts, Appearances, Endorsements, etc.)
- Compensation range (dual-range slider)
- Content types willing to create
- Blacklist categories (multi-select)
- Partnership length preference
- Geographic preferences

#### 6. Portfolio Tab
**Upload Interface**
- Drag-drop zone for media
- File type validation (images, videos)
- Thumbnail generation
- Metadata form per item:
  - Type dropdown
  - URL (optional)
  - Metrics inputs
  - Sponsored toggle
  - Brand name (if sponsored)
- Preview grid with edit/delete actions

---

## 3. REUSABLE COMPONENTS SPECIFICATIONS

### SportsPositionPicker

**Behavior**
- Primary sport dropdown (searchable)
- Position dropdown (dynamic based on sport)
- Sport-specific position lists:
  - Football: QB, RB, WR, TE, OL, DL, LB, DB, K, P
  - Basketball: PG, SG, SF, PF, C
  - Baseball: P, C, 1B, 2B, 3B, SS, OF
  - Soccer: GK, DF, MF, FW
  - Track & Field: Sprints, Distance, Jumps, Throws
  - (etc.)

**Visual**
- Sport icon + name
- Position badge with sport color
- Tooltip with position abbreviation definitions

```tsx
interface SportsPositionPickerProps {
  selectedSport?: string;
  selectedPosition?: string;
  onSportChange: (sport: string) => void;
  onPositionChange: (position: string) => void;
  error?: string;
}
```

### InterestsSelector

**Layout**
- Accordion sections for each category
- Within category: Checkbox chips
- "Select All" / "Clear" per category
- Visual count: "3 selected"

**Categories & Options**
1. **Content Creation**: Vlogs, Tutorials, Reviews, Behind-the-scenes, Live streams
2. **Lifestyle**: Fashion, Fitness, Food, Travel, Gaming, Music
3. **Causes**: Environment, Education, Health, Social justice, Animals
4. **Brand Affinity**: Sports brands, Tech, Fashion, Food & Beverage, Automotive

**Interaction**
- Click chip to toggle
- Selected: Bold, darker background, check icon
- Max selections per category: 10

```tsx
interface InterestsSelectorProps {
  categories: {
    [key: string]: string[]; // category: [options]
  };
  selectedInterests: {
    [key: string]: string[]; // category: [selected options]
  };
  onChange: (category: string, interests: string[]) => void;
  maxPerCategory?: number;
}
```

### SocialMediaStatsCard

**Card Design**
- Platform logo header
- Handle input (with @ prefix)
- Follower count stepper (with K, M suffixes)
- Engagement rate slider
- Verified badge toggle
- Last updated timestamp

**Validation**
- Handle format check
- Engagement rate 0-100%
- Followers min: 0

```tsx
interface SocialMediaStatsCardProps {
  platform: 'instagram' | 'tiktok' | 'twitter' | 'youtube';
  data: {
    handle?: string;
    followers?: number;
    engagementRate?: number;
    verified?: boolean;
  };
  onChange: (data: Partial<SocialMediaStatsCardProps['data']>) => void;
  onRemove?: () => void;
  isEditable?: boolean;
}
```

### PortfolioItemCard

**Display Mode**
- Thumbnail with aspect ratio
- Media type badge
- Metrics overlay (views, likes, comments)
- Sponsored indicator
- Brand name if applicable

**Edit Mode**
- All display elements
- Plus: Edit icon button
- Delete icon button
- Drag handle for reordering

**Modal/Form**
- Image/video preview
- URL input
- Type selector
- Metrics inputs (NumberSteppers)
- Sponsored toggle
- Brand input (conditional on sponsored)

```tsx
interface PortfolioItemCardProps {
  item: {
    id: string;
    type: 'image' | 'video' | 'reel' | 'story';
    url: string;
    thumbnailUrl?: string;
    metrics?: {
      views?: number;
      likes?: number;
      comments?: number;
    };
    sponsored: boolean;
    brand?: string;
  };
  mode: 'view' | 'edit';
  onEdit?: (item: PortfolioItemCardProps['item']) => void;
  onDelete?: (id: string) => void;
}
```

### AchievementsList

**Design**
- Each achievement in card with trophy icon
- Date (optional)
- Description
- Remove button (edit mode)
- Add button at bottom

**Interaction**
- Click "Add Achievement"
- Modal/inline form appears
- Input: Description (required), Date (optional)
- Save adds to list
- Sortable via drag handles

```tsx
interface AchievementsListProps {
  achievements: Array<{
    id: string;
    description: string;
    date?: string;
  }>;
  onChange: (achievements: AchievementsListProps['achievements']) => void;
  isEditable: boolean;
  maxItems?: number;
}
```

### NILPreferencesForm

**Sections**
1. **Deal Types**: Multi-checkbox
2. **Compensation**: Dual-range slider ($X - $Y)
3. **Content Types**: Multi-checkbox
4. **Blacklist**: Multi-select dropdown
5. **Partnership Length**: Radio buttons (One-time, Short-term, Long-term, Ongoing)

**Validation**
- At least 1 deal type selected
- Min compensation < Max compensation
- At least 1 content type selected

```tsx
interface NILPreferencesFormProps {
  preferences: {
    dealTypes: string[];
    compensationRange: [number, number];
    contentTypes: string[];
    blacklistCategories: string[];
    partnershipLength: 'one-time' | 'short-term' | 'long-term' | 'ongoing';
  };
  onChange: (prefs: NILPreferencesFormProps['preferences']) => void;
}
```

---

## 4. RESPONSIVE DESIGN BREAKPOINTS

### Mobile (< 640px)
- Single column layout
- Stacked stats cards
- Sidebar becomes bottom sheet
- Tabs become vertical scrollable list
- Touch-optimized button sizes (min 44x44px)

### Tablet (640px - 1024px)
- 2-column layout for cards
- Sidebar remains in sidebar position
- Tabs horizontal with scroll if needed

### Desktop (1024px+)
- 3-column card grids
- Full sidebar visible
- All tabs visible in horizontal row
- Hover states active

---

## 5. ACCESSIBILITY FEATURES

### Keyboard Navigation
- Tab order: Logical flow (hero → content → sidebar)
- Focus indicators: 2px orange ring
- Skip links: "Skip to main content"
- Arrow keys for tab navigation

### Screen Reader Support
- Semantic HTML: `<main>`, `<section>`, `<article>`
- ARIA labels on icons
- Image alt text for all media
- Form labels associated with inputs
- Progress bar has aria-valuenow, aria-valuemin, aria-valuemax

### Color Contrast
- Text on background: 7:1 (AAA)
- UI elements: 4.5:1 (AA)
- Disabled state: Maintain contrast

### Focus Management
- Modal opens: Focus on first input
- Modal closes: Return to trigger element
- Form submission: Focus on error or success message

---

## 6. ANIMATIONS & TRANSITIONS

### Page Load
- Hero: Fade in + slide up (300ms)
- Stats cards: Stagger animation (50ms delay each)
- Content sections: Fade in on scroll into view

### Interactions
- Button hover: Scale 1.02, shadow increase (150ms)
- Card hover: Lift effect, shadow lg → xl (200ms)
- Tab switch: Fade out → Fade in (200ms)
- Autosave indicator: Slide in from right (150ms)

### Framer Motion Variants
```tsx
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 }
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.05 } }
};

const cardHover = {
  rest: { scale: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: { scale: 1.02, boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }
};
```

---

## 7. INTEGRATION POINTS

### With Design System
- All components use existing Card, Badge, Avatar, Progress, Input, Tabs
- Color palette from tailwind.config.js
- Icons from lucide-react
- Animations with framer-motion

### With Backend
- Profile data from `/api/user/get-profile`
- Updates via `/api/user/update-athlete-profile`
- Social stats update: `/api/user/update-social-stats`
- Portfolio upload: `/api/documents/upload`
- FMV data: `/api/fmv/calculate`

### With Existing Components
- Reuse FloatingInput from onboarding
- Reuse NumberStepper, CreativeSlider from UI components
- Integrate with AuthContext for user data

---

## 8. MOBILE BOTTOM SHEET PATTERN

### Trigger
- Sticky button at bottom: "Contact Athlete" or "Edit Section"
- Gradient background to stand out

### Sheet Design
- Slides up from bottom
- Backdrop overlay (backdrop-blur-sm)
- Drag handle at top
- Close button in top-right
- Content: Sidebar components in vertical stack

### Interaction
- Swipe down to dismiss
- Click backdrop to dismiss
- ESC key to dismiss
- Smooth spring animation (framer-motion)

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl"
    >
      {/* Bottom sheet content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## 9. ERROR STATES & EMPTY STATES

### Empty Portfolio
- Illustration (athlete with camera icon)
- Heading: "Build your portfolio"
- Subtext: "Upload your best content to attract brand partnerships"
- CTA: "Upload First Item"

### No Social Media
- Illustration (disconnected plug)
- Heading: "Connect your social accounts"
- Subtext: "Link your platforms to show your reach and engagement"
- CTA: "Add Platform"

### Form Errors
- Inline error messages below fields
- Red border on invalid inputs
- Error icon (AlertCircle)
- Scroll to first error on submit

### Loading States
- Skeleton loaders for cards
- Spinner for form submissions
- Progressive image loading (blur placeholder)

---

## 10. PERFORMANCE OPTIMIZATIONS

### Image Optimization
- next/image for all images
- Lazy loading below fold
- WebP with fallback
- Responsive sizes: 400w, 800w, 1200w

### Code Splitting
- Each tab loads on demand
- Portfolio gallery virtualized (react-window)
- Heavy components lazy loaded

### Data Fetching
- Server Components for initial data
- Client Components only where needed
- SWR for profile data caching
- Optimistic updates for edits

---

## File Structure
```
/app/profile/[id]/
  - page.tsx (Public profile, Server Component)
/app/profile/edit/
  - page.tsx (Edit profile, Client Component wrapper)
  - PersonalTab.tsx
  - AthleticTab.tsx
  - SocialTab.tsx
  - InterestsTab.tsx
  - NILTab.tsx
  - PortfolioTab.tsx

/components/profile/
  - ProfileHero.tsx
  - StatsCard.tsx
  - AboutSection.tsx
  - AthleticSection.tsx
  - SocialPresenceSection.tsx
  - InterestsSection.tsx
  - PortfolioGallery.tsx
  - ProfileSidebar.tsx
  - ProfileCompletionIndicator.tsx (reuse existing)

/components/profile/reusable/
  - SportsPositionPicker.tsx
  - InterestsSelector.tsx
  - SocialMediaStatsCard.tsx
  - PortfolioItemCard.tsx
  - AchievementsList.tsx
  - NILPreferencesForm.tsx

/components/profile/mobile/
  - BottomSheet.tsx
  - MobileStatsGrid.tsx
```

---

## Success Metrics
- Profile completion rate: Target 80%+
- Time to complete profile: < 10 minutes
- Mobile usability: 100% accessible via touch
- Load time: < 2s for initial render
- Accessibility score: 100/100 (Lighthouse)

---

**Version**: 1.0
**Last Updated**: 2025-10-27
**Owner**: Nova (Frontend Architect)
