-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_profile_safe(UUID);

-- Fix 1: Create a secure profile view that respects privacy settings
CREATE OR REPLACE FUNCTION public.get_profile_safe(profile_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  age INTEGER,
  weight NUMERIC,
  height NUMERIC,
  target_weight NUMERIC,
  show_health_metrics_to_followers BOOLEAN,
  is_private BOOLEAN,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_id UUID := auth.uid();
  is_follower BOOLEAN := FALSE;
  profile_private BOOLEAN := FALSE;
  show_metrics BOOLEAN := FALSE;
BEGIN
  -- Check if viewer follows this profile
  SELECT EXISTS(
    SELECT 1 FROM follows 
    WHERE follower_id = viewer_id AND following_id = profile_user_id
  ) INTO is_follower;
  
  -- Get profile privacy settings
  SELECT p.is_private, COALESCE(p.show_health_metrics_to_followers, false)
  INTO profile_private, show_metrics
  FROM profiles p WHERE p.id = profile_user_id;
  
  -- Return profile with conditional health metrics
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.location,
    -- Only show health metrics if: owner, or follower with permission
    CASE WHEN viewer_id = profile_user_id OR (is_follower AND show_metrics) 
         THEN p.age ELSE NULL END,
    CASE WHEN viewer_id = profile_user_id OR (is_follower AND show_metrics) 
         THEN p.weight ELSE NULL END,
    CASE WHEN viewer_id = profile_user_id OR (is_follower AND show_metrics) 
         THEN p.height ELSE NULL END,
    CASE WHEN viewer_id = profile_user_id OR (is_follower AND show_metrics) 
         THEN p.target_weight ELSE NULL END,
    p.show_health_metrics_to_followers,
    p.is_private,
    p.created_at
  FROM profiles p
  WHERE p.id = profile_user_id;
END;
$$;

-- Fix 2: Create secure view for fitness_locations that hides submitter details
DROP VIEW IF EXISTS public.fitness_locations_public;
CREATE VIEW public.fitness_locations_public AS
SELECT 
  id,
  name,
  description,
  category,
  address,
  city,
  state,
  country,
  postal_code,
  latitude,
  longitude,
  phone,
  website_url,
  image_url,
  amenities,
  hours_of_operation,
  price_range,
  average_rating,
  total_reviews,
  is_verified,
  is_active,
  created_at,
  updated_at
  -- submitted_by intentionally excluded from public view
FROM fitness_locations
WHERE is_active = true;

-- Grant access to authenticated users
GRANT SELECT ON public.fitness_locations_public TO authenticated;
GRANT SELECT ON public.fitness_locations_public TO anon;

-- Add comments explaining the security purpose
COMMENT ON VIEW public.fitness_locations_public IS 'Public view of fitness locations that hides submitter identity for privacy';
COMMENT ON FUNCTION public.get_profile_safe IS 'Returns profile data with health metrics conditionally hidden based on privacy settings';