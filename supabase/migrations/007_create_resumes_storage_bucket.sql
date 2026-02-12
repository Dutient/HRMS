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
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

-- Allow authenticated uploads (change to allow public uploads if needed)
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
CREATE POLICY "Allow uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Allow anyone to upload (use this if you want public uploads)
-- DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
-- CREATE POLICY "Allow public uploads"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'resumes');

-- Allow users to delete files
DROP POLICY IF EXISTS "Allow delete" ON storage.objects;
CREATE POLICY "Allow delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resumes');
