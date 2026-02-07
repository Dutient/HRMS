# Dutient HR Management System (HRS)

A production-grade Applicant Tracking System built with Next.js 16, TypeScript, and Tailwind CSS. Designed to handle 1,500+ resumes with complex AI workflows.

## 🚀 Technology Stack

- **Next.js 16** - App Router with Server Components
- **TypeScript** - Full type safety
- **Tailwind CSS 4** - Utility-first styling with CSS variables
- **shadcn/ui** - High-quality, accessible component library
- **React 19** - Latest React features

## 🎨 Design System

The project uses the Dutient brand design tokens extracted from the prototype:

### Colors
- **Primary**: `#0F172A` (slate-900)
- **Primary Light**: `#1E293B` (slate-800)
- **Accent**: `#F59E0B` (amber-500)
- **Accent Hover**: `#D97706` (amber-600)
- **Success**: `#10B981` (emerald-500)
- **Danger**: `#EF4444` (red-500)
- **Background**: `#F8FAFC` (slate-50)
- **Text Muted**: `#64748B` (slate-500)

### Typography
- **Body Font**: DM Sans (400, 500, 700)
- **Heading Font**: Archivo (300, 400, 600, 800)

## 📁 Project Structure

```
dutient-hrms/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── globals.css   # Global styles & design tokens
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   └── layout/       # Layout components (Header, Footer, etc.)
│   ├── lib/              # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── docs/                 # Documentation & prototypes
└── components.json       # shadcn/ui configuration
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Supabase account (free tier available at [supabase.com](https://supabase.com))

### Installation Commands

```bash
# Navigate to project directory
cd dutient-hrms

# Install dependencies (already done)
npm install

# Install Supabase client (already done)
npm install @supabase/supabase-js

# Start development server
npm run dev
```

### 🔐 Supabase Database Setup

The application uses Supabase as its backend database. Follow these steps to set it up:

#### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Enter project details:
   - **Name**: `dutient-hrms`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location
4. Wait for the project to be provisioned (~2 minutes)

#### 2. Run the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Create a new query
3. Copy and paste the complete SQL schema from the setup docs (includes):
   - `candidates` table with all required columns
   - Indexes for optimized queries
   - Row Level Security (RLS) policies
   - Sample data for testing
4. Click **Run** to execute the SQL

#### 3. Configure Environment Variables

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Create/update `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. **Important**: Replace the placeholder values with your actual credentials
5. Restart your dev server for changes to take effect

#### 4. Verify the Connection

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/candidates`
3. You should see the sample candidates from the database
4. If you see a yellow warning banner, double-check your credentials

### Available Scripts

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 🎯 Adding shadcn/ui Components

The project is configured for shadcn/ui. To add components:

```bash
# Add specific components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add table
```

Components will be automatically added to `src/components/ui/`.

## 🎨 Using Design Tokens

The design tokens are configured in `src/app/globals.css` and can be used in your components:

```tsx
// Using Tailwind classes with custom colors
<div className="bg-primary text-white">
  <h1 className="font-heading text-accent">Dutient</h1>
  <p className="text-text-muted">Welcome to Dutient HRS</p>
</div>

// Using CSS variables directly
<div style={{ backgroundColor: 'var(--primary)' }}>
  Custom content
</div>
```

## 🔧 Configuration Files

### `components.json`
shadcn/ui configuration with path aliases:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`

### `tsconfig.json`
TypeScript configuration with path aliases pre-configured.

### `tailwind.config.ts`
Tailwind CSS 4 uses CSS-based configuration in `globals.css` via `@theme` directive.

## 🌐 Development Workflow

1. **Start the dev server**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:3000`
3. **Edit files**: Changes hot-reload automatically
4. **Add components**: Use shadcn/ui CLI or create custom components in `src/components/`

## 📦 Next Steps

1. **Add shadcn/ui components** as needed for your features
2. **Create API routes** in `src/app/api/` for backend functionality
3. **Build reusable hooks** in `src/hooks/`
4. **Define TypeScript types** in `src/types/`
5. **Implement AI workflows** for resume processing
6. **Set up database** (Prisma, Drizzle, or your choice)
7. **Configure authentication** (NextAuth.js, Clerk, etc.)

## 🎓 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📝 Notes

- The project uses **Next.js 16** (latest version!)
- Tailwind CSS 4 uses a new CSS-first configuration approach
- All design tokens from the prototype are configured and ready to use
- The folder structure is optimized for scalability (1,500+ resumes)

---

**Built with ❤️ for Dutient HR Management System**
