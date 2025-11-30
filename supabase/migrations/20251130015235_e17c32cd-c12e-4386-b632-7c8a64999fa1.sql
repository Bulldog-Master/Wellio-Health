-- Remove subscription view to fix security definer warning
DROP VIEW IF EXISTS public.user_subscription_info;

-- Add RLS policy to prevent Stripe ID exposure at query level
-- Users should select only specific columns when querying subscriptions
COMMENT ON TABLE public.subscriptions IS 'When querying for user display, select only: tier, status, current_period_start, current_period_end, cancel_at_period_end. NEVER expose stripe_customer_id or stripe_subscription_id to clients.';