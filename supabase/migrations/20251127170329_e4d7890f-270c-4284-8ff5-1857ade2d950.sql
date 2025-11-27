-- Create secure auth_secrets table for 2FA secrets
CREATE TABLE public.auth_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_secret text,
  two_factor_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on auth_secrets
ALTER TABLE public.auth_secrets ENABLE ROW LEVEL SECURITY;

-- Only users can access their own secrets
CREATE POLICY "Users can view own auth secrets"
ON public.auth_secrets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auth secrets"
ON public.auth_secrets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auth secrets"
ON public.auth_secrets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own auth secrets"
ON public.auth_secrets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Migrate existing 2FA data from profiles to auth_secrets
INSERT INTO public.auth_secrets (user_id, two_factor_secret, two_factor_enabled)
SELECT id, two_factor_secret, two_factor_enabled
FROM public.profiles
WHERE two_factor_secret IS NOT NULL OR two_factor_enabled = true
ON CONFLICT (user_id) DO NOTHING;

-- Add DELETE policy for profiles (GDPR compliance)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Add UPDATE and DELETE policies for achievements
CREATE POLICY "Users can update own achievements"
ON public.achievements
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements"
ON public.achievements
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add UPDATE and DELETE policies for ai_insights
CREATE POLICY "Users can update own ai insights"
ON public.ai_insights
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai insights"
ON public.ai_insights
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add UPDATE policy for habit_completions
CREATE POLICY "Users can update own habit completions"
ON public.habit_completions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Storage policies for medical records bucket
DROP POLICY IF EXISTS "Users can view own medical files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own medical files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own medical files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own medical files" ON storage.objects;

CREATE POLICY "Users can view own medical files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own medical files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own medical files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own medical files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'medical-records' AND auth.uid()::text = (storage.foldername(name))[1]);