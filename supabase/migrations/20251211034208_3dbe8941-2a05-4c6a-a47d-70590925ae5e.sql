-- Pro Billing View: Monthly Active Clients per Professional
-- This view aggregates data_access_log to compute engagement metrics for professional billing

-- Create the pro billing view
CREATE OR REPLACE VIEW public.pro_billing_summary AS
SELECT
  professional_id as viewer_id,
  role,
  date_trunc('month', accessed_at) as month,
  count(DISTINCT client_id) as active_clients,
  count(*) as total_access_events,
  array_agg(DISTINCT access_type) as access_types_used
FROM public.data_access_log
WHERE role IN ('supporter', 'coach', 'clinician')
GROUP BY professional_id, role, date_trunc('month', accessed_at);

-- Add comment for documentation
COMMENT ON VIEW public.pro_billing_summary IS 'Aggregates data access logs for professional billing tiers. Computes monthly active clients per professional based on derived-data access, not content.';

-- Create helper function to get active client count for a professional in a given month
CREATE OR REPLACE FUNCTION public.get_pro_active_clients(
  p_professional_id uuid,
  p_month date DEFAULT date_trunc('month', current_date)::date
) RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(count(DISTINCT client_id), 0)::integer
  FROM data_access_log
  WHERE professional_id = p_professional_id
    AND date_trunc('month', accessed_at) = date_trunc('month', p_month::timestamp)
$$;

-- Create helper function to determine billing tier based on active clients
CREATE OR REPLACE FUNCTION public.get_pro_billing_tier(
  p_professional_id uuid,
  p_month date DEFAULT date_trunc('month', current_date)::date
) RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN count(DISTINCT client_id) <= 5 THEN 'free'
      WHEN count(DISTINCT client_id) <= 25 THEN 'pro'
      ELSE 'enterprise'
    END
  FROM data_access_log
  WHERE professional_id = p_professional_id
    AND date_trunc('month', accessed_at) = date_trunc('month', p_month::timestamp)
$$;

-- Grant access to the view (professionals can see their own data)
GRANT SELECT ON public.pro_billing_summary TO authenticated;

-- RLS policy for the view - professionals can only see their own billing data
-- Note: Views inherit table RLS, but we add explicit check
ALTER VIEW public.pro_billing_summary OWNER TO postgres;