-- Fix critical RLS policy issues - Part 2: Posts, Comments, and Social tables (corrected)

-- Posts table - Drop all existing policies and recreate
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view posts from followed users" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view public posts" ON public.posts;

CREATE POLICY "Users can view own posts"
  ON public.posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view posts from followed users"
  ON public.posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.follows
      WHERE follows.following_id = posts.user_id
      AND follows.follower_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view public posts"
  ON public.posts FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND is_public = true
  );

-- Comments table - Drop all existing policies and recreate
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can view comments on public posts" ON public.comments;
DROP POLICY IF EXISTS "Users can view own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can view comments on own posts" ON public.comments;
DROP POLICY IF EXISTS "Users can view comments on accessible posts" ON public.comments;

CREATE POLICY "Users can view own comments"
  ON public.comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view comments on accessible posts"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.id = comments.post_id
      AND (
        posts.user_id = auth.uid()
        OR posts.is_public = true
        OR EXISTS (
          SELECT 1 FROM public.follows
          WHERE follows.following_id = posts.user_id
          AND follows.follower_id = auth.uid()
        )
      )
    )
  );

-- Follows table - Drop all existing policies and recreate
DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
DROP POLICY IF EXISTS "Users can view own follows" ON public.follows;

CREATE POLICY "Users can view own follows"
  ON public.follows FOR SELECT
  USING (
    auth.uid() = follower_id
    OR auth.uid() = following_id
  );

-- Notifications table - Drop all existing policies and recreate
DROP POLICY IF EXISTS "Users can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Messages table - Drop all existing policies and recreate
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND (
        conversations.participant1_id = auth.uid()
        OR conversations.participant2_id = auth.uid()
      )
    )
  );

-- Conversations table - Drop all existing policies and recreate
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (
    auth.uid() = participant1_id
    OR auth.uid() = participant2_id
  );