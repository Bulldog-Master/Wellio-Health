-- Add mentions table
CREATE TABLE public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID NOT NULL,
  mentioned_by_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT mention_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mentions"
ON public.mentions
FOR SELECT
USING (true);

CREATE POLICY "Users can create mentions"
ON public.mentions
FOR INSERT
WITH CHECK (auth.uid() = mentioned_by_user_id);

CREATE INDEX idx_mentions_mentioned_user_id ON public.mentions(mentioned_user_id);
CREATE INDEX idx_mentions_post_id ON public.mentions(post_id);
CREATE INDEX idx_mentions_comment_id ON public.mentions(comment_id);

-- Add reactions table
CREATE TABLE public.reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'fire', 'muscle', 'clap', 'target', 'heart')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions"
ON public.reactions
FOR SELECT
USING (true);

CREATE POLICY "Users can manage own reactions"
ON public.reactions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX idx_reactions_user_id ON public.reactions(user_id);

-- Add groups table (without policies that reference group_members)
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  creator_id UUID NOT NULL,
  is_private BOOLEAN DEFAULT false NOT NULL,
  members_count INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Add group members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Now add policies that reference group_members
CREATE POLICY "Anyone can view public groups"
ON public.groups
FOR SELECT
USING (is_private = false OR EXISTS (
  SELECT 1 FROM public.group_members 
  WHERE group_members.group_id = groups.id 
  AND group_members.user_id = auth.uid()
));

CREATE POLICY "Users can create groups"
ON public.groups
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group creators can update groups"
ON public.groups
FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Group members can view members"
ON public.group_members
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.group_members gm 
  WHERE gm.group_id = group_members.group_id 
  AND gm.user_id = auth.uid()
));

CREATE POLICY "Users can join groups"
ON public.group_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.group_members
FOR DELETE
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.groups 
  WHERE groups.id = group_members.group_id 
  AND groups.creator_id = auth.uid()
));

CREATE INDEX idx_groups_creator_id ON public.groups(creator_id);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);

-- Add group posts table
CREATE TABLE public.group_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(post_id)
);

ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view group posts"
ON public.group_posts
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.group_members 
  WHERE group_members.group_id = group_posts.group_id 
  AND group_members.user_id = auth.uid()
));

CREATE POLICY "Group members can create group posts"
ON public.group_posts
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.group_members 
  WHERE group_members.group_id = group_posts.group_id 
  AND group_members.user_id = auth.uid()
));

CREATE INDEX idx_group_posts_group_id ON public.group_posts(group_id);

-- Add privacy settings to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS allow_mentions BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_activity BOOLEAN DEFAULT true;

-- Add follow requests table
CREATE TABLE public.follow_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  requested_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(requester_id, requested_id)
);

ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follow requests"
ON public.follow_requests
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = requested_id);

CREATE POLICY "Users can create follow requests"
ON public.follow_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update requests for their account"
ON public.follow_requests
FOR UPDATE
USING (auth.uid() = requested_id);

CREATE INDEX idx_follow_requests_requester_id ON public.follow_requests(requester_id);
CREATE INDEX idx_follow_requests_requested_id ON public.follow_requests(requested_id);

-- Add close friends table
CREATE TABLE public.close_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  friend_user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, friend_user_id)
);

ALTER TABLE public.close_friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own close friends"
ON public.close_friends
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_close_friends_user_id ON public.close_friends(user_id);

-- Update stories table to support close friends
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS close_friends_only BOOLEAN DEFAULT false;

-- Update stories policy to respect close friends
DROP POLICY IF EXISTS "Users can view active stories" ON public.stories;

CREATE POLICY "Users can view active stories"
ON public.stories
FOR SELECT
USING (
  expires_at > now() 
  AND NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE blocked_users.user_id = stories.user_id 
    AND blocked_users.blocked_user_id = auth.uid()
  )
  AND (
    close_friends_only = false 
    OR EXISTS (
      SELECT 1 FROM public.close_friends 
      WHERE close_friends.user_id = stories.user_id 
      AND close_friends.friend_user_id = auth.uid()
    )
    OR stories.user_id = auth.uid()
  )
);

-- Function to update group members count
CREATE OR REPLACE FUNCTION public.update_group_members_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups
    SET members_count = members_count + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups
    SET members_count = members_count - 1
    WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_group_members_count_trigger
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.update_group_members_count();