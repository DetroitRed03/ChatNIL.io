# ChatNIL.io - Complete System Breakdown

**Version:** 1.0.0
**Last Updated:** September 29, 2025
**Purpose:** AI-powered NIL (Name, Image, Likeness) guidance platform for student-athletes, parents, and coaches

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Key Features](#key-features)
7. [Frontend Components](#frontend-components)
8. [Backend API Routes](#backend-api-routes)
9. [Authentication & Security](#authentication--security)
10. [Onboarding System](#onboarding-system)
11. [Chat System](#chat-system)
12. [Data Flow](#data-flow)
13. [Deployment & Infrastructure](#deployment--infrastructure)

---

## Executive Summary

ChatNIL.io is a comprehensive web application designed to provide personalized NIL guidance to the college sports ecosystem. The platform serves three primary user types (athletes, parents, coaches) with role-specific onboarding, profiles, and AI-powered chat assistance.

**Core Value Proposition:**
- Personalized NIL strategy development for student-athletes
- Parental oversight and monitoring capabilities
- Coaching staff compliance management and team oversight
- AI-powered guidance tailored to each user's role and needs

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14.0.0 (App Router)
- **Language:** TypeScript 5.x
- **UI Library:** React 18
- **Styling:** Tailwind CSS 3.3.0
- **Icons:** Lucide React 0.292.0
- **State Management:** Zustand 5.0.8
- **Form Management:** React Hook Form 7.63.0 + Zod 4.1.11 validation
- **HTTP Client:** Native Fetch API

### Backend
- **Runtime:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (profile images, attachments)
- **ORM:** Supabase JS Client 2.57.4

### Development Tools
- **Package Manager:** npm
- **Linting:** ESLint 8
- **Build Tool:** Next.js built-in (Turbopack)
- **CSS Processing:** PostCSS 8 + Autoprefixer

### External Services
- **AI Provider:** (Anthropic Claude - to be integrated)
- **Email:** Supabase Auth email templates
- **File Storage:** Supabase Storage buckets

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │   Desktop    │      │
│  │  (Web App)   │  │ (Responsive) │  │    (PWA)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Frontend (React/Next.js)                 │  │
│  │  • Pages (App Router)                                 │  │
│  │  • Components (UI, Forms, Chat)                       │  │
│  │  • Contexts (Auth, Onboarding)                        │  │
│  │  • Client-side State Management                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 API Routes (Serverless)               │  │
│  │  • /api/auth/*       - Authentication                 │  │
│  │  • /api/chat/*       - Chat sessions & messages       │  │
│  │  • /api/user/*       - User profile management        │  │
│  │  • /api/relationships/* - Parent/Coach relationships  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Supabase Client
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase Backend                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ PostgreSQL │  │    Auth    │  │  Storage   │           │
│  │  Database  │  │   Service  │  │  Buckets   │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Row Level Security (RLS) Policies           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Application Flow

1. **User Access:** User visits chatnil.io
2. **Authentication:** Login/Signup via Supabase Auth
3. **Role Detection:** System identifies user role (athlete/parent/coach)
4. **Onboarding:** Role-specific onboarding flow (if not completed)
5. **Main Application:** Access to role-appropriate features
6. **Data Persistence:** All data stored in Supabase with RLS protection

---

## Database Schema

### Core Tables

#### 1. `users` (Main Profile Table)
Central user table storing all user types with role-specific fields.

**Primary Fields:**
- `id` (UUID, Primary Key) - Supabase Auth user ID
- `email` (TEXT, Unique, Required)
- `role` (ENUM: athlete/parent/coach, Required)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `onboarding_completed` (BOOLEAN)
- `onboarding_completed_at` (TIMESTAMP)

**Personal Information:**
- `first_name` (TEXT)
- `last_name` (TEXT)
- `date_of_birth` (DATE)
- `phone` (TEXT)
- `parent_email` (TEXT) - For athletes

**Academic/Athletic Information:**
- `school_name` (TEXT)
- `graduation_year` (INTEGER)
- `major` (TEXT)
- `gpa` (DECIMAL)
- `primary_sport` (TEXT)
- `position` (TEXT)
- `achievements` (TEXT[]) - Array of achievement strings
- `title` (TEXT) - For coaches
- `division` (TEXT) - NCAA division
- `team_name` (TEXT)

**NIL-Specific Fields:**
- `nil_interests` (TEXT[]) - Brand categories, opportunity types
- `nil_concerns` (TEXT[]) - Compliance issues, questions
- `social_media_handles` (JSONB) - Platform URLs/handles

**Relationship Fields:**
- `connected_athletes` (TEXT[]) - Array of athlete IDs (for parents)
- `managed_athletes` (TEXT[]) - Array of athlete IDs (for coaches)
- `relationship_type` (TEXT) - Parent relationship to athlete

**Settings:**
- `dashboard_access_level` (TEXT) - Permission level
- `notification_preferences` (JSONB)
- `compliance_settings` (JSONB) - Coach compliance preferences

**Indexes:**
- Primary key on `id`
- Unique constraint on `email`
- Index on `role` for filtering
- Index on `school_name` for searching

#### 2. `athlete_profiles` (Extended Athlete Data)
Additional athlete-specific information.

```typescript
{
  user_id: UUID (FK -> users.id),
  first_name: TEXT,
  last_name: TEXT,
  sport: TEXT,
  school: TEXT,
  graduation_year: INTEGER,
  position: TEXT,
  bio: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

#### 3. `parent_profiles` (Extended Parent Data)

```typescript
{
  user_id: UUID (FK -> users.id),
  first_name: TEXT,
  last_name: TEXT,
  relation_to_athlete: TEXT,
  phone: TEXT,
  athletes: TEXT[] (Array of athlete IDs),
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

#### 4. `coach_profiles` (Extended Coach Data)

```typescript
{
  user_id: UUID (FK -> users.id),
  first_name: TEXT,
  last_name: TEXT,
  school: TEXT,
  team: TEXT,
  sport: TEXT,
  years_experience: INTEGER,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

#### 5. `chat_sessions` (Chat Conversations)

```typescript
{
  id: UUID (Primary Key),
  user_id: UUID (FK -> users.id),
  title: TEXT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Indexes:**
- Primary key on `id`
- Index on `user_id` for user's sessions
- Index on `updated_at` for sorting

#### 6. `chat_messages` (Individual Messages)

```typescript
{
  id: UUID (Primary Key),
  session_id: UUID (FK -> chat_sessions.id),
  user_id: UUID (FK -> users.id),
  content: TEXT,
  role: ENUM (user/assistant),
  attachments: JSONB,
  created_at: TIMESTAMP
}
```

**Indexes:**
- Primary key on `id`
- Index on `session_id` for session messages
- Index on `created_at` for chronological order

#### 7. `chat_attachments` (File Attachments)

```typescript
{
  id: UUID (Primary Key),
  message_id: UUID (FK -> chat_messages.id),
  user_id: UUID (FK -> users.id),
  file_name: TEXT,
  file_size: INTEGER,
  file_type: TEXT,
  storage_path: TEXT (Supabase Storage path),
  created_at: TIMESTAMP
}
```

#### 8. `parent_athlete_relationships` (Parent-Athlete Connections)

```typescript
{
  parent_id: UUID (FK -> users.id),
  athlete_id: UUID (FK -> users.id),
  relationship_type: ENUM (mother/father/guardian/step_parent/other),
  permissions: JSONB {
    view_nil_activities: BOOLEAN,
    approve_contracts: BOOLEAN,
    receive_notifications: BOOLEAN,
    access_financial_info: BOOLEAN
  },
  verified: BOOLEAN,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Primary Key:** Composite (parent_id, athlete_id)

#### 9. `coach_athlete_relationships` (Coach-Athlete Connections)

```typescript
{
  coach_id: UUID (FK -> users.id),
  athlete_id: UUID (FK -> users.id),
  team_role: ENUM (starter/bench/redshirt/walk_on/injured_reserve),
  sport: TEXT,
  season: TEXT (e.g., "2024-2025"),
  permissions: JSONB {
    view_nil_activities: BOOLEAN,
    provide_guidance: BOOLEAN,
    receive_reports: BOOLEAN,
    manage_compliance: BOOLEAN
  },
  active: BOOLEAN,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Primary Key:** Composite (coach_id, athlete_id)

### Entity Relationship Diagram

```
┌─────────────────────┐
│       users         │
│  (Main Profile)     │
├─────────────────────┤
│ • id (PK)          │
│ • email            │
│ • role             │
│ • [35+ fields]     │
└─────────────────────┘
         │
         │ 1:1
         ├──────────────────────┬──────────────────────┐
         │                      │                      │
         ▼                      ▼                      ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│athlete_profiles  │   │ parent_profiles  │   │ coach_profiles   │
├──────────────────┤   ├──────────────────┤   ├──────────────────┤
│• user_id (FK)    │   │• user_id (FK)    │   │• user_id (FK)    │
│• sport           │   │• relation        │   │• school          │
│• school          │   │• athletes[]      │   │• team            │
└──────────────────┘   └──────────────────┘   └──────────────────┘

         │
         │ 1:N
         ▼
┌─────────────────────┐
│   chat_sessions     │
├─────────────────────┤
│ • id (PK)          │
│ • user_id (FK)     │
│ • title            │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│   chat_messages     │
├─────────────────────┤
│ • id (PK)          │
│ • session_id (FK)  │
│ • content          │
│ • role             │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│  chat_attachments   │
├─────────────────────┤
│ • id (PK)          │
│ • message_id (FK)  │
│ • storage_path     │
└─────────────────────┘

Relationships:

┌─────────────────────────────────────────────────┐
│    parent_athlete_relationships                 │
├─────────────────────────────────────────────────┤
│ • parent_id (FK -> users.id)                   │
│ • athlete_id (FK -> users.id)                  │
│ • relationship_type                            │
│ • permissions (JSONB)                          │
│ • verified                                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│    coach_athlete_relationships                  │
├─────────────────────────────────────────────────┤
│ • coach_id (FK -> users.id)                    │
│ • athlete_id (FK -> users.id)                  │
│ • team_role                                    │
│ • permissions (JSONB)                          │
│ • active                                       │
└─────────────────────────────────────────────────┘
```

---

## User Roles & Permissions

### Role Types

#### 1. **Athlete** (Student-Athletes)
**Target Users:** College athletes seeking NIL opportunities

**Capabilities:**
- Create personalized NIL strategy
- Track brand partnerships and contracts
- Access AI-powered NIL guidance
- Manage social media presence
- Connect with parents/guardians
- Grant coach oversight permissions
- Upload contracts for review
- Track NIL earnings (future feature)

**Onboarding Steps:** 4 steps
1. Personal Information (name, DOB, contact)
2. School Information (school, year, major, GPA)
3. Athletic Information (sport, position, achievements)
4. NIL Interests (brand categories, concerns, social media)

**Time to Complete:** 5-7 minutes

#### 2. **Parent/Guardian**
**Target Users:** Parents/guardians of college athletes

**Capabilities:**
- Connect to athlete accounts
- Monitor NIL activities
- Set approval requirements for contracts
- Receive notifications about NIL deals
- Access oversight dashboard
- Provide parental consent for minors
- Review contract details
- Communicate with coaching staff

**Onboarding Steps:** 3 steps
1. Parent Information (name, relationship, contact)
2. Connect with Athlete (link athlete account)
3. Oversight Preferences (dashboard access, notifications)

**Time to Complete:** 2-3 minutes

#### 3. **Coach**
**Target Users:** College coaches and athletic directors

**Capabilities:**
- Manage team roster
- Monitor team NIL compliance
- Set approval workflows
- Access compliance reporting
- Guide multiple athletes
- Track team NIL activities
- Educational resources access
- Bulk athlete management

**Onboarding Steps:** 4 steps
1. Coach Information (name, title, contact)
2. School & Team Information (school, sport, division)
3. Team Management (roster setup, athlete connections)
4. Compliance Settings (oversight rules, reporting)

**Time to Complete:** 3-5 minutes

### Permission Matrix

| Feature | Athlete | Parent | Coach |
|---------|---------|--------|-------|
| Create NIL Strategy | ✅ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ |
| Edit Own Profile | ✅ | ✅ | ✅ |
| View Athlete Profiles | ✅ (Own) | ✅ (Connected) | ✅ (Team) |
| Approve Contracts | ✅ | ✅* | ✅* |
| Chat with AI | ✅ | ✅ | ✅ |
| Upload Documents | ✅ | ✅ | ✅ |
| Manage Relationships | ✅ | ✅ | ✅ |
| Compliance Reporting | ❌ | ❌ | ✅ |
| Change Own Role | ✅ | ✅ | ✅ |

*\* Based on relationship permissions*

---

## Key Features

### 1. **Role-Based Onboarding**
- Dynamic multi-step forms based on user role
- Progress tracking with completion percentage
- Field-level validation with Zod schemas
- Auto-save to prevent data loss
- Ability to skip optional steps
- Resume from last saved point
- Role change triggers new onboarding

**Implementation:**
- Registry pattern: `/lib/onboarding-registry.ts`
- Context provider: `/contexts/OnboardingContext.tsx`
- Step components: `/components/onboarding/steps/*`
- Progress indicator with tooltips

### 2. **Profile Management**
- Comprehensive profile pages for each role
- Inline editing with section-based updates
- Profile completion metrics (0-100%)
- Missing field guidance with NIL importance
- Profile image upload to Supabase Storage
- Sport autocomplete with 100+ sports
- Position suggestions per sport
- Journey management (role switching)

**Profile Completion Features:**
- 15 tracked fields for athletes
- Visual progress bar
- Color-coded completion badges
- Priority field indicators (high/medium)
- NIL impact explanations per field

### 3. **Authentication System**
- Email/password authentication via Supabase
- Magic link support (future)
- OAuth providers (Google, future)
- Protected routes with AuthGuard
- Session management
- Password reset flow
- Email verification

**Security Features:**
- Row Level Security (RLS) policies
- Service role for admin operations
- JWT-based authentication
- Secure API routes with auth validation
- HTTPS enforcement

### 4. **Chat System** (In Development)
- AI-powered NIL guidance
- Role-specific conversation context
- Session-based chat history
- File attachment support
- Message persistence
- Real-time updates (future)

**Planned Features:**
- Claude AI integration
- Contract analysis
- Document Q&A
- NIL strategy generation
- Compliance checking

### 5. **Relationship Management**
- Parent-athlete connections
- Coach-athlete connections
- Permission-based access control
- Verification system
- Bulk athlete management for coaches
- Notification preferences

### 6. **Document Management** (Future)
- Contract uploads
- AI contract review
- Document storage in Supabase
- Version history
- Signature collection
- PDF generation

---

## Frontend Components

### Layout Components

#### 1. **AppShell** (`/components/Chat/AppShell.tsx`)
Main layout wrapper with sidebar navigation.

**Features:**
- Collapsible sidebar
- Responsive mobile menu
- Persistent across routes
- Page-specific overflow handling
- Full viewport height layout

#### 2. **Sidebar** (`/components/Sidebar.tsx`)
Primary navigation component.

**Navigation Items:**
- 💬 Chat (main feature)
- 📊 Dashboard (analytics)
- 🎯 Opportunities (NIL deals)
- 📚 Library (resources)
- 💬 Messages (future: DMs)
- ⚙️ Settings
- 🚪 Logout

**Features:**
- Active route highlighting
- User avatar display
- Role badge
- Collapse/expand toggle
- Mobile-responsive

#### 3. **Header** (`/components/Header.tsx`)
Top navigation bar with branding.

**Components:**
- Logo/branding
- Page titles
- User menu (future)
- Notifications (future)

### Form Components

#### 1. **OnboardingRouter** (`/components/onboarding/OnboardingRouter.tsx`)
Controls onboarding flow based on role and progress.

**Logic:**
- Detects onboarding completion
- Routes to correct step
- Handles role parameter from URL
- Shows role selection when needed

#### 2. **ProgressIndicator** (`/components/onboarding/ProgressIndicator.tsx`)
Visual progress tracking during onboarding.

**Features:**
- Step-by-step visualization
- Percentage complete
- Current step highlighting
- Completed step checkmarks
- Desktop vs mobile layouts
- Hover tooltips with full step details

#### 3. **OnboardingSteps** (`/components/onboarding/steps/*`)
Individual step components for each onboarding stage.

**Athlete Steps:**
- `AthletePersonalInfoStep.tsx` - Basic info
- `AthleteSchoolInfoStep.tsx` - Academic details
- `AthleteSportsInfoStep.tsx` - Athletic info
- `AthleteNILInfoStep.tsx` - NIL preferences

**Parent Steps:**
- `ParentInfoStep.tsx` - Parent details
- `ChildConnectionStep.tsx` - Athlete linking
- `ParentPreferencesStep.tsx` - Oversight settings

**Coach Steps:**
- `CoachInfoStep.tsx` - Coach details
- `CoachAffiliationStep.tsx` - School/team info
- `AthleteManagementStep.tsx` - Roster setup
- `ComplianceSettingsStep.tsx` - Compliance rules

### Utility Components

#### 1. **SportAutocomplete** (`/components/SportAutocomplete.tsx`)
Intelligent sport and position selector.

**Features:**
- 100+ sports database
- Fuzzy search matching
- Position suggestions per sport
- Keyboard navigation
- Popular sports quick selection

**Sports Data:**
- Football, Basketball, Baseball, etc.
- Olympic sports
- Individual sports
- Position mappings

#### 2. **ProfileImageUpload** (`/components/ProfileImageUpload.tsx`)
Profile picture management with Supabase Storage.

**Features:**
- Drag & drop upload
- Image preview
- File size validation (< 5MB)
- Format validation (jpg, png, webp)
- Automatic compression
- Avatar fallback with initials

#### 3. **Tooltip** (`/components/ui/Tooltip.tsx`)
Reusable tooltip component.

**Features:**
- Top/bottom positioning
- Hover delay (200ms)
- Smooth fade-in/out
- Dark theme styling
- Arrow indicator
- Responsive positioning

#### 4. **AuthGuard** (`/components/AuthGuard.tsx`)
Route protection wrapper.

**Features:**
- Checks authentication status
- Redirects to login if needed
- Loading states
- Session validation
- Automatic retry on error

---

## Backend API Routes

### Authentication APIs (`/app/api/auth/*`)

#### 1. **Create Profile** - `POST /api/auth/create-profile`
Creates initial user profile after signup.

**Request:**
```typescript
{
  userId: string;
  email: string;
  role: 'athlete' | 'parent' | 'coach';
  firstName: string;
  lastName: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user: UserProfile;
}
```

**Features:**
- Uses service role to bypass RLS
- Creates base user record
- Sets initial timestamps
- Returns full profile

#### 2. **Get Profile** - `GET /api/auth/get-profile?userId=xxx`
Fetches complete user profile with admin privileges.

**Query Parameters:**
- `userId` (required): User's UUID

**Response:**
```typescript
{
  success: boolean;
  user: FullUserProfile;
}
```

**Features:**
- Service role access
- Fetches all profile fields
- Used by AuthContext
- Bypasses RLS for reliability

#### 3. **Complete Onboarding** - `POST /api/auth/complete-onboarding`
Marks onboarding as complete after all steps finished.

**Request:**
```typescript
{
  userId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: UserProfile;
}
```

**Updates:**
- Sets `onboarding_completed = true`
- Records `onboarding_completed_at` timestamp
- Updates `updated_at`

#### 4. **Save Partial Progress** - `POST /api/auth/save-partial-progress`
Saves onboarding data during intermediate steps.

**Request:**
```typescript
{
  userId: string;
  stepId: string;
  data: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  user: UserProfile;
}
```

**Features:**
- Incremental save
- Merges with existing data
- Validates with Zod
- No onboarding completion

### User Management APIs (`/app/api/user/*`)

#### 1. **Update Profile** - `POST /api/user/update-profile`
Updates user profile fields (recently added to fix RLS permission issues).

**Request:**
```typescript
{
  userId: string;
  updates: {
    first_name?: string;
    school_name?: string;
    primary_sport?: string;
    // ... any user fields
  };
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: UserProfile;
}
```

**Features:**
- Uses service role (bypasses RLS)
- Validates user existence
- Updates timestamp automatically
- Comprehensive error handling

#### 2. **Change Role** - `POST /api/user/change-role`
Changes user's role and resets profile data.

**Request:**
```typescript
{
  userId: string;
  newRole: 'athlete' | 'parent' | 'coach';
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user: UserProfile;
}
```

**Actions:**
- Validates new role
- Clears role-specific fields
- Resets onboarding status
- Logs audit trail
- Returns updated profile

**Cleared Fields:**
- Academic info (school, major, GPA, etc.)
- Athletic info (sport, position, achievements)
- NIL data (interests, concerns, social media)
- Contact info (phone, parent email, etc.)

### Chat APIs (`/app/api/chat/*`)

#### 1. **Get Sessions** - `GET /api/chat/sessions`
Lists all chat sessions for a user.

**Query Parameters:**
- `userId` (required)

**Response:**
```typescript
{
  sessions: ChatSession[];
}
```

#### 2. **Create Session** - `POST /api/chat/sessions`
Creates a new chat session.

**Request:**
```typescript
{
  userId: string;
  title: string;
}
```

**Response:**
```typescript
{
  session: ChatSession;
}
```

#### 3. **Get Messages** - `GET /api/chat/sessions/[id]`
Fetches all messages in a session.

**Response:**
```typescript
{
  messages: ChatMessage[];
}
```

#### 4. **Send Message** - `POST /api/chat/sessions/[id]`
Adds a message to a session.

**Request:**
```typescript
{
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  attachments?: AttachmentData[];
}
```

### Relationship APIs (`/app/api/relationships/*`)

*To be implemented*

**Planned Endpoints:**
- `POST /api/relationships/parent-athlete` - Link parent to athlete
- `POST /api/relationships/coach-athlete` - Link coach to athlete
- `GET /api/relationships/verify` - Verify relationship request
- `DELETE /api/relationships/remove` - Remove relationship

---

## Authentication & Security

### Supabase Authentication

**Auth Providers:**
- Email/Password (primary)
- Magic Links (future)
- Google OAuth (future)
- Apple OAuth (future)

**Auth Flow:**
1. User submits credentials
2. Supabase Auth validates
3. JWT token issued
4. Profile created/fetched
5. Session stored in cookies
6. Client redirected to app

### Row Level Security (RLS)

**Policy Structure:**
```sql
-- Users can read their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role has full access
CREATE POLICY "service_role_all_access" ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

**RLS Tables:**
- `users` - Own record only
- `athlete_profiles` - Own profile or connected parent/coach
- `parent_profiles` - Own profile only
- `coach_profiles` - Own profile only
- `chat_sessions` - Own sessions only
- `chat_messages` - Own session messages only
- `parent_athlete_relationships` - Own relationships only
- `coach_athlete_relationships` - Own relationships only

### Service Role Usage

**When to Use Service Role:**
- Profile creation (bypass user auth check)
- Admin operations (update any user)
- Relationship verification
- Bulk operations
- API routes requiring elevated permissions

**Implementation:**
```typescript
import { supabaseAdmin } from '@/lib/supabase';

// Service role bypasses RLS
const { data, error } = await supabaseAdmin
  .from('users')
  .update({ role: newRole })
  .eq('id', userId);
```

### Security Best Practices

1. **Always validate user authentication** before database operations
2. **Use service role** for admin operations, not client operations
3. **Validate all input** with Zod schemas
4. **Never expose** service role key to client
5. **Log all sensitive operations** (role changes, relationship creation)
6. **Implement rate limiting** (future)
7. **Use HTTPS** everywhere
8. **Sanitize user input** before storage
9. **Implement CSRF protection** (Next.js built-in)
10. **Audit trail** for critical operations

---

## Onboarding System

### Architecture

**Registry Pattern:**
The onboarding system uses a registry pattern to manage role-specific flows.

```typescript
// /lib/onboarding-registry.ts
export const onboardingRegistry: Record<UserRole, OnboardingStep[]> = {
  athlete: athleteSteps,
  parent: parentSteps,
  coach: coachSteps,
};
```

**Context Provider:**
```typescript
// /contexts/OnboardingContext.tsx
interface OnboardingState {
  role: UserRole | null;
  hasStarted: boolean;
  currentStepIndex: number;
  completedSteps: string[];
  formData: Record<string, any>;
  profileCompletionPercentage: number;
}
```

### State Management

**Local Storage:**
- State: `chatnil-onboarding-state-v1`
- Form Data: `chatnil-onboarding-data-v1`
- Backup Data: `chatnil-onboarding-backup-data-v1`

**State Persistence:**
1. User completes step
2. Data validated with Zod
3. Saved to localStorage (immediate)
4. Saved to database (API call)
5. Progress updated
6. Next step rendered

**Resume Capability:**
- Loads last saved state from localStorage
- Falls back to database if localStorage empty
- Shows progress percentage
- Allows continuation from any step

### Validation System

**Zod Schemas:**
```typescript
// Example: Athlete Personal Info
export const athletePersonalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  parentEmail: z.string().email().optional(),
});
```

**Validation Flow:**
1. User fills form fields
2. React Hook Form validates on change
3. Submit button disabled if invalid
4. On submit, Zod schema validates
5. If valid, data saved
6. If invalid, errors displayed inline

### Progress Calculation

**Field-Based Progress:**
```typescript
// Calculates % based on filled required fields
export function calculateProfileCompletionPercentage(
  role: UserRole,
  formData: Record<string, any>
): number {
  const requiredFields = getRequiredFieldsForRole(role);
  const filledFields = requiredFields.filter(field =>
    formData[field] && formData[field] !== ''
  );
  return (filledFields.length / requiredFields.length) * 100;
}
```

**Step-Based Progress:**
```typescript
// Calculates % based on completed steps
export function calculateProgress(
  role: UserRole,
  currentStepIndex: number
): number {
  const totalSteps = getTotalSteps(role);
  return Math.round(((currentStepIndex + 1) / totalSteps) * 100);
}
```

### UI Components

**Progress Indicator:**
- Visual step tracker
- Numbered circles for each step
- Animated progress bar
- Completion percentage
- Estimated time remaining
- Mobile-responsive layout
- Tooltips with full step details

**Step Components:**
- Consistent layout structure
- Inline field validation
- Help text with NIL importance
- Auto-save on field blur
- Back/Continue navigation
- Skip optional steps button

---

## Chat System

### Current Implementation

**Status:** Chat UI complete, AI integration pending

**Components:**
- Chat interface with message list
- Message input with file upload
- Session management (create, list, select)
- Message persistence to database

### Planned AI Integration

**Provider:** Anthropic Claude API

**Implementation Plan:**
```typescript
// /lib/ai/claude-client.ts
import Anthropic from '@anthropic-ai/sdk';

export async function sendMessage(
  messages: Message[],
  context: UserContext
): Promise<string> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const systemPrompt = buildSystemPrompt(context);

  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages
  });

  return response.content[0].text;
}
```

**Context Building:**
```typescript
function buildSystemPrompt(user: User): string {
  const rolePrompts = {
    athlete: `You are an AI NIL advisor for a college athlete...`,
    parent: `You are an AI NIL advisor helping parents...`,
    coach: `You are an AI compliance advisor for coaches...`
  };

  return `
    ${rolePrompts[user.role]}

    User Profile:
    - Name: ${user.firstName} ${user.lastName}
    - School: ${user.school}
    - Sport: ${user.sport}
    - NIL Interests: ${user.nilInterests.join(', ')}

    Provide personalized, actionable NIL guidance.
  `;
}
```

### Features (Planned)

**Conversational AI:**
- Role-aware responses
- Profile-based personalization
- Multi-turn conversations
- Context retention across sessions

**Document Analysis:**
- Contract upload and review
- Risk identification
- Clause explanation
- Compliance checking

**Strategy Generation:**
- Personalized NIL strategy plans
- Brand partnership recommendations
- Social media optimization advice
- Compliance guidance

**Learning Resources:**
- NIL rule explanations
- Case study analysis
- Best practice recommendations
- Regulatory updates

---

## Data Flow

### User Registration Flow

```
1. User visits /signup
   │
2. Enters email + password + selects role
   │
3. Supabase Auth creates auth user
   │
4. POST /api/auth/create-profile
   │   - Creates users table record
   │   - Links to auth.users via ID
   │
5. Redirect to /onboarding
   │
6. Role-based onboarding flow begins
   │
7. Each step:
   │   - User fills form
   │   - Validates with Zod
   │   - POST /api/auth/save-partial-progress
   │   - Saves to localStorage
   │   - Progress updated
   │
8. Final step completion:
   │   - POST /api/auth/complete-onboarding
   │   - Sets onboarding_completed = true
   │
9. Redirect to /chat (main app)
```

### Chat Message Flow (Future)

```
1. User types message in chat input
   │
2. POST /api/chat/sessions/[id]
   │   - Saves user message to database
   │   - Returns message ID
   │
3. Call Claude API
   │   - Send conversation history
   │   - Include user context
   │   - Receive AI response
   │
4. POST /api/chat/sessions/[id]
   │   - Save assistant message to database
   │
5. Display message in UI
   │
6. Update session updated_at timestamp
```

### Profile Update Flow

```
1. User edits profile section
   │
2. Clicks "Save" button
   │
3. POST /api/user/update-profile
   │   - Validates userId matches auth
   │   - Uses service role to update
   │   - Bypasses RLS policies
   │   - Updates timestamp
   │
4. Response returns updated profile
   │
5. Local state updated
   │
6. UI reflects changes
   │
7. Success message shown
```

### Role Change Flow

```
1. User clicks "Change Role" in Settings
   │
2. Selects new role in modal
   │
3. Confirms warning about data reset
   │
4. POST /api/user/change-role
   │   - Validates new role
   │   - Clears role-specific data
   │   - Resets onboarding_completed
   │   - Logs audit entry
   │
5. Clear localStorage cache
   │   - Remove onboarding state
   │   - Remove form data
   │
6. Call refreshUserProfile()
   │   - Fetch updated profile
   │   - Update AuthContext
   │
7. Redirect to /onboarding?role=newRole
   │
8. Auto-start onboarding with new role
   │
9. User completes onboarding for new role
```

---

## Deployment & Infrastructure

### Current Status
- **Environment:** Development
- **Hosting:** Local (npm run dev)
- **Database:** Supabase Cloud (Production instance)
- **Storage:** Supabase Storage (Production)

### Production Deployment (Recommended)

**Platform:** Vercel (recommended for Next.js)

**Setup Steps:**
1. Push code to GitHub
2. Connect Vercel to repository
3. Configure environment variables
4. Deploy with zero configuration
5. Automatic preview deployments for PRs

**Environment Variables:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Anthropic (future)
ANTHROPIC_API_KEY=xxx

# App Config
NEXT_PUBLIC_APP_URL=https://chatnil.io
NODE_ENV=production
```

### Database Configuration

**Supabase Project:**
- **URL:** https://enbuwffusjhpcyoveewb.supabase.co
- **Region:** US East (recommended for latency)
- **Plan:** Free tier (can scale to Pro)

**Migrations:**
Located in `/supabase/migrations/`
- `001_initial_schema.sql` - Core tables
- `simplified_rls_policies.sql` - Security policies
- `complete_schema_setup.sql` - Full setup

**Backup Strategy:**
- Supabase automatic backups (7 days on free tier)
- Point-in-time recovery (Pro tier)
- Manual exports via Supabase dashboard

### Performance Optimization

**Current Optimizations:**
- Next.js automatic code splitting
- Image optimization with Next.js Image
- React Server Components (where applicable)
- Client-side caching with React Query (future)

**Recommended Additions:**
- CDN for static assets (Vercel automatic)
- Database connection pooling (Supabase Supavisor)
- Redis for session caching (future)
- Image CDN (Supabase Storage has CDN)
- API route caching (Next.js headers)

### Monitoring & Analytics

**To Implement:**
- Vercel Analytics (deployment metrics)
- Supabase Dashboard (database metrics)
- Sentry (error tracking)
- PostHog (product analytics)
- LogRocket (session replay)

**Key Metrics to Track:**
- User signups by role
- Onboarding completion rate
- Average time to complete onboarding
- Chat session frequency
- Profile completion rates
- Page load times
- API response times
- Error rates

---

## Future Enhancements

### Short-Term (Next 3 Months)

1. **Claude AI Integration**
   - Complete chat functionality
   - Role-specific system prompts
   - Document analysis capability
   - Contract review features

2. **Real-Time Features**
   - WebSocket connections
   - Live chat updates
   - Notification system
   - Online presence indicators

3. **Enhanced Relationships**
   - Verification workflow for parent-athlete connections
   - Bulk athlete import for coaches
   - Permission management UI
   - Relationship dashboard

4. **Document Management**
   - Contract upload system
   - AI-powered contract analysis
   - Version history
   - Digital signatures

### Medium-Term (3-6 Months)

1. **NIL Deal Tracking**
   - Deal database
   - Revenue tracking
   - Tax reporting helpers
   - Compliance alerts

2. **Marketplace**
   - Brand partnership opportunities
   - Deal matching algorithm
   - Proposal system
   - Negotiation platform

3. **Analytics Dashboard**
   - Profile insights
   - NIL activity metrics
   - Earning projections
   - Compliance scoring

4. **Mobile App**
   - React Native application
   - Push notifications
   - Offline support
   - Camera integration for document scanning

### Long-Term (6-12 Months)

1. **Enterprise Features**
   - School-wide deployments
   - Athletic department dashboards
   - Compliance officer tools
   - Bulk reporting

2. **Advanced AI Features**
   - Predictive deal matching
   - Market value estimation
   - Negotiation coaching
   - Social media content generation

3. **Integrations**
   - Social media platforms (Instagram, TikTok, Twitter)
   - Accounting software (QuickBooks)
   - CRM systems (HubSpot)
   - E-signature platforms (DocuSign)

4. **Community Features**
   - Athlete networking
   - Mentor matching
   - Discussion forums
   - Success story sharing

---

## Team Onboarding Guide

### For Developers

**Getting Started:**
1. Clone repository
2. Install dependencies: `npm install`
3. Set up `.env.local` with Supabase credentials
4. Run development server: `npm run dev`
5. Access app at `http://localhost:3000`

**Code Structure:**
- `/app` - Next.js pages and API routes
- `/components` - React components
- `/contexts` - React Context providers
- `/lib` - Utilities, types, helpers
- `/public` - Static assets
- `/supabase` - Database migrations

**Key Files to Understand:**
- `lib/types.ts` - TypeScript type definitions
- `lib/onboarding-registry.ts` - Onboarding flow configuration
- `contexts/AuthContext.tsx` - Authentication state
- `lib/supabase.ts` - Database client setup

### For Product Managers

**Understanding User Flows:**
1. **Athlete Journey:** Signup → Onboarding (4 steps) → Profile Setup → AI Chat
2. **Parent Journey:** Signup → Onboarding (3 steps) → Connect Athlete → Oversight Dashboard
3. **Coach Journey:** Signup → Onboarding (4 steps) → Team Setup → Compliance Management

**Key Metrics to Track:**
- Onboarding completion rate by role
- Time to complete onboarding
- Profile completion percentage
- Chat engagement (future)
- Feature adoption rates

**User Feedback Channels:**
- In-app feedback form (future)
- Support email: support@chatnil.io
- User interviews
- Analytics data

### For Designers

**Design System:**
- **Colors:** Orange (#F97316), Blue (#3B82F6), Green (#10B981), Purple (#8B5CF6)
- **Fonts:** System fonts (San Francisco, Segoe UI, Roboto)
- **Components:** Tailwind CSS utility classes
- **Icons:** Lucide React icon library
- **Spacing:** Tailwind spacing scale (0.25rem units)

**Design Files:**
Located in Figma (link to be added)

**Responsive Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Key UI Patterns:**
- Card-based layouts
- Gradient backgrounds
- Rounded corners (xl, 2xl radii)
- Shadow layering for depth
- Progress indicators
- Inline form validation

---

## Frontier Capabilities (AI Features)

### Current AI Integration Status
**Status:** Architecture ready, Claude API integration pending

### Planned Claude AI Capabilities

#### 1. **Conversational NIL Guidance**
**Model:** Claude 3.5 Sonnet
**Context Window:** 200K tokens (handles long contracts and conversations)

**Capabilities:**
- Natural language Q&A about NIL rules
- Personalized strategy recommendations
- Multi-turn conversation with context retention
- Role-specific advice (athlete vs parent vs coach perspectives)

**Example Prompts:**
- "What types of NIL deals can I pursue as a Division 1 basketball player?"
- "Review this contract and tell me if there are any red flags"
- "How should I negotiate a higher rate for this brand partnership?"
- "What NIL opportunities align with my social media presence?"

#### 2. **Document Analysis**
**Feature:** Upload contracts, review terms, identify risks

**Claude Capabilities:**
- Extract key terms and conditions
- Identify unusual or unfavorable clauses
- Compare against standard NIL contracts
- Flag compliance issues
- Explain legal jargon in plain English
- Generate summary reports

**Example Use Case:**
```
User uploads contract PDF
↓
Claude extracts text via vision
↓
Analyzes contract terms
↓
Returns:
- Summary of key terms
- Payment structure analysis
- Rights granted/retained
- Compliance concerns
- Negotiation recommendations
```

#### 3. **Strategy Generation**
**Feature:** AI-generated NIL strategy plans

**Claude Capabilities:**
- Analyze athlete profile (sport, school, social media, interests)
- Identify optimal NIL categories
- Recommend brand partnerships
- Suggest content strategies
- Create action plans with timelines
- Provide market insights

**Example Output:**
```markdown
# Your Personalized NIL Strategy

## Profile Analysis
- Sport: Basketball (high visibility)
- School: Division 1 (large market)
- Social Media: 10K Instagram followers
- Strengths: Strong local following, authentic personality

## Recommended Focus Areas
1. **Local Business Partnerships** (Priority: High)
   - Campus area restaurants/cafes
   - Local sports equipment stores
   - Regional brands

2. **Social Media Sponsorships** (Priority: Medium)
   - Sports nutrition brands
   - Athletic apparel
   - Training equipment

3. **Appearance Deals** (Priority: Medium)
   - Youth camps
   - Community events
   - School fundraisers

## 3-Month Action Plan
Week 1-2: Build media kit...
Week 3-4: Reach out to local businesses...
[etc.]
```

#### 4. **Compliance Checking**
**Feature:** Real-time compliance validation

**Claude Capabilities:**
- Check deals against NCAA/conference rules
- State law compliance verification
- School policy adherence checking
- Warning system for policy violations
- Approval workflow recommendations

**Example Checks:**
- "Can I do this deal as a freshman?"
- "Does this violate my school's NIL policy?"
- "Is this type of endorsement allowed in my state?"
- "Do I need approval from my athletic director?"

#### 5. **Social Media Optimization**
**Feature:** Content strategy and optimization advice

**Claude Capabilities:**
- Analyze current social media presence
- Recommend content types and cadence
- Suggest hashtags and captions
- Identify best posting times
- Growth strategy recommendations
- Brand voice development

**Example Advice:**
```
Based on your profile, I recommend:

1. Post frequency: 3-4x/week on Instagram
2. Content mix:
   - 40% game day content
   - 30% training/behind-the-scenes
   - 20% personal life/interests
   - 10% NIL partnerships

3. Engagement tactics:
   - Respond to comments within 1 hour
   - Use stories for daily updates
   - Go live after big games

4. Hashtag strategy:
   - Always include: #NIL #StudentAthlete #[YourSchool]
   - Sport-specific: #BasketballLife #Hoops
   - Branded: [When doing sponsored content]
```

#### 6. **Market Intelligence**
**Feature:** Data-driven insights on NIL market

**Claude Capabilities:**
- Analyze deal structures by sport/school
- Provide market rate guidance
- Identify trending brand categories
- Compare opportunities across peers
- Forecast earning potential

**Example Insights:**
- "Athletes in your sport/division typically earn $X-Y per post"
- "Local restaurant partnerships are trending for [your school]"
- "Your social media metrics suggest $X baseline rate"

### Technical Implementation Plan

#### Phase 1: Basic Chat (Week 1-2)
```typescript
// Simple message/response flow
POST /api/chat/send
  ↓
Call Claude API with system prompt
  ↓
Return response
  ↓
Save to database
```

#### Phase 2: Context & Memory (Week 3-4)
```typescript
// Add conversation history and user context
Build system prompt with:
- User profile data
- Role-specific instructions
- Previous conversation summary
  ↓
Send full context to Claude
  ↓
Store message in session
```

#### Phase 3: Document Processing (Week 5-6)
```typescript
// Add file upload and analysis
Upload PDF/image to Supabase Storage
  ↓
Send file to Claude with vision
  ↓
Extract and analyze text
  ↓
Return structured analysis
  ↓
Save analysis to database
```

#### Phase 4: Advanced Features (Week 7-8)
```typescript
// Add strategy generation, compliance checking
Create specialized prompts for:
- Strategy generation
- Compliance review
- Market analysis
  ↓
Implement caching for repeated queries
  ↓
Add streaming responses for better UX
```

### System Prompt Examples

**Athlete Prompt:**
```
You are an expert NIL advisor for college athletes. Your role is to:

1. Provide accurate, up-to-date guidance on NIL rules and regulations
2. Help athletes identify and evaluate NIL opportunities
3. Review contracts and agreements for fairness and compliance
4. Develop personalized NIL strategies based on athlete profiles
5. Advise on social media optimization and personal branding

Key principles:
- Always prioritize compliance with NCAA, conference, and state rules
- Focus on opportunities that align with the athlete's values and brand
- Explain complex topics in simple, actionable language
- Encourage ethical and transparent NIL practices
- Protect athlete eligibility above all else

Athlete Profile:
Name: {{firstName}} {{lastName}}
School: {{school}}
Sport: {{sport}}
Year: {{graduationYear}}
NIL Interests: {{nilInterests}}
Concerns: {{nilConcerns}}

Respond conversationally, providing specific, personalized advice.
```

**Parent Prompt:**
```
You are an NIL advisor helping parents understand and support their student-athlete's NIL journey. Your role is to:

1. Explain NIL rules and opportunities in parent-friendly language
2. Address common parent concerns (safety, academics, eligibility)
3. Guide on appropriate oversight and support levels
4. Help evaluate opportunities and contracts
5. Explain financial and legal implications

Key principles:
- Balance guidance with athlete independence
- Focus on education and protection
- Emphasize long-term athlete development
- Address financial responsibility and planning
- Promote open parent-athlete communication

Connected Athlete:
{{athleteName}} - {{sport}} at {{school}}

Respond with empathy and understanding of parental concerns.
```

**Coach Prompt:**
```
You are an NIL compliance and management advisor for college coaches. Your role is to:

1. Ensure team-wide NIL compliance
2. Provide guidance on managing athlete NIL activities
3. Advise on institutional policies and procedures
4. Help balance NIL with team cohesion and performance
5. Support educational efforts for athletes

Key principles:
- Always prioritize NCAA and institutional compliance
- Maintain fairness and equity among team members
- Protect team culture and performance
- Support athletes while managing boundaries
- Document and report as required

Coach Profile:
Name: {{firstName}} {{lastName}}
School: {{school}}
Sport: {{sport}}
Team: {{teamName}}

Respond with an emphasis on compliance, fairness, and team management.
```

### AI Safety & Content Policies

**Implemented Safeguards:**
1. **Compliance First:** AI always prioritizes rule compliance
2. **Verification Required:** Important decisions require human verification
3. **Disclosure:** AI-generated content is clearly labeled
4. **No Financial Advice:** AI provides information, not financial advice
5. **No Legal Advice:** AI suggests consulting lawyers for legal matters
6. **Privacy Protection:** Sensitive data not shared with AI
7. **Audit Trail:** All AI interactions logged for review

**Content Filtering:**
- Block inappropriate content requests
- Detect potential scams or fraud
- Flag suspicious contract terms
- Alert on unrealistic earnings claims
- Identify predatory brand partnerships

---

## Conclusion

ChatNIL.io represents a comprehensive, AI-powered solution for navigating the complex NIL landscape. The system is built on modern, scalable technologies with a strong foundation in security, user experience, and role-based functionality.

**Current Strengths:**
- ✅ Robust authentication and authorization
- ✅ Role-based onboarding with excellent UX
- ✅ Comprehensive profile management
- ✅ Flexible relationship system (parent/coach connections)
- ✅ Scalable database architecture
- ✅ Clean, maintainable codebase
- ✅ Mobile-responsive design
- ✅ Production-ready infrastructure

**Near-Term Priorities:**
1. Complete Claude AI integration for chat
2. Implement document analysis features
3. Build relationship verification workflows
4. Add real-time notifications
5. Enhance analytics and insights

**Contact Information:**
- **Support:** support@chatnil.io
- **Technical Questions:** [Team contact]
- **Feedback:** [Feedback form URL]

---

*This document is maintained by the development team and updated as the system evolves. Last updated: September 29, 2025*