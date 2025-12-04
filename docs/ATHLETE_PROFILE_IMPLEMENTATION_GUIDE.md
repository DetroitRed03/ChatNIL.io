# ChatNIL Athlete Profile - Implementation Guide

## Overview
This guide provides step-by-step instructions for integrating the athlete profile system into the ChatNIL platform.

## What Has Been Created

### 1. Design Specification
**File**: `/docs/ATHLETE_PROFILE_DESIGN.md`

Comprehensive UI/UX design document covering:
- Layout structures for public and edit views
- Component specifications with props
- Responsive design patterns
- Accessibility requirements
- Animation guidelines
- Color and typography standards

### 2. Reusable Components

#### SportsPositionPicker
**File**: `/components/profile/reusable/SportsPositionPicker.tsx`

**Features**:
- Searchable dropdown for 20+ sports
- Sport-specific position lists
- Position abbreviation definitions
- Visual badge display
- Popular sports quick select

**Usage**:
```tsx
<SportsPositionPicker
  selectedSport={sport}
  selectedPosition={position}
  onSportChange={(sport) => setSport(sport)}
  onPositionChange={(position) => setPosition(position)}
  showPositionDefinition={true}
/>
```

#### InterestsSelector
**File**: `/components/profile/reusable/InterestsSelector.tsx`

**Features**:
- 4 categories: Content Creation, Lifestyle, Causes, Brand Affinity
- Expandable accordion sections
- Multi-select with max limits (10 per category)
- Select All / Clear All per category
- Summary view of all selections

**Usage**:
```tsx
<InterestsSelector
  selectedInterests={{
    'Content Creation': ['vlogs', 'tutorials'],
    'Lifestyle Interests': ['fitness', 'fashion'],
  }}
  onChange={(category, interests) => {
    // Handle update
  }}
  maxPerCategory={10}
/>
```

#### SocialMediaStatsCard
**File**: `/components/profile/reusable/SocialMediaStatsCard.tsx`

**Features**:
- Platform-specific styling (Instagram, TikTok, Twitter, YouTube)
- Editable and read-only modes
- Handle validation
- Follower count with NumberStepper
- Engagement rate slider
- Verified badge toggle

**Usage**:
```tsx
<SocialMediaStatsCard
  platform="instagram"
  data={{
    handle: '@athlete',
    followers: 50000,
    engagementRate: 4.5,
    verified: true
  }}
  onChange={(data) => updateSocialStats('instagram', data)}
  isEditable={true}
/>
```

#### PortfolioItemCard & PortfolioGrid
**File**: `/components/profile/reusable/PortfolioItemCard.tsx`

**Features**:
- Support for images, videos, reels, stories
- Metrics display (views, likes, comments)
- Sponsored content badges
- Edit/Delete actions in edit mode
- Lightbox click handling
- Empty state with CTA

**Usage**:
```tsx
<PortfolioGrid
  items={portfolioItems}
  mode="edit" // or "view"
  onEdit={(item) => openEditModal(item)}
  onDelete={(id) => removeItem(id)}
  onClick={(item) => openLightbox(item)}
/>
```

### 3. Main Profile Components

#### ProfileHero
**File**: `/components/profile/ProfileHero.tsx`

**Features**:
- Large avatar with ring
- Name, school, sport display
- 4 stats cards: Followers, Engagement, FMV, Active Deals
- FMV tier badge with gradient
- Animated card hover effects
- Decorative gradient background

#### AboutSection
**File**: `/components/profile/AboutSection.tsx`

**Features**:
- Bio text display
- Academic information grid
- School, graduation year, major, GPA
- GPA color coding (Excellent/Good/Fair)
- Icons for each detail

#### AthleticSection
**File**: `/components/profile/AthleticSection.tsx`

**Features**:
- Primary sport and position badges
- Secondary sports list
- Achievements with alternating backgrounds
- Coach contact (conditional on view mode)
- Division and team name badges

### 4. Page Implementations

#### Public Profile Page
**File**: `/app/profile/[id]/page.tsx`

**Structure**:
```
┌─────────────────────────────────┐
│       Profile Hero              │
├─────────────────────┬───────────┤
│  Main Content       │  Sidebar  │
│  - About            │  - Actions│
│  - Athletic         │  - Status │
│  - Social           │  - FMV    │
│  - Interests        │           │
│  - Portfolio        │           │
└─────────────────────┴───────────┘
```

**Sections**:
1. Hero with stats
2. About section
3. Athletic information
4. Social media presence (grid of platform cards)
5. Interests & values (badge clouds)
6. Portfolio gallery
7. Sidebar: Quick actions, availability, FMV breakdown

#### Edit Profile Page
**File**: `/app/profile/edit/page.tsx`

**Features**:
- Profile completion indicator (0-100%)
- Autosave with debounce (500ms)
- Visual save status (Saving/Saved/Error)
- 6 tabs: Personal, Athletic, Social, Interests, NIL, Portfolio
- Responsive tab list (scrollable on mobile)
- Form validation
- Inline field errors

**Tabs**:
1. **Personal**: Bio, name, school, graduation, major, GPA
2. **Athletic**: SportsPositionPicker, division, team
3. **Social**: 3x SocialMediaStatsCard (editable)
4. **Interests**: InterestsSelector
5. **NIL**: Preferences form (placeholder)
6. **Portfolio**: PortfolioGrid in edit mode

#### Mobile Bottom Sheet
**File**: `/components/profile/mobile/BottomSheet.tsx`

**Features**:
- Slide up from bottom animation
- Drag handle for gesture control
- Swipe to close
- Multiple snap points (50%, 90%)
- Backdrop with blur
- Escape key support
- Portal-based rendering

**Usage**:
```tsx
const { isOpen, open, close } = useBottomSheet();

return (
  <>
    <button onClick={open}>Open Sheet</button>
    <BottomSheet
      isOpen={isOpen}
      onClose={close}
      title="Quick Actions"
      snapPoints={[50, 90]}
    >
      {/* Sidebar content here */}
    </BottomSheet>
  </>
);
```

---

## Integration Steps

### Step 1: Install Dependencies
All required dependencies should already be in your project:
- `framer-motion` - Animations
- `lucide-react` - Icons
- `class-variance-authority` - Component variants
- `next/image` - Optimized images

### Step 2: API Integration

#### Update Profile Data
Replace mock data in `/app/profile/[id]/page.tsx`:

```typescript
async function getAthleteProfile(id: string) {
  const response = await fetch(`/api/user/get-profile?id=${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) return null;

  return response.json();
}
```

#### Save Profile Updates
In `/app/profile/edit/page.tsx`, implement the autosave:

```typescript
const autosave = useCallback(async () => {
  setSaveStatus('saving');

  try {
    const response = await fetch('/api/user/update-athlete-profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bio,
        firstName,
        lastName,
        primarySport,
        position,
        socialMediaStats: socialMedia,
        // ... other fields
      }),
    });

    if (!response.ok) throw new Error('Save failed');

    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  } catch (error) {
    console.error('Save error:', error);
    setSaveStatus('error');
  }
}, [bio, firstName, lastName, /* ... dependencies */]);
```

### Step 3: Add to Navigation

Update your main navigation to include profile links:

```tsx
// In your nav component
<Link href={`/profile/${user.id}`}>
  View My Profile
</Link>
<Link href="/profile/edit">
  Edit Profile
</Link>
```

### Step 4: Profile Completion Calculation

Create a utility to calculate completion score:

```typescript
// /lib/profile-completion.ts
export function calculateProfileCompletion(profile: AthleteProfile): number {
  const fields = [
    // Required fields (5 points each)
    { value: profile.firstName, points: 5 },
    { value: profile.lastName, points: 5 },
    { value: profile.school, points: 5 },
    { value: profile.primarySport, points: 5 },

    // Important fields (3 points each)
    { value: profile.bio, points: 3 },
    { value: profile.position, points: 3 },
    { value: profile.graduationYear, points: 3 },
    { value: profile.profilePhoto, points: 3 },

    // Social media (10 points for any platform)
    { value: profile.socialMediaStats?.instagram?.handle, points: 5 },
    { value: profile.socialMediaStats?.tiktok?.handle, points: 5 },

    // Additional info (2 points each)
    { value: profile.major, points: 2 },
    { value: profile.gpa, points: 2 },
    { value: profile.achievements?.length, points: 2 },

    // Interests (10 points total)
    { value: profile.contentCreationInterests?.length, points: 5 },
    { value: profile.causesCareAbout?.length, points: 5 },

    // Portfolio (15 points)
    { value: profile.contentSamples?.length, points: 15 },
  ];

  const earnedPoints = fields.reduce((sum, field) => {
    return sum + (field.value ? field.points : 0);
  }, 0);

  const totalPoints = fields.reduce((sum, field) => sum + field.points, 0);

  return Math.round((earnedPoints / totalPoints) * 100);
}
```

### Step 5: Permissions & Access Control

Add view mode logic to profile pages:

```typescript
// Determine view mode based on user
const getViewMode = (viewerId: string, profileId: string) => {
  if (viewerId === profileId) return 'athlete';

  // Check if viewer is a verified brand/agency
  const viewer = await getUser(viewerId);
  if (viewer.role === 'agency' && viewer.verificationStatus === 'verified') {
    return 'verified-brand';
  }

  return 'public';
};

// Use in AthleticSection to conditionally show coach info
<AthleticSection
  athlete={athlete}
  viewMode={viewMode}
/>
```

### Step 6: Image Upload for Portfolio

Integrate with your storage solution:

```typescript
// In edit page, add upload handler
const handlePortfolioUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  const { url } = await response.json();

  // Add to portfolio
  setPortfolioItems(prev => [...prev, {
    id: crypto.randomUUID(),
    type: file.type.startsWith('video/') ? 'video' : 'image',
    url,
    thumbnailUrl: url,
    sponsored: false,
    createdAt: new Date().toISOString(),
  }]);
};
```

### Step 7: Mobile Responsiveness

The components are already responsive, but test on real devices:

**Breakpoints**:
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md - lg)
- Desktop: > 1024px (lg+)

**Key mobile optimizations**:
- Hero stats: 2x2 grid on mobile
- Profile content: Single column
- Sidebar: BottomSheet on mobile
- Tabs: Horizontal scroll
- Portfolio: 1 column on mobile

### Step 8: SEO & Metadata

Add metadata to profile pages:

```typescript
// In /app/profile/[id]/page.tsx
export async function generateMetadata({ params }: PageProps) {
  const athlete = await getAthleteProfile(params.id);

  return {
    title: `${athlete.firstName} ${athlete.lastName} - ${athlete.primarySport} | ChatNIL`,
    description: athlete.bio || `${athlete.firstName} ${athlete.lastName} is a ${athlete.primarySport} athlete at ${athlete.school}`,
    openGraph: {
      title: `${athlete.firstName} ${athlete.lastName}`,
      description: athlete.bio,
      images: [athlete.profilePhoto || '/default-avatar.png'],
    },
  };
}
```

---

## Testing Checklist

### Functionality
- [ ] Profile loads with correct data
- [ ] Edit page autosaves changes
- [ ] Sports picker shows correct positions per sport
- [ ] Interests selector limits selections correctly
- [ ] Social media cards validate handles
- [ ] Portfolio items can be edited/deleted
- [ ] Profile completion updates in real-time

### Responsive Design
- [ ] Hero renders correctly on mobile (< 640px)
- [ ] Stats cards stack properly on small screens
- [ ] Tabs scroll horizontally on mobile
- [ ] Bottom sheet opens and closes smoothly
- [ ] All forms are usable on touch devices

### Accessibility
- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader announces changes

### Performance
- [ ] Images use next/image with proper sizing
- [ ] Autosave debounces correctly (no excessive API calls)
- [ ] Portfolio gallery loads efficiently
- [ ] Page loads in < 2s on 3G

---

## Customization Guide

### Changing Color Schemes

Update sport-specific colors in `SportsPositionPicker.tsx`:

```typescript
const SPORT_COLORS = {
  Football: 'bg-orange-500',
  Basketball: 'bg-amber-500',
  Baseball: 'bg-blue-500',
  // ... add more
};
```

### Adding New Social Platforms

In `SocialMediaStatsCard.tsx`, add to `PLATFORM_CONFIG`:

```typescript
youtube: {
  name: 'YouTube',
  icon: Youtube,
  color: 'from-red-500 to-red-600',
  bgColor: 'bg-gradient-to-br from-red-50 to-red-50',
  borderColor: 'border-red-200',
  textColor: 'text-red-700',
  placeholder: '@channelname',
}
```

### Modifying Profile Completion Milestones

Update thresholds in edit page:

```typescript
{completionScore < 40 && 'Complete basic info to reach 40%'}
{completionScore >= 40 && completionScore < 80 && 'Add more details to reach 80%'}
{completionScore >= 80 && 'Complete all fields to maximize visibility'}
```

### Adding Custom Achievements Icons

In `AthleticSection.tsx`, map achievement types to icons:

```typescript
const getAchievementIcon = (achievement: string) => {
  if (achievement.includes('All-American')) return <Star />;
  if (achievement.includes('Captain')) return <Shield />;
  if (achievement.includes('Academic')) return <GraduationCap />;
  return <Trophy />;
};
```

---

## Troubleshooting

### Autosave not working
- Check browser console for errors
- Verify API endpoint returns 200 status
- Ensure debounce timeout is not too short

### Images not loading
- Verify `next.config.js` has correct image domains
- Check file paths are absolute URLs
- Ensure storage bucket is publicly accessible

### Bottom sheet not appearing
- Check `mounted` state is true
- Verify portal renders to `document.body`
- Ensure z-index is higher than other elements

### Tabs not switching
- Check `defaultValue` matches a tab ID
- Verify TabsContext is provided
- Look for JavaScript errors in console

---

## Future Enhancements

1. **FMV Calculator Integration**
   - Real-time FMV updates
   - Breakdown visualization
   - Comparison with similar athletes

2. **Media Kit Generator**
   - PDF export with profile data
   - Custom branding options
   - One-click download

3. **Profile Analytics**
   - View count tracking
   - Brand interest metrics
   - Engagement trends

4. **Profile Sharing**
   - Social media share cards
   - QR code generation
   - Embeddable widget

5. **Advanced Portfolio**
   - Video player integration
   - Performance metrics from platforms
   - Campaign ROI tracking

---

## Support

For questions or issues:
1. Check the design spec: `/docs/ATHLETE_PROFILE_DESIGN.md`
2. Review component props in source files
3. Test with browser DevTools for responsive issues
4. Validate API responses match expected types

**Component Files**:
- `/components/profile/` - Main components
- `/components/profile/reusable/` - Reusable components
- `/components/profile/mobile/` - Mobile-specific components
- `/app/profile/` - Page implementations

**Last Updated**: 2025-10-27
**Version**: 1.0
