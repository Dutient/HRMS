-- Migration: Add master schema fields to candidates table
-- Purpose: Align DB with Google Form fields so CSV is the master data source
-- New fields: qualification, current_ctc, expected_ctc, notice_period, form_submitted_at, notes

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'qualification'
  ) THEN
    ALTER TABLE candidates ADD COLUMN qualification TEXT;
    COMMENT ON COLUMN candidates.qualification IS 'Highest qualification e.g. Law, Engineer, MBA, Other';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'current_ctc'
  ) THEN
    ALTER TABLE candidates ADD COLUMN current_ctc DECIMAL(10,2);
    COMMENT ON COLUMN candidates.current_ctc IS 'Current CTC in LPA (Lakhs Per Annum)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'expected_ctc'
  ) THEN
    ALTER TABLE candidates ADD COLUMN expected_ctc DECIMAL(10,2);
    COMMENT ON COLUMN candidates.expected_ctc IS 'Expected CTC in LPA (Lakhs Per Annum)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'notice_period'
  ) THEN
    ALTER TABLE candidates ADD COLUMN notice_period TEXT;
    COMMENT ON COLUMN candidates.notice_period IS 'Joining timeline e.g. Immediate, 15 Days, 30 Days, 60 Days, More than 60 Days';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'form_submitted_at'
  ) THEN
    ALTER TABLE candidates ADD COLUMN form_submitted_at TIMESTAMPTZ;
    COMMENT ON COLUMN candidates.form_submitted_at IS 'Timestamp from Google Form submission (Timestamp column)';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'candidates' AND column_name = 'notes'
  ) THEN
    ALTER TABLE candidates ADD COLUMN notes TEXT;
    COMMENT ON COLUMN candidates.notes IS 'Free-form HR notes, extra context from form or recruiter';
  END IF;
END $$;

-- Indexes for common filter queries
CREATE INDEX IF NOT EXISTS idx_candidates_qualification ON candidates(qualification);
CREATE INDEX IF NOT EXISTS idx_candidates_notice_period ON candidates(notice_period);
CREATE INDEX IF NOT EXISTS idx_candidates_current_ctc ON candidates(current_ctc);
CREATE INDEX IF NOT EXISTS idx_candidates_expected_ctc ON candidates(expected_ctc);
