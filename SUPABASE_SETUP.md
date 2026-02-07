# Supabase Database Setup Guide

This guide will help you set up the Supabase database for the Dutient HRMS application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Your Supabase project created and ready

## Step 1: Run the SQL Schema

Copy the entire SQL script below and paste it into your Supabase SQL Editor, then click **Run**.

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create candidates table
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personal Information
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  
  -- Professional Information
  role TEXT NOT NULL,
  experience INTEGER, -- years of experience
  skills TEXT[], -- array of skills
  
  -- Application Status
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Screening', 'Interview', 'Final Round', 'Selected', 'Rejected', 'Talent Pool')),
  source TEXT, -- LinkedIn, Naukri, Career Page, Referral
  applied_date DATE DEFAULT CURRENT_DATE,
  
  -- AI/Matching
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  summary TEXT, -- AI-generated summary
  resume_url TEXT,
  
  -- Talent Pool Specific (optional fields)
  availability TEXT, -- "Immediate", "2 weeks notice", etc.
  rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5), -- 0.0 to 5.0
  last_engaged DATE,
  
  -- Metadata
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_match_score ON candidates(match_score DESC);
CREATE INDEX idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX idx_candidates_skills ON candidates USING GIN(skills); -- For array searches

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON candidates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth requirements)
-- For now, allow all operations for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON candidates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON candidates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON candidates
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON candidates
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample data for testing
INSERT INTO candidates (name, email, phone, location, role, experience, skills, status, source, applied_date, match_score, avatar_url) VALUES
('Priya Sharma', 'priya.sharma@email.com', '+91 98765 43210', 'Bangalore, India', 'Senior Frontend Developer', 5, ARRAY['React', 'Next.js', 'TypeScript', 'Tailwind CSS'], 'Interview', 'LinkedIn', '2026-02-01', 95, ''),
('Rahul Verma', 'rahul.verma@email.com', '+91 87654 32109', 'Mumbai, India', 'Full Stack Developer', 4, ARRAY['Node.js', 'React', 'MongoDB', 'AWS'], 'Screening', 'Naukri', '2026-01-28', 88, ''),
('Ananya Reddy', 'ananya.reddy@email.com', '+91 76543 21098', 'Hyderabad, India', 'UI/UX Designer', 3, ARRAY['Figma', 'Adobe XD', 'User Research', 'Prototyping'], 'Final Round', 'Career Page', '2026-01-25', 92, ''),
('Vikram Singh', 'vikram.singh@email.com', '+91 65432 10987', 'Delhi, India', 'DevOps Engineer', 6, ARRAY['Kubernetes', 'Docker', 'AWS', 'CI/CD', 'Terraform'], 'New', 'Referral', '2026-02-05', 90, ''),
('Sneha Patel', 'sneha.patel@email.com', '+91 54321 09876', 'Pune, India', 'Product Manager', 7, ARRAY['Product Strategy', 'Agile', 'Data Analysis', 'Stakeholder Management'], 'Interview', 'LinkedIn', '2026-01-30', 87, ''),
('Arjun Mehta', 'arjun.mehta@email.com', '+91 43210 98765', 'Bangalore, India', 'Senior Backend Developer', 8, ARRAY['Java', 'Spring Boot', 'Microservices', 'PostgreSQL'], 'Talent Pool', 'LinkedIn', '2026-01-15', 96, ''),
('Kavya Krishnan', 'kavya.krishnan@email.com', '+91 32109 87654', 'Chennai, India', 'Data Scientist', 5, ARRAY['Python', 'Machine Learning', 'TensorFlow', 'SQL'], 'Talent Pool', 'Career Page', '2026-01-20', 94, '');

-- Update talent pool candidates with additional fields
UPDATE candidates 
SET availability = 'Immediate', rating = 4.8, last_engaged = '2026-01-15'
WHERE email = 'arjun.mehta@email.com';

UPDATE candidates 
SET availability = '2 weeks notice', rating = 4.9, last_engaged = '2026-01-20'
WHERE email = 'kavya.krishnan@email.com';
```

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, navigate to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xyzcompany.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Your Application

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
# Replace with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file
4. Restart your development server:

```bash
# Stop the server (Ctrl+C) then restart
npm run dev
```

## Step 4: Verify Everything Works

1. Open your browser to `http://localhost:3000/candidates`
2. You should see 7 sample candidates:
   - 5 in the "All Candidates" tab
   - 2 in the "Talent Pool" tab
3. The yellow warning banner should disappear once configured

## Database Schema Overview

### Candidates Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Candidate full name |
| `email` | TEXT | Email (unique) |
| `phone` | TEXT | Contact number |
| `location` | TEXT | City, Country |
| `role` | TEXT | Job role/title |
| `experience` | INTEGER | Years of experience |
| `skills` | TEXT[] | Array of skills |
| `status` | TEXT | Application status |
| `match_score` | INTEGER | AI match score (0-100) |
| `resume_url` | TEXT | Link to resume file |
| `summary` | TEXT | AI-generated summary |
| `availability` | TEXT | For talent pool |
| `rating` | NUMERIC | For talent pool (0-5) |
| `created_at` | TIMESTAMP | Auto-generated |
| `updated_at` | TIMESTAMP | Auto-updated |

### Status Values

- `New` - Just applied
- `Screening` - In review
- `Interview` - Scheduled/completed interview
- `Final Round` - Last interview stage
- `Selected` - Hired
- `Rejected` - Not selected
- `Talent Pool` - Pre-vetted for future roles

## Troubleshooting

### Error: "Invalid supabaseUrl"

**Cause**: Environment variables not configured or contain placeholder values

**Solution**:
1. Check `.env.local` has real values (not `your-project-url-here`)
2. Restart dev server after updating `.env.local`
3. Clear Next.js cache: `rm -rf .next` (or delete `.next` folder)

### No Candidates Showing

**Possible causes**:
1. SQL script didn't run successfully - Check Supabase logs
2. RLS policies blocking access - Verify policies in Supabase dashboard
3. Network issues - Check browser console for errors

### Yellow Warning Banner Persists

**Cause**: Environment variables not loaded

**Solution**:
1. Ensure `.env.local` is in project root (not `src/`)
2. Variable names must start with `NEXT_PUBLIC_` for client access
3. Restart dev server after any `.env.local` changes

## Next Steps

Once your database is set up:

1. **Test the search**: Try searching candidates by name or skills
2. **Explore tabs**: Switch between "All Candidates" and "Talent Pool"
3. **Check console**: Open browser DevTools to see any warnings
4. **Build features**: Start implementing additional functionality

## Security Notes

⚠️ **Important Security Information**:

- The `anon` key is safe to use in client-side code
- RLS policies protect your data even with the public key
- Never commit `.env.local` to version control
- For production, review and tighten RLS policies
- Consider adding role-based access control

## Support

If you encounter issues:
- Check [Supabase Documentation](https://supabase.com/docs)
- Review [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- Check the browser console for error messages
- Verify SQL ran successfully in Supabase SQL Editor

---

**Happy coding! 🚀**
