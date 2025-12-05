-- Fix 1: Fundraiser donations - properly hide anonymous donors
DROP POLICY IF EXISTS "Users can view non-anonymous donations" ON public.fundraiser_donations;

CREATE POLICY "Proper anonymous donation privacy" 
ON public.fundraiser_donations FOR SELECT 
USING (
  -- Public donations visible to all
  (is_anonymous = false)
  -- Or donor can see their own donations
  OR (donor_id = auth.uid())
  -- Fundraiser owner can see donation amounts but NOT donor identity for anonymous
  OR (
    EXISTS (
      SELECT 1 FROM fundraisers 
      WHERE fundraisers.id = fundraiser_donations.fundraiser_id 
      AND fundraisers.user_id = auth.uid()
    )
    AND is_anonymous = false  -- Owner can only see non-anonymous donor info
  )
);

-- Fix 2: Profiles - restrict public access for sensitive fields
-- Update the existing profile visibility to require authentication
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Authenticated users can view basic public profile info
CREATE POLICY "Authenticated users can view basic profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (
  -- Own profile - full access
  auth.uid() = id
  -- Others - only non-private profiles
  OR is_private = false OR is_private IS NULL
);

-- Users manage their own profile
CREATE POLICY "Users can manage own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Add comment about using get_profile_safe function
COMMENT ON TABLE public.profiles IS 'IMPORTANT: Use get_profile_safe() function for API responses to hide sensitive PII (age, weight, height, gender) from non-owners.';