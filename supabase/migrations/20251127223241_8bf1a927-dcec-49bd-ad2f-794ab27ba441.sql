-- Fix remaining critical RLS security issues - Part 3

-- Fix trainer_profiles - Restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view trainer profiles" ON public.trainer_profiles;

CREATE POLICY "Authenticated users can view trainer profiles"
  ON public.trainer_profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Fix user_badges - Restrict to owner and followers only
DROP POLICY IF EXISTS "Users can view all badges" ON public.user_badges;

CREATE POLICY "Users can view own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view badges of followed users"
  ON public.user_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.follows
      WHERE follows.following_id = user_badges.user_id
      AND follows.follower_id = auth.uid()
    )
  );

-- Fix content_likes - Restrict to content creator and liker
DROP POLICY IF EXISTS "Anyone can view likes" ON public.content_likes;

CREATE POLICY "Users can view own likes"
  ON public.content_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Content creators can view likes on their content"
  ON public.content_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_content
      WHERE creator_content.id = content_likes.content_id
      AND creator_content.creator_id = auth.uid()
    )
  );

-- Fix post_likes - Restrict to post author and their followers
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;

CREATE POLICY "Users can view own likes"
  ON public.post_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Post authors can view likes on their posts"
  ON public.post_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = post_likes.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Fix reactions - Restrict to content creator and reactor
DROP POLICY IF EXISTS "Users can view reactions" ON public.reactions;

CREATE POLICY "Users can view own reactions"
  ON public.reactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Post authors can view reactions on their posts"
  ON public.reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = reactions.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Fix mentions - Restrict to involved parties only
DROP POLICY IF EXISTS "Users can view mentions" ON public.mentions;

CREATE POLICY "Users can view mentions they're involved in"
  ON public.mentions FOR SELECT
  USING (
    auth.uid() = mentioned_user_id
    OR auth.uid() = mentioned_by_user_id
    OR EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = mentions.post_id
      AND posts.user_id = auth.uid()
    )
  );

-- Fix creator_subscriptions - Restrict to creator and subscriber
DROP POLICY IF EXISTS "Users can view all subscriptions" ON public.creator_subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON public.creator_subscriptions FOR SELECT
  USING (
    auth.uid() = subscriber_id
    OR auth.uid() = creator_id
  );

-- Fix leaderboard_entries - Restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard_entries;

CREATE POLICY "Authenticated users can view leaderboard"
  ON public.leaderboard_entries FOR SELECT
  USING (auth.uid() IS NOT NULL);