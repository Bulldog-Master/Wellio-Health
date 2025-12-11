-- Create view with billing tiers based on active client counts
-- Tiers: inactive (0), starter (1-5), growth (6-20), pro (21+)
CREATE OR REPLACE VIEW public.pro_billing_monthly_with_tiers AS
SELECT
  pb.viewer_id,
  pb.role,
  pb.billing_month,
  pb.active_clients,
  pb.total_access_events,
  CASE
    WHEN pb.active_clients = 0 THEN 'inactive'
    WHEN pb.active_clients BETWEEN 1 AND 5 THEN 'starter'
    WHEN pb.active_clients BETWEEN 6 AND 20 THEN 'growth'
    ELSE 'pro'
  END AS billing_tier
FROM public.pro_billing_monthly pb;

-- Set security invoker to use querying user's permissions
ALTER VIEW public.pro_billing_monthly_with_tiers SET (security_invoker = true);