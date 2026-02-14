-- Migration: Create ranking jobs tracking table
-- Purpose: Track AI ranking jobs for background processing
-- This enables handling large batches (50+ resumes) without timeouts

-- Create ranking_jobs table
CREATE TABLE IF NOT EXISTS public.ranking_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Job details
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    total_candidates INTEGER NOT NULL DEFAULT 0,
    processed_candidates INTEGER NOT NULL DEFAULT 0,
    
    -- Job description
    job_description TEXT NOT NULL,
    
    -- Results and error handling
    error_message TEXT,
    
    -- Metadata
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ranking_jobs_status ON public.ranking_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ranking_jobs_created_at ON public.ranking_jobs(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ranking_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ranking_jobs_updated_at
    BEFORE UPDATE ON public.ranking_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_ranking_jobs_updated_at();

-- RLS Policies (allow all operations for now since we're using anon key)
ALTER TABLE public.ranking_jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read jobs
CREATE POLICY "Allow public read access to ranking_jobs"
    ON public.ranking_jobs
    FOR SELECT
    USING (true);

-- Allow anyone to create jobs
CREATE POLICY "Allow public insert access to ranking_jobs"
    ON public.ranking_jobs
    FOR INSERT
    WITH CHECK (true);

-- Allow anyone to update jobs
CREATE POLICY "Allow public update access to ranking_jobs"
    ON public.ranking_jobs
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.ranking_jobs IS 'Tracks background AI ranking jobs for candidates';
