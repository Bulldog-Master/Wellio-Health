-- Fix security definer view warning - drop and recreate as regular view
-- The view should inherit RLS from data_access_log table

DROP VIEW IF EXISTS public.pro_billing_summary;

-- Create regular view (no security definer)
CREATE VIEW public.pro_billing_summary AS
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

-- Comment
COMMENT ON VIEW public.pro_billing_summary IS 'Aggregates data access logs for professional billing. Inherits RLS from data_access_log table.';

-- Grant authenticated users access (they will only see rows allowed by data_access_log RLS)
GRANT SELECT ON public.pro_billing_summary TO authenticated;