
-- Fix security definer view issue by converting to regular view
-- Drop the security definer view and recreate as normal view
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  fitness_level,
  goal,
  is_private,
  followers_count,
  following_count,
  total_points,
  current_streak,
  longest_streak,
  created_at
FROM public.profiles;

-- Grant appropriate access to the view
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;
