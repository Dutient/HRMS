-- Add missing columns to candidates table (if they don't exist)
-- This migration ensures all required fields for the Candidate Card design are present

-- Skills column (already exists as text[] based on TypeScript interface)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'skills'
  ) THEN
    ALTER TABLE candidates ADD COLUMN skills TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Experience column (already exists as integer based on TypeScript interface)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'experience'
  ) THEN
    ALTER TABLE candidates ADD COLUMN experience INTEGER;
  END IF;
END $$;

-- Source column (already exists based on TypeScript interface)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'source'
  ) THEN
    ALTER TABLE candidates ADD COLUMN source TEXT DEFAULT 'Bulk Upload';
  END IF;
END $$;

-- Match score column (already exists based on TypeScript interface)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'match_score'
  ) THEN
    ALTER TABLE candidates ADD COLUMN match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100);
  END IF;
END $$;

-- Resume URL column (already exists based on TypeScript interface)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'resume_url'
  ) THEN
    ALTER TABLE candidates ADD COLUMN resume_url TEXT;
  END IF;
END $$;

-- Applied date column (already exists based on TypeScript interface)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'applied_date'
  ) THEN
    ALTER TABLE candidates ADD COLUMN applied_date DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidates_match_score ON candidates(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_source ON candidates(source);
CREATE INDEX IF NOT EXISTS idx_candidates_applied_date ON candidates(applied_date DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING GIN(skills);

-- Add comment to table
COMMENT ON COLUMN candidates.skills IS 'Array of skill tags (e.g., GDPR, React, Python)';
COMMENT ON COLUMN candidates.experience IS 'Years of experience';
COMMENT ON COLUMN candidates.source IS 'Recruitment source (e.g., LinkedIn, Bulk Upload, Referral)';
COMMENT ON COLUMN candidates.match_score IS 'AI-calculated match score (0-100)';
COMMENT ON COLUMN candidates.resume_url IS 'URL to stored resume file in Supabase Storage';
COMMENT ON COLUMN candidates.applied_date IS 'Date when candidate applied or was added to system';
