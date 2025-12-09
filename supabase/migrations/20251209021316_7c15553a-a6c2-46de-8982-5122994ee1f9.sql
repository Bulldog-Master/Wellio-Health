-- Fix 1: Tighten profiles RLS - already applied from previous migration
-- Skip as policy was created

-- Fix 2: Create safe view for wearable connections (excluding tokens)
DROP VIEW IF EXISTS public.wearable_connections_safe;

CREATE VIEW public.wearable_connections_safe AS
SELECT 
  id,
  user_id,
  provider,
  expires_at,
  created_at,
  updated_at,
  encryption_version
  -- Explicitly exclude: access_token_encrypted, refresh_token_encrypted
FROM public.wearable_connections;

-- Grant access to the safe view
GRANT SELECT ON public.wearable_connections_safe TO authenticated;

-- Add comment to document security decision
COMMENT ON VIEW public.wearable_connections_safe IS 'Safe view excluding encrypted tokens - use this for UI display';