# Demo UI Component Reference

Quick reference guide for all demo components with usage examples.

---

## Core Components

### DemoShell

Wrapper for all demo pages with header, view switcher, and demo banner.

```tsx
import { DemoShell } from '@/components/demo/DemoShell';

<DemoShell
  activeView="athlete" // or "agency"
  onViewChange={(view) => router.push(`/demo/${view}`)}
>
  {children}
</DemoShell>
```

**Features**:
- Sticky header with ChatNIL branding
- View switcher tabs (Athlete View | Agency View)
- Demo mode warning banner
- Consistent max-width layout
- Responsive padding

---

### AthleteSelector

Searchable dropdown for selecting athletes.

```tsx
import { AthleteSelector } from '@/components/demo/AthleteSelector';

<AthleteSelector
  onSelect={(athleteId) => setSelectedAthleteId(athleteId)}
  selectedAthleteId={selectedAthleteId}
/>
```

**Props**:
- `onSelect`: Callback when athlete selected
- `selectedAthleteId?`: Currently selected athlete ID

**API**: Fetches from `/api/demo/fmv/athletes`

---

### CampaignSelector

Searchable dropdown for selecting campaigns.

```tsx
import { CampaignSelector } from '@/components/demo/CampaignSelector';

<CampaignSelector
  onSelect={(campaignId) => setSelectedCampaignId(campaignId)}
  selectedCampaignId={selectedCampaignId}
/>
```

**Props**:
- `onSelect`: Callback when campaign selected
- `selectedCampaignId?`: Currently selected campaign ID

**API**: Fetches from `/api/demo/matchmaking/campaigns`

---

## FMV Components

### FMVScoreGauge

Animated circular gauge displaying FMV score.

```tsx
import { FMVScoreGauge } from '@/components/demo/fmv/FMVScoreGauge';

<FMVScoreGauge
  score={78}
  tier="high"
  size="lg" // "sm" | "md" | "lg"
/>
```

**Props**:
- `score`: Number 0-100
- `tier`: 'elite' | 'high' | 'medium' | 'developing' | 'emerging'
- `size?`: 'sm' | 'md' | 'lg' (default: 'md')
- `className?`: Additional CSS classes

**Visual**:
- Animated count-up from 0 to score
- Circular SVG progress bar
- Tier badge below gauge
- Color-coded by tier

---

### ScoreBreakdownCards

Grid of 4 cards showing FMV category scores.

```tsx
import { ScoreBreakdownCards } from '@/components/demo/fmv/ScoreBreakdownCards';

<ScoreBreakdownCards
  fmv={{
    social_score: 24,
    athletic_score: 26,
    market_score: 14,
    brand_score: 14
  }}
/>
```

**Props**:
- `fmv`: Object with social_score, athletic_score, market_score, brand_score
- `className?`: Additional CSS classes

**Features**:
- Click card to expand details
- Progress bars with percentages
- Icons for each category
- Responsive 2x2 grid

**Categories**:
- Social Reach (30 pts max)
- Athletic Profile (30 pts max)
- Market Opportunity (20 pts max)
- Brand Alignment (20 pts max)

---

### DealValueEstimates

Display of estimated deal value ranges.

```tsx
import { DealValueEstimates } from '@/components/demo/fmv/DealValueEstimates';

<DealValueEstimates
  low={1500000}    // $15,000 in cents
  mid={3750000}    // $37,500 in cents
  high={5625000}   // $56,250 in cents
/>
```

**Props**:
- `low`: Number (in cents)
- `mid`: Number (in cents)
- `high`: Number (in cents)
- `className?`: Additional CSS classes

**Visual**:
- 3 cards: Conservative | Expected | Optimistic
- Expected column highlighted
- Currency formatting ($5K, $10K, etc.)
- Explanation card below

---

## Matchmaking Components

### MatchResultsTable

Sortable, paginated table of athlete matches.

```tsx
import { MatchResultsTable, type AthleteMatch } from '@/components/demo/matchmaking/MatchResultsTable';

<MatchResultsTable
  matches={matches}
  onAthleteClick={(match) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  }}
/>
```

**Props**:
- `matches`: Array of AthleteMatch objects
- `onAthleteClick`: Callback when row clicked
- `className?`: Additional CSS classes

**Features**:
- Sortable columns (click header to sort)
- Match percentage progress bars
- Confidence badges (color-coded)
- Pagination (10 per page)
- Hover effects on rows

**Columns**:
- Athlete (avatar + name)
- Sport
- FMV (score + tier badge)
- Match % (with progress bar)
- Confidence (High/Medium/Low)
- Recommended Offer (range)

---

### MatchScoreBreakdown

Visual breakdown of 7 match factors.

```tsx
import { MatchScoreBreakdown, type MatchScore } from '@/components/demo/matchmaking/MatchScoreBreakdown';

<MatchScoreBreakdown
  matchScore={{
    brand_values_match: 18,    // 0-20
    interests_match: 12,       // 0-15
    campaign_fit: 19,          // 0-20
    budget_alignment: 14,      // 0-15
    geography_match: 10,       // 0-10
    demographics_match: 9,     // 0-10
    engagement_potential: 10   // 0-10
  }}
/>
```

**Props**:
- `matchScore`: Object with 7 factor scores
- `className?`: Additional CSS classes

**Features**:
- Overall match percentage at top
- 7 factor cards with icons
- Progress bars for each factor
- Color-coded status (green/yellow/red)
- Score legend

---

### MatchDetailModal

Full-screen modal with athlete match details.

```tsx
import { MatchDetailModal, type AthleteMatch } from '@/components/demo/matchmaking/MatchDetailModal';

<MatchDetailModal
  isOpen={isModalOpen}
  athleteMatch={selectedMatch}
  onClose={() => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  }}
/>
```

**Props**:
- `isOpen`: Boolean
- `athleteMatch`: AthleteMatch object or null
- `onClose`: Callback to close modal

**Features**:
- Header with athlete info
- Match score breakdown
- Key strengths (green checkmarks)
- Considerations (yellow warnings)
- Recommended offer with justification
- Action buttons in footer
- ESC key to close
- Click backdrop to close
- Body scroll lock

---

## Type Definitions

### AthleteMatch

```typescript
interface AthleteMatch {
  athlete_id: string;
  athlete_name: string;
  sport: string;
  fmv_score: number;
  fmv_tier: string;
  match_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  recommended_offer_low: number; // cents
  recommended_offer_high: number; // cents
  avatar_url?: string;
  state?: string;
  match_breakdown: MatchScore;
  strengths: string[];
  concerns: string[];
  offer_justification?: string;
}
```

### MatchScore

```typescript
interface MatchScore {
  brand_values_match: number;    // 0-20
  interests_match: number;       // 0-15
  campaign_fit: number;          // 0-20
  budget_alignment: number;      // 0-15
  geography_match: number;       // 0-10
  demographics_match: number;    // 0-10
  engagement_potential: number;  // 0-10
}
```

### FMVData

```typescript
interface FMVData {
  fmv_score: number;                    // 0-100
  fmv_tier: 'elite' | 'high' | 'medium' | 'developing' | 'emerging';
  social_score: number;                 // 0-30
  athletic_score: number;               // 0-30
  market_score: number;                 // 0-20
  brand_score: number;                  // 0-20
  estimated_deal_value_low: number;     // cents
  estimated_deal_value_mid: number;     // cents
  estimated_deal_value_high: number;    // cents
}
```

---

## Styling Guide

### Colors

**Tier Colors**:
```tsx
// Elite
className="text-accent-600 bg-accent-50"

// High
className="text-primary-600 bg-primary-50"

// Medium
className="text-success-600 bg-success-50"

// Developing
className="text-warning-600 bg-warning-50"

// Emerging
className="text-gray-600 bg-gray-50"
```

**Confidence Colors**:
```tsx
// High confidence
<Badge variant="success">High</Badge>

// Medium confidence
<Badge variant="warning">Medium</Badge>

// Low confidence
<Badge variant="gray">Low</Badge>
```

### Spacing

```tsx
// Page sections
className="space-y-8"

// Card content
className="space-y-4"

// Small groups
className="space-y-2"

// Grid gaps
className="gap-4 md:gap-6"
```

### Responsive Breakpoints

```tsx
// Mobile-first approach
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Hide on mobile
className="hidden md:block"

// Adjust padding
className="p-4 md:p-6 lg:p-8"
```

---

## Animation Patterns

### Entry Animation

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {content}
</motion.div>
```

### Staggered List

```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1, duration: 0.3 }}
  >
    {item.content}
  </motion.div>
))}
```

### Modal Animation

```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: 20 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 20 }}
  transition={{ duration: 0.2 }}
>
  {modal content}
</motion.div>
```

---

## Common Patterns

### Loading State

```tsx
import { Skeleton } from '@/components/ui/Skeleton';

{isLoading ? (
  <Card>
    <CardContent className="p-6 space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </CardContent>
  </Card>
) : (
  <ActualContent />
)}
```

### Empty State

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { Target } from 'lucide-react';

{data.length === 0 ? (
  <Card>
    <CardContent className="p-12">
      <EmptyState
        icon={Target}
        title="No Results"
        description="Try adjusting your filters to see more results"
      />
    </CardContent>
  </Card>
) : (
  <DataDisplay data={data} />
)}
```

### Error Handling

```tsx
{error ? (
  <Card>
    <CardContent className="p-12">
      <EmptyState
        icon={AlertCircle}
        title="Something Went Wrong"
        description="There was an error loading the data. Please try again."
      />
    </CardContent>
  </Card>
) : (
  <DataDisplay />
)}
```

---

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible on all focusable elements
- [ ] ARIA labels on buttons and controls
- [ ] Semantic HTML (header, main, section, nav)
- [ ] Alt text on images
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader announcements for loading states
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Form labels associated with inputs
- [ ] Modal traps focus when open

---

## Performance Tips

1. **Lazy Loading**: Consider lazy loading the match detail modal
   ```tsx
   const MatchDetailModal = dynamic(() => import('./MatchDetailModal'));
   ```

2. **Memoization**: Memoize expensive calculations
   ```tsx
   const sortedMatches = useMemo(() => {
     return matches.sort(...);
   }, [matches, sortKey, sortDirection]);
   ```

3. **Debounce Search**: Debounce search input
   ```tsx
   const debouncedSearch = useDebounce(searchQuery, 300);
   ```

4. **Virtual Scrolling**: For large lists (>100 items), use virtual scrolling

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Features Used**:
- CSS Grid
- Flexbox
- CSS Custom Properties
- IntersectionObserver
- ResizeObserver
- Framer Motion animations

---

## Troubleshooting

### Component not rendering
- Check that API endpoint is returning data
- Verify data structure matches TypeScript types
- Check browser console for errors

### Animations not working
- Ensure framer-motion is installed
- Check that parent has proper layout
- Verify AnimatePresence is used for exit animations

### Styles not applying
- Verify Tailwind classes are correct
- Check that component imports cn() utility
- Ensure no CSS specificity conflicts

---

## Support

For questions or issues:
1. Check this reference guide
2. Review API requirements document
3. Check component source code for inline comments
4. Verify data structure matches expected types
