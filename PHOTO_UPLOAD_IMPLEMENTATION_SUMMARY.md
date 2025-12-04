# Photo Upload & Profile Enhancement - Implementation Summary

## ✅ Week 1 Complete: Backend Infrastructure

### Files Created

#### 1. Database Migration
**File**: `/migrations/070_add_profile_cover_photos.sql`

**What it does**:
- Adds `cover_photo_url` field to users table
- Adds `profile_photo_uploaded_at` and `cover_photo_uploaded_at` timestamp fields (for cache busting)
- Adds athlete physical stats: `height_inches`, `weight_lbs`, `jersey_number`
- Creates `athlete-profile-media` storage bucket (PUBLIC for direct CDN access)
- Sets up RLS policies for secure uploads (user-scoped, public read access)
- Creates indexes for performance

**To apply**:
```bash
# Option 1: Via Supabase Dashboard
# - Go to SQL Editor
# - Paste contents of migration file
# - Run

# Option 2: Via npx tsx script (create script if needed)
npx tsx scripts/apply-migration-070.ts
```

#### 2. Type Definitions
**File**: `/lib/types/photo-upload.ts`

**Exports**:
- `PhotoType` - 'profile' | 'cover'
- `PHOTO_CONSTRAINTS` - File size limits, dimensions, MIME types
- `PhotoUploadErrorCode` - Enum of error codes
- `FILE_SIGNATURES` - Magic bytes for validation
- Type interfaces for requests/responses

#### 3. Upload Utilities
**File**: `/lib/photo-upload-utils.ts`

**Functions**:
- `validatePhotoUpload()` - Validates file size, type, dimensions, signature
- `uploadPhoto()` - Processes with Sharp, converts to WebP, uploads to Supabase
- `updateUserPhotoUrl()` - Updates database with photo URL and timestamp
- `deleteOldPhoto()` - Cleanup old photos
- `formatHeight()`, `formatWeight()` - Display helpers
- `getCacheBustedPhotoUrl()` - Appends timestamp query param for cache invalidation

**Processing pipeline**:
1. Validates file signature (prevents extension spoofing)
2. Resizes to optimal dimensions (400x400 profile, 1584x396 cover)
3. Converts to WebP (25-35% size reduction)
4. Strips EXIF data (privacy)
5. Uploads to user-scoped folder

#### 4. API Routes
**Files**:
- `/app/api/profile/photo/profile/route.ts` - Profile photo upload
- `/app/api/profile/photo/cover/route.ts` - Cover photo upload

**Flow**:
1. Authenticate user (Supabase Auth)
2. Parse FormData
3. Validate file (size, type, dimensions, signature)
4. Get current photo URL (for cleanup)
5. Upload new photo to storage (with Sharp processing)
6. Update database with new URL and timestamp
7. Delete old photo (fire and forget)
8. Return success response with public URL

**Endpoints**:
```
POST /api/profile/photo/profile
POST /api/profile/photo/cover
```

### Dependencies Installed

```bash
npm install sharp  # Image processing
```

---

## 📋 Next Steps

### To Apply Migration (Do This First!)

**Create script**: `/scripts/apply-migration-070.ts`

```typescript
import { createServiceRoleClient } from '@/lib/supabase/server';
import fs from 'fs';
import path from 'path';

async function applyMigration() {
  const supabase = createServiceRoleClient();

  const migrationPath = path.join(process.cwd(), 'migrations', '070_add_profile_cover_photos.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📝 Applying migration 070...');

  const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  console.log('✅ Migration 070 applied successfully!');
  console.log('📸 Profile photo infrastructure ready');
  console.log('🎨 Cover photo support added');
  console.log('📊 Athlete stats fields created');
}

applyMigration();
```

**Run**:
```bash
npx tsx scripts/apply-migration-070.ts
```

**OR** manually via Supabase Dashboard SQL Editor.

### Week 2: Frontend Implementation (Pending)

**Tasks**:
1. Create `PhotoUpload.tsx` component with cropping UI
2. Update public profile page to display photos with scrim overlay
3. Add upload UI to edit profile page
4. Test upload flow end-to-end

**Files to Create**:
- `/components/profile/PhotoUpload.tsx`
- `/components/profile/PhotoCropModal.tsx` (optional, can use library directly)

**Files to Modify**:
- `/app/profile/page.tsx` - Add upload UI
- `/app/athletes/[username]/page.tsx` - Display photos with scrim overlay

### Week 3: Profile Enhancements (Pending)

**Tasks**:
1. Redesign achievements section (compact grid layout)
2. Add "At-a-Glance Stats" sidebar card (height, weight, jersey, age)
3. Add age calculation from birthday

**Files to Modify**:
- `/app/athletes/[username]/page.tsx` - Achievements redesign + stats sidebar
- `/app/profile/page.tsx` - Add height, weight, jersey input fields

### Week 4: Video & Portfolio (Pending)

**Tasks**:
1. Add profile video embed section
2. Add content portfolio grid
3. Create video URL helper (YouTube/Vimeo embed)

**Files to Create**:
- `/lib/video-utils.ts` - URL parsing helpers

**Files to Modify**:
- `/app/athletes/[username]/page.tsx` - Add video + portfolio sections

---

## 🔒 Security Features Implemented

✅ **File signature validation** - Checks magic bytes, not just extension
✅ **Size limits** - 2MB profile, 5MB cover (enforced server-side)
✅ **MIME type validation** - Only JPEG, PNG, WebP allowed
✅ **Dimension validation** - Prevents massive images
✅ **User-scoped storage** - RLS policies ensure users only upload to their folder
✅ **EXIF stripping** - Privacy protection
✅ **Authentication required** - Only logged-in users can upload
✅ **Rollback on failure** - If DB update fails, uploaded file is deleted

---

## 📊 Storage Architecture

### Buckets

**`athlete-profile-media`** (PUBLIC - new):
- Profile photos (avatar)
- Cover photos (banner)
- Future: Portfolio content
- Public read access (CDN delivery)
- Authenticated write access (user-scoped)

**`user-documents`** (PRIVATE - existing):
- Contracts
- Tax forms
- Private documents
- Private read/write access

### File Structure

```
athlete-profile-media/
├── {user_id}/
│   ├── avatar.webp         # Profile photo (always same name)
│   ├── cover.webp          # Cover photo (always same name)
│   └── portfolio/          # Future: Portfolio items
│       └── item-{uuid}.webp
```

### URLs

**Storage URL**:
```
https://[project].supabase.co/storage/v1/object/public/athlete-profile-media/{user_id}/avatar.webp
```

**Cache-busted URL** (client-side):
```
https://[project].supabase.co/storage/v1/object/public/athlete-profile-media/{user_id}/avatar.webp?v=1698765432
```

---

## 🎨 Design Specifications

### Profile Photo (Avatar)
- **Max file size**: 2 MB
- **Recommended dimensions**: 400x400px (square)
- **Max dimensions**: 2000x2000px
- **Aspect ratio**: 1:1 (enforced via crop)
- **Formats**: JPEG, PNG, WebP
- **Processing**: Resize to 400x400, convert to WebP @ 85% quality
- **Display**: Circular with white ring, warm orange shadow

### Cover Photo (Banner)
- **Max file size**: 5 MB
- **Recommended dimensions**: 1584x396px (4:1 ratio)
- **Max dimensions**: 3000x1000px
- **Aspect ratio**: 4:1 (wide banner)
- **Formats**: JPEG, PNG, WebP
- **Processing**: Resize to 1584x396, convert to WebP @ 85% quality
- **Display**: Full-width header with dark gradient scrim for text legibility

### Legibility Overlay (for cover photos)
```tsx
{/* Dark gradient scrim - ensures white text is readable */}
<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
```

**Rationale**: 60% opacity black at top provides sufficient contrast for white text (WCAG AA 4.5:1) while still showcasing the uploaded photo.

---

## 🧪 Testing Checklist

### Backend (Week 1 - ✅ Complete)
- [ ] Migration applies without errors
- [ ] Storage bucket created successfully
- [ ] RLS policies work (users can only upload to their folder)
- [ ] Public read access works (unauthenticated users can view photos)
- [ ] API routes accessible at `/api/profile/photo/profile` and `/api/profile/photo/cover`

### Manual API Testing (After migration applied)
```bash
# Test profile photo upload
curl -X POST http://localhost:3000/api/profile/photo/profile \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -F "file=@test-avatar.jpg"

# Test cover photo upload
curl -X POST http://localhost:3000/api/profile/photo/cover \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -F "file=@test-cover.jpg"
```

### Frontend (Week 2 - Pending)
- [ ] Upload modal opens on click
- [ ] File validation shows clear error messages
- [ ] Progress indicator displays during upload
- [ ] Success state updates UI immediately
- [ ] Cache busting works (new photos display immediately)
- [ ] Drag-and-drop works on desktop
- [ ] Mobile camera/gallery picker works

### Visual (Week 2-3 - Pending)
- [ ] Profile photo displays as circle with ring
- [ ] Cover photo displays full-width
- [ ] Scrim overlay ensures text is readable
- [ ] Achievements section is compact (50% less space)
- [ ] Stats sidebar displays correctly

---

## 📦 Deliverables Summary

### Week 1 (Backend) - ✅ COMPLETE
- ✅ Database migration (070)
- ✅ Type definitions
- ✅ Upload utilities (with Sharp processing)
- ✅ API routes (profile + cover)
- ✅ Sharp dependency installed

### Week 2 (Frontend) - 🔲 PENDING
- 🔲 PhotoUpload component
- 🔲 Public profile photo display
- 🔲 Edit profile upload UI
- 🔲 End-to-end testing

### Week 3 (Enhancements) - 🔲 PENDING
- 🔲 Achievements redesign
- 🔲 Stats sidebar
- 🔲 New field inputs

### Week 4 (Media) - 🔲 PENDING
- 🔲 Video embed
- 🔲 Portfolio grid
- 🔲 Video URL helpers

---

## 🚀 Quick Start (After Migration)

1. **Apply migration**:
   ```bash
   # Via Supabase Dashboard or npx tsx script
   ```

2. **Verify storage bucket**:
   - Go to Supabase Dashboard > Storage
   - Check `athlete-profile-media` bucket exists
   - Verify public access is enabled

3. **Test API endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/profile/photo/profile \
     -F "file=@test.jpg"
   ```

4. **Move to Week 2**: Create PhotoUpload component

---

## 💡 Key Design Decisions

### Why WebP?
- 25-35% smaller file sizes than JPEG at same quality
- Modern browser support (95%+)
- Better compression algorithm

### Why Fixed Filenames?
- Simpler to manage (`avatar.webp`, `cover.webp`)
- No orphaned files (upsert replaces)
- Cache busting via timestamp query params
- Easier to reference (always know the path)

### Why Public Bucket?
- Profile photos need to be viewable by non-authenticated users (agencies, scouts)
- Direct CDN delivery (faster than signed URLs)
- Still secure via user-scoped upload policies

### Why Separate Endpoints?
- Clear intent (`/profile` vs `/cover`)
- Different validation constraints
- Easier to maintain and test

---

## 📚 Resources

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Next.js App Router API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [WebP Format](https://developers.google.com/speed/webp)

---

**Status**: Week 1 Backend Complete ✅
**Next**: Apply migration 070, then proceed to Week 2 (Frontend)
