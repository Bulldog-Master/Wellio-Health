-- Add health metrics visibility setting to profiles (default false for safety)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_health_metrics_to_followers boolean DEFAULT false;

-- Update the get_profile_safe function to respect the new privacy setting
CREATE OR REPLACE FUNCTION public.get_profile_safe(_profile_id uuid)
RETURNS TABLE(
  id uuid, 
  username text, 
  full_name text, 
  avatar_url text, 
  fitness_level text, 
  goal text, 
  is_private boolean, 
  followers_count integer, 
  following_count integer, 
  total_points integer, 
  current_streak integer, 
  longest_streak integer, 
  referral_code text, 
  onboarding_completed boolean, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  age integer, 
  gender text, 
  height numeric, 
  weight numeric, 
  target_weight numeric
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.fitness_level,
    p.goal,
    p.is_private,
    p.followers_count,
    p.following_count,
    p.total_points,
    p.current_streak,
    p.longest_streak,
    p.referral_code,
    p.onboarding_completed,
    p.created_at,
    p.updated_at,
    -- Sensitive health metrics: only show to owner OR if explicitly allowed to followers
    CASE 
      WHEN auth.uid() = p.id THEN p.age 
      WHEN p.show_health_metrics_to_followers = true AND public.is_following(auth.uid(), p.id) THEN p.age
      ELSE NULL 
    END as age,
    CASE 
      WHEN auth.uid() = p.id THEN p.gender 
      WHEN p.show_health_metrics_to_followers = true AND public.is_following(auth.uid(), p.id) THEN p.gender
      ELSE NULL 
    END as gender,
    CASE 
      WHEN auth.uid() = p.id THEN p.height 
      WHEN p.show_health_metrics_to_followers = true AND public.is_following(auth.uid(), p.id) THEN p.height
      ELSE NULL 
    END as height,
    CASE 
      WHEN auth.uid() = p.id THEN p.weight 
      WHEN p.show_health_metrics_to_followers = true AND public.is_following(auth.uid(), p.id) THEN p.weight
      ELSE NULL 
    END as weight,
    CASE 
      WHEN auth.uid() = p.id THEN p.target_weight 
      WHEN p.show_health_metrics_to_followers = true AND public.is_following(auth.uid(), p.id) THEN p.target_weight
      ELSE NULL 
    END as target_weight
  FROM public.profiles p
  WHERE p.id = _profile_id;
$$;

-- Add comment explaining the security feature
COMMENT ON COLUMN public.profiles.show_health_metrics_to_followers IS 'When false (default), health metrics (age, gender, height, weight, target_weight) are hidden from followers. Only the profile owner can see them.';