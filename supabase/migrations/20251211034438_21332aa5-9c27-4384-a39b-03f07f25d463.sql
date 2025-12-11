-- Fix security definer warnings by explicitly setting SECURITY INVOKER on views
-- This ensures views use the querying user's permissions, not the view creator's

ALTER VIEW public.pro_billing_monthly SET (security_invoker = true);
ALTER VIEW public.pro_billing_summary SET (security_invoker = true);