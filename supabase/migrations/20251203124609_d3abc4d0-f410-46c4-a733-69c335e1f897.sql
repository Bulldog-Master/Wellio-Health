-- 1. Change default is_public to false for challenge_participants
ALTER TABLE public.challenge_participants 
ALTER COLUMN is_public SET DEFAULT false;

-- 2. Add encryption columns for wearable tokens (store encrypted versions)
ALTER TABLE public.wearable_connections 
ADD COLUMN IF NOT EXISTS access_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS refresh_token_encrypted TEXT,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

-- 3. Add encryption columns for medical records
ALTER TABLE public.medical_records
ADD COLUMN IF NOT EXISTS file_url_encrypted TEXT,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

ALTER TABLE public.medical_test_results
ADD COLUMN IF NOT EXISTS file_url_encrypted TEXT,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 1;

-- 4. Update RLS to restrict wearable token access to service role only
DROP POLICY IF EXISTS "Users can view their own wearable connections" ON public.wearable_connections;
CREATE POLICY "Users can view their own wearable connections"
ON public.wearable_connections
FOR SELECT
USING (
  auth.uid() = user_id
  AND access_token_encrypted IS NOT NULL -- Only allow viewing if encrypted
);

-- 5. Add comment documenting encryption requirement
COMMENT ON COLUMN public.wearable_connections.access_token IS 'DEPRECATED: Use access_token_encrypted instead';
COMMENT ON COLUMN public.wearable_connections.refresh_token IS 'DEPRECATED: Use refresh_token_encrypted instead';
COMMENT ON COLUMN public.medical_records.file_url IS 'DEPRECATED: Use file_url_encrypted instead';
COMMENT ON COLUMN public.medical_test_results.file_url IS 'DEPRECATED: Use file_url_encrypted instead';