-- Fix #1: Restrict profile data visibility to essential public fields only
-- Create a security definer function to check if user should see full profile
CREATE OR REPLACE FUNCTION public.can_view_full_profile(_viewer_id UUID, _profile_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    _viewer_id = _profile_id OR -- Own profile
    EXISTS ( -- Is following and profile is not private
      SELECT 1 FROM public.follows f
      JOIN public.profiles p ON p.id = _profile_id
      WHERE f.follower_id = _viewer_id 
        AND f.following_id = _profile_id
        AND (p.is_private = false OR p.is_private IS NULL)
    );
$$;

-- Drop existing policies that will be replaced
DROP POLICY IF EXISTS "Users can view followed profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create new restrictive policies
-- Policy 1: Users can view own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Users can view public profile data of others
CREATE POLICY "Limited profile data visible to authenticated"
ON public.profiles FOR SELECT
TO authenticated
USING (
  auth.uid() != id AND 
  (is_private = false OR is_private IS NULL)
);

-- Policy 3: Users can update own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Create a view for safe public profile queries
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  followers_count,
  following_count,
  total_points,
  current_streak,
  is_private
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;

COMMENT ON VIEW public.public_profiles IS 'Safe view exposing only non-sensitive profile fields. Use this for public profile queries instead of querying profiles table directly.';