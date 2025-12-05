-- =====================================================
-- FIX CRITICAL: Profiles + Business-Sensitive Tables
-- =====================================================

-- =====================================================
-- 1. FIX PROFILES - Require authentication, protect PII
-- =====================================================

-- Drop ALL existing profile SELECT policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view any profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile fully" ON public.profiles;
DROP POLICY IF EXISTS "Users can view basic public profile info" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Only authenticated users can view profiles
-- Users always see their own full profile
-- Others see limited public info only
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid() -- Always see own profile
  OR (is_private = false OR is_private IS NULL) -- Others see public profiles only
);

-- =====================================================
-- 2. FIX PAYMENT_METHODS - Require authentication
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Public can view payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Payment methods are viewable by everyone" ON public.payment_methods;

CREATE POLICY "Authenticated users can view active payment methods"
ON public.payment_methods FOR SELECT
TO authenticated
USING (is_active = true);

-- =====================================================
-- 3. FIX SUBSCRIPTION_ADDONS - Require authentication  
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view subscription addons" ON public.subscription_addons;
DROP POLICY IF EXISTS "Public can view subscription addons" ON public.subscription_addons;
DROP POLICY IF EXISTS "Subscription addons are viewable by everyone" ON public.subscription_addons;

CREATE POLICY "Authenticated users can view active addons"
ON public.subscription_addons FOR SELECT
TO authenticated
USING (is_active = true);

-- =====================================================
-- 4. FIX REWARDS - Require authentication
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view rewards" ON public.rewards;
DROP POLICY IF EXISTS "Public can view rewards" ON public.rewards;
DROP POLICY IF EXISTS "Rewards are viewable by everyone" ON public.rewards;

CREATE POLICY "Authenticated users can view active rewards"
ON public.rewards FOR SELECT
TO authenticated
USING (is_active = true);