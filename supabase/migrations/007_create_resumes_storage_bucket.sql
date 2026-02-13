-- Create storage bucket for resumes
-- IMPORTANT: Create the bucket via Supabase Dashboard first!
-- 
-- Steps:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "New bucket"
-- 3. Name: "resumes"
-- 4. Make it PUBLIC
-- 5. Then run the policies below

-- Only run the policies below AFTER creating the bucket in the UI
-- These policies are safe to run - they won't disturb existing data

-- Allow public access to read files
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

-- Allow public uploads (no authentication required for Phase 1)
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

-- Allow public delete
DROP POLICY IF EXISTS "Allow delete" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access" ON storage.objects;
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes');

-- Allow public update
DROP POLICY IF EXISTS "Public update access" ON storage.objects;
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');
