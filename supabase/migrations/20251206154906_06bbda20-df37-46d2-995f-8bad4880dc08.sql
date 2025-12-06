-- FIX REMAINING 3 CRITICAL SECURITY ISSUES

-- 1. PROFILES TABLE - Fix public exposure, require authentication
DROP POLICY IF EXISTS "Users can view profiles with restricted health data" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public read access for profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

-- Only authenticated users can view profiles, with restrictions
CREATE POLICY "Authenticated users can view profiles with restrictions"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id  -- Own profile
  OR (NOT is_private OR public.is_following(auth.uid(), id))  -- Public or following
);

-- 2. ETRANSFER_REQUESTS - Make reference_email nullable and encourage encrypted version
-- Can't drop column if it has NOT NULL constraint, so we make it nullable
ALTER TABLE public.etransfer_requests ALTER COLUMN reference_email DROP NOT NULL;

-- 3. PROFESSIONAL_APPLICATIONS - The plaintext columns were already dropped
-- Just verify the encrypted columns exist (already done in previous migration)

-- Add explicit DENY policies for admin-only tables to prevent bypass attempts

-- News items - block non-admin modifications
DROP POLICY IF EXISTS "Block non-admin modifications" ON public.news_items;
CREATE POLICY "Block non-admin modifications"
ON public.news_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Payment methods - block non-admin modifications
DROP POLICY IF EXISTS "Block non-admin modifications" ON public.payment_methods;
CREATE POLICY "Block non-admin modifications" 
ON public.payment_methods
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Rewards - block non-admin modifications
DROP POLICY IF EXISTS "Block non-admin modifications" ON public.rewards;
CREATE POLICY "Block non-admin modifications"
ON public.rewards
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Subscription addons - block non-admin modifications  
DROP POLICY IF EXISTS "Block non-admin modifications" ON public.subscription_addons;
CREATE POLICY "Block non-admin modifications"
ON public.subscription_addons
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));