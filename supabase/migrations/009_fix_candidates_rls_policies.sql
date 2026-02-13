-- Fix Row-Level Security policies for candidates table
-- The app uses anon key (not authenticated), so we need to allow public access
-- This migration replaces authenticated-only policies with public access policies

-- Drop existing policies that require authentication
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON candidates;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON candidates;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON candidates;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON candidates;

-- Create new policies allowing public/anon access
-- These policies allow the app to work with the anon key
CREATE POLICY "Allow public read access to candidates"
ON candidates FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert access to candidates"
ON candidates FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update access to candidates"
ON candidates FOR UPDATE
TO public
USING (true);

CREATE POLICY "Allow public delete access to candidates"
ON candidates FOR DELETE
TO public
USING (true);

-- Also fix policies for related tables
-- Interviews table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON interviews;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON interviews;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON interviews;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON interviews;

CREATE POLICY "Allow public read access to interviews"
ON interviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert access to interviews"
ON interviews FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update access to interviews"
ON interviews FOR UPDATE
TO public
USING (true);

CREATE POLICY "Allow public delete access to interviews"
ON interviews FOR DELETE
TO public
USING (true);

-- Email templates table
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON email_templates;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON email_templates;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON email_templates;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON email_templates;

CREATE POLICY "Allow public read access to email_templates"
ON email_templates FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow public insert access to email_templates"
ON email_templates FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update access to email_templates"
ON email_templates FOR UPDATE
TO public
USING (true);

CREATE POLICY "Allow public delete access to email_templates"
ON email_templates FOR DELETE
TO public
USING (true);

-- Add comment explaining the change
COMMENT ON TABLE candidates IS 'RLS policies updated to allow public access for anon key usage. Update these policies when implementing proper authentication.';
COMMENT ON TABLE interviews IS 'RLS policies updated to allow public access for anon key usage. Update these policies when implementing proper authentication.';
COMMENT ON TABLE email_templates IS 'RLS policies updated to allow public access for anon key usage. Update these policies when implementing proper authentication.';
