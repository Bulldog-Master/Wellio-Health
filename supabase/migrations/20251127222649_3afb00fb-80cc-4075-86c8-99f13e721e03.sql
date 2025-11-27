-- Fix critical RLS policy issues - Part 1: Profiles table

-- Drop all existing SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles they follow" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles of authenticated users" ON public.profiles;

-- Create new restrictive policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view followed profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.follows
      WHERE follows.following_id = profiles.id
      AND follows.follower_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view public profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (is_private = false OR is_private IS NULL)
  );