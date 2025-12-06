-- Create content_shares table for sharing private content
CREATE TABLE IF NOT EXISTS public.content_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('progress_photo', 'voice_note', 'workout_media', 'food_image')),
  content_path TEXT NOT NULL,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE,
  is_public BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (owner_id, content_path, shared_with_user_id)
);

-- Enable RLS
ALTER TABLE public.content_shares ENABLE ROW LEVEL SECURITY;

-- Owner can manage their shares
CREATE POLICY "Users can manage their own shares"
ON public.content_shares FOR ALL
USING (auth.uid() = owner_id);

-- Users can view shares made to them
CREATE POLICY "Users can view shares to them"
ON public.content_shares FOR SELECT
USING (auth.uid() = shared_with_user_id);

-- Function to check if user has access to shared content
CREATE OR REPLACE FUNCTION public.can_access_shared_content(
  _content_path TEXT,
  _content_type TEXT,
  _user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.content_shares
    WHERE content_path = _content_path
      AND content_type = _content_type
      AND (expires_at IS NULL OR expires_at > now())
      AND (
        is_public = true
        OR shared_with_user_id = _user_id
        OR owner_id = _user_id
      )
  );
$$;

-- Function to validate share token
CREATE OR REPLACE FUNCTION public.validate_share_token_for_content(_token TEXT)
RETURNS TABLE(is_valid BOOLEAN, content_path TEXT, content_type TEXT, owner_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (expires_at IS NULL OR expires_at > now()) as is_valid,
    content_path,
    content_type,
    owner_id
  FROM public.content_shares
  WHERE share_token = _token
  LIMIT 1;
$$;

-- Make food-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'food-images';

-- Make workout-media bucket private  
UPDATE storage.buckets SET public = false WHERE id = 'workout-media';

-- Drop existing policies for these buckets if they exist
DROP POLICY IF EXISTS "Users can view own food images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own food images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own food images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own food images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own workout media" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own workout media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own workout media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own workout media" ON storage.objects;

-- Food Images: Owner-only by default, can be shared
CREATE POLICY "Users can view own food images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'food-images' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.can_access_shared_content(name, 'food_image', auth.uid())
  )
);

CREATE POLICY "Users can upload own food images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'food-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own food images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'food-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own food images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'food-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Workout Media: Owner-only by default, can be shared
CREATE POLICY "Users can view own workout media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'workout-media' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.can_access_shared_content(name, 'workout_media', auth.uid())
  )
);

CREATE POLICY "Users can upload own workout media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'workout-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own workout media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'workout-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own workout media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'workout-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update progress-photos to support sharing
DROP POLICY IF EXISTS "Users can view own progress photos" ON storage.objects;
CREATE POLICY "Users can view own progress photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'progress-photos' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.can_access_shared_content(name, 'progress_photo', auth.uid())
  )
);

-- Update voice-notes to support sharing
DROP POLICY IF EXISTS "Users can view own voice notes" ON storage.objects;
CREATE POLICY "Users can view own voice notes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'voice-notes' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR public.can_access_shared_content(name, 'voice_note', auth.uid())
  )
);