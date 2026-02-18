-- Migration: Add ai_justification column to candidates table
-- Purpose: Store the AI-generated justification for the match score

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'candidates' AND column_name = 'ai_justification'
  ) THEN
    ALTER TABLE candidates ADD COLUMN ai_justification TEXT;
    COMMENT ON COLUMN candidates.ai_justification IS 'AI-generated explanation for the match score';
  END IF;
END $$;
