-- Create progress_shares table for server-side share token validation
CREATE TABLE IF NOT EXISTS public.progress_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  share_token TEXT UNIQUE NOT NULL,
  allowed_data TEXT[] NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_revoked BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.progress_shares ENABLE ROW LEVEL SECURITY;

-- Users can manage their own shares
CREATE POLICY "Users can create own shares"
ON public.progress_shares FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own shares"
ON public.progress_shares FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can revoke own shares"
ON public.progress_shares FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares"
ON public.progress_shares FOR DELETE
USING (auth.uid() = user_id);

-- Anyone can validate a share token (but only see limited info)
CREATE OR REPLACE FUNCTION public.validate_share_token(token TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  allowed_data TEXT[],
  user_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    (expires_at > now() AND is_revoked = false) as is_valid,
    allowed_data,
    user_id
  FROM progress_shares
  WHERE share_token = token
  LIMIT 1;
$$;

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_progress_shares_token ON public.progress_shares(share_token);

-- Auto-cleanup expired shares (can be called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_expired_shares()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM progress_shares WHERE expires_at < now() - INTERVAL '7 days';
$$;