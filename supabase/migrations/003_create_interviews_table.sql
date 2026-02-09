-- Create interviews table for tracking candidate interviews
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_name TEXT NOT NULL,
  interview_date TIMESTAMPTZ NOT NULL,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('Screening', 'Technical', 'Final', 'HR')),
  status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
  meeting_link TEXT,
  feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
  feedback_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on candidate_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);

-- Create index on interview_date for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(interview_date);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Enable Row Level Security
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Enable all access for interviews" ON interviews
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_interviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_interviews_updated_at();

-- Add comment to table
COMMENT ON TABLE interviews IS 'Stores interview scheduling and feedback data for candidates';
