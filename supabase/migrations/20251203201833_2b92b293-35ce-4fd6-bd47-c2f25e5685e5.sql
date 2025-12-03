-- =====================================================
-- SECURITY FIX: Additional RLS Policy Hardening (Fixed)
-- =====================================================

-- 1. WEARABLE_CONNECTIONS: Create secure function to return only safe fields
CREATE OR REPLACE FUNCTION public.get_wearable_connections_safe(_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  provider text,
  expires_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  is_connected boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    wc.id,
    wc.user_id,
    wc.provider,
    wc.expires_at,
    wc.created_at,
    wc.updated_at,
    -- Never expose: access_token, refresh_token, access_token_encrypted, refresh_token_encrypted
    (wc.access_token_encrypted IS NOT NULL OR wc.access_token IS NOT NULL) as is_connected
  FROM public.wearable_connections wc
  WHERE wc.user_id = _user_id;
$$;

-- 2. FITNESS_LOCATIONS: Only show verified locations to public (unverified need admin approval)
DROP POLICY IF EXISTS "Anyone can view active fitness locations" ON public.fitness_locations;
DROP POLICY IF EXISTS "Anyone can view fitness locations" ON public.fitness_locations;
DROP POLICY IF EXISTS "Public can view fitness locations" ON public.fitness_locations;

-- Public can only see verified AND active locations, or their own submissions
CREATE POLICY "fitness_locations_public_verified_only" ON public.fitness_locations
FOR SELECT USING (
  (is_verified = true AND is_active = true)
  OR public.has_role(auth.uid(), 'admin')
  OR auth.uid() = submitted_by
);

-- 3. Add column comments for security documentation
COMMENT ON COLUMN public.wearable_connections.access_token IS 'DEPRECATED: Use access_token_encrypted. Direct access blocked by RLS.';
COMMENT ON COLUMN public.wearable_connections.refresh_token IS 'DEPRECATED: Use refresh_token_encrypted. Direct access blocked by RLS.';
COMMENT ON COLUMN public.wearable_connections.access_token_encrypted IS 'SENSITIVE: Encrypted using DATA_ENCRYPTION_KEY. Only accessible via edge functions.';
COMMENT ON COLUMN public.wearable_connections.refresh_token_encrypted IS 'SENSITIVE: Encrypted using DATA_ENCRYPTION_KEY. Only accessible via edge functions.';