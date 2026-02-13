-- Fix Storage RLS Policies for Resume Uploads
-- This allows anon/public uploads to the resumes bucket
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Allow anyone to read files (public access)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

-- Allow anyone to upload files (anon/public uploads)
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

-- Allow anyone to delete their uploads
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes');

-- Allow anyone to update files
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');
