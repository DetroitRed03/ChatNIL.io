# Athlete Profile - Quick Reference Card

## 🚀 Quick Start

### Import Components
```typescript
// Reusable components
import {
  SportsPositionPicker,
  InterestsSelector,
  SocialMediaStatsCard,
  PortfolioItemCard,
  PortfolioGrid,
} from '@/components/profile';

// Main components
import {
  ProfileHero,
  AboutSection,
  AthleticSection,
} from '@/components/profile';

// Mobile
import { BottomSheet, useBottomSheet } from '@/components/profile/mobile/BottomSheet';
```

---

## 📦 Component Props Cheat Sheet

### SportsPositionPicker
```typescript
<SportsPositionPicker
  selectedSport="Basketball"
  selectedPosition="PG"
  onSportChange={(sport) => setSport(sport)}
  onPositionChange={(pos) => setPosition(pos)}
  showPositionDefinition={true}
  error="Sport is required"
/>
```

### InterestsSelector
```typescript
<InterestsSelector
  selectedInterests={{
    'Content Creation': ['vlogs', 'tutorials'],
    'Lifestyle Interests': ['fitness'],
  }}
  onChange={(category, interests) => {
    setInterests(prev => ({ ...prev, [category]: interests }))
  }}
  maxPerCategory={10}
/>
```

### SocialMediaStatsCard
```typescript
<SocialMediaStatsCard
  platform="instagram" // 'instagram' | 'tiktok' | 'twitter' | 'youtube'
  data={{
    handle: '@athlete',
    followers: 50000,
    engagementRate: 4.5,
    verified: true,
  }}
  onChange={(data) => updateSocial(data)}
  isEditable={true}
  showLastUpdated={true}
/>
```

### PortfolioGrid
```typescript
<PortfolioGrid
  items={[{
    id: '1',
    type: 'image', // 'image' | 'video' | 'reel' | 'story'
    url: 'https://...',
    thumbnailUrl: 'https://...',
    metrics: { views: 1000, likes: 50, comments: 10 },
    sponsored: true,
    brand: 'Nike',
  }]}
  mode="edit" // 'edit' | 'view'
  onEdit={(item) => openModal(item)}
  onDelete={(id) => remove(id)}
  onClick={(item) => viewFullSize(item)}
/>
```

### BottomSheet
```typescript
const { isOpen, open, close } = useBottomSheet();

<BottomSheet
  isOpen={isOpen}
  onClose={close}
  title="Quick Actions"
  snapPoints={[50, 90]} // % heights
  defaultSnapPoint={0}
>
  {/* Content */}
</BottomSheet>
```

---

## 🎨 Design Tokens

### Colors
```css
primary:    #f97316  /* Orange */
accent:     #f59e0b  /* Gold */
success:    #10b981  /* Green */
background: #FAF6F1  /* Warm Cream */
```

### Spacing
```typescript
gap-2   // 8px
gap-4   // 16px
gap-6   // 24px
gap-8   // 32px
p-4     // 16px padding
p-6     // 24px padding
```

### Font Sizes
```typescript
text-xs   // 12px
text-sm   // 14px
text-base // 16px
text-lg   // 18px
text-xl   // 20px
text-2xl  // 24px
text-4xl  // 36px
```

---

## 📱 Responsive Classes

```typescript
// Mobile-first approach
<div className="
  grid
  grid-cols-1      // Mobile: 1 column
  sm:grid-cols-2   // Tablet: 2 columns
  lg:grid-cols-3   // Desktop: 3 columns
  gap-4
">
```

### Common Patterns
```typescript
// Stack on mobile, row on desktop
flex flex-col sm:flex-row

// Hide on mobile
hidden lg:block

// Show only on mobile
block lg:hidden

// Full width on mobile, fixed on desktop
w-full lg:w-auto
```

---

## 🔗 API Integration

### Fetch Profile
```typescript
const response = await fetch(`/api/user/get-profile?id=${userId}`);
const athlete = await response.json();
```

### Update Profile
```typescript
await fetch('/api/user/update-athlete-profile', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bio: 'Updated bio',
    primarySport: 'Basketball',
    // ... other fields
  }),
});
```

### Upload Portfolio Item
```typescript
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  body: formData,
});

const { url } = await response.json();
```

---

## 🎯 Common Tasks

### Calculate Profile Completion
```typescript
function calculateCompletion(profile) {
  const required = ['firstName', 'lastName', 'school', 'primarySport'];
  const optional = ['bio', 'gpa', 'major', 'position'];

  const requiredCount = required.filter(f => profile[f]).length;
  const optionalCount = optional.filter(f => profile[f]).length;

  return Math.round(
    (requiredCount / required.length) * 60 +
    (optionalCount / optional.length) * 40
  );
}
```

### Format Follower Count
```typescript
function formatFollowers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
```

### Validate Social Handle
```typescript
function validateHandle(handle: string): boolean {
  return handle.startsWith('@') &&
         !handle.includes(' ') &&
         handle.length > 2;
}
```

---

## ⚡ Performance Tips

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src={url}
  alt="Profile photo"
  width={400}
  height={400}
  sizes="(max-width: 768px) 100vw, 400px"
  priority={isAboveFold}
/>
```

### Lazy Loading Tabs
```typescript
const PersonalTab = dynamic(() => import('./PersonalTab'), {
  loading: () => <Skeleton />,
});
```

### Debounced Autosave
```typescript
const debouncedSave = useMemo(
  () => debounce(saveProfile, 500),
  []
);

useEffect(() => {
  debouncedSave(profileData);
}, [profileData, debouncedSave]);
```

---

## 🐛 Debugging Checklist

### Component Not Rendering
- [ ] Check import path
- [ ] Verify props are passed correctly
- [ ] Look for TypeScript errors
- [ ] Check console for runtime errors

### Styles Not Applying
- [ ] Verify Tailwind classes are valid
- [ ] Check specificity (custom CSS overriding?)
- [ ] Ensure parent doesn't have `overflow: hidden`
- [ ] Clear cache and rebuild

### Autosave Not Working
- [ ] Check network tab for API calls
- [ ] Verify debounce timeout
- [ ] Check API endpoint returns 200
- [ ] Look for validation errors

### Mobile Issues
- [ ] Test on real device (not just DevTools)
- [ ] Check viewport meta tag
- [ ] Verify touch targets are 44x44px+
- [ ] Test gestures (swipe, tap)

---

## 📚 File Locations

```
/app/profile/
  [id]/page.tsx          # Public profile
  edit/page.tsx          # Edit profile

/components/profile/
  ProfileHero.tsx
  AboutSection.tsx
  AthleticSection.tsx
  ProfileSidebarMobile.tsx

  reusable/
    SportsPositionPicker.tsx
    InterestsSelector.tsx
    SocialMediaStatsCard.tsx
    PortfolioItemCard.tsx

  mobile/
    BottomSheet.tsx

/docs/
  ATHLETE_PROFILE_DESIGN.md
  ATHLETE_PROFILE_IMPLEMENTATION_GUIDE.md
  ATHLETE_PROFILE_SUMMARY.md
```

---

## 🎓 Learning Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Next.js 14**: https://nextjs.org/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

## ✅ Pre-Launch Checklist

- [ ] Replace mock data with API calls
- [ ] Test all forms with validation
- [ ] Verify autosave works
- [ ] Test on iOS and Android
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Check accessibility (keyboard, screen reader)
- [ ] Verify image optimization
- [ ] Test with slow network (3G)
- [ ] Add error boundaries
- [ ] Set up analytics tracking

---

**Quick Reference Version**: 1.0
**Last Updated**: 2025-10-27
