-- Create secure RPC function to return only user-facing payment method fields
CREATE OR REPLACE FUNCTION public.get_payment_methods_safe()
RETURNS TABLE(
  id uuid,
  method_key text,
  name text,
  name_es text,
  description text,
  description_es text,
  icon text,
  processing_fee_percent numeric,
  processing_fee_fixed numeric,
  min_amount numeric,
  max_amount numeric,
  requires_region text[],
  is_active boolean,
  sort_order integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    pm.id,
    pm.method_key,
    pm.name,
    pm.name_es,
    pm.description,
    pm.description_es,
    pm.icon,
    pm.processing_fee_percent,
    pm.processing_fee_fixed,
    pm.min_amount,
    pm.max_amount,
    pm.requires_region,
    pm.is_active,
    pm.sort_order
    -- Intentionally excludes: config (contains sensitive provider credentials)
  FROM public.payment_methods pm
  WHERE pm.is_active = true
  ORDER BY pm.sort_order ASC;
$$;

-- Drop existing permissive policy
DROP POLICY IF EXISTS "Payment methods are viewable by all" ON public.payment_methods;

-- Create restrictive policy - only admins can access table directly
CREATE POLICY "Only admins can access payment_methods directly"
ON public.payment_methods
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));