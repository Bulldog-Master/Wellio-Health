-- Remove any remaining public-access policies on business tables
DROP POLICY IF EXISTS "payment_methods_public_read" ON public.payment_methods;
DROP POLICY IF EXISTS "Payment methods viewable by all" ON public.payment_methods;
DROP POLICY IF EXISTS "news_items_public_read" ON public.news_items;
DROP POLICY IF EXISTS "News viewable by all" ON public.news_items;
DROP POLICY IF EXISTS "rewards_public_read" ON public.rewards;
DROP POLICY IF EXISTS "Rewards viewable by all" ON public.rewards;
DROP POLICY IF EXISTS "subscription_addons_public_read" ON public.subscription_addons;
DROP POLICY IF EXISTS "Addons viewable by all" ON public.subscription_addons;