-- Migration: Add location, relocation, and source_url columns to candidates
-- Purpose: Support cloud ingestion and advanced filtering

-- Add location column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'location'
  ) THEN
    ALTER TABLE candidates ADD COLUMN location TEXT;
  END IF;
END $$;

-- Add will_relocate column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'will_relocate'
  ) THEN
    ALTER TABLE candidates ADD COLUMN will_relocate BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add source_url column (for cloud file links)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE candidates ADD COLUMN source_url TEXT;
  END IF;
END $$;

-- Create index on experience for range queries
CREATE INDEX IF NOT EXISTS idx_candidates_experience ON candidates(experience);

-- Create index on location for ILIKE queries (using pg_trgm if available would be better, but standard index helps with prefix)
CREATE INDEX IF NOT EXISTS idx_candidates_location ON candidates(location);

-- Add comments
COMMENT ON COLUMN candidates.location IS 'Candidate current location (City, Country)';
COMMENT ON COLUMN candidates.will_relocate IS 'Whether candidate is willing to relocate';
COMMENT ON COLUMN candidates.source_url IS 'External link to resume (e.g. Google Drive) if not stored in Supabase';
