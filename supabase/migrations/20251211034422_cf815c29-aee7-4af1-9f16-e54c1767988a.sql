-- Create or replace the pro_billing_monthly view
-- Goal: for each pro per month, compute active clients, role, and total access events
CREATE OR REPLACE VIEW public.pro_billing_monthly AS
SELECT
  dal.professional_id AS viewer_id,
  dal.role,
  date_trunc('month', dal.accessed_at) AS billing_month,
  count(DISTINCT dal.client_id) AS active_clients,
  count(*) AS total_access_events
FROM public.data_access_log dal
WHERE dal.role IN ('coach', 'clinician')
GROUP BY
  dal.professional_id,
  dal.role,
  date_trunc('month', dal.accessed_at);