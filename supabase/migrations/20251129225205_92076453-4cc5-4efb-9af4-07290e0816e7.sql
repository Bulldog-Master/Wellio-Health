-- Fix Critical Issue 1: Profiles table - require authentication
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can view their own profile
  auth.uid() = id
  OR
  -- Users can view profiles of users they follow
  EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = auth.uid() AND following_id = id
  )
  OR
  -- Users can view non-private profiles
  (is_private = false OR is_private IS NULL)
);

-- Fix Critical Issue 2: Posts - require authentication
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.posts;

CREATE POLICY "Authenticated users can view posts"
ON public.posts
FOR SELECT
TO authenticated
USING (
  -- Users can view their own posts
  auth.uid() = user_id
  OR
  -- Users can view public posts
  (is_public = true AND (
    -- From users they follow
    EXISTS (
      SELECT 1 FROM public.follows
      WHERE follower_id = auth.uid() AND following_id = user_id
    )
    OR
    -- Or from non-private profiles
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_id AND (is_private = false OR is_private IS NULL)
    )
  ))
);

-- Fix Warning 1: Subscription features - require authentication
DROP POLICY IF EXISTS "Authenticated users can view subscription features" ON public.subscription_features;

CREATE POLICY "Authenticated users can view subscription features"
ON public.subscription_features
FOR SELECT
TO authenticated
USING (true);

-- Fix Warning 2: Trainer reviews - require authentication
DROP POLICY IF EXISTS "Authenticated users can view trainer reviews" ON public.trainer_reviews;

CREATE POLICY "Authenticated users can view trainer reviews"
ON public.trainer_reviews
FOR SELECT
TO authenticated
USING (true);

-- Fix Warning 3: Fundraisers - require authentication for viewing
DROP POLICY IF EXISTS "Authenticated users can view fundraisers" ON public.fundraisers;

CREATE POLICY "Authenticated users can view fundraisers"
ON public.fundraisers
FOR SELECT
TO authenticated
USING (
  status = 'active'
  OR auth.uid() = user_id
);

-- Fix Warning 4: Post hashtags - require authentication
DROP POLICY IF EXISTS "Authenticated users can view hashtags" ON public.post_hashtags;

CREATE POLICY "Authenticated users can view hashtags"
ON public.post_hashtags
FOR SELECT
TO authenticated
USING (true);