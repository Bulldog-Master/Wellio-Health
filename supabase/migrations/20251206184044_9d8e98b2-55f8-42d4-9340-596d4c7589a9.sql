-- Make progress-photos bucket private
UPDATE storage.buckets SET public = false WHERE id = 'progress-photos';

-- Make voice-notes bucket private
UPDATE storage.buckets SET public = false WHERE id = 'voice-notes';

-- Drop existing policies if they exist and recreate with proper access control
DROP POLICY IF EXISTS "Users can view own progress photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own progress photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own progress photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own progress photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own voice notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own voice notes" ON storage.objects;

-- Progress Photos: Owner-only access by default
CREATE POLICY "Users can view own progress photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own progress photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own progress photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own progress photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Voice Notes: Owner-only access
CREATE POLICY "Users can view own voice notes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'voice-notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own voice notes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'voice-notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own voice notes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'voice-notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own voice notes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'voice-notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);