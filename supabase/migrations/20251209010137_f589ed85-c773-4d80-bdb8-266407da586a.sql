-- Clean up duplicate/conflicting policies on business tables

-- 1. payment_methods - remove "Anyone" policy, keep authenticated-only
DROP POLICY IF EXISTS "Anyone can view active payment methods" ON public.payment_methods;

-- 2. rewards - remove "Anyone" policy, keep authenticated-only  
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards;

-- 3. subscription_addons - remove "Anyone" policy, keep authenticated-only
DROP POLICY IF EXISTS "Anyone can view active addons" ON public.subscription_addons;