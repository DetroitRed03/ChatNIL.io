# ChatNIL - NIL Guidance Platform

A modern web application providing specialized guidance for Name, Image, and Likeness (NIL) compliance, built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## ✨ Features

- **🔐 Role-Based Authentication** - Support for Athletes, Parents/Guardians, and Coaches
- **💬 Intelligent Chat Interface** - ChatGPT-style conversation with NIL-specific suggestions
- **📁 File Upload Support** - Upload NIL contracts, documents, and images for review
- **🎙️ Voice Input** - Web Speech Recognition for convenient voice-to-text
- **📱 Fully Responsive** - Beautiful UI that works on desktop and mobile
- **⚡ Real-time Typing Animation** - Engaging conversation experience
- **🔒 Secure Database** - Row Level Security with Supabase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account and project

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ChatNIL.io
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings** > **API** and copy your project URL and anon key
3. Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Apply the database migrations in your Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Execute these files in order:
   - `migrations/01_initial_schema.sql`
   - `migrations/02_row_level_security.sql`
   - `migrations/03_helper_functions.sql`

See `migrations/README.md` for detailed instructions.

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **UI Components**: Lucide React icons, Custom components
- **Features**: File upload, Voice recognition, Real-time chat

### Database Schema

```sql
-- User roles and profiles
users (id, email, role, created_at, updated_at)
athlete_profiles (user_id, first_name, last_name, sport, school, ...)
parent_profiles (user_id, first_name, last_name, relation_to_athlete, ...)
coach_profiles (user_id, first_name, last_name, school, team, sport, ...)

-- Chat system
chat_sessions (id, user_id, title, created_at, updated_at)
chat_messages (id, session_id, user_id, content, role, attachments, ...)
chat_attachments (id, message_id, user_id, file_name, file_size, ...)
```

### Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with auth provider
│   └── page.tsx           # Main chat page
├── components/            # React components
│   ├── AuthModal.tsx      # Login/signup modal with role selection
│   ├── ChatArea.tsx       # Main chat interface
│   └── Header.tsx         # Navigation header
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state management
├── lib/                   # Utility libraries
│   ├── supabase.ts       # Supabase client configuration
│   ├── supabase-client.ts # Browser client helper
│   └── types.ts          # TypeScript type definitions
├── migrations/            # Database migration files
└── public/               # Static assets
```

## 🔧 Configuration

### Authentication Roles

The application supports three user roles:

1. **Student-Athlete**: High school or college athletes seeking NIL guidance
2. **Parent/Guardian**: Parents or guardians of student-athletes
3. **Coach/Educator**: Coaches, advisors, or athletic department staff

### NIL-Specific Features

- Curated NIL compliance suggestions
- Contract review capabilities
- File upload for NIL documents
- Role-based guidance and recommendations

### File Upload Support

Supported file types:
- **Documents**: PDF, Word (.doc, .docx), Text files
- **Images**: JPEG, PNG, GIF, WebP
- **Size limit**: 50MB per file

## 🔒 Security

### Row Level Security (RLS)

All database tables have RLS enabled with policies ensuring:
- Users can only access their own data
- Profile information is private
- Chat messages are restricted to the owner
- File attachments are secured per user

### Authentication

- Secure email/password authentication via Supabase
- Session management with automatic token refresh
- Protected routes with role-based access control

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Digital Ocean App Platform
- AWS Amplify

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing Authentication

1. Start the development server
2. Click "Sign up" in the header
3. Select your role (athlete, parent, or coach)
4. Complete the signup process
5. Test login/logout functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the `migrations/README.md` for database setup help
2. Review the Supabase documentation for authentication issues
3. Open an issue on GitHub for bugs or feature requests

---

**Built with ❤️ for student-athletes, parents, and coaches navigating the NIL landscape.**