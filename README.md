# 🎯 Dutient HRMS - AI-Powered Applicant Tracking System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)

**A production-grade Applicant Tracking System built for modern recruitment workflows**

[Features](#-key-features) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [Documentation](#-documentation)

</div>

---

## 📖 Overview

Dutient HRMS is a comprehensive Applicant Tracking System designed to streamline the entire recruitment lifecycle—from resume parsing to candidate analytics. Built with Next.js 16 and powered by Google Gemini AI, it automates tedious hiring tasks while providing actionable insights through advanced analytics.

### 🎯 Built For

- **HR Teams** managing high-volume recruitment (1,500+ resumes)
- **Recruiters** seeking AI-powered candidate matching and ranking
- **Hiring Managers** coordinating interviews and tracking feedback
- **Executives** requiring data-driven hiring analytics

---

## ✨ Key Features

### 🤖 AI-Powered Intelligence

| Feature | Description | Technology |
|---------|-------------|------------|
| **Smart Resume Parsing** | Extracts structured data from PDF/DOCX/TXT resumes | Google Gemini AI |
| **Intelligent Ranking** | Ranks candidates based on job requirements and qualifications | Gemini AI + Custom Algorithm |
| **Semantic Search** | Natural language search across candidate profiles | AI-powered matching |

### 📊 Recruitment Management

- **Candidate Pipeline** - Track candidates through Applied → Interview → Selected/Rejected stages
- **Talent Pool** - Curated collection of high-potential candidates
- **Bulk Upload** - Process multiple resumes simultaneously with AI extraction
- **Interview Scheduling** - Schedule, track, and manage candidate interviews
- **Feedback System** - Structured interview feedback with star ratings and notes

### 📈 Analytics & Insights

- **Key Metrics Dashboard** - Total candidates, active interviews, hired count, rejection rates
- **Source Performance** - Track applicant sources and hiring conversion rates
- **Role Pipeline Analytics** - Visualize candidate distribution across roles and stages
- **Email Template Management** - Customizable templates for interview invites, offers, and rejections

### 🎨 User Experience

- **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Real-time Updates** - Instant data synchronization with Supabase
- **Loading States** - Elegant multi-layered loading animations
- **Empty States** - Helpful guidance when no data exists

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.1.6 (App Router, Server Components, Server Actions)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Fonts**: DM Sans (body), Archivo (headings)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Storage**: Supabase Storage (avatars, resumes)
- **ORM**: Supabase Client SDK

### AI & Processing
- **AI Model**: Google Gemini 1.5 Flash
- **PDF Parsing**: pdf-parse
- **DOCX Parsing**: mammoth
- **Text Extraction**: Custom extraction pipelines

### DevOps
- **Deployment**: Vercel (optimized for Next.js)
- **Version Control**: Git
- **Package Manager**: npm
- **Build Tool**: Turbopack (Next.js 16)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** or **yarn** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up free](https://supabase.com))
- **Google AI Studio Account** ([Get API Key](https://aistudio.google.com/app/apikey))

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/dutient-hrms.git
cd dutient-hrms
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Set Up Supabase Database

#### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click **New Project**
3. Configure:
   - **Name**: `dutient-hrms`
   - **Database Password**: (choose a strong password)
   - **Region**: (select closest to your location)
4. Wait for provisioning (~2 minutes)

#### Run Database Migrations

Navigate to **SQL Editor** in your Supabase dashboard and run these migrations in order:

**Migration 1: Create Candidates Table**
```sql
-- See: supabase/migrations/001_create_candidates_table.sql
-- Creates candidates table with all required fields
```

**Migration 2: Create Interviews Table**
```sql
-- See: supabase/migrations/002_create_interviews_table.sql
-- Creates interviews table with foreign key to candidates
```

**Migration 3: Add Indexes and Policies**
```sql
-- See: supabase/migrations/003_add_indexes_and_policies.sql
-- Adds performance indexes and RLS policies
```

**Migration 4: Create Email Templates Table**
```sql
-- See: supabase/migrations/004_create_email_templates_table.sql
-- Creates email_templates table with seed data
```

> **Note**: All migration files are located in `supabase/migrations/` directory

### 4️⃣ Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini AI Configuration
GEMINI_API_KEY=AIzaSyB...
```

#### Where to Find These Values:

| Variable | Location | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Public, exposed to browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key | Public, protected by RLS |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | Private, server-side only |

> **Security Note**: The `GEMINI_API_KEY` is never exposed to the browser—it's only used in Server Actions.

### 5️⃣ Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
dutient-hrms/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── actions/                  # Server Actions
│   │   │   ├── get-analytics.ts      # Analytics data fetching
│   │   │   ├── get-interviews.ts     # Interview queries
│   │   │   ├── process-resume.ts     # AI resume parsing
│   │   │   ├── rank-candidates.ts    # AI candidate ranking
│   │   │   └── templates.ts          # Email template CRUD
│   │   ├── analytics/                # Analytics dashboard page
│   │   ├── bulk-upload/              # Resume bulk upload page
│   │   ├── candidates/               # Candidates list page
│   │   ├── interviews/               # Interviews management page
│   │   ├── talent-pool/              # Talent pool gallery page
│   │   ├── templates/                # Email templates editor page
│   │   ├── globals.css               # Global styles + design tokens
│   │   ├── layout.tsx                # Root layout with Sidebar
│   │   └── page.tsx                  # Dashboard home page
│   ├── components/
│   │   ├── candidates/               # Candidate-specific components
│   │   │   ├── candidates-list.tsx   # Main candidates list with AI search
│   │   │   ├── talent-pool-list.tsx  # Talent pool grid view
│   │   │   └── ...
│   │   ├── interviews/               # Interview components
│   │   │   ├── interviews-tabs.tsx   # Upcoming/Past tabs
│   │   │   ├── feedback-dialog.tsx   # Interview feedback form
│   │   │   └── ...
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx           # Main navigation sidebar
│   │   │   ├── Header.tsx            # Top header with user menu
│   │   │   └── ...
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── loading-spinner.tsx   # Custom multi-layer spinner
│   │       └── ...
│   ├── lib/
│   │   └── supabase.ts               # Supabase client + TypeScript types
│   └── hooks/                        # Custom React hooks (future)
├── supabase/
│   └── migrations/                   # Database migration SQL files
│       ├── 001_create_candidates_table.sql
│       ├── 002_create_interviews_table.sql
│       ├── 003_add_indexes_and_policies.sql
│       └── 004_create_email_templates_table.sql
├── public/                           # Static assets
├── docs/                             # Documentation
│   ├── AI_SMART_SEARCH_IMPLEMENTATION.md
│   └── prototype/                    # Original HTML prototype
├── .env.local                        # Environment variables (git-ignored)
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── components.json                   # shadcn/ui configuration
└── package.json                      # Dependencies
```

---

## 🎨 Design System

### Color Palette

The application uses the Dutient brand colors:

```css
--primary: #0F172A (slate-900)      /* Main brand color */
--primary-light: #1E293B             /* Hover states */
--accent: #F59E0B (amber-500)        /* Call-to-action, highlights */
--success: #10B981 (emerald-500)     /* Positive actions */
--danger: #EF4444 (red-500)          /* Destructive actions */
--info: #3B82F6 (blue-500)           /* Informational elements */
--warning: #F59E0B (amber-500)       /* Warnings */
--background: #F8FAFC (slate-50)     /* Page background */
--text-muted: #64748B (slate-500)    /* Secondary text */
```

### Typography

- **Body Font**: DM Sans (400, 500, 700) - Clean, modern sans-serif
- **Heading Font**: Archivo (300, 400, 600, 800) - Bold, professional headings

### Component Library

Built with [shadcn/ui](https://ui.shadcn.com/) for:
- Accessibility (ARIA compliant)
- Customizability (styled with Tailwind)
- Quality (built on Radix UI primitives)

---

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production
npm run build        # Build for production (validates types, bundles code)
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

Dutient HRMS is optimized for [Vercel](https://vercel.com) deployment.

#### Prerequisites Checklist

Before deploying, ensure:

- ✅ Production build passes: `npm run build`
- ✅ Supabase database migrations are applied
- ✅ Environment variables are ready

#### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

#### Step 2: Deploy

```bash
vercel --prod
```

#### Step 3: Configure Environment Variables

In the Vercel Dashboard, add these environment variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `GEMINI_API_KEY` | Your Google AI API key | Production, Preview, Development |

**Important**: Select all three environments (Production, Preview, Development) for each variable.

#### Step 4: Verify Deployment

After deployment, test these routes:

- ✅ `https://your-app.vercel.app/` - Dashboard
- ✅ `https://your-app.vercel.app/candidates` - Candidates page
- ✅ `https://your-app.vercel.app/bulk-upload` - Resume upload
- ✅ `https://your-app.vercel.app/analytics` - Analytics dashboard

### Alternative: GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel auto-deploys on every push to `main`
4. Add environment variables in Vercel Dashboard → Project Settings → Environment Variables

### Deployment Configuration

The project includes production-ready configuration:

**next.config.ts**
- ✅ Supabase image domains configured
- ✅ TypeScript strict mode enabled
- ✅ Build optimizations enabled

**Performance Optimizations**
- Server Components for zero client JS
- Static page generation where possible
- Turbopack for fast builds
- Automatic code splitting

---

## 📖 Documentation

### Core Features

#### 1. AI Resume Parsing

**File**: `src/app/actions/process-resume.ts`

Upload resumes (PDF, DOCX, TXT) and automatically extract:
- Name, email, phone, location
- Role, experience level
- Skills (array)
- Education, certifications
- Previous employers

**Usage**:
```typescript
import { processResume } from "@/app/actions/process-resume";

const formData = new FormData();
formData.append("resume", file);

const result = await processResume(formData);
// Returns: { success: true, data: CandidateData }
```

#### 2. AI Candidate Ranking

**File**: `src/app/actions/rank-candidates.ts`

Rank candidates based on job requirements:

```typescript
import { rankCandidates } from "@/app/actions/rank-candidates";

const results = await rankCandidates("Senior React Developer");
// Returns candidates sorted by match score (0-100)
```

#### 3. Interview Management

**Files**: 
- `src/app/actions/get-interviews.ts`
- `src/components/interviews/feedback-dialog.tsx`

Schedule interviews, track status, and collect feedback:

```typescript
// Fetch upcoming interviews
const interviews = await getUpcomingInterviews();

// Add feedback after interview
// Uses FeedbackDialog component with star rating + notes
```

#### 4. Analytics Dashboard

**File**: `src/app/analytics/page.tsx`

View key recruitment metrics:
- Total applications
- Active interviews
- Hired candidates count
- Rejection rate percentage
- Source performance table
- Role pipeline breakdown

#### 5. Email Templates

**File**: `src/app/templates/page.tsx`

Manage customizable email templates:
- Interview invites
- Offer letters
- Rejection emails

Supports variables: `{{name}}`, `{{role}}`, `{{date}}`, `{{time}}`, `{{location}}`, `{{salary}}`

### Database Schema

#### Candidates Table

```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
email           TEXT NOT NULL UNIQUE
phone           TEXT
location        TEXT
role            TEXT
experience      TEXT
skills          TEXT[]
status          TEXT (Applied/Interview/Selected/Rejected)
source          TEXT
applied_date    DATE
match_score     INTEGER
avatar_url      TEXT
resume_url      TEXT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### Interviews Table

```sql
id              UUID PRIMARY KEY
candidate_id    UUID REFERENCES candidates(id)
scheduled_date  TIMESTAMPTZ NOT NULL
scheduled_time  TEXT NOT NULL
interviewer     TEXT NOT NULL
mode            TEXT (In-person/Video/Phone)
location        TEXT
status          TEXT (Scheduled/Completed/Cancelled)
feedback        TEXT
rating          INTEGER (1-5)
decision        TEXT (Hire/Reject/Maybe)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### Email Templates Table

```sql
id              UUID PRIMARY KEY
name            TEXT NOT NULL
type            TEXT (rejection/offer/invite)
subject         TEXT NOT NULL
body            TEXT NOT NULL
created_at      TIMESTAMPTZ
last_updated    TIMESTAMPTZ
```

---

## 🔧 Configuration

### Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

Example:
```bash
npx shadcn@latest add dropdown-menu
npx shadcn@latest add toast
npx shadcn@latest add calendar
```

Components are added to `src/components/ui/` with full TypeScript support.

### Customizing Design Tokens

Edit `src/app/globals.css`:

```css
@theme {
  --color-primary: #0F172A;
  --color-accent: #F59E0B;
  /* Add custom colors, spacing, etc. */
}
```

### TypeScript Configuration

Path aliases are pre-configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

Use in imports:
```typescript
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
```

---

## 🤝 Contributing

⚠️ **RESTRICTED ACCESS - PRIVATE REPOSITORY**

This is a **private and confidential** repository. Contributions are restricted to:

- ✅ Authorized team members
- ✅ Collaborators explicitly added by the repository owner
- ✅ Personnel designated by company management

### For Authorized Contributors

If you have been granted access to this repository, please follow these guidelines:

#### Development Workflow

1. **Create a feature branch**: `git checkout -b feature/feature-name`
2. **Make your changes** with thorough testing
3. **Ensure build passes**: `npm run build`
4. **Commit with clear messages**: `git commit -m 'feat: Add feature description'`
5. **Push to remote**: `git push origin feature/feature-name`
6. **Open a Pull Request** for team review

#### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

#### Code Style Standards

- **TypeScript**: Use strict types, avoid `any`
- **Components**: Prefer Server Components unless client interactivity is needed
- **Styling**: Use Tailwind utility classes
- **Naming**: Use descriptive names (camelCase for functions, PascalCase for components)

#### Confidentiality

- 🔒 Do NOT share repository access credentials
- 🔒 Do NOT fork or clone to public repositories
- 🔒 Do NOT discuss proprietary code outside authorized channels
- 🔒 All code and documentation are confidential and proprietary

---

## 📄 License & Confidentiality

⚠️ **PROPRIETARY AND CONFIDENTIAL**

This software and all associated documentation are the **exclusive property of Dutient** and are protected by copyright and trade secret laws.

### Copyright Notice

```
Copyright © 2026 Dutient. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL

This software, including all source code, documentation, and associated materials,
is the confidential and proprietary information of Dutient.

Unauthorized copying, distribution, modification, public display, or public
performance of this software, via any medium, is strictly prohibited.

Access is restricted to:
- Authorized Dutient employees
- Explicitly designated collaborators
- Personnel approved by company management

Any unauthorized access, use, or disclosure may result in legal action.
```

### Restrictions

- 🚫 **NO PUBLIC DISTRIBUTION**: This software may not be shared, published, or distributed publicly
- 🚫 **NO OPEN SOURCE**: This is NOT open-source software
- 🚫 **NO UNAUTHORIZED ACCESS**: Access is granted on a need-to-know basis only
- 🚫 **NO FORKING**: Do not create public or unauthorized forks of this repository

### Rights Reserved

All rights, title, and interest in and to this software remain with Dutient. No license, right, or interest in any trademarks, service marks, or trade names of Dutient is granted hereunder.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the incredible framework
- **Vercel** - For seamless deployment platform
- **Supabase** - For the powerful backend platform
- **shadcn** - For the beautiful UI component library
- **Google** - For Gemini AI API

---

## 📞 Support

Need help? Have questions?

- 📧 **Email**: support@dutient.com
- 💬 **Issues**: [GitHub Issues](https://github.com/yourusername/dutient-hrms/issues)
- 📚 **Docs**: Check the `docs/` folder for detailed guides

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Advanced filtering and saved searches
- [ ] Email integration (Gmail, Outlook)
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Candidate communication timeline
- [ ] Automated interview scheduling
- [ ] Video interview integration (Zoom, Teams)
- [ ] Custom workflow builder
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced reporting and exports (PDF, Excel)

---

<div align="center">

**Built with ❤️ for modern recruitment teams**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/yourusername/dutient-hrms/issues) • [Request Feature](https://github.com/yourusername/dutient-hrms/issues) • [View Demo](https://dutient-hrms.vercel.app)

</div>
