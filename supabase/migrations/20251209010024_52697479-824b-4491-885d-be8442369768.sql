-- =============================================
-- FIX 1: Create SECURITY DEFINER helper functions to break RLS infinite recursion
-- =============================================

-- Helper function to check if user is a challenge participant (breaks recursion)
CREATE OR REPLACE FUNCTION public.is_challenge_participant(_challenge_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.challenge_participants
    WHERE challenge_id = _challenge_id
      AND user_id = _user_id
  )
$$;

-- Helper function to check if user is the challenge creator (breaks recursion)
CREATE OR REPLACE FUNCTION public.is_challenge_creator(_challenge_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.custom_challenges
    WHERE id = _challenge_id
      AND creator_id = _user_id
  )
$$;

-- Helper function to check if user is a group member (breaks recursion)
CREATE OR REPLACE FUNCTION public.is_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members
    WHERE group_id = _group_id
      AND user_id = _user_id
  )
$$;

-- =============================================
-- FIX 2: Update custom_challenges RLS policies to use helper functions
-- =============================================

-- Drop existing problematic policies on custom_challenges
DROP POLICY IF EXISTS "Users can view public challenges" ON public.custom_challenges;
DROP POLICY IF EXISTS "Users can view their own challenges" ON public.custom_challenges;
DROP POLICY IF EXISTS "Participants can view their challenges" ON public.custom_challenges;
DROP POLICY IF EXISTS "Users can create challenges" ON public.custom_challenges;
DROP POLICY IF EXISTS "Creators can update their challenges" ON public.custom_challenges;
DROP POLICY IF EXISTS "Creators can delete their challenges" ON public.custom_challenges;

-- Recreate policies using helper functions
CREATE POLICY "Users can view public challenges"
  ON public.custom_challenges FOR SELECT
  USING (is_public = true);

CREATE POLICY "Creators can view own challenges"
  ON public.custom_challenges FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Participants can view joined challenges"
  ON public.custom_challenges FOR SELECT
  USING (public.is_challenge_participant(id, auth.uid()));

CREATE POLICY "Users can create challenges"
  ON public.custom_challenges FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own challenges"
  ON public.custom_challenges FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own challenges"
  ON public.custom_challenges FOR DELETE
  USING (auth.uid() = creator_id);

-- =============================================
-- FIX 3: Update challenge_participants RLS policies to use helper functions
-- =============================================

-- Drop existing problematic policies on challenge_participants
DROP POLICY IF EXISTS "Users can view public challenge participants" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can view own participation" ON public.challenge_participants;
DROP POLICY IF EXISTS "Creators can view their challenge participants" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can join public challenges" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can join challenges" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can leave challenges" ON public.challenge_participants;

-- Recreate policies without circular references
CREATE POLICY "Users can view own participation"
  ON public.challenge_participants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Creators can view challenge participants"
  ON public.challenge_participants FOR SELECT
  USING (public.is_challenge_creator(challenge_id, auth.uid()));

CREATE POLICY "Public participants are visible"
  ON public.challenge_participants FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can join challenges"
  ON public.challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON public.challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges"
  ON public.challenge_participants FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- FIX 4: Update group_members RLS policies to use helper functions
-- =============================================

-- Drop existing problematic policies on group_members
DROP POLICY IF EXISTS "Members can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.group_members;
DROP POLICY IF EXISTS "Group creators can manage members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;

-- Helper function to check if user is the group creator
CREATE OR REPLACE FUNCTION public.is_group_creator(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.groups
    WHERE id = _group_id
      AND creator_id = _user_id
  )
$$;

-- Recreate policies without circular references
CREATE POLICY "Users can view own membership"
  ON public.group_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can view fellow members"
  ON public.group_members FOR SELECT
  USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Group creators can manage members"
  ON public.group_members FOR UPDATE
  USING (public.is_group_creator(group_id, auth.uid()));

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Group creators can remove members"
  ON public.group_members FOR DELETE
  USING (public.is_group_creator(group_id, auth.uid()));

-- =============================================
-- FIX 5: Fix rate_limit_tracking overly permissive policy
-- =============================================

-- Drop the overly permissive policy that exposes user activity patterns
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limit_tracking;

-- Create properly scoped policies
CREATE POLICY "Users can insert own rate limits"
  ON public.rate_limit_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits"
  ON public.rate_limit_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rate limits"
  ON public.rate_limit_tracking FOR DELETE
  USING (auth.uid() = user_id);