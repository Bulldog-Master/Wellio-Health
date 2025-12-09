-- Fix the security definer view warning by using SECURITY INVOKER
DROP VIEW IF EXISTS public.wearable_connections_safe;

CREATE VIEW public.wearable_connections_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  provider,
  expires_at,
  created_at,
  updated_at,
  encryption_version
FROM public.wearable_connections;

-- Grant access to the safe view
GRANT SELECT ON public.wearable_connections_safe TO authenticated;

-- Add comment
COMMENT ON VIEW public.wearable_connections_safe IS 'Safe view excluding encrypted tokens - uses security invoker for RLS enforcement';