-- Remove old public policies that bypass authentication

-- Profiles: Remove the "view all profiles" policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Posts: Remove the public "anyone can view" policy
DROP POLICY IF EXISTS "Anyone can view public posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view public posts" ON public.posts;

-- Challenges: Remove unauthenticated access
DROP POLICY IF EXISTS "Anyone can view active challenges" ON public.challenges;

CREATE POLICY "Authenticated users can view active challenges"
ON public.challenges
FOR SELECT
TO authenticated
USING (is_active = true);

-- Post hashtags: Remove unauthenticated access
DROP POLICY IF EXISTS "Anyone can view hashtags" ON public.post_hashtags;

-- Fundraisers: Remove the old public policy (keeping the authenticated one)
DROP POLICY IF EXISTS "Anyone can view active fundraisers" ON public.fundraisers;