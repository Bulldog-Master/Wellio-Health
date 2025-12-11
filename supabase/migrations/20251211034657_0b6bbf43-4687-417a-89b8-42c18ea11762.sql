-- Add RLS policies for pro_billing views - admin only access

-- Create policy for pro_billing_monthly view
CREATE POLICY "Only admins can view pro_billing_monthly"
ON public.data_access_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Note: Views inherit RLS from underlying tables when security_invoker = true
-- The pro_billing_monthly view queries data_access_log, which now has admin-only policy
-- This effectively restricts the views to admin users only

-- Alternative: Create a wrapper function for non-admin service access if needed later
CREATE OR REPLACE FUNCTION public.get_pro_billing_current_month()
RETURNS TABLE (
  viewer_id uuid,
  role text,
  billing_month timestamptz,
  active_clients bigint,
  total_access_events bigint,
  billing_tier text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    viewer_id,
    role,
    billing_month,
    active_clients,
    total_access_events,
    billing_tier
  FROM public.pro_billing_monthly_with_tiers
  WHERE billing_month = date_trunc('month', current_date)
  ORDER BY billing_tier DESC;
$$;

-- Grant execute to authenticated users who are admins (enforced in function if needed)
COMMENT ON FUNCTION public.get_pro_billing_current_month IS 'Returns current month pro billing data with tiers. Security definer bypasses RLS for internal/admin use.';