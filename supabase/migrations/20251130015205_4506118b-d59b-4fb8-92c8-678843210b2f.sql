-- Remove the view to address security definer warning
-- Apps should query only specific columns from profiles table instead
DROP VIEW IF EXISTS public.public_profiles;

-- Add comment to profiles table about safe column selection
COMMENT ON TABLE public.profiles IS 'When querying profiles for public display, select only: id, username, full_name, avatar_url, followers_count, following_count, total_points, current_streak, is_private. Never expose sensitive fields like age, weight, height, goal, or fitness_level to non-followers.';